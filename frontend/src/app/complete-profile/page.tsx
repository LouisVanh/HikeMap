'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';
import '@/styles/completeProfile.css';
import ImageUploader from '@/components/image_uploader';
import { User } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

// Define the user profile type
interface UserProfile {
  name: string;
  profile_pic_url: string;
}

export default function CompleteProfilePage() {
  const [name, setName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Use a ref to track the latest profile picture URL
  const latestProfilePicUrl = useRef('');

  // Debug logging helper
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[CompleteProfile] ${message}`, data || '');
  };

  // Log that component is mounting
  console.log("🚀 CompleteProfilePage component is mounting/rendering");

  // Load user data from Supabase (DB first, then Google fallback)
  useEffect(() => {
    debugLog("=== USEEFFECT STARTING ===");
    
    const supabase = createClient();
    debugLog("Supabase client created");
    
    // Test database connection immediately
    const testConnection = async () => {
      try {
        debugLog("🔍 Testing database connection...");
        const { data, error } = await supabase.from('Users').select('count').limit(1);
        debugLog("Database connection test result", { data, error });
        
        if (error) {
          debugLog("❌ Database connection test failed", error);
        } else {
          debugLog("✅ Database connection test successful");
        }
      } catch (err) {
        debugLog("❌ Database connection test threw exception", err);
      }
    };
    
    testConnection();

    const loadUserData = async (user: User) => {
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        debugLog("⏰ TIMEOUT: loadUserData has been running for 10 seconds, something is wrong");
        debugLog("Current step: Database query might be hanging");
      }, 10000);

      try {
        debugLog("=== LOADING USER DATA ===", { userId: user.id, email: user.email });
        debugLog("User metadata:", user.user_metadata);

        // Step 1: Try to get existing profile from database with timeout
        debugLog("🔍 About to query database for existing profile...");
        debugLog("Query details:", { table: 'Users', userId: user.id });
        
        let existingProfile: UserProfile | null = null;
        let dbError: PostgrestError | null = null;
        
        try {
          // Add a race condition with timeout to prevent hanging
          const queryPromise = supabase
            .from('Users')
            .select('name, profile_pic_url')
            .eq('id', user.id)
            .single();
          
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 8000);
          });
          
          debugLog("🚀 Starting database query with 8s timeout...");
          const result = await Promise.race([queryPromise, timeoutPromise]);
          
          debugLog("✅ Database query completed");
          
          // Type-safe result handling
          if (result && typeof result === 'object' && 'data' in result && 'error' in result) {
            debugLog("Database query result", { data: result.data, error: result.error });
            existingProfile = result.data;
            dbError = result.error;
          } else {
            debugLog("Unexpected query result structure", result);
            dbError = null;
          }
        } catch (queryError) {
          debugLog("❌ Database query failed or timed out", queryError);
          
          // Check if it's a timeout vs actual error
          if (queryError instanceof Error && queryError.message === 'Database query timeout') {
            debugLog("🔥 Database query timed out - possible connection issue");
            dbError = null; // Treat timeout as "no data found"
          } else {
            dbError = queryError as PostgrestError;
          }
        }

        // Check if the error is "not found" (PGRST116)
        const isNotFoundError = dbError?.code === 'PGRST116';
        
        if (dbError && !isNotFoundError) {
          debugLog("⚠️ Database query error (not 'not found')", dbError);
        } else if (isNotFoundError) {
          debugLog("ℹ️ No existing profile found in database (PGRST116)");
        } else if (!dbError && existingProfile) {
          debugLog("✅ Database query successful, profile found", existingProfile);
        }

        // Step 2: Determine data priority (DB > Google > Default)
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        debugLog("Google metadata extracted", { googleName, googleAvatar });

        // Name priority: DB > Google > Default
        let finalName = '';
        if (existingProfile?.name) {
          finalName = existingProfile.name;
          debugLog("✓ Using name from database", finalName);
        } else if (googleName) {
          finalName = googleName;
          debugLog("✓ Using name from Google", finalName);
        } else {
          finalName = 'User';
          debugLog("✓ Using default name", finalName);
        }

        // Picture priority: DB > Google > Default
        let finalPicUrl = '';
        if (existingProfile?.profile_pic_url) {
          finalPicUrl = existingProfile.profile_pic_url;
          debugLog("✓ Using profile picture from database", finalPicUrl);
        } else if (googleAvatar) {
          finalPicUrl = googleAvatar;
          debugLog("✓ Using profile picture from Google", finalPicUrl);
        } else {
          finalPicUrl = DEFAULT_PROFILE_PICTURE_URL;
          debugLog("✓ Using default profile picture", finalPicUrl);
        }

        // Step 3: Update state and ref
        debugLog("Updating state with final values...", { 
          finalName, 
          finalPicUrl 
        });

        setName(finalName);
        setProfilePicUrl(finalPicUrl);
        setPreview(finalPicUrl);
        // IMPORTANT: Update the ref to keep track of the current URL
        latestProfilePicUrl.current = finalPicUrl;

        debugLog("✓ State updated successfully");

      } catch (error) {
        debugLog("❌ ERROR in loadUserData", error);
        // Fallback to Google data only
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || DEFAULT_PROFILE_PICTURE_URL;
        
        setName(googleName);
        setProfilePicUrl(googleAvatar);
        setPreview(googleAvatar);
        latestProfilePicUrl.current = googleAvatar;
        
        debugLog("Applied error fallback", { googleName, googleAvatar });
      } finally {
        clearTimeout(timeoutId);
        debugLog("=== SETTING LOADING TO FALSE ===");
        setLoadingUser(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugLog("🔄 Auth state change detected", { event, hasSession: !!session, userId: session?.user?.id });

        if (session?.user) {
          debugLog("Session user found, loading user data...");
          await loadUserData(session.user);
        } else if (event === 'SIGNED_OUT') {
          debugLog("User signed out, redirecting to home");
          router.push('/');
        } else {
          debugLog("No session user in auth state change");
        }
      }
    );

    // Check for existing session immediately
    const checkSession = async () => {
      try {
        debugLog("🔍 Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();

        debugLog("Session check result", { 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          userId: session?.user?.id,
          error: error 
        });

        if (error) {
          debugLog("❌ Error getting session", error);
          setLoadingUser(false);
          router.push('/');
          return;
        }

        if (session?.user) {
          debugLog("✓ Existing session found, loading user data...");
          await loadUserData(session.user);
        } else {
          debugLog("❌ No existing session, redirecting to home");
          setLoadingUser(false);
          router.push('/');
        }
      } catch (err) {
        debugLog("❌ Exception in checkSession", err);
        setLoadingUser(false);
        router.push('/');
      }
    };

    // Add a small delay to ensure everything is initialized
    setTimeout(() => {
      checkSession();
    }, 100);

    return () => {
      debugLog("🧹 Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Handle image upload from ImageUploader - FIXED VERSION
  const handleImageUpload = (url: string) => {
    debugLog("Image uploaded, updating URLs", { url });
    setProfilePicUrl(url);
    setPreview(url);
    // CRITICAL FIX: Update the ref immediately to ensure we use the latest URL
    latestProfilePicUrl.current = url;
  };

  // Submit updated profile to Supabase - FIXED VERSION
  const handleSubmit = async () => {
    if (isSubmitting) {
      debugLog("Submit already in progress, ignoring duplicate click");
      return;
    }

    try {
      debugLog("Submit clicked, starting profile save");
      setIsSubmitting(true);
      
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      debugLog("User data fetched for submit", { hasUser: !!userData?.user, error: userError });

      if (userError) {
        debugLog("Failed to fetch user for submit", userError);
        alert("Unable to fetch user info.");
        return;
      }

      const user = userData.user;
      if (!user) {
        debugLog("No user found in session during submit");
        alert("You're not logged in.");
        return;
      }

      const { id } = user;
      const finalName = name.trim() || user.user_metadata?.full_name || 'User';
      // CRITICAL FIX: Use the ref value to ensure we get the most up-to-date URL
      const finalPic = latestProfilePicUrl.current || profilePicUrl || DEFAULT_PROFILE_PICTURE_URL;

      debugLog("Preparing to upsert profile to Supabase", { 
        id, 
        finalName, 
        finalPic,
        originalName: name,
        originalPicUrl: profilePicUrl,
        refPicUrl: latestProfilePicUrl.current
      });

      const { error } = await supabase.from('Users').upsert([
        {
          id,
          name: finalName,
          profile_pic_url: finalPic,
        },
      ]);

      if (error) {
        debugLog("Failed to upsert user profile", error);
        alert('Failed to save profile.');
        return;
      }

      debugLog("Profile updated successfully, redirecting to map");
      router.push('/map');
      
    } catch (err) {
      debugLog("Unexpected error during profile update", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      debugLog("Submit process completed");
    }
  };

  if (loadingUser) {
    return (
      <main className="complete-profile-page">
        <div className="profile-card">
          <h1 className="profile-title">Loading your profile...</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  console.log('About to render ImageUploader with:', { 
  profilePicUrl, 
  preview, 
  passedInitialUrl: preview || DEFAULT_PROFILE_PICTURE_URL 
});

  return (
    <main className="complete-profile-page">
      <div className="profile-card">
        <h1 className="profile-title">Complete your profile</h1>

        <ImageUploader
          type="profile"
          initialUrl={preview || DEFAULT_PROFILE_PICTURE_URL}
          onUpload={handleImageUpload}
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
            placeholder="Enter your name"
          />
        </div>

        <button
          className="confirm-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save and continue'}
        </button>
      </div>
    </main>
  );
}