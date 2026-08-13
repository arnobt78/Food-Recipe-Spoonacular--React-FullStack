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
| `lib/` | Prisma, Redis, business-insights, user-registration, realtime, `lib/ai/` (REQ-0010) |
| `eslint.config.mjs` | ESLint 9 flat config (REQ-0024); Next 15.5.9 |

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

See `.env.example` — core: `DATABASE_URL`, `API_KEY`, `AUTH_SECRET`, `AUTH_URL`
Learner docs: root `README.md`. Private vulns: `SECURITY.md` → contact@arnobmahmud.com.
AI (REQ-0010): `OPENROUTER_API_KEY`, `GOOGLE_GEMINI_API_KEY`, `GROQ_LLAMA_API_KEY`, `HUGGING_FACE_INFERENCE_API_KEY`

## AI fallback (REQ-0010 / CR-0002)

`lib/ai/` — Groq (`gpt-oss` / `qwen3.6`) → Gemini `2.5-flash` → OpenRouter `:free` → HF router. Catch-all `/api/ai/*` + weather-AI call `completeChat()`. No paid/Llama IDs.

## Audit (2026-08-13)

| Check | Status |
|-------|--------|
| test (12/12) + lint + build | pass |
| REQ-0010 free-tier AI client | pass (TC-0024) |
| REQ-0024 tooling hygiene | pass (TC-0025; ESLint 9, Sentry 10.70, caniuse-lite) |
| Auth0 removed | pass |
| notifyCrud + client invalidation | pass (unchanged this wave) |
| Vercel AI env names | match code; no rename |
| Post-deploy | REQ-0024 on main `c005880`; Sentry N+1 (BL-0010) still open |
