-- ============================================================
-- PrepZii Community RLS hardening
-- Run manually in Supabase SQL Editor after confirming the Clerk
-- Supabase JWT template puts the Clerk user id in auth.jwt()->>'sub'.
--
-- Server API routes use the service role and enforce permissions in code.
-- These policies protect direct client/realtime reads and keep direct
-- client writes disabled unless another reviewed policy is added later.
-- ============================================================

CREATE OR REPLACE FUNCTION public.community_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')
$$;

-- community_groups ----------------------------------------------------------
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
      OR EXISTS (
        SELECT 1
        FROM public.community_group_members m
        WHERE m.group_id = community_groups.id
          AND m.user_id = public.community_current_user_id()
          AND m.status = 'ACTIVE'
      )
    )
  );

-- community_group_members --------------------------------------------------
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
    EXISTS (
      SELECT 1
      FROM public.community_groups g
      WHERE g.id = community_group_members.group_id
        AND g.owner_id = public.community_current_user_id()
    )
  );

-- community_join_requests --------------------------------------------------
DROP POLICY IF EXISTS "community_join_requests_own_select" ON public.community_join_requests;
DROP POLICY IF EXISTS "community_join_requests_manager_select" ON public.community_join_requests;

CREATE POLICY "community_join_requests_own_select"
  ON public.community_join_requests
  FOR SELECT
  USING (user_id = public.community_current_user_id());

CREATE POLICY "community_join_requests_manager_select"
  ON public.community_join_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.community_group_members m
      WHERE m.group_id = community_join_requests.group_id
        AND m.user_id = public.community_current_user_id()
        AND m.status = 'ACTIVE'
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- community_group_messages -------------------------------------------------
DROP POLICY IF EXISTS "community_group_messages_member_select" ON public.community_group_messages;

CREATE POLICY "community_group_messages_member_select"
  ON public.community_group_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.community_group_members m
      WHERE m.group_id = community_group_messages.group_id
        AND m.user_id = public.community_current_user_id()
        AND m.status = 'ACTIVE'
    )
  );

-- community_direct_conversations ------------------------------------------
DROP POLICY IF EXISTS "community_direct_conversations_participant_select" ON public.community_direct_conversations;

CREATE POLICY "community_direct_conversations_participant_select"
  ON public.community_direct_conversations
  FOR SELECT
  USING (
    public.community_current_user_id() IN (user_one_id, user_two_id)
  );

-- community_direct_messages ------------------------------------------------
DROP POLICY IF EXISTS "community_direct_messages_participant_select" ON public.community_direct_messages;

CREATE POLICY "community_direct_messages_participant_select"
  ON public.community_direct_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.community_direct_conversations c
      WHERE c.id = community_direct_messages.conversation_id
        AND c.status = 'ACTIVE'
        AND public.community_current_user_id() IN (c.user_one_id, c.user_two_id)
    )
  );

-- community_user_blocks ----------------------------------------------------
DROP POLICY IF EXISTS "community_user_blocks_own_select" ON public.community_user_blocks;

CREATE POLICY "community_user_blocks_own_select"
  ON public.community_user_blocks
  FOR SELECT
  USING (blocker_id = public.community_current_user_id());

-- community_reports --------------------------------------------------------
DROP POLICY IF EXISTS "community_reports_own_select" ON public.community_reports;

CREATE POLICY "community_reports_own_select"
  ON public.community_reports
  FOR SELECT
  USING (reporter_id = public.community_current_user_id());

-- community_user_status ----------------------------------------------------
DROP POLICY IF EXISTS "community_user_status_own_select" ON public.community_user_status;

CREATE POLICY "community_user_status_own_select"
  ON public.community_user_status
  FOR SELECT
  USING (user_id = public.community_current_user_id());

-- community_rate_limits ----------------------------------------------------
DROP POLICY IF EXISTS "community_rate_limits_own_select" ON public.community_rate_limits;

CREATE POLICY "community_rate_limits_own_select"
  ON public.community_rate_limits
  FOR SELECT
  USING (user_id = public.community_current_user_id());
