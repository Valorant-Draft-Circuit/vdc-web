"use client";

import DiscordBadge from "@/components/buttons/DiscordBadge";
import {
  ShieldCheckIcon,
  UserMinusIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import { ContractStatus } from "@prisma/client";
import { FranchiseTeam } from "@/lib/queries/franchises/franchises";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RosterPlayer = FranchiseTeam["Roster"][number];

export default function PlayerCard({
  player,
  mmrShow,
}: {
  player: RosterPlayer;
  mmrShow: boolean;
}) {
  const discordAccount = player.Accounts[0];
  const goToProfile = () =>
    router.push(`/player/${discordAccount.providerAccountId}`);
  const router = useRouter();
  const playerMmr = player.PrimaryRiotAccount?.MMR?.mmrEffective;

  function ContextIcons({
    pStatus,
    captain,
  }: {
    pStatus: ContractStatus | null;
    captain: RosterPlayer["Captain"];
  }) {
    if (pStatus === ContractStatus.INACTIVE_RESERVE) {
      return (
        <div className="group relative">
          <ShieldExclamationIcon className="absolute size-6 text-red-400 z-0 -right-3 -top-1" />
          <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out dark:bg-[#3d3d49] dark:text-gray-300 px-3 py-1 rounded-md drop-shadow-lg pointer-events-none whitespace-nowrap z-10 outline outline:dark:text-gray-300">
            <h2>IR</h2>
          </div>
        </div>
      );
    }
    if (pStatus === ContractStatus.ACTIVE_SUB) {
      return (
        <div className="group relative">
          <UserPlusIcon className="absolute size-6 text-amber-400 z-0 -right-3 -top-1" />
          <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out dark:bg-[#3d3d49] dark:text-gray-300 px-3 py-1 rounded-md drop-shadow-lg pointer-events-none whitespace-nowrap z-10 outline outline:dark:text-gray-300">
            <h2>Subbed In</h2>
          </div>
        </div>
      );
    }
    if (pStatus === ContractStatus.SUBBED_OUT) {
      return (
        <div className="group relative">
          <UserMinusIcon className="absolute size-6 text-amber-400 z-0 -right-3 -top-1" />
          <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out dark:bg-[#3d3d49] dark:text-gray-300 px-3 py-1 rounded-md drop-shadow-lg pointer-events-none whitespace-nowrap z-10 outline outline:dark:text-gray-300">
            <h2>Subbed Out</h2>
          </div>
        </div>
      );
    }
    if (captain) {
      return (
        <div className="group relative">
          <ShieldCheckIcon className="absolute size-6 text-amber-400 z-0 -right-3 -top-1" />
          <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out dark:bg-[#3d3d49] dark:text-gray-300 px-3 py-1 rounded-md drop-shadow-lg pointer-events-none whitespace-nowrap z-10 outline outline:dark:text-gray-300">
            <h2>Captain</h2>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center gap-3 rounded-md bg-gray-100 dark:bg-[#353543] px-3 py-2 drop-shadow-lg text-vdcGrey dark:text-gray-300 w-full min-w-sm">
        <div className="flex flex-row gap-3">
          <div className="relative flex flex-row">
            <Image
              src={player.image ?? ""}
              alt={player.name ?? ""}
              width={250}
              height={250}
              className="inline-block size-8 rounded-full my-auto text-xs"
            />
            <ContextIcons
              pStatus={player.Status?.contractStatus ?? null}
              captain={player.Captain}
            />
          </div>
          <div className="w-64 my-auto border-r-1 border-vdcBlack truncate">
            <h2
              className="italic text-xs xl:text-sm hover:cursor-pointer hover:text-vdcRed hover:underline text-start"
              onClick={goToProfile}
            >
              {player.riotName}
            </h2>
            {mmrShow && <h1 className="text-xs">{playerMmr} MMR</h1>}
          </div>
        </div>
        <div>
          <Link
            href={`https://discord.com/users/${discordAccount.providerAccountId}`}
            className="hover:opacity-80"
            target="_blank"
            rel="noreferrer"
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
