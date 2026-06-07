import { auth } from "@/lib/auth/auth";
import SignIn from "./SignIn";
import Image from "next/image";
import SignOut from "./SignOut";
import Link from "next/link";
import { getUser } from "@/lib/queries/user/user";
import {
  getManagementTitle,
  getUserStatus,
} from "@/lib/common/auth/auth-utils";
import { getManagerFranchiseSlug } from "@/lib/queries/franchises/getManagerFranchiseSlug";

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
        <h1 className="italic">{user?.name}</h1>
        <h1>{status}</h1>
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
