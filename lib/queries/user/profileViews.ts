import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { days } from "@/lib/common/times";

const PROFILE_VIEW_DEDUP_WINDOW_MS = days(1) * 1000;

export const getProfileViewCount = cache(
  async (profileUserID: string): Promise<number> => {
    return prisma.profileView.count({ where: { profileUserID } });
  },
);

export async function recordProfileViewIfNew({
  profileUserID,
  viewerUserID,
}: {
  profileUserID: string;
  viewerUserID: string;
}): Promise<void> {
  const dedupWindowStart = new Date(Date.now() - PROFILE_VIEW_DEDUP_WINDOW_MS);
  const viewWithinWindow = await prisma.profileView.findFirst({
    where: {
      profileUserID,
      viewerUserID,
      viewedAt: { gt: dedupWindowStart },
    },
    select: { id: true },
  });
  if (viewWithinWindow) return;

  await prisma.profileView.create({ data: { profileUserID, viewerUserID } });
}
