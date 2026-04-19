# CareerOS

Job application tracker with AI-powered CV/JD matching. Built as a portfolio project to demonstrate end-to-end product work with AI integrated as a real utility, not decoration.

**Demo account:** `demo@careeros.app` / `demo123456` (seeded with realistic data)

## What it does

- Track applications across a pipeline (Salvata → Candidata → Screening → Colloquio → Offerta / Rifiutata)
- Upload a PDF CV; AI extracts skills, experience, and education
- Paste a job description; AI scores the match, highlights overlapping and missing skills, suggests an action
- Dashboard with KPI cards, per-status funnel, recent applications, follow-up reminders
- Search + status filter with debounced URL state

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Suspense streaming)
- **TypeScript** strict, **Zod** for all boundary validation
- **Prisma 7** + **PostgreSQL** (Supabase-hosted)
- **Supabase** auth + Storage (with RLS policies) + Postgres trigger for `auth.users → public.User` sync
- **Mistral AI** (`mistral-small-latest`) via `@mistralai/mistralai` for CV parsing and JD match scoring
- **Tailwind v4** + **shadcn/ui** + **base-ui** + **next-themes** (dark mode)
- **React Hook Form** + **Sonner** (toasts)
- **Vitest** + **@testing-library/react** (unit tests on pure logic)

## Architecture highlights

- **All mutations are Server Actions.** No bespoke API routes for client-side mutations.
- **Streaming dashboard**: each widget (KPI, funnel, recent list) has its own `<Suspense>` boundary with a dedicated data function — the header renders while queries run.
- **Slim Prisma selects**: list queries fetch only fields the table renders (no `notes` / `resume` overfetch).
- **AI response parsing** is centralized in [src/lib/ai.ts](src/lib/ai.ts): strips markdown fences, slices the JSON object, validates with Zod.
- **Rate limiting** on AI endpoints via in-memory sliding window with opportunistic prune ([src/lib/rate-limit.ts](src/lib/rate-limit.ts)). Swap the `Map` for Redis/Upstash to scale horizontally.
- **Structured logger** ([src/lib/logger.ts](src/lib/logger.ts)) — JSON in prod, pretty in dev.
- **Transactional writes**: `createApplication` wraps `JobPosting` + `Application` in `prisma.$transaction` to prevent orphan postings.
- **Ownership checks** centralized in `requireOwnedApplication` — every mutation goes through it.

## Running locally

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Fill DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, MISTRAL_API_KEY

# 3. Setup DB (Prisma migrations + Postgres trigger + Storage RLS policies)
npx prisma migrate deploy
npm run setup:db

# 4. Seed demo account + sample data
npm run seed

# 5. Dev
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (run once) |
| `npm run test:watch` | Vitest watch mode |
| `npm run seed` | Seed demo account + applications |
| `npm run setup:db` | Install Postgres trigger + Supabase Storage RLS policies |

## Project structure

```
src/
├── app/
│   ├── (auth)/              # login, signup (Supabase)
│   ├── (dashboard)/         # protected routes
│   │   ├── applications/    # list, detail, new + Server Actions
│   │   ├── dashboard/       # streaming KPI/funnel/recent
│   │   └── profile/         # CV upload + Server Action
│   └── api/auth/callback    # OAuth callback
├── components/
│   ├── features/            # domain components
│   ├── layout/              # sidebar, topbar, theme toggle
│   └── ui/                  # shadcn primitives
├── lib/
│   ├── ai.ts                # centralized JSON parsing
│   ├── auth.ts              # requireUser helper (cached per request)
│   ├── data.ts              # all Prisma queries (cached per request)
│   ├── logger.ts            # structured logging
│   ├── rate-limit.ts        # sliding window
│   ├── status.ts            # STATUS_* + scoreTone helpers
│   └── validators.ts        # Zod schemas
└── types/index.ts           # Prisma-derived list/detail types
```

## What I'd do next

Things deliberately scoped out for this portfolio cut:

- **E2E tests** with Playwright for the golden path (signup → upload CV → create application → see match score)
- **Server Action integration tests** against a real test DB (currently only pure-logic units)
- **Observability**: swap `logger.ts` for a real destination (Axiom/Logtail) + OpenTelemetry spans on the Server Actions
- **Abort signal** on the Mistral client so request timeouts actually cancel the in-flight HTTP call
- **Accessibility pass**: focus trap in dialogs, contrast check on score colors, keyboard-only navigation audit
- **Background queue** (Supabase Edge Functions + pg-boss) for CV parsing — currently inline in the upload Server Action, which is fine at low volume but blocks the response

## License

MIT
