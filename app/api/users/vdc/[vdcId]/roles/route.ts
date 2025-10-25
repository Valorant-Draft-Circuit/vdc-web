import { Player } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vdcId: string }> }
) {
  const vdcId = (await params).vdcId;
  const player = await Player.getBy({ userID: vdcId });
  if (player) {
    return NextResponse.json(player);
  }
  return NextResponse.json({ error: "Not Found." }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ vdcId: string }> }
) {
  const vdcId = (await params).vdcId;
  const { roles } = await request.json();

  const bigintRoles = roles.map((val: string) => BigInt(val));

  try {
    await Player.modifyRoles({ userID: vdcId }, "SET", bigintRoles);
    return NextResponse.json({
      message: `Successfully updated ${vdcId}'s roles.`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
