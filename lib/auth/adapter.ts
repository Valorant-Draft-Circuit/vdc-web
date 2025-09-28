import { prisma } from "@/prisma/prismadb";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const CustomPrismaAdapter = {
  ...PrismaAdapter(prisma),

  createUser(user) {
    delete user.sub;
    return prisma.user.create({ data: user });
  },

  linkAccount(data) {
    delete data.sub;
    if (data.provider === "riot" && data.user?.name) {
      data.riotIGN = data.user.name;
    }
    return prisma.account.create({ data: data });
  },

  async getSessionAndUser(sessionToken) {
    const sessionAndUser = await prisma.session.findUnique({
      where: { sessionToken },
      include: { User: true },
    });
    if (!sessionAndUser) return null;
    const { User: userData, ...session } = sessionAndUser;

    return { session, userData };
  },

  async getUserByAccount({ providerAccountId, provider }) {
    const account = await prisma.account.findUnique({
      where: { providerAccountId, provider },
      select: { User: true },
    });
    return account?.User ?? null;
  },
};
