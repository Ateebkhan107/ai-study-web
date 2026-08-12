"use client";

import { useMemo } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export function useClerkSupabase() {
  const { isLoaded, session } = useSession();

  return useMemo(() => {
    if (!isLoaded || !session) return null;

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        accessToken: async () => session.getToken(),
      }
    );
  }, [isLoaded, session]);
}
