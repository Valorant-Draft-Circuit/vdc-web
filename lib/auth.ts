import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { RiotProvider } from "./auth/auth";

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
});
