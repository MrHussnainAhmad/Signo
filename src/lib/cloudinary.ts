import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from '@/lib/config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

// Upload avatar or logo image
export async function uploadImage(
  buffer: Buffer,
  options: {
    folder: 'avatars' | 'logos';
    publicId?: string;
    transformation?: {
      width?: number;
      height?: number;
      crop?: string;
    };
  }
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: `sendwork/${options.folder}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        {
          width: options.transformation?.width || 400,
          height: options.transformation?.height || 400,
          crop: options.transformation?.crop || 'fill',
          gravity: 'face',
          quality: 'auto:good',
          fetch_format: 'auto',
        },
      ],
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload image'));
          return;
        }

        if (!result) {
          reject(new Error('No result from Cloudinary'));
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

// Upload avatar
export async function uploadAvatar(
  buffer: Buffer,
  userId: string
): Promise<CloudinaryUploadResult> {
  return uploadImage(buffer, {
    folder: 'avatars',
    publicId: `avatar_${userId}`,
    transformation: {
      width: 200,
      height: 200,
      crop: 'fill',
    },
  });
}

// Upload workspace logo
export async function uploadLogo(
  buffer: Buffer,
  workspaceId: string
): Promise<CloudinaryUploadResult> {
  return uploadImage(buffer, {
    folder: 'logos',
    publicId: `logo_${workspaceId}`,
    transformation: {
      width: 400,
      height: 400,
      crop: 'fit',
    },
  });
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

// Generate optimized URL with transformations
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width || 400,
        height: options?.height || 400,
        crop: options?.crop || 'fill',
        quality: options?.quality || 'auto:good',
        fetch_format: 'auto',
      },
    ],
    secure: true,
  });
}

// Validate image file
export function isValidImageFile(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validTypes.includes(mimeType);
}

// Max image size for avatars/logos (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function isImageSizeAllowed(size: number): boolean {
  return size <= MAX_IMAGE_SIZE;
}