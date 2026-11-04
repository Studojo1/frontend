// LinkedIn's content analytics export (an .xlsx for the whole account over a period), read by
// fellow-analytics.server.ts. LinkedIn doesn't document the file, so these build workbooks in the layout
// it is known to use (Discovery, Engagement, Top posts, Followers, Demographics) and in ones it might, and
// check the reader finds the same numbers in each, reads dates the way the file writes them, refuses what
// isn't an export, and stops on a file that unpacks to something huge.
import assert from "node:assert/strict";
import JSZip from "jszip";
import { activityOf, AnalyticsFileError, NOT_AN_EXPORT, readAnalyticsExport } from "./fellow-analytics.server.ts";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const col = (i) => String.fromCharCode(65 + i);

/** A workbook from sheets of rows. A string cell is shared text, a number is a number. */
async function book(sheets, { inline = false } = {}) {
  const strings = [];
  const si = (s) => {
    let i = strings.indexOf(s);
    if (i < 0) { i = strings.length; strings.push(s); }
    return i;
  };
  const cell = (v, ref) => {
    if (v == null) return "";
    if (typeof v === "number") return `<c r="${ref}"><v>${v}</v></c>`;
    if (inline) return `<c r="${ref}" t="inlineStr"><is><t>${esc(v)}</t></is></c>`;
    return `<c r="${ref}" t="s"><v>${si(v)}</v></c>`;
  };
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types/>');
  zip.file("xl/workbook.xml", "<workbook/>");
  sheets.forEach((rows, k) => {
    const xml = rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => cell(v, `${col(ci)}${ri + 1}`)).join("")}</row>`).join("");
    zip.file(`xl/worksheets/sheet${k + 1}.xml`, `<?xml version="1.0"?><worksheet><sheetData>${xml}</sheetData></worksheet>`);
  });
  if (strings.length) zip.file("xl/sharedStrings.xml", `<sst>${strings.map((s) => `<si><t xml:space="preserve">${esc(s)}</t></si>`).join("")}</sst>`);
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
const refusedWith = async (file, message) => {
  await assert.rejects(() => readAnalyticsExport(file, NOW), (e) => e instanceof AnalyticsFileError && (!message || message.test(e.message)));
};

const NOW = Date.UTC(2026, 10, 3, 12);
const U1 = "https://www.linkedin.com/feed/update/urn:li:activity:7390000000000000001/";
const U2 = "https://www.linkedin.com/feed/update/urn:li:activity:7390000000000000002/";
const U3 = "https://www.linkedin.com/feed/update/urn:li:ugcPost:7390000000000000003/";
const DAYS = ["10/28/2026", "10/29/2026", "10/30/2026", "10/31/2026", "11/1/2026", "11/2/2026", "11/3/2026"];
const DISCOVERY = [["Overall Performance", "10/28/2026 - 11/3/2026"], ["Impressions", 3101], ["Members reached", 1227]];
const ENGAGEMENT = [["Date", "Impressions", "Engagements"], ...DAYS.map((d, i) => [d, 100 + i * 100, i])];
const TOP_POSTS = [
  ["Maximum of 50 posts available to include in this list"],
  [],
  ["Post URL", "Post publish date", "Engagements", null, "Post URL", "Post publish date", "Impressions"],
  [U1, "10/29/2026", 40, null, U2, "10/30/2026", 1500],
  [U2, "10/30/2026", 31, null, U1, "10/29/2026", 900],
  [null, null, null, null, U3, "9/15/2026", 12],
];
const FOLLOWERS = [["Total followers on 11/3/2026:", 845], [], ["Date", "New followers"], ...DAYS.map((d, i) => [d, i % 2])];
const DEMOGRAPHICS = [
  ["Top Demographics", "Value", "Percentage"],
  ["Job titles", "Student", "0.21"],
  ["Job titles", "Software Engineer & Intern", "< 1%"],
  ["Locations", "Pune", 0.28],
  ["Industries", "IT Services", "22%"],
];

// The layout LinkedIn's export uses.
let a = await readAnalyticsExport(await book([DISCOVERY, ENGAGEMENT, TOP_POSTS, FOLLOWERS, DEMOGRAPHICS]), NOW);
assert.deepEqual([a.periodStart, a.periodEnd], ["2026-10-28", "2026-11-03"], "the period, month first as the file writes it");
assert.deepEqual(a.totals, { impressions: 3101, membersReached: 1227, totalFollowers: 845, engagements: 21, newFollowers: 3 },
  "the totals given, and the ones the file gives only day by day, added up");
assert.equal(a.daily.length, 7);
assert.deepEqual(a.daily[0], { date: "2026-10-28", impressions: 100, engagements: 0, newFollowers: 0 }, "each day, from every sheet that has one");
assert.deepEqual(a.daily[6], { date: "2026-11-03", impressions: 700, engagements: 6, newFollowers: 0 });
assert.deepEqual(a.posts, [
  { url: U1, publishedOn: "2026-10-29", impressions: 900, engagements: 40 },
  { url: U2, publishedOn: "2026-10-30", impressions: 1500, engagements: 31 },
  { url: U3, publishedOn: "2026-09-15", impressions: 12, engagements: null },
], "both side-by-side lists, joined by link");
assert.deepEqual(a.demographics, {
  "Job titles": [{ value: "Student", pct: 0.21 }, { value: "Software Engineer & Intern", pct: 0.01 }],
  Locations: [{ value: "Pune", pct: 0.28 }],
  Industries: [{ value: "IT Services", pct: 0.22 }],
}, "0.21, 21% and 21 in a Percentage column are all the same; < 1% is kept as 1%");

// The same file with inline text, the sheets in another order, and day-first dates.
const dayFirst = (rows) => rows.map((r) => r.map((v) => (typeof v === "string" ? v.replace(/\b(\d{1,2})\/(\d{1,2})\/(2026)\b/g, "$2/$1/$3") : v)));
a = await readAnalyticsExport(await book([DEMOGRAPHICS, dayFirst(TOP_POSTS), dayFirst(DISCOVERY), dayFirst(ENGAGEMENT), dayFirst(FOLLOWERS)], { inline: true }), NOW);
assert.deepEqual([a.periodStart, a.periodEnd, a.totals.impressions, a.daily.length], ["2026-10-28", "2026-11-03", 3101, 7], "day first, settled by 28/10");
assert.equal(a.posts[0].publishedOn, "2026-10-29");

// Every date reads either way (1 to 7 November, or 11 January to 11 July): the reading nearest the upload wins.
const early = ["11/1/2026", "11/2/2026", "11/3/2026", "11/4/2026", "11/5/2026", "11/6/2026", "11/7/2026"];
a = await readAnalyticsExport(await book([[["Overall Performance", "11/1/2026 - 11/7/2026"], ["Impressions", 50]], [["Date", "Impressions"], ...early.map((d) => [d, 7])]]), Date.UTC(2026, 10, 8));
assert.deepEqual([a.periodStart, a.periodEnd, a.daily[6].date], ["2026-11-01", "2026-11-07", "2026-11-07"]);
a = await readAnalyticsExport(await book([[["Overall Performance", "1/11/2026 - 7/11/2026"], ["Impressions", 50]]]), Date.UTC(2026, 10, 8));
assert.deepEqual([a.periodStart, a.periodEnd], ["2026-11-01", "2026-11-07"], "1/11 to 7/11, uploaded on 8 November, is November");

// Dates as spreadsheet numbers, a period written in words, and totals only day by day.
a = await readAnalyticsExport(await book([[["Date", "Impressions", "New followers"], [46323, 10, 1], [46324, 20, 0]]]), NOW);
assert.deepEqual([a.periodStart, a.periodEnd, a.totals.impressions, a.totals.newFollowers], ["2026-10-28", "2026-10-29", 30, 1], "the period from the days");
a = await readAnalyticsExport(await book([[["Overall performance", "Oct 28, 2026 - Nov 3, 2026"], ["Impressions", "3,101"]]]), NOW);
assert.deepEqual([a.periodStart, a.periodEnd, a.totals.impressions], ["2026-10-28", "2026-11-03", 3101]);

// A demographics section, a count beside a category, and odd case and spacing.
a = await readAnalyticsExport(await book([[["  IMPRESSIONS ", 10], [], ["Seniority"], ["Entry", "60%"], ["Comments", 4], [], ["Location", "Pune", "12%"]]]), NOW);
assert.deepEqual(a.demographics, { Seniority: [{ value: "Entry", pct: 0.6 }], Location: [{ value: "Pune", pct: 0.12 }] });
assert.deepEqual(a.totals, { impressions: 10, comments: 4 }, "Comments 4 under a category isn't a share of anything");

// Refused: not a zip, a zip that isn't a workbook, a workbook with no impressions, impossible numbers.
await refusedWith(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), /LinkedIn's analytics export/);
await refusedWith(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5]));
const notBook = new JSZip();
notBook.file("word/document.xml", "<w/>");
await refusedWith(await notBook.generateAsync({ type: "uint8array" }));
await refusedWith(await book([[["Members reached", 800], ["Reactions", 3]]]), new RegExp(NOT_AN_EXPORT.slice(0, 40)));
await refusedWith(await book([[["Impressions", 60_000_000]]]), /don't look right/);
await refusedWith(await book([[["Impressions", 100]], [["Date", "New followers"], ["10/28/2026", -1]]]), /don't look right/);

// A small file that unpacks to something huge stops at 16 MB a sheet.
const bomb = new JSZip();
bomb.file("xl/worksheets/sheet1.xml", `<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Impressions</t></is></c><c r="B1"><v>5</v></c></row></sheetData>${" ".repeat(17 * 1024 * 1024)}</worksheet>`);
const bombFile = await bomb.generateAsync({ type: "uint8array", compression: "DEFLATE" });
assert.ok(bombFile.length < 100_000, "the test file is small");
await refusedWith(bombFile);

// The activity number that names a post, from either kind of link.
assert.equal(activityOf("https://www.linkedin.com/posts/asha-k_some-words-activity-7254000000000000001-AbCd"), "7254000000000000001");
assert.equal(activityOf(U1), "7390000000000000001");
assert.equal(activityOf(U3), null, "a ugcPost number isn't an activity number");
assert.equal(activityOf(null), null);

console.log("fellow-analytics: ok");
