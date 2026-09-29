// stripDashes is the last line of defence for AI output (drafts sent to
// recruiters, chat answers, resume text). Pin its behaviour.
import assert from "node:assert/strict";
import { stripDashes, stripDashesDeep } from "./strip-dashes.ts";

const EM = "\u2014", EN = "\u2013";
const cases = [
  [`I built this ${EM} and it shipped.`, "I built this, and it shipped."],
  [`Quick question${EM}are you hiring?`, "Quick question, are you hiring?"],
  [`2${EN}5 years`, "2-5 years"],
  [`Rs 12${EN}18 LPA`, "Rs 12-18 LPA"],
  [`Pages 10 ${EM} 12`, "Pages 10-12"],
  [`Thanks ${EM}\nPriya`, "Thanks,\nPriya"],
  [`${EM} first point\n${EM} second`, "first point\nsecond"],
  [`It worked ${EM}.`, "It worked."],
  [`Done ${EM}`, "Done"],
  ["plain text - with a hyphen", "plain text - with a hyphen"],
  ["", ""],
];
for (const [input, want] of cases) assert.equal(stripDashes(input), want, JSON.stringify(input));
assert.equal(stripDashes(null), null);
assert.equal(stripDashes(undefined), undefined);
for (const [input] of cases) assert.ok(!/[\u2013\u2014]/.test(stripDashes(input)));
const deep = stripDashesDeep({ score: 72, tips: [`Tighten this ${EM} it rambles`], meta: { range: `2${EN}3`, ok: true }, none: null });
assert.deepEqual(deep, { score: 72, tips: ["Tighten this, it rambles"], meta: { range: "2-3", ok: true }, none: null });
console.log(`stripDashes: ${cases.length} cases pass, deep walk passes`);
