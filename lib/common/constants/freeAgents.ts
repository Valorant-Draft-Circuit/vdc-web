export const FA_POOL_BAR_CAP = 2;

export type FaPoolBandLabel =
  | "Critical"
  | "Thin"
  | "Fair"
  | "Healthy"
  | "Strong";

export type FaPoolBand = {
  maxExclusive: number;
  label: FaPoolBandLabel;
  barClass: string;
  pillClass: string;
};

export const FA_POOL_HEALTH_BANDS: FaPoolBand[] = [
  {
    maxExclusive: 0.75,
    label: "Critical",
    barClass: "bg-red-600",
    pillClass: "bg-red-600 text-white",
  },
  {
    maxExclusive: 1,
    label: "Thin",
    barClass: "bg-orange-600",
    pillClass: "bg-orange-600 text-white",
  },
  {
    maxExclusive: 1.5,
    label: "Fair",
    barClass: "bg-amber-500",
    pillClass: "bg-amber-500 text-black",
  },
  {
    maxExclusive: 2,
    label: "Healthy",
    barClass: "bg-lime-500",
    pillClass: "bg-lime-500 text-black",
  },
  {
    maxExclusive: Infinity,
    label: "Strong",
    barClass: "bg-green-600",
    pillClass: "bg-green-600 text-white",
  },
];
