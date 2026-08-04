#!/usr/bin/env bash
# Promote Sensei (app.studojo.com) frontend changes from `staging` -> `main` (prod) SAFELY.
#
# WHY THIS EXISTS
# `main` (prod) and `staging` (studojo.pro) are permanently diverged (100+ commits each
# way), so `git merge staging` into main is impossible and is deliberately never done.
# Prod is promoted by cherry-picking the Sensei files. The landmine: a hand cherry-pick of
# ONE file (usually app/routes/bob.tsx) silently DROPS any other file the feature touched
# (a new component, shared CSS, a lib helper) -> the feature ships HALF-LIVE in prod and
# nothing warns you. This script lists the FULL set of differing files so none is missed,
# and (with --apply) stages the complete promotion as one commit.
#
# USAGE
#   scripts/promote-sensei.sh                      # report which Sensei files differ (defaults)
#   scripts/promote-sensei.sh app/routes/bob.tsx app/components/sensei/  # scope to YOUR feature's files
#   scripts/promote-sensei.sh --apply <paths...>   # build the promotion branch+commit (you push+PR)
#
# ALWAYS pass the exact set of files your feature changed on staging (from your staging PR).
# The defaults only cover the common single-file case.
set -euo pipefail

APPLY=0
PATHS=()
for a in "$@"; do
  if [ "$a" = "--apply" ]; then APPLY=1; else PATHS+=("$a"); fi
done
[ ${#PATHS[@]} -eq 0 ] && PATHS=("app/routes/bob.tsx" "app/routes/_index.tsx")

echo "Fetching origin main + staging..."
git fetch -q origin main staging

echo
echo "Files that differ between origin/staging and origin/main under: ${PATHS[*]}"
DIFF=()
while IFS= read -r line; do [ -n "$line" ] && DIFF+=("$line"); done \
  < <(git diff --name-only origin/main origin/staging -- "${PATHS[@]}")

if [ ${#DIFF[@]} -eq 0 ]; then
  echo "  (none — prod is already in sync for these paths)"
  exit 0
fi
printf '  %s\n' "${DIFF[@]}"
echo
echo ">> Promote ALL ${#DIFF[@]} of these together, or the feature ships half-live in prod."

if [ "$APPLY" -eq 0 ]; then
  echo
  echo "Dry run. Re-run with --apply <paths...> to build the promotion branch, or by hand:"
  echo "  git checkout -b sensei-promote-\$(git rev-parse --short origin/staging) origin/main"
  for f in "${DIFF[@]}"; do echo "  git checkout origin/staging -- $f"; done
  echo "  git commit -m 'sensei(prod): promote <feature> to app.studojo.com'"
  echo "  git push -u origin HEAD   # then open a PR to main"
  exit 0
fi

BR="sensei-promote-$(git rev-parse --short origin/staging)"
git checkout -b "$BR" origin/main
for f in "${DIFF[@]}"; do git checkout origin/staging -- "$f"; done
git add -- "${DIFF[@]}"
git commit -m "sensei(prod): promote to app.studojo.com (match staging)

Files: ${DIFF[*]}"
echo
echo "Built promotion branch '$BR' with ${#DIFF[@]} file(s)."
echo "Review the diff, then:  git push -u origin $BR   # and open a PR to main"
