import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { CustomPrismaAdapter } from "./adapter";
import { Adapter } from "next-auth/adapters";
import { prisma } from "../prisma";
import { OAuthConfig } from "next-auth/providers";

declare module "next-auth" {
  interface User {
    roles?: string;
  }
}

export interface RiotProfile {
  sub: string;
}

export const RiotProvider = (): OAuthConfig<RiotProfile> => ({
  id: "riot",
  name: "Riot",
  type: "oidc",
  wellKnown: "https://auth.riotgames.com/.well-known/openid-configuration",
  clientId: process.env.RIOT_CLIENT_ID!,
  clientSecret: process.env.RIOT_CLIENT_SECRET!,
  issuer: "https://auth.riotgames.com",
  async profile(_, tokens) {
    const res = await fetch(
      "https://americas.api.riotgames.com/riot/account/v1/accounts/me",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch Riot account info");
    }
    const data = await res.json();
    return {
      id: data.puuid,
      name: `${data.gameName}#${data.tagLine}`,
      email: null,
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
    RiotProvider(),
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
        await createNewUser(user);
      }
      await updateMeilisearch(user);
      if (account?.provider === "riot") {
        await handleRiotCallback(account, user);
      }
      if (account?.provider === "discord") {
        await handleDiscordCallback(account, user);
      }
    },
  },
});

async function updateMeilisearch(user) {
  const res = await fetch(
    `${process.env.URL}/api/meilisearch/player/${user.id}`
  );
  if (!res.ok) {
    console.warn("Unable to update meilisearch player document ");
  }
}
async function createNewUser(user) {
  await prisma.status.create({
    data: {
      userID: user.id as string,
      contractStatus: null,
      contractRemaining: null,
    },
  });
}

async function handleRiotCallback(account, user) {
  const userInfoVal = await fetch(
    "https://americas.api.riotgames.com/riot/account/v1/accounts/me",
    {
      headers: { Authorization: `Bearer ${account.access_token}` },
    }
  ).then((res) => res.json());

  const vdcUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (vdcUser) {
    await prisma.account.upsert({
      where: {
        providerAccountId: userInfoVal.puuid,
      },
      update: {
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        riotIGN: userInfoVal.gameName + "#" + userInfoVal.tagLine,
      },
      create: {
        userId: user.id!,
        type: "oauth",
        provider: "riot",
        providerAccountId: userInfoVal.puuid,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        riotIGN: userInfoVal.gameName + "#" + userInfoVal.tagLine,
      },
    });

    if (!user.primaryRiotAccountID) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          primaryRiotAccountID: userInfoVal.puuid,
        },
      });
    }
  }
}

async function handleDiscordCallback(account, user) {
  const freshProfile = await fetch("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${account.access_token}`,
    },
  }).then((res) => res.json());

  const { avatar, id, banner } = freshProfile;
  if (!avatar) return;

  const imageSrc = getMediaSource(avatar, "avatar", id);
  const bannerSrc = getMediaSource(banner, "banner", id);

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { image: true, banner: true },
  });

  if (!existingUser) {
    console.warn(
      `User with ID ${user.id} not found in DB yet. Skipping image update.`
    );
    return;
  }

  const existingBanner = existingUser.banner ?? null;

  const dataToUpdate: Record<string, string | null> = {};

  if (existingUser.image !== imageSrc) {
    dataToUpdate.image = imageSrc;
  }

  if (existingBanner !== bannerSrc) {
    dataToUpdate.banner = bannerSrc;
  }

  if (Object.keys(dataToUpdate).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });
  }
}

function getMediaSource(
  asset: string | null,
  assetType: string,
  id: string
): string | null {
  const assetSize = 2048;

  if (!asset) return null;
  const format = asset.startsWith("a_") ? "gif" : "webp";
  if (assetType === "avatar") {
    return `https://cdn.discordapp.com/avatars/${id}/${asset}.${format}?size=${assetSize}`;
  } else {
    return `https://cdn.discordapp.com/banners/${id}/${asset}.${format}?size=${assetSize}`;
  }
}
