'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';

export default function CompleteProfilePage() {
    const [name, setName] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const router = useRouter();

    // Load user info from Supabase auth
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            // prefill user data to allow for easy flow, but still allow customisation
            if (user) {
                setName(user.user_metadata.full_name ?? '');
                setProfilePicUrl(user.user_metadata.avatar_url ?? '');
            }
        };

        loadUser();
    }, []);

    // When user submits the form, update their record in Supabase
    const handleSubmit = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { id } = user;

        const { error } = await supabase.from('Users').upsert([
            {
                id,
                name,
                profile_pic_url: profilePicUrl || DEFAULT_PROFILE_PICTURE_URL,
            },
        ]);

        if (error) {
            console.error('[CompleteProfile] Failed to upsert user:', error);
            alert('Something went wrong saving your profile.');
            return;
        }

        console.log('[CompleteProfile] Profile saved!');
        router.push('/map');
    };

    return (
        <main className="p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Complete your profile</h1>

            <label className="block mb-2 font-medium">Your name:</label>
            <input
                className="w-full p-2 border border-gray-300 rounded mb-4"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <label className="block mb-2 font-medium">Profile picture URL (optional):</label>
            <input
                className="w-full p-2 border border-gray-300 rounded mb-6"
                type="text"
                value={profilePicUrl}
                onChange={(e) => setProfilePicUrl(e.target.value)}
                placeholder={DEFAULT_PROFILE_PICTURE_URL}
            />

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
            >
                Save and continue
            </button>
        </main>
    );
}
