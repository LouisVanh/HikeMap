// File: src/app/api/upload/route.ts (must be this structure for app router)

import { NextRequest, NextResponse } from 'next/server';
import { r2 } from '@/utils/r2Client'; // Our R2 client from utils
import { PutObjectCommand } from '@aws-sdk/client-s3'; // AWS SDK command to upload objects

// Ensure this route runs in Node.js runtime (not Edge, which lacks full Buffer support)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Parse incoming multipart/form-data using built-in Web API
  const formData = await req.formData();

  // Get the file from the 'file' field
  const file = formData.get('file') as File;

  // Validate the file
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Convert file to Buffer so we can send it to R2 (Cloudflare)
  const arrayBuffer = await file.arrayBuffer(); // Raw binary
  const buffer = Buffer.from(arrayBuffer);      // Node.js Buffer version

  // Set a key (path) for the file inside the bucket (e.g., uploads/photo.png)
  const key = `uploads/${file.name}`;

  try {
    // Upload the file to R2 using AWS SDK
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!, // Bucket name from .env
        Key: key,                            // Unique key for this file
        Body: buffer,                        // Actual file data
        ContentType: file.type,              // Set the correct MIME type
      })
    );

    // Generate the public URL so frontend can use it
    const publicUrl = `https://${process.env.R2_BUCKET_NAME}.auto.r2.cloudflarestorage.com/${key}`;

    // Return success + URL to the frontend
    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error('Upload failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
