"use client";

import LoadingSpinner from "@/components/theme/LoadingSpinner";
import { getAgentsCached, getMapsCached } from "@/lib/common/cache";
import {
  AGENTS,
  AGENTURL,
  MAP_LIST_URL,
  MAPS,
  TEAM_LOGOS_URL,
} from "@/lib/common/constants";
import { Agents, Maps } from "@/lib/common/valorant-api";
import { GameType, Tier } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;
import { useEffect, useState } from "react";
import { StatsPayload } from "./PlayerSummary";
import type {
  TeamLogoInfo,
  TeamLogoMap,
} from "@/lib/queries/teams/teams";

export default function PlayerMatches({
  stats,
  gameType,
  teamMap,
}: {
  stats: StatsPayload[];
  gameType: string | undefined;
  teamMap: TeamLogoMap;
}) {
  const total = stats.length;
  return (
    <div className="divide-y">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm">{gameType} Match History</h1>
      </div>
      <div>
        <ul role="list" className="flex flex-col gap-2 pt-2">
          {[...stats].reverse().map((stat, i) => (
            <Match
              stat={stat}
              gameType={gameType}
              key={stat.id}
              matchCount={total - i}
              teamMap={teamMap}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Match({
  stat,
  gameType,
  matchCount,
  teamMap,
}: {
  stat: StatsPayload;
  gameType: string | undefined;
  matchCount: number;
  teamMap: TeamLogoMap;
}) {
  const [maps, setMaps] = useState<Maps>();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function loadMaps() {
      try {
        const data = await getMapsCached();
        if (isMounted) {
          setMaps(data);
        }
      } catch (err) {
        console.error("Failed to load maps", err);
        if (isMounted) {
          setMaps(MAPS);
        }
      }
    }
    loadMaps();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!maps) {
    return;
  }

  const date = new Date(stat.Game.datePlayed).toLocaleString(`en-US`, {
    month: `short`,
    day: `2-digit`,
    weekday: "short",
  });

  const map = stat.Game.map ?? "";
  let mapUrl;
  if (map) {
    mapUrl = MAP_LIST_URL(maps[map.toUpperCase()]);
  }

  if (gameType === GameType.COMBINE) {
    return ComebineGame({ stat, date, matchCount, mapUrl });
  } else {
    return SeasonGame({ stat, maps, router, date, teamMap });
  }
}

function ComebineGame({
  stat,
  date,
  matchCount,
  mapUrl,
}: {
  stat: StatsPayload;
  date: string;
  matchCount: number;
  mapUrl: string | undefined;
}) {
  const tier = stat.Game.tier;
  const tierBgMap: Record<Tier, string> = {
    MYTHIC: "bg-vdcPurple/15",
    EXPERT: "bg-vdcBlue/13",
    APPRENTICE: "bg-vdcGreen/7",
    PROSPECT: "bg-vdcYellow/5",
    RECRUIT: "bg-vdcOrange/10",
    MIXED: "bg-vdcRed/10",
  };

  const tierBgGradientMap: Record<Tier, string> = {
    MYTHIC: "from-vdcPurple/30",
    EXPERT: "from-vdcBlue/30",
    APPRENTICE: "from-vdcGreen/30",
    PROSPECT: "from-vdcYellow/30",
    RECRUIT: "from-vdcOrange/30",
    MIXED: "from-vdcRed/30",
  };

  const tierOutlineMap: Record<Tier, string> = {
    MYTHIC: "outline-vdcPurple",
    EXPERT: "outline-vdcBlue",
    APPRENTICE: "outline-vdcGreen",
    PROSPECT: "outline-vdcYellow",
    RECRUIT: "outline-vdcOrange",
    MIXED: "outline-vdcRed",
  };

  const tierBgColor = tierBgMap[tier];
  const tierBgFrom = tierBgGradientMap[tier];
  const tierOutlineColor = tierOutlineMap[tier];

  const statPairs = [
    ["A", (stat.ratingAttack ?? 0).toFixed(2)],
    ["D", (stat.ratingDefense ?? 0).toFixed(2)],

    ["FK", stat.firstKills],
    ["FD", stat.firstDeaths],

    ["P", stat.plants],
    ["D", stat.defuses],

    ["AEK", stat.antiEcoKills],
    ["AED", stat.antiEcoDeaths],

    ["TK", stat.tradeKills],
    ["TD", stat.tradeDeaths],

    ["KAST", `${stat.kast}%`],
    ["CLUT", stat.clutches],
  ];

  return (
    <div className="relative rounded-md">
      {mapUrl && (
        <Image
          alt="map"
          src={mapUrl}
          width={3000}
          height={3000}
          className="absolute inset-0 -z-20 size-full object-cover brightness-30 rounded-md"
        />
      )}
      <li
        key={stat.id}
        className={`${mapUrl ? tierBgColor : `bg-linear-to-tl ${tierBgFrom} to-white dark:to-vdcBlack ${tierOutlineColor} outline`} p-2 rounded-md`}
      >
        <div
          className={`${
            mapUrl
              ? "text-vdcWhite divide-vdcWhite"
              : "dark:text-vdcWhite text-vdcGrey divide-vdcBlack dark:divide-vdcWhite"
          } flex flex-col divide-y`}
        >
          <div className="flex flex-row gap-2 justify-between">
            <h1
              className={`${
                mapUrl ? "text-vdcWhite" : "dark:text-vdcWhite text-vdcGrey"
              } text-xs `}
            >
              {date} - {tier} COMBINE #{matchCount}
            </h1>
            {stat.Game.map && (
              <h1
                className={`${
                  mapUrl ? "text-vdcWhite" : "dark:text-vdcWhite text-vdcGrey"
                } text-xs `}
              >
                {stat.Game.map}
              </h1>
            )}
          </div>
          <div className="flex flex-row py-2 justify-between w-full">
            <IndividualOverview stat={stat} mapUrl={mapUrl} />
            <div className="m-auto grid grid-rows-2 grid-flow-col gap-1 xl:gap-2 text-xs ">
              {statPairs.map(([label, value], i) => (
                <h1 key={i} className="flex flex-col xl:flex-row xl:gap-2">
                  {label}: <span className="text-gray-400 text-center xl:text-start">{value}</span>
                </h1>
              ))}
            </div>
          </div>
          <div className="flex flex-row">
            <IndividualStats stats={stat} mapUrl={mapUrl} />
          </div>
        </div>
      </li>
    </div>
  );
}

function SeasonGame({
  stat,
  maps,
  router,
  date,
  teamMap,
}: {
  stat: StatsPayload;
  maps: Maps;
  router: Router;
  date: string;
  teamMap: TeamLogoMap;
}) {
  if (!stat?.Game?.Match)
    return (
      <div className="flex m-auto">
        <LoadingSpinner />
      </div>
    );

  const playerTeam = stat.team;
  let result = "Defeat";
  if (playerTeam === stat.Game.winner) {
    result = "Victory";
  }
  const teams = {
    home: { id: stat.Game.Match!.home ?? 0 },
    away: { id: stat.Game.Match!.away ?? 0 },
  };
  const matchDay = stat.Game.Match!.matchDay;
  const map = stat.Game.map ?? "";
  let mapUrl;
  if (map) {
    mapUrl = MAP_LIST_URL(maps[map.toUpperCase()]);
  }
  const goToGame = () =>
    router.push(`/match/${stat.Game.Match!.matchID}?game=${stat.Game.gameID}`);
  return (
    <div className="relative rounded-md">
      <Image
        alt="map"
        src={mapUrl}
        width={5000}
        height={5000}
        className="absolute inset-0 -z-10 size-full object-cover brightness-30 rounded-md"
      />
      <li
        key={stat.id}
        onClick={goToGame}
        className={`${
          result === "Victory" ? "bg-vdcBlue/30" : "bg-vdcRed/30"
        } p-2 rounded-md hover:opacity-90 hover:cursor-pointer`}
      >
        <div
          className={`${
            mapUrl
              ? "text-vdcWhite divide-vdcWhite"
              : "dark:text-vdcWhite text-vdcGrey divide-vdcBlack dark:divide-vdcWhite"
          } flex flex-col divide-y`}
        >
          <div className="flex flex-row gap-2">
            <h1
              className={`${
                mapUrl ? "text-vdcWhite" : "dark:text-vdcWhite text-vdcGrey"
              } text-xs `}
            >
              {result} - {date} - MD{matchDay}
            </h1>
          </div>
          <div className="flex flex-row py-2 justify-between w-full">
            <IndividualOverview stat={stat} mapUrl={mapUrl} />
            <GameInfo stat={stat} />
            <Lobby teams={teams} teamMap={teamMap} />
          </div>
          <div className="flex flex-row">
            <IndividualStats stats={stat} mapUrl={mapUrl} />
          </div>
        </div>
      </li>
    </div>
  );
}

function IndividualStats({
  stats,
  mapUrl,
}: {
  stats: StatsPayload;
  mapUrl: string | undefined;
}) {
  const atk = stats.ratingAttack ?? 0;
  const def = stats.ratingDefense ?? 0;
  const rating = ((atk + def) / 2).toFixed(2);
  let damageStats: string | number, damageStatsName: string;
  if (stats.Game.rounds) {
    damageStatsName = "ADR";
    damageStats = ((stats.damage ?? 0) / stats.Game.rounds).toFixed(2);
  } else {
    damageStatsName = "TOT DMG";
    damageStats = stats.damage ?? 0;
  }
  const hs = (stats.hsPercent ?? 0).toFixed(2);
  const statsList = [
    { name: "Rating", value: rating },
    { name: "ACS", value: stats.acs },
    { name: damageStatsName, value: damageStats },
    { name: "HS%", value: `${hs}%` },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full px-2 pt-1 mx-auto">
      {statsList.map((stat, index) => (
        <div key={index} className="flex flex-col text-xs text-center ">
          <h1 className={`${mapUrl ? "text-gray-200" : "dark:text-gray-200"}`}>
            {stat.name}
          </h1>
          <h1 className={`${mapUrl ? "text-gray-400" : "dark:text-gray-400"}`}>
            {stat.value}
          </h1>
        </div>
      ))}
    </div>
  );
}

function IndividualOverview({
  stat,
  mapUrl,
}: {
  stat: StatsPayload;
  mapUrl: string | undefined;
}) {
  const [agents, setAgents] = useState<Agents>();
  useEffect(() => {
    let isMounted = true;
    async function loadAgents() {
      try {
        const data = await getAgentsCached();
        if (isMounted) {
          setAgents(data);
        }
      } catch (err) {
        console.error("Failed to load agents", err);
        if (isMounted) {
          setAgents(AGENTS);
        }
      }
    }
    loadAgents();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!agents) {
    return;
  }

  const k = stat.kills ?? 0;
  const d = stat.deaths ?? 0;
  const a = stat.assists ?? 0;
  const agent = stat.agent ?? "";

  const kda = ((k + a) / d).toFixed(2);
  return (
    <div className="m-auto flex flex-row gap-1">
      <div className="p-1">
        <Image
          src={AGENTURL(agents[agent.toUpperCase()])}
          alt={agent}
          width={500}
          height={500}
          className="size-10 text-xs"
        />
      </div>
      <div className="flex flex-col gap-1 my-auto text-center">
        <h1 className={`${mapUrl ? "text-vdcWhite" : ""} text-sm`}>
          <span className="text-vdcGreen">{k}</span> /{" "}
          <span className="text-vdcRed">{d}</span> /{" "}
          <span className="text-vdcBlue">{a}</span>
        </h1>
        <h1
          className={`${
            mapUrl ? "text-gray-400" : "text-vdcGrey dark:text-gray-400"
          } text-xs`}
        >
          {kda} KDA
        </h1>
      </div>
    </div>
  );
}

function GameInfo({ stat }: { stat: StatsPayload }) {
  const playerTeam = stat.team;
  const game = stat.Game;
  const map = game.map;

  let isHome = false;
  let teamScore;
  let opponentScore;
  if (playerTeam === game.Match!.home) isHome = true;
  if (isHome) {
    teamScore = game.roundsWonHome;
    opponentScore = game.roundsWonAway;
  } else {
    teamScore = game.roundsWonAway;
    opponentScore = game.roundsWonHome;
  }

  return (
    <div className="m-auto flex flex-col text-center">
      {map && <h1 className="text-xs text-gray-400 text-center">{map}</h1>}
      <h1 className="text-xl text-gray-400">
        <span className="text-vdcGreen">{teamScore}</span> :{" "}
        <span className="text-vdcRed">{opponentScore}</span>
      </h1>
    </div>
  );
}

function Lobby({
  teams,
  teamMap,
}: {
  teams: { home: { id: number }; away: { id: number } };
  teamMap: TeamLogoMap;
}) {
  return (
    <div className="m-auto flex flex-row text-center gap-1 xl:gap-2">
      <TeamLogo id={teams.home.id} info={teamMap[teams.home.id]} />
      <h1 className="text-xs my-auto text-gray-400">VS</h1>
      <TeamLogo id={teams.away.id} info={teamMap[teams.away.id]} />
    </div>
  );
}

function TeamLogo({
  id,
  info,
}: {
  id: number;
  info: TeamLogoInfo | undefined;
}) {
  if (!info || !info.logoPath) {
    return (
      <div className="flex flex-row text-xs drop-shadow-md">
        <Image
          src="/vdc-flame.svg"
          alt={String(id)}
          width={500}
          height={500}
          className="size-10 m-auto text-center w-fit"
        />
      </div>
    );
  }

  const teamTierSlug = info.tier.toLowerCase();
  return (
    <div className="flex flex-row text-xs drop-shadow-md hover:brightness-90 hover:cursor-pointer">
      <Link
        onClick={(e) => {
          e.stopPropagation();
        }}
        href={`/franchises/${info.slug}?team=${teamTierSlug}`}
      >
        <Image
          src={`${TEAM_LOGOS_URL}${info.logoPath}`}
          alt={String(id)}
          width={500}
          height={500}
          className="size-10 m-auto text-center w-fit"
        />
      </Link>
    </div>
  );
}
