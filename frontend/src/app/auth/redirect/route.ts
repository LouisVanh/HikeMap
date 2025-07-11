// This route handles the OAuth redirect from Supabase after Google sign-in.
// It checks whether the authenticated user has completed their profile.
// If not, it redirects them to /complete-profile. Otherwise, it redirects to the homepage.
// This file runs on the server — no "use server" directive is needed for route handlers.

// app/auth/redirect/route.ts
// app/auth/redirect/route.ts
import { redirect } from "next/navigation";
import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { hasCompletedProfile } from "@/utils/check_profile_completion";

export async function GET(request: NextRequest) {
    console.log("[AuthRedirect] Route entered - preparing redirect");
    
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    console.log("[AuthRedirect] URL params:", { code: !!code, error, errorDescription });
    
    if (error) {
        console.error("[AuthRedirect] OAuth error:", error, errorDescription);
        redirect('/auth/error?message=' + encodeURIComponent(errorDescription || error));
    }
    
    const supabase = await createClient();
    
    // If we have a code, exchange it for a session
    if (code) {
        console.log("[AuthRedirect] Exchanging code for session...");
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
            console.error("[AuthRedirect] Error exchanging code:", exchangeError);
            redirect('/auth/error?message=' + encodeURIComponent(exchangeError.message));
        }
        
        console.log("[AuthRedirect] Code exchange successful");
    }
    
    // Now try to get the session again
    const { error: session_error, data: { session } } = await supabase.auth.getSession();
    
    if (session_error) {
        console.error("[AuthRedirect] Error fetching session:", session_error.message);
    } else {
        console.log("[AuthRedirect] Session after exchange:", !!session);
    }
    
    const { error: user_error, data: { user } } = await supabase.auth.getUser();
    
    if (user_error) {
        console.error("[AuthRedirect] Error fetching user:", user_error.message);
    } else {
        console.log("[AuthRedirect] User after exchange:", !!user);
    }
    
    // If we still don't have a session, something's wrong
    if (!session || !user) {
        console.error("[AuthRedirect] No session/user after OAuth - redirecting to sign in");
        redirect('/error?message=Authentication failed');
    }
    
    const completed = await hasCompletedProfile();
    if (completed) {
        redirect("/");
    } else {
        redirect("/complete-profile");
    }
}
