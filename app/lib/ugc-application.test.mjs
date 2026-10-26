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
  LIMITS,
} from "./ugc-application.ts";

const STORY = "I interned at a small fintech for two months and spent most of it cleaning data for the ops team.";

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
  followers: "300-500",
  postFrequency: "A few times ever",
  lastPosted: "1-6 months ago",
  bestPostUrl: "",
  crossed1k: "Not sure",
  field: "Finance",
  targetRoles: "Investment banking analyst",
  dreamCompanies: "",
  lookingFor: "An internship",
  topics: ["Internships and first jobs", "Internships and first jobs", "Not a real topic"],
  avoidTopics: "",
  storyWork: STORY,
  storySetback: "",
  storyLesson: "",
  tone: "Storyteller",
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
assert.equal(r.value.linkedinUrl, "https://www.linkedin.com/in/riya-sharma");
assert.deepEqual(r.value.topics, ["Internships and first jobs"], "duplicates and unknown topics are dropped");
assert.equal(r.value.bestPostUrl, null);
assert.equal(r.value.dreamCompanies, null, "empty optional text is stored as null");
assert.equal(r.value.storySetback, null);

// Every required answer is required, and the error names the field.
const required = [
  ["fullName", ""], ["email", ""], ["whatsapp", ""], ["college", ""], ["course", ""], ["yearOfStudy", "Year 9"],
  ["linkedinUrl", ""], ["followers", ""], ["postFrequency", "daily"], ["lastPosted", ""],
  ["field", "Astrology"], ["targetRoles", ""], ["lookingFor", ""], ["topics", []],
  ["canCommit", ""], ["studojoOk", "No"], ["whyJoin", "fun"], ["consent", "true"],
];
for (const [key, bad] of required) {
  r = validateUgcApplication({ ...valid(), [key]: bad });
  assert.equal(r.ok, false, `${key}=${JSON.stringify(bad)} should fail`);
  assert.equal(r.field, key, `${key} failure points at ${r.field}`);
  assert.ok(r.error.length > 10, "errors are written for people");
}

// Errors come in step order, so the form can jump to the earliest step that needs attention.
r = validateUgcApplication({ ...valid(), whyJoin: "", fullName: "" });
assert.equal(r.field, "fullName");
r = validateUgcApplication({ ...valid(), whyJoin: "", storyWork: "" });
assert.equal(r.field, "stories");

// Stories: at least one, and one of them long enough to write from.
r = validateUgcApplication({ ...valid(), storyWork: "", storySetback: "", storyLesson: "" });
assert.equal(r.field, "stories");
r = validateUgcApplication({ ...valid(), storyWork: "Too short.", storySetback: "Also short." });
assert.equal(r.field, "stories");
r = validateUgcApplication({ ...valid(), storyWork: "", storyLesson: STORY });
assert.equal(r.ok, true);
r = validateUgcApplication({ ...valid(), storyWork: "a\r\n\r\n\r\n\r\nb ".repeat(10) + "x".repeat(3000) });
assert.equal(r.ok, true);
assert.ok(r.value.storyWork.length <= LIMITS.story, "stories are capped");
assert.ok(!/\n{3,}|\r/.test(r.value.storyWork), "blank-line runs and CRs are tidied");

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
r = validateUgcApplication({ ...valid(), graduationYear: "soon", tone: "Angry", crossed1k: "Maybe", referralSource: "TV" });
assert.equal(r.ok, true);
assert.equal(r.value.graduationYear, null);
assert.equal(r.value.tone, null);
assert.equal(r.value.crossed1k, null);
assert.equal(r.value.referralSource, null);

// The caller's stricter email check is used.
r = validateUgcApplication({ ...valid(), email: "riya@gmail.cok" }, (e) => (e.endsWith(".cok") ? "Did you mean gmail.com?" : null));
assert.equal(r.field, "email");
assert.equal(r.error, "Did you mean gmail.com?");
r = validateUgcApplication({ ...valid(), email: "not-an-email" });
assert.equal(r.field, "email");

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
assert.equal(normalizeLinkedInPost("linkedin.com/posts/.."), null);
assert.equal(normalizeLinkedInPost("https://www.linkedin.com/in/riya"), null, "a profile is not a post");
assert.equal(normalizeLinkedInPost("https://linkedin.com.evil.com/posts/x"), null);
assert.equal(normalizeLinkedInPost('https://www.linkedin.com/posts/x"><img src=x>'), null, "no markup characters");

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
r = validateUgcApplication({ ...valid(), whyJoin: "To grow fast" });
assert.equal(r.ok, true);

// WhatsApp numbers.
assert.equal(normalizeWhatsapp("98765 43210"), "+919876543210");
assert.equal(normalizeWhatsapp("098765-43210"), "+919876543210");
assert.equal(normalizeWhatsapp("+91 98765 43210"), "+919876543210");
assert.equal(normalizeWhatsapp("+44 (7700) 900123"), "+447700900123");
for (const bad of ["12345", "call me", "+91 98765 43210 ext 2", "1234567890123456"]) assert.equal(normalizeWhatsapp(bad), null, bad);

// Every answer the validator can point at lives on exactly one step.
const pointable = ["fullName", "email", "whatsapp", "college", "course", "yearOfStudy", "linkedinUrl", "followers", "postFrequency", "lastPosted", "bestPostUrl", "field", "targetRoles", "lookingFor", "topics", "stories", "canCommit", "studojoOk", "whyJoin", "consent"];
for (const f of pointable) assert.equal(STEPS.filter((s) => s.fields.includes(f)).length, 1, f);
assert.equal(stepOf("fullName"), 0);
assert.equal(stepOf("stories"), 3);
assert.equal(stepOf("consent"), 4);

console.log("ugc-application: all checks pass");
