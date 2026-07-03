const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_MINUTE = 1000 * 60;

export const SLATE_LOCK_LEAD_HOURS = 12;

export function slateLockTime(firstMatchTime: Date): Date {
  return new Date(
    firstMatchTime.getTime() - SLATE_LOCK_LEAD_HOURS * MS_PER_HOUR,
  );
}

export function formatDayShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeUntilLock(lockTime: Date, now: Date) {
  const remainingMs = lockTime.getTime() - now.getTime();
  const totalHours = Math.floor(remainingMs / MS_PER_HOUR);
  return {
    remainingMs,
    days: Math.floor(totalHours / 24),
    hours: totalHours % 24,
    minutes: Math.max(1, Math.floor(remainingMs / MS_PER_MINUTE)),
  };
}

export function lockCountdown(lockTime: Date, now: Date): string {
  const { remainingMs, days, hours, minutes } = timeUntilLock(lockTime, now);
  if (remainingMs <= 0) {
    return "Locked";
  }
  if (days > 0 && hours > 0) {
    return `Locks in ${days}d ${hours}h`;
  }
  if (days > 0) {
    return `Locks in ${days}d`;
  }
  if (hours > 0) {
    return `Locks in ${hours}h`;
  }
  return `Locks in ${minutes}m`;
}

export function lockBadgeShort(lockTime: Date, now: Date): string {
  const { remainingMs, days, hours } = timeUntilLock(lockTime, now);
  if (remainingMs <= 0) {
    return "Locked";
  }
  if (days > 0 && hours > 0) {
    return `${days}d ${hours}h`;
  }
  if (days > 0) {
    return `${days}d`;
  }
  return `${Math.max(1, hours)}h`;
}
