import { auth } from "@/lib/auth/auth";
import { determineTier } from "@/lib/common/utils";
import { prisma } from "@/lib/prisma";
import { ControlPanel } from "@/prisma";
import { Prisma } from "@prisma/client";
export type TUser = Prisma.UserGetPayload<{
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

export async function getUserTier(isStats?: boolean) {
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
    (isStats && isCombines && user.PrimaryRiotAccount.MMR)
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
