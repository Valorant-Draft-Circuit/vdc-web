import { getUser } from "@/lib/queries/user/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const player = await getUser(id);
  if (player) {
    return NextResponse.json(player);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
