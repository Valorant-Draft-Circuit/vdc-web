"use server";

import { auth } from "@/lib/auth/auth";
import { recordProfileViewIfNew } from "@/lib/queries/user/profileViews";

export async function recordProfileView(profileUserID: string): Promise<void> {
  const session = await auth();
  const viewerUserID = session?.user?.id;
  if (!viewerUserID) return;
  if (viewerUserID === profileUserID) return;

  await recordProfileViewIfNew({ profileUserID, viewerUserID });
}
