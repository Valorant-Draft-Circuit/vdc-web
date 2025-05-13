import { Player } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riotIGN: string }> }
) {
  const riotIGN = (await params).riotIGN;
  const player = await Player.getBy({ ign: riotIGN });
  if (player) {
    return NextResponse.json(player);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
