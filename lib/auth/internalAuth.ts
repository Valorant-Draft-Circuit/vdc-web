import "server-only";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { viewerHasAccess } from "@/lib/auth/guards";
import { getMeilisearchKey } from "@/lib/meilisearch/meilisearch";
import { Roles } from "@/prisma";

const SEARCH_ADMIN_ROLES = [Roles.TECH_DB, Roles.LEAD_TECH, Roles.OWNER];

function secretsMatch(provided: string, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return (
    providedBytes.length === expectedBytes.length &&
    timingSafeEqual(providedBytes, expectedBytes)
  );
}

function hasServiceCredential(request: NextRequest): boolean {
  const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/);
  if (bearer && secretsMatch(bearer[1], process.env.INTERNAL_API_SECRET)) {
    return true;
  }
  // Legacy: the bot still sends the search key as a query parameter.
  const legacy = request.nextUrl.searchParams.get("meiliauth") ?? "";
  return secretsMatch(legacy, getMeilisearchKey());
}

/** Returns a response to send when the caller is not allowed, otherwise null. */
export async function rejectUnlessSearchAdmin(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (hasServiceCredential(request)) return null;
  if (await viewerHasAccess(SEARCH_ADMIN_ROLES)) return null;
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
