// This route handles the OAuth redirect from Supabase after Google sign-in.
// It checks whether the authenticated user has completed their profile.
// If not, it redirects them to /complete-profile. Otherwise, it redirects to the homepage.
// This file runs on the server — no "use server" directive is needed for route handlers.

// app/auth/redirect/route.ts
import { redirect } from "next/navigation";
import { createClient } from '@/utils/supabase/server';
import { hasCompletedProfile } from "@/utils/check_profile_completion";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log("[AuthRedirect] User found:", user);
    
    // Temporarily force all users to complete profile for debugging
    console.log("[AuthRedirect] Forcing complete-profile for debugging");
    redirect("/complete-profile");
    
    // Comment out the original logic for now
    // const completed = await hasCompletedProfile();
    // if (completed) {
    //     redirect("/");
    // } else {
    //     redirect("/complete-profile");
    // }
}
