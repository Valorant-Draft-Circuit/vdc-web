# App Router Modernization — Design

**Date:** 2026-06-06
**Status:** Draft, pending implementation plan
**Driver:** Yulhee (dla)

## Goals

1. Eliminate self-fetching `/api/*` routes that exist only to serve the site's own pages. The site should render data on the server without round-tripping its own JSON API.
2. Make the remaining `/api/*` surface small enough that each endpoint has a clear, gateable purpose: NextAuth callbacks, external integrations, internal admin tools, ops endpoints.
3. As a downstream effect, remove the casual-scraping vector. Once `/api/player/<x>` does not exist, it cannot be scraped.
4. Adopt App Router idioms already partially present in the codebase: Server Components by default, Server Actions for mutations, `lib/queries/*` as the single source of read logic.

## Non-Goals

- This is not a UI redesign. Pages should look and behave identically after each PR.
- Not introducing tRPC, GraphQL, or any new data-fetching framework.
- Not switching ORM, auth provider, or database.
- Not building a hardened public API. If a public API is ever needed, it gets designed separately under a versioned prefix (e.g. `/api/v1/public/*`) with documented auth.
- Not eliminating `/api/*` entirely. NextAuth, webhooks, and ops endpoints stay.

## Context

The codebase mixes two eras:

- **Pages Router habit (~2020):** server logic only ran in `pages/api/*`, so reads and writes both went through HTTP endpoints. The site's React tree called its own `/api/*` for everything.
- **App Router idiom (current):** Server Components can read databases directly; Server Actions handle mutations from client components. Route handlers exist for callers the React tree cannot reach: webhooks, OAuth callbacks, third-party clients, ops endpoints.

The repo already has the right scaffolding:
- [lib/queries/](lib/queries) is organized by domain (`teams`, `stats`, `match`, `user`, ...) and is the obvious home for reusable read logic. PR #243 has begun expanding these modules with more queries; without a per-query file convention they will grow into the kind of grab-bag files this migration is trying to avoid.
- Two Server Actions exist as precedent: [components/auth/actions.ts](components/auth/actions.ts) and [lib/auth/redirect-server-logout.ts](lib/auth/redirect-server-logout.ts).
- URL-as-state pattern was just established in PR #240, which validated server-component-first thinking.
- PR #242 split the monolithic `lib/common/utils.ts` into focused modules (`flags`, `format`, `match`, `math`, `player`, `season`, `tier`, `times`). The one-file-per-concern convention proposed below for `lib/queries/*` extends this same instinct.

Most public-page routes under `/api/*` (`player/[riotIGN]`, `teams/[id]`, `stats/...`, `match/...`) are called from the site itself and have no external consumers. They are the migration targets.

## Architecture

Three layers, with one direction of dependency:

```
Server Component (page.tsx)
        |
        v
lib/queries/<domain>/<name>.ts  <-- pure async functions: (args) => data
        |
        v
Prisma (or Meilisearch client)
```

Mutations follow the same shape:

```
Client Component (form, button)
        |
        v (formData / typed args)
app/.../actions.ts  ("use server" file)  <-- auth check + lib/queries write call + revalidate
        |
        v
Prisma
```

### Why this shape

- One module per query keeps imports unambiguous and lets `cache()` wrap individual queries.
- `lib/queries/*` is callable from anywhere on the server: pages, server actions, route handlers, scripts. No duplicate logic across layers.
- Auth checks live at the boundary (route handler, server action) — never inside `lib/queries/*`. Queries assume the caller has authorized.
- Client components do not fetch data directly. They receive props from a server-component parent. If they need to react to user input that changes data, they trigger a Server Action.

## Conventions

### Query module structure

- One file per query function: `lib/queries/<domain>/<verb><Noun>.ts`. Examples:
  - `lib/queries/user/getPlayerByRiotIGN.ts`
  - `lib/queries/teams/getTeamById.ts`
  - `lib/queries/match/getMatchWithGames.ts`
- Existing `lib/queries/*/*.ts` files that group multiple queries get split as part of the migration that touches them. No standalone "split files" PR.
- Export: a single named async function whose name matches the file name. No default exports.
- Return type is inferred from Prisma. Callers get full type safety end-to-end without manual interface declarations.
- Wrap pure read functions in React's `cache()` so a single render that calls the same query twice hits the DB once. Cross-request caching via `unstable_cache` is opt-in per query when revalidation semantics are clear.
- No `fetch()` calls inside `lib/queries/*`. If a query needs Meilisearch or another HTTP service, use that service's SDK or a dedicated client module — not a self-fetch to `/api/*`.

### Server Component data flow

- Pages and layouts are `async` Server Components by default.
- A page that needs data calls one or more query functions at the top of its body, awaits them (in parallel with `Promise.all` where independent), and passes results as props to its children.
- Client components below the page receive data as props. They do not refetch on mount.
- For data that depends on URL state (search params, route segments), the page reads from `searchParams` / `params` and re-runs on navigation. This is already the established pattern from PR #240.

### Server Action structure

- Co-located with the component that uses them: `components/<area>/actions.ts` or `app/<route>/actions.ts`, beginning with `"use server"`.
- Shape:
  ```ts
  export async function actionName(args: TypedArgs): Promise<Result> {
    const session = await auth();
    if (!session) return { error: "Unauthenticated" };
    // role check if applicable
    const result = await mutationQuery(args);
    revalidatePath("/relevant/path");
    return { data: result };
  }
  ```
- Auth and role checks reuse [lib/auth/access.ts](lib/auth/access.ts) — `hasAccess`, `getUserRoles`, etc. The same gate that today lives in `/api/internal/control/route.ts` moves into the corresponding action verbatim.
- Mutations call `revalidatePath` / `revalidateTag` to bust caches. No client-side router refresh.
- Form submissions use `useActionState` (or `useFormStatus`) on the client. Progressive enhancement is preserved.

### Auth gate placement

After modernization, three buckets of code touch auth:

| Layer | Auth check |
| --- | --- |
| Query functions in `lib/queries/*` | None. Assume caller has authorized. |
| Server Actions | `auth()` + role check at top of every action. |
| Remaining `/api/*` route handlers | One of: NextAuth-managed, signature-verified webhook, ops shared secret, or session + role check. No public unauthenticated reads. |

## Route Inventory and Migration Targets

### Migrate (read routes → query function, route deleted)

| Route | Caller(s) | Target |
| --- | --- | --- |
| `app/api/player/[riotIGN]/route.ts` | `app/player/[player]/page.tsx:168` | `lib/queries/user/getPlayerByRiotIGN.ts`, page reads directly |
| `app/api/player/user/[id]/route.ts` | `components/auth/MobileAuth.tsx:25` | `lib/queries/user/getPlayerById.ts`; `MobileAuth` becomes a server component or receives data as a prop |
| `app/api/player/stats/[riotIGN]/route.ts` | `components/player/summary/PlayerSummary.tsx:37` | `lib/queries/stats/getPlayerStats.ts`; `PlayerSummary` becomes server component |
| `app/api/player/manager/franchise/slug/[userId]/route.ts` | `components/auth/MobileAuth.tsx:46` | `lib/queries/franchises/getManagedFranchise.ts` |
| `app/api/player/riot/route.ts` | `components/me/connected-accounts/AccountList.tsx:23` | `lib/queries/user/getOwnRiotAccounts.ts` (session-bound) |
| `app/api/teams/[id]/route.ts` | `components/player/summary/PlayerMatches.tsx:474` | `lib/queries/teams/getTeamById.ts`; `PlayerMatches` receives team map as prop |
| `app/api/teams/route.ts` | (none found; verify before delete) | If unused, delete. If used, query + caller refactor. |
| `app/api/match/[matchId]/route.ts` | `components/match/MatchStats.tsx:33` | `lib/queries/match/getMatch.ts`; `MatchStats` becomes server component |
| `app/api/match/[matchId]/game/[gameId]/route.ts` | `components/match/MatchStats.tsx:20` | `lib/queries/match/getGame.ts` |
| `app/api/stats/route.ts` | `components/stats/StatsPanel.tsx:28` | `lib/queries/stats/getStatsByTierSeason.ts`; `StatsPanel` becomes server component |
| `app/api/stats/franchise/[slug]/tier/[tier]/route.ts` | `components/franchises/teams/TeamStats.tsx:20` | `lib/queries/stats/getFranchiseTierStats.ts`; `TeamStats` becomes server component |
| `app/api/schedule/route.ts` | `components/schedule/SchedulesPanel.tsx:28` | `lib/queries/schedule/getSchedule.ts`; `SchedulesPanel` becomes server component |
| `app/api/staff/admins/summary/route.ts` | `components/staff/admin/PlayerDashboard.tsx:17` | `lib/queries/staff/getAdminSummary.ts`; dashboard becomes server component |
| `app/api/users/discord/[discordId]/riot/route.ts` | `app/player/[player]/page.tsx:34, :156` | `lib/queries/user/getRiotByDiscordId.ts` (internal-only — also verify no external caller before deleting the route) |

### Convert to Server Actions (write routes → action, route deleted)

| Route | Caller | Target |
| --- | --- | --- |
| `app/api/signup/route.ts` | `components/signup/SignUpForm.tsx:87` | `components/signup/actions.ts` |
| `app/api/internal/control/route.ts` (POST) | `components/staff/admin/control/ControlPanelForm.tsx:77` | `components/staff/admin/control/actions.ts`; GET also moves to a query function read by the page |
| `app/api/users/vdc/[vdcId]/roles/route.ts` | `components/staff/tech/roles/RoleSelector.tsx:40` | `components/staff/tech/roles/actions.ts` |
| `app/api/internal/FM/route.ts` | `components/staff/FM/Contracts.tsx:12` | `components/staff/FM/actions.ts` |

### Keep in `/api/*` (with correct gating)

| Route | Reason | Gate |
| --- | --- | --- |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth requires it | NextAuth-managed |
| `app/api/internal/health/route.ts` | Ops/uptime endpoint, called externally | Shared secret header or IP allowlist (currently ungated — fix as part of Phase 0) |
| `app/api/internal/meilisearch/index/[name]/route.ts` | Admin ops on Meilisearch indexes | Session + `LEAD_TECH` role (matches existing intent) |
| `app/api/internal/meilisearch/player/[id]/route.ts` | Sync helper | Session + tech role |
| `app/api/meilisearch/player/[id]/route.ts` | Called from `lib/auth/auth.ts:99` after sign-in | Convert the caller to a direct function call; then delete this route |

## Phase 0: Stopgap Origin Gate

Ship before any migration work.

A single middleware that rejects any `/api/*` request whose `Origin` header is missing or not in an allowlist (`vdc.gg`, `localhost:3000`, preview deploy host). Exempt:
- `/api/auth/*` (OAuth providers POST cross-origin)
- `/api/internal/health` (external uptime caller — gates separately on a shared secret)
- Any future webhook routes (need their own signature verification)

This is not security — it is a speed bump that stops `curl` and casual scripts while the real refactor proceeds. It gets removed once the migration is complete and the remaining routes have proper per-route gates.

Implementation lives in [middleware.ts](middleware.ts), composed with the existing NextAuth middleware. ~30 lines.

## Phased Migration

Each phase is one PR. Each PR is mergeable independently and leaves the site in a working state.

**Phase 0 — Origin gate.** Middleware change only. No route deletions. ~30 lines.

**Phase 1 — Player profile end-to-end (template PR).** Picks the most-trafficked page to prove the pattern:
- Add `lib/queries/user/getPlayerByRiotIGN.ts`, `getRiotByDiscordId.ts`. If the existing grab-bag `lib/queries/user/user.ts` already contains these, split them into per-query files as part of this PR — the new convention applies from here on.
- Convert `app/player/[player]/page.tsx` to call queries directly.
- Convert `components/player/summary/PlayerSummary.tsx` to a server component (or split the client interactivity from the data-loading shell).
- Delete `app/api/player/[riotIGN]/route.ts`, `app/api/users/discord/[discordId]/riot/route.ts`, `app/api/player/stats/[riotIGN]/route.ts`.
- Verify no other callers grep-clean.

**Phase 2 — Signup as Server Action (template PR for actions).**
- Add `components/signup/actions.ts` with `signupAction`.
- Refactor `SignUpForm` to use `useActionState`.
- Delete `app/api/signup/route.ts`.

**Phase 3 — Match and stats pages.** Same pattern as Phase 1 applied to `components/match/MatchStats.tsx`, `components/franchises/teams/TeamStats.tsx`, `components/stats/StatsPanel.tsx`, `components/schedule/SchedulesPanel.tsx`. Each becomes a server component or receives data as a prop from its server-component parent. Routes deleted as their last caller goes.

**Phase 4 — Staff/admin pages.** `PlayerDashboard`, `ControlPanelForm`, `RoleSelector`, `Contracts`. Reads move to queries; writes move to actions. The role-check logic from existing handlers (`hasAccess(roles, [Roles.LEAD_TECH])`) ports unchanged into the actions.

**Phase 5 — Connected accounts and mobile auth.** `AccountList.tsx`, `MobileAuth.tsx`. These have small, self-contained API calls.

**Phase 6 — Auth callback cleanup.** Convert `lib/auth/auth.ts:100` self-fetch to a direct function call. Delete `app/api/meilisearch/player/[id]/route.ts`.

**Phase 7 — Lock remaining `/api/*`.** Whatever's left should be a small, named set. Add explicit per-route gates (NextAuth-managed, signed-secret for `/internal/health`, session+role for `/internal/meilisearch/*`). Remove the Phase 0 origin gate.

## Caching Strategy

- **Per-render dedup:** wrap every query function in React's `cache()`. Default for all queries.
- **Cross-request cache:** opt-in via `unstable_cache` only for queries whose freshness window is well-understood (e.g. franchise rosters that change weekly). Each opt-in declares its tag and revalidation rule explicitly.
- **Mutations call `revalidatePath` or `revalidateTag`** for the paths/tags they affect. Documented per action.

This section is intentionally light — the codebase does not have a strong caching story today and overbuilding one during this migration risks scope creep. Caching can be tightened in a separate pass once the structure is in place.

## Risks and Mitigations

- **Hidden external callers.** A route we plan to delete might be called by something we don't grep for (a Discord bot, a Postman collection, a cron job). Mitigation: before each delete, search the codebase, ask the team in `#tech`, and grep the production access logs if available. If unclear, leave the route as a thin wrapper that calls the new query function for one release before deleting.
- **Type drift between request handlers and queries.** Components that currently import `TMeiliPlayer` from a route file ([components/staff/tech/roles/PlayerRoleSearch.tsx](components/staff/tech/roles/PlayerRoleSearch.tsx), [components/player/search/Search.tsx](components/player/search/Search.tsx)) need that type moved to a shared module before the route is deleted.
- **Auth context in Server Actions.** `auth()` in actions must continue to return the same session shape. Validate against an existing route handler before deleting it.
- **Suspense boundaries.** Converting client components to server components changes the loading behavior — a `useState` loading flag becomes a Suspense boundary. Each phase wraps the appropriate parent in `<Suspense>` with a sensible fallback to avoid layout shift.

## Open Questions

1. **Migrate `/api/teams/route.ts`?** No caller found in grep. Confirm it has no consumer before deleting in Phase 3.
2. **Discord bot.** Does anything in `vdc-discord` or another sibling project hit these routes? If yes, list them and either keep those specific routes or coordinate the deletion.
3. **Meilisearch sync route (`/api/meilisearch/player/[id]`).** It's invoked from `lib/auth/auth.ts:100` after sign-in. Converting that to a direct function call is straightforward — confirm there's no external caller (e.g., a sync script) before deleting.
4. **`unstable_cache` adoption.** Worth opting in during Phase 1 as a precedent, or defer entirely to a later pass? Recommend defer.

## What "Done" Looks Like

After Phase 7:
- `app/api/` contains: `auth/[...nextauth]`, `internal/health`, `internal/meilisearch/*`, and any future webhook routes. Roughly 5–10 files total.
- Every page renders server-side without HTTP-self-fetching. `grep -r "fetch(\`\${process.env.URL}" app/` returns nothing.
- Every client `useEffect(() => fetch('/api/...'))` is gone. Replaced by props from a server-component parent or by Server Actions.
- Every remaining `/api/*` route has an explicit, documented auth gate at the top of its handler.
- The Phase 0 origin middleware is removed; protection comes from per-route gates and the absence of scrapeable endpoints.
