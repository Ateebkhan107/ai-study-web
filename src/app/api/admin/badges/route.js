import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/admin";

async function requireAdmin() {
  const admin = await isAdmin();
  return admin ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[ADMIN_BADGES_GET]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const { data, error } = await supabase
      .from("badges")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[ADMIN_BADGES_POST]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from("badges")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("[ADMIN_BADGES_PUT]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("badges")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ADMIN_BADGES_DELETE]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
