import { cache } from "react";
import { Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import { getTeamsInSeason } from "@/lib/queries/teams/teams";
import { BracketTeam, Slot } from "@/lib/common/bracket";
import { tallyBracketSlots, type SlotConsensus } from "@/lib/pickems/sentiment";

export type TeamRef = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  seed: number | null;
};

export type ChampionShare = { team: TeamRef | null; count: number; share: number };

export type MatchupConsensus = SlotConsensus & { team: TeamRef | null };

export type BracketSentiment = {
  available: boolean;
  voters: number;
  slots: MatchupConsensus[];
  champions: ChampionShare[];
  finalists: ChampionShare[];
  mostAgreed: MatchupConsensus | null;
  mostDivisive: MatchupConsensus | null;
  darkHorse: ChampionShare | null;
};

const MIN_SLOT_PICKS = 3;

function teamsInSlot(slot: Slot): BracketTeam[] {
  if (slot.kind === "series") {
    return [slot.home.team, slot.away.team];
  }
  if (slot.kind === "bye") {
    return slot.team ? [slot.team] : [];
  }
  const teams: BracketTeam[] = [];
  if (slot.home) teams.push(slot.home);
  if (slot.away) teams.push(slot.away);
  return teams;
}

export const getBracketSentiment = cache(
  async (tier: Tier, season: number): Promise<BracketSentiment> => {
    const bracket = await getPlayoffBracket(tier, season);
    const picks = await prisma.pickemBracketPick.findMany({
      where: { season, tier },
      select: { userID: true, round: true, slot: true, predictedTeam: true },
    });

    const empty: BracketSentiment = {
      available: false,
      voters: 0,
      slots: [],
      champions: [],
      finalists: [],
      mostAgreed: null,
      mostDivisive: null,
      darkHorse: null,
    };

    if (!bracket.seeded || picks.length === 0) {
      return empty;
    }

    const seedByTeam = new Map<number, number>();
    for (const round of bracket.rounds) {
      for (const slot of round.slots) {
        for (const team of teamsInSlot(slot)) {
          seedByTeam.set(team.id, team.seed);
        }
      }
    }

    const teams = await getTeamsInSeason(tier, season);
    const teamById = new Map<number, TeamRef>();
    for (const team of teams) {
      teamById.set(team.id, {
        id: team.id,
        name: team.name,
        slug: team.Franchise.slug,
        logo: team.Franchise.Brand?.logo ?? null,
        seed: seedByTeam.get(team.id) ?? null,
      });
    }
    const withTeam = (slot: SlotConsensus): MatchupConsensus => ({
      ...slot,
      team: teamById.get(slot.teamId) ?? null,
    });

    const slotTallies = tallyBracketSlots(
      picks.map((pick) => ({
        round: pick.round,
        slot: pick.slot,
        teamId: pick.predictedTeam,
      })),
    ).map(withTeam);

    const voters = new Set(picks.map((pick) => pick.userID)).size;

    const finalPicks = picks.filter((pick) => pick.round === 0);
    const championCounts = new Map<number, number>();
    for (const pick of finalPicks) {
      championCounts.set(
        pick.predictedTeam,
        (championCounts.get(pick.predictedTeam) ?? 0) + 1,
      );
    }
    const championTotal = finalPicks.length;
    const champions: ChampionShare[] = [...championCounts.entries()]
      .map(([teamId, count]) => ({
        team: teamById.get(teamId) ?? null,
        count,
        share: championTotal === 0 ? 0 : count / championTotal,
      }))
      .sort((a, b) => b.share - a.share);

    const eligibleSlots = slotTallies.filter((slot) => slot.total >= MIN_SLOT_PICKS);
    const mostAgreed =
      eligibleSlots.length === 0
        ? null
        : eligibleSlots.reduce((best, slot) => (slot.share > best.share ? slot : best));
    const mostDivisive =
      eligibleSlots.length === 0
        ? null
        : eligibleSlots.reduce((worst, slot) => (slot.share < worst.share ? slot : worst));

    const darkHorse =
      champions
        .filter((entry) => entry.team && entry.team.seed !== null && entry.team.seed >= 4)
        .sort((a, b) => (b.team!.seed ?? 0) - (a.team!.seed ?? 0))[0] ?? null;

    return {
      available: true,
      voters,
      slots: slotTallies,
      champions,
      finalists: champions.slice(0, 2),
      mostAgreed,
      mostDivisive,
      darkHorse,
    };
  },
);
