import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";
import { StudentAddSchema } from "@/lib/validations";

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

    const parsed = StudentAddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const { email, batch_id: batchId } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (batchId) {
      const { data: batch, error: batchError } = await supabaseAdmin
        .from("institute_batches")
        .select("id")
        .eq("id", batchId)
        .eq("institute_id", context.institute.id)
        .maybeSingle();
      if (batchError) throw batchError;
      if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Preserve memberships created before emails were normalized. The schema
    // accepts underscores, which need escaping in a LIKE pattern.
    const lookupMember = async () => {
      const { data, error } = await supabaseAdmin
        .from("institute_members")
        .select("*")
        .eq("institute_id", context.institute.id)
        .ilike("email", normalizedEmail.replaceAll("_", "\\_"))
        .maybeSingle();
      if (error) throw error;
      return data;
    };

    let member = await lookupMember();
    if (!member) {
      // An insert racing another add must preserve the existing row.
      const { data, error } = await supabaseAdmin
        .from("institute_members")
        .upsert({
          institute_id: context.institute.id,
          user_id: null,
          email: normalizedEmail,
          role: "STUDENT",
          status: "PENDING",
        }, { onConflict: "institute_id,email", ignoreDuplicates: true })
        .select("*")
        .maybeSingle();
      if (error) throw error;
      member = data ?? await lookupMember();
    }

    if (!member || member.role !== "STUDENT" || !["ACTIVE", "PENDING"].includes(member.status)) {
      return NextResponse.json({ error: "This membership cannot be added as a student." }, { status: 409 });
    }

    if (batchId) {
      const { error: batchMemberError } = await supabaseAdmin
        .from("institute_batch_members")
        .upsert({
          institute_id: context.institute.id,
          batch_id: batchId,
          member_id: member.id,
        }, { onConflict: "batch_id,member_id" });
      if (batchMemberError) throw batchMemberError;
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("[INSTITUTE_STUDENT_ADD_ERROR]", error);
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });

    const { error: batchMemberError } = await supabaseAdmin
      .from("institute_batch_members")
      .delete()
      .eq("member_id", memberId)
      .eq("institute_id", context.institute.id);

    if (batchMemberError) throw batchMemberError;

    const { error } = await supabaseAdmin
      .from("institute_members")
      .update({ status: "REMOVED" })
      .eq("id", memberId)
      .eq("institute_id", context.institute.id)
      .eq("role", "STUDENT");

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[INSTITUTE_STUDENT_REMOVE_ERROR]", error);
    return NextResponse.json({ error: "Failed to remove student" }, { status: 500 });
  }
}
