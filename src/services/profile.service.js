import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createProfileIfNotExists(user) {
  const clerkUserId = user.id;

  const { data: existing } = await supabaseAdmin
    .from("user_profiles")
    .select("id, clerk_user_id, email, full_name, username, exam, target_year, account_type, created_at, updated_at")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .insert({
      clerk_user_id: clerkUserId,
      email: user.primaryEmailAddress?.emailAddress,
      full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      account_type: "STUDENT",
    })
    .select("id, clerk_user_id, email, full_name, username, exam, target_year, account_type, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
