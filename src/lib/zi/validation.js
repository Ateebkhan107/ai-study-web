import { z } from "zod";

export const ZI_MAX_MESSAGE_LENGTH = 2000;
export const ZI_MAX_MESSAGES = 12;
export const ZI_MAX_TOTAL_CHARS = 8000;
export const ZI_MAX_ENTITY_ID_LENGTH = 120;

export const ZiPageTypeSchema = z.enum([
  "dashboard",
  "test",
  "pyq",
  "revision",
  "analytics",
  "profile",
  "community",
  "arena",
  "unknown",
]);

export const ZiEntityTypeSchema = z.enum([
  "pyq_question",
  "revision_card",
  "test_question",
  "test_result",
]);

const ZiChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(ZI_MAX_MESSAGE_LENGTH),
});

const ZiPageContextSchema = z
  .object({
    pageType: ZiPageTypeSchema,
    entity: z
      .object({
        type: ZiEntityTypeSchema,
        id: z.string().trim().min(1).max(ZI_MAX_ENTITY_ID_LENGTH),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((pageContext, context) => {
    if (!pageContext.entity) return;

    const expectedPageTypeByEntity = {
      pyq_question: "pyq",
      revision_card: "revision",
      test_question: "test",
      test_result: "test",
    };
    const expectedPageType = expectedPageTypeByEntity[pageContext.entity.type];

    if (pageContext.pageType !== expectedPageType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entity", "type"],
        message: "Entity type does not match page type.",
      });
    }
  });

export const ZiChatRequestSchema = z.object({
  messages: z
    .array(ZiChatMessageSchema)
    .min(1)
    .max(ZI_MAX_MESSAGES)
    .refine((messages) => messages[messages.length - 1]?.role === "user", {
      message: "Last message must be from the user.",
    })
    .refine(
      (messages) =>
        messages.reduce((total, message) => total + message.content.length, 0) <=
        ZI_MAX_TOTAL_CHARS,
      {
        message: "Conversation is too long.",
      }
    ),
  pageContext: ZiPageContextSchema.optional(),
});
