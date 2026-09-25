<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Ayiin project notes

- Stack: Next.js 16 App Router + React 19 + Tailwind v4 (`src/app/globals.css` holds all design tokens) + Zustand (`src/lib/store.ts`).
- Mode (`personal` | `business`) and currency live in cookies; read them server-side with `getPrefs()` and client-side with `usePrefs()`.
- Persisted client state uses `skipHydration`; gate store-derived UI with `useHydrated()` to avoid hydration mismatches.
- Anything rendered on both server and client must be deterministic (dates via `src/lib/format.ts` in UTC, SVG trig rounded).
- Checks: `npm run lint`, `npm run typecheck`, `npm run build`.
