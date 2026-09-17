import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getChapterTargets, TEST_PAGE_CHAPTERS } from "@/lib/pyqChapterMapping";

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exam = searchParams.get("exam") || "NEET";
    const rawSubject = searchParams.get("subject") || "Biology";
    const subject = rawSubject === "Maths" ? "Mathematics" : rawSubject;
    const lookupKey = rawSubject === "Mathematics" ? "Maths" : rawSubject;

    const rawChaptersList = TEST_PAGE_CHAPTERS[lookupKey] || TEST_PAGE_CHAPTERS[rawSubject] || [];

    const TEST_BUILDER_EXTRA = {
      Biology: [
        "The Living World",
        "Biological Classification",
        "Plant Kingdom",
        "Animal Kingdom",
        "Morphology of Flowering Plants",
        "Anatomy of Flowering Plants",
        "Structural Organisation in Animals",
        "Cell: The Unit of Life",
        "Biomolecules",
        "Cell Cycle and Cell Division",
        "Photosynthesis in Higher Plants",
        "Respiration in Plants",
        "Plant Growth and Development",
        "Digestion and Absorption",
        "Breathing and Exchange of Gases",
        "Body Fluids and Circulation",
        "Excretory Products and their Elimination",
        "Locomotion and Movement",
        "Neural Control and Coordination",
        "Chemical Coordination and Integration",
        "Sexual Reproduction in Flowering Plants",
        "Human Reproduction",
        "Reproductive Health",
        "Principles of Inheritance and Variation",
        "Molecular Basis of Inheritance",
        "Evolution",
        "Human Health and Disease",
        "Microbes in Human Welfare",
        "Biotechnology: Principles and Processes",
        "Biotechnology and its Applications",
        "Organisms and Populations",
        "Ecosystem",
        "Biodiversity and Conservation",
      ],
    };

    const combinedList = [
      ...new Set([...rawChaptersList, ...(TEST_BUILDER_EXTRA[lookupKey] || TEST_BUILDER_EXTRA[rawSubject] || [])]),
    ];

    if (!combinedList.length) {
      return NextResponse.json({ chapters: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("questions")
      .select("id,chapter,difficulty")
      .eq("exam", exam)
      .eq("subject", subject)
      .eq("source_type", "PREPZII_PRACTICE")
      .eq("status", "PUBLISHED")
      .eq("is_active", true);

    if (error?.code === "42703") {
      return NextResponse.json({
        chapters: combinedList.map((chapter) => ({
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
    const chapters = combinedList.map((chapter) => {
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
