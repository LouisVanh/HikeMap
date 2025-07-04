'use client';

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOut, signInWithGoogle } from "@/utils/supabase/client_auth";

export const AuthButton = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  if (user) {
    return (
      <div className="flex items-center gap-4">
        <>
          <span className="text-white">Hi, {user.email}</span>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              signOut();
              setUser(null);
            }}
          >
            Sign Out
          </button>
        </>
      </div>
    );
  }
  return (
    <button
      className="bg-blue-500 text-white px-3 py-1 rounded"
      onClick={signInWithGoogle}
    >
      Sign In with Google
    </button>
  );
}
