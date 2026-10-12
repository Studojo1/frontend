// Small helpers shared by the Go stages (pack, connect, launch, mission).
// Owned by builder D. Pure functions only: safe on the server.
import { MATCHES, packById, TOP_UP, type Match } from "../../data";
import type { FlowData, PackId, VisibilityState } from "../../types";

/** Emails in the chosen pack, plus a top-up if the student took one. 0 for Free. */
export function totalOutreaches(d: FlowData): number {
  const p = packById(d.pack);
  if (!p || p.id === "free") return 0;
  return p.outreaches + (d.mission.toppedUp ? TOP_UP.outreaches : 0);
}

/** True when the pack sends emails (anything but Free or nothing chosen). */
export const sendsEmail = (pack: PackId | null) => pack !== null && pack !== "free";

/** Who can see the page, in a few plain words. */
export function visibilitySummary(v: VisibilityState): string {
  if (!v.link || !v.adult) return "Private: only you";
  const parts = ["Anyone with the link"];
  if (v.search) parts.push("search engines");
  if (v.managers) parts.push("hiring managers Studojo shows you to");
  if (parts.length === 1) return "Link-only, not in search";
  return parts.length === 2 ? `${parts[0]} and ${parts[1]}` : `${parts[0]}, ${parts[1]} and ${parts[2]}`;
}

/** The page can be public only with the link on and the 18+ check ticked. */
export const pageIsPublic = (v: VisibilityState) => v.link && v.adult;

export const matchById = (id: string): Match | undefined => MATCHES.find((m) => m.id === id);

/** A deterministic receipt reference for the mock payment. */
export function mockReceiptRef(pack: PackId): string {
  const code: Record<PackId, string> = { free: "FR", starter: "ST", standard: "SD", pro: "PR" };
  return `MOCK-${code[pack]}-7K2`;
}

/** Points along a quadratic curve from a to b, bending through c. For keyframes. */
export function curvePoints(
  a: { x: number; y: number },
  c: { x: number; y: number },
  b: { x: number; y: number },
  steps = 8,
): { xs: number[]; ys: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    xs.push(u * u * a.x + 2 * u * t * c.x + t * t * b.x);
    ys.push(u * u * a.y + 2 * u * t * c.y + t * t * b.y);
  }
  return { xs, ys };
}
