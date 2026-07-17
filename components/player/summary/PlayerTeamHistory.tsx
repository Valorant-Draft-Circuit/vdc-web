import { summarizePlayerTeamsBySeason } from "@/lib/common/player";
import InfoTooltip from "@/components/theme/InfoTooltip";
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
        <InfoTooltip ariaLabel="About team history" text={DISCLAIMER} />
      </div>
      <TeamHistoryCarousel slides={slides} />
    </div>
  );
}
