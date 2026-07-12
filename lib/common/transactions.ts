import { TIER_HEX_COLOR_MAP } from "@/lib/common/constants/tiers";
import { VDC_RED } from "@/lib/common/constants/colors";
import type { TransactionGroupKey } from "@/lib/queries/home/transactions";

export function transactionGroupHexColor(key: TransactionGroupKey): string {
  if (key === "LEAGUE") return VDC_RED;
  return TIER_HEX_COLOR_MAP[key];
}

export function transactionGroupLabel(key: TransactionGroupKey): string {
  return key.charAt(0) + key.slice(1).toLowerCase();
}

export type TradeAsset = {
  kind: "player" | "pick";
  label: string;
  playerIgn: string | null;
};

export type TradeSide = { franchiseName: string; assets: TradeAsset[] };

export type TradeDetails = { sides: [TradeSide, TradeSide] };

const PLAYER_GIVE_PATTERN = /^`U`\s*\|\s*\[`([^`]+)`\]\([^)]*\)\s*-\s*.*$/;
const PICK_GIVE_PATTERN = /^`P`\s*\|\s*`([^`]+)`\s*-\s*(.*)$/;

function parseGive(raw: string): TradeAsset {
  const playerMatch = raw.match(PLAYER_GIVE_PATTERN);
  if (playerMatch) {
    return { kind: "player", label: playerMatch[1], playerIgn: playerMatch[1] };
  }
  const pickMatch = raw.match(PICK_GIVE_PATTERN);
  if (pickMatch) {
    const roundAndPick = pickMatch[2].replace(/,?\s*\(\d+\)\s*$/, "");
    return {
      kind: "pick",
      label: `${pickMatch[1]} - ${roundAndPick}`,
      playerIgn: null,
    };
  }
  const fallbackKind = raw.trimStart().startsWith("`P`") ? "pick" : "player";
  return { kind: fallbackKind, label: raw.replace(/`/g, ""), playerIgn: null };
}

function stringEntries(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

export function parseTradeDetails(details: string | null): TradeDetails | null {
  if (!details) {
    return null;
  }
  try {
    const parsed = JSON.parse(details);
    const firstName = parsed?.franchise1?.name;
    const secondName = parsed?.franchise2?.name;
    if (typeof firstName !== "string" || typeof secondName !== "string") {
      return null;
    }
    return {
      sides: [
        {
          franchiseName: firstName,
          assets: stringEntries(parsed.f1Gives).map(parseGive),
        },
        {
          franchiseName: secondName,
          assets: stringEntries(parsed.f2Gives).map(parseGive),
        },
      ],
    };
  } catch {
    return null;
  }
}
