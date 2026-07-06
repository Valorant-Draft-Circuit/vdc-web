import { TransactionType } from "@prisma/client";

export const ROSTER_TRANSACTION_TYPES = [
  TransactionType.SIGN,
  TransactionType.CUT,
  TransactionType.SUB,
  TransactionType.UNSUB,
  TransactionType.RENEW,
  TransactionType.EXPIRE,
  TransactionType.IR,
  TransactionType.ACTIVATE,
  TransactionType.UPDATE_TIER,
  TransactionType.CAPTAIN,
] as const;

export const LEAGUE_TRANSACTION_TYPES = [
  TransactionType.TRADE,
  TransactionType.RETIRE,
] as const;

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  ACTIVATE: "ACT",
  CAPTAIN: "CAPTAIN",
  CUT: "CUT",
  EXPIRE: "EXPIRE",
  IR: "IR",
  REBRAND: "REBRAND",
  RENEW: "RENEW",
  RESCHEDULE: "RESCHED",
  RETIRE: "RETIRE",
  SCHEDULE_PLAYOFF: "PLAYOFF",
  SIGN: "SIGN",
  SUB: "SUB",
  TRADE: "TRADE",
  UNSUB: "UNSUB",
  UPDATE_TIER: "TIER",
};

export const TRANSACTION_TYPE_COLOR_MAP: Record<TransactionType, string> = {
  SIGN: "bg-vdcGreen/20 text-vdcGreen",
  RENEW: "bg-vdcGreen/20 text-vdcGreen",
  CUT: "bg-vdcRed/20 text-vdcRed",
  EXPIRE: "bg-vdcRed/20 text-vdcRed",
  SUB: "bg-vdcBlue/20 text-vdcBlue",
  UNSUB: "bg-vdcBlue/20 text-vdcBlue",
  IR: "bg-vdcYellow/20 text-vdcYellow",
  ACTIVATE: "bg-vdcYellow/20 text-vdcYellow",
  UPDATE_TIER: "bg-vdcOrange/20 text-vdcOrange",
  CAPTAIN: "bg-vdcRed/20 text-vdcRed",
  TRADE: "bg-vdcPurple/20 text-vdcPurple",
  RETIRE: "bg-slate-400/20 text-slate-500 dark:text-slate-400",
  REBRAND: "bg-slate-400/20 text-slate-500 dark:text-slate-400",
  RESCHEDULE: "bg-slate-400/20 text-slate-500 dark:text-slate-400",
  SCHEDULE_PLAYOFF: "bg-slate-400/20 text-slate-500 dark:text-slate-400",
};
