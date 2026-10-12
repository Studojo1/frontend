// The file picker step on phones: when a pick does not come back, the upload
// page says what happened instead of leaving an empty box.
//
// Checks the two rules, and that the upload page wires the picker the way the
// rules assume: the box is a label for the input (a tap anywhere opens it),
// the picker open is noted before it opens, and the note is cleared when a
// file or a cancel comes back.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PICKER_OPEN_KEY, pickerLooksStuck, reloadedWhilePicking } from "./resume-picker.ts";

const NOW = 1_760_000_000_000;
const MIN = 60_000;

// Chrome reloaded the tab while the picker was open: the note from just before
// is still there when the page loads again.
assert.equal(reloadedWhilePicking(String(NOW - 40_000), NOW), true);
assert.equal(reloadedWhilePicking(String(NOW - 14 * MIN), NOW), true);
// No note: an ordinary page load.
assert.equal(reloadedWhilePicking(null, NOW), false);
assert.equal(reloadedWhilePicking("", NOW), false);
// A stale note (the student left and came back much later) is not a reload.
assert.equal(reloadedWhilePicking(String(NOW - 16 * MIN), NOW), false);
// Rubbish or a clock that went backwards never shows the hint.
assert.equal(reloadedWhilePicking("not-a-number", NOW), false);
assert.equal(reloadedWhilePicking("0", NOW), false);
assert.equal(reloadedWhilePicking(String(NOW + 5_000), NOW), false);

// A second tap within 3 seconds with nothing back: the picker did not open.
assert.equal(pickerLooksStuck(NOW - 1_200, NOW), true);
assert.equal(pickerLooksStuck(NOW - 2_999, NOW), true);
// The first tap, or a tap after a file or a cancel (the page resets to 0).
assert.equal(pickerLooksStuck(0, NOW), false);
// A normal second try after looking through the picker.
assert.equal(pickerLooksStuck(NOW - 3_000, NOW), false);
assert.equal(pickerLooksStuck(NOW - 45_000, NOW), false);
assert.equal(pickerLooksStuck(NOW + 1_000, NOW), false);

const page = readFileSync(new URL("../../routes/outreach.onboarding.upload.tsx", import.meta.url), "utf8");
// The whole box is the control: a label tied to the input, no scripted click on it.
assert.match(page, /<label\s+htmlFor="file-input"/, "the drop zone must be a label for the file input");
assert.doesNotMatch(page, /getElementById\("file-input"\)\?\.click\(\)/, "the box must not open the picker from a click handler");
// The main button never sits disabled for want of a file.
assert.doesNotMatch(page, /disabled=\{!file \|\| uploading\}/, "the main button must pick a file when none is chosen");
// The open is noted, and cleared when something comes back.
assert.ok(page.includes("pickerNote.write(now)"), "the picker open must be noted before it opens");
assert.ok(page.includes('addEventListener("cancel"'), "a cancelled pick must be noticed");
assert.ok(page.split("pickerNote.clear()").length >= 4, "the note must be cleared on a file, on a cancel and on load");
// A file from any route (pick, drop, the /auth draft) clears the hint for good.
assert.match(page, /if \(file\) setPickHint\(null\)/, "a file must clear the hint whichever way it arrived");
assert.equal(PICKER_OPEN_KEY, "sj_resume_picker_open");

console.log("resume-picker: ok");
