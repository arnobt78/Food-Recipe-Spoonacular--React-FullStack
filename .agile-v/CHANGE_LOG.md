# Change Log (Append-Only)

| CR-ID | Cycle | Affected REQ | Change | Rationale | Impact | Requested By | Approved |
|-------|-------|--------------|--------|-----------|--------|--------------|----------|
| CR-0001 | C1 | REQ-0022 | Remove Auth0; NextAuth-only auth | Reduce dual auth paths; align with NextAuth v5 production stack | Low — routes removed, signup consolidated | build-agent-js | approved (shipped) |
| CR-0002 | C1 | REQ-0010 | Replace duplicated paid/dead AI model IDs with shared free-tier OpenAI-compatible fallback (`lib/ai/`) | Groq Llama IDs shutdown; OpenRouter Claude/GPT-4o-mini are paid; Gemini 1.5/pro retired; HF key unused | ART-0009 + TC-0024; six catch-all AI sites | Human (plan approval 2026-08-13) | approved |
| CR-0003 | C1 | REQ-0024 | ESLint 9 flat config + Sentry 10.x bump + browserslist refresh; stay on Next 15.5.9 | Vercel deprecation/stale caniuse noise; no Next 16 / Prisma 7 | ART-0010 + TC-0025 | Human (plan approval 2026-08-13) | approved |
