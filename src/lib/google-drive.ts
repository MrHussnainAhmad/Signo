import { google } from "googleapis";
import { config } from "@/lib/config";
import { Readable } from "stream";

// Initialize Google Drive API client (OAuth2 w/ refresh token)
function getGoogleDriveClient() {
  const rootFolderId = config.googleDrive.folderId;

  const clientId = config.googleDriveOAuth.clientId;
  const clientSecret = config.googleDriveOAuth.clientSecret;
  const redirectUri = config.googleDriveOAuth.redirectUri;
  const refreshToken = config.googleDriveOAuth.refreshToken;

  console.log("🔑 Google Drive OAuth Debug:");
  console.log("   Root Folder ID:", rootFolderId || "MISSING");
  console.log("   Client ID:", clientId ? clientId.slice(0, 12) + "..." : "MISSING");
  console.log("   Redirect URI:", redirectUri || "MISSING");
  console.log(
    "   Refresh Token:",
    refreshToken ? `Present (${refreshToken.length} chars)` : "MISSING"
  );

  if (!rootFolderId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured");
  }

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    throw new Error(
      "Google Drive OAuth credentials are missing. Check GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI, GOOGLE_OAUTH_REFRESH_TOKEN."
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export interface UploadedFile {
  driveFileId: string;
  webViewLink: string;
  downloadLink: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadFileParams {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  projectId: string;
}

// Convert Buffer to Readable Stream
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function extractGoogleErrorMessage(error: any): string {
  // googleapis often puts details here
  const apiMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.error_description ||
    error?.message;

  if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
    return apiMessage;
  }

  try {
    return JSON.stringify(error?.response?.data || error);
  } catch {
    return "Unknown Google API error";
  }
}

// Get resumable upload URL for client-side upload
export async function getResumableUploadUrl(
  params: Omit<UploadFileParams, "buffer">
): Promise<string> {
  const { fileName, mimeType, projectId } = params;

  console.log("🔗 Getting resumable upload URL:", fileName);

  let drive;
  let auth;
  try {
    const client = getGoogleDriveClient();
    drive = client;
    // We need the auth client to get headers
    // @ts-ignore - accessing auth from drive instance or recreating it
    auth = client.context._options.auth; 
  } catch (authError: any) {
    console.error("❌ Google Auth Error:", authError?.message);
    throw new Error(`Google Drive authentication failed: ${authError?.message}`);
  }

  try {
    const projectFolderId = await getOrCreateProjectFolder(drive, projectId);
    
    // Get auth headers
    const headers = await auth.getRequestHeaders();
    
    // Initiate resumable upload
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": mimeType,
          "X-Upload-Content-Length": "", // Unknown length at start? Or client sends it? Better to leave empty or let client handle if needed.
        },
        body: JSON.stringify({
          name: fileName,
          mimeType,
          parents: [projectFolderId],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initiate resumable upload: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const uploadUrl = response.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("No upload URL returned from Google Drive");
    }

    console.log("✅ Resumable upload URL generated");
    return uploadUrl;
  } catch (error: any) {
    console.error("❌ Error getting upload URL:", error);
    throw new Error(`Failed to get upload URL: ${error.message}`);
  }
}

// Upload file to Google Drive
export async function uploadToGoogleDrive(params: UploadFileParams): Promise<UploadedFile> {
  const { fileName, mimeType, buffer, projectId } = params;

  console.log("📤 Starting Google Drive upload:", fileName);

  let drive;
  try {
    drive = getGoogleDriveClient();
  } catch (authError: any) {
    console.error("❌ Google Auth Error:", authError?.message);
    throw new Error(`Google Drive authentication failed: ${authError?.message}`);
  }

  try {
    // Create a subfolder for the project if it doesn't exist
    console.log("📁 Getting/creating project folder...");
    const projectFolderId = await getOrCreateProjectFolder(drive, projectId);
    console.log("📁 Project folder ID:", projectFolderId);

    // Upload the file
    console.log("⬆️ Uploading file to Google Drive...");
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [projectFolderId],
      },
      media: {
        mimeType,
        body: bufferToStream(buffer),
      },
      fields: "id, webViewLink, webContentLink, name, mimeType, size",
    });

    const file = response.data;
    console.log("✅ File uploaded, ID:", file.id);

    if (!file.id) {
      throw new Error("Failed to upload file to Google Drive - no file ID returned");
    }

    // Make the file viewable by anyone with the link
    console.log("🔓 Setting file permissions...");
    await drive.permissions.create({
      fileId: file.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get updated file info with sharing links
    const updatedFile = await drive.files.get({
      fileId: file.id,
      fields: "id, webViewLink, webContentLink, name, mimeType, size",
    });

    console.log("✅ Upload complete:", updatedFile.data.webViewLink);

    return {
      driveFileId: updatedFile.data.id!,
      webViewLink: updatedFile.data.webViewLink || "",
      downloadLink: updatedFile.data.webContentLink || "",
      fileName: updatedFile.data.name || fileName,
      mimeType: updatedFile.data.mimeType || mimeType,
      fileSize: parseInt(updatedFile.data.size || "0", 10),
    };
  } catch (error: any) {
    const msg = extractGoogleErrorMessage(error);
    console.error("❌ Google Drive upload error:", msg);
    console.error("❌ Google Drive upload error code:", error?.code);
    console.error("❌ Google Drive upload error response data:", error?.response?.data);

    // Keep errors truthful (no more “share with service account”)
    if (error?.code === 401 || msg.includes("invalid_grant")) {
      throw new Error(
        "Google Drive OAuth failed (invalid/expired grant). Regenerate GOOGLE_OAUTH_REFRESH_TOKEN."
      );
    }
    if (error?.code === 403) {
      throw new Error(`Google Drive request forbidden: ${msg}`);
    }
    if (error?.code === 404) {
      throw new Error(
        "Google Drive folder/file not found. Verify GOOGLE_DRIVE_ROOT_FOLDER_ID is a real folder ID in your Drive."
      );
    }

    throw new Error(`Google Drive upload failed: ${msg}`);
  }
}

// Verify file belongs to project
export async function verifyFileInProject(driveFileId: string, projectId: string): Promise<boolean> {
  const drive = getGoogleDriveClient();
  try {
    const projectFolderId = await getOrCreateProjectFolder(drive, projectId);
    const file = await drive.files.get({
      fileId: driveFileId,
      fields: "parents",
    });
    
    return file.data.parents?.includes(projectFolderId) || false;
  } catch (error) {
    console.error("Verification failed:", error);
    return false;
  }
}

// Get or create a folder for the project
async function getOrCreateProjectFolder(
  drive: ReturnType<typeof google.drive>,
  projectId: string
): Promise<string> {
  const folderName = `project_${projectId}`;
  const rootFolderId = config.googleDrive.folderId;

  if (!rootFolderId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured");
  }

  // Escape single quotes for Drive query strings
  const safeFolderName = folderName.replace(/'/g, "\\'");

  try {
    // Check if folder already exists
    const existingFolder = await drive.files.list({
      q: `name='${safeFolderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id)",
    });

    if (existingFolder.data.files && existingFolder.data.files.length > 0) {
      return existingFolder.data.files[0].id!;
    }

    // Create new folder
    console.log("📁 Creating new project folder:", folderName);
    const newFolder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [rootFolderId],
      },
      fields: "id",
    });

    if (!newFolder.data.id) {
      throw new Error("Failed to create project folder");
    }

    return newFolder.data.id;
  } catch (error: any) {
    const msg = extractGoogleErrorMessage(error);
    console.error("❌ Error with project folder:", msg);
    console.error("❌ Folder error code:", error?.code);
    console.error("❌ Folder error response data:", error?.response?.data);
    throw new Error(`Project folder error: ${msg}`);
  }
}

// Delete file from Google Drive
export async function deleteFromGoogleDrive(driveFileId: string): Promise<boolean> {
  const drive = getGoogleDriveClient();

  try {
    await drive.files.delete({ fileId: driveFileId });
    return true;
  } catch (error: any) {
    console.error("Google Drive delete error:", extractGoogleErrorMessage(error));
    return false;
  }
}

// Get file metadata
export async function getFileMetadata(driveFileId: string) {
  const drive = getGoogleDriveClient();

  try {
    const response = await drive.files.get({
      fileId: driveFileId,
      fields: "id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime",
    });

    return response.data;
  } catch (error: any) {
    console.error("Google Drive get metadata error:", extractGoogleErrorMessage(error));
    return null;
  }
}

// Generate a preview/thumbnail URL for supported file types
export function getPreviewUrl(driveFileId: string, mimeType: string): string | null {
  const previewableTypes = ["image/", "application/pdf", "video/", "application/vnd.google-apps"];
  const isPreviewable = previewableTypes.some((type) => mimeType.startsWith(type));
  return isPreviewable ? `https://drive.google.com/file/d/${driveFileId}/preview` : null;
}

// Get thumbnail URL for images
export function getThumbnailUrl(driveFileId: string): string {
  return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w400`;
}

// Validate file type
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "text/plain",
    "text/csv",
    "application/json",
  ];

  return allowedTypes.includes(mimeType);
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function isFileSizeAllowed(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}