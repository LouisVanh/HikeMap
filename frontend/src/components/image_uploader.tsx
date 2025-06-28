// File: src/components/ImageUploader.tsx
'use client'; // This must be a client component because it uses hooks and DOM APIs

import { useState } from 'react';

export default function ImageUploader() {
  const [url, setUrl] = useState(''); // Store uploaded image URL

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Grab the selected file
    if (!file) return;

    const form = new FormData(); // Create a form to send to the API
    form.append('file', file);   // Append the file under the 'file' field
    
    // Call the API route (/api/upload) with the file
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json(); // Parse the response
    setUrl(data.url);              // Show uploaded image on success
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {url && (
        <img src={url} alt="Uploaded preview" width={300} />
      )}
    </div>
  );
}
