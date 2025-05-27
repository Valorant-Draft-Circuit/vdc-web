import DiscordButton from "@/components/buttons/DiscordButton";
import SignUpForm from "@/components/signup/SignUpForm";
import { auth } from "@/lib/auth/auth";
import { getSeasonCached, getUserCached } from "@/lib/common/cache";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "VDC | Sign Up",
  description: "Sign Up to play for Valorant Draft Circuit!",
};

export default async function Page() {
  const session = await auth();
  const currentSeason = await getSeasonCached();
  let user;
  if (session?.user?.id) {
    user = await getUserCached(session?.user?.id);
  }
  let isSignedIn;
  if (!session) {
    isSignedIn = false;
  } else {
    isSignedIn = true;
  }

  return (
    <div className="mx-auto py-10 max-w-7xl sm:px-6 lg:px-8">
      <div className="divide-y divide-vdcGrey overflow-hidden rounded-lg">
        <div className="px-4 pb-10 xl:py-10 sm:px-6">
          <Image
            src="/main-logo-red.svg"
            alt="Main logo"
            width={300}
            height={300}
            className="m-auto w-72 xl:w-lg"
          />
        </div>
        <div className="px-4 py-5 sm:p-6">
          {isSignedIn ? (
            <SignUpForm user={user} currentSeason={currentSeason} />
          ) : (
            <NotSignedIn />
          )}
        </div>
      </div>
    </div>
  );
}

function NotSignedIn() {
  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-xl">You are not signed in... :(</h2>
        <DiscordButton text={"Sign In"} />
      </div>
    </>
  );
}
