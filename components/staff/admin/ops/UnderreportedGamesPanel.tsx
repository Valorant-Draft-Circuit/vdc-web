import Link from "next/link";
import { format } from "date-fns";
import { CopyTextButton } from "@/components/theme/CopyTextButton";
import { ScrollRevealList } from "@/components/theme/ScrollRevealList";
import { TRACKER_MATCH_URL } from "@/lib/common/constants/urls";
import {
  EXPECTED_PLAYER_STATS_PER_GAME,
  UnderreportedGame,
  UnderreportedGames,
} from "@/lib/queries/staff/admin";

export default function UnderreportedGamesPanel({
  data,
}: {
  data: UnderreportedGames;
}) {
  const gameRows = data.games.map((game) => (
    <li key={game.gameID} className="py-1.5">
      <GameSummaryLine game={game} />
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <CopyTextButton
          text={TRACKER_MATCH_URL(game.gameID)}
          label="TRN link"
          className="text-sm"
        />
        <h2 className="text-gray-400">{format(game.datePlayed, "MMM d")}</h2>
      </div>
    </li>
  ));

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="text-sm text-gray-500 dark:text-gray-300">
        Games Missing Player Stats
      </h2>
      <h1 className="text-3xl font-semibold text-vdcRed">{data.count}</h1>
      <h2 className="text-xs text-gray-500">
        played, fewer than {EXPECTED_PLAYER_STATS_PER_GAME} stat rows
      </h2>

      {data.count === 0 ? (
        <h2 className="mt-3 text-sm text-gray-400">
          All games fully reported.
        </h2>
      ) : (
        <ScrollRevealList
          rows={gameRows}
          className="mt-3 max-h-72 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-700 dark:border-gray-700"
        />
      )}
    </div>
  );
}

function GameSummaryLine({ game }: { game: UnderreportedGame }) {
  const summary = (
    <div className="flex items-baseline justify-between gap-2 text-xs text-gray-400">
      <h2>
        {game.tier} · {game.gameType}
      </h2>
      <h2>
        {game.statCount}/{EXPECTED_PLAYER_STATS_PER_GAME}
      </h2>
    </div>
  );

  if (game.matchID === null) return summary;
  return (
    <Link
      href={`/match/${game.matchID}?game=${game.gameID}`}
      className="block hover:bg-gray-50 dark:hover:bg-vdcBlack/40"
    >
      {summary}
    </Link>
  );
}
