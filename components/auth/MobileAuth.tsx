import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getUserStatus } from "@/lib/common/auth/auth-utils";
import { getManagerFranchiseSlug } from "@/lib/queries/franchises/getManagerFranchiseSlug";
import { getUser } from "@/lib/queries/user/user";
import SignIn from "./SignIn";
import SignOut from "./SignOut";

export default async function MobileAuth() {
  const session = await auth();
  if (!session) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-200 italic px-4 text-lg">Not signed in.</h1>
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
            <Image
              alt="user avatar"
              src={userImage ?? ""}
              width={25}
              height={25}
              className="inline-block size-12 rounded-full"
            />
          </Link>
        </div>
        <div className="flex flex-col text-gray-300 p-2 text-sm gap-1">
          <h1 className="italic">{userName}</h1>
          <h2 className="italic uppercase">{displayStatus}</h2>
        </div>
      </div>

      <Link href={"/me"}>
        <h1 className="text-gray-300 italic text-lg hover:text-vdcRed">
          My Profile
        </h1>
      </Link>
      <SignOut />
    </div>
  );
}
