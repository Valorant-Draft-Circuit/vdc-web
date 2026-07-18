import PlayerAvatar from "@/components/theme/PlayerAvatar";
import { avatarColor } from "@/lib/common/avatar";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getUserStatus } from "@/lib/common/auth/auth-utils";
import { getManagerFranchiseSlug } from "@/lib/queries/franchises/franchises";
import { getUser } from "@/lib/queries/user/user";
import SignIn from "./SignIn";
import SignOut from "./SignOut";

export default async function MobileAuth() {
  const session = await auth();
  if (!session) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-200 px-4 text-lg">Not signed in.</h1>
        <SignIn />
      </div>
    );
  }
  if (!session.user?.id) return <SignOut />;

  const user = await getUser(session.user.id);
  const status = user ? getUserStatus(user) : undefined;
  const slug =
    user && !status ? await getManagerFranchiseSlug(session.user.id) : null;

  const userImage = session.user.image;
  const userName = user?.name;
  const displayStatus = status || (slug ? `${slug} Management` : "Loading...");

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex flex-row gap-2 ml-10">
        <div className="flex m-auto">
          <Link href="/me">
            <PlayerAvatar
              name={userName ?? "??"}
              image={userImage ?? null}
              fallbackColor={avatarColor(session.user.id)}
              sizeClass="size-12"
              pixels={48}
              textClass="text-sm"
            />
          </Link>
        </div>
        <div className="flex flex-col text-gray-300 p-2 text-sm gap-1">
          <h1 className="">{userName}</h1>
          <h2 className="uppercase">{displayStatus}</h2>
        </div>
      </div>

      <Link href={"/me"}>
        <h1 className="text-gray-300 text-lg hover:text-vdcRed">
          My Profile
        </h1>
      </Link>
      <SignOut />
    </div>
  );
}
