import DiscordButton from "../buttons/DiscordButton";
import Image from "next/image";
import SignUpButton from "../buttons/SignUpButton";
import { LeagueStatus } from "@prisma/client";
import { Session } from "next-auth";
import Link from "next/link";
import { SignOutButton } from "../auth/SignOut";
import { getUser } from "@/lib/queries/user/user";
import { getSignupState } from "@/lib/queries/control/control";
import { matchDayTimeWithFallback } from "@/lib/common/times";
const PREVIEW = Boolean(process.env.PREVIEW);

export default async function HeroSection({
  session,
}: {
  session: Session | null;
}) {
  return (
    <div className="xl:p-4">
      <div className="relative isolate overflow-hidden py-28 xl:py-12 4xl:py-32 text-center xl:rounded-3xl sm:px-16 4xl:px-24 flex flex-col lg:flex-row space-y-10">
        <Image
          alt="hero image"
          src="/hero-section.webp"
          width={5000}
          height={5000}
          className="absolute inset-0 -z-10 size-full object-cover sm:object-top lg:object-[10%_10%] xl:scale-150 xl:absolute xl:left-20 xl:top-20 brightness-65 "
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-40 lg:hidden -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-7rem)] aspect-1155/678 w-144.5` -translate-x-1/2 rotate-30 bg-linear-to-tr from-slate-800 to-black brightness-20 lg:left-[calc(50%-30rem)] lg:w-288.75"
          />
        </div>
        <div className="bg-vdcBlack py-8 mx-2 rounded-2xl flex flex-col space-y-2 shadow-2xl lg:px-0 lg:px lg:ml-0 lg:justify-between lg:my-auto lg:max-w-8/12">
          <div className="flex flex-row items-end space-x-4 mx-10">
            <Image
              src="/vdc-flame.svg"
              alt="vdc flame"
              width={45}
              height={20}
            />
            <h2 className="text-vdcRed text-3xl">What is VDC?</h2>
          </div>
          <div className="px-10 text-start xl:w-96 lg:pr-8">
            <p className="text-white text-md">
              VDC is an NA based, community run VALORANT league for all skill
              levels. We offer a casually competitive season based environment
              without the need to make a team of your own. Our match days are
              every Wednesdays and Fridays at {matchDayTimeWithFallback()}{" "}
              during the season.
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 lg:my-auto lg:ml-auto">
          {!session ? <Join /> : <Joined session={session} />}
        </div>
      </div>
    </div>
  );
}

function Join() {
  return (
    <>
      <h2 className="text-vdcRed lg:text-vdcBlack xl:text-vdcRed text-2xl">
        Join the Fight.
      </h2>
      {!PREVIEW && (
        <div>
          <DiscordButton text="Sign Up with Discord" signInButton={true} />
        </div>
      )}
    </>
  );
}

async function Joined({ session }: { session: Session }) {
  if (!session.user?.id) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-vdcRed lg:text-vdcWhite xl:text-vdcRed text-2xl">
          Something went wrong...
          <br />
          Please relog.
        </h2>
        <SignOutButton />
      </div>
    );
  }

  const user = await getUser(session.user.id);
  const signupState = await getSignupState();
  if (signupState === "CLOSED") {
    return (
      <>
        <h2 className="text-vdcRed lg:text-vdcWhite xl:text-vdcRed text-2xl">
          Sign ups are <br />
          not yet open. <br />
          Check back later!
        </h2>
      </>
    );
  }
  if (user!.Status!.leagueStatus === LeagueStatus.SUSPENDED) {
    return (
      <>
        <h2 className="text-vdcRed lg:text-vdcWhite xl:text-vdcRed text-2xl">
          {user!.name} has
          <br />
          been suspended.
        </h2>
      </>
    );
  } else if (
    user!.Status!.leagueStatus === LeagueStatus.UNREGISTERED ||
    user!.Status!.leagueStatus === LeagueStatus.RETIRED
  ) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-vdcRed lg:text-vdcWhite xl:text-vdcRed text-2xl">
          You want to play, <br />
          {user!.name}?
        </h2>
        <SignUpButton />
      </div>
    );
  } else if (user!.Status!.leagueStatus === LeagueStatus.PENDING) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-vdcRed lg:text-vdcWhite xl:text-vdcRed text-2xl">
          {user!.name}, You are
          <br />
          pending approval!
        </h2>
        <div>
          <button
            type="button"
            className="rounded-md bg-vdcRed px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <Link href={"/about"}>
              <h1>Get to know us!</h1>
            </Link>
          </button>
        </div>
      </div>
    );
  }
  // TODO: set button to go to wherever user specified in user settings
  return (
    <>
      <h2 className="text-vdcRed lg:text-vdcWhite xl:text-vdcRed text-2xl">
        {user!.name} has
        <br />
        Joined the Draft.
      </h2>
      <div>
        <button
          type="button"
          className="rounded-md bg-vdcRed px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          <Link href={"/schedule"}>
            <h1>View Schedule</h1>
          </Link>
        </button>
      </div>
    </>
  );
}
