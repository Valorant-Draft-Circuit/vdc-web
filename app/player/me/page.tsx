import { auth } from "@/lib/auth/auth";
import { Player } from "@/prisma/_Player";
import { redirect } from "next/navigation";

/**
 * If logged in, redirect to player/[riotIGN] for consistency
 * If not, just return to player search page
 */
export default async function Page() {
  const session = await auth();
  if (session) {
    const player = await Player.getBy({ userID: session.user?.id as string });
    const discordAccount = player?.Accounts[0].providerAccountId;
    redirect(`/player/${discordAccount}`);
  }
  return redirect("/player");
}
