import { getAgentsCached, getMapsCached } from "@/lib/common/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  const resource = (await params).resource;
  if (resource === "agents") {
    const agents = await getAgentsCached();
    return NextResponse.json(agents);
  } else if (resource === "maps") {
    const maps = await getMapsCached();
    return NextResponse.json(maps);
  } else {
    return NextResponse.json({ error: "Invalid Resource." }, { status: 400 });
  }
}
