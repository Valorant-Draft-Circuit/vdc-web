import { Suspense } from "react";
import { GameType } from "@prisma/client";
import PlayerAgents from "@/components/player/PlayerAgents";
import PlayerInfo from "@/components/player/PlayerInfo";
import PlayerMaps from "@/components/player/PlayerMaps";
import PlayerNotFound from "@/components/player/PlayerNotFound";
import PlayerSummary from "@/components/player/summary/PlayerSummary";
import { PlayerSummarySkeleton } from "@/components/player/summary/PlayerSummarySkeleton";
import ListBox from "@/components/tabs/DropDown";
import HorizontalTab from "@/components/tabs/HorizontalTab";
import { TabElement } from "@/components/tabs/types";
import { getSeasonCached } from "@/lib/common/cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { listAllSeasons } from "@/lib/common/season";
import { ControlPanel } from "@/prisma";
import {
  getPlayerByRiotIGN,
  getRiotIGNByDiscordId,
} from "@/lib/queries/user/user";
import { getPlayerStatsBy } from "@/lib/queries/stats/stats";

type PlayerIGN = {
  encoded: string;
  decoded: string;
};

type Props = {
  params: Promise<{ player: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const NUMBER_REGEX = /^\d+$/;
const ENCODED_DIVIDER = encodeURIComponent("#");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { player } = await params;
  let playerIGN: string;
  if (NUMBER_REGEX.test(player)) {
    const riotIGN = await getRiotIGNByDiscordId(player);
    playerIGN = riotIGN ?? "Player";
  } else {
    playerIGN = decodeURIComponent(player);
  }
  return {
    title: `VDC | ${playerIGN}'s Player Page`,
    description: `${playerIGN} information`,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const [{ player }, sp, currentSeason, leagueState] = await Promise.all([
    params,
    searchParams,
    getSeasonCached(),
    ControlPanel.getLeagueState(),
  ]);

  if (NUMBER_REGEX.test(player)) return await handleDiscordIDSearch(player);

  const playerIGN: PlayerIGN = { encoded: "", decoded: "" };
  if (player.includes(ENCODED_DIVIDER)) playerIGN.encoded = player;
  else if (player.includes("-")) {
    const playerSplit = player.split("-");
    playerIGN.encoded = `${playerSplit[0]}${ENCODED_DIVIDER}${playerSplit[1]}`;
  } else {
    return <PlayerNotFound player={decodeURIComponent(player)} />;
  }
  playerIGN.decoded = decodeURIComponent(playerIGN.encoded);

  const listOfAllSeasons = listAllSeasons(currentSeason);
  const seasonsMenu = listOfAllSeasons.map((season) => ({
    query: season,
    name: `SEASON ${season}`,
  }));

  const gameTypeMenu = [
    { query: "season", name: "SEASON" },
    { query: "combine", name: "COMBINE" },
  ];
  if (leagueState === "COMBINES") {
    gameTypeMenu.reverse();
  }

  const defaultType = leagueState === "COMBINES" ? "combine" : "season";
  const validTypes = new Set(["season", "combine"]);
  const validBy = new Set(["summary", "agents", "maps"]);
  const validSeasons = new Set(listOfAllSeasons);

  const seasonOk = typeof sp.season === "string" && validSeasons.has(sp.season);
  const typeOk = typeof sp.type === "string" && validTypes.has(sp.type);
  const byOk = typeof sp.by === "string" && validBy.has(sp.by);

  if (!seasonOk || !typeOk || !byOk) {
    const next = new URLSearchParams();
    next.set("season", seasonOk ? (sp.season as string) : currentSeason.toString());
    next.set("type", typeOk ? (sp.type as string) : defaultType);
    next.set("by", byOk ? (sp.by as string) : "summary");
    redirect(`/player/${player}?${next.toString()}`);
  }

  const season = parseInt(sp.season as string);
  const gameTypeParam = (sp.type as string).toUpperCase() as GameType;

  const tabElements: TabElement[] = [
    {
      query: "Summary",
      color: "vdcRed",
      name: "Summary",
      content: (
        <Suspense fallback={<PlayerSummarySkeleton />}>
          <PlayerSummaryWithStats
            riotIGN={playerIGN.decoded}
            season={season}
            gameType={gameTypeParam}
            gameTypeParam={sp.type as string}
          />
        </Suspense>
      ),
    },
    {
      query: "Agents",
      color: "vdcRed",
      name: "Agents",
      content: <PlayerAgents />,
    },
    {
      query: "Maps",
      color: "vdcRed",
      name: "Maps",
      content: <PlayerMaps />,
    },
  ];

  const playerInfo = await getPlayerByRiotIGN(playerIGN.decoded);
  if (!playerInfo) return <PlayerNotFound player={playerIGN.decoded} />;
  return (
    <div className="mx-auto max-w-7xl pb-10 xl:px-8 xl:py-12">
      <div className="mx-auto xl:max-w-4xl flex flex-col gap-5">
        <PlayerInfo playerInfo={playerInfo} />
        <div className="p-2 flex flex-col xl:gap-5">
          <div className="px-10 xl:px-0 m-auto flex flex-row gap-1 xl:gap-5 w-full">
            <div className="w-full">
              <ListBox
                params={"season"}
                menuElements={seasonsMenu}
                defaultDropDownQuery={currentSeason.toString()}
              />
            </div>
            <div className="w-full">
              <ListBox
                params={"type"}
                menuElements={gameTypeMenu}
                defaultDropDownQuery={defaultType}
              />
            </div>
          </div>
          <HorizontalTab tabElements={tabElements} params={"by"} />
        </div>
      </div>
    </div>
  );
}

async function handleDiscordIDSearch(discordID: string) {
  const riotIGN = await getRiotIGNByDiscordId(discordID);
  if (riotIGN) {
    const encodedIGN = encodeURIComponent(riotIGN);
    redirect(`/player/${encodedIGN}`);
  }
  return <PlayerNotFound player={discordID} />;
}

async function PlayerSummaryWithStats({
  riotIGN,
  season,
  gameType,
  gameTypeParam,
}: {
  riotIGN: string;
  season: number;
  gameType: GameType;
  gameTypeParam: string;
}) {
  const stats = await getPlayerStatsBy({
    riotIgn: riotIGN,
    season,
    gameType,
  });
  return <PlayerSummary stats={stats ?? null} gameType={gameTypeParam} />;
}
