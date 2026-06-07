"use client";

import { useSession } from "next-auth/react";
import SignIn from "./SignIn";
import Link from "next/link";
import Image from "next/image";
import SignOut from "./SignOut";

import { useEffect, useState } from "react";
import LoadingSpinner from "../theme/LoadingSpinner";
import { UserWithRelations } from "@/lib/queries/user/user";
import { getUserStatus } from "@/lib/common/auth/auth-utils";

export default function MobileAuth() {
  const [user, setUser] = useState<UserWithRelations>();
  const [slug, setSlug] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    async function getUserInfo() {
      try {
        setLoading(true);
        if (!session?.user?.id) return;
        const userRes = await fetch(`/api/player/user/${session.user.id}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    getUserInfo();
  }, [session]);

  useEffect(() => {
    async function getManagementTitle() {
      try {
        setLoading(true);
        if (!session?.user?.id) return;
        const res = await fetch(
          `/api/player/manager/franchise/slug/${session.user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setSlug(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (user && !getUserStatus(user)) {
      getManagementTitle();
    }
  }, [session, user]);

  if (!session)
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-200 italic px-4 text-lg">Not signed in.</h1>
        <SignIn />
      </div>
    );

  const userImage = session?.user?.image;
  const userName = user?.name;
  const status = user ? getUserStatus(user) : undefined;

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
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <h1 className="italic">{userName}</h1>
              <h2 className="italic uppercase">{displayStatus}</h2>
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
