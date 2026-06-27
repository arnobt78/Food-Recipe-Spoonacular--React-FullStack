# Product Backlog — Cycle C1

## BL-0001: Recipe search & discovery
**Type:** Feature · **Priority:** CRITICAL · **REQ:** REQ-0001, REQ-0002  
**Status:** Done (baseline)

## BL-0002: Auth-protected user features
**Type:** Feature · **Priority:** HIGH · **REQ:** REQ-0004, REQ-0005, REQ-0006, REQ-0007  
**Status:** Done (baseline)

## BL-0003: Vercel production guardrails
**Type:** Enhancement · **Priority:** HIGH · **REQ:** REQ-0017  
**Story:** As operator, I want bot/crawl protection and security headers so Vercel free tier is not burned.  
**Acceptance:** Headers in next.config + vercel.json; robots.ts; dashboard Bot Protection enabled.  
**Status:** Done (code) — dashboard manual pending

## BL-0004: SafeImage remote fallback
**Type:** Enhancement · **Priority:** HIGH · **REQ:** REQ-0018  
**Status:** Done

## BL-0005: Logout redirect to home tab
**Type:** Bug · **Priority:** MEDIUM · **REQ:** REQ-0019  
**Status:** Done

## BL-0006: Fix business-insights N+1
**Type:** Bug · **Priority:** MEDIUM · **REQ:** REQ-0020  
**Story:** As operator, I want business-insights to use minimal DB queries so Sentry N+1 alerts stop.  
**Acceptance:** TC-0020 pass; Sentry issue resolved post-deploy.  
**Effort:** S · **Status:** Done (`0f30f8e`)

## BL-0007: Global realtime SSE sync
**Type:** Enhancement · **Priority:** HIGH · **REQ:** REQ-0021  
**Story:** As user, I want cross-tab data consistency without manual refresh after mutations.  
**Acceptance:** TC-0021 pass; SSE stream active; `notifyCrud()` on mutations.  
**Effort:** M · **Status:** Done (`174dd3a`)

## BL-0008: Auth0 removal / NextAuth consolidation
**Type:** Refactor · **Priority:** HIGH · **REQ:** REQ-0022  
**Story:** As maintainer, I want a single auth path (NextAuth) to reduce complexity and dead code.  
**Acceptance:** No Auth0 deps; signup/login via NextAuth paths only.  
**Effort:** M · **Status:** Done (`174dd3a`, `2a6cf02`)

## BL-0009: Vitest unit test baseline
**Type:** Enhancement · **Priority:** MEDIUM · **REQ:** REQ-0023  
**Story:** As developer, I want automated tests for critical server libs before C2 E2E work.  
**Acceptance:** `npm run test` green; TC-0020 + TC-0021.  
**Effort:** S · **Status:** Done (`174dd3a`)

## BL-0010: Post-deploy Sentry verification
**Type:** Ops · **Priority:** MEDIUM · **REQ:** REQ-0020  
**Story:** As operator, I confirm N+1 Sentry case 1 cleared on production after fix deploy.  
**Acceptance:** Sentry issue archived/resolved on release ≥ `0f30f8e`.  
**Effort:** XS · **Status:** Backlog (post-deploy)
