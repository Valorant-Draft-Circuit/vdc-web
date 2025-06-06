import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const index = meilisearchClient.getIndex("players");
    const documents = await index.getDocuments();
    return NextResponse.json({ documents, status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message, status: 500 },
      { status: 500 }
    );
  }
}
