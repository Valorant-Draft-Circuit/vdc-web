import { Tier } from "@prisma/client";

export const isTier = (value: string): value is Tier => {
  return Object.values(Tier).includes(value as Tier);
};

export function toTailwindCustomHexCode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function packageMatch(match, homeWins, awayWins, formattedDate) {
  const homeTeam = match.Home!;
  const awayTeam = match.Away!;
  return {
    id: match.matchID,
    date: formattedDate,
    tier: match.tier,
    homeWins: homeWins,
    awayWins: awayWins,
    Home: {
      id: homeTeam.id,
      name: homeTeam.name,
      logo: homeTeam.Franchise.Brand?.logo,
      slug: homeTeam.Franchise.slug,
    },
    Away: {
      id: awayTeam.id,
      name: awayTeam.name,
      logo: awayTeam.Franchise.Brand?.logo,
      slug: awayTeam.Franchise.slug,
    },
    Games: match.Games,
  };
}