import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/analytics(.*)",
  "/profile(.*)",
  "/subscriptions(.*)",
  "/test/session(.*)",
  "/test/history(.*)",
  "/test/review(.*)",
  "/test/result(.*)",
  "/pyq/session(.*)",
  "/battle(.*)",
  "/community/messages(.*)",
  "/community/groups/new",
  "/institute/(.*)/tests/(.*)/edit",
  "/admin(.*)",
]);

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    if (process.env.CLERK_AUTH_DEBUG === "true") {
      const { userId, sessionId } = await auth();
      console.info("[CLERK_AUTH_DEBUG]", {
        pathname: req.nextUrl.pathname,
        host: req.headers.get("host"),
        hasCookieHeader: Boolean(req.headers.get("cookie")),
        hasUserId: Boolean(userId),
        hasSessionId: Boolean(sessionId),
      });
    }

    await auth.protect();
  }
});

export default function proxy(request, event) {
  // Razorpay authenticates this server-to-server endpoint with its raw-body HMAC.
  if (request.nextUrl.pathname === "/api/webhooks/razorpay") return NextResponse.next();
  return clerkProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk(.*)",
  ],
};
