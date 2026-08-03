import { Tier } from "@prisma/client";
import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { getHubOverview } from "@/lib/queries/pickems/getHubOverview";
import { getLeaderboard } from "@/lib/queries/pickems/getLeaderboard";
import { getGroupLeaderboard } from "@/lib/queries/pickems/getGroupLeaderboard";
import { getAdminUserIds } from "@/lib/queries/user/user";
import StandingHero from "./StandingHero";
import StageCards from "./StageCards";
import TopTenBoard from "./TopTenBoard";
import TopGroupsBoard from "./TopGroupsBoard";
import AdminPicksBoard from "./AdminPicksBoard";

type Props = {
  stageTier: Tier;
  season: number;
  userId: string | null;
  accent: string;
  boardTier: Tier | null;
};

export default async function HubOverviewPanel({
  stageTier,
  season,
  userId,
  accent,
  boardTier,
}: Props) {
  const [overview, board, groupBoard] = await Promise.all([
    getHubOverview(stageTier, season, userId),
    getLeaderboard(season, boardTier, { kind: "global" }),
    getGroupLeaderboard(season, boardTier),
  ]);

  const myIndex = userId
    ? board.findIndex((row) => row.userId === userId)
    : -1;
  const myRow = myIndex >= 0 ? board[myIndex] : null;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;

  const adminIds = await getAdminUserIds(board.map((row) => row.userId));
  const adminRows = board.filter((row) => adminIds.has(row.userId));

  return (
    <div className="flex flex-col gap-4">
      <StandingHero
        row={myRow}
        rank={myRank}
        totalPlayers={board.length}
        loggedIn={userId !== null}
        boardTier={boardTier}
      />
      <StageCards
        overview={overview}
        tier={stageTier}
        season={season}
        accent={TIER_HEX_COLOR_MAP[stageTier]}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopTenBoard
          rows={board.slice(0, 10)}
          season={season}
          accent={accent}
          tier={stageTier}
          boardTier={boardTier}
        />
        <TopGroupsBoard
          rows={groupBoard.slice(0, 10)}
          season={season}
          boardTier={boardTier}
        />
      </div>
      <AdminPicksBoard
        rows={adminRows}
        season={season}
        accent={accent}
        boardTier={boardTier}
      />
    </div>
  );
}
