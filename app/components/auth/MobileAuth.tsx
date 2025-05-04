"use client";

import { useSession } from "next-auth/react";
import SignIn from "./SignIn";
import Link from "next/link";
import Image from "next/image";
import SignOut from "./SignOut";

export default function MobileAuth() {
  const { data: session } = useSession();
  if (!session)
    return (
      <>
        <div className="flex flex-col gap-2">
          <h1 className="text-gray-200 italic px-4 text-lg">Not signed in.</h1>
          <SignIn />
        </div>
      </>
    );

  const userAvatar = session?.user?.image;
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="flex flex-row gap-4">
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
        <div className="flex flex-col text-gray-300 p-2 text-md">
          <h1 className="italic">name</h1>
          <h2 className="italic">team</h2>
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
