import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/utils/r2Client';
import { supabase } from '@/utils/supabaseClient';

export const runtime = 'nodejs';

const SIZE_LIMITS = {
  'profile': 128 * 1024,
  'hike-small': 128 * 1024,
  'hike-large': 4 * 1024 * 1024,
  'restaurant-small': 128 * 1024,
  'restaurant-large': 4 * 1024 * 1024,
};

export async function POST(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');

  if (!type || !(type in SIZE_LIMITS)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const validType = type as keyof typeof SIZE_LIMITS;

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid auth' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // Convert uploaded file to Buffer safely
  const buffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));


  // Don't over-declare type, this avoids conflict
  let resizedBuffer = buffer;

  // REQUIRED FOR TYPESCRIPT OR IT WILL COMPLETELY BREAK.
  const sharp = require('sharp');
  let contentType = file.type;

  try {
    if (['profile', 'hike-small', 'restaurant-small'].includes(validType)) {
      resizedBuffer = await sharp(buffer)
        .resize({ width: 512 })
        .jpeg({ quality: 80 })
        .toBuffer();
      contentType = 'image/jpeg';
    }
  } catch (err) {
    return NextResponse.json({ error: 'Resize failed' }, { status: 500 });
  }

  if (resizedBuffer.length > SIZE_LIMITS[validType]) {
    return NextResponse.json({ error: 'Image too large after resizing' }, { status: 400 });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
  const key = `uploads/${user.id}/${validType}/${filename}`;

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: resizedBuffer,
        ContentType: contentType,
      })
    );

    const publicUrl = `https://cdn.hikemap.app/${key}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
