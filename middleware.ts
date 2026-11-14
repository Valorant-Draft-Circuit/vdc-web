import { auth } from "@/lib/auth/auth";

export default auth(() => {});

// Static assets and images never need a session lookup.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
