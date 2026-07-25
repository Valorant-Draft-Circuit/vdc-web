import { auth } from "@/lib/auth/auth";
import SignIn from "./SignIn";
import PlayerAvatar from "@/components/theme/PlayerAvatar";
import { avatarColor } from "@/lib/common/avatar";
import SignOut from "./SignOut";
import Link from "next/link";
import { getUser } from "@/lib/queries/user/user";
import {
  getManagementTitle,
  getUserStatus,
} from "@/lib/common/auth/auth-utils";
import { getManagerFranchiseSlug } from "@/lib/queries/franchises/franchises";

export default async function AuthSection() {
  const session = await auth();
  if (!session) return <SignIn />;

  const userAvatar = session?.user?.image;
  if (!session.user?.id) {
    return <SignOut />;
  }
  const user = await getUser(session.user?.id);
  let status = await getUserStatus(user);
  if (!status) {
    const userRoles = BigInt(user!.roles);
    const managementTitle = getManagementTitle(userRoles);
    const franchiseSlug = await getManagerFranchiseSlug(user!.id);
    if (!franchiseSlug || franchiseSlug === undefined) {
      status = "Please Contact Tech";
    } else {
      status = `${franchiseSlug} ${managementTitle}`;
    }
  }

  return (
    <div className="flex flex-row space-x-2">
      <div className="flex flex-col text-vdcWhite p-2 items-end text-sm ">
        <Link href="/player/me" className="hover:text-vdcRed hover:underline">
          <h1 className="">{user?.name}</h1>
        </Link>
        <h1>{status}</h1>
      </div>
      <div className="flex m-auto">
        <Link href="/me">
          <PlayerAvatar
            name={user?.name ?? "??"}
            image={userAvatar ?? null}
            fallbackColor={avatarColor(session.user.id)}
            sizeClass="size-12"
            pixels={48}
            textClass="text-sm"
            userId={session.user.id}
          />
        </Link>
      </div>
      <div className="flex m-auto pl-4 ">
        <SignOut />
      </div>
    </div>
  );
}
