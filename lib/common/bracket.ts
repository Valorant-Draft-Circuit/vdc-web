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

export type ByeSlot = { kind: "bye"; team: BracketTeam };
export type TbdSlot = { kind: "tbd" };
export type Slot = SeriesSlot | ByeSlot | TbdSlot;

export type Round = { label: string; matchType: MatchType; slots: Slot[] };
export type Bracket = { rounds: Round[]; isInferable: boolean };

export type PlayoffMatchInput = {
  matchId: number;
  matchType: MatchType;
  matchDay: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number;
  awayScore: number;
};

type FirstRoundItem =
  | { type: "bye"; seed: number }
  | { type: "match"; seeds: [number, number] };

// Ordered for adjacency: each next-round slot is fed by two consecutive items.
const FIRST_ROUND_LAYOUT: Record<number, FirstRoundItem[]> = {
  4: [
    { type: "match", seeds: [1, 4] },
    { type: "match", seeds: [2, 3] },
  ],
  6: [
    { type: "bye", seed: 1 },
    { type: "match", seeds: [4, 5] },
    { type: "bye", seed: 2 },
    { type: "match", seeds: [3, 6] },
  ],
  8: [
    { type: "match", seeds: [1, 8] },
    { type: "match", seeds: [4, 5] },
    { type: "match", seeds: [3, 6] },
    { type: "match", seeds: [2, 7] },
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

function buildInferableRounds(
  participants: BracketTeam[],
  matches: PlayoffMatchInput[],
  playoffTeamCount: number,
  teamById: Map<number, BracketTeam>,
): Round[] {
  const layout = FIRST_ROUND_LAYOUT[playoffTeamCount];
  const teamBySeed = (seed: number) => participants[seed - 1];

  const matchByPair = new Map<string, PlayoffMatchInput>();
  for (const m of matches) {
    if (hasBothTeams(m, teamById)) {
      matchByPair.set(pairKey(m.homeTeamId as number, m.awayTeamId as number), m);
    }
  }

  const usedMatchIds = new Set<number>();
  const round1Slots: Slot[] = layout.map((item) => {
    if (item.type === "bye") {
      return { kind: "bye", team: teamBySeed(item.seed) };
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

  const roundSizes: number[] = [];
  let size = layout.length / 2;
  while (size >= 1) {
    roundSizes.push(size);
    size = size / 2;
  }
  const totalRounds = 1 + roundSizes.length;

  const remaining = matches
    .filter((m) => !usedMatchIds.has(m.matchId) && hasBothTeams(m, teamById))
    .sort((a, b) => (a.matchDay ?? Infinity) - (b.matchDay ?? Infinity));

  let idx = 0;
  const laterRounds: Round[] = roundSizes.map((count) => {
    const slots: Slot[] = [];
    for (let s = 0; s < count; s++) {
      const m = remaining[idx];
      if (m) {
        slots.push(seriesFromMatch(m, teamById));
        idx++;
      } else {
        slots.push({ kind: "tbd" });
      }
    }
    return { label: "", matchType: MatchType.BO3, slots };
  });

  const rounds: Round[] = [
    { label: "", matchType: MatchType.BO3, slots: round1Slots },
    ...laterRounds,
  ];
  rounds.forEach((round, i) => {
    round.label = roundLabel(i, totalRounds);
    round.matchType = i === totalRounds - 1 ? MatchType.BO5 : MatchType.BO3;
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
    };
  });
}

export function buildBracket(
  seededTeams: BracketTeam[],
  matches: PlayoffMatchInput[],
  playoffTeamCount: number,
): Bracket {
  if (seededTeams.length === 0) {
    return { rounds: [], isInferable: false };
  }

  const teamById = new Map(seededTeams.map((t) => [t.id, t]));
  const isInferable =
    [4, 6, 8].includes(playoffTeamCount) &&
    seededTeams.length >= playoffTeamCount;

  if (isInferable) {
    const participants = seededTeams.slice(0, playoffTeamCount);
    return {
      rounds: buildInferableRounds(
        participants,
        matches,
        playoffTeamCount,
        teamById,
      ),
      isInferable: true,
    };
  }

  return {
    rounds: buildFallbackRounds(matches, teamById),
    isInferable: false,
  };
}
