// This route handles the OAuth redirect from Supabase after Google sign-in.
// It checks whether the authenticated user has completed their profile.
// If not, it redirects them to /complete-profile. Otherwise, it redirects to the homepage.
// This file runs on the server — no "use server" directive is needed for route handlers.

// app/auth/redirect/route.ts
import { redirect } from "next/navigation";
import { createClient } from '@/utils/supabase/server';
import { hasCompletedProfile } from "@/utils/check_profile_completion";
import { NextRequest } from "next/server";

export async function GET(request : NextRequest) {
    console.log("[AuthRedirect] route entered - preparing redirect")
    console.log("[AuthRedirect] All cookies:", request.cookies.getAll());
    const supabase = await createClient();
    const { error: session_error, data: { session } } = await supabase.auth.getSession();

    if (session_error) {
        console.error("[AuthRedirect] Error fetching session: ", session_error.message)
    } else {
        console.log("[AuthRedirect] Session found:", session)
    }
    const { error: user_error, data: { user } } = await supabase.auth.getUser();

    if (user_error) {
        console.error("[AuthRedirect] Error fetching user: ", user_error.message)
    }

    console.log("[AuthRedirect] User found:", user);

    const completed = await hasCompletedProfile();
    if (completed) {
        console.log("[AuthRedirect] User has completed profile, redirecting home");
        redirect("/");
    } else {
        console.log("[AuthRedirect] User has NOT completed profile, redirecting to complete-profile");
        redirect("/complete-profile");
    }
}
