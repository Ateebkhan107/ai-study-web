import { z } from "zod";

export const ZI_MAX_MESSAGE_LENGTH = 2000;
export const ZI_MAX_MESSAGES = 12;
export const ZI_MAX_TOTAL_CHARS = 8000;

const ZiChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(ZI_MAX_MESSAGE_LENGTH),
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
});
