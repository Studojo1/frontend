import { SIGNED_IN_LIMIT, type HighlightKind } from "../../lib/emailer/contract";

// EMAILER: every line the free email writer shows, in one place, so the copy rules can be checked in one test
// (app/lib/emailer/emailer.test.mjs): no em or en dashes, never the word for people in school, no prices, they/them
// for people. Every example person, company and result is made up (RULE B).

/** "4 more emails today": the signed-in limit less the free one they just used. */
export const MORE_TODAY = Math.max(0, SIGNED_IN_LIMIT - 1);

export const COPY = {
  title: "Free Cold Email Writer for Jobs and Internships | Studojo",
  description:
    "Write a cold email to a hiring manager in about a minute. Free, no sign-up: a subject line, a short email that says why them first, then your best work, and a reply score out of 10 with fixes.",
  ogAlt: "Studojo's free cold email writer: a job email and its reply score out of 10",

  bar: "New: Stu finds the hiring manager and sends emails like this for you, then follows up.",
  barShort: "Let Stu send it and follow up for you.",
  barGo: "Try free",

  kicker: "free cold email writer",
  h1: "write a job email that gets read.",
  lead:
    "Tell us the job and your best results. In about a minute you get a short email to the hiring manager, a subject line and a reply score out of 10. Free, with no sign-up.",
  heroCta: "Rather not send it yourself? Stu, Studojo's career agent, finds who's hiring and sends it for you.",
  heroCtaGo: "Meet Stu",

  tabWrite: "Write my email",
  tabGrade: "Improve my email",

  freeNote: "Your first email is free. No sign-up.",
  leftToday: (left: number, limit: number) => `${left} of ${limit} left today`,
} as const;

export const FORM = {
  company: "Company",
  companyPh: "Name or website, like northwind.io",
  role: "Role",
  rolePh: "Product analyst",
  job: "Job",
  internship: "Internship",
  jobPost: "The job post",
  jobPostHint: "Not required, but it's how we know what they need.",
  jobPaste: "Paste it",
  jobLink: "Link",
  jobPostPh: "Paste the job description here",
  jobUrlPh: "https://northwind.io/careers/product-analyst",
  to: "Who you're writing to",
  toHint: "Write to the hiring manager, not HR: the founder at a small startup, the team lead at a big company.",
  toNamePh: "Their name, like Maya Chen",
  toTitlePh: "Their title, like Head of Product",
  name: "Your name",
  namePh: "Sam Rivera",
  now: "Where you are now",
  nowHint: "One line.",
  nowPhs: [
    "Final-year computer science, interning at a payments startup",
    "Two years as a backend developer at a logistics company",
    "B.Com graduate, six months in a CA firm's audit team",
  ],
  results: "Your best results",
  resultsHint: "1 to 3, one line each. The email uses the one or two that fit this job best.",
  resultPhs: [
    "Cut the checkout page's load time from 4.1s to 1.3s",
    "Grew a college club's newsletter from 300 to 2,100 readers",
    "Built a dashboard that 40 people on my team use every week",
  ],
  meter: {
    empty: "",
    short: "Say what you did and what changed.",
    nonumber: "Add a number: how many, how much, what changed.",
    good: "Has a number. That's what gets read.",
  },
  why: "Why this company",
  whyHint: "In your own words. The email opens with it.",
  whyPh: "I use their app every week to split rent with my flatmates",
  links: "Links",
  linksHint: "Up to 3.",
  linksPh: "github.com/you, your portfolio",
  resume: "Fill from my resume",
  resumeHint: "PDF or DOCX. Optional: typing works too.",
  resumeBusy: "Reading your resume...",
  resumeDone: "Filled from your resume. Check it and edit anything.",
  resumeMore: "More from your resume. Tap one to use it:",
  resumeTooBig: "That file is over 5 MB. Try a smaller PDF, or type your results.",
  resumeBadType: "That isn't a PDF or DOCX. Try one of those, or type your results.",
  resumeFailed: "We couldn't read that resume. Type your results instead, it works just as well.",
  resumeLimit: "That's all the resume reads for today. Type your results instead, it works just as well.",
  submit: "Write my email",
  submitBusy: "Writing your email...",
  optional: "optional",
} as const;

export const GRADE = {
  email: "Paste your email",
  emailHint: "The whole email, 40 to 3,000 characters.",
  emailPh: "Hey Maya,\n\nI'm emailing because...",
  subject: "Subject",
  subjectPh: "Product analyst at Northwind",
  role: "Role",
  rolePh: "Product analyst",
  company: "Company",
  companyPh: "Northwind",
  submit: "Score and improve it",
  submitBusy: "Improving your email...",
  emptyTitle: "Your score shows up here",
  emptyLine: "A reply score out of 10, what holds it back, and your own email improved: your facts and your voice, better structured.",
  rewrite: "Your email, improved",
  rewriteLocked: `Sign in free to see your email improved and its new score, and ${MORE_TODAY} more today.`,
  beforeAfter: "Your draft, then your email improved",
  before: "your draft",
  after: "improved",
  fromWrite: "Already wrote one?",
  fromWriteGo: "Paste it in and we'll improve it",
} as const;

export const LOADING_STEPS = (company: string) => [
  "Reading the job post",
  company ? `Looking up ${company}` : "Looking up the company",
  "Writing your email",
  "Scoring it",
];

export const RESULT = {
  scoreKicker: "reply score",
  fixesTitle: "Make it better",
  noFixes: "Nothing to fix. Send it.",
  share: "Share your score",
  shareX: "Share on X",
  shareLinkedIn: "Share on LinkedIn",
  to: "To",
  toDefault: "the hiring manager",
  subject: "Subject",
  copy: "Copy email",
  copied: "Copied",
  copySubject: "Copy subject",
  gmail: "Open in Gmail",
  edit: "Edit",
  done: "Done",
  regenerate: "Regenerate",
  regenerating: "Writing a new one...",
  another: "Write another email",
  whyTitle: "Why this works",
  followups: "Follow-ups",
  followupsLine: "No reply yet? Send these on day 3 and day 7.",
  day: (d: number) => `Day ${d}`,
  copyFollowup: "Copy",
  unlockFollowups: "Write my follow-ups",
  unlockFollowupsLine: "You're signed in. Write a fresh version of this email with its day 3 and day 7 follow-ups.",
  emptyTitle: "Your email shows up here",
  emptyLine: "A subject line, a short email that says why them first, then your best work, and a reply score out of 10.",
  example: "example",
} as const;

// EMAILER-VOICE (17 Nov 2026, the team: "why them should be first and then best work"): the email opens with why them.
export const HIGHLIGHTS: Record<HighlightKind, { tag: string; why: string }> = {
  company: { tag: "why them", why: "It opens with why you want this company, in your own words, so they know why you're writing." },
  result: { tag: "your best work", why: "Then what you've done that fits this job, with the numbers." },
  ask: { tag: "one easy ask", why: "It ends with one small ask: worth a chat?" },
};

/** The locked cards: the same pitch everywhere. */
export const LOCK = {
  title: "Sign in free to keep going",
  line: `Sign in free to unlock your follow-ups, regenerate, and ${MORE_TODAY} more emails today.`,
  go: "Sign in free",
  later: "Not now",
  orStu: "Or let Stu write and send them for you",
  regenerate: "Sign in free to regenerate",
  more: "Sign in free to write another",
} as const;

export const ERRORS = {
  limit: "That's 5 for today, back tomorrow, or let Stu do it daily.",
  limitGo: "Let Stu do it daily",
  busy: "Lots of people are writing emails today and we've hit the day's limit. Back tomorrow, or let Stu do it daily.",
  off: "The email writer is taking a short break. Back soon.",
  error: "Something went wrong on our side. Try again in a moment.",
  field: "Check the highlighted field.",
} as const;

/** The Stu links' words. 3: next to the result; 4: the modal after copy or Gmail; 5: jobs; 7: the phone bar. */
export const STU = {
  resultTitle: "Don't know who to send it to?",
  resultLine: "Stu finds the hiring manager's email and sends this from your inbox, then follows up.",
  go: "Try free",
  modalTitle: "Want Stu to send it and follow up for you?",
  modalLine:
    "Stu, Studojo's career agent, finds the hiring manager's email, sends it from your own inbox and follows up on day 3 and day 7.",
  modalGo: "Try Stu free",
  modalNo: "No thanks",
  jobsKicker: "stu, your career agent",
  jobsTitle: "Get 5 matched jobs every day, free.",
  jobsLine: "One short call with Stu, Studojo's career agent. Stu finds jobs that fit you, finds who's hiring and writes the email to them.",
  sticky: "Let Stu send it and follow up.",
} as const;

export const STEPS = [
  { title: "Tell it the job.", line: "The company, the role and the job post. The post is how the email knows what they need." },
  { title: "Say why them, then your best results.", line: "Why this company, in your own words, then one line per result with a number. The email opens with why them." },
  { title: "Send it, then follow up.", line: "Copy it or open it in Gmail. Sign in free for the day 3 and day 7 follow-ups." },
] as const;

export const SEO = {
  kicker: "how it works",
  h2: "a free cold email writer for jobs and internships",
  paras: [
    "A cold email to a hiring manager works when it is short, specific and about the job. Studojo's free cold email writer turns the job post and your best results into a subject line and an email under 120 words. It opens with why you want this company, in your own words, then your one or two best results, and ends with one easy ask: worth a chat?",
    "Every email comes with a reply score out of 10 and plain fixes, so you know what to change before you hit send. Already wrote one? Paste it into Improve my email for a score, fixes and your own email improved, in your words.",
  ],
} as const;

export const FAQ = [
  {
    q: "Is it free?",
    a: "Yes. Your first email is free, with no sign-up. Sign in free to unlock follow-ups, regenerate, and up to 5 emails a day.",
  },
  {
    q: "Do you send it?",
    a: "No. You copy it, or open it in Gmail, and send it yourself. If you'd rather have it sent, Stu, Studojo's career agent, finds the hiring manager's email, sends it from your own inbox and follows up.",
  },
  {
    q: "Where do the facts come from?",
    a: "Only from what you give it: the form, the job post and your resume if you add one. It never invents a number or a result. What it says about the company comes from the company's own public information.",
  },
  {
    q: "Who should I send it to?",
    a: "The person you would work for, not HR. At a small startup that's usually a founder, at a mid-size company the head of the team, and at a big company the team lead.",
  },
  {
    q: "What does the reply score mean?",
    a: "It's how likely a busy hiring manager is to reply, from 0 to 10, judged against fixed examples of weak and strong cold emails: a result of yours with a number, a real reason for this company, short, one easy ask. Each score comes with up to 3 plain fixes.",
  },
  {
    q: "Can it check an email I already wrote?",
    a: "Yes. Open Improve my email and paste it in for a score and fixes. Sign in free to get your email improved, with your facts and your voice kept, and its new score. We only show it when it scores higher than yours.",
  },
] as const;

/** 6. More free help: the live free pages (the reports). The old free tools were retired on 2 Nov 2026 and their
 * paths 301 to the homepage (app/lib/retired-routes.ts), so they are not offered here. */
export const MORE_FREE = {
  kicker: "more free from studojo",
  h2: "more help with the email.",
  items: [
    { href: "/reports", title: "Free reports on getting hired", line: "Entry-level pay, hiring and applying, with the sources.", icon: "chart" as const },
    { href: "/reports/cold-email-subject-lines-best-practices-2026", title: "Cold email subject lines", line: "What gets opened, and what gets skipped.", icon: "mail" as const },
    { href: "/reports/follow-up-job-application-timing-2026", title: "When to follow up", line: "The timing that gets a reply without being pushy.", icon: "doc" as const },
    { href: "/reports/find-hiring-manager-email-2026", title: "Find the hiring manager's email", line: "Where the right address comes from.", icon: "search" as const },
  ],
} as const;

/** The empty state's example: made up, labelled "example". */
export const EXAMPLE = {
  to: "Maya Chen, Head of Product",
  subject: "Product analyst at Northwind",
  body: [
    "Hey Maya,",
    "",
    "I'm emailing because I order from Northwind every week, and the 20 minute delivery is the reason I stopped using other apps. I'd like to help figure out why people drop off between their first and second order.",
    "",
    "Two things that may be relevant:",
    "• At my internship at Cartly, I cut the checkout page's load time from 4.1s to 1.3s, and orders went up 9%.",
    "• I built a SQL dashboard for our college canteen that 600 people check every week.",
    "",
    "Can share more about other work, but feel like these two are perhaps the most relevant.",
    "",
    "I think I could help your team find what brings people back and would like to learn more. Worth a chat?",
    "",
    "Sam",
  ].join("\n"),
  highlights: {
    result: "At my internship at Cartly, I cut the checkout page's load time from 4.1s to 1.3s, and orders went up 9%.",
    company: "I'm emailing because I order from Northwind every week, and the 20 minute delivery is the reason I stopped using other apps. I'd like to help figure out why people drop off between their first and second order.",
    ask: "I think I could help your team find what brings people back and would like to learn more. Worth a chat?",
  },
  /** EMAILER-VOICE (17 Nov 2026): the free writer's own voice; the grader's score of this example is below. */
  score: 8,
} as const;

/** The follow-up cards' stand-in text while locked: blurred, never real. */
export const LOCKED_FOLLOWUP = [
  "Hey there, quick bump on this in case it got buried under everything else this week.",
  "Hey there, last nudge from me on the role. No worries if the timing isn't right.",
] as const;

/** The share page. */
export const SHARE = {
  kicker: "a cold email, scored",
  writeYours: "Write yours free",
  gradeYours: "Grade yours",
  myEmail: "My cold email",
  missingTitle: "This score card isn't here anymore.",
  missingLine: "Write your own in about a minute. Free, with no sign-up.",
  line: "Written with Studojo's free cold email writer: a short email to the hiring manager that says why them first, then the best work.",
  title: (score: string) => `My cold email scored ${score}/10 | Studojo`,
  titleGrade: (before: string, after: string) => `My cold email went from ${before}/10 to ${after}/10 | Studojo`,
  titleDefault: "A cold email, scored | Studojo",
  description: "Write a cold email to a hiring manager in about a minute, with a reply score out of 10. Free, no sign-up.",
} as const;
