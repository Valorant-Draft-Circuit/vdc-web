export function listAllSeasons(currentSeason: number) {
  const seasons: string[] = [];
  for (let i = currentSeason; i >= 6; i--) {
    seasons.push(String(i));
  }
  return seasons;
}
