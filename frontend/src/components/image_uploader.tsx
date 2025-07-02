'use client';

import { supabase } from '@/utils/supabaseClient';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
type ImageType = 'profile' | 'hike-large' | 'hike-small' | 'restaurant-large' | 'restaurant-small';

interface Props {
  type: ImageType;
  onUpload?: (url: string) => void;
  initialUrl?: string; // ← optional initial value (e.g. default Google pic)
  className?: string;  // ← optional styling class
  imageWidth: number;
  imageHeight: number;
}

export default function ImageUploader({ type, onUpload, initialUrl = '', className, imageWidth, imageHeight }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [localPreview, setLocalPreview] = useState<string | null>(null); // ← local preview during upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow parent to provide an initial image (e.g., Google profile)
  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  // 🧹 Clean up local preview blob URL when component unmounts or new file is picked
  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🖼️ Show local preview immediately
    const tempUrl = URL.createObjectURL(file);
    setLocalPreview(tempUrl);

    const form = new FormData();
    form.append('file', file);

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Error while uploading image (getting session): ', error.message);
      return;
    }

    const token = session?.access_token;
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    const res = await fetch(`/api/upload?type=${type}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();
    if (data?.url) {
      setUrl(data.url);
      onUpload?.(data.url);

      // ✅ Replace local preview with final Cloudflare R2 URL and clean up
      URL.revokeObjectURL(tempUrl);
      setLocalPreview(null);
    } else {
      alert('Upload failed');
    }
  };

  return (
    <div className={className} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <Image
        src={localPreview || url || '/default.jpg'} // ← show local preview instantly if available
        alt="Upload preview"
        width={imageWidth}
        height={imageHeight}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}
