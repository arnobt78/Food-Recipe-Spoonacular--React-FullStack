# Recipe Guide, Discovery & Management Platform - Next.js, PostgreSQL, Redis, Spoonacular API, Contentful CMS FullStack Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Spoonacular API](https://img.shields.io/badge/Spoonacular-API-22C55E)](https://spoonacular.com/food-api)
[![launch with diploi badge](https://diploi.com/launch.svg)](https://diploi.com/launch/arnobt78/Recipe-Guide-Discovery-Management-Platform--NextJS-Spoonacular-FullStack)

A modern full-stack recipe discovery and management platform built with **Next.js 15**, **React 18**, **TypeScript**, **PostgreSQL**, and the **Spoonacular API**. Search, save, and manage recipes with favourites, collections, meal planning, shopping lists, AI-powered analysis, blog (Contentful), and business insights. Built for learning and production use.

- **Live Demo:** [https://recipe-smart.vercel.app/](https://recipe-smart.vercel.app/)
- **Security reports:** see [SECURITY.md](./SECURITY.md) (email [contact@arnobmahmud.com](mailto:contact@arnobmahmud.com))
- **Author:** [Arnob Mahmud](https://www.arnobmahmud.com) 

![Screenshot 2026-02-11 at 14 50 16](https://github.com/user-attachments/assets/e2390505-5975-4ad4-aa49-f648be3c9a10)
![Screenshot 2026-02-11 at 14 57 08](https://github.com/user-attachments/assets/f155310b-3aa2-47dd-af8f-b1c98f43464b)
![Screenshot 2026-02-11 at 14 57 27](https://github.com/user-attachments/assets/6fd88549-d168-48a0-b83f-5eee6f94a047)
![Screenshot 2026-02-11 at 14 57 37](https://github.com/user-attachments/assets/05513fe3-69ea-4a9d-bfe7-3ba7eba12c7b)
![Screenshot 2026-02-11 at 14 57 47](https://github.com/user-attachments/assets/3ab472a5-8edf-436a-b2ef-5e7c1e5cf847)
![Screenshot 2026-02-11 at 14 58 05](https://github.com/user-attachments/assets/878c9f8e-9196-4bbc-9e49-f7ad1397380f)
![Screenshot 2026-02-11 at 14 58 27](https://github.com/user-attachments/assets/dd30238d-33c2-4968-993a-c77fb5b148a9)
![Screenshot 2026-02-11 at 14 58 39](https://github.com/user-attachments/assets/deac471b-604b-44f1-94fb-b6548dbe9061)
![Screenshot 2026-02-11 at 14 58 53](https://github.com/user-attachments/assets/338f380b-e9a7-4f98-9f54-681de3fe6a52)
![Screenshot 2026-02-11 at 14 59 33](https://github.com/user-attachments/assets/b0b19e3c-999d-4bde-b372-cba47c4b4eff)
![Screenshot 2026-02-11 at 14 59 48](https://github.com/user-attachments/assets/0f38896d-125f-458c-98b9-11a2844ef273)
![Screenshot 2026-02-11 at 15 00 03](https://github.com/user-attachments/assets/3a55e0b8-2337-4be8-92d1-a6133c0b778c)
![Screenshot 2026-02-11 at 15 00 17](https://github.com/user-attachments/assets/fc5e9949-1118-4397-ba77-88dae8a8426c)
![Screenshot 2026-02-11 at 15 00 27](https://github.com/user-attachments/assets/20db1518-cf8f-4027-be0d-9a32cbafbd0e)
![Screenshot 2026-02-11 at 15 00 48](https://github.com/user-attachments/assets/fde0c97c-baf2-41c8-b512-fd16f863e25f)
![Screenshot 2026-02-11 at 15 01 01](https://github.com/user-attachments/assets/c7fb16e2-500e-4671-9988-2176b31d8365)
![Screenshot 2026-02-11 at 15 01 24](https://github.com/user-attachments/assets/d720ba77-91f3-485c-a724-5eedbaa8156c)
![Screenshot 2026-02-11 at 15 01 34](https://github.com/user-attachments/assets/5386bbe2-c5c9-401c-8815-0b89e0430cf9)
![Screenshot 2026-02-11 at 15 01 43](https://github.com/user-attachments/assets/a4d96f36-483d-42a0-8b5a-63a316402f8d)
![Screenshot 2026-02-11 at 15 01 58](https://github.com/user-attachments/assets/512ef1c8-edea-4b4e-850d-7055e09d6436)
![Screenshot 2026-02-11 at 15 02 11](https://github.com/user-attachments/assets/748f2e2b-cef2-46d5-a1b8-ee2a9eb946ed)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How the app works](#how-the-app-works)
- [Technology stack](#technology-stack)
- [Keywords (beginner glossary)](#keywords-beginner-glossary)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [How to run](#how-to-run)
- [Project walkthrough](#project-walkthrough)
- [API endpoints](#api-endpoints)
- [Pages and routes](#pages-and-routes)
- [Authentication](#authentication)
- [Caching and realtime updates](#caching-and-realtime-updates)
- [AI fallback client](#ai-fallback-client)
- [Database schema](#database-schema)
- [Components and reusability](#components-and-reusability)
- [Hooks and data fetching](#hooks-and-data-fetching)
- [Libraries and dependencies](#libraries-and-dependencies)
- [Testing and quality](#testing-and-quality)
- [Reusing this project](#reusing-this-project)
- [Keywords](#keywords)
- [Conclusion](#conclusion)
- [License](#license)
- [Security](#security)

---

## Overview

**Recipe Guide** is an educational and production-ready full-stack app. You can use the [live demo](https://recipe-smart.vercel.app/) with no setup. To run it on your machine you copy `.env.example` to `.env.local` and fill in at least the **core** variables below.

What you will learn by reading and running this repo:

- **Next.js 15 App Router** — server pages in `app/`, interactive UI in `src/`
- **NextAuth v5** — Google OAuth + email/password (Credentials). Passwords are hashed with bcrypt. There is no Auth0.
- **Prisma + PostgreSQL** — users, favourites, collections, meal plans, shopping lists, notes, images, videos
- **Spoonacular Food API** — search, detail, autocomplete, similar recipes, wine pairing
- **One catch-all API** — almost every REST path lives in `app/api/[...path]/route.ts` so Vercel Hobby stays within function limits
- **TanStack Query** — client cache; mutations call `notifyCrud()` so lists update without a full page refresh (including other tabs)
- **Optional extras** — Redis, Contentful blog, Cloudinary uploads, Groq/Gemini/OpenRouter/Hugging Face AI, OpenWeather, Resend/Brevo email, Sentry, PostHog, QStash

The home route (`/`) is a **tabbed SPA-style shell**: Recipe Search, Favourites, Collections, Meal Plan, Shopping List. Recipe detail is `/recipe/[id]`. Auth-only tabs appear after login. Logout returns to the search tab without a full reload.

---

## Features

| Feature | What a beginner should know |
| ------- | --------------------------- |
| **Recipe search** | Calls Spoonacular through `/api/recipes/search`. Filters: cuisine, diet, type, ingredients. Optional extra `API_KEY_2`… keys rotate when the free daily quota hits 402. |
| **Recipe details** | `/recipe/[id]` loads instructions, nutrition, taste, wine pairing, similar recipes. |
| **Favourites** | Saved in PostgreSQL per user. Heart on a card writes `/api/recipes/favourite`. |
| **Collections** | Named lists of recipes with order and color. |
| **Meal planning** | Week grid: breakfast, lunch, dinner, snack. |
| **Shopping list** | Built from selected recipes; items stored as JSON on `ShoppingList`. |
| **Notes and ratings** | One note per user per recipe. |
| **Images / videos** | User uploads (Cloudinary) and YouTube-style URLs. Remote photos use `SafeImage` (Next Image, then native `<img>` on error). |
| **AI** | Search, recommendations, analysis, modifications, weather queries. Shared client `lib/ai/` tries Groq → Gemini Flash → OpenRouter `:free` → Hugging Face. Missing keys skip that provider. |
| **Blog** | Contentful via `/api/cms/blog`. Empty state if CMS env is unset. |
| **Business insights** | Auth dashboard; aggregated SQL + Redis 60s cache (`lib/business-insights.ts`). |
| **API status / docs** | `/api-status` and `/api-docs` for learners. |
| **Filter presets** | Save search filters (auth). |
| **Email share** | Resend or Brevo if configured. |
| **Realtime** | After CRUD, server publishes an event; SSE `/api/events/stream` invalidates React Query in all open tabs. |

---

## How the app works

```text
Browser (React 18 + TanStack Query)
    │  GET/POST /api/...
    ▼
app/api/[...path]/route.ts     ← one serverless function, path[] routing
    │
    ├── Spoonacular (lib/recipe-api.ts)     public recipe data
    ├── Prisma / PostgreSQL                 user data
    ├── lib/ai/completeChat()               optional LLM
    ├── Redis (optional)                    cache + SSE seq
    └── notifyCrud(domain)
            → Redis event
            → SSE to RealtimeProvider
            → invalidateByAppEvent()
            → UI refetch (no full page reload)
```

**Mental model:** Spoonacular owns the *recipes*. Your database owns *the user’s relationship* to those recipes (favourite, collection, meal slot). The catch-all route is a traffic cop: it reads `path` from the URL (`/api/collections/abc` → `["collections", "abc"]`) and runs the matching handler.

---

## Technology stack

| Layer | What we use | Why it is here |
| ----- | ----------- | -------------- |
| Framework | Next.js **15.5.9** (App Router) | SSR pages, API routes, deploy on Vercel |
| UI | React **18.3**, Tailwind **3.4**, daisyUI, Radix/shadcn, Framer Motion, Lucide | Accessible components + motion |
| Language | TypeScript **5.7** | Types in `src/types.ts` and Prisma |
| Database | PostgreSQL (Neon or any host) + Prisma **6** | User CRUD; Prisma 7 is not used |
| Auth | NextAuth v5 (`auth.ts`) | JWT session; Google + Credentials |
| Recipes | Spoonacular | Search and detail JSON |
| Client cache | TanStack Query v5 | `staleTime: Infinity` until invalidation |
| Server cache | Upstash Redis (optional) | Search/recipe/insights TTLs + SSE |
| AI | Groq, Gemini, OpenRouter `:free`, Hugging Face | See `lib/ai/providers.ts` |
| Lint / test | ESLint **9** (`eslint.config.mjs`), Vitest | `npm run lint` / `npm run test` |
| Hosting | Vercel | `next build` on each push to `main` |

This is **not a Vite SPA**. The test runner is **Vitest**. The app runtime is **Next.js**.

---

## Keywords (beginner glossary)

| Keyword | Short meaning in this repo |
| ------- | -------------------------- |
| **App Router** | Next.js folders under `app/` are URLs. `app/page.tsx` is `/`. |
| **Server Component** | Default in `app/`. Can fetch on the server. No `useState`. |
| **Client Component** | File starts with `"use client"`. Needed for clicks, hooks, dialogs. |
| **Catch-all route** | `app/api/[...path]/route.ts` handles `/api/anything/here`. |
| **Prisma** | ORM: TypeScript talks to PostgreSQL using `schema.prisma`. |
| **NextAuth / Auth.js** | Login library. Session cookie + JWT. |
| **TanStack Query** | Caches API results in the browser; `invalidateQueries` after mutations. |
| **SSE** | Server-Sent Events: a one-way stream so other tabs learn about CRUD. |
| **Zod** | Schema validation on some forms (`@hookform/resolvers` + react-hook-form). |
| **bcrypt** | One-way password hash. We never store raw passwords. |
| **DSN** | Sentry project URL (`NEXT_PUBLIC_SENTRY_DSN`). |
| **staleTime** | How long Query treats data as fresh. Infinity = until we invalidate. |

---

## Project structure

```text
recipe-spoonacular/
├── app/                            # Next.js App Router (URLs)
│   ├── page.tsx                    # Home: search + tabs
│   ├── layout.tsx                  # Root layout + providers
│   ├── recipe/[id]/page.tsx        # Recipe detail (SSR)
│   ├── blog/  blog/[slug]/         # Contentful blog
│   ├── business-insights/          # Auth analytics
│   ├── api-docs/  api-status/      # Learner dashboards
│   ├── test-sentry/                # Sentry smoke page
│   └── api/
│       ├── [...path]/route.ts      # Almost all REST + SSE
│       ├── auth/[...nextauth]/     # NextAuth handlers
│       ├── auth/signup-nextauth/   # Email/password signup
│       ├── jobs/scheduled/         # QStash cron
│       └── test/redis/             # Redis probe (not for production)
├── src/
│   ├── components/                 # Feature UI (see folders below)
│   ├── components/pages/           # Client page shells
│   ├── components/providers/       # Query, realtime, PostHog
│   ├── components/ui/              # shadcn primitives + SafeImage
│   ├── context/                    # AuthContext, RecipeContext
│   ├── hooks/                      # React Query hooks
│   ├── utils/                      # queryInvalidation, cacheStorage, …
│   ├── api.ts                      # Browser fetch helpers
│   └── types.ts                    # Shared TS types
├── lib/                            # Server-only (no React)
│   ├── ai/                         # Free-tier LLM fallback (REQ-0010)
│   ├── prisma.ts  redis.ts         # Clients
│   ├── recipe-api.ts               # Spoonacular
│   ├── business-insights.ts        # Aggregated stats
│   ├── realtime/                   # SSE publish / stream
│   └── user-registration.ts        # Signup + cache bust
├── prisma/schema.prisma
├── auth.ts                         # NextAuth config
├── eslint.config.mjs               # ESLint 9
├── .env.example                    # Copy to .env.local
└── SECURITY.md
```

**Rule of thumb:** UI in `src/`. Database, Redis, Spoonacular, AI in `lib/`. New business APIs go in the catch-all, not a new `app/api/foo/route.ts` (NextAuth is the exception).

---

## Getting started

### Prerequisites

- **Node.js** 18 or later
- **npm**
- A **PostgreSQL** database (free: [Neon](https://neon.tech/))
- A **Spoonacular API key** (free: [spoonacular.com/food-api](https://spoonacular.com/food-api))

You do **not** need Redis, AI keys, Cloudinary, or Contentful to search recipes and sign up. Those features stay off or show empty/fallback UI until you add keys.

### Quick start

```bash
git clone https://github.com/arnobt78/Recipe-Guide-Discovery-Management-Platform--NextJS-Spoonacular-FullStack.git
cd Recipe-Guide-Discovery-Management-Platform--NextJS-Spoonacular-FullStack

npm install
cp .env.example .env.local
# Edit .env.local — at least DATABASE_URL, API_KEY, AUTH_SECRET, AUTH_URL

npm run prisma:generate
npm run prisma:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`postinstall` already runs `prisma generate` after `npm install`. `prisma:push` creates tables from `schema.prisma` (this project uses push, not a migration history, for local/dev).

---

## Environment variables

There **is** a template: **[`.env.example`](./.env.example)**. Copy it:

```bash
cp .env.example .env.local
```

Next.js loads `.env.local` automatically. **Never commit** `.env.local` or real secrets.

### Do I need a `.env` file?

| Situation | What you need |
| --------- | ------------- |
| Only using the live demo | Nothing. No env on your laptop. |
| Local search + login + favourites | **Required** four: `DATABASE_URL`, `API_KEY`, `AUTH_SECRET`, `AUTH_URL` |
| Google login | Plus `GOOGLE_ID` and `GOOGLE_SECRET` |
| Blog, AI, Redis, uploads, email, weather, analytics | Optional keys below; app degrades if they are empty |

### Required (core local run)

```env
API_KEY=your_spoonacular_api_key
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
AUTH_SECRET=paste_output_of_openssl_rand_base64_32
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Leave `NEXT_PUBLIC_API_URL` empty so the browser calls same-origin `/api/...` (recommended).

### Optional rotation and aliases

```env
API_KEY_2=
API_KEY_3=
# GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET also work
GOOGLE_ID=
GOOGLE_SECRET=
```

### Optional AI (any one key is enough)

Fallback order is **Groq → Gemini → OpenRouter `:free` → Hugging Face**. Model IDs live in `lib/ai/providers.ts`, not in each route.

```env
GROQ_LLAMA_API_KEY=
GOOGLE_GEMINI_API_KEY=
OPENROUTER_API_KEY=
HUGGING_FACE_INFERENCE_API_KEY=
```

Aliases: `GROQ_API_KEY`, `HF_TOKEN`. OpenRouter IDs must stay `:free` (or `openrouter/free`).

### Other optional services

```env
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
CMS_SPACE_ID=
CMS_DELIVERY_TOKEN=
CMS_ENVIRONMENT=master
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENWEATHER_API_KEY=
RESEND_TOKEN=
BREVO_API_KEY=
EMAIL_SENDER_ADDRESS=you@example.com
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
QSTASH_TOKEN=
```

### How to get each key

| Variable | Where to create it |
| -------- | ------------------ |
| `API_KEY` | [Spoonacular](https://spoonacular.com/food-api) → dashboard → API key |
| `DATABASE_URL` | [Neon](https://neon.tech/) → connection string; add `?sslmode=require` |
| `AUTH_SECRET` | Terminal: `openssl rand -base64 32` |
| `GOOGLE_ID` / `GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com/) → Credentials → OAuth 2.0 Web client. Redirect: `http://localhost:3000/api/auth/callback/google` (production: `https://your-domain/api/auth/callback/google`) |
| `UPSTASH_REDIS_*` | [Upstash](https://upstash.com/) → Redis → URL + token |
| `CMS_*` | [Contentful](https://www.contentful.com/) → Space → API keys (CDA) |
| `CLOUDINARY_*` | [Cloudinary](https://cloudinary.com/) dashboard |
| `GROQ_LLAMA_API_KEY` | [Groq Console](https://console.groq.com/) |
| `GOOGLE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) |
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/) keys |
| `HUGGING_FACE_INFERENCE_API_KEY` | [Hugging Face](https://huggingface.co/settings/tokens) |
| `OPENWEATHER_API_KEY` | [OpenWeather](https://openweathermap.org/api) |
| `RESEND_TOKEN` / `BREVO_API_KEY` | [Resend](https://resend.com/) or [Brevo](https://www.brevo.com/) |
| `NEXT_PUBLIC_SENTRY_DSN` | [Sentry](https://sentry.io/) → project DSN |
| `NEXT_PUBLIC_POSTHOG_*` | [PostHog](https://posthog.com/) project API key |

On **Vercel**: Project → Settings → Environment Variables. Use the **same names** as `.env.example` (including `GROQ_LLAMA_API_KEY`).

---

## How to run

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server with Turbopack → http://localhost:3000 |
| `npm run dev:webpack` | Dev server with Webpack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint 9 via `next lint` |
| `npm run test` | Vitest (`lib/__tests__/`) |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Sync schema to the database |
| `npm run prisma:studio` | Visual DB browser |

---

## Project walkthrough

### 1. Home (`/`)

`app/page.tsx` renders a client shell (`HomePage` / `AppContent`). The hero search bar (`SearchInput`) hits autocomplete + search. Tabs: Search (default), Favourites, Collections, Meal Plan, Shopping List. Tab query `?tab=favourites` is optional; search stays a clean `/`.

### 2. Recipe detail (`/recipe/[id]`)

Server page loads Spoonacular information, then `RecipePage` (client) shows tabs (details, nutrition, taste), similar recipes, AI analysis if keys exist, and auth actions (favourite, collection, meal plan, notes, images, videos, email share).

### 3. Blog (`/blog`, `/blog/[slug]`)

`/api/cms/blog` reads Contentful. Without `CMS_*` you still get the page, usually empty.

### 4. Business insights (`/business-insights`)

Requires login. `lib/business-insights.ts` runs consolidated counts (not N+1 loops). Redis key `business:insights` TTL 60s. `?probe=1` is a cheap health check.

### 5. API status and docs (`/api-status`, `/api-docs`)

Status polls `/api/status`. Docs list catch-all paths for humans.

### 6. After you click “save”

Example: favourite a recipe.

1. Hook `useIsFavourite` → `POST /api/recipes/favourite`
2. Route checks `requireAuth()`, writes Prisma, then `notifyCrud("favourites")`
3. Redis sequence bumps; SSE clients refetch favourites + insights
4. Heart state updates immediately; back-navigation still shows fresh Query cache

---

## API endpoints

Almost everything is **`app/api/[...path]/route.ts`**. Example: `/api/recipes/search` → `path = ["recipes", "search"]`.

Protected routes call `requireAuth()` in `lib/api-utils-nextjs.ts`. The browser uses `src/api.ts` (`getApiUrl`, session cookies).

### Recipes

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/api/recipes/search` | Query: `searchTerm`, `page`, filters |
| GET | `/api/recipes/autocomplete` | Typeahead |
| GET | `/api/recipes/[id]/information` | Full recipe |
| GET | `/api/recipes/[id]/summary` | HTML summary |
| GET | `/api/recipes/[id]/similar` | Similar recipes |
| GET/POST/DELETE | `/api/recipes/favourite` | Auth |
| GET/POST/DELETE | `/api/recipes/images` | Auth; query `recipeId` |
| GET/POST/PUT/DELETE | `/api/recipes/notes` | Auth |
| GET/POST/DELETE | `/api/recipes/videos` | Auth |

### AI

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/api/ai/search` | Natural-language search |
| POST | `/api/ai/recommendations` | Suggestions |
| POST | `/api/ai/analysis` | Nutrition / allergens style analysis |
| POST | `/api/ai/modifications` | Dietary conversion, simplify |

All of these call `completeChat()` in `lib/ai/`. If no AI keys are set, the route should fail gracefully rather than crash the rest of the app.

### Collections, meal plan, shopping, filters

| Method | Path |
| ------ | ---- |
| GET/POST | `/api/collections` |
| GET/PUT/DELETE | `/api/collections/[id]` |
| GET/POST/DELETE | `/api/collections/[id]/items` |
| GET | `/api/collections/[id]/recipes` |
| GET/POST/DELETE | `/api/meal-plan` |
| GET/POST/PUT/DELETE | `/api/shopping-list` |
| GET/POST/PUT/DELETE | `/api/filters/presets` |

### Platform

| Method | Path | Notes |
| ------ | ---- | ----- |
| GET | `/api/events/stream` | SSE realtime |
| GET | `/api/status` | Health |
| GET | `/api/cms/blog` | Contentful list |
| GET | `/api/cms/blog/[slug]` | One post |
| GET | `/api/business-insights` | Auth stats |
| GET | `/api/food/wine/dishes` | Spoonacular |
| GET | `/api/food/wine/pairing` | Spoonacular |
| POST | `/api/upload` | Cloudinary |
| GET/POST | `/api/weather/suggestions` | OpenWeather + AI query gen |
| POST | `/api/email/share` | Resend/Brevo |

### Auth (separate files, not the catch-all)

| Path | Role |
| ---- | ---- |
| `/api/auth/[...nextauth]` | NextAuth (login, callback, session, signout) |
| `/api/auth/signup-nextauth` | Create Credentials user (`lib/user-registration.ts`) |

---

## Pages and routes

| Route | Rendering | Description |
| ----- | --------- | ----------- |
| `/` | Dynamic | Search + tabs |
| `/recipe/[id]` | Dynamic | Recipe detail |
| `/blog` | Dynamic | Post list |
| `/blog/[slug]` | Dynamic | Post |
| `/business-insights` | Dynamic | Auth dashboard |
| `/api-status` | Dynamic | Endpoint health |
| `/api-docs` | Dynamic | Human API reference |
| `/test-sentry` | Static | Error-tracking check |
| `/robots.txt` | Static | From `app/robots.ts` |

---

## Authentication

Configured in **`auth.ts`** (NextAuth v5):

1. **Credentials** — email + password. Lookup in Prisma; `bcrypt.compare` against `User.password`.
2. **Google** — `GOOGLE_ID` / `GOOGLE_SECRET`. On first login, `createLocalUser` upserts the user.

Signup UI (`RegisterDialog`) posts to `/api/auth/signup-nextauth`. Login UI (`LoginDialog`) uses `signIn("credentials")` or `signIn("google")`.

`AuthContext` exposes `user`, `login`, `logout` to the Navbar and tabs. Session is a JWT; API routes read it with `auth()` / `requireAuth()`.

---

## Caching and realtime updates

Three layers:

1. **Redis** (if Upstash is set) — search ~30m, recipe ~24h, insights 60s
2. **TanStack Query** — in-memory; default `staleTime: Infinity` until invalidation
3. **sessionStorage / localStorage** — search results survive a refresh in the same browser

On successful mutation the catch-all runs:

```ts
await notifyCrud("favourites"); // domain: collections | mealPlan | …
```

That publishes Redis `app:events:seq` and busts insights. `RealtimeProvider` listens on `GET /api/events/stream` and calls `invalidateByAppEvent()` in `src/utils/queryInvalidation.ts`. Other tabs and the back button then show updated data without a manual refresh.

Without Redis, in-tab invalidation still runs from the mutation hooks; cross-tab SSE is weaker.

---

## AI fallback client

`lib/ai/` is a small OpenAI-compatible stack:

| File | Job |
| ---- | --- |
| `providers.ts` | Ordered registry + env key names |
| `client.ts` | `POST {baseUrl}/chat/completions`, 12s timeout, never throws |
| `index.ts` | `completeChat()` walks providers/models |
| `parse-json.ts` | Pull JSON out of LLM text |

Tests: `lib/__tests__/ai-fallback.test.ts` (TC-0024). More detail: [`docs/LLM_MODEL_SELECTION.md`](./docs/LLM_MODEL_SELECTION.md).

---

## Database schema

Defined in `prisma/schema.prisma`. Recipe *content* is not copied into Postgres; we store Spoonacular `recipeId` plus user metadata.

| Model | Purpose |
| ----- | ------- |
| `User` | `id`, `email`, `name`, `picture`, optional hashed `password` |
| `FavouriteRecipes` | Unique `(recipeId, userId)` |
| `RecipeCollection` / `CollectionItem` | Named lists + order |
| `RecipeNote` | Content, rating, tags |
| `MealPlan` / `MealPlanItem` | Week + meal type |
| `ShoppingList` | Name, recipe ids, items JSON |
| `RecipeImage` | Cloudinary URL + type |
| `RecipeVideo` | External URL |
| `FilterPreset` | Saved filters JSON |

User delete **cascades** to related rows.

---

## Components and reusability

Copy a folder under `src/components/` plus `src/types.ts` / `src/api.ts` if you reuse UI elsewhere. Keep Tailwind + the same `cn()` helper (`clsx` + `tailwind-merge`).

### RecipeCard

```tsx
import RecipeCard from "@/components/recipes/RecipeCard";

<RecipeCard
  recipe={recipe}
  isFavourite={false}
  onFavouriteButtonClick={(r) => toggleFavourite(r)}
/>
```

Default click navigates to `/recipe/[id]`. Pass `onClick` to override.

### SearchInput

```tsx
import SearchInput from "@/components/search/SearchInput";

<SearchInput
  value={term}
  onChange={setTerm}
  onSubmit={(e) => {
    e.preventDefault();
    runSearch(term);
  }}
  placeholder="Search recipes..."
/>
```

Autocomplete uses `useAutocompleteRecipes` (debounced).

### EmptyState

```tsx
import EmptyState from "@/components/common/EmptyState";

<EmptyState message="No recipes yet" subtitle="Try another search." />
```

### SafeImage

Use for any remote URL (Spoonacular, Cloudinary, Google avatars). Do not use raw `<img>` for those hosts — `next.config.js` `images.remotePatterns` allowlists domains.

```tsx
import { SafeImage } from "@/components/ui/safe-image";

<SafeImage src={url} alt={title} width={400} height={300} />
```

### Folder map

| Folder | Role |
| ------ | ---- |
| `components/ui/` | Button, Card, Dialog, Tabs — portable shadcn |
| `components/recipes/` | Cards, gallery, notes, share |
| `components/auth/` | Login / register dialogs |
| `components/layout/` | Navbar, Footer, tabs |
| `components/skeletons/` | Loading placeholders |
| `components/pages/` | Full client pages wired to hooks |

---

## Hooks and data fetching

Hooks live in `src/hooks/` and wrap TanStack Query + `src/api.ts`.

```tsx
import { useSearchRecipes } from "@/hooks/useRecipes";
import { useIsFavourite } from "@/hooks/useIsFavourite";
import { useCollections } from "@/hooks/useCollections";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";

const { searchRecipes, data, isLoading } = useSearchRecipes();
searchRecipes("pasta", 1, { cuisine: "Italian" });

const { isFavourite, toggleFavourite } = useIsFavourite(recipeId);
const { collections, createCollection } = useCollections();
const { addToMealPlan } = useMealPlan();
const { shoppingList } = useShoppingList();
```

Auth-gated hooks use `useAuthCheck()` so they disable when logged out. After logout, related caches are cleared.

To reuse in another Next app: copy the hook, `src/api.ts` helpers, and the matching catch-all branch (or a dedicated route with the same JSON shape).

---

## Libraries and dependencies

| Package | What it does here |
| ------- | ----------------- |
| `next` / `react` / `react-dom` | App framework and UI |
| `next-auth` | Login session |
| `@prisma/client` / `prisma` | Database |
| `@tanstack/react-query` | Client cache and mutations |
| `@upstash/redis` | Optional server cache + SSE seq |
| `bcryptjs` | Password hashing |
| `zod` + `react-hook-form` | Form validation |
| `cloudinary` | Image upload API |
| `@sentry/nextjs` | Errors (v10.x) |
| `posthog-js` | Product analytics |
| `framer-motion` | Animations |
| `lucide-react` / `react-icons` | Icons |
| `sonner` | Toasts |
| `vitest` | Unit tests |
| `eslint` 9 + `eslint-config-next` 15.5.9 | Lint |

Install the same majors if you extract a feature. Do not jump to Next 16 or Prisma 7 without a dedicated upgrade; this repo is pinned to Next 15.5.9 and Prisma 6.

---

## Testing and quality

```bash
npm run test    # Vitest — business-insights, realtime, AI fallback
npm run lint    # ESLint 9
npm run build   # next build
```

Automated cases include TC-0020 (insights query count), TC-0021 (realtime payload), TC-0024 (AI fallback), TC-0025 (tooling/lint/build). There is no full E2E suite yet.

---

## Reusing this project

| You want | Copy / follow |
| -------- | ------------- |
| Tabbed recipe search UI | `src/components/search`, `recipes`, `hooks/useRecipes.ts` |
| Auth + user tables | `auth.ts`, `lib/user-registration.ts`, Prisma `User` |
| One Vercel function for many APIs | Catch-all `path[]` pattern |
| CRUD that updates every tab | `notifyCrud` + `RealtimeProvider` + `queryInvalidation.ts` |
| Free LLM calls | `lib/ai/` as a drop-in |
| Remote images that survive optimizer 402s | `SafeImage` |

Keep env names, `requireAuth()` on writes, and never commit `.env.local`.

---

## Keywords

`recipe app`, `Next.js 15`, `App Router`, `React 18`, `TypeScript`, `Spoonacular API`, `PostgreSQL`, `Prisma`, `NextAuth v5`, `TanStack Query`, `Redis`, `SSE`, `full-stack`, `meal planning`, `shopping list`, `collections`, `favourites`, `AI fallback`, `Groq`, `Gemini`, `OpenRouter`, `Hugging Face`, `Contentful`, `Cloudinary`, `Tailwind`, `shadcn`, `Vitest`, `ESLint 9`, `Vercel`, `educational project`

---

## Conclusion

Recipe Guide is a complete Next.js 15 recipe platform you can run, fork, and teach from:

- App Router + a **single catch-all API** for Hobby-plan limits
- **Prisma + PostgreSQL** for user data; Spoonacular for recipe content
- **NextAuth v5** (Google + Credentials, bcrypt)
- **React Query + SSE** so CRUD shows up immediately without a refresh
- Optional **AI**, blog, Redis, uploads, and monitoring — off until you add keys

Use it as a learning map, a starter, or a reference for catch-all routing, cache invalidation, and free-tier LLM fallback.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

---

## Security

Private vulnerability reports: **[SECURITY.md](./SECURITY.md)** → [contact@arnobmahmud.com](mailto:contact@arnobmahmud.com). Please do not file public issues for security bugs.

---

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com/)

**Enjoy building and learning!** 🚀

Thank you! 😊
