# Requirements Register — Cycle C1

<!-- Revision: C1 | Status tags: approved [C1] | modified [Cn] | new [Cn] | deprecated [Cn] -->

## Platform — Core

### REQ-0001: Recipe Search [approved C1]
**Priority:** CRITICAL  
**Description:** Users can search recipes via Spoonacular with filters (cuisine, diet, type, ingredients).  
**Verification:** GET `/api/recipes/search` returns paginated results; UI shows RecipeCard grid.  
**Done:** Search + autocomplete + advanced filters functional on `/`.

### REQ-0002: Recipe Detail [approved C1]
**Priority:** CRITICAL  
**Description:** Full recipe page at `/recipe/[id]` with instructions, nutrition, taste, wine pairing.  
**Verification:** Spoonacular information endpoint proxied; tabs render without hydration mismatch.  
**Done:** RecipePage loads for valid IDs.

### REQ-0003: Authentication [approved C1]
**Priority:** CRITICAL  
**Description:** NextAuth v5 only — Google OAuth + Credentials (email/password). No Auth0.  
**Verification:** Login/logout; session JWT; `requireAuth()` on protected API routes; signup via `/api/auth/signup-nextauth`.  
**Done:** AuthContext + auth.ts; Auth0 removed (REQ-0022).

### REQ-0004: Favourites [approved C1]
**Priority:** HIGH  
**Description:** Authenticated users save/remove favourite recipes.  
**Verification:** CRUD via `/api/recipes/favourite`; React Query invalidation + realtime sync.  
**Done:** Favourites tab shows user favourites only.

### REQ-0005: Collections [approved C1]
**Priority:** HIGH  
**Description:** User-created recipe collections with ordering.  
**Verification:** `/api/collections` CRUD; CollectionManager UI.  
**Done:** Collections tab functional when authenticated.

### REQ-0006: Meal Planning [approved C1]
**Priority:** HIGH  
**Description:** Weekly meal planner (breakfast, lunch, dinner, snack).  
**Verification:** `/api/meal-plan` CRUD; MealPlanner component.  
**Done:** Meal Plan tab functional when authenticated.

### REQ-0007: Shopping List [approved C1]
**Priority:** HIGH  
**Description:** Generate shopping lists from selected recipes.  
**Verification:** `/api/shopping-list` CRUD; ShoppingListGenerator.  
**Done:** Shopping tab functional when authenticated.

### REQ-0008: Unified API Handler [approved C1]
**Priority:** CRITICAL  
**Description:** Single serverless function at `app/api/[...path]/route.ts` for Vercel Hobby limits.  
**Verification:** All documented routes resolve through path[] matching.  
**Done:** No duplicate route files for business logic.

### REQ-0009: Two-Tier Caching [approved C1]
**Priority:** MEDIUM  
**Description:** Upstash Redis (server) + TanStack Query (client) with manual + realtime invalidation.  
**Verification:** `withCache()` TTLs; `queryInvalidation` + `invalidateByAppEvent()` on mutations.  
**Done:** Cache layers + SSE cross-tab sync (REQ-0021).

### REQ-0010: AI Features [modified C1]
**Priority:** MEDIUM  
**Was:** Paid/legacy model IDs (`claude-3.5-sonnet`, `gpt-4o-mini`, `gemini-1.5-flash`, `llama-3.1-70b-versatile`) duplicated in the catch-all route; Hugging Face key unused.  
**Now:** Shared OpenAI-compatible fallback client (`lib/ai/`) with free-tier-only chains: Groq (`gpt-oss` / `qwen3.6`) → Gemini Flash/Flash-Lite → OpenRouter `:free` → Hugging Face router.  
**CR:** CR-0002  
**Description:** AI search, recommendations, analysis, modifications, and weather query generation use one provider fallback chain. OpenRouter IDs must be `:free` (or `openrouter/free`). Groq must not use Llama IDs. Gemini uses the OpenAI-compat endpoint. Hugging Face is a real last-rung fetch, not a key-presence check.  
**Verification:** `/api/ai/*` and weather-AI paths call `completeChat()`; TC-0024 pass; graceful degradation when keys missing.  
**Done:** Shipped 2026-08-13 — `lib/ai/` Groq → Gemini → OpenRouter `:free` → Hugging Face.

## Platform — User Content

### REQ-0011: Recipe Notes [approved C1]
**Priority:** MEDIUM  
**Description:** Per-recipe user notes and ratings (auth).  
**Verification:** `/api/recipes/notes` CRUD.  
**Done:** RecipeNotes component on recipe detail.

### REQ-0012: Recipe Images [approved C1]
**Priority:** MEDIUM  
**Description:** User-uploaded images via Cloudinary; gallery by type.  
**Verification:** Upload → POST images; GET returns DB types mapped to UI types (`main`→`final`, `other`→`custom`).  
**Done:** RecipeImageGallery displays uploaded images.

### REQ-0013: Recipe Videos [approved C1]
**Priority:** LOW  
**Description:** User-added recipe videos (YouTube etc.).  
**Verification:** `/api/recipes/videos` CRUD; RecipeVideoPlayer.  
**Done:** Videos tab on recipe detail when authenticated.

## Platform — Ops & Content

### REQ-0014: Blog (Contentful) [approved C1]
**Priority:** MEDIUM  
**Description:** CMS-powered blog at `/blog` and `/blog/[slug]`.  
**Verification:** `/api/cms/blog` when CMS env vars set.  
**Done:** Blog pages render or empty state when CMS unavailable.

### REQ-0015: Business Insights [approved C1]
**Priority:** MEDIUM  
**Description:** Platform analytics dashboard (auth).  
**Verification:** GET `/api/business-insights` returns stats; N+1 fixed (REQ-0020).  
**Done:** `/business-insights` SSR + cached aggregation.

### REQ-0016: API Status & Docs [approved C1]
**Priority:** LOW  
**Description:** `/api-status` health dashboard; `/api-docs` reference.  
**Verification:** GET `/api/status`; static docs pages; SSR prefetch on api-status.  
**Done:** Both routes accessible.

## Non-Functional — Production Guardrails

### REQ-0017: Vercel Production Guardrails [approved C1]
**Priority:** HIGH  
**Description:** Security headers, static asset immutable cache, robots.ts, no conflicting robots.txt.  
**Verification:** `next.config.js` headers(); `vercel.json` headers; `app/robots.ts` exists.  
**Done:** Implemented 2026-03-25. Manual: Vercel Bot Protection + AI Bots (dashboard).

### REQ-0018: SafeImage Fallback [approved C1]
**Priority:** HIGH  
**Description:** Remote images use SafeImage (`next/image` first, native `<img>` on error).  
**Verification:** `src/components/ui/safe-image.tsx`; remote Image usages migrated.  
**Done:** Implemented 2026-03-25.

### REQ-0019: Logout UX [approved C1]
**Priority:** MEDIUM  
**Description:** On logout from auth-only tabs, redirect to search tab without full page reload.  
**Verification:** Navbar `handleLogout` calls `setSelectedTab("search")` after `logout()`.  
**Done:** Implemented in Navbar.tsx.

## Issues — C1 Shipped Wave

### REQ-0020: Fix Business Insights N+1 Query [approved C1]
**Priority:** MEDIUM  
**Source:** SENTRY_ERRORS.md — case 1  
**Description:** `/api/business-insights` triggers repeated Prisma `User.count` queries (N+1 pattern).  
**Verification:** Single aggregated query or batched counts; Sentry N+1 alert cleared post-deploy; TC-0020 pass.  
**Done:** Shipped `0f30f8e` — `lib/business-insights.ts`, Redis 60s cache, probe mode, SSR hydration.

### REQ-0021: Global Realtime SSE + Cross-Tab Cache Sync [approved C1]
**Priority:** HIGH  
**Source:** Realtime Consistency plan  
**Description:** Server publishes CRUD events via Redis; clients subscribe on `GET /api/events/stream`; React Query invalidated cross-tab via `RealtimeProvider` + `invalidateByAppEvent()`.  
**Verification:** Mutations call `notifyCrud()`; SSE reconnect; Vitest TC-0021 pass.  
**Done:** Shipped `174dd3a` — `lib/realtime/`, `RealtimeProvider`, 22 mutation sites.

### REQ-0022: NextAuth-Only Auth Consolidation [approved C1]
**Priority:** HIGH  
**Source:** Realtime Consistency plan  
**Description:** Remove Auth0 routes/packages; consolidate signup via `lib/user-registration.ts`; session via NextAuth only.  
**Verification:** No `@auth0/*` deps; legacy Auth0 routes removed; Google OAuth + credentials work.  
**Done:** Shipped `174dd3a`; comment cleanup `2a6cf02`.

### REQ-0023: Vitest Unit Test Baseline [approved C1]
**Priority:** MEDIUM  
**Source:** Realtime Consistency plan  
**Description:** Automated unit tests for critical server libs (business-insights, realtime publish).  
**Verification:** `npm run test` passes; TC-0020 + TC-0021 automated.  
**Done:** Shipped `174dd3a` — `lib/__tests__/`.

### REQ-0024: Tooling Hygiene (ESLint 9, Sentry 10.x, browserslist) [approved C1]
**Priority:** LOW  
**CR:** CR-0003  
**Source:** GATE-0002 (Vercel deprecation noise; stay on Next 15.5.9)  
**Description:** Refresh `caniuse-lite`; migrate ESLint 8 → 9 with flat config; bump `@sentry/nextjs` within v10 only. Do not upgrade Next, React, or Prisma.  
**Verification:** `npm run test && npm run lint && npm run build` pass; `eslint-config-next@15.5.9`; Sentry stays on 10.x (not 11).  
**Done:** Shipped 2026-08-13 — ESLint 9 flat config, `@sentry/nextjs@10.70.0`, caniuse-lite refresh.

---

## Traceability Index

| REQ | Primary Artifacts | Tests |
|-----|-------------------|-------|
| REQ-0001 | ART-0001 | TC-0001 |
| REQ-0003 | ART-0002, ART-0007 | TC-0002 |
| REQ-0009 | ART-0006 | TC-0021 |
| REQ-0010 | ART-0009 | TC-0024 |
| REQ-0017 | ART-0003 | TC-0017 |
| REQ-0018 | ART-0004 | TC-0018 |
| REQ-0019 | — | TC-0019 |
| REQ-0020 | ART-0005 | TC-0020 |
| REQ-0021 | ART-0006 | TC-0021 |
| REQ-0022 | ART-0007 | TC-0002 |
| REQ-0023 | ART-0008 | TC-0020, TC-0021 |
| REQ-0024 | ART-0010 | TC-0025 |
