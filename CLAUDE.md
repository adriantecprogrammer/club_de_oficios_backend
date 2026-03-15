# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Club de Oficios backend — a service marketplace API connecting clients with service providers (oficios/trades). Built as a Cloudflare Worker.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Turso (libSQL/SQLite) via Drizzle ORM
- **Language**: TypeScript (ESNext, Bundler module resolution)
- **Build/Deploy**: Wrangler

## Commands

- `npm run dev` — Start local dev server (wrangler dev)
- `npm run deploy` — Deploy to Cloudflare (wrangler deploy --minify)
- `npm run cf-typegen` — Generate CloudflareBindings types from wrangler config
- `npx drizzle-kit push` — Push schema changes to Turso database
- `npx drizzle-kit generate` — Generate SQL migration files from schema changes

Note: Drizzle Kit commands require `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars (loaded from `.env` via `dotenv`).

## Architecture

```
src/
  index.ts          — Hono app entrypoint, route registration
  db/
    schema.ts       — Drizzle ORM schema (all tables, relations, foreign keys)
    client.ts       — Turso/libSQL client factory, exports Database type
drizzle/
  migrations/       — SQL migration files for Turso
drizzle.config.ts   — Drizzle Kit config (dialect: turso)
wrangler.jsonc      — Cloudflare Worker config
```

### Database client pattern

`src/db/client.ts` exports `createDb(url, authToken?)` — a factory that creates a per-request Drizzle instance with the full schema. Use it in route handlers with Cloudflare env bindings:

```ts
const db = createDb(c.env.TURSO_DATABASE_URL, c.env.TURSO_AUTH_TOKEN);
```

The exported `Database` type (`ReturnType<typeof createDb>`) should be used for typing.

## Database

SQLite-based (Turso). Schema defined in `src/db/schema.ts` using Drizzle's `sqliteTable`. Key entities: users, provider_profiles, categories, provider_categories (junction), service_requests, reviews, conversations, messages, payments, achievements.

- IDs are text (UUIDs)
- Timestamps stored as text
- Booleans stored as integer (0/1)
- Floats use `real` type (ratings, prices, coordinates)
- Environment variables needed: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`

## Conventions

- Hono app uses `Hono<{ Bindings: CloudflareBindings }>` for typed env bindings
- Database connection is created per-request using env vars from Cloudflare bindings
- No linting or formatting tools configured — no test framework set up
