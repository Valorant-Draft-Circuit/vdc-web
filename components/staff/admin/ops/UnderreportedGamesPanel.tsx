import Link from "next/link";
import { format } from "date-fns";
import { ScrollRevealList } from "@/components/theme/ScrollRevealList";
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
  const gameRows = data.games.map((game) => {
    const rowBody = <GameRowBody game={game} />;
    if (game.matchID === null) {
      return (
        <li key={game.gameID} className="block py-1.5">
          {rowBody}
        </li>
      );
    }
    return (
      <li key={game.gameID}>
        <Link
          href={`/match/${game.matchID}?game=${game.gameID}`}
          className="block py-1.5 hover:bg-gray-50 dark:hover:bg-vdcBlack/40"
        >
          {rowBody}
        </Link>
      </li>
    );
  });

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

function GameRowBody({ game }: { game: UnderreportedGame }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2 text-xs text-gray-400">
        <h2>
          {game.tier} · {game.gameType}
        </h2>
        <h2>
          {game.statCount}/{EXPECTED_PLAYER_STATS_PER_GAME}
        </h2>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <h2 className="text-vdcBlue">{game.map ?? "Unknown map"}</h2>
        <h2 className="text-gray-400">{format(game.datePlayed, "MMM d")}</h2>
      </div>
    </>
  );
}
