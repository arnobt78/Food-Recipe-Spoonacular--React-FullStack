# Agile V Playbook — recipe-spoonacular

Project-specific operating guide for the Infinity Loop on this codebase.

## Quick Start (Every Session)

1. Load **agile-v-core** → read `.agile-v/STATE.md`
2. Cite **REQ-XXXX** on all artifacts and decisions
3. Match existing architecture (see below)
4. Write-through **STATE.md** + **DECISION_LOG.md** on stage transitions

## Architecture Conventions

| Layer | Location | Notes |
|-------|----------|-------|
| App Router pages | `app/` | Server components default; `force-dynamic` on auth/data pages |
| Client UI | `src/components/` | Pages delegate to `src/components/pages/` |
| Hooks / context | `src/hooks/`, `src/components/providers/` | AuthContext, RealtimeProvider |
| Server libs | `lib/` | Pure functions — no React |
| Unified API | `app/api/[...path]/route.ts` | **All** new endpoints go here |
| Auth | `auth.ts`, NextAuth v5 | Credentials + Google only |
| Cache | Redis (`lib/redis-cache.ts`) + React Query | Invalidate via `notifyCrud()` + `invalidateByAppEvent()` |
| Realtime | `lib/realtime/`, SSE `/api/events/stream` | 8s SSE window; cross-tab sync |
| Images | `SafeImage` | Never raw `<img>` for remote URLs |
| Tests | `lib/__tests__/`, Vitest | `npm run test` |

## Pipeline Stages (C1)

```
1 Requirements → 2 Validation → [Gate 1] → 3 Synthesis → 4 Verification → [Gate 2] → 5 Acceptance
```

**Current:** REQ-0025 shipped (build-agent): Vercel Next.js defaults + Node 24.x. REQ-0010/0024 shipped. Red Team / Gate 2 pending. RISK-0005/0006 deferred (future REQ-0026).

## Adding Work

1. **New feature/fix** → add or extend REQ in `REQUIREMENTS.md`
2. **Backlog item** → `BACKLOG.md` with REQ link
3. **Implementation** → `BUILD_MANIFEST.md` ART row
4. **Tests** → `TEST_SPEC.md` TC row
5. **Decision** → append `DECISION_LOG.md`
6. **Trace span** → append `TRACE_LOG.md`

## Verification Checklist (Before "Done")

```bash
npm run test
npm run lint
npm run build
```

For API/cache changes: confirm `notifyCrud()` + insights cache bust if stats affected.

## Human Gates

| Gate | When | Record |
|------|------|--------|
| Gate 1 | New scope / sprint start | `APPROVALS.md` + `CHECKPOINTS.md` |
| Gate 2 | Release / C1 close | `EVAL_RESULTS.md` eval_gate_status PASS + `APPROVALS.md` |

## Skill Load Order

See `.agile-v/skills/INDEX.md` — primary build skill: **build-agent-js** (`13-build-agent-js.md`).

## Live URLs

- Production: https://recipe-smart.vercel.app/
- Repo: see `config.json` repo_url

## Post-Deploy Ops (Non-Blocking)

- Archive Sentry N+1 case 1 after release ≥ `0f30f8e`
- Remove legacy Auth0 env vars from Vercel
