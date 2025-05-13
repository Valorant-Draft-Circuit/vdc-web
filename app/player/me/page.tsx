import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * If logged in, redirect to player/[riotIGN] for consistency
 * If not, just return to player search page
 */
export default async function Page() {
  const session = await auth();
  if (session) {
    const riotIGN = session.user?.name;
    redirect(`/player/${riotIGN}`);
  }
  return redirect("/player");
}
