# Security Policy

## Supported versions

This repository’s `main` branch (live: [https://recipe-smart.vercel.app/](https://recipe-smart.vercel.app/)) is the supported surface for security reports.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems (auth bypass, data leaks, injection, secret exposure, or similar).

Email a private report to **[contact@arnobmahmud.com](mailto:contact@arnobmahmud.com)** with:

- A short description of the issue and impact
- Steps to reproduce (or a proof of concept)
- Affected URL, route, or file if you know it
- Whether the finding is on production or a local clone

You should receive an acknowledgement. Please give a reasonable window before any public disclosure so a fix can ship.

## Scope notes

- User passwords are hashed with **bcrypt** (`bcryptjs`). Do not send plaintext passwords in reports except as needed to reproduce.
- Recipe search uses the **Spoonacular** API; do not include third-party API keys in reports.
- `/api/debug/auth-info` and `/api/test/redis` are known deferred risks (not production-facing features). Reports that expand on those are welcome privately.
