/**
 * Parse GitHub's public contribution calendar
 * (https://github.com/users/<handle>/contributions).
 *
 * Each day is a <td data-date="YYYY-MM-DD" data-level="0-4"
 * id="contribution-day-component-<weekday>-<week>">, and its count lives in a
 * <tool-tip for="<that id>">N contributions on ...</tool-tip>. We return the
 * grid as weeks of seven levels (Sunday first), padded with -1 for days
 * outside the range, plus the year's total.
 */

export type Contributions = {
  total: number;
  /** weeks[w][d]: level 0-4, or -1 where the calendar has no cell. */
  weeks: number[][];
  /** First date in the grid (YYYY-MM-DD), for month labels. */
  start: string | null;
};

export function parseContributions(html: string): Contributions | null {
  const cells = new Map<string, { week: number; day: number; level: number; date: string }>();
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g)) {
    const tag = m[0];
    const id = tag.match(/\bid="contribution-day-component-(\d+)-(\d+)"/);
    const level = tag.match(/\bdata-level="(\d)"/);
    if (!id || !level) continue;
    cells.set(`contribution-day-component-${id[1]}-${id[2]}`, {
      day: Number(id[1]),
      week: Number(id[2]),
      level: Math.min(4, Number(level[1])),
      date: m[1],
    });
  }
  if (cells.size === 0) return null;

  let total = 0;
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([\d,]+) contributions?/g)) {
    if (cells.has(m[1])) total += Number(m[2].replace(/,/g, ""));
  }

  const weekCount = Math.max(...[...cells.values()].map((c) => c.week)) + 1;
  const weeks = Array.from({ length: weekCount }, () => Array(7).fill(-1) as number[]);
  let start: string | null = null;
  for (const c of cells.values()) {
    if (c.day > 6) continue;
    weeks[c.week][c.day] = c.level;
    if (!start || c.date < start) start = c.date;
  }
  return { total, weeks, start };
}
