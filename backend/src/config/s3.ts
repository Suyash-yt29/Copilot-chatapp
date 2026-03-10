import dotenv from 'dotenv';

dotenv.config();

export const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
  bucket: process.env.S3_BUCKET || 'chatapp',
  region: process.env.S3_REGION || 'us-east-1',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
};
