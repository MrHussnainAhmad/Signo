import { google } from 'googleapis';
import { config } from '@/lib/config';
import { Readable } from 'stream';

// Initialize Google Drive API client
function getGoogleDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.googleDrive.serviceAccountEmail,
      private_key: config.googleDrive.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
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

// Upload file to Google Drive
export async function uploadToGoogleDrive(params: UploadFileParams): Promise<UploadedFile> {
  const { fileName, mimeType, buffer, projectId } = params;
  const drive = getGoogleDriveClient();

  try {
    // Create a subfolder for the project if it doesn't exist
    const projectFolderId = await getOrCreateProjectFolder(drive, projectId);

    // Upload the file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: [projectFolderId],
      },
      media: {
        mimeType: mimeType,
        body: bufferToStream(buffer),
      },
      fields: 'id, webViewLink, webContentLink, name, mimeType, size',
    });

    const file = response.data;

    if (!file.id) {
      throw new Error('Failed to upload file to Google Drive');
    }

    // Make the file viewable by anyone with the link
    await drive.permissions.create({
      fileId: file.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get updated file info with sharing links
    const updatedFile = await drive.files.get({
      fileId: file.id,
      fields: 'id, webViewLink, webContentLink, name, mimeType, size',
    });

    return {
      driveFileId: updatedFile.data.id!,
      webViewLink: updatedFile.data.webViewLink || '',
      downloadLink: updatedFile.data.webContentLink || '',
      fileName: updatedFile.data.name || fileName,
      mimeType: updatedFile.data.mimeType || mimeType,
      fileSize: parseInt(updatedFile.data.size || '0', 10),
    };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
}

// Get or create a folder for the project
async function getOrCreateProjectFolder(
  drive: ReturnType<typeof google.drive>,
  projectId: string
): Promise<string> {
  const folderName = `project_${projectId}`;

  try {
    // Check if folder already exists
    const existingFolder = await drive.files.list({
      q: `name='${folderName}' and '${config.googleDrive.folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    });

    if (existingFolder.data.files && existingFolder.data.files.length > 0) {
      return existingFolder.data.files[0].id!;
    }

    // Create new folder
    const newFolder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [config.googleDrive.folderId],
      },
      fields: 'id',
    });

    return newFolder.data.id!;
  } catch (error) {
    console.error('Error creating project folder:', error);
    // Fall back to root folder if subfolder creation fails
    return config.googleDrive.folderId;
  }
}

// Delete file from Google Drive
export async function deleteFromGoogleDrive(driveFileId: string): Promise<boolean> {
  const drive = getGoogleDriveClient();

  try {
    await drive.files.delete({
      fileId: driveFileId,
    });
    return true;
  } catch (error) {
    console.error('Google Drive delete error:', error);
    return false;
  }
}

// Get file metadata
export async function getFileMetadata(driveFileId: string) {
  const drive = getGoogleDriveClient();

  try {
    const response = await drive.files.get({
      fileId: driveFileId,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime',
    });

    return response.data;
  } catch (error) {
    console.error('Google Drive get metadata error:', error);
    return null;
  }
}

// Generate a preview/thumbnail URL for supported file types
export function getPreviewUrl(driveFileId: string, mimeType: string): string | null {
  // Google Drive preview URL format
  const previewableTypes = [
    'image/',
    'application/pdf',
    'video/',
    'application/vnd.google-apps',
  ];

  const isPreviewable = previewableTypes.some((type) => mimeType.startsWith(type));

  if (isPreviewable) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }

  return null;
}

// Get thumbnail URL for images
export function getThumbnailUrl(driveFileId: string): string {
  return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w400`;
}

// Validate file type
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Design files
    'application/zip',
    'application/x-zip-compressed',
    // Video
    'video/mp4',
    'video/quicktime',
    'video/webm',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    // Text
    'text/plain',
    'text/csv',
    'application/json',
  ];

  return allowedTypes.includes(mimeType);
}

// Max file size (100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function isFileSizeAllowed(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}