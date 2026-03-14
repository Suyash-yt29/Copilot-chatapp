import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Config } from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new S3Client({
  endpoint: s3Config.endpoint,
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKey,
    secretAccessKey: s3Config.secretKey,
  },
  forcePathStyle: true,
});

export async function uploadFileToS3(fileBuffer: Buffer, originalName: string, mimetype: string): Promise<string> {
  const ext = path.extname(originalName);
  const key = `media/${uuidv4()}${ext}`;
  const command = new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read',
  });
  await s3.send(command);
  return `${s3Config.endpoint.replace(/\/$/, '')}/${s3Config.bucket}/${key}`;
}
