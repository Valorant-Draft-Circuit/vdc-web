import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * If logged in, redirect to profile/[riotIGN] for consistency
 * If not, just return to profile search page
 */
export default async function Page() {
  const session = await auth();
  if (session) {
    const riotIGN = session.user?.name;
    redirect(`/profile/${riotIGN}`);
  }
  return redirect("/profile");
}
