import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { AppError } from './error.middleware';
import cloudinaryService from '../services/cloudinary.service';

/**
 * File Upload Middleware
 *
 * Why it exists: Handles file uploads for assignment submissions with
 * Cloudinary integration for secure, scalable file storage.
 *
 * Security considerations:
 * - File type validation
 * - File size limits
 * - Cloudinary secure upload
 * - No local file storage
 *
 * Scalability concerns:
 * - Cloud-based storage reduces server load
 * - CDN delivery improves performance
 * - Automatic file optimization
 */

// Use memory storage for multer (files will be buffered in memory before uploading to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Get allowed file types from config
  const allowedTypes = config.ALLOWED_FILE_TYPES.split(',').map((type: string) => type.trim().toLowerCase());
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);

  if (!allowedTypes.includes(fileExtension)) {
    cb(new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400));
    return;
  }

  cb(null, true);
};

// Configure multer upload middleware
export const uploadSubmissionFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // From config (10MB default)
    files: 1, // Only one file per submission
  },
});

// Middleware to handle both text and file submissions
export const handleSubmissionUpload = (req: Request, res: Response, next: NextFunction) => {
  // Check assignment type to determine upload handling
  const assignmentId = req.params.assignmentId || req.body.assignmentId;

  if (!assignmentId) {
    return next(new AppError('Assignment ID is required', 400));
  }

  // Use multer to handle the file upload
  uploadSubmissionFile.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`File too large. Maximum size: ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`, 400));
      }
      return next(new AppError('File upload error', 400));
    } else if (err) {
      return next(err);
    }

    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        const cloudinaryResult = await cloudinaryService.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        // Attach Cloudinary result to the request for the controller to use
        (req as any).cloudinaryFile = {
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          fileName: req.file.originalname,
          fileSize: req.file.size,
        };

      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        return next(new AppError('Failed to upload file to cloud storage', 500));
      }
    }

    next();
  });
};
