import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/utils/r2Client';
import { createClient } from '@/utils/supabase/client';
import { hasCompletedProfile } from '@/utils/check_profile_completion';
import sharp from 'sharp';
//import useRequireCompleteProfile from '@/hooks/useRequireCompleteProfile'; Will never work in server
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

  const supabase = createClient();
  
  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
  }

  // Check if the user has completed their profile
  if (['hike-small', 'hike-large', 'restaurant-small', 'restaurant-large'].includes(validType)) {
    const profileOk = await hasCompletedProfile();
    if (!profileOk) {
      return NextResponse.json({ error: 'Please complete your profile first' }, { status: 403 });
    }
  }
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // Convert uploaded file to Buffer safely
  const arrayBuffer : ArrayBuffer = await file.arrayBuffer();
  const buffer : Buffer<ArrayBufferLike> = Buffer.from(new Uint8Array(arrayBuffer));

  // Don't over-declare type, this avoids conflict
  let resizedBuffer = buffer;

  let contentType = file.type;

  try {
    if (['profile'].includes(validType)) {
      resizedBuffer = await sharp(buffer)
        .resize({ width: 512 })
        .jpeg({ quality: 80 })
        .toBuffer();
      contentType = 'image/jpeg';
    }
    else if (['hike-small', 'restaurant-small'].includes(validType)) {
      resizedBuffer = await sharp(buffer)
        .resize({ width: 64 })
        .jpeg({ quality: 20 })
        .toBuffer();
      contentType = 'image/jpeg';
    }
  } catch {
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
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}
