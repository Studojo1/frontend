import assert from "node:assert/strict";
import { picksFrom, stockQueries, suggestedQueries } from "./fellow-stock.server.ts";

// Search words come from what the photo idea says is in the picture: no filler, no college or city names.
const q = stockQueries("A candid photo of her working on her laptop on the Christ University campus.", "studojo");
assert.equal(q[0], "working laptop campus", "names and filler are dropped");
assert.ok(q.includes("laptop work"), "safe everyday scenes follow");
assert.equal(stockQueries(null, "personal")[0], "student desk", "no photo idea still finds something");
assert.equal(stockQueries("x", "studojo", ["Hands Typing, Laptop!"])[0], "hands typing laptop", "the model's phrases come first, cleaned");

// Only StockSnap's public-domain photos, wider than tall, and never one person on their own.
const hit = (o) => ({ id: "be2d15cc-89b8-4041-bfb3-65ea646b2ef0", title: "Laptop Work", url: "https://cdn.stocksnap.io/img-thumbs/960w/AB12CD34EF.jpg", width: 5000, height: 3000, license: "cc0", tags: [], ...o });
assert.equal(picksFrom([hit()]).length, 1);
assert.equal(picksFrom([hit({ url: "https://evil.example/img-thumbs/960w/AB12CD34EF.jpg" })]).length, 0, "other hosts are refused");
assert.equal(picksFrom([hit({ url: "http://cdn.stocksnap.io/img-thumbs/960w/AB12CD34EF.jpg" })]).length, 0, "https only");
assert.equal(picksFrom([hit({ license: "by" })]).length, 0, "pictures that need a credit are left out");
assert.equal(picksFrom([hit({ width: 3000, height: 5000 })]).length, 0, "tall pictures are left out");
assert.equal(picksFrom([hit({ title: "Girl Woman" })]).length, 0, "portraits are left out");
assert.equal(picksFrom([hit({ tags: [{ name: "father" }] })]).length, 0, "so are family photos, by their tags");
assert.equal(picksFrom([hit({ id: "../x" })]).length, 0, "odd ids are refused");

// The model's phrases: at most three, no portraits, and nothing at all if it fails.
assert.deepEqual(await suggestedQueries({ photoIdea: "x", title: "y" }, async () => '{"queries":["college library","woman smiling","team whiteboard","desk"]}'), ["college library", "team whiteboard", "desk"]);
assert.deepEqual(await suggestedQueries({ photoIdea: "x", title: "y" }, async () => { throw new Error("down"); }), []);
assert.deepEqual(await suggestedQueries({ photoIdea: "x", title: "y" }, async () => "not json"), []);

console.log("fellow-stock: ok");
