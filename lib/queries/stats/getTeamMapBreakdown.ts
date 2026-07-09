import { cache } from "react";
import { GameType, MapBansSide, MapBanType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { avg } from "@/lib/common/math";
import { normalizeAgentName } from "@/lib/common/agents";
import { AGENTS, AGENTURL } from "@/lib/common/constants/agents";

export type TeamMapAgent = {
  name: string;
  iconUrl: string | null;
};

export type TeamMapBreakdown = {
  map: string;
  played: number;
  wins: number;
  losses: number;
  roundDiff: number | null;
  roundWinPercent: number | null;
  attackRating: number | null;
  defenseRating: number | null;
  pickCount: number;
  banCount: number;
  attackSideChoices: number;
  defenseSideChoices: number;
  agents: TeamMapAgent[];
};

type MapAccumulator = {
  map: string;
  played: number;
  wins: number;
  losses: number;
  roundsWon: number;
  roundsTotal: number;
  attackRatings: number[];
  defenseRatings: number[];
  pickCount: number;
  banCount: number;
  attackSideChoices: number;
  defenseSideChoices: number;
  agentGameCounts: Map<string, number>;
};

const TOP_AGENTS_SHOWN = 5;

export const getTeamMapBreakdown = cache(
  async (teamId: number, season: number): Promise<TeamMapBreakdown[]> => {
    const [games, vetoRows] = await Promise.all([
      prisma.games.findMany({
        where: {
          season: season,
          gameType: GameType.SEASON,
          map: { not: null },
          Match: { is: { OR: [{ home: teamId }, { away: teamId }] } },
        },
        select: {
          map: true,
          winner: true,
          rounds: true,
          roundsWonHome: true,
          roundsWonAway: true,
          Match: { select: { home: true } },
          PlayerStats: {
            where: { team: teamId },
            select: { ratingAttack: true, ratingDefense: true, agent: true },
          },
        },
      }),
      prisma.mapBans.findMany({
        where: {
          map: { not: null },
          Match: {
            is: {
              season: season,
              OR: [{ home: teamId }, { away: teamId }],
            },
          },
        },
        select: { map: true, type: true, team: true, side: true },
      }),
    ]);

    const byMap = new Map<string, MapAccumulator>();
    const accumulatorFor = (mapName: string): MapAccumulator => {
      const key = mapName.toUpperCase();
      const existing = byMap.get(key);
      if (existing) return existing;
      const created: MapAccumulator = {
        map: toDisplayMapName(mapName),
        played: 0,
        wins: 0,
        losses: 0,
        roundsWon: 0,
        roundsTotal: 0,
        attackRatings: [],
        defenseRatings: [],
        pickCount: 0,
        banCount: 0,
        attackSideChoices: 0,
        defenseSideChoices: 0,
        agentGameCounts: new Map<string, number>(),
      };
      byMap.set(key, created);
      return created;
    };

    for (const game of games) {
      if (!game.map) continue;
      const accumulator = accumulatorFor(game.map);
      accumulator.played += 1;
      if (game.winner === teamId) accumulator.wins += 1;
      else if (game.winner !== null) accumulator.losses += 1;
      const isHome = game.Match?.home === teamId;
      accumulator.roundsWon += isHome
        ? game.roundsWonHome
        : game.roundsWonAway;
      accumulator.roundsTotal += game.rounds;
      for (const stat of game.PlayerStats) {
        if (stat.ratingAttack !== null) {
          accumulator.attackRatings.push(stat.ratingAttack);
        }
        if (stat.ratingDefense !== null) {
          accumulator.defenseRatings.push(stat.ratingDefense);
        }
        const agentName = normalizeAgentName(stat.agent);
        accumulator.agentGameCounts.set(
          agentName,
          (accumulator.agentGameCounts.get(agentName) ?? 0) + 1,
        );
      }
    }

    for (const vetoRow of vetoRows) {
      if (!vetoRow.map) continue;
      const accumulator = accumulatorFor(vetoRow.map);
      if (vetoRow.type === MapBanType.BAN && vetoRow.team === teamId) {
        accumulator.banCount += 1;
      }
      if (vetoRow.type === MapBanType.PICK && vetoRow.team === teamId) {
        accumulator.pickCount += 1;
      }
      const isOpponentPickWithSide =
        vetoRow.type === MapBanType.PICK &&
        vetoRow.team !== null &&
        vetoRow.team !== teamId &&
        vetoRow.side !== null;
      if (isOpponentPickWithSide) {
        if (vetoRow.side === MapBansSide.ATTACK) {
          accumulator.attackSideChoices += 1;
        } else {
          accumulator.defenseSideChoices += 1;
        }
      }
    }

    return [...byMap.values()]
      .map((accumulator) => ({
        map: accumulator.map,
        played: accumulator.played,
        wins: accumulator.wins,
        losses: accumulator.losses,
        roundDiff:
          accumulator.roundsTotal > 0
            ? accumulator.roundsWon * 2 - accumulator.roundsTotal
            : null,
        roundWinPercent:
          accumulator.roundsTotal > 0
            ? accumulator.roundsWon / accumulator.roundsTotal
            : null,
        attackRating:
          accumulator.attackRatings.length > 0
            ? avg(accumulator.attackRatings)
            : null,
        defenseRating:
          accumulator.defenseRatings.length > 0
            ? avg(accumulator.defenseRatings)
            : null,
        pickCount: accumulator.pickCount,
        banCount: accumulator.banCount,
        attackSideChoices: accumulator.attackSideChoices,
        defenseSideChoices: accumulator.defenseSideChoices,
        agents: topAgents(accumulator.agentGameCounts),
      }))
      .sort((first, second) => second.played - first.played);
  },
);

function topAgents(agentGameCounts: Map<string, number>): TeamMapAgent[] {
  return [...agentGameCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, TOP_AGENTS_SHOWN)
    .map(([name]) => {
      const agentUuid = AGENTS[name.toUpperCase() as keyof typeof AGENTS];
      return { name, iconUrl: agentUuid ? AGENTURL(agentUuid) : null };
    });
}

export function toDisplayMapName(mapName: string): string {
  return mapName.charAt(0).toUpperCase() + mapName.slice(1).toLowerCase();
}
