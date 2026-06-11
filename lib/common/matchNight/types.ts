import { Tier } from "@prisma/client";

export type RecapViewKey = Tier | "OVERALL";
export type RecapStat = "rating" | "acs" | "kd";

export type NightStatRow = {
  userID: string;
  playerName: string;
  tier: Tier;
  gameID: string;
  map: string | null;
  matchID: number | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
  ratingAttack: number | null;
  ratingDefense: number | null;
  acs: number | null;
  kills: number | null;
  deaths: number | null;
};

export type RecapPerformerGame = {
  gameID: string;
  map: string | null;
  matchID: number | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
  rating: number | null;
  acs: number;
  kd: number;
};

export type RecapPerformer = {
  playerName: string;
  tier: Tier;
  gamesPlayed: number;
  games: RecapPerformerGame[];
  rating: number | null;
  acs: number;
  kd: number;
};

export type RecapMapGame = {
  tier: Tier;
  matchID: number | null;
  gameID: string | null;
  homeTeamName: string | null;
  homeTeamLogo: string | null;
  awayTeamName: string | null;
  awayTeamLogo: string | null;
};

export type RecapMapEntry = {
  map: string | null;
  game: RecapMapGame;
};

export type RecapMapCount = {
  map: string;
  count: number;
  share: number;
  games: RecapMapGame[];
};

export type RecapMapReport = {
  mostPlayed: RecapMapCount | null;
  mostBanned: RecapMapCount | null;
};

export type RecapMover = {
  teamName: string;
  franchiseSlug: string;
  teamLogo: string | null;
  tier: Tier;
  previousRank: number;
  currentRank: number;
  delta: number;
};

export type RecapView = {
  key: RecapViewKey;
  matchDay: number | null;
  nightDateLabel: string | null;
  performers: RecapPerformer[];
  mapReport: RecapMapReport;
  movers: RecapMover[];
};
