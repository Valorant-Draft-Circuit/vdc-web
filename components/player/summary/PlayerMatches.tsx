import LoadingSpinner from "@/components/theme/LoadingSpinner";
import { getAgentsCached, getMapsCached } from "@/lib/common/cache";
import {
  AGENTS,
  AGENTURL,
  MAP_LIST_URL,
  MAPS,
  TEAM_LOGOS_URL,
} from "@/lib/common/constants";
import { TAgents, TMaps } from "@/lib/common/valorant-api";
import { GameType, Tier } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlayerMatches({
  stats,
  gameType,
}: {
  stats;
  gameType;
}) {
  const total = stats.length;
  return (
    <div className="divide-y">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">{gameType} Match History</h1>
      </div>
      <div>
        <ul role="list" className="flex flex-col gap-2 pt-2">
          {[...stats].reverse().map((stat, i) => (
            <Match
              stat={stat}
              gameType={gameType}
              key={stat.id}
              matchCount={total - i}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Match({ stat, gameType, matchCount }: { stat; gameType; matchCount }) {
  const [maps, setMaps] = useState<TMaps>();
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

  const map: string = stat.Game.map;
  let mapUrl;
  if (map) {
    mapUrl = MAP_LIST_URL(maps[map.toUpperCase()]);
  }

  if (gameType === GameType.COMBINE) {
    return ComebineGame({ stat, date, matchCount, mapUrl });
  } else {
    return SeasonGame({ stat, maps, router, date });
  }
}

function ComebineGame({
  stat,
  date,
  matchCount,
  mapUrl,
}: {
  stat;
  date;
  matchCount;
  mapUrl;
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
    ["A", stat.ratingAttack.toFixed(2)],
    ["D", stat.ratingDefense.toFixed(2)],

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
          width={5000}
          height={5000}
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
              } text-xs italic`}
            >
              {date} - {tier} COMBINE #{matchCount}
            </h1>
            {stat.Game.map && (
              <h1
                className={`${
                  mapUrl ? "text-vdcWhite" : "dark:text-vdcWhite text-vdcGrey"
                } text-xs italic`}
              >
                {stat.Game.map}
              </h1>
            )}
          </div>
          <div className="flex flex-row py-2 justify-between w-full">
            <IndividualOverview stat={stat} mapUrl={mapUrl} />
            <div className="m-auto grid grid-rows-2 grid-flow-col gap-1 xl:gap-2 text-xs italic">
              {statPairs.map(([label, value], i) => (
                <h1 key={i}>
                  {label}: <span className="text-gray-400">{value}</span>
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
}: {
  stat;
  maps;
  router;
  date;
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
    home: { id: stat.Game.Match.home },
    away: { id: stat.Game.Match.away },
  };
  const matchDay = stat.Game.Match.matchDay;
  const map: string = stat.Game.map;
  let mapUrl;
  if (map) {
    mapUrl = MAP_LIST_URL(maps[map.toUpperCase()]);
  }
  const goToGame = () =>
    router.push(`/match/${stat.Game.Match.matchID}?game=${stat.Game.gameID}`);
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
              } text-xs italic`}
            >
              {result} - {date} - MD{matchDay}
            </h1>
          </div>
          <div className="flex flex-row py-2 justify-between w-full">
            <IndividualOverview stat={stat} mapUrl={mapUrl} />
            <GameInfo stat={stat} />
            <Lobby teams={teams} />
          </div>
          <div className="flex flex-row">
            <IndividualStats stats={stat} mapUrl={mapUrl} />
          </div>
        </div>
      </li>
    </div>
  );
}

function IndividualStats({ stats, mapUrl }: { stats; mapUrl }) {
  const atk = stats.ratingAttack;
  const def = stats.ratingDefense;
  const rating = ((atk + def) / 2).toFixed(2);
  let damageStats, damageStatsName;
  if (stats.Game.rounds) {
    damageStatsName = "ADR";
    damageStats = (stats.damage / stats.Game.rounds).toFixed(2);
  } else {
    damageStatsName = "TOTAL DMG";
    damageStats = stats.damage;
  }
  const hs = stats.hsPercent.toFixed(2);
  const statsList = [
    { name: "Rating", value: rating },
    { name: "ACS", value: stats.acs },
    { name: damageStatsName, value: damageStats },
    { name: "HS%", value: `${hs}%` },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full px-2 pt-1 mx-auto">
      {statsList.map((stat, index) => (
        <div key={index} className="flex flex-col text-xs text-center italic">
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

function IndividualOverview({ stat, mapUrl }: { stat; mapUrl }) {
  const [agents, setAgents] = useState<TAgents>();
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

  const k = stat.kills;
  const d = stat.deaths;
  const a = stat.assists;
  const agent: string = stat.agent;

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

function GameInfo({ stat }: { stat }) {
  const playerTeam = stat.team;
  const game = stat.Game;
  const map = game.map;

  let isHome = false;
  let teamScore;
  let opponentScore;
  if (playerTeam === game.Match.home) isHome = true;
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

function Lobby({ teams }: { teams }) {
  const home = teams.home;
  const away = teams.away;
  return (
    <div className="m-auto flex flex-row text-center gap-1 xl:gap-2">
      <TeamLogo team={home} />
      <h1 className="text-xs my-auto italic text-gray-400">VS</h1>
      <TeamLogo team={away} />
    </div>
  );
}

type TTeamInfo = {
  slug: string;
  tier: Tier;
};

function TeamLogo({ team }: { team }) {
  const [teamURL, setTeamURL] = useState("");
  const [teamInfo, setTeamInfo] = useState<TTeamInfo>();

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`/api/teams/${team.id}`, {
          cache: "force-cache",
        });
        if (!res.ok) {
          throw new Error(`Error fetching team info: ${res.status}`);
        }
        const data = await res.json();
        const info = { slug: data.Franchise.slug, tier: data.tier };
        setTeamInfo(info);
        setTeamURL(data.Franchise.Brand.logo);
      } catch (err) {
        console.error(err);
        setTeamURL("/vdc-flame.svg");
      }
    }
    fetchTeam();
  }, [team.id]);

  if (!teamURL) {
    return (
      <div className="flex flex-row text-xs drop-shadow-md animate-pulse">
        <div className="bg-vdcGrey size-10 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-row text-xs drop-shadow-md hover:brightness-90 hover:cursor-pointer">
      <Link
        onClick={(e) => {
          e.stopPropagation();
        }}
        href={`/franchises/${teamInfo?.slug}?team=${teamInfo?.tier}`}
      >
        <Image
          src={`${TEAM_LOGOS_URL}${teamURL}`}
          alt={team.id}
          width={500}
          height={500}
          className="size-10 m-auto text-center w-fit"
        />
      </Link>
    </div>
  );
}
