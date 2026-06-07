import { Flags } from "@/prisma";

export function hasFlags(
  flags: string | number,
  checkFlags: (Flags | number | string)[],
  mode: "all" | "any" = "all",
) {
  const value = typeof flags === "string" ? parseInt(flags, 16) : flags;

  const normalized = checkFlags.map((f) =>
    typeof f === "string" ? parseInt(f, 16) : Number(f),
  );

  if (mode === "all") {
    return normalized.every((flag) => (value & flag) !== 0);
  }

  return normalized.some((flag) => (value & flag) !== 0);
}
