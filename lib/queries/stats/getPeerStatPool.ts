import { cache } from "react";
import { GameType, Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { determineTierWithTierLines, type MmrTierLines } from "@/lib/common/tier";
import {
  aggregateStats,
  derivePrimaryRole,
  toPeerStats,
  toStatRows,
  type PeerRow,
  type RawStatRow,
} from "@/lib/common/indepth";
import type { AgentCatalog } from "@/lib/queries/agents/getAgentCatalog";

export const getPeerStatPool = cache(
  async (args: {
    gameType: GameType;
    catalog: AgentCatalog;
    tierLines: MmrTierLines;
    season?: number;
  }): Promise<PeerRow[]> => {
    const rows = await prisma.playerStats.findMany({
      where: {
        Game: {
          gameType: args.gameType,
          ...(args.season !== undefined ? { season: args.season } : {}),
        },
      },
      select: {
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
    });

    const rowsByUser = new Map<string, RawStatRow[]>();
    for (const row of rows) {
      const { userID, ...statRow } = row;
      const userRows = rowsByUser.get(userID) ?? [];
      userRows.push(statRow);
      rowsByUser.set(userID, userRows);
    }

    const userIds = Array.from(rowsByUser.keys());
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
    for (const [userId, rawRows] of rowsByUser) {
      const statRows = toStatRows(rawRows, args.catalog);
      const agg = aggregateStats(statRows);
      const userInfo = userInfoById.get(userId);
      const mmr = userInfo?.PrimaryRiotAccount?.MMR?.mmrEffective ?? null;
      const tier: Tier | null = determineTierWithTierLines(mmr, args.tierLines);
      pool.push({
        userId,
        ign: userInfo?.PrimaryRiotAccount?.riotIGN ?? null,
        primaryRole: derivePrimaryRole(statRows),
        tier,
        games: agg.games,
        stats: toPeerStats(agg),
      });
    }
    return pool;
  },
);
