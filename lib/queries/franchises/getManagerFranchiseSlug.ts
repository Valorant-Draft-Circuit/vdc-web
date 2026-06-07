import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getManagerFranchiseSlug = cache(async (userId: string) => {
  const res = await prisma.franchise.findFirst({
    where: {
      OR: [
        { gmID: userId },
        { agm1ID: userId },
        { agm2ID: userId },
        { agm3ID: userId },
      ],
    },
    select: { slug: true },
  });
  return res?.slug;
});
