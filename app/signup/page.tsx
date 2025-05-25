import DiscordButton from "@/components/buttons/DiscordButton";
import Accounts from "@/components/signup/Accounts";
import Questions from "@/components/signup/Questions";
import Divider from "@/components/theme/Divider";
import { auth } from "@/lib/auth";
import { getSeasonCached } from "@/lib/common/cache";
import { getUser } from "@/lib/queries/user/user";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "VDC | Sign Up",
  description: "Sign Up to play for Valorant Draft Circuit!",
};

export default function Page() {
  const session = auth();
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
            className="m-auto w-72"
          />
        </div>
        <div className="px-4 py-5 sm:p-6">
          {isSignedIn ? <SignUpForm session={session} /> : <NotSignedIn />}
        </div>
      </div>
    </div>
  );
}

function NotSignedIn() {
  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h2>You are not signed in... :(</h2>
        <DiscordButton text={"Sign In"} />
      </div>
    </>
  );
}

async function SignUpForm({ session }) {
  const currentSeason = await getSeasonCached();
  const user = await getUser(session.id);
  return (
    <>
      <Divider title={"Accounts"} />
      <Accounts user={user} />
      <Divider title={"Required Questions"} />
      <Questions season={currentSeason} />
    </>
  );
}
