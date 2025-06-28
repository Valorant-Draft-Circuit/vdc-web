import {
  AGENTS,
  AGENTURL,
  MAP_LIST_URL,
  MAPS,
  TEAM_LOGOS_URL,
} from "@/lib/common/constants";
import { Tier } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlayerMatches({ stats }: { stats }) {
  return (
    <div className="divide-y">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">Match History</h1>
      </div>
      <div>
        <ul role="list" className="flex flex-col gap-2 pt-2">
          {[...stats].reverse().map((stat) => (
            <Match stat={stat} key={stat.id} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Match({ stat }: { stat }) {
  const router = useRouter();
  const date = new Date(stat.Game.datePlayed).toLocaleString(`en-US`, {
    month: `short`,
    day: `2-digit`,
    weekday: "short",
  });
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
    mapUrl = MAP_LIST_URL(MAPS[map.toUpperCase()]);
  }
  const goToGame = () =>
    router.push(`/match/${stat.Game.Match.matchID}/game/${stat.Game.gameID}`);

  return (
    <div className="relative rounded-md">
      <Image
        alt=""
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
          } flex flex-col divide-y-1`}
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
  const adr = (stats.damage / stats.Game.rounds).toFixed(2);
  const hs = stats.hsPercent.toFixed(2);
  const statsList = [
    { name: "Rating", value: rating },
    { name: "ACS", value: stats.acs },
    { name: "ADR", value: adr },
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
  const k = stat.kills;
  const d = stat.deaths;
  const a = stat.assists;
  const agent: string = stat.agent;

  const kda = ((k + a) / d).toFixed(2);
  return (
    <div className="m-auto flex flex-row gap-1">
      <div className="p-1">
        <Image
          src={AGENTURL(AGENTS[agent.toUpperCase()])}
          alt={agent}
          width={500}
          height={500}
          className="size-10"
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
