import { auth } from "@/lib/auth/auth";
import SignIn from "./SignIn";
import Image from "next/image";
import SignOut from "./SignOut";
import Link from "next/link";
import { LeagueStatus } from "@prisma/client";
import { getUser } from "@/lib/queries/user/user";

export default async function AuthSection() {
  const session = await auth();
  if (!session) return <SignIn />;

  const userAvatar = session?.user?.image;
  if (!session.user?.id) {
    return <SignOut />;
  }
  const user = await getUser(session.user?.id);
  const team = determineTeam(user);

  return (
    <div className="flex flex-row space-x-2">
      <div className="flex flex-col text-vdcWhite p-2 items-end text-sm ">
        <h1 className="italic">{user?.name}</h1>
        <h1 className="">{team}</h1>
      </div>
      <div className="flex m-auto">
        <Link href="/me">
          <Image
            alt="user avatar"
            src={userAvatar ?? ""}
            width={25}
            height={25}
            className="inline-block size-12 rounded-full"
          />
        </Link>
      </div>
      <div className="flex m-auto pl-4 ">
        <SignOut />
      </div>
    </div>
  );
}

export function determineTeam(user) {
  const userLeagueStatus = user.Status.leagueStatus;
  const userContractStatus = user.Status.contractStatus;
  if (userLeagueStatus === LeagueStatus.DRAFT_ELIGIBLE) {
    return "DE";
  } else if (userLeagueStatus === LeagueStatus.FREE_AGENT) {
    return "FA";
  } else if (userLeagueStatus === LeagueStatus.RESTRICTED_FREE_AGENT) {
    return "RFA";
  } else if (userLeagueStatus === LeagueStatus.SUSPENDED) {
    return LeagueStatus.SUSPENDED;
  } else if (userLeagueStatus === LeagueStatus.UNREGISTERED) {
    return LeagueStatus.UNREGISTERED;
  } else if (userLeagueStatus === LeagueStatus.PENDING) {
    return LeagueStatus.PENDING;
  } else if (
    userLeagueStatus === LeagueStatus.GENERAL_MANAGER &&
    userContractStatus === LeagueStatus.SIGNED
  ) {
    return `${user.Team.Franchise.slug} | ${user.Team.name}`;
  } else if (userLeagueStatus === LeagueStatus.GENERAL_MANAGER) {
    return `${user.Team.Franchise.name}`;
  }
}
