import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getUserProfile(clerkUserId) {
  if (!clerkUserId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
