// The owner's choice (22 Oct 2026): agreeing to the Terms is agreeing to the public Studojo page. Checks the Terms'
// new section 5 says what the page really does, every section number and cross reference still lines up, the
// Terms version is bumped (so signed-in users see the update notice), and every sign-in path shows the same line.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { needsPolicyAcceptance, POLICY_VERSIONS, TERMS_EFFECTIVE_DATE } from "./legal.ts";
import { ConsentLine } from "../components/auth/consent-line.tsx";

const terms = readFileSync(new URL("../routes/terms.tsx", import.meta.url), "utf8");
const privacy = readFileSync(new URL("../routes/privacy.tsx", import.meta.url), "utf8");
const auth = readFileSync(new URL("../routes/auth._index.tsx", import.meta.url), "utf8");
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&apos;|&#x27;/g, "'").replace(/\s+/g, " ").replace(/\s+([;:.,])/g, "$1").trim();

// The version: 2.1, so a signed-in user who agreed to 2.0 sees the notice once.
assert.equal(POLICY_VERSIONS.terms, "2.1");
assert.equal(TERMS_EFFECTIVE_DATE, "22 October 2026");
assert.equal(needsPolicyAcceptance({ termsVersion: "2.0", privacyVersion: POLICY_VERSIONS.privacy, refundVersion: POLICY_VERSIONS.refund }), true);
assert.equal(needsPolicyAcceptance({ termsVersion: "2.1", privacyVersion: POLICY_VERSIONS.privacy, refundVersion: POLICY_VERSIONS.refund }), false);
assert.match(terms, /Version \{POLICY_VERSIONS\.terms\}\. Effective \{fill\(TERMS_EFFECTIVE_DATE\)\}\./);

// Sections 1 to 26, in order, each once; section 5 is the page.
const titles = [...terms.matchAll(/md:text-3xl">(\d+)\. ([^<]+)<\/h2>/g)].map((m) => [Number(m[1]), m[2]]);
assert.deepEqual(titles.map(([n]) => n), Array.from({ length: 26 }, (_, i) => i + 1), "numbered 1 to 26 with no gap or repeat");
const title = Object.fromEntries(titles);
assert.equal(title[5], "Your Studojo page");
assert.match(terms, /<div id="your-page" [^>]*>\s*<h2 [^>]*>5\. Your Studojo page<\/h2>/);

// Every "section N" in the Terms points where it means to; the Privacy Policy's pointer too.
const refs = [...terms.matchAll(/See section (\d+)\.<\/li>/g)].map((m) => title[Number(m[1])]);
assert.deepEqual(refs, ["Your Studojo page", "How Outreach Dojo works", "LinkedIn automation", "AutoApply", "Assignment Dojo and Humanizer"]);
assert.match(terms, /running the system as described in section 6\./);
assert.equal(title[6], "How Outreach Dojo works");
assert.match(terms, /Sections 7, 11, 17 and 20 to 26 continue to apply/);
assert.deepEqual([title[7], title[11], title[17], title[20], title[26]], ["Responsibility for outreach", "Contact data", "Your content and our property", "Disclaimer", "General"]);
assert.match(privacy, /Section 8 of our Terms explains the risk that LinkedIn restricts your account\./);
assert.equal(title[8], "LinkedIn automation");

// Section 5 says what the page really shows, hides and who opens it (the job search's own rules).
const five = text(terms.slice(terms.indexOf('<div id="your-page"'), terms.indexOf("{/* 6. How Outreach Dojo works */}")));
for (const said of [
  "we make a public profile page for you at studojo.com/profile/your-name, from your answers and your resume. By creating an account and finishing setup, you agree to this page being made and shown as this section describes.",
  "What is on it: your name, college and course; the roles, cities and start date you want; your best project; the experience, projects, education and skills on your resume; your photo, only if you choose to show it.",
  "What is never on it: your email address, phone number, home address, or personal details such as your date of birth or parents' names. We hide these even when they are on your resume.",
  "Who can open it: anyone with its link; hiring managers on Studojo; search engines such as Google, which may list it, while the Search engines switch is on. It is on when your page is made.",
  "Making it private: you can make your page private, or turn off search engines or hiring managers, at any time in Settings, Your page.",
  "Deleting your account deletes your page.",
  "You must be 18 or older to have a public page, as for any Studojo account (section 2).",
]) assert.ok(five.includes(said), `section 5 says: ${said}`);

// The sign-in line: the same words on every path, the 18+ phrase kept, three links.
const line = (lead) => renderToStaticMarkup(createElement(ConsentLine, { lead }));
assert.equal(text(line("By continuing")), "By continuing, you confirm you are 18 or older and agree to Studojo's Terms and Privacy Policy, including your public Studojo page.");
assert.equal(text(line("By signing up")), "By signing up, you confirm you are 18 or older and agree to Studojo's Terms and Privacy Policy, including your public Studojo page.");
assert.deepEqual([...line("By continuing").matchAll(/href="([^"]+)"/g)].map((m) => m[1]), ["/terms", "/privacy", "/terms#your-page"]);
assert.match(auth, /<ConsentLine lead="By continuing" \/>/, "under Continue with Google, in both modes");
assert.match(auth, /<ConsentLine lead=\{mode === "signup" \? "By signing up" : "By continuing"\} \/>/, "under the email form, sign in and sign up");
assert.doesNotMatch(auth, /forJobSearch|Your Studojo page will be public/, "no longer only for /b2cnew redirects");

console.log("terms-public-page: ok");
