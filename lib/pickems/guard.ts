import { redirect } from "next/navigation";

import { getPickemEnabled } from "@/lib/queries/pickems/getAdvanceBoard";

export const PICKEM_FIRST_SEASON = 10;

export async function requirePickemsEnabled(): Promise<void> {
  const enabled = await getPickemEnabled();
  if (!enabled) {
    redirect("/pickems/about");
  }
}
