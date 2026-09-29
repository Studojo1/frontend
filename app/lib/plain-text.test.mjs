import assert from "node:assert/strict";
import { plainText } from "./plain-text.ts";

assert.equal(plainText("<p>Knacks is <strong>hiring</strong> &amp; paying.</p><p>Apply now</p>"), "Knacks is hiring & paying. Apply now");
assert.equal(plainText(null), "");
const long = plainText(`<p>${"word ".repeat(100)}</p>`, 160);
assert.ok(long.length <= 160 && long.endsWith("…") && !long.includes("<"));
console.log("plain-text: ok");
