import { supabaseAdmin } from "@/lib/supabaseAdmin";

const memberRoles = ["COACHING_ADMIN", "ACADEMIC_COORDINATOR", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT"];
const instituteFields = "id,name,slug,logo_url,status,owner_user_id";

export function resolveInstituteMembership(institute, userId, memberships) {
  if (!userId || institute.status !== "ACTIVE") return null;

  const bound = memberships.filter((member) =>
    member.institute_id === institute.id && member.user_id === userId
  );
  if (institute.owner_user_id === userId) {
    // Canonical ownership supports old institutes without an owner row.
    // The consumer historically records some owners as COACHING_ADMIN.
    if (!bound.length) return { role: "COACHING_ADMIN", member: null };
    const owners = bound.filter((member) => member.role === "OWNER");
    const owner = owners.length === 1 ? owners[0] : null;
    const legacy = bound.length === 1 && bound[0].role === "COACHING_ADMIN" ? bound[0] : null;
    const member = owner || legacy;
    return member?.status === "ACTIVE" ? { role: "COACHING_ADMIN", member } : null;
  }

  const active = bound.filter((member) => member.status === "ACTIVE");
  if (active.length !== 1 || !memberRoles.includes(active[0].role)) return null;
  return { role: active[0].role, member: active[0] };
}

export async function getActiveInstituteMemberships(userId) {
  if (!userId) return [];

  // Read every state for this Clerk ID so an inactive owner row cannot be
  // mistaken for a legacy institute that never had an owner membership.
  const [membershipResult, ownerResult] = await Promise.all([
    supabaseAdmin.from("institute_members")
      .select(`id,institute_id,user_id,role,status,institutes(${instituteFields})`, { count: "exact" })
      .eq("user_id", userId),
    supabaseAdmin.from("institutes").select(instituteFields).eq("owner_user_id", userId),
  ]);
  if (membershipResult.error) throw membershipResult.error;
  if (ownerResult.error) throw ownerResult.error;

  const memberships = membershipResult.data || [];
  if (membershipResult.count !== memberships.length) {
    throw new Error("Incomplete institute membership lookup");
  }
  const institutes = new Map();
  for (const row of memberships) {
    if (row.institutes) institutes.set(row.institute_id, row.institutes);
  }
  for (const institute of ownerResult.data || []) institutes.set(institute.id, institute);

  return [...institutes.values()].flatMap((institute) => {
    const access = resolveInstituteMembership(institute, userId, memberships);
    return access ? [{
      member_id: access.member?.id ?? null,
      role: access.role,
      status: "ACTIVE",
      institute,
    }] : [];
  });
}
