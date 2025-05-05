import { asc, eq } from "drizzle-orm";
import { faq } from "@/drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";

export async function getFaq() {
  const db = drizzle({ connection: { uri: process.env.DATABASE_URL } });
  try {
    return await db
      .select()
      .from(faq)
      .where(eq(faq.visible, 1))
      .orderBy(asc(faq.id));
  } catch (err) {
    console.error("Failed to get FAQ:", err);
    return [];
  }
}
