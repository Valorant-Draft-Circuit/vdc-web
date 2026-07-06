export function toTailwindCustomHexCode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}

// TODO: remove this when we figure out whats going on with date issue
export function correctMatchDate(date: Date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - 1);
  return newDate;
}

export function formatDate(date: Date) {
  return correctMatchDate(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
