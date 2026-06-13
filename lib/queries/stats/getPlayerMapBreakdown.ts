import { cache } from "react";
import { GameType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PlayerMapBreakdown = {
  map: string;
  gamesPlayed: number;
  wins: number;
  rounds: number;
  roundsWon: number;
  totals: {
    kills: number;
    deaths: number;
    assists: number;
  };
  averages: {
    acs: number;
    kast: number;
    hsPercent: number;
    ratingAttack: number;
    ratingDefense: number;
  };
};

type AccTotals = PlayerMapBreakdown["totals"];
type AccAverages = PlayerMapBreakdown["averages"];

type Accumulator = {
  map: string;
  gamesPlayed: number;
  wins: number;
  rounds: number;
  roundsWon: number;
  totals: AccTotals;
  averageSums: AccAverages;
  averageCounts: Record<keyof AccAverages, number>;
};

function emptyAccumulator(map: string): Accumulator {
  return {
    map,
    gamesPlayed: 0,
    wins: 0,
    rounds: 0,
    roundsWon: 0,
    totals: { kills: 0, deaths: 0, assists: 0 },
    averageSums: { acs: 0, kast: 0, hsPercent: 0, ratingAttack: 0, ratingDefense: 0 },
    averageCounts: { acs: 0, kast: 0, hsPercent: 0, ratingAttack: 0, ratingDefense: 0 },
  };
}

export const getPlayerMapBreakdown = cache(
  async (args: {
    riotIgn: string;
    season: number;
    gameType: GameType;
  }): Promise<PlayerMapBreakdown[]> => {
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
        kills: true,
        deaths: true,
        assists: true,
        acs: true,
        kast: true,
        hsPercent: true,
        ratingAttack: true,
        ratingDefense: true,
        Game: {
          select: {
            map: true,
            winner: true,
            rounds: true,
            roundsWonHome: true,
            roundsWonAway: true,
            Match: { select: { home: true, away: true } },
          },
        },
      },
    });

    const byMap = new Map<string, Accumulator>();

    for (const r of rows) {
      const map = r.Game.map?.trim();
      if (!map) continue;
      const acc = byMap.get(map) ?? emptyAccumulator(map);

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

      byMap.set(map, acc);
    }

    const mean = (sum: number, count: number) => (count === 0 ? 0 : sum / count);

    const result: PlayerMapBreakdown[] = [];
    for (const acc of byMap.values()) {
      result.push({
        map: acc.map,
        gamesPlayed: acc.gamesPlayed,
        wins: acc.wins,
        rounds: acc.rounds,
        roundsWon: acc.roundsWon,
        totals: acc.totals,
        averages: {
          acs: mean(acc.averageSums.acs, acc.averageCounts.acs),
          kast: mean(acc.averageSums.kast, acc.averageCounts.kast),
          hsPercent: mean(acc.averageSums.hsPercent, acc.averageCounts.hsPercent),
          ratingAttack: mean(acc.averageSums.ratingAttack, acc.averageCounts.ratingAttack),
          ratingDefense: mean(acc.averageSums.ratingDefense, acc.averageCounts.ratingDefense),
        },
      });
    }

    result.sort((a, b) => {
      if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
      const ratingA = (a.averages.ratingAttack + a.averages.ratingDefense) / 2;
      const ratingB = (b.averages.ratingAttack + b.averages.ratingDefense) / 2;
      return ratingB - ratingA;
    });

    return result;
  },
);
