import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { CustomPrismaAdapter } from "./adapter";
import { Adapter } from "next-auth/adapters";
import { prisma } from "@/prisma/prismadb";
declare module "next-auth" {
  interface User {
    roles: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    roles: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+guilds.join",
    }),
  ],
  adapter: CustomPrismaAdapter as Adapter,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: () => {
      return true;
    },
    redirect: ({ url, baseUrl }) => {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        await prisma.status.create({
          data: {
            userID: user.id as string,
            contractStatus: null,
            contractRemaining: null,
          },
        });
      }
    },
  },
});
