import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { CustomPrismaAdapter } from "./adapter";
import { Adapter } from "next-auth/adapters";
import { prisma } from "@/prisma/prismadb";
import { OAuthConfig } from "next-auth/providers";

declare module "next-auth" {
  interface User {
    roles?: string;
  }
}

export interface RiotProfile {
  sub: string;
  name?: string;
  email?: string;
}

export const RiotProvider = (): OAuthConfig<RiotProfile> => ({
  id: "riot",
  name: "Riot",
  type: "oauth",
  authorization: {
    url: "https://auth.riotgames.com/authorize",
    params: {
      scope: "openid offline_access",
      response_type: "code",
    },
  },
  token: "https://auth.riotgames.com/token",
  userinfo: "https://auth.riotgames.com/userinfo",
  clientId: process.env.RIOT_CLIENT_ID!,
  clientSecret: process.env.RIOT_CLIENT_SECRET!,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name ?? null,
      email: profile.email ?? null,
      image: null,
    };
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+guilds.join",
    }),
    RiotProvider,
  ],
  pages: {
    signIn: "/signin",
  },
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
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        await prisma.status.create({
          data: {
            userID: user.id as string,
            contractStatus: null,
            contractRemaining: null,
          },
        });
      }
      const res = await fetch(
        `${process.env.URL}/api/meilisearch/player/${user.id}`
      );
      if (!res.ok) {
        console.warn("Unable to update meilisearch player document ");
      }

      if (account?.access_token) {
        const freshProfile = await fetch(
          "https://discord.com/api/v10/users/@me",
          {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          }
        ).then((res) => res.json());

        const { avatar, id } = freshProfile;
        if (avatar) {
          const format = avatar.startsWith("a_") ? "gif" : "png";
          const newImage = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${format}`;

          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { image: true },
          });

          if (existingUser?.image !== newImage) {
            await prisma.user.update({
              where: { id: user.id },
              data: { image: newImage },
            });
          }
        }
      }
    },
  },
});
