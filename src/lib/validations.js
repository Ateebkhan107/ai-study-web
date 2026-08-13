import { z } from "zod";

// --- COMMUNITY GROUPS ---
export const GroupCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  privacy: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  avatar_url: z.string().url().optional().nullable(),
});

export const GroupUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  privacy: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

// --- COMMUNITY MESSAGES ---
export const MessageSchema = z.object({
  content: z.string().min(1).max(5000),
  parent_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

// --- COMMUNITY REPORTS ---
export const ReportCreateSchema = z.object({
  targetType: z.enum(["group", "message", "user", "direct_message"]),
  targetId: z.string(),
  reason: z.string().max(500),
});

export const ReportUpdateSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]),
  action_taken: z.string().max(500).optional().nullable(),
});

// --- COMMUNITY REQUESTS / MODERATION ---
export const RequestActionSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["ACCEPTED", "REJECTED"]),
});

export const GroupMemberUpdateSchema = z.object({
  targetUserId: z.string(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const GroupMemberRemoveSchema = z.object({
  targetUserId: z.string(),
});

export const ModerationActionSchema = z.object({
  action: z.enum([
    "dismiss_report",
    "hide_message",
    "suspend_user",
    "unsuspend_user",
    "remove_from_group",
    "freeze_group",
    "unfreeze_group",
    "delete_group",
  ]),
  targetType: z.string().optional().nullable(),
  targetId: z.string(),
  reason: z.string().max(500).optional().nullable(),
  extra: z.any().optional().nullable(),
});

export const AdminReportUpdateSchema = z.object({
  reportId: z.string().uuid(),
  action: z.enum(["dismissed", "actioned"]),
});

export const BlockSchema = z.object({
  targetUserId: z.string(),
});

// --- INSTITUTES ---
export const InstituteCreateSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional().nullable(),
  about: z.string().max(2000).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(20).optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

export const TestCreateSchema = z.object({
  title: z.string().min(3).max(200),
  batch_id: z.string().uuid(),
  exam: z.enum(["JEE", "NEET"]).default("JEE"),
  subject: z.string().min(1),
  chapters: z.array(z.string()).optional().default([]),
  duration_minutes: z.number().int().min(5).max(240).default(30),
  question_count: z.number().int().min(1).max(100).default(10),
  difficulty: z.string().default("mixed"),
  mode: z.enum(["auto", "custom"]).default("auto"),
});

export const TestQuestionCreateSchema = z.object({
  exam: z.string().optional().default("JEE"),
  subject: z.string().optional().default("Physics"),
  chapter: z.string().optional().default("Mixed"),
  topic: z.string().optional().default("Mixed"),
  difficulty: z.string().optional().default("Medium"),
  question_type: z.string().optional().default("MCQ"),
  question_text: z.string().optional().default(""),
  question_image: z.string().url().optional().nullable(),
  option_a: z.string().optional().default(""),
  option_b: z.string().optional().default(""),
  option_c: z.string().optional().default(""),
  option_d: z.string().optional().default(""),
  option_a_image: z.string().url().optional().nullable(),
  option_b_image: z.string().url().optional().nullable(),
  option_c_image: z.string().url().optional().nullable(),
  option_d_image: z.string().url().optional().nullable(),
  correct_option: z.string().optional().default("A"),
  marks: z.number().optional().default(4),
  negative_marks: z.number().optional().default(1),
});

export const BatchCreateSchema = z.object({
  name: z.string().min(2).max(100),
  exam: z.enum(["JEE", "NEET"]).default("JEE"),
  target_year: z.number().int().optional().nullable(),
});

export const BatchMemberSchema = z.object({
  batch_id: z.string().uuid(),
  member_id: z.string().uuid(),
  action: z.enum(["add", "remove"]).default("add"),
});
export const BatchUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export const StudentAddSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional().nullable(),
  batch_id: z.string().uuid().optional().nullable(),
});

// --- ADMIN / PYQ ---
export const PyqImageDeleteSchema = z.object({
  id: z.string(),
  field: z.string(),
  imageUrl: z.string().optional().nullable(),
  deleteStorage: z.boolean().optional().default(false),
  confirmDelete: z.boolean().optional().default(false),
});

export const PyqImageCreateSchema = z.object({
  subject: z.string().max(50),
  exam: z.string().max(50).optional().nullable(),
  year: z.number().int().optional().nullable(),
  shift: z.string().max(50).optional().nullable(),
  type: z.enum(["QUESTION", "SOLUTION"]).default("QUESTION"),
  url: z.string().url(),
});

export const PackageImportSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  questions: z.array(z.any()).optional(),
});

export const NotificationSchema = z.object({
  notificationId: z.string().uuid().optional(),
  clearAll: z.boolean().optional(),
});
