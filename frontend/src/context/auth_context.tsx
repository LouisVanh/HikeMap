'use client'; // Required for client-side React features in Next.js App Router

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { DEFAULT_NAME, DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';
import { supabase } from '../utils/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// Define the shape of the context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the actual context — initially undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component wraps your app and provides user/session data globally
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // current user
  const [session, setSession] = useState<Session | null>(null); // current session

  // This function runs when a user signs in.
  // It checks if their profile exists, inserts if needed, and redirects if name is "John Smith"
  const upsertUser = async (user: User) => {
    const { id, user_metadata } = user;

    const name = user_metadata.full_name ?? DEFAULT_NAME;
    const profilePic = user_metadata.avatar_url ?? DEFAULT_PROFILE_PICTURE_URL;

    console.log('[AuthContext] Trying to upsert user:'); 

    // Insert or update the user in your Supabase 'Users' table
    const { error } = await supabase.from('Users').upsert([
      {
        id,                   // this is the user's UUID
        name,                 // pulled from Google metadata
        profile_pic_url: profilePic,
      },
    ]);

    if (error) {
      console.log('Error happening during upsertion...:', error)
      console.error('[AuthContext] Failed to upsert user:', error.message);
      return;
    }

    // Fetch the user's profile from Supabase to check their name
    const { data, error: fetchError } = await supabase
      .from('Users')
      .select('name')
      .eq('id', id)
      .single(); // Get exactly one row

    if (fetchError) {
      console.error('[AuthContext] Failed to fetch user profile:', fetchError.message);
      return;
    }

    // If the user's name is still "John Smith", redirect to /complete-profile
    if (data?.name?.trim() === DEFAULT_NAME.trim() && typeof window !== 'undefined') {
      console.log('[AuthContext] Redirecting to /complete-profile');
      window.location.href = '/complete-profile';
    } else {
      console.log('[AuthContext] Not redirecting to /complete-profile:')
      console.log('Name is ', data?.name?.trim())
    }
  };

  // When the component mounts: check auth state and listen for changes
  useEffect(() => {
    // Load session on initial render
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      console.log('[AuthContext] Loaded session:', session);
    });

    // Listen to login/logout events and update state accordingly
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      console.log(`[AuthContext] Auth state changed: ${event}`);
      console.log('[AuthContext] New session:', session);

      // if (event === 'SIGNED_IN' && session?.user) {
      //   upsertUser(session.user); // Send to complete-profile page if needed
      // }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Call this when user clicks "Sign in"
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This ensures Supabase redirects the user to the correct domain after login
        redirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/` // e.g. https://hikemap.app/
            : undefined,
      },
    });
  };

  // Call this to sign out the user
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Make the context values available to all children of this component
  return (
    <AuthContext.Provider
      value={{ user, session, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook: lets you use `useAuth()` anywhere in your app to get auth state
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
