import { LeagueStatus } from "@prisma/client";
import { determineTier } from "@/lib/common/tier";
import { meilisearchClient } from "@/lib/meilisearch/meilisearch";
import { prisma } from "@/lib/prisma";

export async function updatePlayerDocument(userId: string) {
  const player = await getPlayerDocument(userId);
  if (!player) return;
  const index = meilisearchClient.getIndex("players");
  const task = await index.addDocuments([player]);
  await meilisearchClient.waitForTaskCompletion(task.taskUid);
}

async function getPlayerDocument(userId: string) {
  const player = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      banner: true,
      Accounts: {
        where: { provider: "discord" },
        select: { providerAccountId: true },
      },
      Team: {
        select: {
          name: true,
          tier: true,
          Franchise: {
            select: {
              slug: true,
              Brand: { select: { logo: true } },
            },
          },
        },
      },
      PrimaryRiotAccount: {
        select: {
          riotIGN: true,
          MMR: { select: { mmrEffective: true } },
        },
      },
      Status: { select: { leagueStatus: true } },
    },
  });
  if (!player) return null;

  const isFreeAgent = player.PrimaryRiotAccount?.MMR && !player.Team;
  const isUnregistered =
    player.Status?.leagueStatus === LeagueStatus.UNREGISTERED;
  const mmr = player.PrimaryRiotAccount?.MMR?.mmrEffective ?? null;

  if (isFreeAgent) {
    return {
      id: player.id,
      banner: player.banner,
      discordId: player.Accounts[0]?.providerAccountId || null,
      discordName: player.name,
      riotIGN: player.PrimaryRiotAccount?.riotIGN || null,
      tier: await determineTier(mmr),
      mmrEffective: mmr,
      leagueStatus: player.Status?.leagueStatus || null,
      image: player.image,
    };
  }
  if (isUnregistered) {
    return {
      id: player.id,
      banner: player.banner,
      discordId: player.Accounts[0]?.providerAccountId || null,
      discordName: player.name,
      riotIGN: player.PrimaryRiotAccount?.riotIGN || null,
      leagueStatus: player.Status?.leagueStatus || null,
      image: player.image,
    };
  }
  return {
    id: player.id,
    banner: player.banner,
    discordId: player.Accounts[0]?.providerAccountId || null,
    discordName: player.name,
    riotIGN: player.PrimaryRiotAccount?.riotIGN || null,
    tier: player.Team?.tier || null,
    mmrEffective: mmr,
    teamName: player.Team?.name || null,
    franchiseSlug: player.Team?.Franchise.slug || null,
    franchiseLogo: player.Team?.Franchise?.Brand?.logo || null,
    leagueStatus: player.Status?.leagueStatus || null,
    image: player.image || null,
  };
}
