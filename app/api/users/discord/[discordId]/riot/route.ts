import { Player } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ discordId: string }> }
) {
  const discordId = (await params).discordId;
  const riotIGN = await Player.getIGNby({ discordID: discordId });
  if (riotIGN) {
    return NextResponse.json(riotIGN);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
