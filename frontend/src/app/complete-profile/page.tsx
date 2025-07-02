'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';
import '@/styles/completeProfile.css';
import ImageUploader from '@/components/image_uploader';

export default function CompleteProfilePage() {
  const [name, setName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [loadingUser, setLoadingUser] = useState(true); // 🔁 Track session readiness
  const router = useRouter();

  // Load user data from Supabase
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('[CompleteProfile] Error fetching user:', error);
          console.log("[CompleteProfile] Error fetching user:", error)
        }

        if (user) {
          const googleName = user.user_metadata.full_name ?? '';
          const googleAvatar = user.user_metadata.avatar_url ?? DEFAULT_PROFILE_PICTURE_URL;
          console.log("[CompleteProfile] User fetched from google")
          console.log("[CompleteProfile] Name:", googleName)
          console.log("[CompleteProfile] Avatar:", googleAvatar)
          console.log("[CompleteProfile] Metadata:", user.user_metadata)

          setName(googleName);
          setProfilePicUrl(googleAvatar);
          setPreview(googleAvatar);
        } else {
          console.warn('[CompleteProfile] No error, but also no user found');
        }
      } catch (err) {
        console.error('[CompleteProfile] Unexpected error loading user:', err);
      } finally {
        setLoadingUser(false); // Whether we got a user or not, we’re done loading
        console.log("[CompleteProfile] Done loading user")
      }
    };

    loadUser();
  }, []);

  // Debugging: track session changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Event:', event, session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Submit updated profile to Supabase
  const handleSubmit = async () => {
    try {
      console.log("[CompleteProfile] I clicked submit!")
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('[CompleteProfile] Failed to fetch user:', userError);
        alert("Unable to fetch user info.");
        return;
      }
      console.log("[CompleteProfile] No user error, continuing.")
      const user = userData.user;
      if (!user) {
        console.warn('[CompleteProfile] No user found in session.');
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

      console.log("[CompleteProfile] Profile updated successfully.");
      router.push('/map');
    } catch (err) {
      console.error("[CompleteProfile] Unexpected error during profile update:", err);
      alert("An unexpected error occurred.");
    }
  };

  if (loadingUser) {
    return (
      <main className="complete-profile-page">
        <div className="profile-card">
          <h1 className="profile-title">Loading profile...</h1>
        </div>
      </main>
    );
  }

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
          imageWidth={80}
          imageHeight={80}
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

        <button
          className="confirm-button"
          onClick={handleSubmit}
          disabled={loadingUser}
        >
          Save and continue
        </button>
      </div>
    </main>
  );
}
