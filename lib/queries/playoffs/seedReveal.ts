/**
 * Final regular season seeding is a spoiler while the regular season is still
 * running, so it stays hidden until playoffs start. Once it is out, it stays
 * out: through the offseason and for every past season.
 */
export function seedsAreRevealed(
  season: number,
  currentSeason: number,
  leagueState: string | null,
): boolean {
  return (
    season < currentSeason ||
    leagueState === "PLAYOFFS" ||
    leagueState === "OFFSEASON"
  );
}
