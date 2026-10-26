# Do not merge staging into main

**Do not merge staging into main (owner, 27 Oct 2026).** staging (studojo.pro) now intentionally diverges: B2C-only homepage. Promote to studojo.com only by cherry-picking specific commits when the owner asks.

## What this means

- `staging` deploys to studojo.pro and now carries a homepage built only around Studojo's job agent (studojo.pro/b2cnew). The older products are off its homepage, navigation and footer on purpose.
- `main` deploys to studojo.com and keeps the current site. A merge of staging into main would ship the staging homepage and every other staging-only change to production.

## How to ship one change to studojo.com

1. Only when the owner asks for that change on studojo.com.
2. `git checkout main && git pull`, then `git cherry-pick <sha>` for the specific commits.
3. Diff the result against `origin/main` and check that nothing else came along.
4. Push to main; `deploy.yml` deploys studojo.com.

Never merge or fast-forward main to staging, and never open a staging to main pull request.
