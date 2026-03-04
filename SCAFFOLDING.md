# Scaffolding

> This file is filled in by the President agent during a collaborative session.
> Run `Conductor: president` to begin.

## Status
- [x] Scaffolding decisions complete
- [ ] Ready for Coach to create Linear tasks

---

<!-- President fills everything below this line -->

## Folder Structure

```
src/
  app/                        # Next.js App Router — routes and API handlers only (thin shells)
    (auth)/                   # route group: login, signup pages
    learn/
      [topicSlug]/
        [subsectionSlug]/     # walkthrough + quiz page
    dashboard/                # parent progress page
    api/
      alerts/
        send/                 # POST /api/alerts/send
      whatsapp/
        webhook/              # POST /api/whatsapp/webhook
  features/
    learn/                    # walkthrough viewer + quiz engine components, hooks, types
    dashboard/                # dashboard components, hooks, types
    auth/                     # signup/login forms, auth helpers
    alerts/                   # WhatsApp alert logic, coaching guide loader
  lib/
    db/                       # Supabase client, query helpers
    types/                    # shared TypeScript types
    utils/                    # shared utility functions
public/
  images/                     # walkthrough illustration assets
docs/                         # PRD, ARCHITECTURE, BUILD_PLAN, DECISIONS, RESEARCH
agentic-workflow/             # Conductor agent configs
supabase/
  migrations/                 # DB schema migrations
  seed/                       # JSON seed files for content
```

## File Naming Conventions

| File type | Convention | Example |
|-----------|-----------|---------|
| React components | `PascalCase.tsx` | `QuizCard.tsx`, `WalkthroughStep.tsx` |
| Custom hooks | `camelCase.ts` (prefixed `use`) | `useQuizEngine.ts`, `useWalkthrough.ts` |
| Utilities / helpers | `kebab-case.ts` | `quiz-state-machine.ts` |
| Type files | `kebab-case.ts` or `types.ts` | `types.ts`, `quiz-types.ts` |
| Next.js special files | as required by Next.js | `page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts` |
| Config files | as required by tool | `tailwind.config.ts`, `next.config.ts` |
| Folders | `kebab-case` | `features/learn/`, `lib/db/` |

## Entry Points

```
src/app/layout.tsx       # root layout — server component, wraps every page, renders <Providers>
src/app/page.tsx         # home — redirects to /learn or /dashboard based on auth state
src/app/globals.css      # global styles
src/app/providers.tsx    # client component — holds Supabase auth session provider
src/middleware.ts        # edge middleware — checks auth on every request, redirects unauthenticated users away from /learn and /dashboard
```

Dev: `next dev`
Prod: `next build && next start`
Deploy: Vercel (auto-deploys from main branch)

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (`dev`, `build`, `start`, `lint`, `test`) |
| `tsconfig.json` | TypeScript — strict mode on, path alias `@/*` → `./src/*` |
| `next.config.ts` | Next.js — image domains (Supabase storage), env var exposure |
| `tailwind.config.ts` | Tailwind — content paths, theme extensions (brand colors) |
| `postcss.config.js` | PostCSS — required by Tailwind |
| `components.json` | shadcn/ui — component registry config (style: "default", baseColor: "slate") |
| `.env.local` | Secret keys — never committed |
| `.env.example` | Template with all required key names, no values — committed to git |
| `.gitignore` | Ignores `node_modules`, `.env.local`, `.next`, `supabase/.branches` |
| `eslint.config.mjs` | ESLint — Next.js defaults + TypeScript rules |

## Patterns & Conventions

Each feature folder is organized by type:
```
features/learn/
  components/    # React components (QuizCard.tsx, WalkthroughStep.tsx)
  hooks/         # custom hooks (useQuizEngine.ts, useWalkthrough.ts)
  types.ts       # TypeScript types for this feature
  utils.ts       # pure helper functions for this feature

features/dashboard/
  components/
  hooks/
  types.ts

features/auth/
  components/
  hooks/
  types.ts

features/alerts/
  components/
  hooks/
  types.ts
  utils.ts
```

`lib/` holds only cross-feature shared code (DB client, shared types, shared utils). If something is used by only one feature, it stays in that feature folder.

## Dependencies

**Runtime**

| Package | Version | Why |
|---------|---------|-----|
| `next` | 14 | Framework |
| `react` | 18 | UI |
| `react-dom` | 18 | UI |
| `@supabase/supabase-js` | latest | DB + Auth client |
| `@supabase/ssr` | latest | Supabase + Next.js App Router integration |
| `tailwindcss` | latest | Styling |

**Dev**

| Package | Version | Why |
|---------|---------|-----|
| `typescript` | 5 | Language |
| `@types/react` | 18 | Types |
| `@types/node` | 20 | Types |
| `postcss` | latest | Required by Tailwind |
| `autoprefixer` | latest | Required by Tailwind |
| `eslint` | latest | Linting |
| `eslint-config-next` | 14 | Next.js lint rules |

**shadcn/ui components** (added via CLI `npx shadcn@latest add`, not npm packages):
`button`, `input`, `card`, `badge`, `alert`

Forms use native HTML + Next.js server actions. No react-hook-form or zod.

## Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | `eyJ...` | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — server only, never expose to browser | `eyJ...` | Required |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID for sending messages | `123456789` | Required |
| `META_WHATSAPP_ACCESS_TOKEN` | Meta permanent access token | `EAAx...` | Required |
| `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Self-chosen string to verify Meta webhook | `learnbridge_verify_xyz` | Required |
| `META_WHATSAPP_STUCK_ALERT_TEMPLATE_NAME` | Approved template name for stuck alerts | `learnbridge_stuck_alert` | Required |
| `META_WHATSAPP_VERIFY_TEMPLATE_NAME` | Approved template name for WA number verification | `learnbridge_verify_number` | Required |
| `NEXT_PUBLIC_APP_URL` | Full public URL of the app | `https://learnbridge.vercel.app` | Required |

`NEXT_PUBLIC_` vars are safe to expose to the browser. All others are server-only and must never be committed.

## Testing

**Framework:** Vitest + `@testing-library/react`

**File location:** Top-level `tests/` directory, mirroring `src/` structure

```
tests/
  features/
    learn/
      useQuizEngine.test.ts
      quiz-state-machine.test.ts
    auth/
    alerts/
  lib/
```

**Naming:** `[filename].test.ts` or `[filename].test.tsx`

**Run:** `vitest` (dev watch), `vitest run` (CI)

**Priority:** Quiz state machine gets full unit test coverage for all 6 progression paths before Player marks that task done.

## Scaffolding Decisions Log
<!-- Each decision: what was chosen, why, trade-off accepted -->

| # | Decision | Why | Trade-off |
|---|----------|-----|-----------|
| 1 | Feature-first folder structure under `src/` — `features/learn`, `features/dashboard`, `features/auth`, `features/alerts` | 4 distinct domains; keeps each domain's components, hooks, and types co-located; parallel agents won't collide | Slightly more directories than Next.js default; features folder is a non-standard addition |
| 2 | Entry points: `layout.tsx` + `page.tsx` + `globals.css` + `providers.tsx` + `middleware.ts` | Auth gating via middleware is non-negotiable; providers.tsx keeps layout.tsx a server component | Slightly more files at root than bare minimum |
| 3 | Tailwind CSS + shadcn/ui for styling | Solo founder building fast; shadcn provides ready-made accessible components (forms, buttons, modals); Tailwind is Next.js standard | Tailwind class names in JSX can get verbose; shadcn components need to be initialized via CLI |
| 4 | By-type organization within each feature — `components/`, `hooks/`, `types.ts`, `utils.ts` | Predictable; always know where to find a component vs hook vs type; `features/learn` will grow large due to quiz engine | Slightly more folders than flat; no barrel exports |
| 5 | File naming: PascalCase components, camelCase hooks, kebab-case everything else | Matches Next.js defaults and React community conventions; components visually distinct from utilities | Slight mixing of conventions but each rule is unambiguous |
| 6 | No form library — native HTML forms + Next.js server actions | Simpler stack; fewer dependencies; sufficient for signup/login forms | Manual validation logic; less ergonomic for complex multi-step forms |
| 7 | Environment variables: 3 Supabase + 5 Meta WhatsApp + 1 app URL | Complete set for all external services used in MVP | All Meta vars depend on WhatsApp template approval before app works end-to-end |
| 8 | Tests in top-level `tests/` directory mirroring src structure, Vitest framework | All tests in one place, easy to run and scan; Vitest is fast and native TypeScript | Slightly more navigation to find test file vs colocated; must keep structure in sync manually |
