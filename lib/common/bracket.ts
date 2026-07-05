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
      { type: "seeds", seeds: [4, 9] },
      { type: "seeds", seeds: [5, 8] },
      { type: "seeds", seeds: [3, 10] },
      { type: "seeds", seeds: [6, 7] },
    ],
    [
      { type: "bye", seed: 1 },
      { type: "feeders", feeders: [0, 1] },
      { type: "bye", seed: 2 },
      { type: "feeders", feeders: [2, 3] },
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

  const matchByPair = new Map<string, PlayoffMatchInput>();
  for (const m of matches) {
    if (hasBothTeams(m, teamById)) {
      matchByPair.set(pairKey(m.homeTeamId as number, m.awayTeamId as number), m);
    }
  }

  const usedMatchIds = new Set<number>();
  const firstRoundSlots: Slot[] = structure[0].map((item) => {
    if (item.type === "bye") {
      return { kind: "bye", team: teamBySeed(item.seed) };
    }
    if (item.type !== "seeds") {
      return { kind: "tbd" };
    }
    const seedHome = teamBySeed(item.seeds[0]);
    const seedAway = teamBySeed(item.seeds[1]);
    const m = matchByPair.get(pairKey(seedHome.id, seedAway.id)) ?? null;
    if (m) {
      usedMatchIds.add(m.matchId);
      return seriesFromMatch(m, teamById);
    }
    return buildSeriesSlot(seedHome, seedAway, null);
  });

  const remaining = matches
    .filter((m) => !usedMatchIds.has(m.matchId) && hasBothTeams(m, teamById))
    .sort((a, b) => (a.matchDay ?? Infinity) - (b.matchDay ?? Infinity));
  let remainingIndex = 0;

  const rounds: Round[] = [
    {
      label: "",
      matchType: MatchType.BO3,
      slots: firstRoundSlots,
      feeders: structure[0].map(() => null),
    },
  ];

  for (let r = 1; r < structure.length; r++) {
    const slots: Slot[] = [];
    const feeders: Array<[number, number] | null> = [];
    for (const item of structure[r]) {
      if (item.type === "bye") {
        slots.push({ kind: "bye", team: teamBySeed(item.seed) });
        feeders.push(null);
        continue;
      }
      if (item.type !== "feeders") {
        continue;
      }
      feeders.push(item.feeders);
      const m = remaining[remainingIndex];
      if (m) {
        slots.push(seriesFromMatch(m, teamById));
        remainingIndex++;
      } else {
        const prev = rounds[r - 1];
        slots.push({
          kind: "tbd",
          home: participantOf(prev.slots[item.feeders[0]]),
          away: participantOf(prev.slots[item.feeders[1]]),
        });
      }
    }
    rounds.push({ label: "", matchType: MatchType.BO3, slots, feeders });
  }

  rounds.forEach((round, i) => {
    round.label = roundLabel(i, structure.length);
    round.matchType = i === structure.length - 1 ? MatchType.BO5 : MatchType.BO3;
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
