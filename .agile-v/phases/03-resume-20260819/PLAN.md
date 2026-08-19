# C1 Resume Plan — 2026-08-19

> **CLOSED 2026-08-19.** INT-0002 closed via GATE-0003. **REQ-0025 is Vercel Next.js defaults + Node 24.x** (not the security hotfix). RISK-0005/0006 remain future **REQ-0026**. Current: `.agile-v/STATE.md`.  
> **Protocol:** Stage 4 / Human-Decision. No new product REQ was specified in this session.  
> **Supersedes next-scope of:** `.agile-v/phases/02-resume-plan/PLAN.md` (that file remains historical for GATE-0001).

**Goal:** Reconcile `.agile-v/` with repository HEAD `652f054`, freeze a truthful resume point, and get a Human-Decision on the next C1 slice.

**Architecture (unchanged):** Next.js 15 App Router — pages in `app/`, UI in `src/`, server libs in `lib/`, business API in `app/api/[...path]/route.ts` except NextAuth, signup, QStash jobs. Mutations keep `notifyCrud()`. Remote images use `SafeImage`. NextAuth v5 only.

**Spec:** `.agile-v/REQUIREMENTS.md` (REQ-0001…0024). Protocol: `docs/AGILE_V_PROTOCOL.md`.

**This session's request:** Protocol resume/reconcile/plan only. Text after the delimiter was empty. **Do not invent C2 product REQs.**

---

## Reconciliation (2026-08-19)

### Verified facts

| Recorded claim (STATE 2026-08-13) | Repository fact |
| --------------------------------- | --------------- |
| Git baseline `96e7c65` (README/SECURITY); tooling `1e8ddab` | **Stale.** HEAD is `652f054` (`docs: sync learner README audit and agent registers`, 2026-08-13). Branch `main` tracks `origin/main`, working tree clean |
| REQ-0010 shipped (`lib/ai/`) | Confirmed: `e4a7858` + `lib/ai/{client,index,parse-json,providers,types}.ts`; Groq gpt-oss/qwen3.6 → Gemini 2.5 Flash → OpenRouter `:free` → HF router |
| REQ-0024 shipped | Confirmed: `1e8ddab`; `eslint.config.mjs`; `eslint@^9.39.5`; `@sentry/nextjs@^10.70.0`; `next@15.5.9`; Prisma 6 |
| README + SECURITY.md | Confirmed present at repo root |
| GATE-0001 / GATE-0002 | Confirmed in `APPROVALS.md`. INT-0001 **CLOSED** |
| Gate 2 / EvalGate | Confirmed **NOT READY**: `eval_gate_status: IN_PROGRESS`; Red Team not executed |
| Build Agent self-verify | Correctly not claimed as Stage 4 complete |
| RISK-0005 / RISK-0006 deferred | Confirmed still open. **Do not attach them to REQ-0024** (tooling CR-0003). Security slice is **REQ-0026** (REQ-0025 used for Vercel/Node). |
| BL-0010 Sentry N+1 archive | Still backlog; no in-repo evidence of Sentry archive |
| Vitest | 3 files: `ai-fallback`, `business-insights`, `realtime-publish`. EVAL_RESULTS last run 2026-08-13 (12/12) — **not re-run this session** |

### Working tree

Clean. No uncommitted `.agile-v/` or source changes at start of this session.

### Traceability gaps (docs, not code defects)

| Gap | Notes |
| --- | ----- |
| ATM incomplete | Rows exist for REQ-0001, 0003, 0009–0010, 0017–0024. Missing ATM rows: **REQ-0002, 0004–0008, 0011–0016** |
| `config.json` LLM registry | Lists OpenRouter, Gemini, Groq; **Hugging Face missing** despite REQ-0010 last rung. `model_versions.last_validated` still `2026-06-09` |
| `phases/02-resume-plan/PLAN.md` | Historical; still describes Gate 1 as unrecorded and HEAD as `cf6625d`. Banner added this session |

### Extra API routes vs PLAYBOOK

| Path | Verdict |
| ---- | ------- |
| `app/api/auth/[...nextauth]/route.ts` | Required (REQ-0003) |
| `app/api/auth/signup-nextauth/route.ts` | Required (REQ-0003 / REQ-0022) |
| `app/api/jobs/scheduled/route.ts` | QStash webhook; justified separate function |
| `app/api/test/redis/route.ts` | Ungated Redis probe — **RISK-0006** (open) |
| Catch-all `GET /api/debug/auth-info` | Authenticated caller receives `allUsersInDb` — **RISK-0005** (open) |

### Historical validation (not re-run this session)

EVAL_RESULTS.md records 2026-08-13: `npm run test` 12/12, lint, build PASS. This resume did **not** re-execute those commands.

---

## Human-Decision — choose one option

### Option A — Independent Red Team (checkpoint default)

No product code. Close the verification right-side of the V for shipped CR-0002 / CR-0003.

1. Dispatch **red-team-verifier** in a **fresh context** (Build Agent does not self-verify).
2. Scope: REQ-0010 / ART-0009 / TC-0024, and optionally REQ-0024 / ART-0010 / TC-0025.
3. Re-run `npm run test && npm run lint && npm run build`; record VER lines + FT-CODEs.
4. Update `EVAL_RESULTS.md` (`eval_gate_status`) and `VALIDATION_SUMMARY.md` EvalGate.
5. Then Human Gate 2 (separate approval). BL-0010 and RISK-0005/0006 stay deferred unless chosen below.

**REQs:** REQ-0010, REQ-0024 (verify only).  
**Skills:** red-team-verifier + agile-v-quality-gates.  
**Out of scope:** implementation, Next 16, Prisma 7, CRUD rewrite.

### Option B — Security hotfix then Red Team

Stage 1–3 for **new REQ-0025** (do not reuse REQ-0024):

- Remove or admin-gate `GET /api/debug/auth-info` so authenticated non-admins never receive `allUsersInDb` (RISK-0005).
- Delete or production-gate `app/api/test/redis/route.ts` (RISK-0006). `app/test-sentry/page.tsx` currently fetches that route — update or gate that caller.
- Tests: non-admin must not receive a user directory; redis test route 404/401 in production.
- Then independent Red Team on REQ-0025 + prior CRs, then Gate 2.

**Traceability:** Add REQ-0025 + BL-0013 + ART-0011 + TC-0026 **after this option is approved**. Halt if those IDs are missing.

**Files (sketch only):** `app/api/[...path]/route.ts` (~524–559), `app/api/test/redis/route.ts`, `app/test-sentry/page.tsx`, new `lib/__tests__/` case.

### Option C — Ops only (BL-0010)

Human archives Sentry N+1 case 1 on production release ≥ `0f30f8e`. Agent records evidence path in BACKLOG/VALIDATION. No code.

### Option D — New product feature

Re-enter Stage 1. User must state the feature. Then Requirement Architect writes REQ-0025+ (or REQ-0026+ if B already claimed 0025), Logic Gatekeeper, Gate 1, then synthesis.

**Do not start Option D without an explicit product request.**

---

## Global constraints (all options)

- Cite parent REQ-XXXX; halt if missing.
- No implementation in `app/`, `src/`, `lib/` until INT-0002 is approved.
- Build Agent does not verify own work.
- All new business endpoints stay in the catch-all except NextAuth / signup / QStash.
- Mutations keep `notifyCrud()` + insights cache bust.
- `SafeImage` for remote images.
- No Next 16 / Prisma 7 without a new gated REQ.
- Do not restore credential-bearing docs.

---

## Time allocation (quality-gates)

| Option | Complexity | Minimum |
| ------ | ---------- | ------- |
| A | Verify / process | 60–90 min |
| B | Simple security + tests | 60–120 min |
| C | Human ops | External |
| D | Unknown | Halt until scoped |

---

## Halt

Waiting for Human-Decision (INT-0002).

Approve by appending `APPROVALS.md` with:

- Decision: Option A, B, C, or D (plus feature text if D)
- Approver full name + role
- `resume_token=av-c1-hd-20260819-r3s9`
- `INTERRUPT-ID=INT-0002`
