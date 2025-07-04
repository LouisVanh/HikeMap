'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
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
    const supabase = createClient();
    console.log("[CompleteProfile] Supabase client created.")

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[CompleteProfile] OnAuthStateChange fired.", event, session)

        if (session) {
          console.log("[CompleteProfile] Session found: ", session)
          if (event === 'SIGNED_IN') {
            console.log("[CompleteProfile] Sign in detected.")
            try {
              const { data: { user }, error } = await supabase.auth.getUser();

              if (error || !user) {
                console.warn('[CompleteProfile] Error getting user after auth change', error);
                router.push('/');
                return;
              }

              const googleName = user.user_metadata.full_name ?? '';
              const googleAvatar = user.user_metadata.avatar_url ?? DEFAULT_PROFILE_PICTURE_URL;

              console.log("[CompleteProfile] User fetched from google");
              setName(googleName);
              setProfilePicUrl(googleAvatar);
              setPreview(googleAvatar);
            } catch (err) {
              console.error('[CompleteProfile] Unexpected error loading user:', err);
              router.push('/');
            } finally {
              setLoadingUser(false);
            }
          } else {
            console.log('[CompleteProfile] No session found after auth event');
            setLoadingUser(false);
            router.push('/');
          }
        }
      }
    );

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  // Submit updated profile to Supabase
  const handleSubmit = async () => {
    try {
      console.log("[CompleteProfile] I clicked submit!")
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("[CompleteProfile] I clicked submit - Done waiting for getUser()!")

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
      console.log("[CompleteProfile] Unexpected error during profile update:", err);
      alert("An unexpected error occurred.");
    }
  };

  if (loadingUser) {
    return (
      <main className="complete-profile-page">
        <div className="profile-card">
          <h1 className="profile-title">Loading Google profile...</h1>
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
