'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';
import '@/styles/completeProfile.css'; // <-- import your CSS

export default function CompleteProfilePage() {
  const [name, setName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Load user data from Supabase
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const googleName = user.user_metadata.full_name ?? '';
        const googleAvatar = user.user_metadata.avatar_url ?? DEFAULT_PROFILE_PICTURE_URL;
        setName(googleName);
        setProfilePicUrl(googleAvatar);
        setPreview(googleAvatar);
      }
    };

    loadUser();
  }, []);

  // Upload image to R2
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    setProfilePicUrl(data.url);
    setPreview(data.url);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Submit updated profile to Supabase
  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { id } = user;
    const finalName = name.trim() || user.user_metadata.full_name;
    const finalPic = profilePicUrl || DEFAULT_PROFILE_PICTURE_URL;

    const { error } = await supabase.from('Users').upsert([
      {
        id,
        name: finalName,
        profile_pic_url: finalPic,
      },
    ]);

    if (error) {
      console.error('[CompleteProfile] Failed to upsert user:', error);
      alert('Failed to save profile.');
      return;
    }

    router.push('/map');
  };

  return (
    <main className="complete-profile-page">
      <div className="profile-card">
        <h1 className="profile-title">Complete your profile</h1>

        <div className="profile-picture-container" onClick={handleImageClick}>
          <img
            src={preview || DEFAULT_PROFILE_PICTURE_URL}
            alt="Profile"
          />
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <p className="upload-instruction">Click the image to upload a new one</p>

        <div className="input-group">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Google name"
          />
        </div>

        <button className="confirm-button" onClick={handleSubmit}>
          Save and continue
        </button>
      </div>
    </main>
  );
}
