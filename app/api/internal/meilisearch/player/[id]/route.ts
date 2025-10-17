import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { prisma } from "@/lib/prisma";
import { LeagueStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { determineTier } from "@/lib/common/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const playerId = (await params).id;

  try {
    const player = await getPlayer(playerId);
    if (!player) {
      throw Error();
    }
    const index = meilisearchClient.getIndex("players");
    const task = await index.addDocuments([player]);
    const result = await meilisearchClient.waitForTaskCompletion(task.taskUid);

    return NextResponse.json({
      message: "Player documents added",
      task: result,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err || "Failed to add player documents", status: 400 },
      { status: 400 }
    );
  }
}

async function getPlayer(userId: string) {
  const player = await prisma.user.findUnique({
    where: { id: userId },
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
        select: {
          leagueStatus: true,
        },
      },
    },
  });

  const isFreeAgent = player?.PrimaryRiotAccount?.MMR && !player.Team;
  const isUnregistered =
    player?.Status?.leagueStatus === LeagueStatus.UNREGISTERED;
  const mmr = player?.PrimaryRiotAccount?.MMR?.mmrEffective ?? null;

  if (isFreeAgent) {
    return {
      id: player.id,
      banner: player?.banner,
      discordId: player.Accounts[0]?.providerAccountId || null,
      discordName: player.name,
      riotIGN: player.PrimaryRiotAccount?.riotIGN || null,
      tier: determineTier(mmr),
      mmrEffective: mmr,
      leagueStatus: player.Status?.leagueStatus || null,
      image: player.image,
    };
  } else if (isUnregistered) {
    return {
      id: player?.id,
      banner: player?.banner,
      discordId: player?.Accounts[0]?.providerAccountId || null,
      discordName: player?.name,
      riotIGN: player?.PrimaryRiotAccount?.riotIGN || null,
      leagueStatus: player?.Status?.leagueStatus || null,
      image: player?.image,
    };
  }
  return {
    id: player?.id,
    banner: player?.banner,
    discordId: player?.Accounts[0]?.providerAccountId || null,
    discordName: player?.name,
    riotIGN: player?.PrimaryRiotAccount?.riotIGN || null,
    tier: player?.Team?.tier || null,
    mmrEffective: mmr,
    teamName: player?.Team?.name || null,
    franchiseSlug: player?.Team?.Franchise.slug || null,
    franchiseLogo: player?.Team?.Franchise?.Brand?.logo || null,
    leagueStatus: player?.Status?.leagueStatus || null,
    image: player?.image || null,
  };
}
