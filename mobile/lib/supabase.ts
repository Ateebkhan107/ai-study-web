import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/expo';
import { useMemo } from 'react';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export function useClerkSupabase() {
  const { isLoaded, session } = useSession();

  return useMemo(() => {
    if (!isLoaded || !session) return null;

    if (!supabaseUrl || !supabaseAnonKey) {
       console.warn('Supabase environment variables are missing');
       return null;
    }

    return createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        accessToken: async () => {
          return (
            (await session.getToken({ template: "supabase" }).catch(() => null)) ||
            (await session.getToken().catch(() => null))
          );
        },
        auth: {
          persistSession: false,
        },
      }
    );
  }, [isLoaded, session]);
}
