import { cache } from "react";
import { Tier } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getLeaderboard } from "./getLeaderboard";

export type GroupLeaderRow = {
  groupId: number;
  name: string;
  image: string;
  averagePoints: number;
  participantCount: number;
  memberCount: number;
  totalPoints: number;
};

export const getGroupLeaderboard = cache(
  async (season: number, tier: Tier | null): Promise<GroupLeaderRow[]> => {
    const globalRows = await getLeaderboard(season, tier, { kind: "global" });
    const pointsByUser = new Map<string, number>();
    for (const row of globalRows) {
      pointsByUser.set(row.userId, row.points);
    }

    const groups = await prisma.pickemGroup.findMany({
      where: { season },
      select: {
        id: true,
        name: true,
        image: true,
        Members: { select: { userID: true } },
      },
    });

    const rows: GroupLeaderRow[] = groups.map((group) => {
      let totalPoints = 0;
      let participantCount = 0;
      for (const member of group.Members) {
        const memberPoints = pointsByUser.get(member.userID);
        if (memberPoints === undefined) {
          continue;
        }
        totalPoints += memberPoints;
        participantCount += 1;
      }
      const averagePoints =
        participantCount > 0 ? totalPoints / participantCount : 0;
      return {
        groupId: group.id,
        name: group.name,
        image: group.image,
        averagePoints,
        participantCount,
        memberCount: group.Members.length,
        totalPoints,
      };
    });

    rows.sort((a, b) => {
      if (b.averagePoints !== a.averagePoints) {
        return b.averagePoints - a.averagePoints;
      }
      return b.totalPoints - a.totalPoints;
    });
    return rows;
  },
);
