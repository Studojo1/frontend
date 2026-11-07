import assert from "node:assert/strict";
import { hitToPick, modelPicks, rankByWords, searchQuery, spread, stockById, stockFor, stockSearch, stockWords } from "./fellow-stock.server.ts";
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

// The fellow's own search: library matches first, then the photo directory's own results, only usable ones.
const UUID = "6adcab40-54a1-4192-ada8-96968da73762";
const hit = (o) => ({ id: UUID, title: "Chai cup", url: "https://pd.w.org/2024/01/chai.jpg", license: "cc0", source: "wordpress", ...o });
assert.equal(hitToPick(hit()).thumb, `https://api.openverse.org/v1/images/${UUID}/thumb/`, "a small copy for the grid");
assert.equal(hitToPick(hit({ source: "flickr" })), null, "only the WordPress Photo Directory");
assert.equal(hitToPick(hit({ license: "by" })), null, "only public domain");
assert.equal(hitToPick(hit({ url: "https://evil.example/chai.jpg" })), null, "only pictures on pd.w.org");
assert.equal(hitToPick(hit({ id: "../x" })), null, "odd ids are refused");
assert.equal(searchQuery("  Chai & laptop!! <script>  "), "chai laptop script", "letters only");
const found = await stockSearch("chai laptop", async () => [hit(), hit({ id: "6adcab40-54a1-4192-ada8-96968da73763", source: "flickr" })]);
assert.ok(found.length >= 2 && found.length <= 12, "library matches and live results together");
assert.ok(found.some((p) => p.id === UUID), "the live result is in");
assert.ok(!found.some((p) => p.id.endsWith("763")), "the unusable one isn't");
assert.ok((await stockSearch("chai desk", async () => { throw new Error("down"); })).length > 0, "the library still answers when Openverse is down");
assert.deepEqual(await stockSearch("  !!  ", async () => [hit()]), [], "an empty search finds nothing");

// The chosen photo is looked up again: the library, or Openverse by id. The page's copy is never trusted.
assert.equal((await stockById(LIBRARY[0].id, async () => { throw new Error("not called"); })).src, LIBRARY[0].src);
assert.equal((await stockById(UUID, async () => hit())).src, "https://pd.w.org/2024/01/chai.jpg");
assert.equal(await stockById(UUID, async () => hit({ license: "by" })), null);
assert.equal(await stockById(UUID, async () => null), null);
assert.equal(await stockById("../../etc", async () => hit()), null);

console.log("fellow-stock: ok");
