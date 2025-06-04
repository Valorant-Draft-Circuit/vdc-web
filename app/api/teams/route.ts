import { Team } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamName = searchParams.get("name");
  if (!teamName) {
    return NextResponse.json(
      {
        error: `Missing params. You must provide name`,
      },
      { status: 422 }
    );
  }
  const team = await Team.getBy({ name: teamName });
  if (team) {
    return NextResponse.json(team);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}
