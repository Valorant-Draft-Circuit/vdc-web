"use client";

import DiscordBadge from "@/components/buttons/DiscordBadge";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { UserMinusIcon } from "@heroicons/react/24/solid";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlayerCard({ player }: { player }) {
  const discordAccount = player.Accounts[0];
  const goToProfile = () =>
    router.push(`/player/${discordAccount.providerAccountId}`);
  const router = useRouter();
  const isCaptain = player.Captain;
  const isIR = player.Status.contractStatus == "INACTIVE_RESERVE";
  const isSUB = player.Status.contractStatus == "ACTIVE_SUB";
  const isOUT = player.Status.contractStatus == "SUBBED_OUT";

  function ContextIcons({ visible, Icon, title }) {
    if (!visible) return null;

    return (
      <div className="group relative">
        <Icon className="absolute size-6 text-amber-400 z-0 -right-3 -top-1" />
        <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out dark:bg-[#3d3d49] dark:text-gray-300 px-3 py-1 rounded-md drop-shadow-lg pointer-events-none whitespace-nowrap z-10 outline outline:dark:text-gray-300">
          {title}
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-row items-center gap-3 rounded-md bg-gray-100 dark:bg-[#353543] px-3 py-2 drop-shadow-lg text-vdcGrey dark:text-gray-300 w-full max-w-xs">
        <div className="relative flex flex-row">
          <Image
            src={player.image}
            alt={player.name}
            width={250}
            height={250}
            className="inline-block size-10 rounded-full my-auto text-xs"
          />
          <ContextIcons visible={isCaptain} Icon={ShieldCheckIcon} title="Captain"/>
          <ContextIcons visible={isIR} Icon={ShieldExclamationIcon} title="IR"/>
          <ContextIcons visible={isSUB} Icon={UserPlusIcon} title="Subbed In"/>
          <ContextIcons visible={isOUT} Icon={UserMinusIcon} title="Subbed Out"/>
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
