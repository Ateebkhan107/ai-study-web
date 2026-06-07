import { supabase } from "@/lib/supabase";

export async function createProfileIfNotExists(user) {
  const clerkUserId = user.id;

  const { data: existing } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      clerk_user_id: clerkUserId,
      email: user.primaryEmailAddress?.emailAddress,
      full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}