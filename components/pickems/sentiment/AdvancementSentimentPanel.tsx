import { Tier } from "@prisma/client";
import { getAdvancementSentiment } from "@/lib/queries/pickems/getAdvancementSentiment";
import AggregateStatCard from "./AggregateStatCard";
import TeamMark from "@/components/pickems/common/TeamMark";

export default async function AdvancementSentimentPanel({
  tier,
  season,
  accent,
}: {
  tier: Tier;
  season: number;
  accent: string;
}) {
  const sentiment = await getAdvancementSentiment(tier, season);

  if (sentiment.voters === 0) {
    return (
      <h2 className="rounded-md border border-black/5 bg-vdcWhite/40 p-6 text-center text-sm text-vdcGrey dark:border-white/10 dark:bg-vdcBlack/40 dark:text-gray-400">
        No advancement picks yet this season.
      </h2>
    );
  }

  const mostAgreed = sentiment.rows[0] ?? null;
  const mostDivisive =
    [...sentiment.rows]
      .filter((row) => row.share > 0 && row.share < 1)
      .sort((a, b) => Math.abs(a.share - 0.5) - Math.abs(b.share - 0.5))[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-black/5 bg-vdcWhite/40 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-vdcBlack/40">
        <h2 className="text-md font-bold uppercase tracking-wider text-vdcRed">
          Predicted to advance
        </h2>
        <h2 className="mb-3 text-[11px] text-vdcGrey dark:text-gray-400">
          Share of {sentiment.voters} advancement pickers placing each team in the cutoff
        </h2>
        <ul className="flex flex-col gap-2">
          {sentiment.rows.map((row) => (
            <li key={row.teamId} className="flex items-center gap-2 text-sm">
              {row.team ? (
                <TeamMark
                  logo={row.team.logo}
                  slug={row.team.slug}
                  name={row.team.name}
                  size="size-5"
                />
              ) : null}
              <h2 className="w-28 truncate">{row.team?.name ?? "Team"}</h2>
              <div className="h-3.5 flex-1 rounded bg-black/5 dark:bg-white/10">
                <div
                  className="h-3.5 rounded"
                  style={{ width: `${row.share * 100}%`, backgroundColor: accent }}
                />
              </div>
              <h2 className="w-10 text-right tabular-nums">
                {Math.round(row.share * 100)}%
              </h2>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        {mostAgreed ? (
          <AggregateStatCard
            label="Most agreed lock"
            headline={mostAgreed.team?.name ?? "Team"}
            detail={`${Math.round(mostAgreed.share * 100)}% place them`}
          />
        ) : null}
        {mostDivisive ? (
          <AggregateStatCard
            label="Most divisive team"
            headline={mostDivisive.team?.name ?? "Team"}
            detail={`${Math.round(mostDivisive.share * 100)}% split`}
          />
        ) : null}
        {sentiment.missedCut.length > 0 ? (
          <AggregateStatCard
            label="Biggest upset"
            headline={sentiment.missedCut[0].team?.name ?? "Team"}
            detail={`${Math.round(sentiment.missedCut[0].share * 100)}% expected them, missed cut`}
          />
        ) : null}
      </div>
    </div>
  );
}
