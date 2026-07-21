import { MatchType } from "@prisma/client";
import type { LobbyStatRow } from "@/lib/queries/stats/getLobbyStatsForGames";

export function packageMatch(
  match,
  homeWins,
  awayWins,
  formattedDate,
  knockoutType?,
  playoffRound?,
) {
  const homeTeam = match.Home!;
  const awayTeam = match.Away!;
  return {
    id: match.matchID,
    date: formattedDate,
    tier: match.tier,
    homeWins: homeWins,
    awayWins: awayWins,
    matchType: match.matchType,
    knockoutType: knockoutType,
    playoffRound: playoffRound,
    Home: {
      id: homeTeam.id,
      name: homeTeam.name,
      logo: homeTeam.Franchise.Brand?.logo,
      slug: homeTeam.Franchise.slug,
    },
    Away: {
      id: awayTeam.id,
      name: awayTeam.name,
      logo: awayTeam.Franchise.Brand?.logo,
      slug: awayTeam.Franchise.slug,
    },
    Games: match.Games,
  };
}

export function determineIfKnockout(match) {
  if (match.matchType === MatchType.BO3) {
    return "PLAYOFFS";
  } else if (match.matchType === MatchType.BO5) {
    return "GRAND FINALS";
  } else {
    return "";
  }
}

export type StatRank = { rank: number; total: number };

export type MatchStatRanks = {
  rating: StatRank | null;
  acs: StatRank | null;
  adr: StatRank | null;
  hs: StatRank | null;
};

export type RosterEntry = {
  userID: string;
  riotIGN: string | null;
  agent: string;
  isViewedPlayer: boolean;
};

export type LobbyRosters = {
  home: RosterEntry[];
  away: RosterEntry[];
};

export type MatchLobbyContext = {
  ranks: MatchStatRanks;
  rosters: LobbyRosters | null;
  isMvp: boolean;
};

type ScoredPlayer = { userID: string; value: number | null };

function rankWithinLobby(
  players: ScoredPlayer[],
  viewedUserId: string,
): StatRank | null {
  const scored = players.filter((player) => player.value !== null);
  const viewed = scored.find((player) => player.userID === viewedUserId);
  if (!viewed) return null;

  const playersAbove = scored.filter(
    (player) => player.value! > viewed.value!,
  ).length;
  return { rank: playersAbove + 1, total: scored.length };
}

function combinedRating(row: LobbyStatRow): number | null {
  if (row.ratingAttack === null && row.ratingDefense === null) return null;
  return ((row.ratingAttack ?? 0) + (row.ratingDefense ?? 0)) / 2;
}

export function computeLobbyRanks(
  lobbyRows: LobbyStatRow[],
  viewedUserId: string,
): MatchStatRanks {
  const ratingPool = lobbyRows.map((row) => ({
    userID: row.userID,
    value: combinedRating(row),
  }));
  const acsPool = lobbyRows.map((row) => ({
    userID: row.userID,
    value: row.acs,
  }));
  const damagePool = lobbyRows.map((row) => ({
    userID: row.userID,
    value: row.damage,
  }));
  const hsPool = lobbyRows.map((row) => ({
    userID: row.userID,
    value: row.hsPercent,
  }));

  return {
    rating: rankWithinLobby(ratingPool, viewedUserId),
    acs: rankWithinLobby(acsPool, viewedUserId),
    adr: rankWithinLobby(damagePool, viewedUserId),
    hs: rankWithinLobby(hsPool, viewedUserId),
  };
}

export function findLobbyMvp(lobbyRows: LobbyStatRow[]): string | null {
  const averagedPlayers = lobbyRows
    .map((row) => {
      const ranks = computeLobbyRanks(lobbyRows, row.userID);
      const rankValues = [ranks.rating, ranks.acs, ranks.adr]
        .filter((statRank): statRank is StatRank => statRank !== null)
        .map((statRank) => statRank.rank);
      if (rankValues.length === 0) return null;
      const averageRank =
        rankValues.reduce((sum, rank) => sum + rank, 0) / rankValues.length;
      return {
        userID: row.userID,
        averageRank,
        rating: combinedRating(row) ?? 0,
      };
    })
    .filter((player) => player !== null);

  if (averagedPlayers.length === 0) return null;

  const [best] = [...averagedPlayers].sort(
    (a, b) =>
      a.averageRank - b.averageRank ||
      b.rating - a.rating ||
      a.userID.localeCompare(b.userID),
  );
  return best.userID;
}

export function buildLobbyRosters(
  lobbyRows: LobbyStatRow[],
  homeTeamId: number,
  awayTeamId: number,
  viewedUserId: string,
): LobbyRosters {
  const toEntry = (row: LobbyStatRow): RosterEntry => ({
    userID: row.userID,
    riotIGN: row.Player.PrimaryRiotAccount?.riotIGN ?? null,
    agent: row.agent,
    isViewedPlayer: row.userID === viewedUserId,
  });

  const byAcsDescending = (a: LobbyStatRow, b: LobbyStatRow) =>
    (b.acs ?? -1) - (a.acs ?? -1);

  const homeRows = lobbyRows
    .filter((row) => row.team === homeTeamId)
    .sort(byAcsDescending);
  const awayRows = lobbyRows
    .filter((row) => row.team === awayTeamId)
    .sort(byAcsDescending);

  return {
    home: homeRows.map(toEntry),
    away: awayRows.map(toEntry),
  };
}
