import { google } from 'googleapis';
import { config } from '@/lib/config';
import { Readable } from 'stream';

// Initialize Google Drive API client
function getGoogleDriveClient() {
  const clientEmail = config.googleDrive.serviceAccountEmail;
  const privateKey = config.googleDrive.privateKey;
  
  console.log('🔑 Google Drive Auth Debug:');
  console.log('   Client Email:', clientEmail ? clientEmail.substring(0, 20) + '...' : 'MISSING');
  console.log('   Private Key:', privateKey ? `Present (${privateKey.length} chars)` : 'MISSING');
  console.log('   Folder ID:', config.googleDrive.folderId || 'MISSING');
  
  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials are missing. Check GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY env vars.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
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
  
  console.log('📤 Starting Google Drive upload:', fileName);
  
  let drive;
  try {
    drive = getGoogleDriveClient();
  } catch (authError: any) {
    console.error('❌ Google Auth Error:', authError.message);
    throw new Error(`Google Drive authentication failed: ${authError.message}`);
  }

  try {
    // Create a subfolder for the project if it doesn't exist
    console.log('📁 Getting/creating project folder...');
    const projectFolderId = await getOrCreateProjectFolder(drive, projectId);
    console.log('📁 Project folder ID:', projectFolderId);

    // Upload the file
    console.log('⬆️ Uploading file to Google Drive...');
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
    console.log('✅ File uploaded, ID:', file.id);

    if (!file.id) {
      throw new Error('Failed to upload file to Google Drive - no file ID returned');
    }

    // Make the file viewable by anyone with the link
    console.log('🔓 Setting file permissions...');
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

    console.log('✅ Upload complete:', updatedFile.data.webViewLink);

    return {
      driveFileId: updatedFile.data.id!,
      webViewLink: updatedFile.data.webViewLink || '',
      downloadLink: updatedFile.data.webContentLink || '',
      fileName: updatedFile.data.name || fileName,
      mimeType: updatedFile.data.mimeType || mimeType,
      fileSize: parseInt(updatedFile.data.size || '0', 10),
    };
  } catch (error: any) {
    console.error('❌ Google Drive upload error:', error.message);
    
    // Parse Google API error
    if (error.code === 403) {
      throw new Error('Google Drive permission denied. Make sure the folder is shared with the service account.');
    }
    if (error.code === 404) {
      throw new Error('Google Drive folder not found. Check GOOGLE_DRIVE_ROOT_FOLDER_ID.');
    }
    if (error.message?.includes('invalid_grant')) {
      throw new Error('Google Drive authentication failed. Check your service account credentials.');
    }
    
    throw new Error(`Google Drive upload failed: ${error.message}`);
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
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not configured');
  }

  try {
    // Check if folder already exists
    const existingFolder = await drive.files.list({
      q: `name='${folderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)',
    });

    if (existingFolder.data.files && existingFolder.data.files.length > 0) {
      return existingFolder.data.files[0].id!;
    }

    // Create new folder
    console.log('📁 Creating new project folder:', folderName);
    const newFolder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      },
      fields: 'id',
    });

    if (!newFolder.data.id) {
      throw new Error('Failed to create project folder');
    }

    return newFolder.data.id;
  } catch (error: any) {
    console.error('❌ Error with project folder:', error.message);
    
    if (error.code === 404) {
      throw new Error(`Root folder not found. Share the folder with your service account email.`);
    }
    
    throw error;
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
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-zip-compressed',
    'video/mp4', 'video/quicktime', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'text/plain', 'text/csv', 'application/json',
  ];

  return allowedTypes.includes(mimeType);
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function isFileSizeAllowed(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}