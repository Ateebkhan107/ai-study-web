import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TRACKS = {
  jee: "jee",
  neet: "neet",
};

const DESTINATIONS = {
  dashboard: "/dashboard",
  practice: "/dashboard",
  pyq: "/pyq",
  "mock-tests": "/test",
  test: "/test",
};

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { track, destination } = await params;
  const normalizedTrack = TRACKS[String(track || "").toLowerCase()];
  const redirectPath = DESTINATIONS[String(destination || "").toLowerCase()];
  const requestUrl = new URL(request.url);

  if (!normalizedTrack || !redirectPath) {
    return NextResponse.redirect(new URL("/", requestUrl));
  }

  try {
    const { userId } = await auth();

    if (userId) {
      const { error } = await supabaseAdmin
        .from("user_profiles")
        .update({ exam: normalizedTrack.toUpperCase() })
        .eq("clerk_user_id", userId);

      if (error) {
        console.error("[EXAM_TRACK_REDIRECT_PROFILE_UPDATE_ERROR]", error);
      }
    }
  } catch (error) {
    console.error("[EXAM_TRACK_REDIRECT_ERROR]", error);
  }

  const response = NextResponse.redirect(new URL(redirectPath, requestUrl));
  response.cookies.set("prepzii_track", normalizedTrack, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: requestUrl.protocol === "https:",
  });

  return response;
}
