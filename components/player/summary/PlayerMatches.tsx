import { AGENTS, AGENTURL } from "@/lib/common/constants";
import Image from "next/image";

export default function PlayerMatches({ stats }: { stats }) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden">
      <div className="px-4 py-2 xl:px-6">
        <h1 className="text-sm italic">Match History</h1>
      </div>
      <div>
        <ul role="list" className="flex flex-col gap-2 divide-gray-200 pt-2">
          {[...stats].reverse().map((stat) => (
            <Match stat={stat} key={stat.id} />
          ))}
        </ul>
      </div>
      <div></div>
    </div>
  );
}

function Match({ stat }: { stat }) {
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
  const matchDay = stat.Game.Match.matchDay;

  return (
    <li
      key={stat.id}
      className={`${
        result === "Victory" ? "bg-vdcBlue/30" : "bg-vdcRed/30"
      } p-2  rounded-md`}
    >
      <div className="flex flex-col divide-y-1">
        <div className="flex flex-row gap-2">
          <h1 className="text-xs italic">
            {result} - {date} - MD{matchDay}
          </h1>
        </div>
        <div className="flex flex-row py-2 justify-between w-full">
          <IndividualOverview stat={stat} />
          <GameInfo stat={stat} />
          <Lobby />
        </div>
        <div className="flex flex-row">
          <IndividualStats stats={stat} />
        </div>
      </div>
    </li>
  );
}

function IndividualStats({ stats }: { stats }) {
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
          <h1 className="text-vdcBlack dark:text-gray-200">{stat.name}</h1>
          <h1 className="text-gray-500 dark:text-gray-400">{stat.value}</h1>
        </div>
      ))}
    </div>
  );
}

function IndividualOverview({ stat }: { stat }) {
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
        <h1 className="text-sm">
          <span className="text-vdcGreen">{k}</span> /{" "}
          <span className="text-vdcRed">{d}</span> /{" "}
          <span className="text-vdcBlue">{a}</span>
        </h1>
        <h1 className="text-xs text-vdcGrey dark:text-gray-400">{kda} KDA</h1>
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
  if (playerTeam === game.Match.home) {
    isHome = true;
  }
  if (isHome) {
    teamScore = game.roundsWonHome;
    opponentScore = game.roundsWonAway;
  } else {
    teamScore = game.roundsWonAway;
    opponentScore = game.roundsWonHome;
  }

  return (
    <div className="m-auto flex flex-col text-center">
      {map && (
        <h1 className="text-xs text-vdcGrey dark:text-gray-400 text-center">
          {map}
        </h1>
      )}
      <h1 className="text-xl">
        <span className="text-vdcGreen">{teamScore}</span> :{" "}
        <span className="text-vdcRed">{opponentScore}</span>
      </h1>
    </div>
  );
}

function Lobby() {
  const team1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
  return (
    <div className="m-auto flex flex-col xl:flex-row text-center gap-1">
      <div className="flex flex-row text-xs">
        {team1.map((player) => (
          <Image
            key={player.id}
            src={
              "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png"
            }
            alt="agent"
            width={500}
            height={500}
            className="size-4"
          />
        ))}
      </div>
      <h1 className="text-xs my-auto italic text-vdcGrey dark:text-gray-400">
        VS
      </h1>
      <div className="flex flex-row text-xs">
        {team1.map((player) => (
          <Image
            key={player.id}
            src={
              "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png"
            }
            alt="agent"
            width={500}
            height={500}
            className="size-4"
          />
        ))}
      </div>
    </div>
  );
}
