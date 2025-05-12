import { Player } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ discordID: string }> }
) {
  const discordID = (await params).discordID;
  const riotIGN = await Player.getIGNby({ discordID: discordID });
  console.log(riotIGN);
  if (riotIGN) {
    return NextResponse.json(riotIGN);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
