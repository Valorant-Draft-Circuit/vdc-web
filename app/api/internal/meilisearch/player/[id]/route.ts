import { rejectUnlessSearchAdmin } from "@/lib/auth/internalAuth";
import { updatePlayerDocument } from "@/lib/meilisearch/updatePlayerDocument";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejection = await rejectUnlessSearchAdmin(request);
  if (rejection) return rejection;

  const playerId = (await params).id;
  try {
    await updatePlayerDocument(playerId);
    return NextResponse.json({ message: "Player document added" });
  } catch (error) {
    console.error("[search] player document update failed", error);
    return NextResponse.json(
      { message: "Failed to update player document", status: 400 },
      { status: 400 },
    );
  }
}
