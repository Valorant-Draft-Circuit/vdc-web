import { rejectUnlessSearchAdmin } from "@/lib/auth/internalAuth";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { NextRequest, NextResponse } from "next/server";

const KNOWN_INDEXES = ["players"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const rejection = await rejectUnlessSearchAdmin(request);
  if (rejection) return rejection;

  const indexName = (await params).name;
  if (!KNOWN_INDEXES.includes(indexName)) {
    return NextResponse.json(
      { message: "Unknown index", status: 400 },
      { status: 400 },
    );
  }

  try {
    await meilisearchClient.getIndex(indexName).getRawInfo();
    return NextResponse.json(
      { message: "Index already exists", status: 409 },
      { status: 409 },
    );
  } catch {
    const task = await meilisearchClient.createIndex(indexName);
    const result = await meilisearchClient.waitForTaskCompletion(task.taskUid);
    return NextResponse.json({ message: result, status: 200 });
  }
}
