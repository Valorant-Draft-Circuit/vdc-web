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
