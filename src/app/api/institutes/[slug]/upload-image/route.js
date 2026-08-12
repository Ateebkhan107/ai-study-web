import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getInstituteContext } from "@/lib/instituteAuth";

export async function POST(req, { params }) {
  const { slug } = await params;
  const context = await getInstituteContext(slug, ["COACHING_ADMIN", "OWNER"]);
  if (context.error) return context.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `institute-uploads/${context.institute.id}/${Date.now()}-${file.name}`;

    const { error } = await supabaseAdmin.storage
      .from("pyq-images")
      .upload(fileName, buffer, { contentType: file.type });

    if (error) {
      console.error("Image upload error", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from("pyq-images").getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (error) {
    console.error("[INSTITUTE_UPLOAD_IMAGE_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
