import { z } from "zod";

export const angleSchema = z.number().int().min(15).max(75);

export const formulas = Object.freeze({
  components: String.raw`v_x = v_0\cos\theta,\quad v_{0y} = v_0\sin\theta`,
  gravity: String.raw`a_x = 0,\quad a_y = -g`,
  trajectory: String.raw`x = v_x t,\quad y = v_{0y}t - \tfrac12 gt^2`,
  apex: String.raw`v_y = v_{0y}-gt,\quad H = \frac{v_{0y}^2}{2g}`,
  time: String.raw`T = \frac{2v_{0y}}{g}`,
  range: String.raw`R = v_xT = \frac{v_0^2\sin(2\theta)}{g}`,
});

export const templateScenes = {
  projectile_motion: ["launch", "components", "gravity", "trajectory", "apex", "time", "range"],
  chemical_bonding: ["valence", "transfer", "lattice", "sharing"],
  cell_structure: ["membrane", "cytoplasm", "nucleus", "mitochondria", "ribosomes"],
};

const plainText = (max) => z.string().trim().min(1).max(max).refine(
  (value) => !/[<>\\]|\b(?:[a-z][a-z\d+.-]*:\/\/|(?:javascript|data|vbscript|file|mailto|blob):)|\/\/|www\.|!\[|\]\s*\(|[\u0000-\u001f\u007f]/iu.test(value),
  "Use plain lesson text",
);
const keys = (max) => z.array(z.string().regex(/^[a-z][a-z0-9_]{0,39}$/)).max(max);
const step = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
  title: plainText(100),
  explanation: plainText(600),
  sceneKey: z.string().max(40),
  formulaKeys: keys(4).optional(),
  animation: z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("none"), durationMs: z.literal(0) }),
    z.strictObject({
      type: z.enum(["progressive_reveal", "motion_path"]),
      durationMs: z.number().int().min(150).max(3000),
    }),
  ]),
});

const base = {
  schemaVersion: z.literal(1),
  lessonId: z.string().regex(/^[a-z][a-z0-9_-]{0,79}$/),
  templateRevision: z.literal(1),
  title: plainText(100),
  exam: z.enum(["JEE Main", "JEE Advanced", "NEET"]),
  chapter: plainText(100),
  language: z.enum(["English", "Hindi", "Hinglish"]),
  steps: z.array(step).min(1).max(8),
};

const schema = z.discriminatedUnion("templateKey", [
  z.strictObject({
    ...base,
    templateKey: z.literal("projectile_motion"),
    subject: z.literal("Physics"),
    parameters: z.strictObject({
      angleDegrees: angleSchema,
      initialSpeedMps: z.number().min(5).max(40),
    }),
  }),
  z.strictObject({
    ...base,
    templateKey: z.literal("chemical_bonding"),
    subject: z.literal("Chemistry"),
    parameters: z.strictObject({}),
  }),
  z.strictObject({
    ...base,
    templateKey: z.literal("cell_structure"),
    subject: z.literal("Biology"),
    parameters: z.strictObject({}),
  }),
]);

export function validateClassroomLesson(input) {
  const result = schema.safeParse(input);
  if (!result.success) return null;

  const lesson = result.data;
  const order = templateScenes[lesson.templateKey];
  if (lesson.subject === "Biology" && lesson.exam !== "NEET") return null;
  if (new TextEncoder().encode(JSON.stringify(lesson)).length > 24 * 1024) return null;

  const ids = new Set();
  let previousScene = -1;
  for (const current of lesson.steps) {
    const index = order.indexOf(current.sceneKey);
    if (index <= previousScene || ids.has(current.id)) return null;
    if (current.animation.type === "motion_path" && current.sceneKey !== "trajectory") return null;
    if (current.formulaKeys?.some((key) =>
      lesson.subject !== "Physics" || key !== current.sceneKey || !Object.hasOwn(formulas, key)
    )) return null;
    ids.add(current.id);
    previousScene = index;
  }
  return lesson;
}
