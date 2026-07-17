export const PLAYOFF_ODDS_SIMULATIONS = 5000;

export const PLAYOFF_ODDS_TOOLTIP =
  "Estimated from 5,000 simulations of the remaining schedule. Map win chances come from each team's season map record; league tiebreakers are applied in every simulated season. Updates as results come in.";

const STRENGTH_PSEUDO_MAPS = 6;
const LIKELY_IN_THRESHOLD = 0.75;
const LIKELY_OUT_THRESHOLD = 0.25;

export function shrunkMapWinRate(mapWins: number, mapsPlayed: number): number {
  return (
    (mapWins + STRENGTH_PSEUDO_MAPS / 2) / (mapsPlayed + STRENGTH_PSEUDO_MAPS)
  );
}

export function mapWinProbability(
  strengthA: number,
  strengthB: number
): number {
  const aBeatsB = strengthA * (1 - strengthB);
  const bBeatsA = strengthB * (1 - strengthA);
  return aBeatsB / (aBeatsB + bBeatsA);
}

export function formatPlayoffOdds(odds: number): string {
  const percent = Math.round(odds * 100);
  if (percent === 0 && odds > 0) return "<1%";
  if (percent === 100 && odds < 1) return ">99%";
  return `${percent}%`;
}

export function playoffOddsColorClass(odds: number): string {
  if (odds >= LIKELY_IN_THRESHOLD) return "text-vdcGreen";
  if (odds <= LIKELY_OUT_THRESHOLD) return "text-vdcRed";
  return "";
}
