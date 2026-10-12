// Parts of F14: parsing chip or typed answers into quiz fields, and the
// three questions plus the builder for a new mission (Mission 3).
import type { StepSpec } from "../../core/flow-types";
import { CITIES, monthLabel, RIYA_QUIZ, roleById, START_MONTHS } from "../../data";
import type { AppState, Mission, QuizAnswers } from "../../types";

type CityId = QuizAnswers["cities"][number];
type RoleId = NonNullable<QuizAnswers["role"]>;

/** Cities and remote from an answer like "Mumbai, Bengaluru and remote". */
export function parseCities(answer: string, fallback: CityId[]): Pick<QuizAnswers, "cities" | "remote"> {
  const t = answer.toLowerCase().replace("bangalore", "bengaluru");
  const cities = CITIES.filter((c) => t.includes(c.id) || t.includes(c.label.toLowerCase())).map((c) => c.id as CityId);
  const remote = /remote|anywhere/.test(t);
  return { cities: cities.length || remote ? cities : fallback, remote };
}

/** A START_MONTHS id from "Jul 2027", "June 2027" or "flexible". */
export function parseMonth(answer: string, fallback: string): string {
  const t = answer.toLowerCase();
  if (/flex|any ?time|whenever/.test(t)) return "flexible";
  const hit = START_MONTHS.find((m) => t.includes(m.label.toLowerCase()) || t.includes(m.label.toLowerCase().slice(0, 3)));
  return hit ? hit.id : fallback;
}

/** A company stage stop from "Seed", "Series A to B" or "Any size". */
export function parseSize(answer: string, fallback: QuizAnswers["stage"]): QuizAnswers["stage"] {
  const t = answer.toLowerCase();
  if (/any|no preference|all/.test(t)) return null;
  if (/tiny|pre-seed|preseed/.test(t)) return 0;
  if (/seed|small/.test(t)) return 1;
  if (/series|mid/.test(t)) return 2;
  if (/growth/.test(t)) return 3;
  if (/large|big|mnc/.test(t)) return 4;
  return fallback;
}

function parseRole(answer: string): RoleId {
  const t = answer.toLowerCase();
  if (/product|apm|pm\b/.test(t)) return "product";
  if (/growth|marketing/.test(t)) return "growth";
  if (/data|analyst/.test(t)) return "data";
  if (/design|ux/.test(t)) return "design";
  if (/front/.test(t)) return "frontend";
  return "sde";
}

/** The three questions for a new mission. Prefilled from memory where it can. */
export const NEW_MISSION_ASKS: StepSpec[] = [
  {
    skill: "scout",
    label: "Asked what role",
    ms: 500,
    ask: {
      text: "A new mission is one more search with its own budget. Three quick questions. First: what role?",
      chips: [
        { label: "Product (APM)", answer: "Product", tone: "primary" },
        { label: "Growth and marketing", answer: "Growth and marketing" },
        { label: "Software engineering", answer: "Software engineering" },
      ],
    },
  },
  {
    skill: "scout",
    label: "Asked where",
    ms: 500,
    ask: {
      text: "Which cities? The first option is what your memory says.",
      chips: [
        { label: "Pune, Bengaluru or remote", answer: "Pune, Bengaluru and remote", tone: "primary" },
        { label: "Mumbai", answer: "Mumbai" },
        { label: "Remote only", answer: "Remote only" },
      ],
    },
  },
  {
    skill: "scout",
    label: "Asked when",
    ms: 500,
    ask: {
      text: "Last one: when can you start?",
      chips: [
        { label: "May 2027", answer: "May 2027", tone: "primary" },
        { label: "Jul 2027", answer: "Jul 2027" },
        { label: "Flexible", answer: "Flexible" },
      ],
    },
  },
];

/** Mission 3 from the three answers. A draft with no pack: nothing is sent. */
export function newMission(s: AppState, answers: string[]): Mission {
  const [roleA = "", cityA = "", monthA = ""] = answers.slice(-3);
  const role = parseRole(roleA);
  const startMonth = parseMonth(monthA, "2027-05");
  const where = parseCities(cityA, ["pune", "bengaluru"]);
  const small = s.memory.some((m) => m.id === "m-small");
  const target: QuizAnswers = { ...RIYA_QUIZ, role, ...where, startMonth, stage: small ? 1 : 2, jobType: "internship", card: 0 };
  const short = `${monthLabel(startMonth)} internship`;
  const jan = s.missions.find((m) => m.id === "jan27");
  return {
    id: "m3",
    name: `${short} · ${roleById(role).label}`,
    short,
    accent: "pink",
    status: "draft",
    target,
    pack: null,
    toppedUp: false,
    total: 0,
    notch: 1,
    approvals: 0,
    lens: jan ? [...jan.lens] : [],
    fitFloor: 75,
    neverContact: [],
  };
}
