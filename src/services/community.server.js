import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCommunityUser } from "@/lib/community/permissions";

const GROUP_LIST_COLUMNS = "id, name, description, exam_track, privacy, owner_id, member_count, created_at";

async function attachActiveMemberCounts(groups) {
  const groupIds = (groups || []).map((group) => group.id).filter(Boolean);
  if (groupIds.length === 0) return groups || [];

  const { data: activeMembers, error } = await supabaseAdmin
    .from("community_group_members")
    .select("group_id")
    .in("group_id", groupIds)
    .eq("status", "ACTIVE");

  if (error) throw error;

  const countMap = new Map();
  for (const member of activeMembers || []) {
    countMap.set(member.group_id, (countMap.get(member.group_id) || 0) + 1);
  }

  return (groups || []).map((group) => ({
    ...group,
    member_count: countMap.get(group.id) || 0,
  }));
}

export async function listCommunityGroupsForUser(userId, {
  page = 1,
  limit = 20,
  search = "",
  type = "discover",
} = {}) {
  const communityUser = await getCommunityUser(userId);
  if (!communityUser) {
    return { error: "Profile not found", status: 404 };
  }

  const safePage = Math.max(1, Number.parseInt(String(page), 10) || 1);
  const safeLimit = Math.min(50, Number.parseInt(String(limit), 10) || 20);
  const offset = (safePage - 1) * safeLimit;

  if (type === "mine") {
    const { data, error } = await supabaseAdmin
      .from("community_group_members")
      .select(
        `role, status, joined_at,
         community_groups (${GROUP_LIST_COLUMNS})`
      )
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("joined_at", { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (error) throw error;

    const groups = (data || []).map((member) => ({
      ...member.community_groups,
      myRole: member.role,
    }));

    return {
      groups: await attachActiveMemberCounts(groups),
      page: safePage,
      limit: safeLimit,
    };
  }

  let query = supabaseAdmin
    .from("community_groups")
    .select(GROUP_LIST_COLUMNS)
    .eq("exam_track", communityUser.examTrack)
    .eq("is_frozen", false)
    .order("member_count", { ascending: false })
    .range(offset, offset + safeLimit - 1);

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data: groups, error } = await query;
  if (error) throw error;

  const groupIds = (groups || []).map((group) => group.id);
  const membershipsQuery = groupIds.length > 0
    ? supabaseAdmin
      .from("community_group_members")
      .select("group_id, role, status")
      .eq("user_id", userId)
      .in("group_id", groupIds)
    : Promise.resolve({ data: [], error: null });

  const [{ data: memberships, error: membershipsError }, groupsWithCounts] = await Promise.all([
    membershipsQuery,
    attachActiveMemberCounts(groups || []),
  ]);

  if (membershipsError) throw membershipsError;

  const membershipMap = Object.fromEntries((memberships || []).map((membership) => [membership.group_id, membership]));
  const enriched = groupsWithCounts.map((group) => ({
    ...group,
    myRole: membershipMap[group.id]?.role || null,
    myStatus: membershipMap[group.id]?.status || null,
  }));

  return { groups: enriched, page: safePage, limit: safeLimit };
}

export async function getCommunityGroupForUser(groupId, userId) {
  const [groupResult, membershipResult, countResult] = await Promise.all([
    supabaseAdmin
      .from("community_groups")
      .select("id, name, description, exam_track, privacy, owner_id, member_count, created_at, updated_at, is_frozen")
      .eq("id", groupId)
      .maybeSingle(),
    supabaseAdmin
      .from("community_group_members")
      .select("id, role, status")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .maybeSingle(),
    supabaseAdmin
      .from("community_group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("status", "ACTIVE"),
  ]);

  if (groupResult.error) throw groupResult.error;
  if (membershipResult.error) throw membershipResult.error;
  if (countResult.error) throw countResult.error;

  const group = groupResult.data;
  const membership = membershipResult.data || null;

  if (!group) return { error: "Group not found", status: 404 };
  if (group.is_frozen || (group.privacy !== "PUBLIC" && !membership)) {
    return { error: "Access denied", status: 403 };
  }

  return {
    group: { ...group, member_count: countResult.count || 0 },
    membership,
  };
}
