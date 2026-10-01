import assert from "node:assert/strict";
import { callName } from "./call-name.ts";

assert.equal(callName("A J Mohamed Nihal"), "A J Mohamed Nihal");
assert.equal(callName("A. J. Mohamed Nihal"), "A. J. Mohamed Nihal");
assert.equal(callName("Ruchika Goel R"), "Ruchika");
assert.equal(callName("  Priya  "), "Priya");
assert.equal(callName(""), "");
assert.equal(callName(null), "");
console.log("call-name: ok");
