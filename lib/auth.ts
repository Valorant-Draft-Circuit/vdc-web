import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { OAuthConfig } from "next-auth/providers";

const Riot = (): OAuthConfig<any> => ({
  id: "riot",
  name: "Riot",
  type: "oauth",
  wellKnown: "https://auth.riotgames.com/.well-known/openid-configuration",
  clientId: process.env.RIOT_CLIENT_ID!,
  clientSecret: process.env.RIOT_CLIENT_SECRET!,
  authorization: { params: { scope: "openid profile offline_access" } },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.username ?? profile.name ?? null,
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
    Riot(),
  ],
  pages: {
    signIn: "/signin",
  },
});
