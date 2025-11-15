import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  slug: string;
  tier: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug, tier } = await params;
  console.log(slug, tier);

  return NextResponse.json({ slug, tier });
}
