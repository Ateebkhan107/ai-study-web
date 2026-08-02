-- ============================================================
-- PrepZii Study Community — Safe SQL Migration
-- Run this manually in the Supabase SQL Editor.
-- This file ONLY creates new tables. No existing tables are altered.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. community_groups
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_groups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 60),
  description   text CHECK (description IS NULL OR char_length(description) <= 300),
  exam_track    text NOT NULL CHECK (exam_track IN ('JEE', 'NEET')),
  privacy       text NOT NULL DEFAULT 'PUBLIC' CHECK (privacy IN ('PUBLIC', 'PRIVATE')),
  owner_id      text NOT NULL,
  member_count  int  NOT NULL DEFAULT 1,
  is_frozen     bool NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_groups_exam_track ON community_groups (exam_track);
CREATE INDEX IF NOT EXISTS idx_community_groups_owner_id   ON community_groups (owner_id);
CREATE INDEX IF NOT EXISTS idx_community_groups_privacy    ON community_groups (privacy);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_at ON community_groups (created_at DESC);

ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_groups_select"
  ON community_groups FOR SELECT
  USING (is_frozen = false);

-- ────────────────────────────────────────────────────────────
-- 2. community_group_members
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_group_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   uuid NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id    text NOT NULL,
  role       text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  status     text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED', 'LEFT')),
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cgm_group_id ON community_group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_cgm_user_id  ON community_group_members (user_id);
CREATE INDEX IF NOT EXISTS idx_cgm_status   ON community_group_members (group_id, status);

ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 3. community_join_requests
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_join_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id      text NOT NULL,
  status       text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  reviewed_by  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_at  timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cjr_one_pending
  ON community_join_requests (group_id, user_id)
  WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_cjr_group_id ON community_join_requests (group_id);
CREATE INDEX IF NOT EXISTS idx_cjr_user_id  ON community_join_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_cjr_status   ON community_join_requests (group_id, status);

ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 4. community_group_messages
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_group_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  sender_id   text NOT NULL,
  content     text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  is_deleted  bool NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cgmsg_group_created
  ON community_group_messages (group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cgmsg_sender ON community_group_messages (sender_id);

ALTER TABLE community_group_messages ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 5. community_direct_conversations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_direct_conversations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one_id    text NOT NULL,
  user_two_id    text NOT NULL,
  requested_by   text NOT NULL,
  status         text NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING', 'ACTIVE', 'DECLINED', 'BLOCKED')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_one_id, user_two_id)
);

CREATE INDEX IF NOT EXISTS idx_cdc_user_one ON community_direct_conversations (user_one_id);
CREATE INDEX IF NOT EXISTS idx_cdc_user_two ON community_direct_conversations (user_two_id);
CREATE INDEX IF NOT EXISTS idx_cdc_status   ON community_direct_conversations (status);

ALTER TABLE community_direct_conversations ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 6. community_direct_messages
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_direct_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES community_direct_conversations(id) ON DELETE CASCADE,
  sender_id        text NOT NULL,
  content          text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  is_deleted       bool NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cdm_conv_created
  ON community_direct_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cdm_sender ON community_direct_messages (sender_id);

ALTER TABLE community_direct_messages ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 7. community_user_blocks
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_user_blocks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id       text NOT NULL,
  blocked_user_id  text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_cub_blocker ON community_user_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_cub_blocked ON community_user_blocks (blocked_user_id);

ALTER TABLE community_user_blocks ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 8. community_reports
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  text NOT NULL,
  target_type  text NOT NULL CHECK (target_type IN ('user', 'message', 'group')),
  target_id    text NOT NULL,
  reason       text NOT NULL CHECK (char_length(reason) >= 1 AND char_length(reason) <= 500),
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'dismissed', 'actioned')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_by  text,
  reviewed_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_cr_reporter ON community_reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_cr_status   ON community_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cr_target   ON community_reports (target_type, target_id);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 9. community_moderation_logs
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_moderation_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     text NOT NULL,
  action       text NOT NULL,
  target_type  text NOT NULL,
  target_id    text NOT NULL,
  reason       text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cml_admin   ON community_moderation_logs (admin_id);
CREATE INDEX IF NOT EXISTS idx_cml_created ON community_moderation_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cml_target  ON community_moderation_logs (target_type, target_id);

ALTER TABLE community_moderation_logs ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 10. community_user_status
-- Community-level suspension — does NOT affect Clerk accounts
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_user_status (
  user_id       text PRIMARY KEY,
  is_suspended  bool NOT NULL DEFAULT false,
  suspended_at  timestamptz,
  suspended_by  text,
  reason        text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE community_user_status ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 11. community_rate_limits
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_rate_limits (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text NOT NULL,
  action     text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crl_user_action_time
  ON community_rate_limits (user_id, action, created_at DESC);

ALTER TABLE community_rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POST-MIGRATION STEPS:
-- 1. In Supabase Dashboard > Database > Replication, enable
--    Realtime on: community_group_messages, community_direct_messages
-- 2. Run ANALYZE on all new tables to update planner statistics
-- ============================================================
