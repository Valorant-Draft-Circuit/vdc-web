"use client";

import { useSession } from "next-auth/react";
import SignIn from "./SignIn";
import Link from "next/link";
import Image from "next/image";
import SignOut from "./SignOut";
import { determineTeam } from "./AuthSection";
import { useEffect, useState } from "react";
import LoadingSpinner from "../theme/LoadingSpinner";
import { TUser } from "@/lib/queries/user/user";

export default function MobileAuth() {
  const [user, setUser] = useState<TUser>();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function getUserInfo() {
    try {
      setLoading(true);
      const res = await fetch(`/api/player/user/${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserInfo();
  }, [session]);

  if (!session)
    return (
      <>
        <div className="flex flex-col gap-2">
          <h1 className="text-gray-200 italic px-4 text-lg">Not signed in.</h1>
          <SignIn />
        </div>
      </>
    );

  const userImage = session?.user?.image;
  const userName = user?.name;
  let team;
  if (user) {
    team = determineTeam(user);
  } else {
    team = "Loading...";
  }

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
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <h1 className="italic">{userName}</h1>
              <h2 className="italic">{team}</h2>
            </>
          )}
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
