// Splits the project text into plain runs and highlighted runs (numbers,
// tools, outcomes) for the live highlighter behind the textarea. The word
// lists mirror scoreSpecificity in data-quiz.ts, so what lights up is what
// the meter counts. Owned by builder A (You).

export type MarkKind = "number" | "tool" | "outcome";

export interface Run {
  text: string;
  kind: MarkKind | null;
}

const TOOLS = [
  "react", "node.js", "node", "typescript", "javascript", "python", "pandas", "sql", "postgresql", "postgres", "mongodb",
  "java", "kotlin", "swift", "flutter", "django", "flask", "fastapi", "docker", "kubernetes", "tensorflow",
  "pytorch", "excel", "tableau", "power bi", "go", "rust", "c++", "next.js", "express", "spring", "git", "aws",
  "linux", "redis", "graphql", "html", "css", "scikit", "numpy", "spark", "r",
];

const OUTCOMES = [
  "cut", "grew", "grow", "increased", "reduced", "saved", "used by", "adopted", "launched", "shipped", "won",
  "up", "down", "raised", "improved", "doubled", "halved", "users", "downloads", "revenue", "faster", "first place",
];

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const words = (list: string[]) => list.sort((a, b) => b.length - a.length).map(esc).join("|");

// Whole words only, so "good" is not Go and "update" is not "up".
const PATTERN = new RegExp(
  `(\\d(?:[\\d,.]*\\d)?(?:\\s?%)?)|(?<![a-z0-9])(${words([...TOOLS])})(?![a-z0-9])|(?<![a-z0-9])(${words([...OUTCOMES])})(?![a-z0-9])|(%)`,
  "gi",
);

export function highlightRuns(text: string): Run[] {
  const runs: Run[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const at = m.index ?? 0;
    if (m[0].length === 0) continue;
    if (at > last) runs.push({ text: text.slice(last, at), kind: null });
    const kind: MarkKind = m[1] || m[4] ? "number" : m[2] ? "tool" : "outcome";
    runs.push({ text: m[0], kind });
    last = at + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), kind: null });
  return runs;
}

export const MARK_STYLE: Record<MarkKind, { bg: string; label: string }> = {
  number: { bg: "#fde68a", label: "Number" },
  tool: { bg: "#99f6e4", label: "Tool" },
  outcome: { bg: "#bbf7d0", label: "Outcome" },
};
