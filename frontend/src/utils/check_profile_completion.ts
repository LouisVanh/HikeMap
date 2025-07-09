import { createClient } from '@/utils/supabase/server';

export async function hasCompletedProfile(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('[hasCompletedProfile] User:', user);
  console.log('[hasCompletedProfile] User error:', userError);

  if (userError || !user) {
    console.warn('[hasCompletedProfile] No authenticated user:', userError);
    return false;
  }

  const userId = user.id;
  console.log('[hasCompletedProfile] Checking profile for user ID:', userId);

  const { data, error } = await supabase
    .from('Users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  console.log('[hasCompletedProfile] Profile data:', data);
  console.log('[hasCompletedProfile] Profile error:', error);
  console.log('[hasCompletedProfile] Has completed profile:', !!data && !error);

  return !!data && !error;
}
