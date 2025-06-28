import { supabase } from './supabaseClient';

export async function hasCompletedProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('Users')
    .select('id') // or 'name' if you want extra validation
    .eq('id', userId)
    .maybeSingle();

  return !!data && !error;
}
