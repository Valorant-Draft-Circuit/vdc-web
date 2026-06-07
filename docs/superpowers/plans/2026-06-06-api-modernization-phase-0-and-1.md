# API Modernization Phase 0 + 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an origin-check middleware as a scraping speed bump (Phase 0), then migrate the `/player/[player]` page off its three self-fetching `/api/*` endpoints (Phase 1) to validate the App Router pattern.

**Architecture:** Two changes. (1) A composed middleware that wraps NextAuth's `auth` middleware and adds an `Origin`/`Referer` allowlist on `/api/*`. (2) Three route handlers (`/api/player/[riotIGN]`, `/api/player/stats/[riotIGN]`, `/api/users/discord/[discordId]/riot`) get their logic moved into per-query files under `lib/queries/user/` and `lib/queries/stats/`, then deleted. The `app/player/[player]/page.tsx` server component calls those queries directly, and `components/player/summary/PlayerSummary.tsx` is converted from a client component with `useEffect` fetch to a server component receiving stats as props, with a Suspense fallback for the loading state.

**Tech Stack:** Next.js App Router, NextAuth v5 (`auth()` middleware), Prisma, TypeScript. No tests — the repo has no test framework; verification is `pnpm build` (typecheck) plus `pnpm dev` manual browser checks.

**Reference spec:** [docs/superpowers/specs/2026-06-06-app-router-modernization-design.md](../specs/2026-06-06-app-router-modernization-design.md)

---

## File Structure

**Phase 0 — Origin gate:**
- Create: `lib/auth/origin-allowlist.ts` — pure config: allowed origins + exempt path matchers
- Modify: `middleware.ts` — compose `auth()` with origin check for `/api/*`

**Phase 1 — Player profile migration:**
- Create: `lib/types/player.ts` — `PlayerProfile` type moved out of the route handler so deleting the route doesn't orphan its consumers
- Create: `lib/queries/user/getPlayerByRiotIGN.ts` — wraps `Player.getBy` + the MMR-display transform that currently lives in the route handler
- Create: `lib/queries/user/getRiotIGNByDiscordId.ts` — wraps `Player.getIGNby`
- Create: `components/player/summary/PlayerSummarySkeleton.tsx` — the existing `<Load />` JSX, extracted so it can be reused as a Suspense fallback
- Modify: `components/player/PlayerInfo.tsx` — update `PlayerProfile` import path
- Modify: `app/player/[player]/page.tsx` — drop `process.env.URL` self-fetches, call queries directly, fetch stats and pass to `PlayerSummary`, wrap in Suspense
- Modify: `components/player/summary/PlayerSummary.tsx` — convert to server component receiving `stats` and `gameType` as props; remove `"use client"`, `useState`, `useEffect`, `useParams`, `useSearchParams`
- Delete: `app/api/player/[riotIGN]/route.ts`
- Delete: `app/api/player/stats/[riotIGN]/route.ts`
- Delete: `app/api/users/discord/[discordId]/riot/route.ts`

---

## Phase 0: Origin Gate Middleware

### Task 1: Add the origin allowlist config module

**Files:**
- Create: `lib/auth/origin-allowlist.ts`

- [ ] **Step 1: Write the config module**

```ts
// lib/auth/origin-allowlist.ts

const PRODUCTION_ORIGINS = ["https://vdc.gg", "https://www.vdc.gg"];

const PREVIEW_ORIGIN_SUFFIX = ".vercel.app";

const DEVELOPMENT_ORIGINS = ["http://localhost:3000"];

const ORIGIN_EXEMPT_PATH_PATTERNS: RegExp[] = [
  /^\/api\/auth\//,
  /^\/api\/internal\/health$/,
];

export function isOriginExemptPath(pathname: string): boolean {
  return ORIGIN_EXEMPT_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  if (PRODUCTION_ORIGINS.some((allowed) => origin === allowed)) return true;
  if (DEVELOPMENT_ORIGINS.some((allowed) => origin.startsWith(allowed))) return true;

  try {
    const host = new URL(origin).host;
    if (host.endsWith(PREVIEW_ORIGIN_SUFFIX)) return true;
  } catch {
    return false;
  }

  return false;
}

export function extractRequestOrigin(headers: Headers): string | null {
  const originHeader = headers.get("origin");
  if (originHeader) return originHeader;

  const refererHeader = headers.get("referer");
  if (!refererHeader) return null;

  try {
    const refererUrl = new URL(refererHeader);
    return `${refererUrl.protocol}//${refererUrl.host}`;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS (zero errors).

- [ ] **Step 3: Commit**

```bash
git add lib/auth/origin-allowlist.ts
git commit -m "add origin allowlist module for /api gate"
```

---

### Task 2: Compose the origin gate into middleware.ts

**Files:**
- Modify: `middleware.ts`

Current `middleware.ts`:
```ts
export { auth as middleware } from "@/lib/auth/auth";
```

- [ ] **Step 1: Replace middleware.ts with the composed gate**

```ts
// middleware.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  extractRequestOrigin,
  isAllowedOrigin,
  isOriginExemptPath,
} from "@/lib/auth/origin-allowlist";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) return;
  if (isOriginExemptPath(pathname)) return;

  const requestOrigin = extractRequestOrigin(req.headers);
  if (!isAllowedOrigin(requestOrigin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
});
```

Note: do **not** add a `config.matcher` export. NextAuth's `auth()` middleware needs to attach session context to non-API routes too, and the early `return` inside the handler skips the origin check on those paths.

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Production build sanity**

Run: `pnpm build`
Expected: PASS. Build output should mention middleware compilation.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "compose origin allowlist into NextAuth middleware on /api/*"
```

---

### Task 3: Verify Phase 0 against the dev server

**Files:** none (manual verification)

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev`
Expected: server up on `http://localhost:3000`.

- [ ] **Step 2: Confirm direct cross-origin calls are blocked**

In a separate terminal:
```bash
curl -i http://localhost:3000/api/teams
```
Expected: `HTTP/1.1 403 Forbidden` with body `{"error":"Forbidden"}`. The `curl` request has no `Origin` or `Referer` header, so the gate rejects it.

- [ ] **Step 3: Confirm same-origin browser-style calls work**

```bash
curl -i -H "Origin: http://localhost:3000" http://localhost:3000/api/teams
```
Expected: `HTTP/1.1 200 OK` (or whatever the route normally returns), proving the allowlist permits same-origin.

- [ ] **Step 4: Confirm auth callback is exempt**

```bash
curl -i http://localhost:3000/api/auth/providers
```
Expected: 200 OK with JSON listing configured providers. The `/api/auth/*` exemption let it through with no `Origin` header.

- [ ] **Step 5: Confirm pages and session attach normally**

Open `http://localhost:3000` in a browser, sign in if not already, and visit `/me`. Expected: page renders, session-dependent UI shows correctly. Visit `/player/<any valid IGN>` — should render normally (still using the old `/api/player/*` routes, which now require Origin — the browser supplies one, so this works).

- [ ] **Step 6: Stop the dev server, commit nothing**

No code change to commit in this task. Phase 0 ships once Task 2 is merged.

---

## Phase 1: Player Profile Migration

### Task 4: Extract `PlayerProfile` type to a shared module

**Files:**
- Create: `lib/types/player.ts`
- Modify: `components/player/PlayerInfo.tsx:13`
- Modify: `app/player/[player]/page.tsx:14`

Currently `PlayerProfile` is exported from the route handler at `app/api/player/[riotIGN]/route.ts:4`. Deleting that route would break two imports. Move the type first.

- [ ] **Step 1: Create the shared type module**

```ts
// lib/types/player.ts

import { Player } from "@/prisma";

export type PlayerProfile = NonNullable<
  Awaited<ReturnType<typeof Player.getBy>>
>;
```

- [ ] **Step 2: Update import in `components/player/PlayerInfo.tsx`**

Find line 13:
```ts
import { PlayerProfile } from "@/app/api/player/[riotIGN]/route";
```
Replace with:
```ts
import { PlayerProfile } from "@/lib/types/player";
```

- [ ] **Step 3: Update import in `app/player/[player]/page.tsx`**

Find line 14:
```ts
import { PlayerProfile } from "@/app/api/player/[riotIGN]/route";
```
Replace with:
```ts
import { PlayerProfile } from "@/lib/types/player";
```

- [ ] **Step 4: Confirm no other importers**

Run: `grep -rn "from \"@/app/api/player/\[riotIGN\]/route\"" app components lib`
Expected: zero results.

- [ ] **Step 5: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/types/player.ts components/player/PlayerInfo.tsx app/player/[player]/page.tsx
git commit -m "move PlayerProfile type out of route handler to lib/types"
```

---

### Task 5: Create `getPlayerByRiotIGN` query

**Files:**
- Create: `lib/queries/user/getPlayerByRiotIGN.ts`

This wraps `Player.getBy({ ign })` and applies the MMR-display transform that currently lives in the route handler at `app/api/player/[riotIGN]/route.ts:18-31`.

- [ ] **Step 1: Write the query module**

```ts
// lib/queries/user/getPlayerByRiotIGN.ts

import { cache } from "react";
import { ControlPanel, Player } from "@/prisma";
import { PlayerProfile } from "@/lib/types/player";

type PlayerProfileAccount = PlayerProfile["Accounts"][number];

function transformAccount(
  account: PlayerProfileAccount | null,
  shouldIncludeMmr: boolean,
): PlayerProfileAccount | Omit<PlayerProfileAccount, "MMR"> | null {
  if (!account) return account;

  if (shouldIncludeMmr) {
    return {
      ...account,
      MMR: account.MMR ? { mmrEffective: account.MMR.mmrEffective } : null,
    };
  }

  const { MMR: _MMR, ...mmrExcluded } = account;
  return mmrExcluded;
}

export const getPlayerByRiotIGN = cache(async (riotIGN: string) => {
  const [shouldIncludeMmr, player] = await Promise.all([
    ControlPanel.getMMRDisplayState(),
    Player.getBy({ ign: riotIGN }),
  ]);

  if (!player) return null;

  return {
    ...player,
    PrimaryRiotAccount: transformAccount(player.PrimaryRiotAccount, shouldIncludeMmr),
    Accounts: player.Accounts?.map((account) =>
      transformAccount(account, shouldIncludeMmr),
    ),
  };
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/user/getPlayerByRiotIGN.ts
git commit -m "add getPlayerByRiotIGN query wrapping Player.getBy with MMR transform"
```

---

### Task 6: Create `getRiotIGNByDiscordId` query

**Files:**
- Create: `lib/queries/user/getRiotIGNByDiscordId.ts`

- [ ] **Step 1: Write the query module**

```ts
// lib/queries/user/getRiotIGNByDiscordId.ts

import { cache } from "react";
import { Player } from "@/prisma";

export const getRiotIGNByDiscordId = cache(async (discordId: string) => {
  const riotIGN = await Player.getIGNby({ discordID: discordId });
  return riotIGN ?? null;
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/user/getRiotIGNByDiscordId.ts
git commit -m "add getRiotIGNByDiscordId query wrapping Player.getIGNby"
```

---

### Task 7: Refactor `app/player/[player]/page.tsx` to use queries directly (player + discord lookups)

**Files:**
- Modify: `app/player/[player]/page.tsx`

This task removes the two `process.env.URL` self-fetches (`getPlayerByRiot` and `handleDiscordIDSearch`, plus the one in `generateMetadata`) but leaves PlayerSummary as-is until Task 11.

- [ ] **Step 1: Update imports at the top of the file**

Find the imports block (lines 1-14) and add these two imports after the existing ones:
```ts
import { getPlayerByRiotIGN } from "@/lib/queries/user/getPlayerByRiotIGN";
import { getRiotIGNByDiscordId } from "@/lib/queries/user/getRiotIGNByDiscordId";
```

- [ ] **Step 2: Rewrite `generateMetadata` to use the query**

Replace this block (lines 29-49):
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { player } = await params;
  let playerIGN;
  if (NUMBER_REGEX.test(player)) {
    const res = await fetch(
      `${process.env.URL}/api/users/discord/${player}/riot`,
    );
    if (res.ok) {
      const riotIGN: string = await res.json();
      playerIGN = riotIGN;
    } else {
      playerIGN = "Player";
    }
  } else {
    playerIGN = decodeURIComponent(player);
  }
  return {
    title: `VDC | ${playerIGN}'s Player Page`,
    description: `${playerIGN} information`,
  };
}
```

With:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { player } = await params;
  let playerIGN: string;
  if (NUMBER_REGEX.test(player)) {
    const riotIGN = await getRiotIGNByDiscordId(player);
    playerIGN = riotIGN ?? "Player";
  } else {
    playerIGN = decodeURIComponent(player);
  }
  return {
    title: `VDC | ${playerIGN}'s Player Page`,
    description: `${playerIGN} information`,
  };
}
```

- [ ] **Step 3: Rewrite the two helpers at the bottom of the file**

Replace `handleDiscordIDSearch` and `getPlayerByRiot` (lines 153-173) with:
```ts
async function handleDiscordIDSearch(discordID: string) {
  const riotIGN = await getRiotIGNByDiscordId(discordID);
  if (riotIGN) {
    const encodedIGN = encodeURIComponent(riotIGN);
    redirect(`/player/${encodedIGN}`);
  }
  return <PlayerNotFound player={discordID} />;
}
```

Then delete the standalone `getPlayerByRiot` function entirely (lines 167-173 in the original file).

- [ ] **Step 4: Update the call to `getPlayerByRiot` inside `Page`**

Find line 123:
```ts
const playerInfo = await getPlayerByRiot(playerIGN.encoded);
```
Replace with:
```ts
const playerInfo = await getPlayerByRiotIGN(playerIGN.decoded);
```

(Note: the query takes the decoded IGN. `Player.getBy({ ign })` matches on `riotIGN` which is stored decoded — the old route handler relied on Next.js auto-decoding the route param. Passing `playerIGN.decoded` makes the contract explicit.)

- [ ] **Step 5: Delete the commented-out dead helper**

Remove the commented `getPlayerStatsByCurrentSeason` block (lines 175-183 in the original) — it's dead code and easier to delete now than wonder about later.

- [ ] **Step 6: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Production build**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/player/[player]/page.tsx
git commit -m "refactor player page to call queries directly instead of self-fetch"
```

---

### Task 8: Verify player page on dev server (mid-phase checkpoint)

**Files:** none (manual verification)

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Visit a known good player page**

In a browser, navigate to `http://localhost:3000/player/<a real encoded IGN, e.g. dla%23VDC>`. Expected: page renders, `PlayerInfo` block shows the same data as before this refactor, `PlayerSummary` still loads (it's still calling `/api/player/stats/...` until Task 11 — which is fine because the route handler still exists).

- [ ] **Step 3: Test the Discord-ID redirect path**

Visit `http://localhost:3000/player/<a real discord ID>`. Expected: redirects to the encoded IGN URL.

- [ ] **Step 4: Test the not-found path**

Visit `http://localhost:3000/player/notarealplayer123`. Expected: `PlayerNotFound` component renders.

- [ ] **Step 5: Stop dev server**

If anything in steps 2-4 misbehaves: do not proceed. Compare DB output for the affected query against the route handler's behavior and reconcile before moving on.

---

### Task 9: Extract `<Load />` into `PlayerSummarySkeleton` component

**Files:**
- Create: `components/player/summary/PlayerSummarySkeleton.tsx`
- Modify: `components/player/summary/PlayerSummary.tsx`

The current `<Load />` JSX lives inline in `PlayerSummary.tsx:118-149`. It needs to be a named export so the page can pass it to a `<Suspense fallback>` in Task 11.

- [ ] **Step 1: Create the skeleton module**

```tsx
// components/player/summary/PlayerSummarySkeleton.tsx

export function PlayerSummarySkeleton() {
  return (
    <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
      <div className="flex flex-col gap-2 xl:w-1/3">
        <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm ">
          <div className="px-4 py-2 sm:px-6 animate-pulse ">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center gap-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex flex-col" key={i}>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded " />
              </div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-vdcBlack dark:bg-vdcGrey overflow-hidden rounded-lg shadow-sm ">
          <div className="px-4 py-2 sm:px-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="px-4 py-3 sm:p-6 grid grid-cols-3 italic text-center gap-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="flex flex-col" key={i}>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded " />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete the inline `<Load />` from PlayerSummary.tsx**

Open `components/player/summary/PlayerSummary.tsx`. Delete the `function Load() {...}` declaration (lines 118-149). It will become unreferenced after Task 10; deleting it here keeps the diff coherent. The current `<Load />` call site inside `PlayerSummary` will be removed in Task 10.

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS. (PlayerSummary still references `<Load />` in its loading branch, but that whole branch is also still present until Task 10, so the call resolves. If for some reason the typechecker objects, swap the call site to `<PlayerSummarySkeleton />` early and import from the new module.)

Note: if Step 3 fails because `<Load />` is referenced but undefined, replace the body of the `if (loading)` branch in PlayerSummary with `return <PlayerSummarySkeleton />;` and add `import { PlayerSummarySkeleton } from "./PlayerSummarySkeleton";` to the imports. Task 10 will rip the whole loading branch out anyway.

- [ ] **Step 4: Commit**

```bash
git add components/player/summary/PlayerSummarySkeleton.tsx components/player/summary/PlayerSummary.tsx
git commit -m "extract PlayerSummarySkeleton to its own component"
```

---

### Task 10: Convert `PlayerSummary` to a server component receiving props

**Files:**
- Modify: `components/player/summary/PlayerSummary.tsx`

Current `PlayerSummary` is a client component that reads URL params with `useParams` / `useSearchParams` and fetches `/api/player/stats/...` inside `useEffect`. The replacement receives `stats` and `gameType` as props from the page (Task 11).

- [ ] **Step 1: Replace the entire file with the server-component version**

```tsx
// components/player/summary/PlayerSummary.tsx

import { GameType, Prisma } from "@prisma/client";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import PlayerRating from "./PlayerRating";
import { PlayerStats } from "./PlayerStats";
import PlayerMatches from "./PlayerMatches";

export type StatsPayload = Prisma.PlayerStatsGetPayload<{
  include: { Game: { include: { Match: true } } };
}>;

export type ProcessedPlayerStat = StatsPayload & {
  rounds: number;
  totalDamage: number | null;
};

type Props = {
  stats: StatsPayload[] | null;
  gameType: string | undefined;
};

export default function PlayerSummary({ stats, gameType }: Props) {
  if (!stats || stats.length === 0) {
    return <NoStats />;
  }

  const processedPlayerStats: ProcessedPlayerStat[] = stats.map((s) => ({
    ...s,
    rounds: s.Game.rounds,
    totalDamage: s.damage,
  }));

  const isCombine = gameType?.toUpperCase() === GameType.COMBINE;

  return (
    <div className="flex flex-col xl:px-0 gap-2">
      {isCombine && <CombineDisclaimer />}

      <div className="flex flex-col xl:flex-row px-2 xl:px-0 gap-2">
        <div className="flex flex-col gap-2 xl:w-1/2">
          <PlayerRating stats={processedPlayerStats} />
          <PlayerStats stats={processedPlayerStats} />
        </div>
        <div className="w-full">
          <PlayerMatches stats={stats} gameType={gameType?.toUpperCase()} />
        </div>
      </div>
    </div>
  );
}

function CombineDisclaimer() {
  return (
    <div className="rounded-md bg-vdcRed/30 dark:bg-vdcRed/10 p-4 mx-2 xl:mx-0 outline outline-vdcRed/20">
      <div className="flex">
        <div className="shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="size-5 text-vdcRed"
          />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-vdcBlack dark:text-vdcWhite font-roboto italic">
            Combine stats are stored differently than regular season stats. Some
            data might be different or missing entirely.
          </p>
        </div>
      </div>
    </div>
  );
}

export function NoStats() {
  return (
    <div className="m-auto text-center py-10">
      <h1 className="text-vdcRed">
        Player has no available stats for the season!
      </h1>
    </div>
  );
}
```

Notes on what changed vs the original:
- Removed `"use client"`, all `useState`/`useEffect`/`useParams`/`useSearchParams`.
- Removed the fetch to `/api/player/stats/...` — the page does it now.
- Removed the inline `<Load />` function (already extracted in Task 9).
- Component is now a pure-function server component; `<NoStats />` stays as-is.
- `PlayerMatches` is still a client component (it has its own interactivity); it continues to receive `stats` as props the way it does today, unchanged.

- [ ] **Step 2: Verify `PlayerMatches` is still happy**

`PlayerMatches` is imported into the file with the same prop shape (`stats`, `gameType`). No changes needed there.

Run: `grep -nE "stats: StatsPayload|gameType" components/player/summary/PlayerMatches.tsx | head -10`
Expected: prop types in `PlayerMatches` still match what we're passing (`StatsPayload[]` and `string | undefined`). If the signature has drifted, adjust the call in `PlayerSummary` to match the existing `PlayerMatches` prop shape exactly. Do NOT change `PlayerMatches` — it's out of scope.

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS. May fail temporarily because `app/player/[player]/page.tsx` still calls `<PlayerSummary />` with no props. Task 11 fixes that. If the typecheck blocks committing, mark this task as committed-with-known-error and proceed to Task 11 immediately, then commit Tasks 10 and 11 together.

- [ ] **Step 4: Commit (or defer to Task 11 if Step 3 failed)**

```bash
git add components/player/summary/PlayerSummary.tsx
git commit -m "convert PlayerSummary to server component receiving stats as prop"
```

---

### Task 11: Update `app/player/[player]/page.tsx` to fetch stats and pass to PlayerSummary with Suspense

**Files:**
- Modify: `app/player/[player]/page.tsx`

- [ ] **Step 1: Add the new imports**

At the top of the file, alongside existing imports:
```ts
import { Suspense } from "react";
import { GameType } from "@prisma/client";
import { getPlayerStatsBy } from "@/lib/queries/stats/stats";
import { PlayerSummarySkeleton } from "@/components/player/summary/PlayerSummarySkeleton";
```

- [ ] **Step 2: Fetch stats inside `Page` and pass to PlayerSummary**

Find the line where `playerInfo` is awaited (~line 123 after Task 7's edits):
```ts
const playerInfo = await getPlayerByRiotIGN(playerIGN.decoded);
if (!playerInfo) return <PlayerNotFound player={playerIGN.decoded} />;
```

Immediately before the `tabElements` array declaration, add:
```ts
const season = parseInt(sp.season as string);
const gameTypeParam = (sp.type as string).toUpperCase() as GameType;
```

(Both `sp.season` and `sp.type` are already validated as members of `validSeasons` / `validTypes` earlier in the function, so the cast is safe.)

Now find the existing `tabElements` declaration:
```ts
const tabElements: TabElement[] = [
  {
    query: "Summary",
    color: "vdcRed",
    name: "Summary",
    content: <PlayerSummary />,
  },
  ...
];
```

Replace the `PlayerSummary` entry's `content` with a Suspense-wrapped, prop-supplied version:
```ts
const tabElements: TabElement[] = [
  {
    query: "Summary",
    color: "vdcRed",
    name: "Summary",
    content: (
      <Suspense fallback={<PlayerSummarySkeleton />}>
        <PlayerSummaryWithStats
          riotIGN={playerIGN.decoded}
          season={season}
          gameType={gameTypeParam}
          gameTypeParam={sp.type as string}
        />
      </Suspense>
    ),
  },
  {
    query: "Agents",
    color: "vdcRed",
    name: "Agents",
    content: <PlayerAgents />,
  },
  {
    query: "Maps",
    color: "vdcRed",
    name: "Maps",
    content: <PlayerMaps />,
  },
];
```

- [ ] **Step 3: Add the `PlayerSummaryWithStats` async wrapper at the bottom of the file**

After `handleDiscordIDSearch` (or wherever the page's helper functions live), append:
```tsx
async function PlayerSummaryWithStats({
  riotIGN,
  season,
  gameType,
  gameTypeParam,
}: {
  riotIGN: string;
  season: number;
  gameType: GameType;
  gameTypeParam: string;
}) {
  const stats = await getPlayerStatsBy({
    riotIgn: riotIGN,
    season,
    gameType,
  });
  return <PlayerSummary stats={stats ?? null} gameType={gameTypeParam} />;
}
```

Why a wrapper instead of awaiting in `Page`: putting the `await getPlayerStatsBy` inside the Suspense boundary's child means the rest of the page (player info, tabs, dropdowns) streams immediately and the Summary tab fills in once stats resolve. If stats were awaited at the top of `Page`, the whole page would block.

- [ ] **Step 4: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Production build**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/player/[player]/page.tsx
git commit -m "fetch player stats server-side and stream via Suspense"
```

---

### Task 12: Verify player page end-to-end on dev server

**Files:** none (manual verification)

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Open a known player page and confirm Summary tab data**

In a browser, navigate to `http://localhost:3000/player/<encoded IGN>?season=<current season>&type=season&by=summary`. Expected: PlayerInfo renders immediately; PlayerSummary either renders immediately or briefly shows the skeleton then renders. Compare numbers (rating, K/D/A, matches list) against the same page on `main` — they should match exactly.

- [ ] **Step 3: Toggle the season dropdown and verify stats refresh**

Change the season via the dropdown. Expected: URL updates, page re-renders, stats reflect the new season. No flash of stale data.

- [ ] **Step 4: Toggle game type (Season → Combine)**

Expected: URL updates, stats reflect combine games, CombineDisclaimer banner appears.

- [ ] **Step 5: Open a player with no stats for the selected season**

Expected: NoStats component renders inside the Summary tab.

- [ ] **Step 6: Test the discord-ID redirect path again**

Visit `/player/<discord ID>`. Expected: redirects to encoded IGN.

- [ ] **Step 7: Stop dev server**

If anything misbehaves, do not proceed to Task 13. Compare the rendered output to a checkout of `main` and reconcile.

---

### Task 13: Delete the three migrated route handlers

**Files:**
- Delete: `app/api/player/[riotIGN]/route.ts`
- Delete: `app/api/player/stats/[riotIGN]/route.ts`
- Delete: `app/api/users/discord/[discordId]/riot/route.ts`

- [ ] **Step 1: Final grep for any remaining callers**

```bash
grep -rnE "/api/player/\[riotIGN\]|/api/player/stats|/api/users/discord/.*/riot" app components lib --include="*.ts" --include="*.tsx" | grep -v "app/api/"
```
Expected: zero results. If anything turns up, it's a forgotten caller — fix it before deleting.

Also grep for type imports from the about-to-be-deleted route files:
```bash
grep -rnE "from \"@/app/api/player/\[riotIGN\]/route\"|from \"@/app/api/player/stats" app components lib --include="*.ts" --include="*.tsx"
```
Expected: zero results.

- [ ] **Step 2: Delete the route files**

```bash
rm app/api/player/[riotIGN]/route.ts
rm app/api/player/stats/[riotIGN]/route.ts
rm app/api/users/discord/[discordId]/riot/route.ts
```

- [ ] **Step 3: Remove now-empty directories if Next.js doesn't accept them**

Next.js treats empty route directories as zero-route segments — fine. But run `find app/api -type d -empty` and remove any directories that previously held only the deleted `route.ts` (the parent directories of the three deletes). Example:
```bash
rmdir app/api/player/[riotIGN] 2>/dev/null
rmdir app/api/player/stats/[riotIGN] app/api/player/stats 2>/dev/null
rmdir app/api/users/discord/[discordId]/riot app/api/users/discord/[discordId] app/api/users/discord app/api/users 2>/dev/null
```
(The `2>/dev/null` swallows errors when a directory is not empty — e.g., `app/api/users` still contains `vdc/` so the `rmdir` for it is a no-op.)

- [ ] **Step 4: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Production build**

Run: `pnpm build`
Expected: PASS. The build output's route table no longer lists the three deleted routes.

- [ ] **Step 6: Commit**

```bash
git add -A app/api
git commit -m "delete migrated player API routes"
```

---

### Task 14: Final verification

**Files:** none (manual verification + lint)

- [ ] **Step 1: Run the linter**

Run: `pnpm lint`
Expected: PASS (or no new errors vs `main`).

- [ ] **Step 2: Start dev server and confirm the deleted routes 404**

```bash
curl -i -H "Origin: http://localhost:3000" http://localhost:3000/api/player/dla%23VDC
```
Expected: `HTTP/1.1 404 Not Found` (no route handler). This confirms the deletions took effect — the routes no longer exist, even from same-origin.

```bash
curl -i -H "Origin: http://localhost:3000" "http://localhost:3000/api/player/stats/dla%23VDC?season=1&type=SEASON"
```
Expected: 404.

- [ ] **Step 3: Confirm the player page still works**

Open `http://localhost:3000/player/<encoded IGN>?season=<current>&type=season&by=summary` in a browser. Expected: identical behavior to Task 12 — all data renders, dropdowns work, no console errors.

- [ ] **Step 4: Sanity-check the rest of the site**

Click through the navigation: home, schedule, stats, franchises, your `/me` page. Expected: nothing else broke. Other pages still talk to their old `/api/*` routes; those are out of scope for this plan.

- [ ] **Step 5: Stop dev server**

- [ ] **Step 6: Push branch and open PR**

```bash
git push -u origin <branch-name>
```
Open the PR with the spec linked in the description.

---

## Self-Review

**Spec coverage:**

- Phase 0 (origin gate stopgap): Tasks 1-3.
- Phase 1 — "Add `lib/queries/user/getPlayerByRiotIGN.ts`, `getRiotByDiscordId.ts`": Tasks 5-6 (file renamed to `getRiotIGNByDiscordId.ts` for clarity — same function).
- Phase 1 — "Convert `app/player/[player]/page.tsx`": Tasks 7, 11.
- Phase 1 — "Convert `PlayerSummary.tsx` to server component": Tasks 9, 10.
- Phase 1 — "Delete the three routes": Task 13.
- Phase 1 — "Verify no other callers grep-clean": Task 13, Step 1.
- Spec convention "Split `lib/queries/user/user.ts` as part of this PR": the existing functions in that file (`getUser`, `getUserTier`) are not touched by Phase 1 — they don't get used by the player profile path. The new per-query files set the convention; splitting existing functions out of `user.ts` is deferred to whichever later phase first needs to touch one of them, per the spec's "split as part of the migration that touches them" rule. **No new task needed.**
- Spec convention "Wrap pure read functions in React's `cache()`": Tasks 5-6 wrap in `cache()`.

**Placeholder scan:** none found. Every code step contains complete code. No "TBD" / "TODO" / "handle errors appropriately."

**Type consistency:**
- `PlayerProfile` defined in Task 4, imported in Task 5 (`getPlayerByRiotIGN`) — same name, same module.
- `StatsPayload` defined in Task 10's PlayerSummary, used in Task 11's `PlayerSummaryWithStats` via the inferred return of `getPlayerStatsBy` — matches.
- `getPlayerByRiotIGN` exported from Task 5, imported in Task 7 with the same name.
- `getRiotIGNByDiscordId` exported from Task 6, imported in Task 7 with the same name.
- Middleware functions (`isAllowedOrigin`, `extractRequestOrigin`, `isOriginExemptPath`) defined in Task 1, imported in Task 2 with the same names.

No gaps identified.
