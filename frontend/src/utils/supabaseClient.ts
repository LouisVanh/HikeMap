// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Get the keys from .env.local, the exclamation mark asserts that it's never null to TS (will complain otherwise)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Sets up HTTP request, passing authorization and api key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});