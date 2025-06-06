import { MeiliSearch, Index } from "meilisearch";

class MeilisearchClient {
  private static instance: MeilisearchClient;
  private client: MeiliSearch;

  private constructor() {
    const host = process.env.NEXT_PUBLIC_MEILISEARCH_URL;
    const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY;

    if (!host) {
      throw new Error("MEILISEARCH_URL is not defined");
    }

    this.client = new MeiliSearch({ host, apiKey });
  }

  public static getInstance(): MeilisearchClient {
    if (!MeilisearchClient.instance) {
      MeilisearchClient.instance = new MeilisearchClient();
    }

    return MeilisearchClient.instance;
  }

  public getIndex(index: string): Index {
    return this.client.index(index);
  }

  public createIndex(index: string) {
    return this.client.createIndex(index);
  }

  public async waitForTaskCompletion(taskUid, timeout = 5_000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const task = await this.client.getTask(taskUid);
      if (task.status === "succeeded") return task;
      if (task.status === "failed")
        throw new Error(task.error?.message || "Task failed");
      await new Promise((req) => setTimeout(req, 100));
    }
    throw new Error("Task timed out");
  }
}

export const meilisearchClient = MeilisearchClient.getInstance();

// userpfp
// discord name
// riot ign
// tier
// status
// franchise | team
// mmr
