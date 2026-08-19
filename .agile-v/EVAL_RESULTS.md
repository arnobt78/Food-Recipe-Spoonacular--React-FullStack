---
eval_run_id: ER-C1-0003
eval_timestamp: "2026-08-19T21:00:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: IN_PROGRESS
eval_gate_rationale: "CR-0004 npm test/lint/build PASS on Node v24.16.0; Vercel project nodeVersion 24.x; REQ-0010 Red Team still pending"
thresholds:
  regression: vitest + manual
  performance: sentry
---

# Eval Results — Cycle C1

| Suite | REQ | Result | Notes |
|-------|-----|--------|-------|
| bootstrap-baseline | REQ-0001…0016 | WAIVED | Pre-existing production features |
| guardrails | REQ-0017 | PASS | Code shipped |
| safe-image | REQ-0018 | PASS | Code shipped |
| business-insights-perf | REQ-0020 | PASS | Consolidated queries + Redis cache; vitest TC-0020 |
| realtime-publish | REQ-0021 | PASS | vitest TC-0021 |
| auth-consolidation | REQ-0022 | PASS | Auth0 removed; build OK |
| vitest-baseline | REQ-0023 | PASS | 2/2 tests; lint + build green |
| ai-free-tier-fallback | REQ-0010 | PASS | TC-0024; 12/12 vitest; lint + build 2026-08-13 |
| tooling-hygiene | REQ-0024 | PASS | TC-0025; ESLint 9 + Sentry 10.70; Next 15.5.9 |
| vercel-defaults-node24 | REQ-0025 | PASS | TC-0026; 15/15 vitest; lint + build 2026-08-19 on Node v24.16.0 (fnm); Vercel `nodeVersion` 24.x; buildCommand/outputDirectory overrides cleared |

## Commands Run (2026-08-19)

- `node -v` — v24.16.0 (fnm)
- `npm run test` — PASS (15/15)
- `npm run lint` — PASS (0 warnings)
- `npm run build` — PASS (Next 15.5.9)
- `vercel project inspect recipe-spoonacular` — Node.js Version 24.x; Build Command `` `npm run build` or `next build` ``; Output Directory Next.js default

## Pending

- Red Team independent verification of CR-0002 / REQ-0010 (Stage 4)
- Post-deploy Sentry N+1 case 1 resolution (BL-0010)
- RISK-0005 / RISK-0006 security hotfix (deferred as future REQ-0026)
- Git push / production deploy to drop the old production override snapshot warning
