import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";
import { BatchCreateSchema, BatchMemberSchema } from "@/lib/validations";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = BatchCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { name, exam, target_year: targetYear } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("institute_batches")
      .insert({
        institute_id: context.institute.id,
        name,
        exam,
        target_year: targetYear,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ batch: data }, { status: 201 });
  } catch (error) {
    console.error("[INSTITUTE_BATCH_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = BatchMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { batch_id: batchId, member_id: memberId, action } = parsed.data;

    const [{ data: batch, error: batchError }, { data: member, error: memberError }] = await Promise.all([
      supabaseAdmin.from("institute_batches").select("id").eq("id", batchId).eq("institute_id", context.institute.id).maybeSingle(),
      supabaseAdmin.from("institute_members").select("id").eq("id", memberId).eq("institute_id", context.institute.id).maybeSingle(),
    ]);

    if (batchError) throw batchError;
    if (memberError) throw memberError;
    if (!batch || !member) return NextResponse.json({ error: "Batch or member not found" }, { status: 404 });

    if (action === "remove") {
      const { error } = await supabaseAdmin
        .from("institute_batch_members")
        .delete()
        .eq("batch_id", batchId)
        .eq("member_id", memberId)
        .eq("institute_id", context.institute.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("institute_batch_members")
        .upsert({
          institute_id: context.institute.id,
          batch_id: batchId,
          member_id: memberId,
        }, { onConflict: "batch_id,member_id" });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[INSTITUTE_BATCH_MEMBER_ERROR]", error);
    return NextResponse.json({ error: "Failed to update batch membership" }, { status: 500 });
  }
}
