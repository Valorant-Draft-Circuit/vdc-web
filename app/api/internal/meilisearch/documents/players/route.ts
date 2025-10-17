import { isAuthorizedForMeilisearch } from "@/lib/auth/access";
import { auth } from "@/lib/auth/auth";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { ControlPanel } from "@/prisma";
import { prisma } from "@/lib/prisma";
import { LeagueStatus, Tier } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const meiliAuthFromUrl = url.searchParams.get("meiliauth") ?? "";
  const bypass =
    meiliAuthFromUrl === process.env.NEXT_PUBLIC_MEILISEARCH_MASTER_KEY;

  if (!bypass) {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized: no valid session" },
        { status: 401 }
      );
    }

    const roles = session.user?.roles ?? "";
    if (!isAuthorizedForMeilisearch(roles)) {
      return NextResponse.json(
        { message: "Forbidden: insufficient permissions" },
        { status: 403 }
      );
    }
  }

  const players = await getPlayers();
  if (!players || !Array.isArray(players)) {
    return NextResponse.json(
      { message: "No players provided", status: 400 },
      { status: 400 }
    );
  }

  try {
    const index = meilisearchClient.getIndex("players");
    const task = await index.addDocuments(players);
    const result = await meilisearchClient.waitForTaskCompletion(task.taskUid);

    return NextResponse.json({
      message: "Player documents added",
      task: result,
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err || "Failed to add player documents", status: 400 },
      { status: 400 }
    );
  }
}

export type TMeiliPlayer = {
  id: string;
  discordId: string;
  discordName: string;
  riotIGN: string;
  tier: string;
  mmrEffective: string;
  teamName: string;
  franchiseSlug: string;
  franchiseLogo: string;
  leagueStatus: string;
  image: string;
  banner: string | null;
};

async function getPlayers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      banner: true,
      Accounts: {
        where: { provider: "discord" },
        select: {
          providerAccountId: true,
        },
      },
      Team: {
        select: {
          name: true,
          tier: true,
          Franchise: {
            select: {
              slug: true,
              Brand: {
                select: {
                  logo: true,
                },
              },
            },
          },
        },
      },
      PrimaryRiotAccount: {
        select: {
          riotIGN: true,
          MMR: {
            select: {
              mmrEffective: true,
            },
          },
        },
      },
      Status: {
        where: {
          AND: [
            { leagueStatus: { not: LeagueStatus.UNREGISTERED } },
            { leagueStatus: { not: LeagueStatus.RETIRED } },
            { leagueStatus: { not: LeagueStatus.PENDING } },
          ],
        },
        select: {
          leagueStatus: true,
        },
      },
    },
  });

  const mmrTierLines = (await ControlPanel.getMMRCaps("PLAYER")) as {
    PROSPECT: { min: number; max: number };
    APPRENTICE: { min: number; max: number };
    EXPERT: { min: number; max: number };
    MYTHIC: { min: number; max: number };
  };
  return users.map((user) => {
    const isFreeAgent = user.PrimaryRiotAccount?.MMR && !user.Team;
    const isUnregistered =
      user.Status?.leagueStatus === LeagueStatus.UNREGISTERED;
    const mmr = user.PrimaryRiotAccount?.MMR?.mmrEffective ?? null;

    if (isFreeAgent) {
      return {
        id: user.id,
        banner: user?.banner,
        discordId: user.Accounts[0]?.providerAccountId || null,
        discordName: user.name,
        riotIGN: user.PrimaryRiotAccount?.riotIGN || null,
        tier: determineTier(mmr),
        mmrEffective: mmr,
        leagueStatus: user.Status?.leagueStatus || null,
        image: user.image,
      };
    } else if (isUnregistered) {
      return {
        id: user.id,
        banner: user?.banner,
        discordId: user.Accounts[0]?.providerAccountId || null,
        discordName: user.name,
        riotIGN: user.PrimaryRiotAccount?.riotIGN || null,
        leagueStatus: user.Status?.leagueStatus || null,
        image: user.image,
      };
    }
    return {
      id: user.id,
      banner: user?.banner,
      discordId: user.Accounts[0]?.providerAccountId || null,
      discordName: user.name,
      riotIGN: user.PrimaryRiotAccount?.riotIGN || null,
      tier: user.Team?.tier || null,
      mmrEffective: mmr,
      teamName: user.Team?.name || null,
      franchiseSlug: user.Team?.Franchise.slug || null,
      franchiseLogo: user.Team?.Franchise?.Brand?.logo || null,
      leagueStatus: user.Status?.leagueStatus || null,
      image: user.image || null,
    };
  });

  function determineTier(mmr: number | null) {
    if (mmr === null) return null;

    const { PROSPECT, APPRENTICE, EXPERT } = mmrTierLines;

    if (mmr <= PROSPECT.max) return Tier.PROSPECT;
    if (mmr <= APPRENTICE.max) return Tier.APPRENTICE;
    if (mmr <= EXPERT.max) return Tier.EXPERT;
    return Tier.MYTHIC;
  }
}
