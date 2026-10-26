// PRODUCT-ALIGN (27 Oct 2026, staging only): the pages the new header and footer link (About, Contact, the reports)
// speak for the one product, Stu the job agent. None of them links to or names a retired product (the old product
// pages stay reachable, linked from nowhere: the owner's decision), and every link into /b2cnew is a full page load,
// since /b2cnew is another app. studojo.com (main) still sells the old products: never cherry-pick this to main.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROUTES = "app/routes";
const pages = ["about.tsx", "contact.tsx", ...readdirSync(ROUTES).filter((f) => /^reports(\..+)?\.tsx$/.test(f))];
assert.ok(pages.length > 60, `only ${pages.length} pages found`);

const RETIRED_LINK = /(?:to|href)=\{?["'`](?:https?:\/\/(?:www\.)?studojo\.com)?\/(?:outreach|dojos|resume-maker|cc|assignments)(?:[/?"'`]|$)/;
const RETIRED_NAME = /Outreach (?:Tool|Dojo)|Studojo Outreach|(?<![Ss]tu)Dojo|Resume Maker|resume builder|CareerDojo|Career Coach/;

for (const f of pages) {
  const src = readFileSync(join(ROUTES, f), "utf8");
  const link = RETIRED_LINK.exec(src);
  assert.equal(link, null, `${f} links a retired product: ${link?.[0]}`);
  const name = RETIRED_NAME.exec(src);
  assert.equal(name, null, `${f} names a retired product: ${name?.[0]}`);
  // Every router Link into /b2cnew loads the page.
  for (const tag of src.match(/<Link\b[^>]*>/g) ?? []) {
    if (/to=\{?["'`]\/b2cnew/.test(tag)) assert.match(tag, /reloadDocument/, `${f}: ${tag.slice(0, 120)}`);
  }
}
console.log(`product-align pages: ${pages.length} pages speak for Stu`);
