import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/api.resumes.parse";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return new Response(JSON.stringify({ error: "Only PDF files are supported" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return new Response(
      JSON.stringify({ error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractPdfText(buffer);
    const resumeData = parseResumeStructured(text);

    return new Response(JSON.stringify({ resumeData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[resume-parse] error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Failed to parse PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ─── PDF text extraction ────────────────────────────────────────────────────

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = await import("pdf-parse");
  const data = await pdfParse.default(buffer);
  return data.text;
}

// ─── Main parser (pure regex, no LLM) ──────────────────────────────────────

function parseResumeStructured(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections = splitSections(lines);

  return {
    title: "",
    summary: sections.summary.join(" ").trim(),
    contact_info: extractContact(text, lines),
    work_experiences: parseExperiences(sections.experience),
    educations: parseEducations(sections.education),
    skills: parseSkills(sections.skills, text),
    projects: parseProjects(sections.projects),
    certifications: parseCertifications(sections.certifications),
  };
}

// ─── Section splitting ───────────────────────────────────────────────────────

const SECTION_MAP: Array<[string, RegExp]> = [
  ["summary",         /^(professional\s+)?(summary|profile|objective|about(\s+me)?|overview|career\s+summary)$/i],
  ["experience",      /^(work\s+)?(experience|employment|career|work\s+history|professional\s+(experience|history))$/i],
  ["education",       /^(education(al)?(\s+(background|qualifications?))?|academic|qualifications?)$/i],
  ["skills",          /^(technical\s+)?(skills?|competencies|technologies|expertise|tools(\s*&\s*technologies)?)$/i],
  ["projects",        /^(projects?|personal\s+projects?|key\s+projects?|notable\s+projects?)$/i],
  ["certifications",  /^(certifications?|certificates?|achievements?|awards?|honors?|accomplishments?)$/i],
];

function splitSections(lines: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {
    summary: [], experience: [], education: [], skills: [], projects: [], certifications: [],
  };
  let current = ""; // unknown/header area — don't collect

  for (const line of lines) {
    let matched = false;
    for (const [name, re] of SECTION_MAP) {
      if (re.test(line)) {
        current = name;
        matched = true;
        break;
      }
    }
    if (!matched && current && result[current] !== undefined) {
      result[current].push(line);
    }
  }
  return result;
}

// ─── Contact info ────────────────────────────────────────────────────────────

const ORG_WORDS = new Set(["office","technologies","solutions","pvt","ltd","inc","llc","corp","group","labs","consulting","ventures","capital","media","digital","academy","institute","university","college","school","foundation","services","associates","partners","agency","enterprises","limited","private","company","intern","internship","trainee","assistant","manager","analyst","developer","engineer","designer","marketing","freelance"]);
const SECTION_WORDS = new Set(["resume","cv","profile","summary","experience","education","skills","projects","contact","objective","about","professional","personal","career","work","portfolio"]);

function extractContact(text: string, lines: string[]) {
  const contact = { name: "", email: "", phone: "", location: "", linkedin: "", website: "" };

  const emailM = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailM) contact.email = emailM[0];

  const phoneM = text.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  if (phoneM) contact.phone = phoneM[0].trim();

  const liM = text.match(/linkedin\.com\/in\/([\w-]+)/i);
  if (liM) contact.linkedin = `linkedin.com/in/${liM[1]}`;

  const ghM = text.match(/github\.com\/([\w-]+)/i);
  if (ghM) contact.website = `github.com/${ghM[1]}`;

  // Name heuristic (same as outreach tool)
  for (const line of lines.slice(0, 10)) {
    if (line.length > 50 || line.includes("@") || /https?:\/\//i.test(line)) continue;
    if (/[&|:]/.test(line) || /^[\d\-\.\)\#]/.test(line)) continue;
    const wordsLower = line.toLowerCase().split(/\s+/);
    if (wordsLower.some((w) => SECTION_WORDS.has(w) || ORG_WORDS.has(w))) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[a-zA-Z.'-]+$/.test(w))) {
      contact.name = line;
      break;
    }
  }

  // Location: "City, State" or "City, Country" in first 20 lines
  for (const line of lines.slice(0, 20)) {
    if (line === contact.name || line.includes("@")) continue;
    if (/^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(line) && line.length < 40) {
      contact.location = line;
      break;
    }
  }

  return contact;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MON = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const YEAR = "\\d{4}";
const DATE_PAT = `(?:${MON}\\s+${YEAR}|${YEAR}(?:-\\d{2})?)`;
const DATE_RANGE = new RegExp(`(${DATE_PAT})\\s*(?:[-–—]|to)\\s*(${DATE_PAT}|present|current|now)`, "gi");

const MONTH_NUM: Record<string, string> = {
  jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
  jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12",
};

function normalizeDate(d: string): string {
  if (!d) return "";
  const lower = d.toLowerCase().trim();
  if (lower === "present" || lower === "current" || lower === "now") return "";
  const mY = d.match(new RegExp(`(${MON})\\s+(\\d{4})`, "i"));
  if (mY) {
    const m = MONTH_NUM[mY[1].toLowerCase().substring(0, 3)] || "01";
    return `${mY[2]}-${m}`;
  }
  const yOnly = d.match(/^(\d{4})(?:-(\d{2}))?$/);
  if (yOnly) return yOnly[2] ? `${yOnly[1]}-${yOnly[2]}` : yOnly[1];
  return d;
}

function parseDateRange(text: string): { start: string; end: string; current: boolean } {
  DATE_RANGE.lastIndex = 0;
  const m = DATE_RANGE.exec(text);
  DATE_RANGE.lastIndex = 0;
  if (!m) {
    const ys = text.match(/\b(\d{4})\b/g);
    return { start: ys?.[0] ?? "", end: ys?.[1] ?? "", current: false };
  }
  const endLower = m[2].toLowerCase();
  const isCurrent = endLower === "present" || endLower === "current" || endLower === "now";
  return { start: normalizeDate(m[1]), end: isCurrent ? "" : normalizeDate(m[2]), current: isCurrent };
}

// ─── Experience parser ───────────────────────────────────────────────────────

function parseExperiences(lines: string[]) {
  if (!lines.length) return [];

  // Split into entries: a new entry starts when a line contains a date range
  const entries: string[][] = [];
  let cur: string[] = [];
  const DATE_RE = new RegExp(DATE_PAT, "i");

  for (const line of lines) {
    const hasDate = DATE_RE.test(line);
    if (hasDate && cur.length > 0) {
      entries.push(cur);
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) entries.push(cur);

  return entries.map((elines) => {
    const entryText = elines.join("\n");
    const { start, end, current } = parseDateRange(entryText);

    const BULLET_RE = /^[•·\-\*▪◦→\+]|^\d+\./;
    const bulletIdx = elines.findIndex((l) => BULLET_RE.test(l));
    const headerLines = elines
      .slice(0, bulletIdx === -1 ? Math.min(3, elines.length) : bulletIdx)
      .filter((l) => !new RegExp(`^${DATE_PAT}$`, "i").test(l) && !/^\d{4}$/.test(l));

    let role = "", company = "";
    if (headerLines.length >= 2) {
      [role, company] = [headerLines[0], headerLines[1]];
    } else if (headerLines.length === 1) {
      const parts = headerLines[0].split(/\s*[\|@]\s*/);
      role = parts[0]?.trim() ?? "";
      company = parts[1]?.trim() ?? "";
    }

    const bullets = bulletIdx >= 0 ? elines.slice(bulletIdx) : [];
    const description = bullets
      .map((l) => l.replace(/^[•·\-\*▪◦→\+]\s*/, "").replace(/^\d+\.\s*/, ""))
      .join("\n");

    return { company, role, start_date: start, end_date: end, is_current: current, description };
  }).filter((e) => e.role || e.company);
}

// ─── Education parser ─────────────────────────────────────────────────────────

const DEGREE_RE = /\b(B\.?Tech|B\.?E\.?|B\.?Sc\.?|B\.?Com\.?|B\.?A\.?|BBA|BCA|M\.?Tech|M\.?E\.?|M\.?Sc\.?|M\.?Com\.?|M\.?A\.?|MBA|MCA|Ph\.?D\.?|Diploma|Bachelor|Master|Associate)\b/gi;

function parseEducations(lines: string[]) {
  if (!lines.length) return [];

  const entries: string[][] = [];
  let cur: string[] = [];
  for (const line of lines) {
    DEGREE_RE.lastIndex = 0;
    if (DEGREE_RE.test(line) && cur.length > 0) {
      entries.push(cur);
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) entries.push(cur);

  return entries.map((elines) => {
    const entryText = elines.join("\n");
    DEGREE_RE.lastIndex = 0;
    const degM = DEGREE_RE.exec(entryText);
    DEGREE_RE.lastIndex = 0;
    const degree = degM?.[0] ?? "";

    let fieldOfStudy = "";
    if (degree) {
      const fM = entryText.match(new RegExp(`${degree}\\s+(?:of\\s+|in\\s+)?([A-Za-z\\s]+?)(?:\\s*[-–,]|\\s*\\d{4}|$)`, "i"));
      if (fM) fieldOfStudy = fM[1].trim();
    }

    let institution = "";
    for (const line of elines) {
      DEGREE_RE.lastIndex = 0;
      if (!DEGREE_RE.test(line) && !/\d{4}/.test(line) && line.length > 3) {
        institution = line.trim();
        break;
      }
    }

    const { start, end, current } = parseDateRange(entryText);
    return { institution, degree, field_of_study: fieldOfStudy, start_date: start, end_date: end, is_current: current, description: "" };
  }).filter((e) => e.degree || e.institution);
}

// ─── Skills parser ───────────────────────────────────────────────────────────

const FALLBACK_SKILLS = ["Python","JavaScript","TypeScript","Java","SQL","React","Node.js","AWS","Docker","Kubernetes","Git","Machine Learning","Data Analysis","Figma","Canva","Photoshop","Google Analytics","SEO","SEM","Tableau","Power BI","MongoDB","PostgreSQL","MySQL","Redis","GraphQL","HTML","CSS","C++","C#","Swift","Kotlin","Flutter","Django","FastAPI","Spring","Angular","Vue.js","Pandas","NumPy","TensorFlow","PyTorch","Salesforce","HubSpot","Jira","Notion","Excel","Product Management","Marketing","Sales","Finance","Accounting","Communication","Leadership","Project Management","Social Media","Content Writing","Video Editing","Graphic Design"];

function parseSkills(sectionLines: string[], fullText: string) {
  const skills: Array<{ category: string; name: string; proficiency: string }> = [];

  for (const line of sectionLines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 40) {
      const category = line.slice(0, colonIdx).trim();
      const names = line.slice(colonIdx + 1).split(/[,;|·•]+/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 50);
      for (const name of names) skills.push({ category, name, proficiency: "" });
    } else {
      const items = line.split(/[,;|·•]+/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 50 && !/^\d+$/.test(s));
      for (const name of items) skills.push({ category: "Skills", name, proficiency: "" });
    }
  }

  if (skills.length === 0) {
    for (const skill of FALLBACK_SKILLS) {
      if (new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(fullText)) {
        skills.push({ category: "Skills", name: skill, proficiency: "" });
      }
    }
  }

  return skills;
}

// ─── Projects parser ─────────────────────────────────────────────────────────

function parseProjects(lines: string[]) {
  if (!lines.length) return [];

  const projects: Array<{ title: string; url: string; start_date: string; end_date: string; description: string }> = [];
  let cur: string[] = [];
  const BULLET_RE = /^[•·\-\*▪◦→\+]|^\d+\./;
  const DATE_RE = new RegExp(DATE_PAT, "i");

  for (const line of lines) {
    const isBullet = BULLET_RE.test(line);
    const hasDate = DATE_RE.test(line);
    if (!isBullet && !hasDate && cur.length > 0 && line.length < 80) {
      projects.push(buildProject(cur));
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) projects.push(buildProject(cur));

  return projects.filter((p) => p.title);
}

function buildProject(lines: string[]) {
  const text = lines.join("\n");
  const { start, end } = parseDateRange(text);
  const urlM = text.match(/https?:\/\/\S+/);
  const description = lines
    .slice(1)
    .map((l) => l.replace(/^[•·\-\*▪◦→\+]\s*/, "").replace(/^\d+\.\s*/, ""))
    .join("\n");
  return { title: lines[0] ?? "", url: urlM?.[0] ?? "", start_date: start, end_date: end, description };
}

// ─── Certifications parser ───────────────────────────────────────────────────

function parseCertifications(lines: string[]) {
  return lines
    .filter((l) => l.length > 3)
    .map((line) => {
      const dateM = line.match(/\b(\d{4})\b/);
      const name = line.replace(/\b\d{4}\b/, "").replace(/^[•·\-\*▪◦→\+]\s*/, "").trim();
      return { name, issuer: "", issue_date: dateM?.[1] ?? "", expiry_date: "", url: "" };
    })
    .filter((c) => c.name);
}
