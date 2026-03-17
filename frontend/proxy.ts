import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/saved(.*)",
    "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    // If user hits / redirect to /dashboard if signed in, else /sign-in
    if (req.nextUrl.pathname === "/") {
        const { userId } = await auth();
        if (userId) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
