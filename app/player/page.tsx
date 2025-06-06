import Search from "@/components/player/search/Search";
import { auth } from "@/lib/auth/auth";

/**
 * TODO: make a user search page.
 * For now, just redirect to home.
 */
export default async function Page() {
  const session = await auth();
  if (session) {
    // redirect(`/player/me`);
  }

  // return redirect("/");
  return (
    <div className="grid grid-cols-3">
      
      <Search />
    </div>
  );
}
