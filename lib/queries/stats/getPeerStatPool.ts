import { cache } from "react";
import { GameType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { determineTierWithTierLines, type MmrTierLines } from "@/lib/common/tier";
import {
  createRoleCounts,
  createStatAccumulator,
  finalizeAggregatedStats,
  pickPrimaryRole,
  toPeerStats,
  toStatRows,
  foldStatRow,
  type PeerRow,
  type RoleCounts,
  type StatAccumulator,
} from "@/lib/common/indepth";
import type { AgentCatalog } from "@/lib/queries/agents/getAgentCatalog";

const SCAN_CHUNK_SIZE = 5000;

type UserAccumulator = {
  stats: StatAccumulator;
  roles: RoleCounts;
};

export const getPeerStatPool = cache(
  async (args: {
    gameType: GameType;
    catalog: AgentCatalog;
    tierLines: MmrTierLines;
    season?: number;
  }): Promise<PeerRow[]> => {
    const accByUser = new Map<string, UserAccumulator>();
    let cursorId: number | undefined;

    while (true) {
      const rows = await prisma.playerStats.findMany({
        where: {
          Game: {
            gameType: args.gameType,
            ...(args.season !== undefined ? { season: args.season } : {}),
          },
        },
        select: {
          id: true,
          userID: true,
          agent: true,
          team: true,
          ratingAttack: true,
          ratingDefense: true,
          acs: true,
          kast: true,
          hsPercent: true,
          kills: true,
          deaths: true,
          assists: true,
          firstKills: true,
          firstDeaths: true,
          plants: true,
          defuses: true,
          tradeKills: true,
          tradeDeaths: true,
          ecoKills: true,
          antiEcoKills: true,
          clutches: true,
          damage: true,
          Game: {
            select: {
              season: true,
              datePlayed: true,
              tier: true,
              winner: true,
              rounds: true,
            },
          },
        },
        orderBy: { id: "asc" },
        take: SCAN_CHUNK_SIZE,
        ...(cursorId !== undefined
          ? { cursor: { id: cursorId }, skip: 1 }
          : {}),
      });
      if (rows.length === 0) break;
      cursorId = rows[rows.length - 1].id;

      const statRows = toStatRows(rows, args.catalog);
      for (let index = 0; index < rows.length; index++) {
        const userId = rows[index].userID;
        const statRow = statRows[index];
        let userAcc = accByUser.get(userId);
        if (!userAcc) {
          userAcc = { stats: createStatAccumulator(), roles: createRoleCounts() };
          accByUser.set(userId, userAcc);
        }
        foldStatRow(userAcc.stats, statRow);
        if (statRow.role) userAcc.roles[statRow.role] += 1;
      }

      if (rows.length < SCAN_CHUNK_SIZE) break;
    }

    const userIds = Array.from(accByUser.keys());
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        PrimaryRiotAccount: {
          select: {
            riotIGN: true,
            MMR: { select: { mmrEffective: true } },
          },
        },
      },
    });
    const userInfoById = new Map(users.map((user) => [user.id, user]));

    const pool: PeerRow[] = [];
    for (const [userId, userAcc] of accByUser) {
      const agg = finalizeAggregatedStats(userAcc.stats);
      const userInfo = userInfoById.get(userId);
      const mmr = userInfo?.PrimaryRiotAccount?.MMR?.mmrEffective ?? null;
      const tier: Tier | null = determineTierWithTierLines(mmr, args.tierLines);
      pool.push({
        userId,
        ign: userInfo?.PrimaryRiotAccount?.riotIGN ?? null,
        primaryRole: pickPrimaryRole(userAcc.roles),
        tier,
        games: agg.games,
        stats: toPeerStats(agg),
      });
    }
    return pool;
  },
);
