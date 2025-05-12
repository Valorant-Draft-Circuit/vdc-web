import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * TODO: make a user search page.
 * For now, just redirect to home.
 */
export default async function Page() {
  const session = await auth();
  if (session) {
    redirect(`/profile/me`);
  }
  return redirect("/");
}
