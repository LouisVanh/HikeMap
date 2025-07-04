import { createClient } from '@/utils/supabase/server';

export async function hasCompletedProfile(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn('[hasCompletedProfile] No authenticated user:', userError);
    return false;
  }

  const userId = user.id;

  const { data, error } = await supabase
    .from('Users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  return !!data && !error;
}
