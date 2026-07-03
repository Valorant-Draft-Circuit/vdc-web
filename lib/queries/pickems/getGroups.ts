import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type GroupSummary = {
  id: number;
  name: string;
  image: string;
  season: number;
  joinCode: string;
  isOwner: boolean;
  ownerName: string;
  memberCount: number;
};

export const getMyGroups = cache(
  async (userId: string, season: number): Promise<GroupSummary[]> => {
    const memberships = await prisma.pickemGroupMember.findMany({
      where: { userID: userId, Group: { season } },
      select: {
        Group: {
          select: {
            id: true,
            name: true,
            image: true,
            season: true,
            joinCode: true,
            ownerID: true,
            Owner: { select: { name: true } },
            _count: { select: { Members: true } },
          },
        },
      },
    });
    return memberships.map((m) => ({
      id: m.Group.id,
      name: m.Group.name,
      image: m.Group.image,
      season: m.Group.season,
      joinCode: m.Group.joinCode,
      isOwner: m.Group.ownerID === userId,
      ownerName: m.Group.Owner?.name ?? "Unknown",
      memberCount: m.Group._count.Members,
    }));
  },
);

export const getGroup = cache(async (groupId: number) => {
  return prisma.pickemGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      image: true,
      season: true,
      ownerID: true,
      Owner: { select: { name: true } },
    },
  });
});
