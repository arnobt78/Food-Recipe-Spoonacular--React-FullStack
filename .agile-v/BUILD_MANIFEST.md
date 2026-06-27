# Build Manifest — Cycle C1

<!-- ART-XXXX.N | parent REQ | status | path -->

| ART-ID | Cycle | REQ | Status | Artifact | Path |
|--------|-------|-----|--------|----------|------|
| ART-0001 | C1 | REQ-0001 | baseline | Recipe search UI + API | `src/components/search/`, `app/api/[...path]/route.ts` |
| ART-0002 | C1 | REQ-0003 | baseline | Auth stack | `auth.ts`, `src/context/AuthContext.tsx` |
| ART-0003 | C1 | REQ-0017 | shipped | Production guardrails | `next.config.js`, `vercel.json`, `app/robots.ts`, `app/layout.tsx` |
| ART-0004 | C1 | REQ-0018 | shipped | SafeImage component | `src/components/ui/safe-image.tsx` |
| ART-0005 | C1 | REQ-0020 | shipped | Business insights performance fix | `lib/business-insights.ts`, `lib/redis-cache.ts`, `app/business-insights/page.tsx` |
| ART-0006 | C1 | REQ-0021 | shipped | Realtime SSE + invalidation | `lib/realtime/`, `src/components/providers/RealtimeProvider.tsx`, `src/hooks/useRealtimeSync.ts`, `src/utils/queryInvalidation.ts` |
| ART-0007 | C1 | REQ-0022 | shipped | NextAuth-only auth | `lib/user-registration.ts`, `lib/api-utils-nextjs.ts`, removed Auth0 routes/packages |
| ART-0008 | C1 | REQ-0023 | shipped | Vitest baseline | `lib/__tests__/`, `vitest.config.ts`, `npm run test` |

## Pending Builds (Stage 3)

_None — C1 shipped wave complete. New work requires new REQ or change request._
