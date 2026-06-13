import { Fragment } from "react";
import { MatchType, Tier } from "@prisma/client";
import { getPlayoffBracket } from "@/lib/queries/playoffs/getPlayoffBracket";
import MatchupCard from "./MatchupCard";

export default async function PlayoffBracket({
  tier,
  season,
}: {
  tier: Tier;
  season: number;
}) {
  const bracket = await getPlayoffBracket(tier, season);
  const tierSlug = tier.toLowerCase();

  if (bracket.rounds.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-2 py-16">
        <h1 className="text-2xl">Playoffs haven&apos;t started</h1>
        <h2 className="text-sm text-gray-500">
          Season {season} {tier} playoff matches will appear here once they are
          scheduled.
        </h2>
      </div>
    );
  }

  // Connector columns only line up for the clean single-elim trees where each
  // round has exactly twice the slots of the next (4/6/8). The fallback layout
  // has arbitrary per-day counts, so it renders without connectors.
  const showConnectors = bracket.isInferable;

  return (
    <div className="bg-gray-100 dark:bg-vdcGrey/30 rounded-2xl p-6 border border-black/5 dark:border-white/10 overflow-x-auto">
      {!bracket.isInferable && (
        <h2 className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          This tier&apos;s format does not map to a standard bracket; rounds are
          shown as played.
        </h2>
      )}
      <div className="flex w-full items-stretch">
        {bracket.rounds.map((round, i) => (
          <Fragment key={i}>
            <div className="w-60 shrink-0 flex flex-col">
              <h1
                className={`h-8 flex items-center justify-center text-xs uppercase tracking-wider ${
                  round.matchType === MatchType.BO5
                    ? "text-vdcRed font-semibold"
                    : "text-gray-500 dark:text-gray-300"
                }`}
              >
                {round.label}
              </h1>
              <div className="flex-1 flex flex-col">
                {round.slots.map((slot, j) => (
                  <div key={j} className="flex-1 flex flex-col justify-center py-3">
                    <div className="bg-vdcWhite dark:bg-vdcGrey rounded-lg">
                      <MatchupCard slot={slot} tier={tierSlug} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showConnectors && i < bracket.rounds.length - 1 && (
              <div className="flex-1 min-w-[2.5rem] flex flex-col">
                <div className="h-8" />
                <div className="flex-1 flex flex-col">
                  {bracket.rounds[i + 1].slots.map((_, k) => (
                    <div key={k} className="bk-elbow relative flex-1">
                      <div className="bk-elbow-v" />
                      <div className="bk-elbow-o" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
