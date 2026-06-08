import { cache } from "react";
import { GameType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeAgentName } from "@/lib/common/agents";
import type {
  AgentCatalog,
  AgentCatalogEntry,
} from "@/lib/queries/agents/getAgentCatalog";

export type BestGameRef = {
  gameID: string;
  matchID: number;
  map: string | null;
  acs: number;
  kills: number;
  deaths: number;
  playerTeamId: number | null;
  home: number | null;
  away: number | null;
  homeRoundsWon: number;
  awayRoundsWon: number;
  datePlayed: Date;
};

export type PlayerAgentBreakdown = {
  agent: string;
  catalog: AgentCatalogEntry | null;
  gamesPlayed: number;
  wins: number;
  rounds: number;
  roundsWon: number;
  totals: {
    kills: number;
    deaths: number;
    assists: number;
    firstKills: number;
    firstDeaths: number;
    clutches: number;
    damage: number;
  };
  averages: {
    acs: number;
    kast: number;
    hsPercent: number;
    ratingAttack: number;
    ratingDefense: number;
  };
  bestGame: BestGameRef | null;
};

type AccTotals = PlayerAgentBreakdown["totals"];
type AccAverages = PlayerAgentBreakdown["averages"];

type Accumulator = {
  agent: string;
  gamesPlayed: number;
  wins: number;
  rounds: number;
  roundsWon: number;
  totals: AccTotals;
  averageSums: AccAverages;
  averageCounts: Record<keyof AccAverages, number>;
  bestGame: BestGameRef | null;
};

function emptyAccumulator(agent: string): Accumulator {
  return {
    agent,
    gamesPlayed: 0,
    wins: 0,
    rounds: 0,
    roundsWon: 0,
    totals: {
      kills: 0, deaths: 0, assists: 0,
      firstKills: 0, firstDeaths: 0,
      clutches: 0, damage: 0,
    },
    averageSums: {
      acs: 0, kast: 0, hsPercent: 0,
      ratingAttack: 0, ratingDefense: 0,
    },
    averageCounts: {
      acs: 0, kast: 0, hsPercent: 0,
      ratingAttack: 0, ratingDefense: 0,
    },
    bestGame: null,
  };
}

function isBetterBest(candidate: BestGameRef, current: BestGameRef | null): boolean {
  if (!current) return true;
  if (candidate.acs !== current.acs) return candidate.acs > current.acs;
  if (candidate.kills !== current.kills) return candidate.kills > current.kills;
  return candidate.datePlayed > current.datePlayed;
}

export const getPlayerAgentBreakdown = cache(
  async (args: {
    riotIgn: string;
    season: number;
    gameType: GameType;
    catalog: AgentCatalog;
  }): Promise<PlayerAgentBreakdown[]> => {
    const account = await prisma.account.findFirst({
      where: { riotIGN: args.riotIgn },
      select: { userId: true },
    });
    if (!account) return [];

    const rows = await prisma.playerStats.findMany({
      where: {
        userID: account.userId,
        Game: { season: args.season, gameType: args.gameType },
      },
      select: {
        team: true,
        agent: true,
        kills: true,
        deaths: true,
        assists: true,
        firstKills: true,
        firstDeaths: true,
        clutches: true,
        damage: true,
        acs: true,
        kast: true,
        hsPercent: true,
        ratingAttack: true,
        ratingDefense: true,
        Game: {
          select: {
            gameID: true,
            map: true,
            winner: true,
            rounds: true,
            roundsWonHome: true,
            roundsWonAway: true,
            datePlayed: true,
            Match: { select: { matchID: true, home: true, away: true } },
          },
        },
      },
    });

    const byAgent = new Map<string, Accumulator>();

    for (const r of rows) {
      if (!r.agent) continue;
      const agentKey = normalizeAgentName(r.agent);
      const acc = byAgent.get(agentKey) ?? emptyAccumulator(agentKey);

      acc.gamesPlayed += 1;
      if (r.team !== null && r.team === r.Game.winner) acc.wins += 1;
      acc.rounds += r.Game.rounds;
      const playerWonRounds =
        r.team !== null && r.Game.Match?.home === r.team
          ? r.Game.roundsWonHome
          : r.team !== null && r.Game.Match?.away === r.team
          ? r.Game.roundsWonAway
          : 0;
      acc.roundsWon += playerWonRounds;

      acc.totals.kills += r.kills ?? 0;
      acc.totals.deaths += r.deaths ?? 0;
      acc.totals.assists += r.assists ?? 0;
      acc.totals.firstKills += r.firstKills ?? 0;
      acc.totals.firstDeaths += r.firstDeaths ?? 0;
      acc.totals.clutches += r.clutches ?? 0;
      acc.totals.damage += r.damage ?? 0;

      const addToAverage = (key: keyof AccAverages, value: number | null) => {
        if (value === null) return;
        acc.averageSums[key] += value;
        acc.averageCounts[key] += 1;
      };
      addToAverage("acs", r.acs);
      addToAverage("kast", r.kast);
      addToAverage("hsPercent", r.hsPercent);
      addToAverage("ratingAttack", r.ratingAttack);
      addToAverage("ratingDefense", r.ratingDefense);

      if (r.Game.Match && r.acs !== null) {
        const candidate: BestGameRef = {
          gameID: r.Game.gameID,
          matchID: r.Game.Match.matchID,
          map: r.Game.map,
          acs: r.acs,
          kills: r.kills ?? 0,
          deaths: r.deaths ?? 0,
          playerTeamId: r.team,
          home: r.Game.Match.home,
          away: r.Game.Match.away,
          homeRoundsWon: r.Game.roundsWonHome,
          awayRoundsWon: r.Game.roundsWonAway,
          datePlayed: r.Game.datePlayed,
        };
        if (isBetterBest(candidate, acc.bestGame)) acc.bestGame = candidate;
      }

      byAgent.set(agentKey, acc);
    }

    const result: PlayerAgentBreakdown[] = [];
    for (const acc of byAgent.values()) {
      const mean = (sum: number, count: number) => (count === 0 ? 0 : sum / count);
      result.push({
        agent: acc.agent,
        catalog: args.catalog[acc.agent] ?? null,
        gamesPlayed: acc.gamesPlayed,
        wins: acc.wins,
        rounds: acc.rounds,
        roundsWon: acc.roundsWon,
        totals: acc.totals,
        averages: {
          acs: mean(acc.averageSums.acs, acc.averageCounts.acs),
          kast: mean(acc.averageSums.kast, acc.averageCounts.kast),
          hsPercent: mean(acc.averageSums.hsPercent, acc.averageCounts.hsPercent),
          ratingAttack: mean(
            acc.averageSums.ratingAttack,
            acc.averageCounts.ratingAttack,
          ),
          ratingDefense: mean(
            acc.averageSums.ratingDefense,
            acc.averageCounts.ratingDefense,
          ),
        },
        bestGame: acc.bestGame,
      });
    }

    result.sort((a, b) => {
      if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
      return b.averages.acs - a.averages.acs;
    });

    return result;
  },
);
