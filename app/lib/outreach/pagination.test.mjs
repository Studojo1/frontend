// The pagination window used to be inline in the results page and was dead
// code while the page showed at most 5 pages. Now that every lead is paged,
// it runs on every render, so it is pinned here.
import { pageWindow } from "./pagination.ts";

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}

eq("no pages", pageWindow(1, 0), []);
eq("fewer pages than the window", pageWindow(2, 3), [1, 2, 3]);
eq("exactly the window", pageWindow(4, 7), [1, 2, 3, 4, 5, 6, 7]);
eq("start pinned at 1", pageWindow(1, 40), [1, 2, 3, 4, 5, 6, 7]);
eq("near the start", pageWindow(3, 40), [1, 2, 3, 4, 5, 6, 7]);
eq("middle centres the page", pageWindow(20, 40), [17, 18, 19, 20, 21, 22, 23]);
eq("near the end", pageWindow(39, 40), [34, 35, 36, 37, 38, 39, 40]);
eq("last page", pageWindow(40, 40), [34, 35, 36, 37, 38, 39, 40]);
eq("page past the end clamps", pageWindow(99, 40), [34, 35, 36, 37, 38, 39, 40]);
eq("page below 1 clamps", pageWindow(0, 40), [1, 2, 3, 4, 5, 6, 7]);
for (let total = 1; total <= 45; total++) {
  for (let p = 1; p <= total; p++) {
    const w = pageWindow(p, total);
    const ok = w.includes(p) && w.length === Math.min(7, total) && w[0] >= 1 && w[w.length - 1] <= total &&
      w.every((n, i) => i === 0 || n === w[i - 1] + 1);
    ok ? pass++ : fail++;
    if (!ok) console.error(`FAIL invariant page=${p} total=${total}: ${JSON.stringify(w)}`);
  }
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
