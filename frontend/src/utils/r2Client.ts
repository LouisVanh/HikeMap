// File: src/utils/r2Client.ts
// Initializes an AWS SDK S3 client for Cloudflare R2

import { S3Client } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto', // Always use 'auto' for R2
  endpoint: process.env.R2_ENDPOINT!, // Your R2 endpoint
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
