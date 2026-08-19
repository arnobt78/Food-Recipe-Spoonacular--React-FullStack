# Checkpoints (Durable HITL)

| INTERRUPT-ID | Cycle | Gate | Status | resume_token | due_at | Scope | Notes |
|--------------|-------|------|--------|--------------|--------|-------|-------|
| INT-0001 | C1 | Human Gate 1 | CLOSED | av-c1-hg1-20260813-a7f3 | 2026-08-20T10:40:00Z | Next-scope: AI-only (REQ-0010 / CR-0002) | Closed 2026-08-13 — user approved Cursor plan "AI free-tier fallback". Security hotfix and CRUD rewrite deferred. |
| INT-0002 | C1 | Human-Decision | CLOSED | av-c1-hd-20260819-r3s9 | 2026-08-26T20:46:00Z | Next C1 slice after empty product request | Closed 2026-08-19 — user approved Cursor plan REQ-0025 (Vercel defaults + Node 24), not security hotfix. RISK-0005/0006 remain deferred as future REQ-0026. |
