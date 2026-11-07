(function () {
  "use strict";
  // A fellow's own page. The data comes from /api/fellowship-growth/<slug> and
  // every change is saved there; the server answers with the fresh view.
  const SLUG = (location.pathname.split("/").filter(Boolean)[1] || "").toLowerCase();
  const API = "/api/fellowship-growth/" + encodeURIComponent(SLUG);

  async function call(body) {
    const opts = { headers: { Accept: "application/json" } };
    if (body) Object.assign(opts, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return send(API, opts);
  }
  async function send(url, opts) {
    let res;
    try { res = await fetch(url, Object.assign({ credentials: "omit", cache: "no-store" }, opts)); } catch (e) { throw new Error("You seem to be offline. Check your connection and try again."); }
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      const err = new Error((data && data.error) || "Something went wrong. Please try again.");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function showProblem(title, text) {
    const page = document.getElementById("page");
    if (!page) return;
    page.className = "page page-message";
    page.innerHTML = '<section class="card card-pad message-card"><h1 class="card-title"></h1><p class="card-sub"></p></section>';
    page.querySelector("h1").textContent = title;
    page.querySelector("p").textContent = text;
    // Nothing left on the page to jump to: the logo stops being a link and the week pill goes.
    const brand = document.querySelector("a.brand");
    if (brand) { brand.removeAttribute("href"); brand.removeAttribute("aria-label"); }
    const pill = document.getElementById("week-pill");
    if (pill) pill.hidden = true;
  }

  const LOAD_FAILED = "We couldn't load your page";
  call().then((D) => {
    try { boot(D); } catch (e) { showProblem(LOAD_FAILED, "Something went wrong on our side. Please refresh the page in a minute."); }
  }, (e) => {
    if (e && e.status === 404) { showProblem("This link isn't working", "Check you opened the whole link from your message. If it still doesn't open, ask the Studojo team on WhatsApp for your link."); return; }
    // The server's message can repeat the title; then the plain next step reads better.
    const msg = e && e.message ? e.message : "";
    showProblem(LOAD_FAILED, msg && !msg.startsWith(LOAD_FAILED) ? msg : "Something went wrong on our side. Please try again in a minute.");
  });

  function boot(D) {
  const P = D.program, ME = D.me;
  const TODAY = P.today;
  const LABEL = P.partnershipLabel;

  /* ---------- helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = (n) => Number(n).toLocaleString("en-US");
  const ic = (name, cls) => `<svg class="ic ${cls || ""}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DOWL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const parseD = (s) => { const [y, m, d] = s.slice(0, 10).split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = parseD(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 86400000);
  const fmt = (s, dow = true) => { const d = parseD(s); return (dow ? DOW[d.getUTCDay()] + " " : "") + d.getUTCDate() + " " + MON[d.getUTCMonth()]; };
  const dowLong = (s) => DOWL[parseD(s).getUTCDay()];
  const timeOf = (t) => { let [h, m] = t.slice(11, 16).split(":").map(Number); const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + ap; };
  const relDay = (s) => { const n = diffDays(s, TODAY); return n === 0 ? "today" : n === 1 ? "yesterday" : "on " + fmt(s); };
  const plural = (n, one, many) => n + " " + (n === 1 ? one : (many || one + "s"));
  const shortUrl = (u) => String(u || "").replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const allPosts = (n, word) => (n === 1 ? "Your post is " : "All " + n + " posts are ") + word;
  // The server's LINKEDIN_POST (app/lib/fellow-view.ts): keep the two identical.
  const LINK_OK = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.|www\.)?linkedin\.com\/(?:posts|feed\/update)\/[^\s<>"'?#/][^\s<>"']*$/i;

  /* ---------- state (local only, nothing is sent anywhere) */
  const S = {
    posts: ME.thisWeek.posts.map((p) => ({
      id: p.id, day: p.day, date: p.date, kind: p.kind, title: p.title, body: p.body,
      status: p.status, copied: !!p.copiedAt, ownLine: p.ownLine || "", postedAt: p.postedAt,
      url: p.url, metrics: p.metrics, numbersDue: p.numbersDue || null, analyticsAt: p.analyticsAt || null,
      photoIdea: p.photoIdea || "", photos: p.photos || [], photoHelp: !!p.photoHelp,
      yourVersion: p.yourVersion || null, versionReply: p.versionReply || null, showVersion: false, rewriteDraft: null,
      panel: null, expanded: false, err: "", draft: null, lineDraft: null,
    })),
    conn: { now: ME.connections.now, atJoin: ME.connections.atJoin, history: ME.connections.history.slice(), editing: false, err: "" },
    stories: ME.stories.slice(),
    promptIdx: 0, listening: false, spoke: false, storyErr: "",
    howto: false,
    stock: {}, stockFocus: null,
  };
  const byId = (id) => S.posts.find((p) => p.id === id);
  // Your activity: the one earlier post with a panel open ("numbers" or "posted"), and what's typed in it.
  S.histOpen = null; S.histKind = null; S.histErr = ""; S.histDraft = null; S.histUrl = "";
  const missedById = (id) => ME.history.flatMap((w) => w.missed || []).find((m) => m.id === id);

  // The server's answer to every change is the whole fresh view: fold it into the page's state.
  // If the day or this week's posts changed since the page loaded (a new week, or the team added
  // or removed a post), the page's layout no longer fits: it reloads, and this returns false so
  // the caller stops. The change itself is already saved.
  function applyView(v) {
    const M = v.me;
    const ids = (list) => list.map((p) => p.id).sort().join();
    const held = (list) => list.filter((p) => p.status === "blocked").map((p) => p.id).sort().join();
    if (v.program.today !== TODAY || ids(M.thisWeek.posts) !== ids(S.posts) || held(M.thisWeek.posts) !== held(S.posts)) { location.reload(); return false; }
    for (const sp of M.thisWeek.posts) {
      const p = byId(sp.id);
      if (p) Object.assign(p, { status: sp.status, copied: !!sp.copiedAt, ownLine: sp.ownLine || "", postedAt: sp.postedAt, url: sp.url, metrics: sp.metrics, numbersDue: sp.numbersDue || null, analyticsAt: sp.analyticsAt || null,
        photoIdea: sp.photoIdea || "", photos: sp.photos || [], photoHelp: !!sp.photoHelp, yourVersion: sp.yourVersion || null, versionReply: sp.versionReply || null });
    }
    ME.thisWeek.due = M.thisWeek.due;
    Object.assign(ME, {
      weeklyRun: M.weeklyRun, completedWeeks: M.completedWeeks, milestones: M.milestones, history: M.history,
      cohortPosition: M.cohortPosition, cohortPostedThisWeek: M.cohortPostedThisWeek, cohortSize: M.cohortSize, cohortFeed: M.cohortFeed,
      analytics: M.analytics,
    });
    S.conn.now = M.connections.now; S.conn.atJoin = M.connections.atJoin; S.conn.history = M.connections.history.slice();
    S.stories = M.stories.slice();
    renderLearn();
    ME.storyPrompts = M.storyPrompts;
    return true;
  }
  // A post on hold ('blocked') is being fixed by the team: it's shown as a notice, never due, next or counted.
  const onHold = (p) => p.status === "blocked";
  const counted = () => S.posts.filter((p) => !onHold(p));
  const postedCount = () => S.posts.filter((p) => p.status === "posted").length;
  const weekDone = () => ME.thisWeek.due > 0 && postedCount() >= ME.thisWeek.due;
  const run = () => ME.weeklyRun + (weekDone() ? 1 : 0);
  const doneWeeks = () => ME.completedWeeks + (weekDone() ? 1 : 0);
  const nextPost = () => counted().sort((a, b) => a.date.localeCompare(b.date)).find((p) => p.status !== "posted");
  // Feed order is fixed at load: what to do next first, then what is already posted.
  const rank = (p) => (p.status === "posted" ? 2 : onHold(p) ? 1 : 0);
  const ORDER = S.posts.slice().sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    const pa = a.status === "posted", pb = b.status === "posted";
    if (pa !== pb) return pa ? 1 : -1;
    return pa ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  }).map((p) => p.id);

  // No partnership line on posts (the founder, 5 Nov 2026: fellows are part of the fellowship, so a Studojo
  // post reads as their own). An older post that still opens with the line has it taken off here.
  const bodyOf = (p) => (p.kind === "studojo" && LABEL && p.body.startsWith(LABEL) ? p.body.slice(LABEL.length).replace(/^\s+/, "") : p.body);
  function postText(p) {
    return [p.ownLine, bodyOf(p)].filter(Boolean).join("\n\n");
  }
  function postHTML(p) {
    const body = bodyOf(p);
    const parts = [];
    if (p.ownLine) parts.push(`<mark class="own" title="Your line">${esc(p.ownLine)}</mark>`);
    parts.push(esc(body));
    return parts.join("\n\n");
  }

  /* ---------- top bar + week range */
  const NO_POSTS = ME.paused ? "No posts while your fellowship is paused." : "No posts for you this week yet.";
  function renderTop() {
    const n = postedCount(), due = ME.thisWeek.due;
    // With no posts this week the edition card says so; the heading over the posts would only say it again.
    $(".feed-head").hidden = !S.posts.length;
    if (!due) {
      $("#week-pill").innerHTML = `<span>${ME.paused ? "Paused" : "This week: no posts yet"}</span>`;
      $("#week-pill").setAttribute("aria-label", NO_POSTS);
      $("#feed-help").textContent = "The team is updating this week's posts. They'll show here when they're ready.";
      return;
    }
    const dots = counted().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<i class="${p.status === "posted" ? "on" : ""}"></i>`).join("");
    $("#week-pill").innerHTML = `<span class="segs" aria-hidden="true">${dots}</span><span>This week: <b>${n} of ${due}</b> posted</span>`;
    $("#week-pill").setAttribute("aria-label", `This week: ${n} of ${due} posted. ${n < due ? "Go to your next post" : "All posts done"}`);
    $("#feed-help").textContent = n >= due
      ? `${allPosts(due, "out")} this week. On Sunday, upload each one's analytics from LinkedIn.`
      : "As they will look on LinkedIn. Add your own photo to each post, then tap Post on LinkedIn: it copies the post and opens LinkedIn. Add the photo there too, and paste the text if it isn't filled in. You post it yourself: Studojo never posts for you.";
  }

  /* ---------- LinkedIn analytics: once a week, LinkedIn's analytics export for the fellow's whole account
     (an .xlsx). Saved privately; only this page and the Studojo team can open it. Each post listed in it that
     has its link here gets its impressions from it, so nothing needs typing. */
  const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  // Any post on the page: this week's, last weeks' posted ones, and ones that never went up.
  const imagePost = (id) => byId(id) || ME.history.flatMap((w) => w.posts.concat(w.missed || [])).find((p) => p.id === id);
  S.anBusy = false;
  const upToDate = (since) => !!(ME.analytics && ME.analytics.at.slice(0, 10) >= since);
  function analyticsButton(primary) {
    if (S.anBusy) return `<span class="shot-add is-busy" role="status">Reading the file</span>`;
    return `<button class="shot-add ${primary ? "is-primary" : ""}" type="button" data-act="analytics-add">${ic("upload")}<span>Upload this week's analytics</span></button>`;
  }
  // The steps, with LinkedIn's own screens (cropped to the buttons). The page's own copy: no link elsewhere.
  const GUIDE = "/fellowship/guide/";
  const shot = (file, w, h, alt) => `<img class="an-shot" src="${GUIDE}${file}" width="${w}" height="${h}" alt="${alt}" loading="lazy">`;
  const howTo = (open) => `<details class="an-how" ${open ? "open" : ""}><summary>How to export it from LinkedIn</summary>
      <ol class="an-steps">
        <li><p>On a computer, open linkedin.com and go to your feed.</p></li>
        <li><p>On the left, under your profile, click <b>Post impressions</b>.</p>${shot("export-1-impressions.png", 216, 156, "The Dashboard box on the left of the LinkedIn feed, with Post impressions marked")}</li>
        <li><p>Click the date button at the top, choose <b>7 days</b>, then click <b>Show results</b>.</p>${shot("export-2-range.png", 347, 426, "The date menu on Content analytics, with 7 days chosen and Show results marked")}</li>
        <li><p>Click <b>Export</b>.</p>${shot("export-3-export.png", 553, 137, "The top of Content analytics, with the Export button marked")}</li>
        <li><p>Click <b>Confirm</b>. LinkedIn saves a file whose name ends in .xlsx.</p>${shot("export-4-confirm.png", 544, 188, "LinkedIn's Export box, with Confirm marked")}</li>
        <li><p>Come back here, tap <b>Upload this week's analytics</b> and choose that file.</p></li>
      </ol>
      <p class="an-phone">${ic("info", "ic-sm")}These steps are for LinkedIn on a computer.</p>
    </details>`;
  function weekTotals() {
    const a = ME.analytics;
    if (!a || a.impressions == null) return "";
    const span = a.periodStart && a.periodEnd ? `${fmt(a.periodStart, false)} to ${fmt(a.periodEnd, false)}` : "your last export";
    const bits = [`<b>${nf(a.impressions)}</b> impressions`];
    if (a.membersReached != null) bits.push(`<b>${nf(a.membersReached)}</b> people reached`);
    if (a.newFollowers != null) bits.push(`<b>${nf(a.newFollowers)}</b> new ${a.newFollowers === 1 ? "follower" : "followers"}`);
    return `<p class="an-totals">${ic("chart", "ic-sm")}<span>${span}: ${bits.join(", ")}</span></p>`;
  }
  // The weekend asks for the last 7 days' export; Monday to Friday for the week before, if it had posts and none
  // came in since its Saturday. By date, not by where the fellowship week starts (weeks run Wednesday to Tuesday).
  function analyticsWeek() {
    const dow = parseD(TODAY).getUTCDay();
    const lastSat = addDays(TODAY, -((dow + 1) % 7)); // today on a Saturday, yesterday on a Sunday
    const all = S.posts.concat(ME.history.flatMap((w) => w.posts));
    const postedSince = (from, to) => all.filter((p) => p.status === "posted" && p.postedAt && p.postedAt.slice(0, 10) >= from && p.postedAt.slice(0, 10) <= to).length;
    if (dow === 0 || dow === 6) return { weekend: true, sunday: dow === 0, since: lastSat, posts: postedSince(addDays(lastSat, -6), TODAY) };
    return { weekend: false, sunday: false, since: lastSat, posts: postedSince(addDays(lastSat, -6), lastSat) };
  }
  const analyticsDue = () => { const w = analyticsWeek(); return w.posts > 0 && !upToDate(w.since); };
  function renderAnalytics() {
    const w = analyticsWeek(), box = $("#analytics");
    if (!analyticsDue()) {
      const done = w.posts > 0 && upToDate(w.since);
      box.className = "card card-pad shots";
      box.innerHTML = `
        <h2 class="card-title" id="analytics-title">${ic("image")}Two things only you can add</h2>
        <ol class="shots-steps">
          <li><b>A photo on every post.</b> Add your own before you copy it. No photo? Search for one on the post, or pick one of ours. Copy and Post on LinkedIn unlock once it's there.</li>
          <li><b>Every Sunday, your LinkedIn analytics.</b> Export the last 7 days from LinkedIn and upload the file here. Your posts' numbers fill in from it.${done ? ` <span class="chip chip-good">${ic("check", "ic-xs")}Uploaded ${fmt(ME.analytics.at.slice(0, 10), false)}</span>` : ""}</li>
        </ol>
        ${weekTotals()}
        <div class="an-upload">${analyticsButton(false)}</div>
        ${howTo(false)}`;
      return;
    }
    const title = w.weekend ? (w.sunday ? "Today: your LinkedIn analytics" : "Tomorrow: your LinkedIn analytics") : "Last week's LinkedIn analytics";
    box.className = "card card-pad shots is-due";
    box.innerHTML = `
      <h2 class="card-title" id="analytics-title">${ic("chart")}${title}</h2>
      <div class="an-upload">${analyticsButton(true)}</div>
      ${howTo(!ME.analytics)}
      ${weekTotals()}`;
  }
  $("#analytics-file").addEventListener("change", async () => {
    const input = $("#analytics-file"), f = input.files[0];
    input.value = "";
    if (!f || S.anBusy) return;
    // The server reads the file and says plainly if it isn't LinkedIn's export; only the size is checked here.
    if (f.size > 5 * 1024 * 1024) { toast("That file is too big to be LinkedIn's analytics export.", "error"); return; }
    S.anBusy = true; renderAnalytics();
    let v;
    try { v = await send(`${API}/analytics`, { method: "POST", headers: { Accept: "application/json", "Content-Type": XLSX }, body: f }); }
    catch (e) { S.anBusy = false; renderAnalytics(); focusEl('[data-act="analytics-add"]'); toast(e.message, "error"); return; }
    S.anBusy = false;
    if (!applyView(v)) return;
    renderAnalytics(); renderPosts(); renderActivity(); renderNews();
    focusEl('[data-act="analytics-add"]');
    const a = ME.analytics;
    toast(a && a.impressions != null
      ? `Analytics saved${a.periodStart && a.periodEnd ? ` for ${fmt(a.periodStart, false)} to ${fmt(a.periodEnd, false)}` : ""}: ${nf(a.impressions)} impressions. Thank you.`
      : "Analytics saved. Thank you.");
  });

  /* ---------- the fellow's own photo: every post goes out with one. Copy, Post on LinkedIn and I posted it
     wait for it, and the server refuses to mark a post posted without one. LinkedIn's share link carries
     only text, so the page reminds them to add the photo there too. */
  const photoUrl = (id, t) => `${API}/proof?post=${encodeURIComponent(id)}&photo=${encodeURIComponent(t)}`;
  const hasPhoto = (p) => !!(p.photos && p.photos.length);
  const PHOTO_IDEA = "Any photo you took yourself that fits this post: you, your desk, your college, or the place it happened.";
  function photoBlock(p) {
    const busy = S.photoBusy && S.photoBusy.id === p.id;
    const n = p.photos.length;
    const thumbs = p.photos.map((t, i) => `<span class="shot">
        <a class="shot-img ph-img" href="${esc(photoUrl(p.id, t))}" target="_blank" rel="noopener"><img src="${esc(photoUrl(p.id, t))}" alt="Your photo ${i + 1}, ${esc(p.title)}" width="64" height="64" loading="lazy"></a>
        <button class="shot-x" type="button" data-act="photo-remove" data-id="${p.id}" data-photo="${esc(t)}" aria-label="Remove photo ${i + 1}, ${esc(p.title)}">${ic("x")}</button>
      </span>`).join("");
    const add = busy
      ? `<span class="shot-add is-busy">Adding ${S.photoBusy.done + 1} of ${S.photoBusy.total}</span>`
      : n >= P.photosPerPost ? ""
      : `<button class="shot-add ${n ? "" : "is-primary"}" type="button" data-act="photo-add" data-id="${p.id}" aria-label="${n ? "Add another photo" : "Add your photo"}, ${esc(p.title)}">${ic("image")}<span>${n ? "Add another" : "Add your photo"}</span></button>`;
    const help = !n && !p.photoHelp && !busy ? `<button class="btn-link ph-help" type="button" data-act="photo-help" data-id="${p.id}">No photo? Find one</button>` : "";
    const note = n ? "On LinkedIn, add this photo to the post as well: the link only carries the text."
      : p.photoHelp ? "Copy and Post on LinkedIn unlock once the post has a photo: one you find here, or your own."
      : "Copy and Post on LinkedIn unlock once your own photo is added. Every post goes out with one.";
    return `<div class="ph">
      <p class="ph-idea">${ic("image", "ic-sm")}<span><b>Photo idea:</b> ${esc(p.photoIdea || PHOTO_IDEA)}${p.photoIdea ? " Any photo of yours that fits works too." : ""}</span></p>
      <div class="shots-strip">${thumbs}${add}${help}</div>
      ${!n && p.photoHelp ? stockBlock(p) : ""}
      <p class="ph-note ${n ? "" : "is-locked"}" id="phnote-${p.id}">${note}</p>
    </div>`;
  }
  // No photo of their own: they search for what it should show, or pick from the photos we chose for the post,
  // see the one they tapped bigger, and use it. Our picks are fetched once; their searches replace the grid.
  function stockBlock(p) {
    const st = S.stock[p.id];
    if (!st) loadStock(p.id);
    const s = S.stock[p.id];
    let body;
    if (s.busy === "load") body = `<p class="stk-note" role="status">${s.mode === "search" ? "Searching..." : "Finding photos for this post..."}</p>`;
    else if (s.error) body = `<p class="stk-note" role="status">${esc(s.error)}</p><div class="stk-acts"><button class="btn btn-ghost btn-sm" type="button" data-act="stock-retry" data-id="${p.id}">Try again</button></div>`;
    else if (!s.list.length) body = `<p class="stk-note" role="status">${s.mode === "search" ? `No photos for "${esc(s.q)}". Try other words, like desk, notebook or campus.` : "Search for a photo above."}</p>`;
    else {
      const sel = s.sel != null ? s.list[s.sel] : null;
      body = `<div class="stk-grid">${s.list.map((x, i) => `<button class="stk-tile${s.sel === i ? " is-sel" : ""}" type="button" data-act="stock-sel" data-id="${p.id}" data-i="${i}" aria-pressed="${s.sel === i}" aria-label="Photo ${i + 1}: ${esc(x.title || "a photo for this post")}"><img src="${esc(x.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer"></button>`).join("")}</div>
        ${sel ? `<div class="stk-pick"><img class="stk-img" src="${esc(sel.src)}" alt="${esc(sel.title || "The photo you picked")}" referrerpolicy="no-referrer">
          <div class="stk-acts"><button class="btn btn-primary btn-sm" type="button" data-act="stock-use" data-id="${p.id}"${s.busy ? " disabled" : ""}>${s.busy === "use" ? "Adding it..." : "Use this photo"}</button>
            <button class="btn btn-ghost btn-sm" type="button" data-act="stock-unsel" data-id="${p.id}">Pick another</button></div></div>`
          : `<p class="stk-note">Tap a photo to see it bigger.</p>`}`;
    }
    return `<div class="stk">
      <p class="stk-q"><b>Find a photo for this post.</b> Search for what it should show, or pick one of ours. They're free to post, with no credit needed.</p>
      <div class="stk-search" role="search">
        <label class="sr-only" for="stkq-${p.id}">What should the photo show?</label>
        <input id="stkq-${p.id}" type="search" enterkeyhint="search" autocomplete="off" maxlength="60" placeholder="What should it show? e.g. chai and laptop" value="${esc(s.qDraft != null ? s.qDraft : s.q)}" data-stock-q="${p.id}">
        <button class="btn btn-secondary btn-sm" type="button" data-act="stock-search" data-id="${p.id}">Search</button>
      </div>
      <div class="stk-label"><span>${s.mode === "search" ? `Photos for "${esc(s.q)}"` : "Our picks for this post"}</span>${s.mode === "search" ? `<button class="btn-link" type="button" data-act="stock-picks" data-id="${p.id}">Back to our picks</button>` : ""}</div>
      ${body}
    </div>`;
  }
  async function loadStock(id, q) {
    const st = S.stock[id] || (S.stock[id] = { picks: null, list: [], mode: "picks", q: "", qDraft: null, busy: null, sel: null, error: "" });
    if (!q && st.picks) { Object.assign(st, { list: st.picks, mode: "picks", q: "", busy: null, sel: null, error: "" }); return; }
    const ask = q || "";
    Object.assign(st, { mode: q ? "search" : "picks", q: ask, busy: "load", sel: null, error: "", list: [] });
    try {
      const r = await send(`${API}/stock?post=${encodeURIComponent(id)}${q ? `&q=${encodeURIComponent(q)}` : ""}`, { headers: { Accept: "application/json" } });
      if (S.stock[id] !== st || st.q !== ask) return; // a newer search has started
      st.list = (r && r.stock) || [];
      if (!q) st.picks = st.list;
    } catch (e) {
      if (S.stock[id] !== st || st.q !== ask) return;
      st.error = e.message;
    }
    st.busy = null;
    // Keep their place if they were typing a search while this loaded.
    const typing = document.activeElement && document.activeElement.id === "stkq-" + id;
    refreshPhoto(id);
    if (typing) { const el = $("#stkq-" + id); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
    else if (S.stockFocus === id) { S.stockFocus = null; focusEl(q ? `[data-act="stock-sel"][data-id="${id}"]` : `#stkq-${id}`); }
  }

  // The post as LinkedIn will show it: the photos under the text.
  function liMedia(p) {
    if (!hasPhoto(p)) return "";
    const list = p.photos.slice(0, 4);
    return `<div class="li-media n-${list.length}">${list.map((t) => `<img src="${esc(photoUrl(p.id, t))}" alt="" loading="lazy">`).join("")}</div>`;
  }
  // A tap on a locked button says why and takes them to Add your photo, instead of doing nothing.
  function needPhoto(id) {
    const v = imagePost(id);
    if (v && v.yourVersion) { toast("Your version of this post is with Studojo for approval. You'll post it once it's approved.", "error"); focusEl(`[data-act="rewrite-see"][data-id="${id}"]`); return; }
    const p = v, add = $(`[data-act="stock-use"][data-id="${id}"]`) || $(`#stkq-${id}`) || $(`[data-act="photo-add"][data-id="${id}"]`);
    if (add) { add.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); add.focus({ preventScroll: true }); }
    toast(p && p.photoHelp
      ? "This post needs a photo first: search for one, pick one of ours, or add your own."
      : "Add your own photo to this post first. Then Post on LinkedIn, Copy and I posted it unlock.", "error");
  }
  function refreshPhoto(id) { if (byId(id)) { rerenderPost(id); renderCover(); } else renderActivity(); }

  // Every photo is redrawn as a JPEG before it's sent: that drops its hidden details (like where it was
  // taken), turns iPhone HEIC into JPEG and keeps it small: good enough for LinkedIn, 2048 px on the long side, 5 MB.
  const UNREADABLE = "That file isn't a picture the page can read. Choose another one.";
  function imageFromData(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => reject(new Error(UNREADABLE)); im.src = r.result; };
      r.onerror = () => reject(new Error(UNREADABLE));
      r.readAsDataURL(file);
    });
  }
  async function toJpeg(file) {
    if (file.type && !file.type.startsWith("image/")) throw new Error(UNREADABLE);
    let img;
    try { img = await createImageBitmap(file); } catch (e) { img = await imageFromData(file); }
    const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
    if (!w0 || !h0) throw new Error(UNREADABLE);
    const scale = Math.min(1, 2048 / Math.max(w0, h0));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w0 * scale)); c.height = Math.max(1, Math.round(h0 * scale));
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    if (img.close) img.close();
    for (const q of [0.85, 0.75]) {
      const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", q));
      if (blob && blob.size <= 5 * 1024 * 1024) return blob;
    }
    throw new Error("That photo is too big to send. Try another one.");
  }
  S.photoBusy = null;
  let pick = null; // which post the photo picker is for
  $("#photo-file").addEventListener("change", async () => {
    const input = $("#photo-file"), files = [...input.files], id = pick;
    input.value = ""; pick = null;
    const p = id && imagePost(id);
    if (!p || !files.length || S.photoBusy) return;
    const had = p.photos.length;
    const take = files.slice(0, P.photosPerPost - had);
    S.photoBusy = { id, done: 0, total: take.length }; refreshPhoto(id);
    let added = 0, err = "";
    for (const f of take) {
      try {
        const v = await send(`${API}/proof?post=${encodeURIComponent(id)}&kind=photo`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "image/jpeg" }, body: await toJpeg(f) });
        if (!applyView(v)) return;
        added++; S.photoBusy.done = added; refreshPhoto(id);
      } catch (e) { err = e.message; break; }
    }
    S.photoBusy = null; refreshPhoto(id);
    focusEl(`[data-act="photo-add"][data-id="${id}"]`);
    if (err) toast(added ? `${plural(added, "photo")} added. ${err}` : err, "error");
    else if (files.length > take.length) toast(`${plural(added, "photo")} added. A post can have up to ${P.photosPerPost}.`);
    else if (!had) toast("Photo added. Copy and Post on LinkedIn are unlocked.");
    else toast(`${added === 1 ? "Photo" : plural(added, "photo")} added. Thank you.`);
  });

  /* ---------- profile card */
  function renderProfile() {
    // A count nobody has given yet is shown as missing, never as 0.
    const c = S.conn, known = c.now != null;
    const growth = known && c.atJoin != null ? c.now - c.atJoin : null;
    const growthTxt = growth == null ? "" : growth >= 0 ? `+${nf(growth)} since you joined` : `${nf(-growth)} fewer than when you joined`;
    const meta = [ME.city, ME.course].filter(Boolean).join(", ");
    const later = (c.atJoin != null ? c.history.slice(1) : c.history).map((h) => `${nf(h.n)} on ${fmt(h.date, false)}`);
    const histTxt = (c.atJoin != null ? `You joined with ${nf(c.atJoin)} on ${fmt(ME.joined, false)}.` : "")
      + (later.length ? (c.atJoin != null ? " Since then: " : "Your counts so far: ") + later.join(", ") + "." : "");
    $("#profile").innerHTML = `
      <div class="cover" aria-hidden="true"></div>
      <div class="profile-body">
        <div class="p-top">
          <div class="avatar avatar-xl" aria-hidden="true">${esc(ME.initials)}</div>
          <div class="p-id">
            <h1 class="p-name"><button class="p-name-btn" type="button" data-act="told" aria-haspopup="dialog" aria-label="${esc(ME.name)}: read what you've told us">${esc(ME.name)}${ic("comment", "ic-sm")}</button></h1>
            <p class="p-headline">${esc(ME.headline)}</p>
          </div>
        </div>
        ${meta ? `<p class="p-meta">${esc(meta)}</p>` : ""}
        <p class="p-org"><span class="mark mark-sm" aria-hidden="true">S</span>${esc(P.name)}${ME.cohort ? ", " + esc(ME.cohort) : ""}</p>
      </div>
      <dl class="stats">
        <div>
          <button class="stat stat-btn" type="button" data-act="conn-edit" aria-expanded="${c.editing}" aria-controls="conn-edit" aria-label="${known ? `Connections: ${nf(c.now)}${growthTxt ? ", " + growthTxt : ""}. Update your count.` : "Connections: not added yet. Add your count."}">
            <span class="st-label"><span>Connections</span>${growthTxt ? `<span class="st-growth">${growthTxt.replace(" since you joined", " since joining")}</span>` : ""}</span>
            <span class="st-val">${known ? nf(c.now) : "Add your count"}${ic("edit-sm")}</span>
          </button>
        </div>
      </dl>
      ${c.editing ? `
      <div class="conn-edit" id="conn-edit">
        <label for="conn-input">How many connections do you have today?</label>
        <div class="conn-row ${c.err ? "has-err" : ""}">
          <input id="conn-input" type="number" inputmode="numeric" min="0" max="30000" value="${known ? c.now : ""}" aria-describedby="conn-err conn-hist">
          <button class="btn btn-primary btn-sm" type="button" data-act="conn-save">Save</button>
          <button class="btn btn-ghost btn-sm" type="button" data-act="conn-cancel">Cancel</button>
        </div>
        <p class="err" id="conn-err">${c.err ? ic("alert") + esc(c.err) : ""}</p>
        <p class="conn-hist" id="conn-hist">${histTxt}</p>
      </div>` : ""}`;
  }

  /* ---------- this week's edition (the calendar card from the Weekly edition direction) */
  const WEEK_NO = ME.weekNo;
  function renderCover() {
    const n = postedCount(), next = nextPost(), total = counted().length;
    const away = (d) => diffDays(TODAY, d);
    if (!total) {
      $("#ed-cover").innerHTML = `<div class="ed-in ed-empty">
        <div class="ed-top">
          <div class="ed-issue" aria-hidden="true"><span class="ed-issue-cap">NO.</span><span class="ed-issue-no">${WEEK_NO}</span></div>
          <div>
            <p class="ed-eyebrow">Your weekly edition${ME.cohort ? " · " + esc(ME.cohort) : ""}</p>
            <h2 class="ed-title" id="ed-title">Week ${WEEK_NO} edition</h2>
            <p class="ed-meta">${fmt(ME.thisWeek.start, false)} to ${fmt(addDays(ME.thisWeek.start, 6), false)} · Made for ${esc(ME.first)}</p>
          </div>
        </div>
        <p class="ed-dek">${ME.paused ? NO_POSTS : NO_POSTS + " They'll show up here as soon as they're ready."}</p>
      </div>`;
      return;
    }
    const when = (d) => (away(d) === 0 ? "today" : away(d) === 1 ? "tomorrow" : dowLong(d));
    let dek;
    if (!next) dek = `${allPosts(total, "up")}. <b>That's this week done.</b>`;
    else if (next.yourVersion) dek = `<b>Your version of ${dowLong(next.date)}'s post is with Studojo.</b> You'll post it once it's approved.`;
    else if (!hasPhoto(next)) {
      dek = next.photoHelp
        ? `<b>No photo for ${dowLong(next.date)}'s post?</b> Find one on the post, or add your own, to unlock it.`
        : `<b>Add your own photo to ${dowLong(next.date)}'s post</b> to unlock it. Every post goes out with one.`;
    } else if (next.copied) dek = `${dowLong(next.date)}'s post is copied. Paste it on LinkedIn, then tap <b>I posted it</b>.`;
    else if (away(next.date) < 0) {
      const ago = -away(next.date);
      dek = `<b>${dowLong(next.date)}'s post was due ${ago === 1 ? "yesterday" : ago + " days ago"}.</b> Copy it and post it when you can.`;
    } else {
      const left = total - n;
      dek = `<b>${dowLong(next.date)}'s post is ready to copy</b> for ${when(next.date)}. ${left === 1 ? "That's the last one" : left + " left"} this week.`;
    }
    const lines = S.posts.slice().sort((a, b) => a.date.localeCompare(b.date)).map((p) => {
      const done = p.status === "posted", isNext = next && p.id === next.id, a = away(p.date);
      let st;
      if (onHold(p)) st = `<span class="ed-state late">On hold</span>`;
      else if (done) st = `<span class="ed-state ok">${ic("check")}Posted</span>`;
      else if (isNext && p.copied) st = `<span class="ed-state next">Copied</span>`;
      else if (isNext) st = `<span class="ed-state next">Up next</span>`;
      else if (a < 0) st = `<span class="ed-state late">Was due ${dowLong(p.date)}</span>`;
      else st = `<span class="ed-state">${a === 0 ? "Today" : a === 1 ? "Tomorrow" : dowLong(p.date)}</span>`;
      return `<li><button type="button" class="ed-line${done ? " is-done" : ""}${isNext ? " is-next" : ""}" data-act="goto" data-id="${p.id}">
        <span class="ed-line-day"><b>${DOW[parseD(p.date).getUTCDay()]}</b><span>${parseD(p.date).getUTCDate()}</span></span>
        <span class="ed-line-title">${esc(p.title)}</span>${st}</button></li>`;
    }).join("");
    $("#ed-cover").innerHTML = `<div class="ed-in">
      <div class="ed-top">
        <div class="ed-issue" aria-hidden="true"><span class="ed-issue-cap">NO.</span><span class="ed-issue-no">${WEEK_NO}</span></div>
        <div>
          <p class="ed-eyebrow">Your weekly edition${ME.cohort ? " · " + esc(ME.cohort) : ""}</p>
          <h2 class="ed-title" id="ed-title">Week ${WEEK_NO} edition</h2>
          <p class="ed-meta">${fmt(ME.thisWeek.start, false)} to ${fmt(addDays(ME.thisWeek.start, 6), false)} · Made for ${esc(ME.first)}</p>
        </div>
      </div>
      <p class="ed-dek">${dek}</p>
      <ol class="ed-lines" aria-label="This week's posts">${lines}</ol>
      <p class="ed-hint">Your week at a glance. Tap a post to open it in full below.</p>
      <dl class="ed-stats">
        <div><dt>Posted this week</dt><dd>${n} of ${total}<span class="ed-meter" aria-hidden="true">${counted().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<i class="${p.status === "posted" ? "on" : ""}"></i>`).join("")}</span></dd></div>
        <div><dt>Weekly run</dt><dd>${plural(run(), "week")}</dd></div>
        <div><dt>Completed</dt><dd>${plural(doneWeeks(), "week")}</dd></div>
      </dl>
    </div>`;
    const ol = $("#ed-cover .ed-lines"); if (ol) ol.style.setProperty("--n", String(Math.max(1, S.posts.length)));
  }

  /* ---------- post cards */
  function holdCard(p) {
    const d = parseD(p.date);
    return `<article class="card post is-held" id="post-${p.id}" tabindex="-1" aria-labelledby="title-${p.id}">
      <header class="pc-head">
        <span class="date-tile" aria-hidden="true"><span class="dt-dow">${DOW[d.getUTCDay()]}</span><span class="dt-num">${d.getUTCDate()}</span></span>
        <div>
          <h3 class="pc-title" id="title-${p.id}"><span class="sr-only">${dowLong(p.date)}: </span>${esc(p.title)}</h3>
          <p class="pc-sub"><span>Was planned for ${dowLong(p.date)}</span></p>
        </div>
        <span class="chip chip-warn">On hold</span>
      </header>
      <div class="hold-note" role="note">${ic("alert")}<p><b>On hold: the team is updating this post.</b> Please don't post it yet. We'll let you know when it's back.</p></div>
    </article>`;
  }

  // Their own version, waiting for Studojo: what happens next, what they sent, and the way back to the original.
  function versionBlock(p) {
    return `<div class="ver" id="ver-${p.id}">
      <p class="ver-head">${ic("send", "ic-sm")}<span><b>Your version is with Studojo for approval.</b> You'll post it once it's approved. Until then, this post stays locked.</span></p>
      <div class="ver-acts">
        <button class="btn-link" type="button" data-act="rewrite-see" data-id="${p.id}" aria-expanded="${!!p.showVersion}">${p.showVersion ? "Hide your version" : "See your version"}</button>
        <button class="btn-link" type="button" data-act="rewrite-withdraw" data-id="${p.id}">Withdraw it and post the original</button>
      </div>
      ${p.showVersion ? `<p class="ver-text">${esc(p.yourVersion.text)}</p>` : ""}
    </div>`;
  }

  function postCard(p) {
    if (onHold(p)) return holdCard(p);
    const posted = p.status === "posted";
    const next = nextPost();
    const isNext = !posted && next && next.id === p.id;
    const away = diffDays(TODAY, p.date);
    let sub;
    if (posted) sub = `Posted ${relDay(p.postedAt)}, ${timeOf(p.postedAt)}`;
    else if (away < 0) sub = `Was due ${dowLong(p.date)}. Post it when you can`;
    else sub = away === 0 ? "Due today" : away === 1 ? "Due tomorrow" : `Due ${dowLong(p.date)}, in ${away} days`;
    const chip = posted
      ? `<span class="chip chip-good">${ic("check", "ic-xs")}Posted</span>`
      : isNext ? `<span class="chip chip-next">Up next</span>` : `<span class="chip">Ready</span>`;
    const d = parseD(p.date);
    const since = posted ? diffDays(p.postedAt.slice(0, 10), TODAY) : 0;
    const liTime = posted ? (since === 0 ? "Now" : since + "d") : DOW[d.getUTCDay()];
    const bodyId = `body-${p.id}`;

    let actions = "";
    if (!posted) {
      // The hard rule: nothing goes out without the fellow's own photo, so these wait for one. Their own version of
      // the post waits for Studojo's approval the same way.
      const waiting = !!p.yourVersion, locked = !hasPhoto(p) || waiting;
      const lock = locked ? ` aria-disabled="true" aria-describedby="${waiting ? "ver" : "phnote"}-${p.id}"` : "";
      const sharePrimary = isNext && !p.copied && !locked, postPrimary = isNext && p.copied && !locked;
      actions = `<div class="actions" role="group" aria-label="${esc(dowLong(p.date))} post actions">
        ${locked
          ? `<button class="act act-share" type="button" data-act="share" data-id="${p.id}"${lock}>${ic("share")}<span>Post on LinkedIn</span></button>`
          : `<a class="act act-share ${sharePrimary ? "is-primary" : ""}" href="${esc(composeUrl(p))}" target="_blank" rel="noopener noreferrer" data-act="share" data-id="${p.id}">${ic("share")}<span>Post on LinkedIn</span><span class="sr-only"> (copies the post and opens LinkedIn in a new tab)</span></a>`}
        <button class="act ${p.copied ? "is-done" : ""}" type="button" data-act="copy" data-id="${p.id}"${lock}>${ic(p.copied ? "check" : "copy")}<span>${p.copied ? "Copied" : "Copy"}</span></button>
        <button class="act" type="button" data-act="line" data-id="${p.id}" aria-expanded="${p.panel === "line"}" aria-controls="panel-${p.id}">${ic("pen")}<span>${p.ownLine ? "Edit your line" : "Add your line"}</span></button>
        <button class="act ${postPrimary ? "is-primary" : ""}" type="button" data-act="posted" data-id="${p.id}" aria-expanded="${p.panel === "posted"}" aria-controls="panel-${p.id}"${lock}>${ic("send")}<span>I posted it</span></button>
      </div>
      ${waiting ? versionBlock(p) : `${p.versionReply ? `<p class="ver-reply">${ic("comment", "ic-sm")}<span><b>Studojo kept the original:</b> ${esc(p.versionReply)}</span></p>` : ""}
      <p class="as-written">${ic("info", "ic-sm")}<span>Post it as written: <b>Post on LinkedIn</b> copies it for you, or use <b>Copy</b>. Want it in your own words? <button class="btn-link" type="button" data-act="rewrite" data-id="${p.id}" aria-expanded="${p.panel === "rewrite"}" aria-controls="panel-${p.id}">Rewrite it your way</button> and Studojo approves it before you post it.</span></p>`}`;
    }

    let footer = "";
    if (posted) {
      const m = p.metrics;
      // Reactions and comments are unknown (null) when only impressions came in from the analytics export.
      const strip = m && (m.reactions != null || m.comments != null) ? `<div class="strip">${m.reactions != null ? `<span class="reacts"><span class="r-dot" aria-hidden="true">${ic("thumb")}</span>${nf(m.reactions)} ${m.reactions === 1 ? "reaction" : "reactions"}</span>` : "<span></span>"}${m.comments != null ? `<span>${plural(m.comments, "comment")}</span>` : ""}</div>` : "";
      const dueIn = p.numbersDue ? diffDays(TODAY, p.numbersDue) : 0;
      // The weekly analytics export fills the numbers in, for a post with its link; typing them is the fallback.
      const numbersBtn = (label, cls) => `<button class="${cls}" type="button" data-act="numbers" data-id="${p.id}" aria-expanded="${p.panel === "numbers"}" aria-controls="panel-${p.id}">${label}</button>`;
      const an = m
        ? `<div class="an-row"><span class="an-main">${ic("chart")}<span><b>${nf(m.impressions)}</b> impressions</span></span>${numbersBtn("Edit numbers", "btn btn-ghost btn-sm")}</div>
           ${p.analyticsAt ? `<p class="an-note">From your LinkedIn analytics export, ${fmt(p.analyticsAt.slice(0, 10), false)}.</p>` : ""}`
        : `<div class="an-row"><span class="an-main">${ic("calendar")}<span>Numbers fill in from your weekly LinkedIn export</span></span>${numbersBtn("Type them instead", "btn btn-ghost btn-sm")}</div>
           ${p.url ? "" : `<p class="an-note">Add the link to your post below, so the export can find it.</p>`}`;
      const link = p.url
        ? `<span class="lt">${esc(shortUrl(p.url))}</span>`
        : `<button class="btn-link" type="button" data-act="posted" data-id="${p.id}" aria-expanded="${p.panel === "posted"}" aria-controls="panel-${p.id}">Add the link to your post</button>`;
      footer = `${strip}<div class="an">${an}<div class="link-row">${ic("link", "ic-sm")}${link}</div></div>`;
    }

    let panel = "";
    if (p.panel === "rewrite") {
      panel = `<div class="panel" id="panel-${p.id}">
        <label class="panel-label" for="rw-${p.id}">Your version of the post</label>
        <p class="panel-help" id="rw-help-${p.id}">Write it the way you would. Studojo reads it and approves it, and you post it once it's approved. Keep a strong first line and short paragraphs: that's what LinkedIn shows people first.</p>
        <textarea id="rw-${p.id}" class="rw-text" rows="12" maxlength="3000" aria-describedby="rw-help-${p.id} rw-err-${p.id}" aria-invalid="${!!p.err}">${esc(p.rewriteDraft != null ? p.rewriteDraft : p.body)}</textarea>
        <p class="err" id="rw-err-${p.id}">${p.err ? ic("alert") + esc(p.err) : ""}</p>
        <div class="panel-actions">
          <button class="btn btn-ghost" type="button" data-act="close" data-id="${p.id}">Cancel</button>
          <button class="btn btn-primary" type="button" data-act="rewrite-send" data-id="${p.id}">Send to Studojo for approval</button>
        </div>
      </div>`;
    } else if (p.panel === "line") {
      panel = `<div class="panel" id="panel-${p.id}">
        <label class="panel-label" for="line-${p.id}">Your own line <span class="opt">(optional)</span></label>
        <p class="panel-help" id="line-help-${p.id}">One line in your own words. It goes at the top of the post.</p>
        <textarea id="line-${p.id}" rows="2" maxlength="220" aria-describedby="line-help-${p.id} line-err-${p.id}" aria-invalid="${!!p.err}" placeholder="Something only you would say about this">${esc(p.lineDraft != null ? p.lineDraft : p.ownLine)}</textarea>
        <p class="err" id="line-err-${p.id}">${p.err ? ic("alert") + esc(p.err) : ""}</p>
        <div class="panel-actions">
          <button class="btn btn-ghost" type="button" data-act="close" data-id="${p.id}">Cancel</button>
          ${p.ownLine ? `<button class="btn btn-ghost" type="button" data-act="line-remove" data-id="${p.id}">Remove line</button>` : ""}
          <button class="btn btn-primary" type="button" data-act="line-save" data-id="${p.id}">Save line</button>
        </div>
      </div>`;
    } else if (p.panel === "posted") {
      panel = `<div class="panel" id="panel-${p.id}">
        <label class="panel-label" for="url-${p.id}">Paste the link to your LinkedIn post${posted ? "" : ` <span class="opt">(optional)</span>`}</label>
        <p class="panel-help" id="url-help-${p.id}">On LinkedIn, open your post, tap the three dots, then Copy link to post.${posted ? "" : " You can add it later too."}</p>
        <div class="${p.err ? "has-err" : ""}"><input id="url-${p.id}" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="linkedin.com/posts/..." value="${esc(p.urlDraft || "")}" aria-describedby="url-help-${p.id} url-err-${p.id}" aria-invalid="${!!p.err}"></div>
        <p class="err" id="url-err-${p.id}">${p.err ? ic("alert") + esc(p.err) : ""}</p>
        <div class="panel-actions">
          <button class="btn btn-ghost" type="button" data-act="close" data-id="${p.id}">Cancel</button>
          <button class="btn btn-primary" type="button" data-act="posted-save" data-id="${p.id}">${posted ? "Save link" : "Mark as posted"}</button>
        </div>
      </div>`;
    } else if (p.panel === "numbers") {
      const m0 = p.metrics || {};
      const m = p.draft || { impressions: m0.impressions, reactions: m0.reactions, comments: m0.comments };
      panel = `<div class="panel" id="panel-${p.id}">
        <p class="panel-label" id="num-title-${p.id}">Add your numbers</p>
        <p class="panel-help">On LinkedIn, open the post and tap the impressions count under it.</p>
        <div class="num-grid ${p.err ? "has-err" : ""}" role="group" aria-labelledby="num-title-${p.id}">
          <label for="imp-${p.id}">Impressions<input id="imp-${p.id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="num-err-${p.id}" aria-invalid="${!!p.err && !/^\d[\d,\s]*$/.test(String(m.impressions == null ? "" : m.impressions).trim())}" value="${m.impressions != null ? esc(m.impressions) : ""}"></label>
          <label for="rea-${p.id}">Reactions<input id="rea-${p.id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="num-err-${p.id}" aria-invalid="${!!p.err && !/^\d[\d,\s]*$/.test(String(m.reactions == null ? "" : m.reactions).trim())}" value="${m.reactions != null ? esc(m.reactions) : ""}"></label>
          <label for="com-${p.id}">Comments<input id="com-${p.id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="num-err-${p.id}" aria-invalid="${!!p.err && !/^\d[\d,\s]*$/.test(String(m.comments == null ? "" : m.comments).trim())}" value="${m.comments != null ? esc(m.comments) : ""}"></label>
        </div>
        <p class="err" id="num-err-${p.id}">${p.err ? ic("alert") + esc(p.err) : ""}</p>
        <div class="panel-actions">
          <button class="btn btn-ghost" type="button" data-act="close" data-id="${p.id}">Cancel</button>
          <button class="btn btn-primary" type="button" data-act="numbers-save" data-id="${p.id}">Save numbers</button>
        </div>
      </div>`;
    }

    return `<article class="card post ${isNext ? "is-next" : ""} ${posted ? "is-posted" : ""}" id="post-${p.id}" tabindex="-1" aria-labelledby="title-${p.id}">
      <header class="pc-head">
        <span class="date-tile" aria-hidden="true"><span class="dt-dow">${DOW[d.getUTCDay()]}</span><span class="dt-num">${d.getUTCDate()}</span></span>
        <div>
          <h3 class="pc-title" id="title-${p.id}"><span class="sr-only">${dowLong(p.date)}: </span>${esc(p.title)}</h3>
          <p class="pc-sub"><span>${sub}</span>${p.kind === "studojo" ? `<span class="sj-tag"><span class="mark" aria-hidden="true">S</span>Studojo post</span>` : ""}</p>
        </div>
        ${chip}
      </header>
      <div class="li">
        <div class="li-head">
          <span class="avatar av-48" aria-hidden="true">${esc(ME.initials)}</span>
          <div class="li-who">
            <p class="li-name">${esc(ME.name)} <span class="li-deg">&#8226; You</span></p>
            <p class="li-headline">${esc(ME.headline)}</p>
            <p class="li-meta">${liTime} &#8226; ${ic("globe")}<span class="sr-only">Anyone can see this</span></p>
          </div>
        </div>
        <div class="li-text">
          <div class="li-body ${p.expanded ? "" : "is-clamped"}" id="${bodyId}">${postHTML(p)}</div>
          ${p.expanded ? "" : `<button class="see-more" type="button" data-act="more" data-id="${p.id}" aria-controls="${bodyId}" aria-expanded="false">&#8230;<span class="sm-full">see </span>more</button>`}
        </div>
        ${liMedia(p)}
      </div>
      ${footer}
      ${posted ? "" : photoBlock(p)}
      ${actions}
      ${panel}
    </article>`;
  }

  function fitSeeMore(root) {
    (root || document).querySelectorAll(".li-body.is-clamped").forEach((el) => {
      const btn = el.parentElement.querySelector(".see-more");
      if (btn) btn.hidden = el.scrollHeight <= el.clientHeight + 2;
    });
  }

  function renderPosts() {
    $("#posts").innerHTML = ORDER.map((id) => postCard(byId(id))).join("");
    fitSeeMore($("#posts"));
    applySearch();
  }
  function rerenderPost(id, focusSel) {
    const el = $("#post-" + id);
    if (!el) return;
    el.outerHTML = postCard(byId(id));
    const fresh = $("#post-" + id);
    fitSeeMore(fresh);
    applySearch();
    if (focusSel) { const f = fresh.querySelector(focusSel); if (f) f.focus(); }
  }

  /* ---------- milestones */
  function renderMilestones() {
    const done = doneWeeks();
    const list = ME.milestones.map((m) => {
      const earned = m.weeks != null && done >= m.weeks;
      return Object.assign({}, m, { earned, toGo: m.weeks != null ? Math.max(0, m.weeks - done) : null });
    });
    const next = list.find((m) => !m.earned && m.weeks != null);
    const segs = next ? Array.from({ length: next.weeks }, (_, i) => `<span class="${i < done ? "on" : ""}"></span>`).join("") : "";
    const items = list.map((m) => {
      const isNext = next && m.id === next.id;
      const meta = m.earned
        ? `Earned ${m.earnedOn ? fmt(m.earnedOn, false) : "this week"}`
        : isNext ? `After ${m.weeks} weeks. ${plural(m.toGo, "week")} to go` : m.weeks != null ? `After ${m.weeks} weeks` : "For high performers";
      return `<li class="${m.earned ? "earned" : isNext ? "next" : ""}">
        <span class="tl-dot" aria-hidden="true">${m.earned ? ic("check") : ""}</span>
        <div>
          <p class="tl-title">${esc(m.name)}${isNext ? `<span class="chip chip-next">Next</span>` : ""}</p>
          <p class="tl-meta ${m.earned ? "is-earned" : ""}">${meta}</p>
          ${m.earned && m.id === "trial" ? `<button class="btn-link" type="button" data-act="howto" aria-expanded="${S.howto}" aria-controls="howto">Add it to your LinkedIn profile</button>
            <div class="howto" id="howto" ${S.howto ? "" : "hidden"}><ol>
              <li>On LinkedIn, open your profile and tap Add section.</li>
              <li>Choose Licenses and certifications.</li>
              <li>Name: ${esc(m.name)}. Issuing organisation: Studojo.</li>
            </ol></div>` : ""}
        </div>
      </li>`;
    }).join("");
    $("#milestones").innerHTML = `
      <div class="card-head"><h2 class="card-title" id="ms-title">Your next milestone</h2></div>
      ${next ? `<div class="ms-next">
        <span class="ms-tile" aria-hidden="true">${ic(next.id === "outreach" ? "target" : "cert")}</span>
        <div>
          <h3>${esc(next.name)}</h3>
          <p class="ms-when">${plural(next.toGo, "week")} to go</p>
        </div>
      </div>
      <div class="wk-track" role="img" aria-label="${Math.min(done, next.weeks)} of ${next.weeks} weeks complete">${segs}</div>
      <div class="wk-cap"><span><b>${Math.min(done, next.weeks)} of ${next.weeks}</b> weeks complete</span><span>After ${next.weeks} weeks</span></div>` : ""}
      <div class="divider"></div>
      <h3 class="sub-title">All milestones <span class="count">${list.length}</span></h3>
      <ol class="tl">${items}</ol>`;
  }

  /* ---------- share an experience */
  // Posts are written only from what a fellow shares, so until they've shared a few stories this card
  // leads the page (moved to the top of the feed at load) and says why.
  const askingForStories = () => S.stories.length < ME.storiesWanted;

  // Speaking a story: the browser's own speech service (Google in Chrome and on Android, Apple on iPhone)
  // writes the words into the box as the fellow talks. No audio reaches Studojo, only the text they share.
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canSpeak = () => !!(P.voice && SpeechRec);
  let rec = null;
  function stopListening() {
    const r = rec; rec = null; S.listening = false;
    if (r) { try { r.stop(); } catch (e) { /* already stopped */ } }
  }
  // A long talk is never cut off: near a story's 8,000-character limit the part so far is saved as its own
  // story and listening carries on into a new part. A part that can't be saved (no connection, or the day's
  // limit) waits on the page and goes with the next Share.
  const PART_AT = 7500;
  S.parts = { saved: 0, waiting: [], prompt: null };
  S.storyOpen = new Set();
  S.storyEdit = null; // { id, from, to, err }: the shared story whose name is being fixed
  // After each talk the page reads it back in writing (nothing is spoken back): what we heard, what can
  // become a post, what we'll leave out, and follow-up questions to answer next. A follow-up answer is a
  // story of its own, sent with the question it answers (S.reply). S.talkAt times the talk: 5 to 10
  // minutes is the aim, and nothing stops them going on.
  S.coachBusy = new Set(); S.coachErr = {}; S.coachOpen = new Set(); S.reply = null; S.talkAt = null;
  const replyFields = () => (S.reply ? { replyTo: S.reply.to, q: S.reply.q } : {});
  function requestCoach(ids) {
    const key = String(Math.max.apply(null, ids.map(Number)));
    S.coachBusy.add(key); delete S.coachErr[key];
    renderStories();
    call({ intent: "coach", storyIds: ids }).then((v) => {
      S.coachBusy.delete(key);
      if (!applyView(v)) return;
      const st = S.stories.find((x) => x.id === key);
      if (st && st.coach) { S.coachOpen.add(key); toast("Your feedback is ready."); }
      else if (st && st.reading) setTimeout(() => call().then((w) => { if (applyView(w)) renderStories(); }, () => {}), 20000);
      renderStories();
    }, (e) => {
      S.coachBusy.delete(key);
      S.coachErr[key] = { msg: e.message, ids };
      renderStories();
    });
  }
  function talkHint(ms) {
    const min = ms / 60000;
    return min >= 10 ? "That's 10 minutes. Tap stop and Share to get your feedback, or keep going if there's more."
      : min >= 5 ? "Good length. Finish the story when you're ready."
      : "Aim for 5 to 10 minutes on one story.";
  }
  const clock = (ms) => { const t = Math.floor(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
  setInterval(() => {
    if (!S.listening || !S.talkAt) return;
    const ms = Date.now() - S.talkAt, time = $("#talk-time"), hint = $("#talk-hint");
    if (time) time.textContent = clock(ms);
    if (hint && hint.textContent !== talkHint(ms)) hint.textContent = talkHint(ms);
  }, 1000);
  function savePart(text) {
    if (!S.parts.prompt) S.parts.prompt = ME.storyPrompts[S.promptIdx] || ME.storyPrompts[0];
    call(Object.assign({ intent: "story", prompt: S.parts.prompt, text, spoken: true }, replyFields())).then((v) => {
      S.parts.saved++;
      if (!applyView(v)) return;
      renderShare(true);
    }, (e) => {
      S.parts.waiting.push(text);
      stopListening();
      S.storyErr = `Part of your story isn't saved yet: ${e.message} It's kept on this page; tap Share to try again.`;
      renderShare(true);
    });
  }
  // Where to end a part: the last sentence (or else word) that fits, so no part ever passes the limit.
  function partEnd(text) {
    const room = text.slice(0, PART_AT);
    const sentence = Math.max(room.lastIndexOf(". "), room.lastIndexOf("? "), room.lastIndexOf("! "));
    if (sentence > PART_AT * 0.6) return sentence + 1;
    const word = room.lastIndexOf(" ");
    return word > PART_AT * 0.6 ? word : PART_AT;
  }
  function startListening() {
    const box = $("#story-text");
    let base = box && box.value.trim() ? box.value.trim() + " " : "";
    let heard = "", fatal = false, gotWords = false;
    const r = new SpeechRec();
    r.lang = "en-IN"; r.continuous = true; r.interimResults = true;
    r.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) heard += t.trim() + " "; else interim += t;
      }
      while ((base + heard).length >= PART_AT) {
        const all = (base + heard).trim(), cut = partEnd(all);
        savePart(all.slice(0, cut).trim());
        base = all.slice(cut).trim() + " "; heard = "";
      }
      const ta = $("#story-text");
      if (ta) ta.value = (base + heard + interim).replace(/\s+$/, "");
      if ((heard + interim).trim()) { S.spoke = true; S.quietEnds = 0; gotWords = true; }
    };
    r.onerror = (ev) => {
      const why = {
        "not-allowed": "Allow the microphone in your browser to speak your story, or type it instead.",
        "service-not-allowed": "Speaking isn't allowed in this browser. Type your story instead.",
        "audio-capture": "We couldn't find a microphone. Type your story instead.",
        "no-speech": "We didn't catch anything. Tap Speak and try again, or type it.",
        network: "Speaking needs an internet connection. Try again, or type it.",
      }[ev.error];
      if (ev.error === "no-speech" || ev.error === "aborted") return; // counted when the session ends
      if (why) { S.storyErr = why; fatal = true; }
    };
    r.onend = () => {
      if (rec !== r) { if (S.storyErr) renderShare(true); return; }
      // The browser ends a session on its own after a pause or a while: keep listening until they tap stop.
      // Sessions that keep ending with nothing heard stop after three, with a message.
      if (!gotWords) S.quietEnds = (S.quietEnds || 0) + 1;
      if (!fatal && S.quietEnds >= 3) S.storyErr = S.spoke ? "Listening stopped after a quiet spell. Tap Speak to carry on, or Share." : "We didn't catch anything. Tap Speak and try again, or type it.";
      else if (!fatal) { rec = null; startListening(); if (S.listening) return; }
      rec = null; S.listening = false; renderShare(true);
    };
    rec = r; S.listening = true; S.storyErr = "";
    if (!S.talkAt) S.talkAt = Date.now();
    try { r.start(); } catch (e) { rec = null; S.listening = false; S.storyErr = "We couldn't start the microphone. Type your story instead."; }
  }
  function renderShare(keepText) {
    const ta = $("#story-text");
    const text = keepText && ta ? ta.value : "";
    const prompts = ME.storyPrompts;
    const pr = prompts[S.promptIdx] || prompts[0];
    const ms = S.talkAt ? Date.now() - S.talkAt : 0;
    const asking = askingForStories();
    $("#share").classList.toggle("is-listening", S.listening);
    $("#share").classList.toggle("is-asking", asking);
    $("#share").innerHTML = `
      <div class="card-head"><h2 class="card-title" id="share-title">${asking ? "Finish joining: tell us about yourself" : "Share an experience"}</h2>${asking ? `<span class="chip chip-next">${S.stories.length} of ${ME.storiesWanted} shared</span>` : `<span class="chip chip-good">${ic("check", "ic-sm")}You're in</span>`}</div>
      <div class="prompt-box ${S.reply ? "is-reply" : ""}">
        <div class="prompt-top">
          ${S.reply
            ? `<span class="kicker">${ic("comment")}Follow-up on your story</span>
          <button class="btn-link" type="button" data-act="reply-cancel">Back to the questions</button>`
            : `<span class="kicker">${ic("bulb")}Question ${S.promptIdx + 1} of ${prompts.length}</span>
          <button class="btn-link" type="button" data-act="prompt-next">Another question${ic("arrow", "ic-sm")}</button>`}
        </div>
        <p class="prompt-text" id="prompt-text">${esc(S.reply ? S.reply.question : pr)}</p>
      </div>
      ${canSpeak() && !S.listening && !text && !S.parts.saved ? `<p class="talk-guide">Talk about one real moment for 5 to 10 minutes: where you were, who was there, what you did and what happened next. When you share it, you'll get written feedback on what we can use.</p>` : ""}
      ${S.listening ? `<p class="talk-status"><span class="talk-time" id="talk-time">${clock(ms)}</span><span id="talk-hint" role="status">${talkHint(ms)}</span></p>` : ""}
      <label class="sr-only" for="story-text">Your story</label>
      <textarea id="story-text" rows="4" aria-describedby="prompt-text story-err" placeholder="${S.listening ? "Listening. Start talking and we'll write it here." : canSpeak() ? "Type your story, or tap Speak and talk. Where it happened, what you did, what came next." : "Type your story here: where it happened, what you did, what came next."}">${esc(text)}</textarea>
      <p class="err" id="story-err">${S.storyErr ? ic("alert") + esc(S.storyErr) : ""}</p>
      ${(S.spoke || S.parts.saved) && !S.listening ? `<p class="names-note">${ic("alert", "ic-sm")}<span>Check the names of companies, colleges and people before you share. Speech-to-text often gets them wrong: tap <b>Type or edit</b> to fix them.</span></p>` : ""}
      ${S.parts.saved ? `<p class="parts-note" role="status">${ic("check-circle", "ic-sm")}${S.parts.saved === 1 ? "The first part of your story is saved." : `${S.parts.saved} parts of your story are saved.`}${S.listening ? " Keep talking." : " Share the rest when you're done."}</p>` : ""}
      <div class="share-actions">
        ${canSpeak() ? `<button class="mic" type="button" data-act="mic" aria-pressed="${S.listening}">
          <span class="mic-ring">${ic("mic")}</span>
          <span>${S.listening ? "Tap to stop" : "Speak"}</span>
          <span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>
        <button class="btn btn-secondary" type="button" data-act="type">${ic("keyboard", "ic-sm")}Type or edit</button>` : ""}
        <button class="btn btn-primary" type="button" data-act="story-save">Share</button>
      </div>
      ${canSpeak() ? `<p class="voice-note">Speaking uses your browser's speech service (Google on Chrome and Android, Apple on iPhone) to turn your voice into text. Check the text, then share it.</p>` : ""}
      <div class="stories" id="stories"></div>`;
    renderStories();
  }

  // The list of stories, with each talk's read-back. Drawn on its own, so feedback arriving never
  // disturbs a story being typed or spoken in the box above.
  function coachBlock(s) {
    const c = s.coach, id = esc(s.id);
    const answered = (q) => S.stories.some((x) => x.replyTo === s.id && x.prompt === q);
    const list = (lines) => `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
    return `<div class="coach" id="coach-${id}">
        <div class="coach-sec"><p class="coach-h">What we heard</p>${list(c.heard)}</div>
        <div class="coach-sec is-use"><p class="coach-h">${ic("check-circle")}What we can use for posts</p>${c.useful.length ? list(c.useful) : `<p class="coach-none">Nothing we can post yet. The questions below will get us there.</p>`}</div>
        ${c.skip.length ? `<div class="coach-sec is-skip"><p class="coach-h">${ic("x")}What we'll leave out</p>${list(c.skip)}</div>` : ""}
        <div class="coach-sec is-next"><p class="coach-h">${ic("comment")}Tell us more</p>
          <ol class="coach-q">${c.next.map((q, i) => `<li><span>${esc(q)}</span>${answered(q)
            ? `<span class="chip chip-good">${ic("check", "ic-sm")}Answered</span>`
            : `<button class="btn btn-secondary btn-sm" type="button" data-act="coach-answer" data-story="${id}" data-q="${i}">${canSpeak() ? ic("mic", "ic-sm") : ""}Answer</button>`}</li>`).join("")}</ol>
        </div>
        ${c.tip ? `<p class="coach-tip">${ic("bulb")}<span><b>Next time:</b> ${esc(c.tip)}</span></p>` : ""}
      </div>`;
  }
  function coachArea(s) {
    const id = esc(s.id), err = S.coachErr[s.id];
    if (S.coachBusy.has(s.id) || s.reading) return `<p class="coach-reading" role="status"><span class="coach-dot" aria-hidden="true"></span>Reading what you shared. Your feedback comes in a few seconds.</p>`;
    if (s.coach) {
      const open = S.coachOpen.has(s.id);
      return `<button class="btn-link coach-toggle" type="button" data-act="coach-toggle" data-story="${id}" aria-expanded="${open}" aria-controls="coach-${id}">${ic("bulb", "ic-sm")}${open ? "Hide feedback" : "See feedback"}</button>${open ? coachBlock(s) : ""}`;
    }
    if (err) return `<p class="err coach-err">${ic("alert")}${esc(err.msg)} <button class="btn-link" type="button" data-act="coach-get" data-story="${id}">Try again</button></p>`;
    if (s.canCoach) return `<button class="btn-link coach-toggle" type="button" data-act="coach-get" data-story="${id}">${ic("bulb", "ic-sm")}Get feedback</button>`;
    return "";
  }
  function renderStories() {
    const box = $("#stories");
    if (!box) return;
    // A long story (a long talk saved in parts) shows its first lines until they ask for all of it.
    // A name in a shared story can be fixed (speech-to-text mishears companies, colleges, places, people and
    // events). Only names: the server swaps a short phrase that's in the story for another, everywhere it appears.
    const editing = (s) => S.storyEdit && S.storyEdit.id === s.id;
    // Capitalised words and runs of them ("Jain University", "Peakloop"): the likely names, offered as picks.
    // A run breaks at everyday words ("I", "The"), and a sentence's usual first words ("During", "After") aren't names.
    const PLAIN = new Set(["I", "I'm", "I've", "I'd", "I'll", "A", "An", "The", "My", "We", "It", "So", "But", "And", "This", "That", "Then", "When", "In", "On", "At", "If", "Our", "Of"]);
    const OPENERS = new Set(("during after before today yesterday tomorrow last next these those when while then also now there here every each " +
      "one two three first second finally later once since because although though however what why how where who which they he she you your his " +
      "her their its as with for from to by all some most many few even just still yes no not never always sometimes over back looking working " +
      "being having getting doing going after everyone nobody somebody people students college school class week month year").split(" "));
    const namesIn = (t) => {
      const out = [], words = [...t.matchAll(/[\p{L}\p{N}][\p{L}\p{N}&'.-]*/gu)];
      let run = [], last = -2;
      const flush = () => { if (run.length && !(run.length === 1 && run[0].start && OPENERS.has(run[0].w.toLowerCase()))) out.push(run.map((r) => r.w).join(" ")); run = []; };
      words.forEach((m, i) => {
        const w = m[0].replace(/[.'-]+$/, ""), at = m.index, before = t.slice(0, at).trimEnd();
        const name = /^\p{Lu}/u.test(w) && !PLAIN.has(w);
        const joined = i === last + 1 && /^\s+$/.test(t.slice(words[i - 1].index + words[i - 1][0].length, at)) && !/[.!?,;:]$/.test(words[i - 1][0]);
        if (!name || !joined) flush();
        if (name) { run.push({ w, start: !before || /[.!?]$/.test(before) }); last = i; }
      });
      flush();
      return [...new Set(out)].slice(0, 12);
    };
    const stories = S.stories.map((s) => `<li class="story" tabindex="-1" data-story-id="${esc(s.id)}">
        <p class="st-prompt">${s.replyTo ? `<span class="st-follow">Follow-up:</span> ` : ""}${esc(s.prompt)}</p>
        ${editing(s) ? `<p class="st-text">${esc(s.text)}</p>
        <div class="st-edit">
          <p class="panel-help" id="st-edit-help-${esc(s.id)}">Only names can be fixed here: companies, colleges, places, people and events. Posts still to come use your fix.</p>
          ${namesIn(s.text).length ? `<div class="st-names" role="group" aria-label="Names in this story">${namesIn(s.text).map((n) => `<button class="chip st-name" type="button" data-act="story-name-pick" data-story="${esc(s.id)}" data-name="${esc(n)}">${esc(n)}</button>`).join("")}</div>` : ""}
          <div class="st-fields">
            <label for="st-from-${esc(s.id)}">Name as it's written<input id="st-from-${esc(s.id)}" type="text" maxlength="60" autocomplete="off" value="${esc(S.storyEdit.from || "")}" aria-describedby="st-edit-help-${esc(s.id)} st-edit-err-${esc(s.id)}"></label>
            <label for="st-to-${esc(s.id)}">The right name<input id="st-to-${esc(s.id)}" type="text" maxlength="60" autocomplete="off" value="${esc(S.storyEdit.to || "")}" aria-describedby="st-edit-err-${esc(s.id)}"></label>
          </div>
          <p class="err" id="st-edit-err-${esc(s.id)}">${S.storyEdit.err ? ic("alert") + esc(S.storyEdit.err) : ""}</p>
          <div class="panel-actions">
            <button class="btn btn-ghost" type="button" data-act="story-edit-cancel" data-story="${esc(s.id)}">Cancel</button>
            <button class="btn btn-primary" type="button" data-act="story-edit-save" data-story="${esc(s.id)}">Fix the name</button>
          </div>
        </div>` : `<p class="st-text ${s.text.length > 400 && !S.storyOpen.has(s.id) ? "is-clamped" : ""}" id="st-${esc(s.id)}">${esc(s.text)}</p>
        ${s.text.length > 400 ? `<button class="btn-link st-more" type="button" data-act="story-more" data-story="${esc(s.id)}" aria-controls="st-${esc(s.id)}" aria-expanded="${S.storyOpen.has(s.id)}">${S.storyOpen.has(s.id) ? "Show less" : "Show all"}</button>` : ""}`}
        <p class="st-meta">${ic(s.spoken ? "mic" : "keyboard")}${s.spoken ? "Spoken" : "Typed"}, ${fmt(s.createdAt.slice(0, 10), false)}${editing(s) ? "" : `<button class="btn-link st-edit-btn" type="button" data-act="story-edit" data-story="${esc(s.id)}">${ic("pen", "ic-sm")}Fix a name</button>`}</p>
        ${coachArea(s)}
      </li>`).join("");
    box.innerHTML = `
        <h3 class="sub-title">Your stories <span class="count">${S.stories.length}</span></h3>
        <ul class="story-list">${stories}</ul>`;
  }

  /* ---------- fellowship news */
  function renderNews() {
    const items = ME.cohortFeed.length
      ? ME.cohortFeed.map((e) => `<li><b>${esc(e.text)}</b><span>${esc(e.ago)}</span></li>`).join("")
      : `<li><span>Nothing new in the last 7 days.</span></li>`;
    $("#news").innerHTML = `
      <div class="card-head"><h2 class="card-title" id="news-title">Fellowship news</h2></div>
      <div class="news-hi">${ic("trend")}<div>${ME.cohortPosition ? `<b>${esc(ME.cohortPosition)}</b>` : ""}<span>${ME.cohortPostedThisWeek} of ${ME.cohortSize} ${ME.cohortSize === 1 ? "fellow has" : "fellows have"} posted this week</span></div></div>
      <div class="news-group">
        <p class="kicker">Latest in ${ME.cohort ? esc(ME.cohort) : "the fellowship"}</p>
        <ul class="news-list">${items}</ul>
      </div>`;
  }

  /* ---------- Understand LinkedIn's algorithm: what we're seeing on the fellow's own posts, then one tip a
     week (lifted out of the read below, which stays as it is). Every line comes from their own numbers, and
     a line shows only when its numbers exist. */
  function postsWithNumbers() {
    const seen = new Map();
    for (const w of ME.history) for (const p of w.posts) if (p.metrics) seen.set(p.id, p);
    for (const p of S.posts) if (p.status === "posted" && p.metrics) seen.set(p.id, p);
    return [...seen.values()];
  }
  const share = (x) => Math.round(x * 100) + "%";
  function renderLearn() {
    const box = $("#learn-you");
    if (!box) return;
    const posts = postsWithNumbers(), lines = [];
    const avg = (list) => Math.round(list.reduce((s, p) => s + p.metrics.impressions, 0) / list.length);
    if (posts.length) {
      const best = posts.reduce((a, b) => (b.metrics.impressions > a.metrics.impressions ? b : a));
      lines.push(`Your best post so far: <b>${esc(best.title)}</b>, ${nf(best.metrics.impressions)} impressions.`);
    }
    if (posts.length >= 2) lines.push(`Your posts average <b>${nf(avg(posts))}</b> impressions.`);
    const own = posts.filter((p) => p.kind !== "studojo"), withUs = posts.filter((p) => p.kind === "studojo");
    if (own.length && withUs.length) lines.push(`Posts about you average ${nf(avg(own))} impressions; posts with Studojo, ${nf(avg(withUs))}.`);
    const comments = posts.reduce((s, p) => s + (p.metrics.comments || 0), 0);
    if (comments) lines.push(`Your posts have drawn ${plural(comments, "comment")} so far.`);
    const a = ME.analytics;
    if (a && a.impressions != null) {
      const span = a.periodStart && a.periodEnd ? `${fmt(a.periodStart, false)} to ${fmt(a.periodEnd, false)}` : "your last export";
      const bits = [`${nf(a.impressions)} impressions`];
      if (a.membersReached != null) bits.push(`${nf(a.membersReached)} people reached`);
      if (a.newFollowers != null) bits.push(`${nf(a.newFollowers)} new ${a.newFollowers === 1 ? "follower" : "followers"}`);
      lines.push(`${span}: ${bits.join(", ")}.`);
    }
    const who = a && a.audience;
    if (who && who.jobTitle) lines.push(`Most common job title among your viewers: <b>${esc(who.jobTitle.value)}</b> (${share(who.jobTitle.pct)}).`);
    if (who && who.location) lines.push(`Where most of them were: <b>${esc(who.location.value)}</b> (${share(who.location.pct)}).`);
    if (who && who.industry) lines.push(`Their top industry: <b>${esc(who.industry.value)}</b> (${share(who.industry.pct)}).`);
    const c = S.conn;
    if (c.atJoin != null && c.now != null && c.now !== c.atJoin) {
      lines.push(`Connections: ${nf(c.atJoin)} when you joined, ${nf(c.now)} now (${c.now > c.atJoin ? "+" : ""}${nf(c.now - c.atJoin)}).`);
    }
    box.innerHTML = `<h3 class="learn-h">${ic("chart", "ic-sm")}What we're seeing on your posts</h3>
      ${lines.length ? `<ul class="learn-lines">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>` : `<p class="learn-empty">Once your posts have numbers, what works for you shows here.</p>`}`;
    renderTip();
  }
  // This week's tip: the read's sections and the creators' tips, one a week in order from the fellow's first week.
  let tips = null;
  function renderTip() {
    const list = $("#learn .learn-list"), box = $("#learn-tip");
    if (!list || !box) return;
    if (!tips) {
      tips = [];
      for (const d of list.querySelectorAll("details")) {
        const body = d.querySelector(".learn-body"), items = body.querySelectorAll("li");
        if (items.length) items.forEach((li) => tips.push({ title: li.textContent, html: "", note: (body.querySelector(".learn-note") || {}).textContent || "", from: null }));
        else tips.push({ title: d.querySelector("summary").textContent, html: body.innerHTML, note: "", from: d });
      }
    }
    if (!tips.length) return;
    const tip = tips[(Math.max(1, WEEK_NO) - 1) % tips.length];
    list.querySelectorAll("details").forEach((d) => { d.hidden = d === tip.from; });
    box.innerHTML = `<p class="learn-tip-k">${ic("bulb", "ic-sm")}This week's tip</p>
      <h3 class="learn-tip-t">${esc(tip.title)}</h3>
      ${tip.html ? `<div class="learn-body">${tip.html}</div>` : tip.note ? `<p class="learn-note">${esc(tip.note)}</p>` : ""}`;
    box.hidden = false;
  }

  /* ---------- "What you've told us": every story they've shared, opened from their name. Their own words and
     the read-backs of them only; the team's notes about them never reach this page. */
  function renderTold() {
    const list = S.stories; // newest first
    const words = list.filter((s) => s.spoken).reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0);
    const mins = Math.round(words / 130); // about how fast people talk
    const talk = !words ? "" : mins < 1 ? ", under a minute of talking" : `, about ${plural(mins, "minute")} of talking`;
    const items = list.map((s) => `<article class="told-item">
        <p class="told-q">${s.replyTo ? "Follow-up: " : ""}${esc(s.prompt)}</p>
        <p class="told-meta">${ic(s.spoken ? "mic" : "keyboard", "ic-sm")}${s.spoken ? "Spoken" : "Typed"}, ${fmt(s.createdAt.slice(0, 10), false)}</p>
        <p class="told-text">${esc(s.text)}</p>
        <button class="btn-link told-edit" type="button" data-act="told-edit" data-story="${esc(s.id)}">${ic("pen", "ic-sm")}Fix a name</button>
        ${s.coach && s.coach.heard.length ? `<div class="told-heard"><p class="told-heard-k">What we heard</p><ul>${s.coach.heard.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : ""}
      </article>`).join("");
    $("#told-body").innerHTML = `
      <div class="told-top">
        <p class="told-count">${list.length ? plural(list.length, "story", "stories") + talk : "No stories yet"}</p>
        <button class="btn btn-primary btn-sm" type="button" data-act="told-share">${ic("mic", "ic-sm")}Share another</button>
      </div>
      ${list.length ? items : `<p class="told-empty">Nothing yet. What you share in Stories shows here.</p>`}
      ${list.length >= 50 ? `<p class="told-empty">These are your latest 50.</p>` : ""}`;
  }
  $("#told").addEventListener("click", (ev) => { if (ev.target === ev.currentTarget) ev.currentTarget.close(); });

  /* ---------- activity (earlier weeks) */
  function renderActivity() {
    const weeks = ME.history;
    if (!weeks.length) {
      $("#activity").innerHTML = `<h2 class="card-title" id="act-title">Your activity</h2>
        <p class="card-sub">Your earlier weeks will show here.</p>`;
      return;
    }
    const open = (id, kind) => S.histOpen === id && S.histKind === kind;
    const blocks = weeks.map((w) => {
      // Posts that never went up come first: they can still be posted and marked, late.
      const missed = (w.missed || []).map((m) => `<li class="act-item is-missed" id="act-${m.id}" tabindex="-1">
          <p class="act-when"><b>${m.day}</b>${fmt(m.date, false)}</p>
          <div>
            <p class="act-title">${esc(m.title)}</p>
            <p class="act-missed">Not marked as posted</p>
          </div>
          <p class="act-nums">
            <button class="btn btn-ghost btn-sm" type="button" data-act="hist-copy" data-id="${m.id}" aria-label="Copy ${esc(m.title)}"${hasPhoto(m) && !m.yourVersion ? "" : ` aria-disabled="true" aria-describedby="phnote-${m.id}"`}>${ic("copy")}Copy</button>
            <button class="btn btn-secondary btn-sm" type="button" data-act="hist-posted" data-id="${m.id}" aria-expanded="${open(m.id, "posted")}" aria-controls="hpanel-${m.id}" aria-label="I posted it: ${esc(m.title)}"${hasPhoto(m) && !m.yourVersion ? "" : ` aria-disabled="true" aria-describedby="phnote-${m.id}"`}>I posted it</button>
          </p>
          <div class="act-photo">${photoBlock(m)}</div>
          ${S.histOpen === m.id ? histPanel(m) : ""}
        </li>`).join("");
      const rows = w.posts.map((p) => {
        const m = p.metrics;
        return `<li class="act-item" id="act-${p.id}" tabindex="-1">
          <p class="act-when"><b>${DOW[parseD(p.postedAt).getUTCDay()]}</b>${fmt(p.postedAt.slice(0, 10), false)}</p>
          <div>
            <p class="act-title">${esc(p.title)}</p>
            ${p.kind === "studojo" ? `<p class="sj-tag"><span class="mark" aria-hidden="true">S</span>Studojo post</p>` : ""}
          </div>
          ${m ? `<p class="act-nums">
            <span class="n-imp"><b>${nf(m.impressions)}</b> impressions</span>
            ${m.reactions != null ? `<span class="n-small" title="Reactions">${ic("thumb", "ic-solid")}<span class="sr-only">Reactions:</span>${nf(m.reactions)}</span>` : ""}
            ${m.comments != null ? `<span class="n-small" title="Comments">${ic("comment")}<span class="sr-only">Comments:</span>${nf(m.comments)}</span>` : ""}
          </p>` : p.numbersDue && p.numbersDue <= TODAY
            ? `<p class="act-nums"><button class="btn btn-secondary btn-sm" type="button" data-act="hist-numbers" data-id="${p.id}" aria-expanded="${open(p.id, "numbers")}" aria-controls="hpanel-${p.id}" aria-label="Add your numbers for ${esc(p.title)}">Add your numbers</button></p>`
            : `<p class="act-nums">Numbers due ${p.numbersDue ? fmt(p.numbersDue, false) : ""}</p>`}
          ${S.histOpen === p.id ? histPanel(p) : ""}
        </li>`;
      }).join("");
      const posted = w.posts.length;
      return `<div class="act-week">
        <div class="act-week-head"><h3>${fmt(w.week, false)} to ${fmt(addDays(w.week, 6), false)}</h3>${w.complete ? `<span class="chip chip-good">${ic("check", "ic-xs")}${w.due === 1 ? "Posted" : `All ${w.due} posted`}</span>` : `<span class="chip">${posted} of ${w.due} posted</span>`}</div>
        <ul>${missed}${rows}</ul>
      </div>`;
    }).join("");
    $("#activity").innerHTML = `
      <h2 class="card-title" id="act-title">Your activity</h2>
      ${blocks}`;
  }

  function histPanel(p) {
    if (S.histKind === "posted") {
      return `<div class="panel hist-panel" id="hpanel-${p.id}">
        <label class="panel-label" for="hurl-${p.id}">Paste the link to your LinkedIn post <span class="opt">(optional)</span></label>
        <p class="panel-help" id="hurl-help-${p.id}">On LinkedIn, open your post, tap the three dots, then Copy link to post. You can add it later too.</p>
        <div class="${S.histErr ? "has-err" : ""}"><input id="hurl-${p.id}" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="linkedin.com/posts/..." value="${esc(S.histUrl || "")}" aria-describedby="hurl-help-${p.id} hurl-err-${p.id}" aria-invalid="${!!S.histErr}"></div>
        <p class="err" id="hurl-err-${p.id}">${S.histErr ? ic("alert") + esc(S.histErr) : ""}</p>
        <div class="panel-actions">
          <button class="btn btn-ghost" type="button" data-act="hist-close" data-id="${p.id}">Cancel</button>
          <button class="btn btn-primary" type="button" data-act="hist-posted-save" data-id="${p.id}">Mark as posted</button>
        </div>
      </div>`;
    }
    const d = S.histDraft || {};
    const bad = (v) => !!S.histErr && !/^\d[\d,\s]*$/.test(String(v == null ? "" : v).trim());
    return `<div class="panel hist-panel" id="hpanel-${p.id}">
      <p class="panel-label" id="hnum-title-${p.id}">Add your numbers</p>
      <p class="panel-help">On LinkedIn, open the post and tap the impressions count under it.</p>
      <div class="num-grid ${S.histErr ? "has-err" : ""}" role="group" aria-labelledby="hnum-title-${p.id}">
        <label for="himp-${p.id}">Impressions<input id="himp-${p.id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="hnum-err-${p.id}" aria-invalid="${bad(d.impressions)}" value="${d.impressions != null ? esc(d.impressions) : ""}"></label>
        <label for="hrea-${p.id}">Reactions<input id="hrea-${p.id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="hnum-err-${p.id}" aria-invalid="${bad(d.reactions)}" value="${d.reactions != null ? esc(d.reactions) : ""}"></label>
        <label for="hcom-${p.id}">Comments<input id="hcom-${p.id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="hnum-err-${p.id}" aria-invalid="${bad(d.comments)}" value="${d.comments != null ? esc(d.comments) : ""}"></label>
      </div>
      <p class="err" id="hnum-err-${p.id}">${S.histErr ? ic("alert") + esc(S.histErr) : ""}</p>
      <div class="panel-actions">
        <button class="btn btn-ghost" type="button" data-act="hist-close" data-id="${p.id}">Cancel</button>
        <button class="btn btn-primary" type="button" data-act="hist-numbers-save" data-id="${p.id}">Save numbers</button>
      </div>
    </div>`;
  }

  /* ---------- toasts */
  function toast(msg, kind) {
    $("#toasts").innerHTML = "";
    const t = document.createElement("div");
    t.className = kind === "error" ? "toast is-error" : "toast";
    t.innerHTML = ic(kind === "error" ? "alert" : "check-circle") + `<span>${esc(msg)}</span>`;
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), 3600);
  }

  function copyNow(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return copyNow(text); }
  }

  /* ---------- Post on LinkedIn: LinkedIn's composer with the post filled in. The text parameter is not
     documented by LinkedIn and phones often open the app without it, so the post is always copied as well.
     A very long post opens the empty composer (LinkedIn's server takes about 8,000 characters of address). */
  const COMPOSE = "https://www.linkedin.com/feed/?shareActive=true";
  function composeUrl(p) {
    const url = COMPOSE + "&text=" + encodeURIComponent(postText(p));
    return url.length <= 8000 ? url : COMPOSE;
  }
  // When the fellow comes back from LinkedIn, ask whether the post went out.
  function cameBack() {
    if (!S.away || !S.away.left) return;
    const p = byId(S.away.id); S.away = null;
    if (!p || p.status !== "ready" || $("#ask").open) return;
    S.asking = p.id;
    $("#ask-sub").textContent = `${dowLong(p.date)}'s post: ${p.title}`;
    $("#ask-url").value = ""; $("#ask-url").removeAttribute("aria-invalid"); $("#ask-err").innerHTML = "";
    $('[data-act="ask-yes"]').disabled = false;
    $("#ask").showModal();
  }
  function closeAsk() {
    const id = S.asking; S.asking = null;
    if ($("#ask").open) $("#ask").close();
    focusEl(`#post-${id} [data-act="posted"]`);
  }
  document.addEventListener("visibilitychange", () => { if (!S.away) return; if (document.hidden) S.away.left = true; else cameBack(); });
  window.addEventListener("blur", () => { if (S.away) S.away.left = true; });
  window.addEventListener("focus", cameBack);
  $("#ask").addEventListener("cancel", (ev) => { ev.preventDefault(); closeAsk(); });

  function markedPosted(p) {
    rerenderPost(p.id); refreshProgress(); renderNews();
    // The next post is now "Up next". A card with a panel open keeps what's typed and catches up when it closes.
    const nx = nextPost(); if (nx && !nx.panel) rerenderPost(nx.id);
    focusEl("#post-" + p.id);
    toast(weekDone()
      ? `${ME.thisWeek.due === 1 ? "That's your post for this week." : `That's all ${ME.thisWeek.due} posts this week.`} Your weekly run is now ${plural(run(), "week")}.`
      : `${dowLong(p.date)}'s post is marked as posted. Add your numbers on ${p.numbersDue ? fmt(p.numbersDue) : "in a week"}.`);
  }
  function refreshProgress() { renderTop(); renderProfile(); renderCover(); renderMilestones(); }
  function goTo(id) {
    const el = $("#post-" + id);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
  }
  const toInt = (v) => { const s = String(v).replace(/[,\s]/g, ""); return /^\d+$/.test(s) ? parseInt(s, 10) : NaN; };
  const focusEl = (sel) => { const el = $(sel); if (el) el.focus(); return !!el; };
  function closeHist() {
    const id = S.histOpen, kind = S.histKind;
    S.histOpen = null; S.histKind = null; S.histErr = ""; S.histDraft = null; S.histUrl = "";
    renderActivity();
    focusEl(`[data-act="hist-${kind}"][data-id="${id}"]`);
  }

  /* ---------- events */
  document.addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-act]");
    if (!b || b.tagName === "INPUT") return;
    const act = b.dataset.act, id = b.dataset.id, p = id ? byId(id) : null;
    if (b.getAttribute("aria-disabled") === "true") { ev.preventDefault(); needPhoto(id); return; }

    if (act === "goto-next") { const n = nextPost(); if (n) goTo(n.id); else toast(ME.thisWeek.due ? allPosts(ME.thisWeek.due, "done") + " this week." : NO_POSTS); return; }
    if (act === "goto") { goTo(id); return; }
    if (act === "tab") { if (phone.matches) showTab(b.dataset.tab); else goToSection(b.dataset.tab); return; }
    if (act === "told") { renderTold(); $("#told").showModal(); $("#told-body").scrollTop = 0; focusEl('[data-act="told-close"]'); return; }
    if (act === "told-close") { $("#told").close(); return; }
    if (act === "told-share") {
      $("#told").close();
      if (phone.matches) showTab("stories"); else goToSection("stories");
      focusEl("#story-text");
      return;
    }
    if (act === "more") { p.expanded = true; rerenderPost(id); const body = $("#body-" + id); if (body) { body.setAttribute("tabindex", "-1"); body.focus(); } return; }
    if (act === "share") {
      if (!hasPhoto(p)) { ev.preventDefault(); return; }
      // The link itself opens LinkedIn in a new tab; the copy runs first and synchronously, before that tab takes focus.
      const text = postText(p);
      b.href = composeUrl(p);
      if (!copyNow(text) && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
      S.away = { id, left: false };
      if (!p.copied) { p.copied = true; call({ intent: "copied", postId: id }).catch(() => {}); setTimeout(() => { rerenderPost(id); renderCover(); }, 0); }
      return;
    }
    if (act === "photo-add") { if (S.photoBusy) return; pick = id; $("#photo-file").click(); return; }
    if (act === "analytics-add") { if (!S.anBusy) $("#analytics-file").click(); return; }
    if (act === "photo-remove") {
      b.disabled = true;
      try {
        const v = await send(`${API}/proof?post=${encodeURIComponent(id)}&photo=${encodeURIComponent(b.dataset.photo)}`, { method: "DELETE", headers: { Accept: "application/json" } });
        if (!applyView(v)) return;
      } catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      refreshPhoto(id);
      focusEl(`[data-act="photo-add"][data-id="${id}"]`);
      toast(hasPhoto(imagePost(id) || {}) ? "Photo removed." : "Photo removed. The post is locked until it has a photo again.");
      return;
    }
    if (act === "photo-help") {
      b.disabled = true;
      try { if (!applyView(await call({ intent: "photo-help", postId: id }))) return; }
      catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      S.stockFocus = id;
      refreshPhoto(id);
      return;
    }
    if (act === "stock-search") {
      const st = S.stock[id], v = ($("#stkq-" + id) || {}).value || "";
      if (!st) return;
      if (!v.trim()) { focusEl("#stkq-" + id); return; }
      st.qDraft = null; S.stockFocus = id;
      loadStock(id, v.trim()); refreshPhoto(id);
      return;
    }
    if (act === "stock-picks") { const st = S.stock[id]; if (!st) return; st.qDraft = ""; loadStock(id); refreshPhoto(id); focusEl("#stkq-" + id); return; }
    if (act === "stock-sel") {
      const st = S.stock[id]; if (!st) return;
      st.sel = Number(b.dataset.i); refreshPhoto(id); focusEl(`[data-act="stock-use"][data-id="${id}"]`);
      return;
    }
    if (act === "stock-unsel") { const st = S.stock[id]; if (!st) return; const was = st.sel; st.sel = null; refreshPhoto(id); focusEl(`[data-act="stock-sel"][data-id="${id}"][data-i="${was}"]`); return; }
    if (act === "stock-retry") {
      const st = S.stock[id]; if (!st) return;
      if (st.mode === "search") loadStock(id, st.q); else { st.picks = null; loadStock(id); }
      S.stockFocus = id; refreshPhoto(id);
      return;
    }
    if (act === "stock-use") {
      const st = S.stock[id], pick = st && st.sel != null && st.list[st.sel];
      if (!pick || st.busy) return;
      st.busy = "use"; refreshPhoto(id);
      try { if (!applyView(await call({ intent: "stock-use", postId: id, stockId: pick.id }))) return; }
      catch (e) { st.busy = null; refreshPhoto(id); focusEl(`[data-act="stock-use"][data-id="${id}"]`); toast(e.message, "error"); return; }
      delete S.stock[id];
      refreshPhoto(id);
      focusEl(`[data-act="share"][data-id="${id}"]`) || focusEl(`[data-act="hist-copy"][data-id="${id}"]`);
      toast("Photo added, so the post is unlocked. Add the same photo when you post it on LinkedIn.");
      return;
    }
    if (act === "ask-no") { closeAsk(); toast("No problem. It stays here until you post it."); return; }
    if (act === "ask-yes") {
      const ap = byId(S.asking), raw = $("#ask-url").value.trim();
      if (!ap) { closeAsk(); return; }
      const askErr = (msg) => { $("#ask-err").innerHTML = ic("alert") + esc(msg); $("#ask-url").setAttribute("aria-invalid", "true"); $("#ask-url").focus(); };
      if (raw && !LINK_OK.test(raw)) { askErr("That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/"); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "posted", postId: ap.id, url: raw }))) return; }
      catch (e) { b.disabled = false; askErr(e.message); return; }
      S.asking = null; $("#ask").close();
      ap.panel = null; ap.err = ""; ap.urlDraft = "";
      markedPosted(ap);
      return;
    }
    if (act === "copy") {
      if (!hasPhoto(p)) return;
      const ok = await copyText(postText(p));
      if (!ok) { toast("Couldn't copy. Tap see more, then select the text.", "error"); return; }
      p.copied = true; rerenderPost(id, '[data-act="posted"]'); renderCover();
      call({ intent: "copied", postId: id }).catch(() => {});
      toast("Copied. Paste it into a new post on LinkedIn.");
      return;
    }
    if (act === "line" || act === "posted" || act === "numbers" || act === "rewrite") {
      p.panel = p.panel === act ? null : act; p.err = ""; p.draft = null; p.lineDraft = null; p.rewriteDraft = null;
      rerenderPost(id, p.panel ? (act === "line" || act === "rewrite" ? "textarea" : "input") : `[data-act="${act}"]`);
      return;
    }
    if (act === "rewrite-send") {
      const v = $("#rw-" + id).value.trim();
      if (v.length < 40) { p.err = "Write out your whole version of the post before you send it."; p.rewriteDraft = v; rerenderPost(id, "textarea"); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "rewrite", postId: id, text: v }))) return; }
      catch (e) { p.err = e.message; p.rewriteDraft = v; rerenderPost(id, "textarea"); return; }
      p.panel = null; p.err = ""; p.rewriteDraft = null; p.showVersion = false;
      rerenderPost(id, `[data-act="rewrite-see"][data-id="${id}"]`); renderCover();
      toast("Sent. Studojo will read your version, and you'll post it once it's approved.");
      return;
    }
    if (act === "rewrite-see") { p.showVersion = !p.showVersion; rerenderPost(id, `[data-act="rewrite-see"][data-id="${id}"]`); return; }
    if (act === "rewrite-withdraw") {
      b.disabled = true;
      try { if (!applyView(await call({ intent: "rewrite-withdraw", postId: id }))) return; }
      catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      p.showVersion = false;
      rerenderPost(id, `[data-act="rewrite"][data-id="${id}"]`); renderCover();
      toast("Withdrawn. You can post the original now.");
      return;
    }
    if (act === "close") { const was = p.panel; p.panel = null; p.err = ""; p.lineDraft = null; p.rewriteDraft = null; rerenderPost(id, `[data-act="${was}"]`); return; }
    if (act === "line-save" || act === "line-remove") {
      const v = act === "line-remove" ? "" : $("#line-" + id).value.trim().replace(/\s+/g, " ");
      b.disabled = true;
      try { if (!applyView(await call({ intent: "line", postId: id, line: v }))) return; }
      catch (e) { p.err = e.message; p.lineDraft = act === "line-remove" ? null : v; rerenderPost(id, "textarea"); return; }
      p.panel = null; p.err = ""; p.lineDraft = null; if (v) p.expanded = true;
      rerenderPost(id, '[data-act="line"]');
      toast(act === "line-remove" ? "Your line is removed." : v ? "Your line is added at the top of the post." : "No line added. The post stays as it is.");
      return;
    }
    if (act === "posted-save") {
      const raw = $("#url-" + id).value.trim(), adding = p.status === "posted";
      if (!raw && adding) { p.err = "Paste the link to your post first."; rerenderPost(id, "input"); return; }
      if (raw && !LINK_OK.test(raw)) { p.err = "That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/"; p.urlDraft = raw; rerenderPost(id, "input"); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "posted", postId: id, url: raw }))) return; }
      catch (e) { p.err = e.message; p.urlDraft = raw; rerenderPost(id, "input"); return; }
      p.panel = null; p.err = ""; p.urlDraft = "";
      if (adding) { rerenderPost(id); focusEl("#post-" + id); toast("Link saved."); return; }
      markedPosted(p);
      return;
    }
    if (act === "numbers-save") {
      const raw = { impressions: $("#imp-" + id).value.trim(), reactions: $("#rea-" + id).value.trim(), comments: $("#com-" + id).value.trim() };
      const imp = toInt(raw.impressions), rea = toInt(raw.reactions), com = toInt(raw.comments);
      if ([imp, rea, com].some((n) => isNaN(n))) {
        p.draft = raw; p.err = "Add impressions, reactions and comments as whole numbers. Use 0 if there were none.";
        const firstBad = isNaN(imp) ? "#imp-" : isNaN(rea) ? "#rea-" : "#com-";
        rerenderPost(id, firstBad + id); return;
      }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "numbers", postId: id, impressions: imp, reactions: rea, comments: com }))) return; }
      catch (e) { p.draft = raw; p.err = e.message; rerenderPost(id, "#imp-" + id); return; }
      p.panel = null; p.err = ""; p.draft = null;
      rerenderPost(id, '[data-act="numbers"]'); renderActivity();
      toast("Numbers saved. Thank you.");
      return;
    }
    if (act === "conn-edit") { S.conn.editing = !S.conn.editing; S.conn.err = ""; renderProfile(); const f = S.conn.editing ? $("#conn-input") : $('[data-act="conn-edit"]'); if (f) f.focus(); return; }
    if (act === "conn-cancel") { S.conn.editing = false; S.conn.err = ""; renderProfile(); $('[data-act="conn-edit"]').focus(); return; }
    if (act === "conn-save") {
      const n = toInt($("#conn-input").value);
      if (isNaN(n)) { S.conn.err = "Enter your connections as a whole number."; renderProfile(); $("#conn-input").focus(); return; }
      if (n > 30000) { S.conn.err = "LinkedIn allows up to 30,000 connections. Check the number and try again."; renderProfile(); $("#conn-input").focus(); return; }
      const before = S.conn.now;
      b.disabled = true;
      try { if (!applyView(await call({ intent: "connections", connections: n }))) return; }
      catch (e) { S.conn.err = e.message; renderProfile(); $("#conn-input").focus(); return; }
      S.conn.editing = false; S.conn.err = "";
      renderProfile(); $('[data-act="conn-edit"]').focus();
      toast(before == null ? `Connections saved: ${nf(n)}.` : n === before ? "Connections checked. No change." : `Connections updated from ${nf(before)} to ${nf(n)}.`);
      return;
    }
    if (act === "hist-numbers" || act === "hist-posted") {
      const kind = act.slice(5), same = S.histOpen === id && S.histKind === kind;
      S.histOpen = same ? null : id; S.histKind = same ? null : kind; S.histErr = ""; S.histDraft = null; S.histUrl = "";
      renderActivity();
      focusEl(S.histOpen ? (kind === "numbers" ? "#himp-" : "#hurl-") + id : `[data-act="${act}"][data-id="${id}"]`);
      return;
    }
    if (act === "hist-close") { closeHist(); return; }
    if (act === "hist-numbers-save") {
      const raw = { impressions: $("#himp-" + id).value.trim(), reactions: $("#hrea-" + id).value.trim(), comments: $("#hcom-" + id).value.trim() };
      const imp = toInt(raw.impressions), rea = toInt(raw.reactions), com = toInt(raw.comments);
      if ([imp, rea, com].some((n) => isNaN(n))) {
        S.histDraft = raw; S.histErr = "Add impressions, reactions and comments as whole numbers. Use 0 if there were none.";
        renderActivity(); focusEl((isNaN(imp) ? "#himp-" : isNaN(rea) ? "#hrea-" : "#hcom-") + id); return;
      }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "numbers", postId: id, impressions: imp, reactions: rea, comments: com }))) return; }
      catch (e) { S.histDraft = raw; S.histErr = e.message; renderActivity(); focusEl("#himp-" + id); return; }
      S.histOpen = null; S.histKind = null; S.histErr = ""; S.histDraft = null;
      renderActivity(); renderNews(); focusEl("#act-" + id);
      toast("Numbers saved. Thank you.");
      return;
    }
    if (act === "hist-copy") {
      const m = missedById(id);
      if (!m || !hasPhoto(m)) return;
      if (!(await copyText(postText(m)))) { toast("Couldn't copy. Please try again.", "error"); return; }
      call({ intent: "copied", postId: id }).catch(() => {});
      toast("Copied. Post it on LinkedIn, then tap I posted it.");
      return;
    }
    if (act === "hist-posted-save") {
      const raw = $("#hurl-" + id).value.trim();
      const bad = raw && !LINK_OK.test(raw) ? "That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/" : "";
      if (bad) { S.histErr = bad; S.histUrl = raw; renderActivity(); focusEl("#hurl-" + id); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "posted", postId: id, url: raw }))) return; }
      catch (e) { S.histErr = e.message; S.histUrl = raw; renderActivity(); focusEl("#hurl-" + id); return; }
      S.histOpen = null; S.histKind = null; S.histErr = ""; S.histUrl = "";
      refreshProgress(); renderActivity(); renderNews(); focusEl("#act-" + id);
      toast(`Marked as posted. Add your numbers on ${fmt(addDays(TODAY, 7))}.`);
      return;
    }
    if (act === "howto") { S.howto = !S.howto; renderMilestones(); const h = $('[data-act="howto"]'); if (h) h.focus(); return; }
    if (act === "prompt-next") { S.promptIdx = (S.promptIdx + 1) % ME.storyPrompts.length; renderShare(true); $('[data-act="prompt-next"]').focus(); return; }
    if (act === "reply-cancel") { S.reply = null; renderShare(true); focusEl('[data-act="prompt-next"]'); return; }
    if (act === "coach-toggle") {
      const sid = b.dataset.story;
      if (S.coachOpen.has(sid)) S.coachOpen.delete(sid); else S.coachOpen.add(sid);
      renderStories(); focusEl(`[data-act="coach-toggle"][data-story="${sid}"]`);
      return;
    }
    if (act === "coach-get") {
      const sid = b.dataset.story, err = S.coachErr[sid];
      requestCoach(err && err.ids ? err.ids : [sid]);
      return;
    }
    if (act === "coach-answer") {
      // One talk at a time: an answer goes in an empty box, so it's sent with its question alone.
      const st = S.stories.find((x) => x.id === b.dataset.story), q = Number(b.dataset.q);
      if (!st || !st.coach || !st.coach.next[q]) return;
      if (S.listening || S.parts.saved || S.parts.waiting.length || $("#story-text").value.trim()) { toast("Share what's in the box first, then answer this question."); return; }
      S.reply = { to: st.id, q, question: st.coach.next[q] };
      S.storyErr = "";
      if (canSpeak()) { S.quietEnds = 0; startListening(); }
      renderShare(true);
      $("#share").scrollIntoView({ behavior: "smooth", block: "start" });
      focusEl(canSpeak() ? '[data-act="mic"]' : "#story-text");
      return;
    }
    if (act === "mic") {
      if (S.listening) stopListening(); else { S.quietEnds = 0; startListening(); }
      renderShare(true); focusEl('[data-act="mic"]');
      return;
    }
    if (act === "type") {
      if (S.listening) stopListening();
      renderShare(true);
      const ta = $("#story-text"); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
      return;
    }
    if (act === "story-edit" || act === "told-edit") {
      const sid = b.dataset.story;
      if (act === "told-edit") { $("#told").close(); if (phone.matches) showTab("stories"); else goToSection("stories"); }
      S.storyEdit = { id: sid, from: "", to: "", err: "" };
      renderStories();
      const f = $("#st-from-" + sid);
      if (f) { f.scrollIntoView({ block: "center" }); f.focus(); }
      return;
    }
    if (act === "story-name-pick") {
      const sid = b.dataset.story;
      S.storyEdit = { id: sid, from: b.dataset.name, to: $("#st-to-" + sid).value, err: "" };
      renderStories(); focusEl("#st-to-" + sid);
      return;
    }
    if (act === "story-edit-cancel") { const sid = b.dataset.story; S.storyEdit = null; renderStories(); focusEl(`[data-act="story-edit"][data-story="${sid}"]`); return; }
    if (act === "story-edit-save") {
      const sid = b.dataset.story, from = $("#st-from-" + sid).value.trim(), to = $("#st-to-" + sid).value.trim();
      if (!from || !to) { S.storyEdit = { id: sid, from, to, err: "Add the name as it's written, and the right name." }; renderStories(); focusEl((from ? "#st-to-" : "#st-from-") + sid); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "story-name", storyId: sid, from, to }))) return; }
      catch (e) { S.storyEdit = { id: sid, from, to, err: e.message }; renderStories(); focusEl("#st-from-" + sid); return; }
      S.storyEdit = null; renderStories();
      focusEl(`[data-act="story-edit"][data-story="${sid}"]`);
      toast(`Fixed: "${from}" is now "${to}". Posts still to come use it.`);
      return;
    }
    if (act === "story-more") {
      const sid = b.dataset.story;
      if (S.storyOpen.has(sid)) S.storyOpen.delete(sid); else S.storyOpen.add(sid);
      renderStories(); focusEl(`[data-act="story-more"][data-story="${sid}"]`);
      return;
    }
    if (act === "story-save") {
      if (S.listening) stopListening();
      const text = $("#story-text").value.trim();
      const prompt = S.parts.prompt || ME.storyPrompts[S.promptIdx] || ME.storyPrompts[0];
      const earlier = S.parts.saved + S.parts.waiting.length;
      if (text.length < 10 && !earlier) { S.storyErr = text ? "Write a few more words first." : "Write a few words first."; renderShare(true); $("#story-text").focus(); return; }
      b.disabled = true;
      try {
        while (S.parts.waiting.length) {
          const v = await call(Object.assign({ intent: "story", prompt, text: S.parts.waiting[0], spoken: true }, replyFields()));
          S.parts.waiting.shift(); S.parts.saved++;
          if (!applyView(v)) return;
        }
        if (text.length >= 10 && !applyView(await call(Object.assign({ intent: "story", prompt, text, spoken: S.spoke }, replyFields())))) return;
      } catch (e) { S.storyErr = e.message; renderShare(true); $("#story-text").focus(); return; }
      const parts = S.parts.saved + (text.length >= 10 ? 1 : 0);
      const joinedNow = S.stories.length >= ME.storiesWanted && S.stories.length - parts < ME.storiesWanted;
      S.listening = false; S.spoke = false; S.storyErr = ""; S.promptIdx = 0; S.parts = { saved: 0, waiting: [], prompt: null };
      S.reply = null; S.talkAt = null;
      renderShare(false); focusEl("#share .story");
      toast(joinedNow ? `You're officially in the Studojo Growth Fellowship, ${ME.first}. Your first posts arrive here once the team has written them.`
        : parts > 1 ? `Story shared in ${parts} parts. Thank you, ${ME.first}.` : "Story shared. Thank you, " + ME.first + ".");
      // The newest stories are this talk's parts: read them back together.
      requestCoach(S.stories.slice(0, parts).map((x) => x.id));
      return;
    }
  });

  // Enter in a field saves its panel; Escape closes the panel the focus is in, and only that one.
  const SAVE_FOR = { url: "posted-save", imp: "numbers-save", rea: "numbers-save", com: "numbers-save", hurl: "hist-posted-save", himp: "hist-numbers-save", hrea: "hist-numbers-save", hcom: "hist-numbers-save" };
  // What they've typed in a photo search survives the card redrawing.
  document.addEventListener("input", (ev) => { const t = ev.target; if (t && t.dataset && t.dataset.stockQ && S.stock[t.dataset.stockQ]) S.stock[t.dataset.stockQ].qDraft = t.value; });
  document.addEventListener("keydown", (ev) => {
    const t = ev.target;
    if (!t || !t.closest) return;
    if (ev.key === "Enter" && t.tagName === "INPUT" && t.dataset.stockQ) { ev.preventDefault(); const sb = $(`[data-act="stock-search"][data-id="${t.dataset.stockQ}"]`); if (sb) sb.click(); return; }
    if (ev.key === "Enter" && t.tagName === "INPUT") {
      if (t.id === "conn-input") { ev.preventDefault(); $('[data-act="conn-save"]').click(); return; }
      if (t.id === "ask-url") { ev.preventDefault(); $('[data-act="ask-yes"]').click(); return; }
      const m = /^([a-z]+)-(\d+)$/.exec(t.id), save = m && SAVE_FOR[m[1]];
      if (save) { ev.preventDefault(); const b = $(`[data-act="${save}"][data-id="${m[2]}"]`); if (b) b.click(); }
      return;
    }
    if (ev.key !== "Escape") return;
    const art = t.closest("article.post"), open = art ? byId(art.id.slice(5)) : null;
    if (open && open.panel) { const was = open.panel; open.panel = null; open.err = ""; open.lineDraft = null; rerenderPost(open.id, `[data-act="${was}"]`); return; }
    if (S.conn.editing && t.closest(".profile")) { S.conn.editing = false; S.conn.err = ""; renderProfile(); $('[data-act="conn-edit"]').focus(); return; }
    const row = t.closest(".act-item");
    if (S.histOpen && row && row.id === "act-" + S.histOpen) closeHist();
  });

  let rz;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => fitSeeMore(), 120); });

  /* ---------- phones: the LinkedIn app's layout. A search box filters this week's posts; the bottom tabs
     show one part of the page at a time (desktop shows everything, so the classes do nothing there). */
  const phone = matchMedia("(max-width: 759px)");
  const SECTIONS = {
    home: ["#notice", "#analytics", "#ed-cover", ".learn-teaser", ".feed-head", "#posts"],
    learn: ["#learn"],
    stories: ["#share"], cohort: ["#news"], updates: ["#activity"], milestones: ["#milestones"], me: ["#profile"],
  };
  let tab = "home";
  function showTab(t) {
    tab = SECTIONS[t] ? t : "home";
    const show = new Set(SECTIONS[tab]);
    if (tab === "home" && $("#share").classList.contains("is-first")) show.add("#share");
    for (const sel of Object.values(SECTIONS).flat()) { const el = $(sel); if (el) el.classList.toggle("m-off", !show.has(sel)); }
    for (const box of [".rail-left", ".rail-right", "#main"]) {
      const el = $(box);
      if (el) el.classList.toggle("m-off", ![...el.children].some((c) => !c.classList.contains("m-off")));
    }
    document.querySelectorAll("#m-tabs [data-tab], .d-nav [data-tab]").forEach((b) => { if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (phone.matches) window.scrollTo(0, 0);
  }
  // Desktop shows every section at once, so its top nav scrolls to the section instead of switching.
  const DESK_TARGET = { home: null, stories: "#share", cohort: "#news", updates: "#activity", milestones: "#milestones", me: "#profile", learn: "#learn" };
  function goToSection(t) {
    document.querySelectorAll(".d-nav [data-tab]").forEach((b) => { if (b.dataset.tab === t) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const el = DESK_TARGET[t] && $(DESK_TARGET[t]);
    if (!el) { window.scrollTo({ top: 0, behavior: smooth }); return; }
    el.scrollIntoView({ behavior: smooth, block: "start" });
  }
  function applySearch() {
    const box = $("#m-search");
    const q = box ? box.value.trim().toLowerCase() : "";
    let shown = 0;
    for (const p of S.posts) {
      const el = $("#post-" + p.id); if (!el) continue;
      const hit = !q || [p.title, p.body, p.ownLine].join(" ").toLowerCase().includes(q);
      el.hidden = !hit; if (hit) shown++;
    }
    let none = $("#search-none");
    if (!none) { none = document.createElement("p"); none.id = "search-none"; none.className = "search-none"; $("#posts").before(none); }
    none.hidden = !q || shown > 0;
    none.textContent = q ? `No post this week mentions "${box.value.trim()}".` : "";
  }
  $("#m-search").addEventListener("input", () => { if (tab !== "home") showTab("home"); applySearch(); });
  phone.addEventListener("change", () => showTab(tab));
  $("#m-avatar").textContent = ME.initials;
  $("#d-avatar").textContent = ME.initials;

  /* ---------- first render */
  $("#week-pill").hidden = false;
  if (ME.paused) { const n = $("#notice"); n.textContent = "Your fellowship is paused for now. Message the Studojo team on WhatsApp to pick it back up."; n.hidden = false; }
  if (askingForStories()) { const share = $("#share"); $("#main").insertBefore(share, $("#ed-cover")); share.classList.add("is-first"); }
  // Analytics that are due go first; the rest of the time the reminder sits under the story ask.
  if (!analyticsDue()) $("#main").insertBefore($("#analytics"), $("#ed-cover"));
  renderTop(); renderProfile(); renderAnalytics(); renderCover(); renderPosts(); renderMilestones(); renderShare(false); renderNews(); renderActivity(); renderLearn();
  showTab("home");
  $("#page").classList.add("is-ready");
  $("#main").removeAttribute("aria-busy");
  // The onboarding tour (tour.js) drives the page through these: it can open a section the way the tabs do.
  window.fellowTour = {
    slug: SLUG, first: ME.first, phone: () => phone.matches,
    open: (t) => (phone.matches ? showTab(t) : goToSection(t)),
    joined: () => S.stories.length >= ME.storiesWanted, storiesWanted: ME.storiesWanted,
    milestones: (ME.milestones || []).filter((m) => m.weeks != null).map((m) => ({ name: m.name, weeks: m.weeks })),
    focusStory: () => { const ta = $("#story-text"); if (ta) { ta.scrollIntoView({ block: "center" }); ta.focus(); } },
  };
  document.dispatchEvent(new CustomEvent("fellow:ready"));
  }
})();
