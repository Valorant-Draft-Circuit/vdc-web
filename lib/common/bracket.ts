import { MatchType } from "@prisma/client";

export type BracketTeam = {
  id: number;
  seed: number;
  name: string;
  franchiseSlug: string;
  logo: string | null;
};

export type SeriesSide = {
  team: BracketTeam;
  score: number;
  isWinner: boolean;
};

export type SeriesSlot = {
  kind: "series";
  matchId: number | null;
  matchType: MatchType;
  home: SeriesSide;
  away: SeriesSide;
  status: "complete" | "live" | "scheduled";
};

export type ByeSlot = { kind: "bye"; team: BracketTeam | null };
export type TbdSlot = { kind: "tbd"; home?: BracketTeam; away?: BracketTeam };
export type Slot = SeriesSlot | ByeSlot | TbdSlot;

export type Round = {
  label: string;
  matchType: MatchType;
  slots: Slot[];
  feeders: Array<[number, number] | null>;
};

export type Bracket = {
  rounds: Round[];
  isInferable: boolean;
  seeded: boolean;
};

export type PlayoffMatchInput = {
  matchId: number;
  matchType: MatchType;
  matchDay: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number;
  awayScore: number;
};

type StructureSlot =
  | { type: "bye"; seed: number }
  | { type: "seeds"; seeds: [number, number] }
  | { type: "feeders"; feeders: [number, number] };

const BRACKET_STRUCTURES: Record<number, StructureSlot[][]> = {
  4: [
    [
      { type: "seeds", seeds: [1, 4] },
      { type: "seeds", seeds: [2, 3] },
    ],
    [{ type: "feeders", feeders: [0, 1] }],
  ],
  6: [
    [
      { type: "bye", seed: 1 },
      { type: "seeds", seeds: [4, 5] },
      { type: "bye", seed: 2 },
      { type: "seeds", seeds: [3, 6] },
    ],
    [
      { type: "feeders", feeders: [0, 1] },
      { type: "feeders", feeders: [2, 3] },
    ],
    [{ type: "feeders", feeders: [0, 1] }],
  ],
  8: [
    [
      { type: "seeds", seeds: [1, 8] },
      { type: "seeds", seeds: [4, 5] },
      { type: "seeds", seeds: [3, 6] },
      { type: "seeds", seeds: [2, 7] },
    ],
    [
      { type: "feeders", feeders: [0, 1] },
      { type: "feeders", feeders: [2, 3] },
    ],
    [{ type: "feeders", feeders: [0, 1] }],
  ],
  10: [
    [
      { type: "bye", seed: 1 },
      { type: "seeds", seeds: [7, 10] },
      { type: "bye", seed: 2 },
      { type: "seeds", seeds: [8, 9] },
    ],
    [
      { type: "feeders", feeders: [0, 1] },
      { type: "seeds", seeds: [4, 5] },
      { type: "feeders", feeders: [2, 3] },
      { type: "seeds", seeds: [3, 6] },
    ],
    [
      { type: "feeders", feeders: [0, 1] },
      { type: "feeders", feeders: [2, 3] },
    ],
    [{ type: "feeders", feeders: [0, 1] }],
  ],
};

function clinchCount(matchType: MatchType): number {
  return matchType === MatchType.BO5 ? 3 : 2;
}

function roundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${roundIndex + 1}`;
}

function pairKey(a: number, b: number): string {
  return [a, b].sort((x, y) => x - y).join("-");
}

function buildSeriesSlot(
  home: BracketTeam,
  away: BracketTeam,
  match: PlayoffMatchInput | null,
): SeriesSlot {
  const matchType = match?.matchType ?? MatchType.BO3;
  const homeScore = match?.homeScore ?? 0;
  const awayScore = match?.awayScore ?? 0;
  const clinch = clinchCount(matchType);
  const homeWon = homeScore >= clinch;
  const awayWon = awayScore >= clinch;
  const status: SeriesSlot["status"] =
    homeWon || awayWon
      ? "complete"
      : homeScore + awayScore > 0
        ? "live"
        : "scheduled";

  return {
    kind: "series",
    matchId: match?.matchId ?? null,
    matchType,
    home: { team: home, score: homeScore, isWinner: homeWon },
    away: { team: away, score: awayScore, isWinner: awayWon },
    status,
  };
}

function seriesFromMatch(
  match: PlayoffMatchInput,
  teamById: Map<number, BracketTeam>,
): SeriesSlot {
  const home = teamById.get(match.homeTeamId as number)!;
  const away = teamById.get(match.awayTeamId as number)!;
  return buildSeriesSlot(home, away, match);
}

function hasBothTeams(
  match: PlayoffMatchInput,
  teamById: Map<number, BracketTeam>,
): boolean {
  return (
    match.homeTeamId != null &&
    match.awayTeamId != null &&
    teamById.has(match.homeTeamId) &&
    teamById.has(match.awayTeamId)
  );
}

function participantOf(slot: Slot): BracketTeam | undefined {
  if (slot.kind === "bye") {
    return slot.team ?? undefined;
  }
  if (slot.kind === "series") {
    if (slot.home.isWinner) return slot.home.team;
    if (slot.away.isWinner) return slot.away.team;
  }
  return undefined;
}

function buildStructuredRounds(
  participants: BracketTeam[],
  matches: PlayoffMatchInput[],
  structure: StructureSlot[][],
  teamById: Map<number, BracketTeam>,
): Round[] {
  const teamBySeed = (seed: number) => participants[seed - 1];

  const matchesByDay = [...matches].sort(
    (a, b) => (a.matchDay ?? Infinity) - (b.matchDay ?? Infinity),
  );

  const matchByPair = new Map<string, PlayoffMatchInput>();
  for (const m of matchesByDay) {
    if (!hasBothTeams(m, teamById)) {
      continue;
    }
    const key = pairKey(m.homeTeamId as number, m.awayTeamId as number);
    if (!matchByPair.has(key)) {
      matchByPair.set(key, m);
    }
  }

  const usedMatchIds = new Set<number>();
  const takePairMatch = (home: BracketTeam, away: BracketTeam) => {
    const m = matchByPair.get(pairKey(home.id, away.id));
    if (!m || usedMatchIds.has(m.matchId)) {
      return null;
    }
    usedMatchIds.add(m.matchId);
    return m;
  };
  const buildSeededSeries = (seeds: [number, number]): SeriesSlot => {
    const home = teamBySeed(seeds[0]);
    const away = teamBySeed(seeds[1]);
    return buildSeriesSlot(home, away, takePairMatch(home, away));
  };

  const seededSeriesBySlot = new Map<string, SeriesSlot>();
  structure.forEach((roundDef, r) => {
    roundDef.forEach((item, i) => {
      if (item.type === "seeds") {
        seededSeriesBySlot.set(`${r}:${i}`, buildSeededSeries(item.seeds));
      }
    });
  });

  const sequentialMatches = matchesByDay.filter((m) =>
    hasBothTeams(m, teamById),
  );
  let sequentialIndex = 0;
  const takeNextSequential = () => {
    while (sequentialIndex < sequentialMatches.length) {
      const m = sequentialMatches[sequentialIndex];
      sequentialIndex++;
      if (!usedMatchIds.has(m.matchId)) {
        usedMatchIds.add(m.matchId);
        return m;
      }
    }
    return null;
  };

  const rounds: Round[] = [];
  structure.forEach((roundDef, r) => {
    const slots: Slot[] = [];
    const feeders: Array<[number, number] | null> = [];
    roundDef.forEach((item, i) => {
      if (item.type === "bye") {
        slots.push({ kind: "bye", team: teamBySeed(item.seed) });
        feeders.push(null);
        return;
      }
      if (item.type === "seeds") {
        slots.push(seededSeriesBySlot.get(`${r}:${i}`)!);
        feeders.push(null);
        return;
      }
      feeders.push(item.feeders);
      const prev = rounds[r - 1];
      const home = participantOf(prev.slots[item.feeders[0]]);
      const away = participantOf(prev.slots[item.feeders[1]]);
      const pairMatch = home && away ? takePairMatch(home, away) : null;
      const match = pairMatch ?? takeNextSequential();
      if (match) {
        slots.push(seriesFromMatch(match, teamById));
      } else {
        slots.push({ kind: "tbd", home, away });
      }
    });
    rounds.push({
      label: roundLabel(r, structure.length),
      matchType: r === structure.length - 1 ? MatchType.BO5 : MatchType.BO3,
      slots,
      feeders,
    });
  });
  return rounds;
}

function buildFallbackRounds(
  matches: PlayoffMatchInput[],
  teamById: Map<number, BracketTeam>,
): Round[] {
  const withTeams = matches.filter((m) => hasBothTeams(m, teamById));
  const days = Array.from(
    new Set(withTeams.map((m) => m.matchDay ?? Infinity)),
  ).sort((a, b) => a - b);

  return days.map((day, i) => {
    const dayMatches = withTeams.filter((m) => (m.matchDay ?? Infinity) === day);
    return {
      label: roundLabel(i, days.length),
      matchType: dayMatches[0]?.matchType ?? MatchType.BO3,
      slots: dayMatches.map((m) => seriesFromMatch(m, teamById)),
      feeders: dayMatches.map(() => null),
    };
  });
}

export function buildBracket(
  seededTeams: BracketTeam[],
  matches: PlayoffMatchInput[],
  playoffTeamCount: number,
): Bracket {
  if (seededTeams.length === 0) {
    return { rounds: [], isInferable: false, seeded: false };
  }

  const teamById = new Map(seededTeams.map((t) => [t.id, t]));
  const structure = BRACKET_STRUCTURES[playoffTeamCount];
  const isInferable =
    structure !== undefined && seededTeams.length >= playoffTeamCount;

  if (isInferable) {
    const participants = seededTeams.slice(0, playoffTeamCount);
    return {
      rounds: buildStructuredRounds(participants, matches, structure, teamById),
      isInferable: true,
      seeded: true,
    };
  }

  return {
    rounds: buildFallbackRounds(matches, teamById),
    isInferable: false,
    seeded: true,
  };
}

export function buildEmptyBracket(playoffTeamCount: number): Bracket {
  const structure = BRACKET_STRUCTURES[playoffTeamCount];
  if (!structure) {
    return { rounds: [], isInferable: false, seeded: false };
  }
  const rounds: Round[] = structure.map((roundDef, r) => ({
    label: roundLabel(r, structure.length),
    matchType: r === structure.length - 1 ? MatchType.BO5 : MatchType.BO3,
    slots: roundDef.map((item): Slot => {
      if (item.type === "bye") {
        return { kind: "bye", team: null };
      }
      return { kind: "tbd" };
    }),
    feeders: roundDef.map((item) =>
      item.type === "feeders" ? item.feeders : null,
    ),
  }));
  return { rounds, isInferable: true, seeded: false };
}
