import { redirect } from "next/navigation";

import { getPickemEnabled } from "@/lib/queries/pickems/getAdvanceBoard";

export async function requirePickemsEnabled(): Promise<void> {
  const enabled = await getPickemEnabled();
  if (!enabled) {
    redirect("/pickems/about");
  }
}
