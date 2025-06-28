'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // make sure this exists

export default function ImageUploader() {
  const [url, setUrl] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    // ✅ Step 1: Get the user’s session token
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      alert('Not authenticated, please login again');
      return;
    }

    const token = session.access_token;

    // ✅ Step 2: Upload to the API with token & type
    const res = await fetch('/api/upload?type=profile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Upload error:', data.error);
      return;
    }

    setUrl(data.url); // ✅ Set the returned R2 public URL
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {url && <img src={url} alt="Uploaded preview" width={300} />}
    </div>
  );
}
