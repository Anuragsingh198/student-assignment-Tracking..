import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config';
import { UploadApiResponse } from 'cloudinary';

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
    });

    console.log('☁️ Cloudinary service configured successfully');
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType?: string
  ): Promise<UploadApiResponse> {
    try {
      const publicId = `submissions/${Date.now()}-${Math.round(Math.random() * 1E9)}`;

      const uploadOptions: any = {
        public_id: publicId,
        resource_type: 'auto',
        folder: 'smart-assignment-system/submissions',
        allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'zip'],
        max_bytes: config.MAX_FILE_SIZE,
      };

      if (mimeType) {
        uploadOptions.resource_type = this.getResourceTypeFromMimeType(mimeType);
      }

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        ).end(fileBuffer);
      });

      console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
      return result;

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      console.error('❌ Cloudinary delete error:', error);
      throw new Error('Failed to delete file from Cloudinary');
    }
  }

  private getResourceTypeFromMimeType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else {
      return 'raw';
    }
  }

  extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
      return match && match[1] ? match[1] : null;
    } catch {
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await cloudinary.api.ping();
      return true;
    } catch (error) {
      console.error('Cloudinary connection test failed:', error);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
