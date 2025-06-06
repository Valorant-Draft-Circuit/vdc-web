import { isAuthorizedForMeilisearch } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const session = await auth();
  const url = request.nextUrl;
  const meiliAuthFromUrl = url.searchParams.get("meiliauth");
  const bypass =
    meiliAuthFromUrl === process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY;

  if (!session || !isAuthorizedForMeilisearch(session.user?.roles) || !bypass) {
    return NextResponse.json({
      message: "Forbidden",
      status: 403,
    });
  }

  const indexName = (await params).name;

  try {
    await meilisearchClient.getIndex(indexName);
    return NextResponse.json(
      { message: "Index already exists", status: 409 },
      { status: 409 }
    );
  } catch {
    const task = await meilisearchClient.createIndex(indexName);
    const result = await meilisearchClient.waitForTaskCompletion(task.taskUid);
    return NextResponse.json({ message: result, status: 200 });
  }
}
