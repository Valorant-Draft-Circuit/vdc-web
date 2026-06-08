export function normalizeAgentName(raw: string): string {
  if (raw === "KAYO") return "KAY/O";
  return raw.toUpperCase();
}

export function agentToUrlSlug(displayName: string): string {
  return displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
}
