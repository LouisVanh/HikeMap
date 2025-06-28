'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function useRequireCompleteProfile() {
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // not logged in

      const { data: profile } = await supabase
        .from('Users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        console.log("User wasn't logged in, sending to complete-profile");
        router.push('/complete-profile');
      }
    };

    checkProfile();
  }, []);
}
