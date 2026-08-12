-- Fix recursive Community RLS checks that prevent Supabase Realtime
-- postgres_changes from delivering community_group_messages events.

CREATE OR REPLACE FUNCTION public.community_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')
$$;

CREATE OR REPLACE FUNCTION public.community_is_active_group_member(
  target_group_id uuid,
  target_user_id text DEFAULT public.community_current_user_id()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_group_members m
    WHERE m.group_id = target_group_id
      AND m.user_id = target_user_id
      AND m.status = 'ACTIVE'
  )
$$;

CREATE OR REPLACE FUNCTION public.community_has_group_role(
  target_group_id uuid,
  allowed_roles text[],
  target_user_id text DEFAULT public.community_current_user_id()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_group_members m
    WHERE m.group_id = target_group_id
      AND m.user_id = target_user_id
      AND m.status = 'ACTIVE'
      AND m.role = ANY(allowed_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.community_is_group_owner(
  target_group_id uuid,
  target_user_id text DEFAULT public.community_current_user_id()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_groups g
    WHERE g.id = target_group_id
      AND g.owner_id = target_user_id
  )
$$;

GRANT EXECUTE ON FUNCTION public.community_current_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.community_is_active_group_member(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.community_has_group_role(uuid, text[], text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.community_is_group_owner(uuid, text) TO anon, authenticated;

DROP POLICY IF EXISTS "community_groups_select" ON public.community_groups;
DROP POLICY IF EXISTS "community_groups_secure_select" ON public.community_groups;

CREATE POLICY "community_groups_secure_select"
  ON public.community_groups
  FOR SELECT
  USING (
    is_frozen = false
    AND (
      privacy = 'PUBLIC'
      OR owner_id = public.community_current_user_id()
      OR public.community_is_active_group_member(community_groups.id)
    )
  );

DROP POLICY IF EXISTS "community_group_members_own_select" ON public.community_group_members;
DROP POLICY IF EXISTS "community_group_members_owner_select" ON public.community_group_members;

CREATE POLICY "community_group_members_own_select"
  ON public.community_group_members
  FOR SELECT
  USING (user_id = public.community_current_user_id());

CREATE POLICY "community_group_members_owner_select"
  ON public.community_group_members
  FOR SELECT
  USING (
    public.community_is_group_owner(community_group_members.group_id)
  );

DROP POLICY IF EXISTS "community_join_requests_manager_select" ON public.community_join_requests;

CREATE POLICY "community_join_requests_manager_select"
  ON public.community_join_requests
  FOR SELECT
  USING (
    public.community_has_group_role(community_join_requests.group_id, ARRAY['OWNER', 'ADMIN'])
  );

DROP POLICY IF EXISTS "community_group_messages_member_select" ON public.community_group_messages;

CREATE POLICY "community_group_messages_member_select"
  ON public.community_group_messages
  FOR SELECT
  USING (
    public.community_is_active_group_member(community_group_messages.group_id)
  );
