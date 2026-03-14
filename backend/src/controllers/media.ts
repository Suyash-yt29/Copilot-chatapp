import { Request, Response } from 'express';
import { uploadFileToS3 } from '../services/s3.js';
import { asyncHandler, AppError } from '../middleware/error.js';

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }
  const { buffer, originalname, mimetype } = req.file;
  const url = await uploadFileToS3(buffer, originalname, mimetype);
  res.status(201).json({ url });
});
