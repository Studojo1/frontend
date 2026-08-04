# Promoting the Sensei frontend to production

## The environment reality (read this first)

| Branch | Deploys to | Product surface |
|---|---|---|
| `main` | **production** — app.studojo.com + dashboard.studojo.com | via `.github/workflows/deploy.yml` (push to `main`) |
| `staging` | **test** — app.studojo.pro + dashboard.studojo.pro | via `.github/workflows/deploy-staging.yml` (push to `staging`) |

Both app.* and dashboard.* are served from the **same build**, split by Host header in `app/routes/_index.tsx`.

**`main` and `staging` are permanently diverged** (100+ commits each way) because other products live on `staging`. So:
- **NEVER** `git merge staging` into `main`. It is not possible/safe and will drag unrelated products into prod.
- Prod is promoted by **cherry-picking the specific files a feature touched** from `staging` onto `main`.

## The landmine this process prevents

A hand cherry-pick of **one** file (typically `app/routes/bob.tsx`) **silently drops any other file the feature touched** — a new component, shared CSS, a lib helper. The feature then ships **half-live** in prod and nothing warns you. (The Sensei streaming overlay only reached prod cleanly because it happened to be fully self-contained in `bob.tsx`. The next multi-file feature will not be that lucky.)

## How to promote (do this every time)

1. **Know your feature's full file set.** From your staging PR, list every file the feature changed (not just `bob.tsx`).
2. **Run the helper** with those paths — it reports the complete set of files that differ between `staging` and `main`, so nothing is missed:
   ```bash
   scripts/promote-sensei.sh app/routes/bob.tsx app/components/sensei/ app/styles/sensei.css
   ```
3. **Build the promotion** (stages a branch off `main` with the staging version of every listed file, as one commit):
   ```bash
   scripts/promote-sensei.sh --apply app/routes/bob.tsx app/components/sensei/ ...
   git push -u origin HEAD
   ```
4. **Open a PR to `main`**, review the diff, merge. `deploy.yml` builds and rolls out to studojo.com.

## Don't forget the backend half

If the feature needs a `bob-svc` change too (a new API field, endpoint, or logic), **promote that separately**: `bob-svc` uses a clean `staging -> main` merge (open a PR from `staging` to `main` on Studojo1/bob-svc). A frontend feature that reads a new backend field will silently render nothing in prod until the backend half also lands. Promote both together.

## Verify it landed

After deploy, confirm the prod pod is running the new commit:
```bash
kubectl get deploy frontend -n studojo -o jsonpath='{.spec.template.spec.containers[0].image}'
```
The image tag is the `main` commit SHA. It should match `git rev-parse origin/main`.
