"use client";

import {
  STATUS_LABELS,
  TEAM_LOGOS_URL,
  TIER_COLOR_MAP,
} from "@/lib/common/constants";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { isUserPlaying } from "@/lib/common/utils";

export default function PlayerCard({ player, mmrShow }) {
  const isPlaying = isUserPlaying(player);

  return (
    <Link
      key={player.id}
      href={`/player/${player.discordId}`}
      className="flex flex-row h-28 w-88 items-center gap-2 p-2 text-xs rounded-xl hover:scale-102 transition-all duration-100 ease-in-out bg-gradient-to-br from-slate-100 to-slate-300 dark:from-vdcGrey dark:to-vdcBlack drop-shadow-sm"
    >
      <ImageWithFallback
        src={player.image}
        fallbackSrc={"/vdc-flame.svg"}
        className="mx-auto size-fit rounded-full"
        alt={`${player.discordName} avatar`}
        width={500}
        height={500}
      />

      <div className="flex-1">
        <h1>{player.discordName}</h1>
        {isPlaying && (
          <h1 className={`text-${TIER_COLOR_MAP[player.tier]}`}>
            {player.tier}
          </h1>
        )}
        <h2 className="text-gray-700 dark:text-gray-300">{STATUS_LABELS[player.leagueStatus]}</h2>

        {player.teamName && (
          <div className="flex flex-col">
            <div className="flex flex-row gap-1">
              <h2 className="truncate max-w-30 text-center my-auto text-gray-600 dark:text-gray-300">
                {player.franchiseSlug} | {player.teamName}
              </h2>
              {player.franchiseLogo && (
                <Image
                  src={`${TEAM_LOGOS_URL}${player.franchiseLogo}`}
                  alt={`${player.teamName} logo`}
                  width={100}
                  height={100}
                  className="size-5"
                />
              )}
            </div>
          </div>
        )}
      </div>
      {player.riotIGN && (
        <div className="text-right truncate">
          <h1>{player.riotIGN}</h1>
          {mmrShow && isPlaying && player.mmrEffective && (
            <h1>MMR: {player.mmrEffective}</h1>
          )}
        </div>
      )}
    </Link>
  );
}

export const ImageWithFallback = (props) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...rest}
      alt=""
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};
