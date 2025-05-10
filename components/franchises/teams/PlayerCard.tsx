"use client";

import DiscordBadge from "@/components/buttons/DiscordBadge";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlayerCard({ player }: { player }) {
  const goToProfile = () => router.push(`/profile/${player.name}`);
  const router = useRouter();
  const discordAccount = player.Accounts.find(
    (account) => account.provider === "discord"
  );
  // console.log(discordAccount)
  const isCaptain = player.Captain;
  console.log(player);
  return (
    <>
      <div className="flex flex-row items-center gap-3 rounded-md bg-[#353543] px-3 py-2 drop-shadow-lg text-gray-300 w-full max-w-xs">
        <div className="relative flex flex-row">
          <Image
            src={player.image}
            alt={player.name}
            width={250}
            height={250}
            className="inline-block size-10 rounded-full my-auto text-xs"
          />
          {isCaptain && (
            <ShieldCheckIcon className="absolute size-6 text-amber-400 z-0 -right-3 -top-1" />
          )}
        </div>
        <div className="w-52 my-auto border-r-1 border-vdcBlack">
          <h2
            className="italic text-sm xl:text-md hover:cursor-pointer hover:text-vdcRed hover:underline text-start"
            onClick={goToProfile}
          >
            {player.riotName}
          </h2>
        </div>
        <div>
          <Link
            href={`https://discord.com/users/${discordAccount.providerAccountId}`}
            className="hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DiscordBadge image={"/external/discord-logo.svg"} name={""} />
          </Link>
        </div>
      </div>
    </>
  );
}
