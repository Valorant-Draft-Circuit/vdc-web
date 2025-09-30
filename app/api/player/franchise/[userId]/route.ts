import { getFranchiseSlugOfManager } from "@/lib/queries/franchises/franchises";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;
  const slug = await getFranchiseSlugOfManager(userId);

  if (!slug) {
    return NextResponse.json({ error: "Not Found." }, { status: 404 });
  }

  return NextResponse.json(slug);
}
