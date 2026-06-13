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
        <h2 className="text-2xl">Playoffs haven&apos;t started</h2>
        <p className="text-sm text-gray-500">
          Season {season} {tier} playoff matches will appear here once they are
          scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-vdcRed/90 rounded-2xl p-5 overflow-x-auto">
      {!bracket.isInferable && (
        <p className="text-xs text-vdcWhite/80 mb-3">
          This tier&apos;s format does not map to a standard bracket; rounds are
          shown as played.
        </p>
      )}
      <div className="flex gap-12 min-w-min">
        {bracket.rounds.map((round, roundIndex) => (
          <div
            key={roundIndex}
            className="bracket-round flex flex-col justify-around gap-6 min-w-[220px]"
          >
            <h3
              className={`text-center text-xs uppercase tracking-wider ${
                round.matchType === MatchType.BO5
                  ? "text-vdcYellow"
                  : "text-vdcWhite"
              }`}
            >
              {round.label}
            </h3>
            <div className="flex flex-col justify-around gap-6 flex-1">
              {round.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="bg-vdcWhite dark:bg-vdcGrey rounded-lg">
                  <MatchupCard slot={slot} tier={tierSlug} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
