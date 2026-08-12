import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { findClerkUserByEmail, getInstituteContext } from "@/lib/instituteAuth";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const context = await getInstituteContext(slug, ["COACHING_ADMIN"]);
    if (context.error) return context.error;

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const batchId = body.batch_id || null;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid student email is required" }, { status: 400 });
    }

    const clerkUser = await findClerkUserByEmail(email);
    const userId = clerkUser?.id || null;
    const status = userId ? "ACTIVE" : "PENDING";

    const { data: member, error: memberError } = await supabaseAdmin
      .from("institute_members")
      .upsert({
        institute_id: context.institute.id,
        user_id: userId,
        email,
        role: "STUDENT",
        status,
      }, { onConflict: "institute_id,email" })
      .select("*")
      .single();

    if (memberError) throw memberError;

    if (batchId) {
      const { data: batch, error: batchError } = await supabaseAdmin
        .from("institute_batches")
        .select("id")
        .eq("id", batchId)
        .eq("institute_id", context.institute.id)
        .maybeSingle();
      if (batchError) throw batchError;
      if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

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
