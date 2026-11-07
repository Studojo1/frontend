import assert from "node:assert/strict";
import { modelPicks, rankByWords, spread, stockFor, stockWords } from "./fellow-stock.server.ts";
import LIBRARY from "./fellow-stock-library.json" with { type: "json" };

// The library: public-domain photos from the WordPress Photo Directory, each vetted and described once.
assert.ok(LIBRARY.length >= 200, "a library big enough to pick from");
for (const p of LIBRARY) {
  assert.match(p.src, /^https:\/\/pd\.w\.org\/.+\.jpe?g$/i, `${p.id} comes from the WordPress Photo Directory`);
  assert.ok(p.desc.length > 5 && Array.isArray(p.tags), `${p.id} is described`);
}
assert.equal(new Set(LIBRARY.map((p) => p.id)).size, LIBRARY.length, "no photo twice");

// Words come from what the photo idea says is in the picture: no filler, no college or city names.
const w = stockWords("A candid photo of her working on her laptop on the Christ University campus.", "studojo");
assert.deepEqual(w.slice(0, 3), ["working", "laptop", "campus"], "names and filler are dropped");
assert.ok(stockWords(null, "personal").includes("chai"), "no photo idea still finds something");

const lib = [
  { id: "a", src: "https://pd.w.org/a.jpg", w: 1, h: 1, desc: "A cup of chai on a desk", tags: ["chai", "desk"], indian: true },
  { id: "b", src: "https://pd.w.org/b.jpg", w: 1, h: 1, desc: "A laptop on a desk", tags: ["laptop", "desk"], indian: false },
  { id: "c", src: "https://pd.w.org/c.jpg", w: 1, h: 1, desc: "A train at a station", tags: ["train"], indian: true },
];
assert.deepEqual(rankByWords(["laptop", "desk"], lib).map((p) => p.id), ["b", "a"], "best match first, unrelated left out");

// The model answers with library numbers: unknown numbers are skipped, and a failure means no picks.
assert.deepEqual((await modelPicks({ photoIdea: "x", title: "y" }, async () => '{"picks":[3,99,1,3]}', lib)).map((p) => p.id), ["c", "a"]);
assert.deepEqual(await modelPicks({ photoIdea: "x", title: "y" }, async () => { throw new Error("down"); }, lib), []);
assert.deepEqual(await modelPicks({ photoIdea: "x", title: "y" }, async () => "not json", lib), []);

// Similar posts for different fellows don't all lead with the same picture.
assert.deepEqual(spread([1, 2, 3, 4, 5], "x").length, 5);
assert.ok(new Set(["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => spread([1, 2, 3, 4], s)[0])).size > 1, "different posts start in different places");

// With the model down, the photo idea's words still pick from the real library.
const picks = await stockFor({ id: 1, photoIdea: "A photo of your desk with your laptop and notes", title: "t", kind: "personal" }, async () => { throw new Error("down"); });
assert.ok(picks.length >= 3 && picks.length <= 6, "a handful of pictures");
assert.ok(picks.every((p) => LIBRARY.some((x) => x.id === p.id && x.src === p.src)), "only library pictures are offered");

console.log("fellow-stock: ok");
