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
    const completed = await hasCompletedProfile();

    console.log("[AuthRedirect] The user found: ",user)
    // if(!user){
    //     console.error(user)
    //     redirect("/error")
    // }

    if (completed) {
        redirect("/");
    } else {
        redirect("/complete-profile");
    }
}
