'use client'; // Required for client-side React features in Next.js App Router

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';


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

  // When the component mounts: check auth state and listen for changes
  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Only run redirect check if user just signed in
      if (event === 'SIGNED_IN' && session?.user) {
        const { data, error } = await supabase
          .from('Users')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        // No data found
        if (error || !data) {
          console.log('[AuthProvider] Redirecting to /complete-profile...');
          window.location.href = '/complete-profile';
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Call this when user clicks "Sign in"
  const signInWithGoogle = async () => {
    try {
      console.log("[AuthContext] Clicked sign in with Google")
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/`
              : undefined,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

    } catch (error) {
      console.error('Google Sign-In failed:', error);

      // Optional: show user-facing feedback
      Sentry.captureException(error);
      alert('Something went wrong during Google sign-in. Check the console for details.');
    }
  };


  const signOut = async () => {
    try {
      console.log("[AuthContext] Clicked sign out")

      // Global sign out: all pages (if user has multiple tabs open)
      // There's no point in supporting local, as it can cause issues with server side cookies and invisible re-auth
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.log("[AuthContext] Sign out error from supabase", error);
        console.error('Supabase signOut error:', error.message, error);
        // Optional: send to Sentry
        Sentry.captureException(error);
      } else {
        console.log('User signed out successfully');
      }
      window.location.href = '/'; // <-- force reload of homepage context
    } catch (err) {
      console.error('Unexpected error during signOut:', err);
      Sentry.captureException(err);
    }
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
