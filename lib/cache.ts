import { StandingProps } from "@/components/standings/StandingsCard";

declare global {
  // eslint-disable-next-line no-var
  var __CACHE__: {
    currentSeason: number | null;
    standings: { franchise: StandingProps[] | null };
  };
}

if (!globalThis.__CACHE__) {
  globalThis.__CACHE__ = {
    currentSeason: null,
    standings: { franchise: null },
  };
} else {
  globalThis.__CACHE__.standings ??= { franchise: null };
}

export const cache: typeof globalThis.__CACHE__ = globalThis.__CACHE__;
