'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';


export default function useRequireCompleteProfile() {
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const supabase = createClient();
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
  }, [router]);
}
