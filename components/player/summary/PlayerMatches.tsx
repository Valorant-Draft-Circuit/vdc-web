"use client";

import LoadingSpinner from "@/components/theme/LoadingSpinner";
import { getAgentsCached, getMapsCached } from "@/lib/common/cache";
import { TEAM_LOGOS_URL } from "@/lib/common/constants/urls";
import { AGENTS, AGENTURL } from "@/lib/common/constants/agents";
import { normalizeAgentName } from "@/lib/common/agents";
import {
  TIER_BG_GRADIENT_MAP,
  TIER_BG_MAP,
  TIER_OUTLINE_MAP,
} from "@/lib/common/constants/tiers";
import { MAP_LIST_URL, MAPS } from "@/lib/common/constants/maps";
import { Agents, Maps } from "@/lib/common/valorant-api";
import { GameType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;
import { useEffect, useState } from "react";
import { StatsPayload } from "./PlayerSummary";
import type { TeamLogoInfo, TeamLogoMap } from "@/lib/queries/teams/teams";
import type { MatchLobbyContext, MatchStatRanks } from "@/lib/common/match";
import StatRankBadge from "./StatRankBadge";
import RosterColumns from "./RosterColumns";

export default function PlayerMatches({
  stats,
  gameType,
  teamMap,
  lobbyContextByStatId,
}: {
  stats: StatsPayload[];
  gameType: string | undefined;
  teamMap: TeamLogoMap;
  lobbyContextByStatId: Record<number, MatchLobbyContext>;
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
              lobbyContext={lobbyContextByStatId[stat.id]}
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
  lobbyContext,
}: {
  stat: StatsPayload;
  gameType: string | undefined;
  matchCount: number;
  teamMap: TeamLogoMap;
  lobbyContext: MatchLobbyContext | undefined;
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
    return ComebineGame({ stat, date, matchCount, mapUrl, lobbyContext });
  } else {
    return SeasonGame({ stat, maps, router, date, teamMap, lobbyContext });
  }
}

function ComebineGame({
  stat,
  date,
  matchCount,
  mapUrl,
  lobbyContext,
}: {
  stat: StatsPayload;
  date: string;
  matchCount: number;
  mapUrl: string | undefined;
  lobbyContext: MatchLobbyContext | undefined;
}) {
  const tier = stat.Game.tier;
  const tierBgColor = TIER_BG_MAP[tier];
  const tierBgFrom = TIER_BG_GRADIENT_MAP[tier];
  const tierOutlineColor = TIER_OUTLINE_MAP[tier];

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
                  {label}:{" "}
                  <span className="text-gray-400 text-center xl:text-start">
                    {value}
                  </span>
                </h1>
              ))}
            </div>
          </div>
          <div className="flex flex-row">
            <IndividualStats
              stats={stat}
              mapUrl={mapUrl}
              ranks={lobbyContext?.ranks}
            />
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
  lobbyContext,
}: {
  stat: StatsPayload;
  maps: Maps;
  router: Router;
  date: string;
  teamMap: TeamLogoMap;
  lobbyContext: MatchLobbyContext | undefined;
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
  const isMvp = lobbyContext?.isMvp ?? false;
  return (
    <div className="relative rounded-md">
      <Image
        alt="map"
        src={mapUrl}
        width={5000}
        height={5000}
        className="absolute inset-0 -z-10 size-full object-cover brightness-30 rounded-md"
      />
      {isMvp && (
        <h2 className="absolute -top- right-0 z-10 rounded-tr-md rounded-bl-md bg-linear-to-tl from-yellow-400 to-yellow-100 px-2 py-0.5 text-[10px] leading-none text-gray-900">
          MVP
        </h2>
      )}
      <li
        key={stat.id}
        onClick={goToGame}
        className={`${
          result === "Victory" ? "bg-vdcBlue/30" : "bg-vdcRed/30"
        } ${
          isMvp ? "ring-1 ring-yellow-400" : ""
        } p-2 rounded-md hover:opacity-90 hover:cursor-pointer`}
      >
        <div
          className={`${
            mapUrl ? "text-vdcWhite" : "dark:text-vdcWhite text-vdcGrey"
          } flex flex-col`}
        >
          <div
            className={`${
              mapUrl
                ? "border-vdcWhite"
                : "border-vdcBlack dark:border-vdcWhite"
            } flex flex-row gap-2 border-b xl:hidden`}
          >
            <h1
              className={`${
                mapUrl ? "text-vdcWhite" : "dark:text-vdcWhite text-vdcGrey"
              } text-xs `}
            >
              {result} - {date} - MD{matchDay}
            </h1>
          </div>
          <div className="flex flex-row py-2 justify-between w-full xl:grid xl:grid-cols-[1fr_auto_1fr] xl:items-center xl:gap-x-8">
            <div className="contents xl:flex xl:flex-row xl:justify-evenly xl:items-center">
              <div className="m-auto flex flex-col gap-1 text-center">
                <IndividualOverview stat={stat} mapUrl={mapUrl} />
                <h1
                  className={`${
                    mapUrl ? "text-gray-400" : "text-vdcGrey dark:text-gray-400"
                  } hidden xl:block text-xs`}
                >
                  {date} - MD{matchDay}
                </h1>
              </div>
              <div className="contents xl:hidden">
                <Lobby teams={teams} teamMap={teamMap} />
              </div>
              <div className="hidden xl:block">
                <IndividualStats
                  stats={stat}
                  mapUrl={mapUrl}
                  ranks={lobbyContext?.ranks}
                />
              </div>
            </div>
            <GameInfo stat={stat} result={result} />
            <div className="hidden xl:flex xl:flex-row xl:justify-evenly xl:items-center">
              {lobbyContext?.rosters && (
                <RosterColumns rosters={lobbyContext.rosters} />
              )}
              <Lobby teams={teams} teamMap={teamMap} />
            </div>
          </div>
          <div
            className={`${
              mapUrl
                ? "border-vdcWhite"
                : "border-vdcBlack dark:border-vdcWhite"
            } flex flex-row border-t xl:hidden`}
          >
            <IndividualStats
              stats={stat}
              mapUrl={mapUrl}
              ranks={lobbyContext?.ranks}
            />
          </div>
        </div>
      </li>
    </div>
  );
}

function IndividualStats({
  stats,
  mapUrl,
  ranks,
}: {
  stats: StatsPayload;
  mapUrl: string | undefined;
  ranks: MatchStatRanks | undefined;
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
    { name: "Rating", value: rating, statRank: ranks?.rating ?? null },
    { name: "ACS", value: stats.acs, statRank: ranks?.acs ?? null },
    { name: damageStatsName, value: damageStats, statRank: ranks?.adr ?? null },
    { name: "HS%", value: `${hs}%`, statRank: ranks?.hs ?? null },
  ];

  return (
    <div className="grid grid-cols-4 xl:grid-cols-1 gap-2 xl:gap-1 w-full xl:w-auto px-2 pt-1 mx-auto">
      {statsList.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col xl:flex-row xl:items-center xl:justify-between xl:gap-3 text-xs text-center"
        >
          <h1 className={`${mapUrl ? "text-gray-200" : "dark:text-gray-200"}`}>
            {stat.name}
          </h1>
          <div className="flex flex-row gap-1 justify-center items-center">
            <h1
              className={`${mapUrl ? "text-gray-400" : "dark:text-gray-400"}`}
            >
              {stat.value}
            </h1>
            <StatRankBadge statRank={stat.statRank} />
          </div>
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
          src={AGENTURL(agents[normalizeAgentName(agent)])}
          alt={agent}
          width={500}
          height={500}
          className="size-10 xl:size-14 text-xs rounded-md"
        />
      </div>
      <div className="flex w-28 flex-col gap-1 my-auto text-center tabular-nums">
        <h1 className={`${mapUrl ? "text-vdcWhite" : ""} text-md`}>
          <span className="text-vdcGreen">{k}</span> /{" "}
          <span className="text-vdcRed">{d}</span> /{" "}
          <span className="text-vdcBlue">{a}</span>
        </h1>
        <h1
          className={`${
            mapUrl ? "text-gray-400" : "text-vdcGrey dark:text-gray-400"
          } text-sm`}
        >
          {kda} KDA
        </h1>
      </div>
    </div>
  );
}

function GameInfo({ stat, result }: { stat: StatsPayload; result: string }) {
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
    <div className="m-auto order-2 xl:order-none flex flex-col text-center">
      <h1 className="hidden xl:block xl:text-base">{result}</h1>
      {map && (
        <h1 className="text-xs xl:text-sm text-gray-400 text-center">{map}</h1>
      )}
      <h1 className="text-xl xl:text-2xl text-gray-400">
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
    <div className="m-auto order-3 xl:order-none flex flex-row text-center gap-1 xl:gap-2">
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
          className="size-10 xl:size-12 m-auto text-center w-fit"
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
          className="size-10 xl:size-12 m-auto text-center w-fit"
        />
      </Link>
    </div>
  );
}
