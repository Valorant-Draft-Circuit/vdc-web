import { ContractStatus } from "@prisma/client";
import { RosterPlayer } from "@/lib/queries/franchises/franchises";
import { FormattedStat } from "@/lib/queries/stats/stats";

export type RosterBadge = "CAPTAIN" | "IR" | "SUBBED IN" | "SUBBED OUT";

export type RosterStatRow = {
  key: string;
  displayName: string;
  playerIgn: string | null;
  discordId: string | null;
  avatarUrl: string | null;
  mmr: number | null;
  badge: RosterBadge | null;
  rating: number | null;
  acs: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  kdr: number | null;
  replaces?: RosterStatRow;
};

export function buildRosterStatRows(
  roster: RosterPlayer[],
  teamStats: FormattedStat[],
): RosterStatRow[] {
  const statsByIgn = new Map<string, FormattedStat>();
  for (const stat of teamStats) {
    if (stat.name) statsByIgn.set(stat.name, stat);
  }

  const rows: RosterStatRow[] = [];

  for (const player of roster) {
    const stat = player.riotName ? statsByIgn.get(player.riotName) : undefined;
    rows.push({
      key: player.id,
      displayName: player.riotName ?? player.name ?? "Unknown",
      playerIgn: player.riotName,
      discordId: player.Accounts[0]?.providerAccountId ?? null,
      avatarUrl: player.image ?? null,
      mmr: player.PrimaryRiotAccount?.MMR?.mmrEffective ?? null,
      badge: deriveBadge(player),
      rating: stat ? combinedRating(stat) : null,
      acs: stat?.acs ?? null,
      kills: stat?.totalKills ?? null,
      deaths: stat?.totalDeaths ?? null,
      assists: stat?.totalAssists ?? null,
      kdr: stat?.kdr ?? null,
    });
  }
  return mergeSubbedOutPlayers(rows);
}

function mergeSubbedOutPlayers(rows: RosterStatRow[]): RosterStatRow[] {
  const byName = (first: RosterStatRow, second: RosterStatRow) =>
    first.displayName.localeCompare(second.displayName);
  const activeSubs = rows.filter((row) => row.badge === "SUBBED IN").sort(byName);
  const subbedOut = rows.filter((row) => row.badge === "SUBBED OUT").sort(byName);

  const pairCount = Math.min(activeSubs.length, subbedOut.length);
  if (pairCount === 0) return rows;

  const mergedKeys = new Set<string>();
  for (let index = 0; index < pairCount; index++) {
    activeSubs[index].replaces = subbedOut[index];
    mergedKeys.add(subbedOut[index].key);
  }
  return rows.filter((row) => !mergedKeys.has(row.key));
}

function combinedRating(stat: FormattedStat): number | null {
  const ratings = [stat.attackRating, stat.defenseRating].filter(
    (rating): rating is number => rating !== null,
  );
  if (ratings.length === 0) return null;
  return ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
}

function deriveBadge(player: RosterPlayer): RosterBadge | null {
  const contractStatus = player.Status?.contractStatus ?? null;
  if (contractStatus === ContractStatus.INACTIVE_RESERVE) return "IR";
  if (contractStatus === ContractStatus.ACTIVE_SUB) return "SUBBED IN";
  if (contractStatus === ContractStatus.SUBBED_OUT) return "SUBBED OUT";
  if (player.Captain) return "CAPTAIN";
  return null;
}
