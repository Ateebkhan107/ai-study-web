import "server-only";
import { z } from "zod";
import { getClassroomFixtureOwner } from "./availability.server.js";
import { classroomFixtures } from "./fixtures.js";
import { angleSchema, validateClassroomLesson } from "./lessonSchema.js";

const templateNames = new Map([
  ["projectile motion", "projectile_motion"],
  ["chemical bonding", "chemical_bonding"],
  ["cell structure", "cell_structure"],
]);

const proposalSchema = z.strictObject({
  type: z.literal("visual_explanation"),
  visual: z.discriminatedUnion("templateKey", [
    z.strictObject({
      visualType: z.literal("classroom_lesson"),
      schemaVersion: z.literal(1),
      templateKey: z.literal("projectile_motion"),
      parameters: z.strictObject({
        angleDegrees: angleSchema.optional(),
        initialSpeedMps: z.number().min(5).max(40).optional(),
      }).optional(),
    }),
    ...["chemical_bonding", "cell_structure"].map((templateKey) => z.strictObject({
      visualType: z.literal("classroom_lesson"),
      schemaVersion: z.literal(1),
      templateKey: z.literal(templateKey),
    })),
  ]),
});

export function classroomSelectionAllowed(userId, access, env = process.env) {
  return Boolean(getClassroomFixtureOwner(userId, env) && env.ZI_CLASSROOM_SELECTION === "1" &&
    access?.userId === userId && access.accountType === "STUDENT" && access.isAiMode);
}

export function classroomCommand(text) {
  const match = /^\/classroom(?:\s+([^\n]+))?$/i.exec(text);
  if (!match) return null;
  const input = match[1]?.trim().toLowerCase() ?? "";
  const language = input.endsWith(" hinglish") ? "Hinglish" : "English";
  const topic = input.replace(/ hinglish$/, "");
  return { templateKey: templateNames.get(topic), language };
}

export function resolveClassroomSelection(proposal, { exam, examTrack, language }) {
  const parsed = proposalSchema.safeParse(proposal);
  if (!parsed.success) return null;
  const canonicalExam = exam === "JEE" ? "JEE Main" : exam;
  if (!["JEE Main", "JEE Advanced", "NEET"].includes(canonicalExam) ||
    (canonicalExam === "NEET" ? "NEET" : "JEE") !== examTrack) return null;
  const { templateKey, parameters } = parsed.data.visual;
  const fixture = classroomFixtures.find((item) => item.templateKey === templateKey && item.language === language);
  if (!fixture) return null;
  const lesson = validateClassroomLesson({
    ...fixture, exam: canonicalExam, parameters: { ...fixture.parameters, ...parameters },
  });
  return lesson ? { type: "visual_explanation", visual: { visualType: "classroom_lesson", lesson } } : null;
}
