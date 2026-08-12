import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getActingUser, slugifyInstituteName, unauthorized } from "@/lib/instituteAuth";

export async function GET() {
  try {
    const actor = await getActingUser();
    if (!actor) return unauthorized();

    if (actor.email) {
      const { error: bindError } = await supabaseAdmin
        .from("institute_members")
        .update({ user_id: actor.userId, status: "ACTIVE" })
        .eq("email", actor.email.toLowerCase())
        .is("user_id", null);

      if (bindError) throw bindError;
    }

    const { data: memberships, error: membershipError } = await supabaseAdmin
      .from("institute_members")
      .select("role,status,institutes(id,name,slug,logo_url,status,owner_user_id)")
      .eq("user_id", actor.userId)
      .eq("status", "ACTIVE");

    if (membershipError) throw membershipError;

    return NextResponse.json({
      institutes: (memberships || []).map((row) => ({
        ...row.institutes,
        role: row.role,
        member_status: row.status,
      })),
    });
  } catch (error) {
    console.error("[INSTITUTES_LIST_ERROR]", error);
    return NextResponse.json({ error: "Failed to load institutes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const actor = await getActingUser();
    if (!actor) return unauthorized();

    const body = await request.json();
    const name = String(body.name || "").trim();
    const logoUrl = String(body.logo_url || "").trim() || null;
    const baseSlug = slugifyInstituteName(body.slug || name);

    if (name.length < 2 || !baseSlug) {
      return NextResponse.json({ error: "Institute name is required" }, { status: 400 });
    }

    let slug = baseSlug;
    for (let index = 2; ; index += 1) {
      const { data: existing, error: slugError } = await supabaseAdmin
        .from("institutes")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (slugError) throw slugError;
      if (!existing) break;
      slug = `${baseSlug}-${index}`;
    }

    const { data: institute, error: instituteError } = await supabaseAdmin
      .from("institutes")
      .insert({
        name,
        slug,
        logo_url: logoUrl,
        owner_user_id: actor.userId,
        status: "ACTIVE",
      })
      .select("*")
      .single();

    if (instituteError) throw instituteError;

    const { error: memberError } = await supabaseAdmin
      .from("institute_members")
      .insert({
        institute_id: institute.id,
        user_id: actor.userId,
        email: actor.email,
        role: "COACHING_ADMIN",
        status: "ACTIVE",
      });

    if (memberError) throw memberError;

    return NextResponse.json({ institute }, { status: 201 });
  } catch (error) {
    console.error("[INSTITUTE_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to create institute" }, { status: 500 });
  }
}
