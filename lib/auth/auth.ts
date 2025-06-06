import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { CustomPrismaAdapter } from "./adapter";
import { Adapter } from "next-auth/adapters";
import { prisma } from "@/prisma/prismadb";
import { DISCORD_API_ENDPOINT } from "../common/constants";

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
    jwt({ token, user, account }) {
      if (account && user) {
        token.access_token = account.access_token;
        token.id = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.access_token) {
        const freshProfile = await fetch(`${DISCORD_API_ENDPOINT}/users/@me`, {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }).then((res) => res.json());

        const { avatar, id } = freshProfile;
        const format = avatar?.startsWith("a_") ? "gif" : "png";
        const newImage = avatar
          ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.${format}`
          : session.user.image;

        session.user.id = token.id as string;
        session.user.roles = token.roles as string;
        session.user.image = newImage;

        const existingUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { image: true },
        });

        if (existingUser?.image !== newImage) {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { image: newImage },
          });
        }
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
