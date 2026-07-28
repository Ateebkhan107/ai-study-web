import { supabase } from "@/lib/supabase";

export async function getUserProfile(clerkUserId) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}