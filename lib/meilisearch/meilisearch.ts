import "server-only";
import { MeiliSearch, Index } from "meilisearch";

function createClient(): MeiliSearch {
  const host =
    process.env.MEILISEARCH_URL ?? process.env.NEXT_PUBLIC_MEILISEARCH_URL;
  const apiKey = getMeilisearchKey();

  if (!host) {
    throw new Error("MEILISEARCH_URL is not defined");
  }
  return new MeiliSearch({ host, apiKey });
}

/** The legacy NEXT_PUBLIC_ name is read only as a deploy-time fallback; this module is server-only. */
export function getMeilisearchKey(): string | undefined {
  return (
    process.env.MEILISEARCH_MASTER_KEY ??
    process.env.NEXT_PUBLIC_MEILISEARCH_MASTER_KEY
  );
}

let client: MeiliSearch | null = null;

function getClient(): MeiliSearch {
  if (!client) client = createClient();
  return client;
}

export const meilisearchClient = {
  getIndex(index: string): Index {
    return getClient().index(index);
  },

  createIndex(index: string) {
    return getClient().createIndex(index);
  },

  async waitForTaskCompletion(taskUid: number, timeout = 5_000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const task = await getClient().getTask(taskUid);
      if (task.status === "succeeded") return task;
      if (task.status === "failed")
        throw new Error(task.error?.message || "Task failed");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Task timed out");
  },
};
