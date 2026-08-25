# Repeater

Repeater is a browser-based dance practice studio. Dance styles, ordered moves, the active style, and the global practice delay are stored in Neon Postgres through authenticated Vercel Functions.

## Features

- Multiple dance styles with rename and delete controls
- Expandable move editors for names, reference URLs, and notes
- Pointer, touch, and keyboard-accessible drag-and-drop ordering
- Random spoken prompts with no immediate repeats when alternatives exist
- Shared-secret access for every backend request
- Optimistic saves with focused loading, error, retry, and rollback states
- One-time import from the former browser-local data format
- Light, dark, and system themes

## Environment

Requirements:

- Node.js 20.19 or newer
- pnpm 10
- A Neon Postgres database
- A modern browser with the Web Speech API for spoken practice

Copy `.env.example` to `.env.local` and set:

```ini
# Pooled connection used by Vercel Functions
DATABASE_URL=postgresql://...

# Direct connection used by Drizzle migrations
DATABASE_URL_UNPOOLED=postgresql://...

# Shared word or phrase entered in the frontend access dialog
REPEATER_SECRET_WORD=...
```

Never use committed or previously exposed credentials. Configure the same variables in Vercel for preview and production deployments.

## Local development

Install dependencies and apply the committed database migrations:

```bash
pnpm install
pnpm db:migrate
```

Start the Vite frontend and local Vercel Functions together:

```bash
pnpm dev
```

`pnpm dev:vite` starts only the frontend and is useful for UI work with a separately hosted API.

## Database changes

The Drizzle schema lives in `server/db/schema.ts`. After changing it, generate and inspect a version-controlled migration before applying it:

```bash
pnpm db:generate
pnpm db:migrate
```

Runtime requests use the pooled Neon URL; migrations prefer the unpooled URL.

## Quality checks

```bash
pnpm test
pnpm test:coverage
pnpm lint
pnpm build
```

## Deploying to Vercel

The repository includes a Vite deployment configuration and root `api/` Vercel Functions. Add `DATABASE_URL` and `REPEATER_SECRET_WORD` to the Vercel project before deploying. `DATABASE_URL_UNPOOLED` is only needed in an environment that applies migrations.

```bash
pnpm vercel
pnpm vercel --prod
```

Apply migrations as an explicit release step; application startup does not run schema migrations automatically.

## Browser storage

Canonical dance data is no longer stored in the browser. The browser retains only:

- `repeater:secret-word:v1` for the shared backend secret
- `repeater:theme` for the visual theme

If the backend is empty and valid `repeater:app-data:v1` data exists, Repeater offers to import it atomically. The old key is removed only after a successful import. Choosing **Start fresh** leaves it untouched.

## Legacy backend

`service-state/` contains the historical AWS/S3 state service. It remains excluded from the active frontend, Vercel build, and deployment.
