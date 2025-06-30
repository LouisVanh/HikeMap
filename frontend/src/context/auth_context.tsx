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

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      console.error('Supabase signOut error:', error.message, error);
      // Optional: send to Sentry
      Sentry.captureException(error);
    } else {
      console.log('User signed out successfully');
    }
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
