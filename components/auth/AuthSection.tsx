import { auth } from "@/lib/auth/auth";
import SignIn from "./SignIn";
import Image from "next/image";
import SignOut from "./SignOut";
import Link from "next/link";
import { getUser } from "@/lib/queries/user/user";
import { getFranchiseSlugOfManager as getFranchiseOfManager } from "@/lib/queries/franchises/franchises";
import { determineTeam } from "@/lib/common/auth/auth-utils";

export default async function AuthSection() {
  const session = await auth();
  if (!session) return <SignIn />;

  const userAvatar = session?.user?.image;
  if (!session.user?.id) {
    return <SignOut />;
  }
  const user = await getUser(session.user?.id);
  let team = determineTeam(user);

  if (!team) {
    const slug = await getFranchiseOfManager(user?.id);
    team = `${slug} Management`;
  }

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
