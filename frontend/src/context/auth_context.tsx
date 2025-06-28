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
