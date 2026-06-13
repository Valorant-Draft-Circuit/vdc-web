export const INSPIRATIONAL_QUOTES: string[] = [
  "Hard work beats talent when talent doesn't work hard.",
  "Aim small, miss small.",
  "Every clutch starts with a deep breath.",
  "Discipline is choosing between what you want now and what you want most.",
  "The scoreboard rewards preparation, not hope.",
  "Win the round in front of you.",
  "Comms win games that aim cannot.",
  "Default first, heroics later.",
];

export function pickRandomQuote(
  quotes: string[] = INSPIRATIONAL_QUOTES,
  random: () => number = Math.random,
): string {
  if (quotes.length === 0) return "";
  const index = Math.floor(random() * quotes.length);
  return quotes[index];
}
