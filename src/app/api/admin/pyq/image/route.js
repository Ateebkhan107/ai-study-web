import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PyqImageDeleteSchema } from "@/lib/validations";
import { fetchAllRows } from "@/lib/adminImportPackages";

const BUCKET = "pyq-images";
const IMAGE_FIELDS = [
  "question_image",
  "option_a_image",
  "option_b_image",
  "option_c_image",
  "option_d_image",
  "explanation_image",
];
const REMOVABLE_FIELDS = new Set(["question_image", "explanation_image"]);

function objectPathFromUrl(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const value = String(url || "");
  const index = value.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(value.slice(index + marker.length));
}

function sameStorageObject(left, right) {
  if (!left || !right) return false;
  if (left === right) return true;
  const leftPath = objectPathFromUrl(left);
  const rightPath = objectPathFromUrl(right);
  return Boolean(leftPath && rightPath && leftPath === rightPath);
}

async function findReferences(url, excludeQuestionId = null) {
  const rows = await fetchAllRows(
    supabaseAdmin,
    "pyq_questions",
    ["id", "question_number", "paper_code", ...IMAGE_FIELDS].join(","),
  );

  const references = [];
  for (const row of rows) {
    if (excludeQuestionId && row.id === excludeQuestionId) continue;
    for (const field of IMAGE_FIELDS) {
      if (sameStorageObject(row[field], url)) {
        references.push({
          questionId: row.id,
          questionNumber: row.question_number,
          paperCode: row.paper_code,
          field,
        });
      }
    }
  }
  return references;
}

export async function POST(request) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PyqImageDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const { id, field, imageUrl: imageUrlFromBody, deleteStorage, confirmDelete } = parsed.data;

  if (!REMOVABLE_FIELDS.has(field)) {
    return NextResponse.json({ error: "Invalid image removal request" }, { status: 400 });
  }

  const { data: question, error: questionError } = await supabaseAdmin
    .from("pyq_questions")
    .select(`id, exam_id, ${field}`)
    .eq("id", id)
    .single();

  if (questionError) {
    return NextResponse.json({ error: questionError.message }, { status: 404 });
  }

  const imageUrl = question[field] || imageUrlFromBody;
  if (!imageUrl) {
    return NextResponse.json({
      success: true,
      unlinked: false,
      deleted: false,
      referencesRemaining: 0,
      message: "Image was already empty.",
    });
  }

  let unlinkError = null;
  if (question[field]) {
    const result = await supabaseAdmin
      .from("pyq_questions")
      .update({ [field]: null })
      .eq("id", id);
    unlinkError = result.error;
  }

  if (unlinkError) {
    return NextResponse.json({ error: unlinkError.message }, { status: 500 });
  }

  if (question.exam_id) {
    await supabaseAdmin
      .from("pyq_exams")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", question.exam_id);
  }

  const references = await findReferences(imageUrl, id);
  const objectPath = objectPathFromUrl(imageUrl);

  if (!deleteStorage) {
    return NextResponse.json({
      success: true,
      unlinked: true,
      deleted: false,
      objectPath,
      referencesRemaining: references.length,
      references,
      canDeleteStorage: references.length === 0 && Boolean(objectPath),
    });
  }

  if (!confirmDelete) {
    return NextResponse.json({
      success: true,
      unlinked: true,
      deleted: false,
      objectPath,
      referencesRemaining: references.length,
      references,
      canDeleteStorage: references.length === 0 && Boolean(objectPath),
      requiresConfirmation: true,
    });
  }

  if (references.length > 0) {
    return NextResponse.json({
      error: "Storage object is still referenced and cannot be deleted.",
      objectPath,
      referencesRemaining: references.length,
      references,
    }, { status: 409 });
  }

  if (!objectPath) {
    return NextResponse.json({
      error: "Could not derive storage object path from image URL.",
      referencesRemaining: references.length,
    }, { status: 400 });
  }

  const { error: deleteError } = await supabaseAdmin.storage.from(BUCKET).remove([objectPath]);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    unlinked: true,
    deleted: true,
    objectPath,
    referencesRemaining: 0,
  });
}
