import Link from "next/link";
import { Tier } from "@prisma/client";

import { getSlates } from "@/lib/queries/pickems/getSlate";
import { getMyPicks } from "@/lib/queries/pickems/getUserPicks";
import { getAdvanceLock } from "@/lib/queries/pickems/getAdvanceBoard";
import { getReadonlyPicks } from "@/lib/queries/pickems/getReadonlyPicks";
import PickemHubClient from "@/components/pickems/matches/PickemHubClient";
import ResultSlateGrid from "@/components/pickems/matches/ResultSlateGrid";

type Props = {
  tier: Tier;
  season: number;
  userId: string | null;
  accent: string;
};

export default async function PickemHubBoard({
  tier,
  season,
  userId,
  accent,
}: Props) {
  const [slates, myPicks, advanceLock, readonly] = await Promise.all([
    getSlates(tier, season),
    userId ? getMyPicks(userId, season, tier) : Promise.resolve(null),
    getAdvanceLock(tier, season),
    userId ? getReadonlyPicks(userId, tier, season) : Promise.resolve(null),
  ]);

  const now = new Date();
  const advanceOpen = advanceLock !== null && advanceLock > now;
  const openSlates = userId
    ? slates.filter((slate) => slate.lockTime > now)
    : slates;
  const resultSlates = readonly?.slates ?? [];
  const hasNothing = openSlates.length === 0 && resultSlates.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {advanceOpen && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5"
          style={{ borderColor: accent, backgroundColor: `${accent}29` }}
        >
          <p className="text-sm font-normal">
            <b className="font-bold" style={{ color: accent }}>
              Playoffs Advancement PICK&apos;EM window is open!
            </b>{" "}
            Predict the teams that make playoffs. Locks{" "}
            {advanceLock!.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
          <Link
            href={`/pickems/advancement?tier=${tier.toLowerCase()}&season=${season}`}
            className="rounded-lg px-3.5 py-1.5 text-sm font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            <h1>Make picks</h1>
          </Link>
        </div>
      )}

      {openSlates.length > 0 && (
        <PickemHubClient
          key={`${tier}-${season}`}
          slates={openSlates}
          initialPicks={myPicks?.match ?? []}
          accent={accent}
          canSave={userId !== null}
        />
      )}

      {resultSlates.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wide text-vdcGrey dark:text-gray-400">
            Results
          </h2>
          <ResultSlateGrid slates={resultSlates} accent={accent} />
        </div>
      )}

      {hasNothing && (
        <p className="py-10 text-center text-sm text-vdcGrey dark:text-gray-400">
          No slates are scheduled for this tier yet.
        </p>
      )}
    </div>
  );
}
