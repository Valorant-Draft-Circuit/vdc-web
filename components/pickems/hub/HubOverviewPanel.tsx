import { Tier } from "@prisma/client";
import { getHubOverview } from "@/lib/queries/pickems/getHubOverview";
import { getLeaderboard } from "@/lib/queries/pickems/getLeaderboard";
import { getGroupLeaderboard } from "@/lib/queries/pickems/getGroupLeaderboard";
import BoardScopePills from "./BoardScopePills";
import StandingHero from "./StandingHero";
import StageCards from "./StageCards";
import TopTenBoard from "./TopTenBoard";
import TopGroupsBoard from "./TopGroupsBoard";

type Props = {
  tier: Tier;
  season: number;
  userId: string | null;
  accent: string;
  boardTier: Tier | null;
};

export default async function HubOverviewPanel({
  tier,
  season,
  userId,
  accent,
  boardTier,
}: Props) {
  const [overview, overallBoard, tierBoard, groupBoard] = await Promise.all([
    getHubOverview(tier, season, userId),
    getLeaderboard(season, null, { kind: "global" }),
    boardTier
      ? getLeaderboard(season, boardTier, { kind: "global" })
      : Promise.resolve(null),
    getGroupLeaderboard(season, boardTier),
  ]);

  const myIndex = userId
    ? overallBoard.findIndex((row) => row.userId === userId)
    : -1;
  const myRow = myIndex >= 0 ? overallBoard[myIndex] : null;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;

  const boardRows = tierBoard ?? overallBoard;

  return (
    <div className="flex flex-col gap-4">
      <StandingHero
        row={myRow}
        rank={myRank}
        totalPlayers={overallBoard.length}
        loggedIn={userId !== null}
      />
      <StageCards
        overview={overview}
        tier={tier}
        season={season}
        accent={accent}
      />
      <BoardScopePills tier={tier} season={season} boardTier={boardTier} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopTenBoard
          rows={boardRows.slice(0, 10)}
          season={season}
          accent={accent}
          tier={tier}
          boardTier={boardTier}
        />
        <TopGroupsBoard
          rows={groupBoard.slice(0, 10)}
          season={season}
          boardTier={boardTier}
        />
      </div>
    </div>
  );
}
