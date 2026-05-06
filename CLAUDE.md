# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm ci                  # install deps
npm run dev             # development (localhost:5173)
npm run build           # production build (react-router build)
npm run lint            # eslint
```

### Docker
```bash
docker build -t frontend .    # multi-stage build
```

## Deployment Rules

**All deployments go through GitHub Actions. Never use manual docker builds or kubectl.**

| Branch | Namespace | Domain | Workflow |
|--------|-----------|--------|----------|
| `main` | `studojo` (production) | studojo.com | `deploy.yml` |
| `staging` | `staging` | studojo.pro | `deploy-staging.yml` |

- Images tagged with `github.sha` — no `:latest` or custom tags
- Registry: Azure Container Registry (`acrstudojo-dhfsdrfhf6a6bbg2.azurecr.io`)
- Cluster: Azure Kubernetes Service (`studojo-aks` in `rg-studojo`)

## Architecture

### Framework
React Router v7 (SSR mode). Routes defined in `app/routes.ts`. No `'use client'` directives — this is NOT Next.js.

### Auth
BetterAuth with `authClient.useSession()` for session state. JWT tokens for control-plane API calls via `getToken()` in `app/lib/control-plane.ts`. Session cookies are httpOnly and managed by the `/api/auth/*` endpoints.

### API Calls
Use `fetchWithRetry()` from `app/lib/fetch-with-retry.ts` with Bearer tokens from `getToken()`. Control plane base URL from `getControlPlaneUrl()`. Never use Axios in this repo.

### Key Libraries
- `app/lib/auth-client.ts` — BetterAuth client setup
- `app/lib/control-plane.ts` — `getToken()`, `getControlPlaneUrl()`, API helpers
- `app/lib/fetch-with-retry.ts` — Retry-aware fetch wrapper
- `app/lib/db.ts` — Database connection (server-side only)

### Components
- `app/components/common/header.tsx` — Auth-aware header (uses `authClient.useSession()`) — USE THIS for all pages
- `app/components/header.tsx` — Static header with NO auth awareness — avoid using this
- `app/components/common/footer.tsx` — Site footer

### Sub-apps
- `/outreach/*` — Job outreach tool (13 routes). Backend: `job-outreach-svc` (FastAPI). State: Zustand (`app/lib/outreach/store.ts`).
- `/dojos/*` — Learning dojos
- `/resumes/*` — Resume builder
- Other: blog, auth, onboarding, settings, internships, humanizer

## Key Patterns

- Routes: **file-based auto-discovery** via `@react-router/fs-routes`. Create a file in `app/routes/` and it is automatically registered — no need to edit `routes.ts`.
  - Naming: dots become path segments (`api.autoapply.config.tsx` → `/api/autoapply/config`)
  - Params: `$id` → `:id`, trailing `$` → `*` splat
  - Index route: `_index.tsx` → `/`
  - Break parent nesting: trailing `_` on segment (`autoapply_.lkot.tsx` → `/autoapply/lkot`, standalone)
  - Three routes stay explicit in `routes.ts` (can't express dots in path segments): `.well-known/*`, `sitemap.xml`, `robots.txt`
- Server-only code: use `.server.ts` suffix
- Fonts: Satoshi (`font-satoshi`) and Clash Display (`font-clash`) via CSS
- Design tokens: `text-studojo-ink`, `text-studojo-muted`, `text-studojo-purple`, `bg-studojo-surface`, `shadow-brutal`, etc.
- Links to other pages: use react-router `Link` for internal, `<a href>` for cross-app navigation

# PROJECT ENFORCEMENT RULES (CRITICAL)

## SOURCE OF TRUTH

- GitHub is the ONLY source of truth
- No local-only changes allowed
- All deployments MUST go through GitHub Actions

### Working on this repo

When working on the main Studojo platform (studojo.com), ALWAYS:
- Clone from GitHub (`Studojo1/frontend`) to a temp directory
- Read files from the clone, NOT from any local path
- Make changes in the clone, commit, and push to GitHub
- NEVER reference local files unless the user explicitly says "here is a reference file on my PC"

---

## FORBIDDEN ACTIONS

Claude MUST NEVER:

- Run docker build locally for deployment
- Run kubectl set image manually
- Modify running pods directly
- Bypass GitHub Actions

If such an action is required:
→ STOP and ask for confirmation

---

## API RULES

- Only use relative paths:
  /api/v1
  /api/auth

- Never use:
  https://api.studojo.com

---

## DEBUGGING RULES

Before fixing anything:

1. Identify root cause
2. Check environment (staging vs prod)
3. Inspect:
   - Network tab
   - Console logs

Never apply blind fixes.

---

## CHANGE POLICY

Every change must follow:

1. Minimal scope
2. Commit to correct branch
3. Push to GitHub
4. Let CI/CD deploy
5. Verify before next change

---

## REPORT WRITING RULES

When writing or editing any `reports.*.tsx` file:

### No em dashes
**Never use em dashes (`—`) anywhere in report copy.** This includes headings, prose, chart labels, card labels, callout text, meta tags, and comments.

Replacements by context:
- Card labels and chart labels: use a colon — `"Skill gap: India 2026"` not `"Skill gap — India 2026"`
- Mid-sentence elaboration: use a comma — `"table stakes, expected of every candidate"` not `"table stakes — expected of every candidate"`
- Two independent thoughts: split into two sentences — `"It is growing fast. It is startup-driven."` not `"It is growing fast — and it is startup-driven."`
- Introducing a list or explanation: use a colon — `"The roles: D2C, SaaS, logistics"` not `"The roles — D2C, SaaS, logistics"`
- Twitter/OG meta titles: use a pipe `|` to separate brand — `"Title | Studojo 2026"` not `"Title — Studojo 2026"`
- Code comments: use a colon — `// Chart 1: Stipend` not `// Chart 1 — Stipend`

### Data sourcing
Every finding must cite a real or plausible source in the `rpt-source` line at the bottom of each finding. Do not invent precise statistics without a source. Use ranges and qualifiers ("approximately", "analysis of 900+ JDs") when data is estimated from aggregated sources rather than a single authoritative survey.

### Structure
- 8 findings per report, each with: `rpt-finding-header`, at least one `rpt-card` or `rpt-stat-row`, one `rpt-callout`, and a `rpt-source` line
- At least 2 inline CTAs per report (mid-report and final)
- Hero stats: 3 numbers, terse labels