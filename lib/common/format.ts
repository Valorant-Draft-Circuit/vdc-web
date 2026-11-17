export function toTailwindCustomHexCode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}

// Match times are stored as true UTC instants: 9pm ET is 02:00Z the next day.
// Formatting must name a zone, or a UTC server prints the UTC calendar day.
export const LEAGUE_TIME_ZONE = "America/New_York";

export const MATCH_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
};

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = MATCH_DATE_OPTIONS,
  timeZone: string = LEAGUE_TIME_ZONE,
) {
  return new Date(date).toLocaleDateString("en-US", { ...options, timeZone });
}

export function formatRelativeAge(date: Date) {
  const elapsedMs = Date.now() - new Date(date).getTime();
  const hours = Math.floor(elapsedMs / (60 * 60 * 1000));
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function formatPlainDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
