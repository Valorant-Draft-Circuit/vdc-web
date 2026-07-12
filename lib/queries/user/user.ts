import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { determineTier } from "@/lib/common/tier";
import { prisma } from "@/lib/prisma";
import { ControlPanel, Player } from "@/prisma";
import { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    Accounts: {
      where: {
        provider: "riot";
      };
    };
    Team: {
      include: {
        Franchise: {
          include: {
            Brand: true;
          };
        };
      };
    };
    Status: true;
  };
}>;

export type RiotAccountRow = {
  providerAccountId: string;
  riotIGN: string | null;
};

export type PlayerRiotAccounts = {
  primaryRiotAccountID: string | null;
  Accounts: RiotAccountRow[];
};

export const getLeagueStatus = cache(async (userId: string) => {
  const status = await prisma.status.findUnique({
    where: { userID: userId },
    select: { leagueStatus: true },
  });
  return status?.leagueStatus ?? null;
});

export async function getUserTier(props?: { isStats: boolean }) {
  const session = await auth();
  const isMmrVisible = await ControlPanel.getMMRDisplayState();
  const leagueState = await ControlPanel.getLeagueState();
  const isCombines = leagueState === "COMBINES";

  let user;
  if (session?.user?.id) {
    user = await getUser(session.user.id);
  }

  if (user?.Team) {
    return user?.Team?.tier;
  } else if (
    (isMmrVisible && user?.PrimaryRiotAccount?.MMR) ||
    (props?.isStats && isCombines && user?.PrimaryRiotAccount?.MMR)
  ) {
    return await determineTier(user?.PrimaryRiotAccount?.MMR.mmrEffective);
  }
  return null;
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      Accounts: {
        where: {
          provider: "riot",
        },
      },
      Team: {
        include: {
          Franchise: {
            include: {
              Brand: true,
            },
          },
        },
      },
      Status: true,
      PrimaryRiotAccount: {
        select: {
          MMR: {
            select: {
              mmrEffective: true,
            },
          },
        },
      },
    },
  });

  return user;
}

export const getPlayerByRiotIGN = cache(async (riotIGN: string) => {
  const player = await Player.getBy({ ign: riotIGN });
  return player ?? null;
});

export const getRiotIGNByDiscordId = cache(async (discordId: string) => {
  const riotIGN = await Player.getIGNby({ discordID: discordId });
  return riotIGN ?? null;
});

export const getRiotAccountsByUserId = cache(
  async (userId: string): Promise<PlayerRiotAccounts | null> => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        primaryRiotAccountID: true,
        Accounts: {
          where: { provider: "riot" },
          select: {
            providerAccountId: true,
            riotIGN: true,
          },
        },
      },
    });
  },
);
