# C1 Resume & Next-Scope Plan

> **For agentic workers:** Do not implement until Human Gate 1 records `resume_token=av-c1-hg1-20260813-a7f3` in `APPROVALS.md`. After approval, use build-agent-js for code and red-team-verifier independently for Stage 4. Do not self-verify.

**Goal:** Reconcile C1 recorded state with the repository, freeze a truthful resume point, and get Human Gate 1 approval for the next implementation slice.

**Architecture:** Preserve existing Next.js 15 App Router layout: pages in `app/`, UI in `src/`, server libs in `lib/`, business API in `app/api/[...path]/route.ts`, NextAuth v5 in `auth.ts` + `/api/auth/[...nextauth]`. Mutations already call `notifyCrud()` inside the catch-all route.

**Tech Stack:** Next.js 15.5.9, React 18, TypeScript, Prisma 6 + PostgreSQL, NextAuth v5, TanStack Query, Upstash Redis, Vitest, Vercel.

**Spec:** `.agile-v/REQUIREMENTS.md` (REQ-0001…0024). Protocol: `docs/AGILE_V_PROTOCOL.md`.

**Superseded 2026-08-13:** GATE-0001 chose AI-only (REQ-0010 / CR-0002). GATE-0002 assigned **REQ-0024** to tooling hygiene (ESLint 9 / Sentry 10.x / browserslist), not Option B security. RISK-0005/0006 remain deferred.

**This session's request:** Protocol §15 resume/plan only. **No new product feature was specified.** Do not invent C2 product REQs.

## Global Constraints

- Cite parent REQ-XXXX on every artifact; halt if missing.
- No implementation in `app/`, `src/`, `lib/` until Gate 1.
- Build Agent does not verify own work (Red Team Protocol).
- Prefer extending existing hooks/components over parallel implementations.
- Server-first pages; extract only interactive islands to client components.
- All new business endpoints go in `app/api/[...path]/route.ts` except NextAuth handlers.
- Mutations must keep `notifyCrud()` + insights cache bust.
- Use `SafeImage` for remote images.
- Do not restore `docs/DROPDOWN_TEST_CREDENTIALS_DOCS.md` if it contained credentials.
- Do not treat `docs/LLM_MODEL_SELECTION.md` as this repo's AI implementation (it describes CodeBook `backend/src/lib/ai/` and REQ-1613, which do not exist here).

---

## Reconciliation (verified vs recorded)

### Verified facts

| Claim in old STATE.md | Repository fact |
| --------------------- | --------------- |
| Git baseline pending / implied `2a6cf02` | HEAD is `cf6625d` (2026-06-27), branch `main` tracks `origin/main` |
| REQ-0020…0023 shipped | Confirmed: `0f30f8e`, `174dd3a`, `2a6cf02`, then docs sync `cf6625d` |
| Auth0 removed | No `@auth0` deps or `AUTH0` strings in tracked source |
| Vitest baseline | `lib/__tests__/business-insights.test.ts`, `realtime-publish.test.ts` only (2 files) |
| Unified API | `app/api/[...path]/route.ts` (~5670 lines) is the business handler |
| Gate 1 complete | **False** — `APPROVALS.md` has no GATE-ID rows |
| Red Team executed | **False** — VALIDATION_SUMMARY and EVAL_RESULTS say pending |
| CLAUDE.md operational | **False** — stub headings only (filled this session) |
| Root AGENTS.md | **Missing** (created this session) |
| Root AGILE_V_PROTOCOL.md | Lives at `docs/AGILE_V_PROTOCOL.md` only |

### Working tree (not committed)

- Modified: `.agile-v/STATE.md` (this reconcile).
- Untracked: `docs/AGILE_V_PROTOCOL.md`, `docs/LLM_MODEL_SELECTION.md`.
- Deleted locally: `docs/DROPDOWN_TEST_CREDENTIALS_DOCS.md` — **do not restore** without Human confirmation; filename implies credentials.

### Traceability gaps (ATM)

ATM rows exist for REQ-0001, 0003, 0009, 0017–0023 only. Missing ATM rows: **REQ-0002, 0004–0008, 0010–0016**. PLAYBOOK claimed “no orphans”; that is incomplete, not a code defect.

### Architecture facts (for later implementation)

| Layer | Location |
| ----- | -------- |
| Pages (RSC shells) | `app/page.tsx`, `app/recipe/[id]/page.tsx`, `app/blog/`, `app/business-insights/`, `app/api-status/`, `app/api-docs/` |
| Client pages | `src/components/pages/` — home shell is entirely `"use client"` via `HomePage.tsx` |
| Providers | `src/components/providers/`, `src/context/AuthContext.tsx`, `RecipeContext.tsx` |
| Hooks | `src/hooks/use*.ts` (recipes, collections, meal plan, shopping, notes, images, videos, insights, realtime) |
| API | Catch-all + NextAuth + signup-nextauth + QStash jobs + **test redis** |
| Cache / realtime | `lib/redis-cache.ts`, `lib/realtime/`, `notifyCrud()` (23 call sites in catch-all) |
| Tests | Vitest only; no Playwright/E2E (RISK-0004) |

### Extra API routes vs PLAYBOOK

PLAYBOOK: “All new endpoints go in the catch-all.” Existing exceptions:

| Path | Verdict |
| ---- | ------- |
| `app/api/auth/[...nextauth]/route.ts` | Required by NextAuth (REQ-0003) |
| `app/api/auth/signup-nextauth/route.ts` | Required signup (REQ-0003 / REQ-0022) |
| `app/api/jobs/scheduled/route.ts` | QStash webhook; justified separate function |
| `app/api/test/redis/route.ts` | File comment: “DO NOT use in production”. Ungated Redis probe. **FLAG** |

### Suspected / confirmed risks (not fixed this session)

| ID | Kind | Evidence | Linked |
| -- | ---- | -------- | ------ |
| FLAG-001 | Security | `GET /api/debug/auth-info` is `requireAuth()` but returns `allUsersInDb` (id, email, name, createdAt) to **any** logged-in user. `app/api/[...path]/route.ts` ~521–557 | Propose REQ-0024 |
| FLAG-002 | Security | `app/api/test/redis/route.ts` unauthenticated Redis read/write/delete | Propose include in REQ-0024 |
| FLAG-003 | Maintainability | Catch-all route ~5670 lines | Defer unless C2 refactor REQ |
| FLAG-004 | Rendering | `app/page.tsx` is a thin RSC wrapping a full-page client `HomePage` | Defer; protocol prefers extracting islands only |
| RISK-0002 | Ops | Vercel Bot Protection still manual | REQ-0017 |
| RISK-0004 | Quality | No E2E | C2 candidate |
| BL-0010 | Ops | Sentry N+1 archive not evidenced in repo | REQ-0020 |
| Docs drift | Process | `docs/LLM_MODEL_SELECTION.md` is a CodeBook portable copy (REQ-1613, `personal-dev-info.txt`) | Localize or leave as generic reference |

### Historical validation (not re-run this session)

EVAL_RESULTS.md records 2026-06-09: `npm run test` 2/2, lint, build PASS. This resume did **not** re-execute those commands. Do not treat them as fresh evidence.

---

## Human Gate 1 — choose one option

### Option A — C1 closeout (recommended default)

No product features. Close the verification right-side of the V.

1. Independent Red Team on REQ-0020…0023 + FLAG-001/002.
2. Human confirms BL-0010 in Sentry (or waives with name + evidence).
3. Complete ATM rows for missing REQs (docs).
4. EvalGate PASS or WAIVED → Gate 2 → archive `cycles/C1/`.

**REQs:** existing REQ-0020…0023, REQ-0017 (manual), RISK-0004 unchanged.

### Option B — Security hotfix then closeout (recommended if production is live)

Same as A, but Stage 3 first:

- **REQ-0024** (new): Remove or admin-gate `/api/debug/auth-info`; delete or env-gate `/api/test/redis`.
- Tests: authenticated non-admin must not receive `allUsersInDb`; redis test route 404 or 401 in production.
- Then Red Team + Gate 2.

**Traceability:** Do not implement REQ-0024 until this option is approved and REQ-0024 is added to REQUIREMENTS.md.

### Option C — New C2 feature

Re-enter Stage 1. User must state the feature. Then Requirement Architect writes REQ-0025+, Logic Gatekeeper, Gate 1 on those REQs, then synthesis.

**Do not start Option C without an explicit product request.**

---

## If Option B is approved — implementation sketch

### Task 1: REQ-0024 debug and test-route lockdown

**Files:**

- Modify: `app/api/[...path]/route.ts` (debug block ~515–557)
- Delete or gate: `app/api/test/redis/route.ts`
- Test: `lib/__tests__/debug-auth-info.test.ts` (or route-level test if a harness exists; today tests are unit-only in `lib/__tests__/`)

**Interfaces:**

- Consumes: existing `requireAuth(request)`
- Produces: debug route either removed, or 403 unless an explicit admin allow-list (do not add a new auth system)

**Steps after approval:**

- [ ] Add REQ-0024 + BL-0011 + ART-0009 + TC-0024 to registers
- [ ] Write failing test: debug handler must not return a user directory
- [ ] Remove `allUsersInDb` query; prefer delete the whole debug route
- [ ] Remove `app/api/test/redis/route.ts` (file already says remove after testing)
- [ ] `npm run test && npm run lint && npm run build`
- [ ] Independent Red Team (different agent/context)
- [ ] Update VALIDATION_SUMMARY, EVAL_RESULTS, ATM, STATE

**Out of scope:** catch-all split, HomePage RSC extraction, Playwright, LLM provider rewrite, Auth0 env cleanup on Vercel (ops, non-blocking).

### Task 2: ATM completeness (docs)

Add ATM rows mapping REQ-0002, 0004–0008, 0010–0016 to existing files. No code.

### Task 3: Red Team (separate context)

Verify REQ-0020…0024 against code and tests. Build Agent does not run this.

---

## If Option A is approved — no code except docs/verification

- [ ] Dispatch red-team-verifier on REQ-0020…0023
- [ ] Human supplies BL-0010 Sentry result
- [ ] Fill ATM gaps
- [ ] Gate 2 package: VALIDATION_SUMMARY EvalGate, EVAL_RESULTS, APPROVALS

---

## Time allocation (quality-gates)

| Option | Complexity | Minimum |
| ------ | ---------- | ------- |
| A | Process / verify | 60–90 min |
| B | Simple security + tests | 60–120 min |
| C | Unknown | Halt until scoped |

---

## Decision log (this plan)

| Choice | Recommendation | Why |
| ------ | -------------- | --- |
| Next scope | **B** if site is public; else **A** | FLAG-001 is authenticated PII listing; production URL is live |
| New features | None | User did not request any |
| Catch-all split | Defer | Unrelated refactor; needs its own REQ |
| LLM_MODEL_SELECTION | Keep as portable reference or localize later | Wrong-repo paths; not C1 code |

---

## Halt

Waiting for Human Gate 1.

Approve by appending `APPROVALS.md` with:

- Decision: Option A, B, or C
- Approver full name + role
- `resume_token=av-c1-hg1-20260813-a7f3`
- `INTERRUPT-ID=INT-0001`
