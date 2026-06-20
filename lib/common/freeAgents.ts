import {
  FA_POOL_BAR_CAP,
  FA_POOL_HEALTH_BANDS,
  FaPoolBandLabel,
} from "@/lib/common/constants";

export type FaPoolHealth = {
  band: FaPoolBandLabel;
  barClass: string;
  pillClass: string;
  fillPercent: number;
  isConversionZone: boolean;
};

export function getFaPoolHealth(faPerTeam: number): FaPoolHealth {
  const band = FA_POOL_HEALTH_BANDS.find(
    (candidate) => faPerTeam < candidate.maxExclusive,
  );
  const resolved =
    band ?? FA_POOL_HEALTH_BANDS[FA_POOL_HEALTH_BANDS.length - 1];
  const cappedRatio = Math.min(faPerTeam / FA_POOL_BAR_CAP, 1);

  return {
    band: resolved.label,
    barClass: resolved.barClass,
    pillClass: resolved.pillClass,
    fillPercent: Math.round(cappedRatio * 100),
    isConversionZone: resolved.label === "Critical",
  };
}
