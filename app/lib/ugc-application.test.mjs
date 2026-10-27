// The Creator Program application validator (/creators -> /api/ugc-apply).
// The form and the API share it, so these cases pin both.
import assert from "node:assert/strict";
import {
  validateUgcApplication,
  normalizeLinkedInProfile,
  normalizeLinkedInPost,
  normalizeWhatsapp,
  STEPS,
  stepOf,
  TOPICS,
  CONNECTIONS,
  CROSSED_1K,
} from "./ugc-application.ts";

const valid = () => ({
  fullName: "  Riya   Sharma ",
  email: "Riya.Sharma@Gmail.com",
  whatsapp: "98765 43210",
  college: "Christ University",
  course: "BBA",
  yearOfStudy: "3rd year",
  graduationYear: "2027",
  city: "Bengaluru",
  linkedinUrl: "https://in.linkedin.com/in/riya-sharma/?originalSubdomain=in",
  connections: "300-500",
  postFrequency: "A few times ever",
  lastPosted: "1-6 months ago",
  bestPostUrl: "",
  crossed1k: "No",
  fellowshipGoals: ["A growth internship at Studojo", "Not a real goal"],
  internInterest: "Yes, I'd love that",
  networkShare: "Yes, share my profile",
  field: "Finance",
  targetRoles: "Investment banking analyst",
  dreamCompanies: "",
  lookingFor: "An internship",
  topics: ["Internships and first jobs", "Internships and first jobs", "Not a real topic"],
  avoidTopics: "",
  canCommit: "Yes, 3 posts a week for 4 weeks",
  studojoOk: "Yes, that's fine",
  whyJoin: "I want to get better at writing about what I do.",
  referralSource: "A LinkedIn post",
  referredBy: "",
  consent: true,
});

// A complete application comes back normalised.
let r = validateUgcApplication(valid());
assert.equal(r.ok, true, JSON.stringify(r));
assert.equal(r.value.fullName, "Riya Sharma");
assert.equal(r.value.email, "riya.sharma@gmail.com");
assert.equal(r.value.whatsapp, "+919876543210");
assert.equal(r.value.city, "Bengaluru");
assert.equal(r.value.hasLinkedin, true);
assert.equal(r.value.linkedinUrl, "https://www.linkedin.com/in/riya-sharma");
assert.equal(r.value.connections, "300-500");
assert.deepEqual(r.value.topics, ["Internships and first jobs"], "duplicates and unknown topics are dropped");
assert.equal(r.value.bestPostUrl, null);
assert.equal(r.value.dreamCompanies, null, "empty optional text is stored as null");
assert.equal(r.value.cameFromCode, null);
assert.equal("storyWork" in r.value, false, "stories are asked after shortlisting, not here");
assert.deepEqual(r.value.fellowshipGoals, ["A growth internship at Studojo"], "unknown goals are dropped");
assert.equal(r.value.internInterest, "Yes, I'd love that");
assert.equal(r.value.networkShare, "Yes, share my profile");

// The answer lists the founder asked for.
assert.deepEqual([...CROSSED_1K], ["Yes", "No"], "no 'Not sure' or 'Maybe'");
assert.ok(CONNECTIONS.includes("1,000+"));

// Every required answer is required, and the error names the field.
const required = [
  ["fullName", ""], ["email", ""], ["whatsapp", ""], ["college", ""], ["course", ""], ["yearOfStudy", "Year 9"], ["city", ""],
  ["linkedinUrl", ""], ["connections", "200"], ["postFrequency", "daily"], ["lastPosted", ""], ["crossed1k", "Not sure"],
  ["fellowshipGoals", []], ["internInterest", "Sure"], ["networkShare", ""],
  ["field", "Astrology"], ["targetRoles", ""], ["lookingFor", ""], ["topics", []],
  ["canCommit", ""], ["studojoOk", "No"], ["whyJoin", "fun"], ["consent", "true"],
];
for (const [key, bad] of required) {
  r = validateUgcApplication({ ...valid(), [key]: bad });
  assert.equal(r.ok, false, `${key}=${JSON.stringify(bad)} should fail`);
  assert.equal(r.field, key, `${key} failure points at ${r.field}`);
  assert.ok(r.error.length > 10, "errors are written for people");
}
r = validateUgcApplication({ ...valid(), crossed1k: "" });
assert.equal(r.field, "crossed1k", "the 1,000 impressions question is required");

// Errors come in step order, so the form can jump to the earliest step that needs attention.
r = validateUgcApplication({ ...valid(), whyJoin: "", fullName: "" });
assert.equal(r.field, "fullName");
r = validateUgcApplication({ ...valid(), whyJoin: "", connections: "" });
assert.equal(r.field, "connections");

// No LinkedIn: the LinkedIn questions are skipped and stored as null, even if
// something was half-filled before they said so.
r = validateUgcApplication({ ...valid(), noLinkedin: true, linkedinUrl: "junk", connections: "", crossed1k: "" });
assert.equal(r.ok, true, JSON.stringify(r));
assert.equal(r.value.hasLinkedin, false);
for (const k of ["linkedinUrl", "connections", "postFrequency", "lastPosted", "bestPostUrl", "crossed1k"]) {
  assert.equal(r.value[k], null, `${k} is null without LinkedIn`);
}
r = validateUgcApplication({ ...valid(), noLinkedin: "true", linkedinUrl: "" });
assert.equal(r.field, "linkedinUrl", "only a real true means no LinkedIn");

// Share codes from a share link: kept when well formed, ignored otherwise.
r = validateUgcApplication({ ...valid(), cameFromCode: "AB12CD34" });
assert.equal(r.value.cameFromCode, "ab12cd34");
for (const bad of ["short", "ab12cd34x", "ab12-d34", 12345678, null]) {
  r = validateUgcApplication({ ...valid(), cameFromCode: bad });
  assert.equal(r.ok, true, "a bad code never blocks an application");
  assert.equal(r.value.cameFromCode, null, String(bad));
}

// Topics: up to five.
r = validateUgcApplication({ ...valid(), topics: TOPICS.slice(0, 6) });
assert.equal(r.field, "topics");
r = validateUgcApplication({ ...valid(), topics: "College life" });
assert.equal(r.field, "topics", "a string is not a list");

// Optional answers are checked only when given.
r = validateUgcApplication({ ...valid(), bestPostUrl: "https://example.com/post" });
assert.equal(r.field, "bestPostUrl");
r = validateUgcApplication({ ...valid(), bestPostUrl: "linkedin.com/posts/riya-sharma_activity-7123-abc" });
assert.equal(r.value.bestPostUrl, "https://www.linkedin.com/posts/riya-sharma_activity-7123-abc");
r = validateUgcApplication({ ...valid(), graduationYear: "soon", referralSource: "TV" });
assert.equal(r.ok, true);
assert.equal(r.value.graduationYear, null);
assert.equal(r.value.referralSource, null);

// The caller's stricter email check is used.
r = validateUgcApplication({ ...valid(), email: "riya@gmail.cok" }, (e) => (e.endsWith(".cok") ? "Did you mean gmail.com?" : null));
assert.equal(r.field, "email");
assert.equal(r.error, "Did you mean gmail.com?");
r = validateUgcApplication({ ...valid(), email: "not-an-email" });
assert.equal(r.field, "email");

// Only real strings count, and hidden characters never reach the database.
r = validateUgcApplication({ ...valid(), fullName: 12345 });
assert.equal(r.field, "fullName", "a number is not a name");
r = validateUgcApplication({ ...valid(), fullName: "Ri\u0000ya\u200B Sha\u202Erma", topics: [1, {}, "College life"] });
assert.equal(r.ok, true);
assert.equal(r.value.fullName, "Riya Sharma", "NUL, zero-width and bidi characters are stripped");
assert.deepEqual(r.value.topics, ["College life"]);
r = validateUgcApplication({ ...valid(), targetRoles: "PM" });
assert.equal(r.ok, true, "a two-letter role is a real answer");
r = validateUgcApplication({ ...valid(), whyJoin: "To grow" });
assert.equal(r.field, "whyJoin");
assert.match(r.error, /at least 10 characters/, "the error says how much is needed");

// LinkedIn profile links in the shapes people paste.
for (const ok of ["linkedin.com/in/riya-sharma", "https://www.linkedin.com/in/riya-sharma/", "http://in.linkedin.com/in/riya-sharma", "www.linkedin.com/in/riya-sharma-4a1b2c3d?utm_source=share"]) {
  assert.ok(normalizeLinkedInProfile(ok)?.startsWith("https://www.linkedin.com/in/riya-sharma"), ok);
}
for (const bad of ["linkedin.com/company/studojo", "https://evil.com/linkedin.com/in/riya", "https://linkedin.com.evil.com/in/riya", "javascript:alert(1)//linkedin.com/in/x", "riya", "linkedin.com/in/", "linkedin.com/in/a b"]) {
  assert.equal(normalizeLinkedInProfile(bad), null, bad);
}
assert.equal(normalizeLinkedInPost("https://www.linkedin.com/feed/update/urn:li:activity:7123/"), "https://www.linkedin.com/feed/update/urn:li:activity:7123");
assert.equal(normalizeLinkedInPost("https://www.linkedin.com/posts/riya_activity-71-abc?utm_source=share"), "https://www.linkedin.com/posts/riya_activity-71-abc", "query dropped");
assert.equal(normalizeLinkedInPost("linkedin.com/posts/../in/riya"), null, "no path traversal");
assert.equal(normalizeLinkedInPost("https://www.linkedin.com/in/riya"), null, "a profile is not a post");
assert.equal(normalizeLinkedInPost("https://linkedin.com.evil.com/posts/x"), null);
assert.equal(normalizeLinkedInPost('https://www.linkedin.com/posts/x"><img src=x>'), null, "no markup characters");

// WhatsApp numbers.
assert.equal(normalizeWhatsapp("98765 43210"), "+919876543210");
assert.equal(normalizeWhatsapp("098765-43210"), "+919876543210");
assert.equal(normalizeWhatsapp("+91 98765 43210"), "+919876543210");
assert.equal(normalizeWhatsapp("+44 (7700) 900123"), "+447700900123");
for (const bad of ["12345", "call me", "+91 98765 43210 ext 2", "1234567890123456"]) assert.equal(normalizeWhatsapp(bad), null, bad);

// Four steps now, and every answer the validator can point at lives on exactly one of them.
assert.equal(STEPS.length, 4);
const pointable = ["fullName", "email", "whatsapp", "college", "course", "yearOfStudy", "city", "linkedinUrl", "connections", "postFrequency", "lastPosted", "bestPostUrl", "crossed1k", "fellowshipGoals", "internInterest", "networkShare", "field", "targetRoles", "lookingFor", "topics", "canCommit", "studojoOk", "whyJoin", "consent"];
for (const f of pointable) assert.equal(STEPS.filter((s) => s.fields.includes(f)).length, 1, f);
assert.equal(stepOf("city"), 0);
assert.equal(stepOf("crossed1k"), 1);
assert.equal(stepOf("consent"), 3);

console.log("ugc-application: all checks pass");
