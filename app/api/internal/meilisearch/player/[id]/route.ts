import { auth } from "@/lib/auth/auth";
import { getUserRoles, isAuthorizedForMeilisearch } from "@/lib/auth/access";
import { updatePlayerDocument } from "@/lib/meilisearch/updatePlayerDocument";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }
  const userRoles = await getUserRoles(session.user.id);
  if (!isAuthorizedForMeilisearch(userRoles)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const playerId = (await params).id;
  try {
    await updatePlayerDocument(playerId);
    return NextResponse.json({ message: "Player document added" });
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : String(err),
        status: 400,
      },
      { status: 400 },
    );
  }
}
