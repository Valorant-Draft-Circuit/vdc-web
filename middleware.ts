import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  extractRequestOrigin,
  isAllowedOrigin,
  isOriginExemptPath,
} from "@/lib/auth/origin-allowlist";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) return;
  if (isOriginExemptPath(pathname)) return;

  const requestOrigin = extractRequestOrigin(req.headers);
  if (!isAllowedOrigin(requestOrigin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
});
