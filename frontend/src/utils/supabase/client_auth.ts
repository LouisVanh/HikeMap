'use client';

import { createClient } from '@/utils/supabase/client';

export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/redirect`, // triggers GET() automatically
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('OAuth Error:', error);
    return;
  }

  // This opens Google login – Supabase handles redirect
  window.location.href = data.url;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    return;
  }

  window.location.href = '/'; // force fresh context
}
