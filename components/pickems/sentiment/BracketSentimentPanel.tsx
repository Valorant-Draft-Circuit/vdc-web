import { Tier } from "@prisma/client";
import { getBracketSentiment } from "@/lib/queries/pickems/getBracketSentiment";
import AggregateStatCard from "./AggregateStatCard";
import TeamMark from "@/components/pickems/common/TeamMark";

function pct(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export default async function BracketSentimentPanel({
  tier,
  season,
  accent,
}: {
  tier: Tier;
  season: number;
  accent: string;
}) {
  const sentiment = await getBracketSentiment(tier, season);

  if (!sentiment.available) {
    return (
      <h2 className="rounded-md border border-black/5 bg-vdcWhite/40 p-6 text-center text-sm text-vdcGrey dark:border-white/10 dark:bg-vdcBlack/40 dark:text-gray-400">
        Available once playoffs are seeded and bracket picks exist.
      </h2>
    );
  }

  const champion = sentiment.champions[0] ?? null;

  const finalistNames = sentiment.finalists.map((finalist) => finalist.team?.name ?? "Team");
  const finalistsHeadline = finalistNames.join(" + ");
  const finalistShares = sentiment.finalists.map(
    (finalist) => `${Math.round(finalist.share * 100)}%`,
  );
  const finalistsDetail = finalistShares.join(" / ");

  const slotsByRound = new Map<number, typeof sentiment.slots>();
  for (const slot of sentiment.slots) {
    if (!slotsByRound.has(slot.round)) {
      slotsByRound.set(slot.round, []);
    }
    slotsByRound.get(slot.round)!.push(slot);
  }
  const rounds = [...slotsByRound.keys()].sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-gray-100 p-6 dark:border-white/10 dark:bg-vdcGrey/30">
        <div className="flex gap-6">
          {rounds.map((round) => {
            const roundSlots = [...(slotsByRound.get(round) ?? [])].sort(
              (a, b) => a.slot - b.slot,
            );
            return (
              <div key={round} className="flex min-w-40 flex-col justify-around gap-3">
                {roundSlots.map((slot) => (
                  <div
                    key={slot.slot}
                    className="rounded-md border border-black/10 bg-vdcWhite/60 p-2 dark:border-white/10 dark:bg-vdcBlack/40"
                  >
                    <div className="flex items-center gap-2">
                      {slot.team ? (
                        <TeamMark
                          logo={slot.team.logo}
                          slug={slot.team.slug}
                          name={slot.team.name}
                          size="size-6"
                        />
                      ) : null}
                      <h2 className="flex-1 truncate text-sm font-bold">
                        {slot.team?.slug ?? "TBD"}
                      </h2>
                      <h2 className="text-xs tabular-nums" style={{ color: accent }}>
                        {pct(slot.share)}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {champion ? (
          <AggregateStatCard
            label="Predicted champion"
            headline={champion.team?.name ?? "Team"}
            detail={`${pct(champion.share)} of brackets`}
          />
        ) : null}
        {sentiment.finalists.length > 0 ? (
          <AggregateStatCard
            label="Predicted finalists"
            headline={finalistsHeadline}
            detail={finalistsDetail}
          />
        ) : null}
        {sentiment.mostAgreed ? (
          <AggregateStatCard
            label="Most agreed matchup"
            headline={sentiment.mostAgreed.team?.name ?? "Team"}
            detail={`${pct(sentiment.mostAgreed.share)} agree`}
          />
        ) : null}
        {sentiment.mostDivisive ? (
          <AggregateStatCard
            label="Most divisive matchup"
            headline={sentiment.mostDivisive.team?.name ?? "Team"}
            detail={`${pct(sentiment.mostDivisive.share)} top pick`}
          />
        ) : null}
        {sentiment.darkHorse ? (
          <AggregateStatCard
            label="Dark horse"
            headline={sentiment.darkHorse.team?.name ?? "Team"}
            detail={`${pct(sentiment.darkHorse.share)} crown a #${sentiment.darkHorse.team?.seed} seed`}
          />
        ) : null}
      </div>
    </div>
  );
}
