import { TierComposition } from "@/lib/queries/staff/admin";
import { getFaPoolHealth } from "@/lib/common/freeAgents";
import { TIER_COLOR_MAP } from "@/lib/common/constants/tiers";
import { FA_POOL_HEALTH_BANDS } from "@/lib/common/constants/freeAgents";

const BAND_RANGE_LABEL: Record<string, string> = {
  Critical: "< 0.75",
  Thin: "< 1",
  Fair: "< 1.5",
  Healthy: "< 2",
  Strong: "≥ 2",
};

export default function RosterCompositionPanel({
  composition,
}: {
  composition: TierComposition[];
}) {
  const conversionTiers = composition.filter(
    (row) =>
      row.faPerTeam !== null && getFaPoolHealth(row.faPerTeam).isConversionZone,
  );

  return (
    <div className="rounded-xl bg-white p-5 shadow-xs dark:bg-vdcGrey">
      <h2 className="mb-3 text-sm text-gray-500 dark:text-gray-300">
        Roster Composition &amp; FA Pool Health
      </h2>

      <div className="grid grid-cols-[6.5rem_7.5rem_4rem_1fr_6rem] items-center gap-3 border-b border-gray-200 pb-1 text-[10px] tracking-wide whitespace-nowrap text-gray-400 uppercase dark:border-gray-600">
        <h2>Tier</h2>
        <h2>Signed / FA / RFA</h2>
        <h2>FA/Team</h2>
        <h2>Pool Health</h2>
        <h2 className="text-center">Status</h2>
      </div>

      <div className="flex flex-col gap-1">
        {composition.map((row) => (
          <CompositionRow key={row.tier} row={row} />
        ))}
      </div>

      {conversionTiers.length > 0 && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
          {conversionTiers.map((row) => (
            <p key={row.tier}>
              <span
                className={`text-${TIER_COLOR_MAP[row.tier]} font-semibold`}
              >
                {row.tier}
              </span>{" "}
              pool is Critical (&lt; 0.75 FA/team). Rulebook flags this tier for
              RFA conversions.
            </p>
          ))}
        </div>
      )}

      <BandReference />
    </div>
  );
}

function CompositionRow({ row }: { row: TierComposition }) {
  const health = row.faPerTeam === null ? null : getFaPoolHealth(row.faPerTeam);

  return (
    <div className="grid grid-cols-[6.5rem_7.5rem_4rem_1fr_6rem] items-center gap-3 border-b border-gray-100 py-2 text-sm dark:border-gray-700">
      <h1 className={`font-semibold text-${TIER_COLOR_MAP[row.tier]}`}>
        {row.tier}
      </h1>
      <h2 className="text-gray-600 dark:text-gray-300">
        {row.signed} / {row.fa} / {row.rfa}
      </h2>
      <h2 className="font-semibold text-vdcBlack dark:text-white">
        {row.faPerTeam === null ? "N/A" : row.faPerTeam.toFixed(2)}
      </h2>
      <span className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {health && (
          <h2
            className={`block h-full rounded-full ${health.barClass}`}
            style={{ width: `${health.fillPercent}%` }}
          />
        )}
      </span>
      <span>
        {health ? (
          <h1
            className={`rounded-md px-2 py-0.5 text-xs text-center ${health.pillClass}`}
          >
            {health.band}
          </h1>
        ) : (
          <h1 className="text-xs text-gray-400">N/A</h1>
        )}
      </span>
    </div>
  );
}

function BandReference() {
  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center gap-2 text-[10px] text-gray-500">
        <h2>Critical</h2>
        <span className="h-2 flex-1 rounded-full bg-linear-to-r from-red-600 via-amber-500 to-green-600" />
        <h2>Strong</h2>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {FA_POOL_HEALTH_BANDS.map((band) => (
          <h2
            key={band.label}
            className={`rounded-full px-2 py-0.5 text-xs ${band.pillClass}`}
          >
            {BAND_RANGE_LABEL[band.label]} {band.label}
          </h2>
        ))}
      </div>
    </div>
  );
}
