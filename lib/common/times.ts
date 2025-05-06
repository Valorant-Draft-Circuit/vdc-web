/**
 * Created simplify cache times, but can be used
 * for anything that deals with time units based on seconds
 */
export enum Times {
  SECOND = 1,
  MINUTE = 60,
  HOUR = 3600,
  DAY = 86400,
}

export function seconds(n: number): number {
  return n * Times.SECOND;
}

export function minutes(n: number): number {
  return n * Times.MINUTE;
}

export function hours(n: number): number {
  return n * Times.HOUR;
}

export function days(n: number): number {
  return n * Times.DAY;
}
