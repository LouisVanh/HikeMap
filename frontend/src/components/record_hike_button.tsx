'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function RecordHikeButton() {
    const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsSignedIn(!!user);
        };
        checkAuth();
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000
        }}>
            <button
                style={{
                    padding: '12px 20px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    if (isSignedIn) {
                        router.push('/record-hike');
                    } else {
                        router.push('/');
                    }
                }}
            >
                {isSignedIn === null ? '...' : isSignedIn ? 'Record Hike' : 'Sign in to record a hike'}
            </button>
        </div>
    );
}
