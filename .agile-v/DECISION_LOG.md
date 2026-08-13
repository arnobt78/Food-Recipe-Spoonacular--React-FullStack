# Decision Log (Append-Only)

| Timestamp | Cycle | Agent | Decision | Rationale | Linked REQ |
|-----------|-------|-------|----------|-----------|------------|
| 2026-03-25T00:00:00Z | C1 | bootstrap | Initialize `.agile-v/` for recipe-spoonacular | User requested Agile V Infinity Loop bootstrap with REQ traceability | REQ-0001…0020 |
| 2026-03-25T00:00:01Z | C1 | bootstrap | Cycle C1 starts at Stage 1 (Requirements baseline) | Existing production app — baseline REQs captured from shipped features + Sentry backlog | — |
| 2026-03-25T00:00:02Z | C1 | bootstrap | REQ-0017 guardrails: code-only; Vercel Bot Protection manual | Dashboard settings cannot be repo-committed; documented in POLICY.yaml | REQ-0017 |
| 2026-03-25T00:00:03Z | C1 | bootstrap | REQ-0018 SafeImage: happy path unchanged | Fallback only on `onError`; no artificial delay for normal users | REQ-0018 |
| 2026-03-25T00:00:04Z | C1 | bootstrap | REQ-0020 deferred to Stage 3 | N+1 on business-insights logged; fix requires build-agent-js change | REQ-0020 |
| 2026-03-25T00:00:05Z | C1 | bootstrap | Single robots source: `app/robots.ts` only | Avoid conflicting `public/robots.txt` per agile-v guardrails | REQ-0017 |
| 2026-03-25T00:00:07Z | C1 | bootstrap | Created 24 skill stubs + INDEX + ACTIVATION.md | Full agent roster for Infinity Loop | — |
| 2026-06-09T00:00:00Z | C1 | build-agent-js | REQ-0020 shipped | Extract `lib/business-insights.ts` with consolidated SQL; Redis 60s cache + server invalidation on CRUD; `?probe=1` for status checks; SSR + React Query initialData; status poll 30s | REQ-0020 |
| 2026-06-09T12:00:00Z | C1 | build-agent-js | REQ-0021 shipped | Global SSE via `lib/realtime/` + Redis pub/sub; `GET /api/events/stream`; `notifyCrud()` on 22 mutation sites; `RealtimeProvider` + `invalidateByAppEvent()` | REQ-0021 |
| 2026-06-09T12:00:01Z | C1 | build-agent-js | REQ-0022 shipped | Removed Auth0 routes/packages; `lib/user-registration.ts` shared signup; NextAuth-only `requireAuth()` | REQ-0022 |
| 2026-06-09T12:00:02Z | C1 | test-designer | REQ-0023 shipped | Vitest for business-insights + realtime publish; `npm run test` in CI/local | REQ-0023 |
| 2026-06-09T12:00:03Z | C1 | build-agent-js | Stale Auth0 comments updated | `src/types.ts`, `prisma/schema.prisma` JSDoc aligned to NextAuth | REQ-0022 |
| 2026-06-09T12:00:04Z | C1 | agile-v-core | `.agile-v/` synced to shipped wave | STATE, REQs 0021–0023, manifest, backlog, ATM, playbook | REQ-0020…0023 |
| 2026-08-13T10:40:00Z | C1 | agile-v-core | Resume reconcile; halt at Human Gate 1 | HEAD is `cf6625d` not `2a6cf02`; no new product REQ this session; Gate 1 never recorded; synthesis already shipped. Next scope is Human-Decision (PLAN options A/B/C). FLAG-001: `/api/debug/auth-info` lists all users to any authenticated caller. | REQ-0001…0023 |
| 2026-08-13T10:53:00Z | C1 | build-agent-js | GATE-0001 approved AI-only CR-0002 | User confirmed Cursor plan; implement shared `lib/ai/` free-tier fallback for REQ-0010. Security hotfix deferred. | REQ-0010 |
| 2026-08-13T11:05:00Z | C1 | build-agent-js | ART-0009 shipped | Shared OpenAI-compat client; Groq gpt-oss/qwen3.6; Gemini 2.5 flash; OpenRouter :free; HF router actually called. TC-0024 12/12. Red Team not executed. | REQ-0010 |
| 2026-08-13T11:38:00Z | C1 | build-agent-js | GATE-0002 approved CR-0003 / REQ-0024 | Tooling only: browserslist, ESLint 9 on Next 15.5.9, Sentry 10.x. No Next 16 / Prisma 7 / CRUD. | REQ-0024 |
| 2026-08-13T11:42:00Z | C1 | build-agent-js | ART-0010 shipped | ESLint 9 + eslint.config.mjs; @sentry/nextjs@10.70.0; caniuse-lite refreshed. Pinned @eslint/js@9 (not 10). next lint kept. | REQ-0024 |
