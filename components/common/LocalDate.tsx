"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  formatDate,
  LEAGUE_TIME_ZONE,
  MATCH_DATE_OPTIONS,
} from "@/lib/common/format";

const subscribe = () => () => {};
const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const leagueTimeZone = () => LEAGUE_TIME_ZONE;

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

/**
 * The viewer's timezone. The server render and the hydration pass use league
 * time so the markup matches, then the browser swaps in its own zone;
 * client-side navigations get the browser zone straight away.
 */
function useViewerTimeZone() {
  return useSyncExternalStore(subscribe, browserTimeZone, leagueTimeZone);
}

/** A date in the viewer's own timezone. */
export default function LocalDate({
  date,
  options = MATCH_DATE_OPTIONS,
}: {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const timeZone = useViewerTimeZone();
  return (
    <time dateTime={new Date(date).toISOString()}>
      {formatDate(date, options, timeZone)}
    </time>
  );
}

/**
 * Wraps content in an element whose native browser tooltip (`title`) shows
 * the full date and time in the viewer's timezone. No date, no tooltip.
 */
export function DateTooltip({
  date,
  as: Tag = "span",
  className,
  children,
}: {
  date: Date | string | null | undefined;
  as?: "span" | "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  const timeZone = useViewerTimeZone();
  return (
    <Tag
      title={date ? formatDate(date, DATE_TIME_OPTIONS, timeZone) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
