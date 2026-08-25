# Repeater

Repeater is a browser-based dance practice studio. Create dance styles, collect and order the moves you are learning, then start a practice loop that calls moves aloud at a cadence you choose.

This version is a frontend-only React application. Styles, moves, ordering, theme, and the global delay are stored locally in the current browser; there is no account, API, or cloud synchronization yet.

## Features

- Multiple dance styles with rename and delete controls
- Expandable move editors for names, reference URLs, and notes
- Pointer, touch, and keyboard-accessible drag-and-drop ordering
- Random spoken prompts with no immediate repeats when alternatives exist
- Light, dark, and system themes
- Responsive desktop and mobile workspaces
- Versioned, runtime-validated local storage

## Local development

Requirements:

- Node.js 20.19 or newer
- pnpm 10
- A modern browser with the Web Speech API for spoken practice

Install dependencies and start Vite:

```bash
pnpm install
pnpm dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Quality checks

```bash
pnpm test
pnpm test:coverage
pnpm lint
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

The production bundle is written to `dist/`.

## Deploying to Vercel

The repository includes `vercel.json` with the Vite framework preset, `pnpm build`, and the `dist` output directory. The legacy AWS state service is excluded from Vercel uploads.

Create a preview deployment from the repository root:

```bash
pnpm dlx vercel
```

Deploy to production:

```bash
pnpm dlx vercel --prod
```

No environment variables are required for this frontend-only release.

## Local data

Canonical app data is stored under `repeater:app-data:v1`. The visual theme is stored separately under `repeater:theme`. The old `repeater-state` key is intentionally ignored and left unchanged.

Local storage is origin-specific. Data saved on localhost, a Vercel preview URL, and a production domain does not automatically transfer between those origins.

## Legacy backend

`service-state/` contains the retained historical AWS state service. It is not imported, built, deployed, or called by the current frontend.
