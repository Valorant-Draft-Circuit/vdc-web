import Game from "@/components/match/Game";
import MapBan from "@/components/match/MapBan";
import MatchStats from "@/components/match/MatchStats";
import { getMapsCached } from "@/lib/common/cache";
import {
  SECONDARY_MAP_LIST_URL,
  TEAM_LOGOS_URL,
  TIER_COLOR_MAP,
} from "@/lib/common/constants";
import { toTailwindCustomHexCode } from "@/lib/common/format";
import { getMatch, MatchDetail, MatchTeam } from "@/lib/queries/match/match";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { MapBansSide, MapBanType } from "@prisma/client";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PlayedMapBans = {
  id: number;
  matchID: number;
  order: number;
  type: MapBanType;
  team: number | null;
  map: string | null;
  side: MapBansSide | null;
  gameId?: string;
};

type Props = {
  params: Promise<{ matchId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params;
  const matchInfo = await getMatch(matchId);

  const homeTeam = matchInfo?.Home;
  const awayTeam = matchInfo?.Away;

  let matchDay = "MATCH";
  if (matchInfo?.matchDay) {
    matchDay = `MD ${matchInfo?.matchDay}`;
  }

  return {
    title: `VDC | S${matchInfo?.season} ${matchInfo?.tier} ${matchDay}: ${homeTeam?.Franchise.slug} VS ${awayTeam?.Franchise.slug}`,
    description: `Season ${matchInfo?.season} ${matchInfo?.tier} ${matchInfo?.tier}Match Day ${matchInfo?.matchDay}. ${homeTeam?.Franchise.slug} ${homeTeam?.name} VS ${awayTeam?.Franchise.slug} ${awayTeam?.name}`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { matchId } = await params;
  const matchInfo = await getMatch(matchId);
  if (!matchInfo) notFound();

  const gameParam = (await searchParams).game;
  const gameId = typeof gameParam === "string" ? gameParam : undefined;
  const gameOverview = matchInfo?.Games.find((game) => game.gameID === gameId);
  const mapPick = matchInfo?.MapBans.find(
    (mapBan) => mapBan.map === gameOverview?.map
  )?.team;

  const gameOverviewWithTeam = gameOverview
    ? { ...gameOverview, mapPick }
    : null;

  const homeTeam = matchInfo?.Home;
  const awayTeam = matchInfo?.Away;

  const teams = {
    home: homeTeam,
    away: awayTeam,
  };
  const homeTeamBrand = homeTeam?.Franchise.Brand;
  const awayTeamBrand = awayTeam?.Franchise.Brand;

  const tierColor = TIER_COLOR_MAP[matchInfo!.tier];
  const homeTeamColor = toTailwindCustomHexCode(homeTeamBrand!.colorPrimary);
  const awayTeamColor = toTailwindCustomHexCode(awayTeamBrand!.colorPrimary);

  const matchGames = matchInfo?.Games;
  const playedMapBans: PlayedMapBans[] = [];

  let homeWins = 0,
    awayWins = 0;

  matchGames?.forEach((game) => {
    if (game.winner === homeTeam?.id) homeWins++;
    else awayWins++;

    matchInfo?.MapBans.forEach((mapBan) => {
      if (game.map?.toUpperCase() === mapBan.map?.toUpperCase()) {
        playedMapBans.push({
          ...mapBan,
          gameId: game.gameID,
        });
      }
    });
  });

  const mapBans = matchInfo?.MapBans?.filter(
    (mapban) =>
      mapban.type !== MapBanType.PICK && mapban.type !== MapBanType.DECIDER
  );

  const mapBansWithGameId = [...(mapBans ?? []), ...(playedMapBans ?? [])];
  mapBansWithGameId.sort(
    (firstItem, secondItem) => firstItem.order - secondItem.order
  );
  const today = new Date();
  const matchDateObj = new Date(matchInfo!.dateScheduled);
  const isInFuture = matchDateObj > today;

  const matchDate = matchDateObj.toLocaleString(`en-US`, {
    month: `short`,
    day: `2-digit`,
    weekday: "short",
    year: `numeric`,
  });
  const hasMapBaps = matchInfo?.MapBans.length !== 0;
  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-7xl">
        <div className="relative xl:col-span-5 xl:rounded-3xl px-3 xl:px-10 py-10 overflow-hidden xl:shadow-2xl">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[var(--h)] to-[var(--a)] brightness-40 dark:brightness-20"
            style={
              {
                "--h": homeTeamColor,
                "--a": awayTeamColor,
              } as React.CSSProperties
            }
          />

          <div className="relative flex flex-col w-full">
            <div className="flex flex-row justify-between">
              <TeamIdentity team={homeTeam} teamBrand={homeTeamBrand} />
              <div className="flex flex-col text-2xl italic text-center">
                <h1 className={`text-${tierColor} text-lg`}>
                  {matchInfo?.tier}
                </h1>
                <div className="flex flex-row gap-5 italic m-auto text-4xl text-vdcRed">
                  <h1>{homeWins}</h1>
                  <h1>/</h1>
                  <h1>{awayWins}</h1>
                </div>
                <h1 className={`text-lg text-vdcRed`}>
                  {matchInfo?.matchType.replaceAll("_", " ")}
                </h1>
              </div>
              <TeamIdentity team={awayTeam} teamBrand={awayTeamBrand} />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between text-sm xl:text-lg p-2 xl:p-0 xl:py-2">
          <h1>
            SEASON {matchInfo?.season} MATCH DAY {matchInfo.matchDay}
          </h1>
          <h1>{matchDate}</h1>
        </div>
        {isInFuture ? (
          <div className="mx-10">
            <h2 className="mt-4 rounded-lg border border-vdcRed/40 bg-vdcRed/10 px-4 py-3 text-sm xl:text-lg text-center">
              This match has not been played yet! Stats and game details will be
              available after the match has been completed and submitted.
            </h2>
          </div>
        ) : (
          <>
            {gameOverview && (
              <Link href={`/match/${matchId}`}>
                <div className="bg-vdcRed p-1.5 rounded-lg text-xs xl:text-lg text-center text-vdcWhite hover:cursor-pointer hover:brightness-95">
                  <h1>MATCH OVERVIEW</h1>
                </div>
              </Link>
            )}
            {hasMapBaps ? (
              <div className="p-5 xl:p-0 xl:py-5 text-sm xl:text-lg">
                <h1>MAP BANS / PICKS</h1>
                <div className="flex flex-col xl:flex-row gap-1 mx-auto">
                  {mapBansWithGameId.map((mapBan, i) => (
                    <MapBan
                      key={mapBan.id}
                      mapBan={mapBan}
                      teams={teams}
                      delay={i * 75}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-5 xl:p-0 xl:py-5 text-sm xl:text-lg">
                <h1>Games Played</h1>
                <div className="flex flex-col gap-1 mx-auto">
                  {matchInfo.Games.map((game, i) => (
                    <Game
                      key={game.gameID}
                      game={game}
                      gameNumber={i}
                      delay={i * 75}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 p-5 xl:p-0 xl:py-5 text-sm xl:text-lg">
              {gameOverviewWithTeam && (
                <MatchOverview
                  gameOverview={gameOverviewWithTeam}
                  teams={teams}
                />
              )}
              <h1>Match Stats</h1>
              <MatchStats matchId={matchId} gameId={gameId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type MatchTeams = {
  home: MatchTeam | null | undefined;
  away: MatchTeam | null | undefined;
};

type GameOverviewWithPick = MatchDetail["Games"][number] & {
  mapPick: number | null | undefined;
};

async function MatchOverview({
  gameOverview,
  teams,
}: {
  gameOverview: GameOverviewWithPick;
  teams: MatchTeams;
}) {
  const maps = await getMapsCached();
  const map = gameOverview.map;
  const bgImage = map
    ? SECONDARY_MAP_LIST_URL(maps[map.toUpperCase()])
    : "/map-placeholder.webp";
  return (
    <>
      <h1>Game Overview</h1>
      <div className="flex flex-col gap-2 relative p-10 rounded-lg">
        <Image
          alt={gameOverview.gameID}
          src={bgImage}
          width={50000}
          height={50000}
          className={`absolute inset-0 -z-10 size-full object-cover rounded-lg ${
            map
              ? "brightness-175 dark:brightness-90"
              : "brightness-50 dark:brightness-30 object-[70%_30%]"
          }`}
        />

        <div className="flex flex-col justify-between gap-2 text-vdcWhite">
          <div className="flex flex-col text-xs xl:text-sm">
            <h2>Game type: {gameOverview.gameType}</h2>
            <h2>Rounds played: {gameOverview.rounds}</h2>
          </div>

          <div className="flex flex-row justify-between">
            <OverviewScore
              team={teams.home}
              score={gameOverview.roundsWonHome}
              isHome={true}
              pick={gameOverview.mapPick}
              winner={gameOverview.winner}
            />
            <OverviewScore
              team={teams.away}
              score={gameOverview.roundsWonAway}
              isHome={false}
              pick={gameOverview.mapPick}
              winner={gameOverview.winner}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function OverviewScore({
  team,
  score,
  isHome,
  pick,
  winner,
}: {
  team: MatchTeam | null | undefined;
  score: number;
  isHome: boolean;
  pick: number | null | undefined;
  winner: number | null;
}) {
  const mapPick = pick === team?.id;
  const isWinner = team?.id === winner;
  return (
    <div
      className={`flex flex-row gap-2 xl:gap-5 ${
        !isHome && "flex-row-reverse"
      }`}
    >
      <Image
        alt={String(team?.id)}
        src={`${TEAM_LOGOS_URL}${team?.Franchise.Brand?.logo}`}
        width={50000}
        height={50000}
        className="size-10 xl:size-15 m-auto"
      />
      <h1
        className={`text-xl m-auto xl:text-3xl ${
          isWinner ? "text-vdcGreen" : "text-vdcRed"
        }`}
      >
        {score}
      </h1>
      {mapPick && (
        <div
          className={`flex flex-row m-auto gap-2 ${
            !isHome && "flex-row-reverse"
          }`}
        >
          <CheckBadgeIcon className="size-5 m-auto text-vdcBlue" />
          <h1 className="hidden xl:block">MAP PICK</h1>
        </div>
      )}
    </div>
  );
}

function TeamIdentity({
  team,
  teamBrand,
}: {
  team: MatchTeam | null | undefined;
  teamBrand: MatchTeam["Franchise"]["Brand"] | undefined;
}) {
  const franchiseSlug = team?.Franchise.slug;

  return (
    <div className="flex flex-col text-center w-1/3 hover:brightness-80">
      <h1 className="text-vdcWhite italic">{team?.Franchise.slug}</h1>
      <Link href={`/franchises/${franchiseSlug}?team=${team?.tier}`}>
        <Image
          alt={`${teamBrand?.logo}`}
          src={`${TEAM_LOGOS_URL}${teamBrand?.logo}`}
          width={500}
          height={500}
          className="size-25 xl:size-50 drop-shadow-lg m-auto"
        />
      </Link>
      <h1 className="text-vdcWhite italic truncate">{team?.name}</h1>
    </div>
  );
}
