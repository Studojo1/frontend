// Content slots are IST, whatever timezone the pod or the laptop is in. Without
// this, a slot typed as 10:30 in Bengaluru is stored as 10:30 UTC by a UTC pod
// and shows up on the calendar at 16:00.
//
// Run under several timezones:
//   for tz in UTC America/Los_Angeles Asia/Kolkata; do
//     TZ=$tz npx tsx app/lib/content/model.test.mjs
//   done
import assert from "node:assert";
import { istInputToIso, isoToIstInput } from "./model.ts";

assert.equal(istInputToIso("2026-09-25T10:30"), "2026-09-25T10:30:00+05:30");
assert.equal(
  new Date(istInputToIso("2026-09-25T10:30")).toISOString(),
  "2026-09-25T05:00:00.000Z",
  "10:30 IST is 05:00 UTC"
);

for (const v of [
  "2026-09-25T10:30",
  "2026-01-01T00:00",
  "2026-12-31T23:59",
  "2026-06-15T12:00",
]) {
  assert.equal(isoToIstInput(istInputToIso(v)), v, `round trip ${v}`);
}

assert.equal(isoToIstInput("2026-09-25T05:00:00.000Z"), "2026-09-25T10:30");
// Just after IST midnight: the date must roll forward, not back.
assert.equal(isoToIstInput("2026-09-24T18:31:00.000Z"), "2026-09-25T00:01");
// Exactly IST midnight: en-CA formats the hour as 24, datetime-local needs 00.
assert.equal(isoToIstInput("2026-09-24T18:30:00.000Z"), "2026-09-25T00:00");

assert.equal(istInputToIso(""), null);
assert.equal(istInputToIso(null), null);
assert.equal(istInputToIso("not a date"), null, "garbage is dropped, not stored");
assert.equal(isoToIstInput(null), "");

console.log(`content model (TZ=${process.env.TZ ?? "system"}): all assertions passed`);
