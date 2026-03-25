import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define routes that do NOT need authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhook/clerk' // Add this if you have webhooks
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    (await auth()).protect();
  }
});

export const config = {
  matcher: [
    // Standard Next.js Clerk matcher
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};