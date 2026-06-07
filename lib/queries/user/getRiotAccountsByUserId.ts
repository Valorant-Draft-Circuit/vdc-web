import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type RiotAccountRow = {
  providerAccountId: string;
  riotIGN: string | null;
};

export type PlayerRiotAccounts = {
  primaryRiotAccountID: string | null;
  Accounts: RiotAccountRow[];
};

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
