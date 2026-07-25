export function normalizeAgentName(raw: string): string {
  const upper = raw.toUpperCase();
  if (upper === "KAYO") return "KAY/O";
  return upper;
}

export function agentToUrlSlug(displayName: string): string {
  return displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
}
