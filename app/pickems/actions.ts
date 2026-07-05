"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { ModLogType, Tier } from "@prisma/client";

import { auth } from "@/lib/auth/auth";
import { getUserRoles, hasAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { getSeasonCached } from "@/lib/common/cache";
import { correctMatchDate } from "@/lib/common/format";
import { isLegalScore } from "@/lib/pickems/picks";
import { slateLockTime } from "@/lib/pickems/format";
import { AGENT_UUIDS } from "@/lib/common/constants/agents";
import { MODERATION_ROLES } from "@/lib/common/constants/roles";
import {
  getAdvanceBoard,
  getAdvanceLock,
} from "@/lib/queries/pickems/getAdvanceBoard";
import { getBracketLock } from "@/lib/queries/pickems/getBracketBoard";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import { validateBracketPicks } from "@/lib/pickems/bracket";

type Result = { ok: true } | { ok: false; error: string };

const MAX_GROUP_NAME_LENGTH = 60;

export async function submitMatchPicks(input: {
  picks: { matchId: number; homeScore: number; awayScore: number }[];
}): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }
  const userId = session.user.id;

  for (const pick of input.picks) {
    const match = await prisma.matches.findUnique({
      where: { matchID: pick.matchId },
      select: {
        matchType: true,
        dateScheduled: true,
        season: true,
        tier: true,
        matchDay: true,
      },
    });
    if (!match || match.matchDay === null) {
      return { ok: false, error: "Unknown match" };
    }
    if (!isLegalScore(match.matchType, pick.homeScore, pick.awayScore)) {
      return { ok: false, error: "Illegal score for this match type" };
    }

    const slate = await prisma.matches.aggregate({
      where: {
        season: match.season,
        tier: match.tier,
        matchDay: match.matchDay,
      },
      _min: { dateScheduled: true },
    });
    const slateLock = slate._min.dateScheduled;
    if (slateLock && slateLockTime(correctMatchDate(slateLock)) <= new Date()) {
      return { ok: false, error: "This slate is locked" };
    }

    await prisma.pickemMatchPick.upsert({
      where: { userID_matchID: { userID: userId, matchID: pick.matchId } },
      create: {
        userID: userId,
        matchID: pick.matchId,
        predictedHomeScore: pick.homeScore,
        predictedAwayScore: pick.awayScore,
      },
      update: {
        predictedHomeScore: pick.homeScore,
        predictedAwayScore: pick.awayScore,
      },
    });
  }
  revalidatePath("/pickems");
  revalidatePath("/pickems/matches");
  return { ok: true };
}

export async function submitAdvancePick(input: {
  tier: Tier;
  teams: { teamId: number; seed: number }[];
}): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }
  const userId = session.user.id;
  const season = await getSeasonCached();

  const lock = await getAdvanceLock(input.tier, season);
  if (!lock || lock <= new Date()) {
    return { ok: false, error: "Advancement window is locked" };
  }

  const board = await getAdvanceBoard(input.tier, season);
  if (input.teams.length !== board.n) {
    return { ok: false, error: `Pick exactly ${board.n} teams` };
  }

  const validTeamIds = new Set(board.teams.map((team) => team.id));
  const usedSeeds = new Set<number>();
  for (const team of input.teams) {
    if (!validTeamIds.has(team.teamId)) {
      return { ok: false, error: "Invalid team" };
    }
    const seedOutOfRange = team.seed < 1 || team.seed > board.n;
    if (seedOutOfRange || usedSeeds.has(team.seed)) {
      return { ok: false, error: "Invalid seeds" };
    }
    usedSeeds.add(team.seed);
  }

  await prisma.$transaction([
    prisma.pickemAdvancePick.deleteMany({
      where: { userID: userId, season, tier: input.tier },
    }),
    prisma.pickemAdvancePick.createMany({
      data: input.teams.map((team) => ({
        userID: userId,
        season,
        tier: input.tier,
        predictedTeam: team.teamId,
        predictedSeed: team.seed,
      })),
    }),
  ]);
  revalidatePath("/pickems");
  revalidatePath("/pickems/advancement");
  return { ok: true };
}

export async function submitBracketPicks(input: {
  tier: Tier;
  picks: { round: number; slot: number; teamId: number; loserGames: number }[];
}): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }
  const userId = session.user.id;
  const season = await getSeasonCached();

  const lock = await getBracketLock(input.tier, season);
  if (lock && lock <= new Date()) {
    return { ok: false, error: "The bracket is locked" };
  }

  const bracket = await getPlayoffBracket(input.tier, season);
  const validation = validateBracketPicks(bracket, input.picks);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  await prisma.$transaction([
    prisma.pickemBracketPick.deleteMany({
      where: { userID: userId, season, tier: input.tier },
    }),
    prisma.pickemBracketPick.createMany({
      data: input.picks.map((pick) => ({
        userID: userId,
        season,
        tier: input.tier,
        round: pick.round,
        slot: pick.slot,
        predictedTeam: pick.teamId,
        predictedLoserGames: pick.loserGames,
      })),
    }),
  ]);
  revalidatePath("/pickems");
  revalidatePath("/pickems/bracket");
  return { ok: true };
}

export async function createGroup(input: {
  name: string;
  image: string;
}): Promise<Result & { groupId?: number }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const name = input.name.trim();
  if (name.length === 0 || name.length > MAX_GROUP_NAME_LENGTH) {
    return { ok: false, error: "Name must be 1-60 chars" };
  }
  if (!AGENT_UUIDS.has(input.image)) {
    return { ok: false, error: "Invalid image" };
  }

  const season = await getSeasonCached();
  const joinCode = randomUUID().slice(0, 8).toUpperCase();

  const group = await prisma.pickemGroup.create({
    data: {
      name,
      image: input.image,
      season,
      ownerID: session.user.id,
      joinCode,
      Members: { create: { userID: session.user.id } },
    },
    select: { id: true },
  });
  revalidatePath("/pickems/groups");
  return { ok: true, groupId: group.id };
}

export async function updateGroup(input: {
  groupId: number;
  name: string;
  image: string;
}): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const name = input.name.trim();
  if (name.length === 0 || name.length > MAX_GROUP_NAME_LENGTH) {
    return { ok: false, error: "Name must be 1-60 chars" };
  }
  if (!AGENT_UUIDS.has(input.image)) {
    return { ok: false, error: "Invalid image" };
  }

  const group = await prisma.pickemGroup.findUnique({
    where: { id: input.groupId },
    select: { ownerID: true },
  });
  if (!group || group.ownerID !== session.user.id) {
    return { ok: false, error: "Only the group owner can edit it" };
  }

  await prisma.pickemGroup.update({
    where: { id: input.groupId },
    data: { name, image: input.image },
  });
  revalidatePath("/pickems/groups");
  return { ok: true };
}

export async function joinGroupByCode(input: {
  code: string;
}): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const group = await prisma.pickemGroup.findUnique({
    where: { joinCode: input.code.trim().toUpperCase() },
    select: { id: true },
  });
  if (!group) {
    return { ok: false, error: "Invalid code" };
  }

  const existingMembership = await prisma.pickemGroupMember.findUnique({
    where: { groupID_userID: { groupID: group.id, userID: session.user.id } },
    select: { id: true },
  });
  if (existingMembership) {
    return { ok: false, error: "Already a member" };
  }

  await prisma.pickemGroupMember.create({
    data: { groupID: group.id, userID: session.user.id },
  });
  revalidatePath("/pickems/groups");
  return { ok: true };
}

export async function leaveGroup(input: { groupId: number }): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  await prisma.pickemGroupMember.deleteMany({
    where: { groupID: input.groupId, userID: session.user.id },
  });

  const remainingMembers = await prisma.pickemGroupMember.count({
    where: { groupID: input.groupId },
  });
  if (remainingMembers === 0) {
    await prisma.pickemGroup.deleteMany({ where: { id: input.groupId } });
  }

  revalidatePath("/pickems/groups");
  return { ok: true };
}

export async function deleteGroup(input: { groupId: number }): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthenticated" };
  }

  const roles = await getUserRoles(session.user.id);
  if (!hasAccess(roles, MODERATION_ROLES)) {
    return { ok: false, error: "Not authorized" };
  }

  const group = await prisma.pickemGroup.findUnique({
    where: { id: input.groupId },
    include: {
      Owner: {
        select: {
          Accounts: {
            where: { provider: "discord" },
            select: { providerAccountId: true },
          },
        },
      },
    },
  });
  if (!group) {
    return { ok: false, error: "Group not found" };
  }

  await prisma.pickemGroup.deleteMany({ where: { id: input.groupId } });

  const ownerDiscordId = group.Owner.Accounts[0]?.providerAccountId;
  if (ownerDiscordId) {
    await prisma.modLogs.create({
      data: {
        discordID: ownerDiscordId,
        modID: session.user.id,
        season: group.season,
        // TODO: change to ModLogType.PICKEM_GROUP_DELETE once added to the prisma enum
        type: ModLogType.NOTE,
        message: `Deleted Pick'ems group "${group.name}" (group ${group.id}, season ${group.season}).`,
      },
    });
  }

  revalidatePath("/pickems/groups");
  revalidatePath("/pickems/leaderboard");
  return { ok: true };
}
