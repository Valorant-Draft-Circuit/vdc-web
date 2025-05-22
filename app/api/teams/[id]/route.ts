import { Team } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const teamID = (await params).id;
  const team = await Team.getBy({ id: parseInt(teamID) });
  if (team) {
    return NextResponse.json(team);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
