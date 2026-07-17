import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { summarizePlayerTeamsBySeason } from "@/lib/common/player";
import { getTeamCardsByIds } from "@/lib/queries/teams/teams";
import TeamHistoryCarousel, {
  type TeamHistorySlide,
} from "./TeamHistoryCarousel";

type TeamGameStat = {
  team: number | null;
  Game: { winner: number | null; datePlayed: Date };
};

const DISCLAIMER =
  "Teams inferred from games played; VDC does not store historical roster/contract data.";

export default async function PlayerTeamHistory({
  stats,
}: {
  stats: ReadonlyArray<TeamGameStat>;
}) {
  const summaries = summarizePlayerTeamsBySeason(stats);
  if (summaries.length === 0) return null;

  const teamCards = await getTeamCardsByIds(summaries.map((s) => s.teamId));

  const slides: TeamHistorySlide[] = [];
  for (const summary of summaries) {
    const card = teamCards[summary.teamId];
    if (!card) continue;
    slides.push({
      teamId: summary.teamId,
      name: card.name,
      tier: card.tier,
      slug: card.slug,
      logoPath: card.logoPath,
      gamesPlayed: summary.gamesPlayed,
      wins: summary.wins,
      losses: summary.losses,
    });
  }
  if (slides.length === 0) return null;

  return (
    <div className="divide-y divide-gray-600 dark:divide-vdcBlack bg-slate-100 dark:bg-vdcGrey overflow-hidden rounded-sm shadow-sm">
      <div className="px-4 py-2 xl:px-6 flex flex-row items-center gap-1.5">
        <h1 className="text-sm">Teams</h1>
        <TeamsDisclaimer />
      </div>
      <TeamHistoryCarousel slides={slides} />
    </div>
  );
}

function TeamsDisclaimer() {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="About team history"
        className="inline-flex cursor-help text-gray-400 hover:text-vdcRed"
      >
        <InformationCircleIcon className="size-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-6 z-20 hidden w-56 rounded-md bg-vdcBlack/90 px-3 py-2 text-[11px] not-italic leading-snug text-vdcWhite shadow-lg group-hover:block group-focus-within:block"
      >
        {DISCLAIMER}
      </span>
    </span>
  );
}
