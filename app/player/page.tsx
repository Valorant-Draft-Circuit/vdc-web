import Search from "@/components/player/search/Search";
import { auth } from "@/lib/auth/auth";
import { ControlPanel } from "@/prisma";

/**
 * TODO: make a user search page.
 * For now, just redirect to home.
 */
export default async function Page() {
  const session = await auth();
  const mmrShow = await ControlPanel.getMMRDisplayState();

  if (session) {
    // redirect(`/player/me`);
  }

  // return redirect("/");
  return (
    <div className="mx-auto py-10 max-w-7xl xl:py-12 flex flex-col gap-10">
      <Search mmrShow={mmrShow}/>
    </div>
  );
}
