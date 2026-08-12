import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getChapterTargets } from "@/lib/questions";

const BIOLOGY_CHAPTERS = [
  "The Living World & Biological Classification",
  "Plant Kingdom",
  "Animal Kingdom",
  "Morphology & Anatomy of Flowering Plants",
  "Structural Organisation in Animals",
  "Cell: Structure, Function & Cell Division",
  "Biomolecules",
  "Plant Physiology (Photosynthesis & Respiration)",
  "Plant Growth & Development",
  "Human Physiology (Digestion, Respiration, Circulation)",
  "Excretion, Locomotion & Neural Control",
  "Chemical Coordination & Integration",
  "Sexual Reproduction in Flowering Plants",
  "Human Reproduction & Reproductive Health",
  "Principles of Inheritance & Variation (Genetics)",
  "Molecular Basis of Inheritance",
  "Evolution",
  "Human Health, Diseases & Microbes",
  "Biotechnology: Principles & Applications",
  "Ecology, Ecosystem & Biodiversity Conservation",
];

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exam = searchParams.get("exam") || "NEET";
    const subject = searchParams.get("subject") || "Biology";

    if (exam !== "NEET" || subject !== "Biology") {
      return NextResponse.json({ chapters: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("questions")
      .select("id,chapter,difficulty")
      .eq("exam", "NEET")
      .eq("subject", "Biology")
      .eq("source_type", "PREPZII_PRACTICE")
      .eq("status", "PUBLISHED")
      .eq("is_active", true);

    if (error?.code === "42703") {
      return NextResponse.json({
        chapters: BIOLOGY_CHAPTERS.map((chapter) => ({
          chapter,
          count: 0,
          difficultyCounts: { easy: 0, medium: 0, hard: 0 },
        })),
        migrationRequired: true,
        message: "Practice question metadata columns are not installed yet.",
      });
    }

    if (error) {
      throw error;
    }

    const rows = data || [];
    const chapters = BIOLOGY_CHAPTERS.map((chapter) => {
      const targets = new Set(getChapterTargets(chapter));
      const matches = rows.filter((row) => targets.has(row.chapter));
      return {
        chapter,
        count: matches.length,
        difficultyCounts: {
          easy: matches.filter((row) => row.difficulty === "Easy").length,
          medium: matches.filter((row) => row.difficulty === "Medium").length,
          hard: matches.filter((row) => row.difficulty === "Hard").length,
        },
      };
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("[PRACTICE_AVAILABILITY_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load practice question availability" },
      { status: 500 }
    );
  }
}
