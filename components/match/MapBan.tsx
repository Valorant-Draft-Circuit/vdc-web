"use client";

import { MAP_LIST_URL, MAPS, TEAM_LOGOS_URL } from "@/lib/common/constants";
import { XMarkIcon, TrashIcon } from "@heroicons/react/16/solid";
import { MapBanType } from "@prisma/client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MapBan({ mapBan, teams }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const updateParam = (key: string, value: string) => {
    if (value) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      return;
    }
  };

  const mapUrl = MAP_LIST_URL(MAPS[mapBan.map.toUpperCase()]);
  const isBan = mapBan.type === MapBanType.BAN;
  const isDiscard = mapBan.type === MapBanType.DISCARD;
  const { home, away } = teams;
  let decidingTeam;
  if (mapBan.team === home.id) {
    decidingTeam = home;
  } else {
    decidingTeam = away;
  }

  return (
    <div
      className={`relative xl:w-72 ${
        mapBan.gameId && "hover:cursor-pointer hover:brightness-90"
      } ${
        params.get("game") === mapBan.gameId &&
        "border-1 border-vdcRed rounded-lg"
      }`}
      onClick={() => {
        updateParam("game", mapBan.gameId);
      }}
    >
      <Image
        alt={mapBan.map}
        src={mapUrl}
        width={5000}
        height={5000}
        className={`absolute inset-0 -z-10 size-full object-cover rounded-lg ${
          isBan || isDiscard ? "grayscale brightness-40 dark:brightness-30" : "brightness-55 dark:brightness-50"
        }`}
      />
      <div className="flex flex-row xl:flex-col italic gap-5 p-5 justify-between">
        <div className="flex flex-row xl:flex-col gap-5 drop-shadow-lg text-vdcWhite my-auto xl:m-auto xl:text-center">
          <h1>{mapBan.map}</h1>
          <h1>{mapBan.type}</h1>
          {isBan ? (
            <XMarkIcon className="size-5 m-auto text-vdcRed" />
          ) : isDiscard ? (
            <TrashIcon className="size-5 m-auto text-gray-400" />
          ) : (
            <h1>{mapBan.side}</h1>
          )}
        </div>

        <div className="mt-auto xl:mt-10 self-end xl:self-center">
          <Image
            alt={decidingTeam?.name}
            src={`${TEAM_LOGOS_URL}${decidingTeam?.Franchise.Brand.logo}`}
            width={5000}
            height={5000}
            className="size-10 xl:size-20"
          />
        </div>
      </div>
    </div>
  );
}
