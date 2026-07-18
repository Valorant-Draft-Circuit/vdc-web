"use client";

import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { MAP_LIST_URL } from "@/lib/common/constants/maps";
import { XMarkIcon, TrashIcon } from "@heroicons/react/16/solid";
import { MapBansSide, MapBanType } from "@prisma/client";
import { MatchTeam } from "@/lib/queries/match/match";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type MapBanInput = {
  id: number;
  matchID: number;
  order: number;
  type: MapBanType;
  team: number | null;
  map: string | null;
  side: MapBansSide | null;
  gameId?: string;
};

export default function MapBan({
  mapBan,
  teams,
  maps,
  delay = 0,
}: {
  mapBan: MapBanInput;
  teams: {
    home: MatchTeam | null | undefined;
    away: MatchTeam | null | undefined;
  };
  maps: Record<string, string>;
  delay?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimateIn(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const updateParam = (key: string, value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const mapUuid = maps[mapBan.map?.toUpperCase() ?? ""];
  const { home, away } = teams;
  const decidingTeam = mapBan.team === home?.id ? home : away;
  const isBan = mapBan.type === MapBanType.BAN;
  const isDiscard = mapBan.type === MapBanType.DISCARD;

  return (
    <div
      className={`relative xl:w-72 transform transition-all duration-300 ease-out
        ${animateIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        ${mapBan.gameId && "hover:cursor-pointer hover:brightness-90"}
        ${
          params.get("game") === mapBan.gameId &&
          "border-1 border-vdcRed rounded-lg"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => updateParam("game", mapBan.gameId ?? "")}
    >
      {mapUuid && (
        <Image
          alt={mapBan.map ?? ""}
          src={MAP_LIST_URL(mapUuid)}
          width={5000}
          height={5000}
          className={`absolute inset-0 -z-10 size-full object-cover rounded-lg ${
            isBan || isDiscard
              ? "grayscale brightness-35 dark:brightness-30"
              : "brightness-55 dark:brightness-50"
          }`}
        />
      )}
      <div className="flex flex-row xl:flex-col gap-5 p-5 justify-between">
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
            alt={decidingTeam?.name ?? ""}
            src={`${TEAM_LOGOS_URL}${decidingTeam?.Franchise.Brand?.logo}`}
            width={5000}
            height={5000}
            className="size-10 xl:size-20"
          />
        </div>
      </div>
    </div>
  );
}
