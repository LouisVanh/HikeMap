'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';
import '@/styles/completeProfile.css'; // <-- import your CSS
import ImageUploader from '@/components/image_uploader';

export default function CompleteProfilePage() {
  const [name, setName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [preview, setPreview] = useState('');
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

  // Submit updated profile to Supabase
  const handleSubmit = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Failed to fetch user:", userError);
        alert("Unable to fetch user info.");
        return;
      }

      const user = userData.user;
      if (!user) {
        console.warn("No user found in session.");
        alert("You're not logged in.");
        return;
      }

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
      console.log("Profile updated successfully.");
    } catch (err) {
      console.error("Unexpected error during profile update:", err);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <main className="complete-profile-page">
      <div className="profile-card">
        <h1 className="profile-title">Complete your profile</h1>

        <ImageUploader
          type="profile"
          initialUrl={preview || DEFAULT_PROFILE_PICTURE_URL}
          onUpload={(url) => {
            setProfilePicUrl(url);
            setPreview(url);
          }}
          className="profile-picture-container"
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
