# Test Specification — Cycle C1

<!-- TC-XXXX [Cn] | parent REQ | type | status -->

| TC-ID | Cycle | REQ | Type | Description | Status |
|-------|-------|-----|------|-------------|--------|
| TC-0001 | C1 | REQ-0001 | manual | Search returns results for known term | baseline |
| TC-0002 | C1 | REQ-0003 | manual | Login/logout session flow (NextAuth) | baseline |
| TC-0017 | C1 | REQ-0017 | manual | Response headers include X-Content-Type-Options | pass |
| TC-0018 | C1 | REQ-0018 | manual | Remote image renders; fallback on optimizer failure | pass |
| TC-0019 | C1 | REQ-0019 | manual | Logout from favourites tab → search tab, no reload | pass |
| TC-0020 | C1 | REQ-0020 | automated | business-insights: ≤1 User count query per uncached request | pass (vitest) |
| TC-0021 | C1 | REQ-0021 | automated | realtime publish: event payload shape + Redis channel | pass (vitest) |
| TC-0024 | C1 | REQ-0010 | automated | AI fallback: skip unconfigured; 429 skips provider; OpenRouter `:free`; no Groq Llama; Gemini OpenAI-compat host; HF invoked last; 402 billing; first success short-circuits | pass (vitest) |

## Regression Baseline

Vitest covers TC-0020 + TC-0021. No automated E2E suite. Manual TC-0001/0002 + Sentry for regression.

## Test Designer Notes

Post-deploy: verify Sentry performance trace for business-insights shows single count query pattern (BL-0010).
