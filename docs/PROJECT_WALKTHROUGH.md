# Project Walkthrough (Agent Reference)

Compact map for codebase review. See `CLAUDE.md` for commands.

## Layout

| Path | Role |
|------|------|
| `app/` | App Router — `force-dynamic` on data pages |
| `app/api/[...path]/route.ts` | All REST + SSE (`events/stream`) |
| `src/components/pages/` | Client page shells |
| `src/components/providers/` | `RootLayoutProviders`, `RealtimeProvider` |
| `src/hooks/` | React Query + `useRealtimeSync` |
| `src/utils/queryInvalidation.ts` | RQ bust + `invalidateByAppEvent()` |
| `lib/` | Prisma, Redis, business-insights, user-registration, realtime |

## Auth (NextAuth only)

- `auth.ts` — Credentials + Google OAuth
- `lib/user-registration.ts` — shared signup/OAuth + cache bust + SSE publish
- `/api/auth/signup-nextauth` — email/password signup

## Realtime sync

```
CRUD → notifyCrud(domain) → Redis insights bust + publishAppEvent
      → SSE /api/events/stream → RealtimeProvider → invalidateByAppEvent
      → React Query refetch (cross-tab, no refresh)
```

| Layer | File |
|-------|------|
| Publish | `lib/realtime/publish.ts` |
| SSE | `lib/realtime/stream.ts`, route.ts `events/stream` |
| Client | `src/components/providers/RealtimeProvider.tsx`, `useRealtimeSync` |

## Business Insights (REQ-0020)

- `lib/business-insights.ts` — consolidated SQL
- Redis `business:insights` TTL 60s; `?probe=1` zero-DB health
- SSR + `initialData`; hooks bust on mutation + SSE

## Caching

1. Redis — search 30m, recipe 24h, insights 60s
2. React Query — Infinity default; insights 60s
3. sessionStorage/localStorage — client persistence

## Env

See `.env.example` — core: `DATABASE_URL`, `API_KEY`, `AUTH_SECRET`, `AUTH_URL`, `UPSTASH_REDIS_*`

## Audit (2026-06-27)

| Check | Status |
|-------|--------|
| test (2/2) + lint + build | pass |
| Auth0 removed | pass |
| notifyCrud (22 sites) + client invalidation | pass |
| SSR force-dynamic (7 pages) | pass |
| Vitest TC-0020 + TC-0021 | pass |
| `.env.example` synced | pass |
| Post-deploy ops | Sentry N+1 verify; remove Auth0 env from Vercel; optional disable Sentry Replay in SDK |
