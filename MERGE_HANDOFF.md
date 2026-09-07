# Frontend merge handoff — `main` → `staging` (bob.tsx needs you)

This branch is the **staging ← main** reconciliation, **22 of 23 conflicts already resolved**.
Only **`app/routes/bob.tsx`** is left — it's committed here **with conflict markers intact** so you get
the exact 3-way conflict. Resolve it, build, verify on studojo.pro, then promote.

## Why bob.tsx needs a human
`bob.tsx` has **50 conflict hunks, 38 of them true clashes** — main's **tiered-enrichment**
(tiers, `pendingEnrich`, provider-picker, enrich-per-tier, 3 credit counters, candidate-as-people,
shareable links) and staging's **mission-control** (coach card, `useRunEstimate` timer, brutalist
`bob-canvas`, `humanizeEvent`/friendly copy, faked funnel counters) edited the **same regions**
(imports, `enrichRow`, the composer, the results panel, `EmptyChat`, `humanizeEvent`).

**Goal: keep BOTH feature sets.** Neither side is a superset. A build passing is necessary but NOT
sufficient — the Sensei page must be visually verified on studojo.pro before it reaches prod.

## How the other 22 were resolved (for your review)
- **auth-schema.ts** — kept staging's `extensionDrafts` table (main added nothing there).
- **Main-owned B2B/feature pages** (took main): FlashCard, webinar.server, api.webinar-register,
  campus-ambassador, msl, webinar, sensei (B2B landing), linkedin.* (index/connect/dashboard/
  leads/leads.discovery/onboarding.profile/onboarding.upload/pricing).
- **playbook.tsx** — took main (superset: staging's 2 playbooks + main's 2 more = 4).
- **outreach.connect.debrief** — kept staging.
- **api.admin.scrape-internships** — kept staging's (main deleted it; kept to not break staging).
- **outreach.campaign.style-pick** — kept main's (staging deleted it; kept to preserve the feature).
- **bob-client.ts, api.mcp.tsx** — took main's **tiered-enrichment** MCP model (supersedes staging's
  older single-tier). ⚠️ If a staging caller needs a symbol only staging's version had, the build
  will flag it — re-add as needed.

## To finish (staging-first, never straight to prod)
1. `git checkout merge/main-into-staging-bobtsx`
2. Resolve `app/routes/bob.tsx` — integrate BOTH features (see above).
3. `npm run build` (must exit 0).
4. Merge this branch into **staging**, push → verify on **studojo.pro** (Sensei: mission-control
   AND tiered-enrichment both work; also spot-check /playbook, /linkedin, /webinar, /sensei).
5. Only after studojo.pro is confirmed good: merge **staging → main** → verify **studojo.com**.

## Backend note (already done)
All bob-svc fixes are **already live on prod** (per-company cap, jd_fetch chunk/429-retry,
score concurrency, NFKC/Weekday aggregator fix). This frontend merge is the only remaining piece.
