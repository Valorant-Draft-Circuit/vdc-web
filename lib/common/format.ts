export function toTailwindCustomHexCode(color) {
  const colorHex = String(color).split("x")[1];
  return `#${colorHex}`;
}

export function formatDate(date: Date) {
  // TODO: remove this when we figure out whats going on with date issue
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - 1);

  return newDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
