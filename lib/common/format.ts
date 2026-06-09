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
