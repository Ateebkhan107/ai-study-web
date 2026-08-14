import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/analytics(.*)",
  "/profile(.*)",
  "/pyq(.*)",
  "/test(.*)",
  "/pro(.*)",
  "/community(.*)",
  "/institute(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
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

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk(.*)",
  ],
};
