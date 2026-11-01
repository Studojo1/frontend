(function () {
  "use strict";
  // A fellow's own page. The data comes from /api/fellowship-growth/<slug> and
  // every change is saved there; the server answers with the fresh view.
  const SLUG = (location.pathname.split("/").filter(Boolean)[1] || "").toLowerCase();
  const API = "/api/fellowship-growth/" + encodeURIComponent(SLUG);

  async function call(body) {
    const opts = { headers: { Accept: "application/json" }, credentials: "omit", cache: "no-store" };
    if (body) Object.assign(opts, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
    let res;
    try { res = await fetch(API, opts); } catch (e) { throw new Error("You seem to be offline. Check your connection and try again."); }
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
      url: p.url, metrics: p.metrics, numbersDue: p.numbersDue || null,
      panel: null, expanded: false, err: "", draft: null, lineDraft: null,
    })),
    conn: { now: ME.connections.now, atJoin: ME.connections.atJoin, history: ME.connections.history.slice(), editing: false, err: "" },
    stories: ME.stories.slice(),
    promptIdx: 0, listening: false, spoke: false, storyErr: "",
    howto: false,
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
    if (v.program.today !== TODAY || ids(M.thisWeek.posts) !== ids(S.posts)) { location.reload(); return false; }
    for (const sp of M.thisWeek.posts) {
      const p = byId(sp.id);
      if (p) Object.assign(p, { status: sp.status, copied: !!sp.copiedAt, ownLine: sp.ownLine || "", postedAt: sp.postedAt, url: sp.url, metrics: sp.metrics, numbersDue: sp.numbersDue || null });
    }
    ME.thisWeek.due = M.thisWeek.due;
    Object.assign(ME, {
      weeklyRun: M.weeklyRun, completedWeeks: M.completedWeeks, milestones: M.milestones, history: M.history,
      cohortPosition: M.cohortPosition, cohortPostedThisWeek: M.cohortPostedThisWeek, cohortSize: M.cohortSize, cohortFeed: M.cohortFeed,
    });
    S.conn.now = M.connections.now; S.conn.atJoin = M.connections.atJoin; S.conn.history = M.connections.history.slice();
    S.stories = M.stories.slice();
    return true;
  }
  const postedCount = () => S.posts.filter((p) => p.status === "posted").length;
  const weekDone = () => ME.thisWeek.due > 0 && postedCount() >= ME.thisWeek.due;
  const run = () => ME.weeklyRun + (weekDone() ? 1 : 0);
  const doneWeeks = () => ME.completedWeeks + (weekDone() ? 1 : 0);
  const nextPost = () => S.posts.slice().sort((a, b) => a.date.localeCompare(b.date)).find((p) => p.status !== "posted");
  // Feed order is fixed at load: what to do next first, then what is already posted.
  const ORDER = S.posts.slice().sort((a, b) => {
    const pa = a.status === "posted", pb = b.status === "posted";
    if (pa !== pb) return pa ? 1 : -1;
    return pa ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  }).map((p) => p.id);

  // A Studojo post carries the partnership line once: at the top, unless the post already has it further down
  // (the admin panel accepts it anywhere in the post).
  const labelAtTop = (p) => p.kind === "studojo" && (p.body.startsWith(LABEL) || !p.body.toLowerCase().includes(LABEL.toLowerCase()));
  const bodyOf = (p) => (p.kind === "studojo" && p.body.startsWith(LABEL) ? p.body.slice(LABEL.length).replace(/^\s+/, "") : p.body);
  function postText(p) {
    return [labelAtTop(p) ? LABEL : "", p.ownLine, bodyOf(p)].filter(Boolean).join("\n\n");
  }
  function postHTML(p) {
    const body = bodyOf(p);
    const parts = [];
    if (labelAtTop(p)) parts.push(esc(LABEL));
    if (p.ownLine) parts.push(`<mark class="own" title="Your line">${esc(p.ownLine)}</mark>`);
    parts.push(esc(body));
    return parts.join("\n\n");
  }

  /* ---------- top bar + week range */
  const NO_POSTS = ME.paused ? "No posts while your fellowship is paused." : "No posts for you this week yet.";
  function renderTop() {
    const n = postedCount(), due = ME.thisWeek.due;
    if (!due) {
      $("#week-pill").innerHTML = `<span>${ME.paused ? "Paused" : "This week: no posts yet"}</span>`;
      $("#week-pill").setAttribute("aria-label", NO_POSTS);
      $("#week-range").textContent = fmt(ME.thisWeek.start, false) + " to " + fmt(addDays(ME.thisWeek.start, 6), false);
      $("#feed-help").textContent = ME.paused ? NO_POSTS : NO_POSTS + " They'll show here when they're ready.";
      return;
    }
    const dots = S.posts.slice().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<i class="${p.status === "posted" ? "on" : ""}"></i>`).join("");
    $("#week-pill").innerHTML = `<span class="segs" aria-hidden="true">${dots}</span><span>This week: <b>${n} of ${due}</b> posted</span>`;
    $("#week-pill").setAttribute("aria-label", `This week: ${n} of ${due} posted. ${n < due ? "Go to your next post" : "All posts done"}`);
    $("#week-range").textContent = fmt(ME.thisWeek.start, false) + " to " + fmt(addDays(ME.thisWeek.start, 6), false);
    $("#feed-help").textContent = n >= due
      ? `${allPosts(due, "out")} this week. Add your numbers a week after each one.`
      : "As they will look on LinkedIn. Copy a post, share it, then tap I posted it.";
  }

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
            <h1 class="p-name">${esc(ME.name)}</h1>
            <p class="p-headline">${esc(ME.headline)}</p>
          </div>
        </div>
        ${meta ? `<p class="p-meta">${esc(meta)}</p>` : ""}
        <p class="p-org"><span class="mark mark-sm" aria-hidden="true">S</span>${esc(P.name)}, ${esc(ME.cohort)}</p>
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
    const n = postedCount(), next = nextPost(), total = S.posts.length;
    const away = (d) => diffDays(TODAY, d);
    if (!total) {
      $("#ed-cover").innerHTML = `<div class="ed-in ed-empty">
        <div class="ed-top">
          <div class="ed-issue" aria-hidden="true"><span class="ed-issue-cap">NO.</span><span class="ed-issue-no">${WEEK_NO}</span></div>
          <div>
            <p class="ed-eyebrow">Your weekly edition · ${esc(ME.cohort)}</p>
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
    else if (next.copied) dek = `${dowLong(next.date)}'s post is copied. Paste it on LinkedIn, then tap <b>I posted it</b>.`;
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
      if (done) st = `<span class="ed-state ok">${ic("check")}Posted</span>`;
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
          <p class="ed-eyebrow">Your weekly edition · ${esc(ME.cohort)}</p>
          <h2 class="ed-title" id="ed-title">Week ${WEEK_NO} edition</h2>
          <p class="ed-meta">${fmt(ME.thisWeek.start, false)} to ${fmt(addDays(ME.thisWeek.start, 6), false)} · Made for ${esc(ME.first)}</p>
        </div>
      </div>
      <p class="ed-dek">${dek}</p>
      <ol class="ed-lines" aria-label="This week's posts">${lines}</ol>
      <dl class="ed-stats">
        <div><dt>Posted this week</dt><dd>${n} of ${total}<span class="ed-meter" aria-hidden="true">${S.posts.slice().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<i class="${p.status === "posted" ? "on" : ""}"></i>`).join("")}</span></dd></div>
        <div><dt>Weekly run</dt><dd>${plural(run(), "week")}</dd></div>
        <div><dt>Completed</dt><dd>${plural(doneWeeks(), "week")}</dd></div>
      </dl>
    </div>`;
  }

  /* ---------- post cards */
  function postCard(p) {
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
      const copyPrimary = isNext && !p.copied, postPrimary = isNext && p.copied;
      actions = `<div class="actions" role="group" aria-label="${esc(dowLong(p.date))} post actions">
        <button class="act ${p.copied ? "is-done" : copyPrimary ? "is-primary" : ""}" type="button" data-act="copy" data-id="${p.id}">${ic(p.copied ? "check" : "copy")}<span>${p.copied ? "Copied" : "Copy"}</span></button>
        <button class="act" type="button" data-act="line" data-id="${p.id}" aria-expanded="${p.panel === "line"}" aria-controls="panel-${p.id}">${ic("pen")}<span>${p.ownLine ? "Edit your line" : "Add your line"}</span></button>
        <button class="act ${postPrimary ? "is-primary" : ""}" type="button" data-act="posted" data-id="${p.id}" aria-expanded="${p.panel === "posted"}" aria-controls="panel-${p.id}">${ic("send")}<span>I posted it</span></button>
      </div>`;
    }

    let footer = "";
    if (posted) {
      const m = p.metrics;
      const strip = m ? `<div class="strip"><span class="reacts"><span class="r-dot" aria-hidden="true">${ic("thumb")}</span>${nf(m.reactions)} ${m.reactions === 1 ? "reaction" : "reactions"}</span><span>${plural(m.comments, "comment")}</span></div>` : "";
      const dueIn = p.numbersDue ? diffDays(TODAY, p.numbersDue) : 0;
      const an = m
        ? `<div class="an-row"><span class="an-main">${ic("chart")}<span><b>${nf(m.impressions)}</b> impressions</span></span><button class="btn btn-ghost btn-sm" type="button" data-act="numbers" data-id="${p.id}" aria-expanded="${p.panel === "numbers"}" aria-controls="panel-${p.id}">Edit numbers</button></div>`
        : `<div class="an-row"><span class="an-main">${ic("calendar")}<span>Numbers due <b>${fmt(p.numbersDue)}</b></span></span><button class="btn btn-secondary btn-sm" type="button" data-act="numbers" data-id="${p.id}" aria-expanded="${p.panel === "numbers"}" aria-controls="panel-${p.id}">Add your numbers</button></div>
           ${dueIn > 0 ? `<p class="an-note">Numbers are taken a week after posting, once the count settles. Add them on ${dowLong(p.numbersDue)}.</p>` : ""}`;
      footer = `${strip}<div class="an">${an}<div class="link-row">${ic("link", "ic-sm")}<span class="lt">${esc(shortUrl(p.url))}</span></div></div>`;
    }

    let panel = "";
    if (p.panel === "line") {
      panel = `<div class="panel" id="panel-${p.id}">
        <label class="panel-label" for="line-${p.id}">Your own line <span class="opt">(optional)</span></label>
        <p class="panel-help" id="line-help-${p.id}">One line in your own words. It goes at the top of the post${p.kind === "studojo" ? ", under the partnership line" : ""}.</p>
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
        <label class="panel-label" for="url-${p.id}">Paste the link to your LinkedIn post</label>
        <p class="panel-help" id="url-help-${p.id}">On LinkedIn, open your post, tap the three dots, then Copy link to post.</p>
        <div class="${p.err ? "has-err" : ""}"><input id="url-${p.id}" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="linkedin.com/posts/..." value="${esc(p.urlDraft || "")}" aria-describedby="url-help-${p.id} url-err-${p.id}" aria-invalid="${!!p.err}"></div>
        <p class="err" id="url-err-${p.id}">${p.err ? ic("alert") + esc(p.err) : ""}</p>
        <div class="panel-actions">
          <button class="btn btn-ghost" type="button" data-act="close" data-id="${p.id}">Cancel</button>
          <button class="btn btn-primary" type="button" data-act="posted-save" data-id="${p.id}">Mark as posted</button>
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
          <p class="pc-sub"><span>${sub}</span>${p.kind === "studojo" ? `<span class="sj-tag"><span class="mark" aria-hidden="true">S</span>${esc(LABEL)}</span>` : ""}</p>
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
          ${p.expanded ? "" : `<button class="see-more" type="button" data-act="more" data-id="${p.id}" aria-controls="${bodyId}" aria-expanded="false">&#8230;see more</button>`}
        </div>
      </div>
      ${footer}
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
  }
  function rerenderPost(id, focusSel) {
    const el = $("#post-" + id);
    if (!el) return;
    el.outerHTML = postCard(byId(id));
    const fresh = $("#post-" + id);
    fitSeeMore(fresh);
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
          ${isNext ? "" : `<p class="tl-detail">${esc(m.detail)}</p>`}
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
      <div class="wk-cap"><span><b>${Math.min(done, next.weeks)} of ${next.weeks}</b> weeks complete</span><span>After ${next.weeks} weeks</span></div>
      <p class="ms-detail">${esc(next.detail)}</p>` : ""}
      <div class="divider"></div>
      <h3 class="sub-title">All milestones <span class="count">${list.length}</span></h3>
      <ol class="tl">${items}</ol>`;
  }

  /* ---------- share an experience */
  function renderShare(keepText) {
    const ta = $("#story-text");
    const text = keepText && ta ? ta.value : "";
    const prompts = ME.storyPrompts;
    const pr = prompts[S.promptIdx];
    const stories = S.stories.map((s) => `<li class="story" tabindex="-1">
        <p class="st-prompt">${esc(s.prompt)}</p>
        <p class="st-text">${esc(s.text)}</p>
        <p class="st-meta">${ic(s.spoken ? "mic" : "keyboard")}${s.spoken ? "Spoken" : "Typed"}, ${fmt(s.createdAt.slice(0, 10), false)}</p>
      </li>`).join("");
    $("#share").classList.toggle("is-listening", S.listening);
    $("#share").innerHTML = `
      <div class="card-head"><h2 class="card-title" id="share-title">Share an experience</h2></div>
      <p class="card-sub">Tell us what happened, in your own words. We help turn good stories into posts.</p>
      <div class="prompt-box">
        <div class="prompt-top">
          <span class="kicker">${ic("bulb")}Prompt ${S.promptIdx + 1} of ${prompts.length}</span>
          <button class="btn-link" type="button" data-act="prompt-next">Another prompt${ic("arrow", "ic-sm")}</button>
        </div>
        <p class="prompt-text" id="prompt-text">${esc(pr)}</p>
      </div>
      <label class="sr-only" for="story-text">Your story</label>
      <textarea id="story-text" rows="4" aria-describedby="prompt-text story-err" placeholder="${S.listening ? "Listening. Start talking and we'll type it here." : (P.voice ? "Type here, or tap to speak." : "Type your story here.")}">${esc(text)}</textarea>
      <p class="err" id="story-err">${S.storyErr ? ic("alert") + esc(S.storyErr) : ""}</p>
      <div class="share-actions">
        ${P.voice ? `<button class="mic" type="button" data-act="mic" aria-pressed="${S.listening}">
          <span class="mic-ring">${ic("mic")}</span>
          <span>${S.listening ? "Tap to stop" : "Tap to speak"}</span>
          <span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>` : ""}
        <button class="btn btn-primary" type="button" data-act="story-save">Share</button>
      </div>
      <div class="stories">
        <h3 class="sub-title">Your stories <span class="count">${S.stories.length}</span></h3>
        <ul class="story-list">${stories}</ul>
      </div>`;
  }

  /* ---------- fellowship news */
  function renderNews() {
    const items = ME.cohortFeed.length
      ? ME.cohortFeed.map((e) => `<li><b>${esc(e.text)}</b><span>${esc(e.ago)}</span></li>`).join("")
      : `<li><span>Nothing new in the last 7 days.</span></li>`;
    $("#news").innerHTML = `
      <div class="card-head"><h2 class="card-title" id="news-title">Fellowship news</h2></div>
      <p class="card-sub">What's happened in ${esc(ME.cohort)} over the last 7 days.</p>
      <div class="news-hi">${ic("trend")}<div>${ME.cohortPosition ? `<b>${esc(ME.cohortPosition)}</b>` : ""}<span>${ME.cohortPostedThisWeek} of ${ME.cohortSize} ${ME.cohortSize === 1 ? "fellow has" : "fellows have"} posted this week</span></div></div>
      <div class="news-group">
        <p class="kicker">Latest in ${esc(ME.cohort)}</p>
        <ul class="news-list">${items}</ul>
      </div>`;
  }

  /* ---------- activity (earlier weeks) */
  function renderActivity() {
    const weeks = ME.history;
    if (!weeks.length) {
      $("#activity").innerHTML = `<h2 class="card-title" id="act-title">Your activity</h2>
        <p class="card-sub">Your earlier weeks will show here.</p>`;
      return;
    }
    const all = weeks.flatMap((w) => w.posts);
    const imp = all.reduce((s, p) => s + (p.metrics ? p.metrics.impressions : 0), 0);
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
            <button class="btn btn-ghost btn-sm" type="button" data-act="hist-copy" data-id="${m.id}" aria-label="Copy ${esc(m.title)}">${ic("copy")}Copy</button>
            <button class="btn btn-secondary btn-sm" type="button" data-act="hist-posted" data-id="${m.id}" aria-expanded="${open(m.id, "posted")}" aria-controls="hpanel-${m.id}" aria-label="I posted it: ${esc(m.title)}">I posted it</button>
          </p>
          ${S.histOpen === m.id ? histPanel(m) : ""}
        </li>`).join("");
      const rows = w.posts.map((p) => {
        const m = p.metrics;
        return `<li class="act-item" id="act-${p.id}" tabindex="-1">
          <p class="act-when"><b>${DOW[parseD(p.postedAt).getUTCDay()]}</b>${fmt(p.postedAt.slice(0, 10), false)}</p>
          <div>
            <p class="act-title">${esc(p.title)}</p>
            ${p.kind === "studojo" ? `<p class="sj-tag"><span class="mark" aria-hidden="true">S</span>${esc(LABEL)}</p>` : ""}
          </div>
          ${m ? `<p class="act-nums">
            <span class="n-imp"><b>${nf(m.impressions)}</b> impressions</span>
            <span class="n-small" title="Reactions">${ic("thumb", "ic-solid")}<span class="sr-only">Reactions:</span>${nf(m.reactions)}</span>
            <span class="n-small" title="Comments">${ic("comment")}<span class="sr-only">Comments:</span>${nf(m.comments)}</span>
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
    const span = weeks.length === 1 ? "in your first week" : `in your first ${weeks.length} weeks`;
    const sub = all.length
      ? `${plural(all.length, "post")} ${span}${all.some((p) => p.metrics) ? `, ${nf(imp)} impressions so far` : ""}.`
      : "Nothing marked as posted yet.";
    $("#activity").innerHTML = `
      <h2 class="card-title" id="act-title">Your activity</h2>
      <p class="card-sub">${sub}</p>
      ${blocks}`;
  }

  function histPanel(p) {
    if (S.histKind === "posted") {
      return `<div class="panel hist-panel" id="hpanel-${p.id}">
        <label class="panel-label" for="hurl-${p.id}">Paste the link to your LinkedIn post</label>
        <p class="panel-help" id="hurl-help-${p.id}">On LinkedIn, open your post, tap the three dots, then Copy link to post.</p>
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

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall through */ }
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function refreshProgress() { renderTop(); renderProfile(); renderCover(); renderMilestones(); }
  function goTo(id) {
    const el = $("#post-" + id);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
  }
  const toInt = (v) => { const s = String(v).replace(/[,\s]/g, ""); return /^\d+$/.test(s) ? parseInt(s, 10) : NaN; };
  const focusEl = (sel) => { const el = $(sel); if (el) el.focus(); };
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

    if (act === "goto-next") { const n = nextPost(); if (n) goTo(n.id); else toast(ME.thisWeek.due ? allPosts(ME.thisWeek.due, "done") + " this week." : NO_POSTS); return; }
    if (act === "goto") { goTo(id); return; }
    if (act === "more") { p.expanded = true; rerenderPost(id); const body = $("#body-" + id); if (body) { body.setAttribute("tabindex", "-1"); body.focus(); } return; }
    if (act === "copy") {
      const ok = await copyText(postText(p));
      if (!ok) { toast("Couldn't copy. Tap see more, then select the text.", "error"); return; }
      p.copied = true; rerenderPost(id, '[data-act="posted"]'); renderCover();
      call({ intent: "copied", postId: id }).catch(() => {});
      toast(p.kind === "studojo" ? "Copied, with the partnership line. Paste it into a new post on LinkedIn." : "Copied. Paste it into a new post on LinkedIn.");
      return;
    }
    if (act === "line" || act === "posted" || act === "numbers") {
      p.panel = p.panel === act ? null : act; p.err = ""; p.draft = null; p.lineDraft = null;
      rerenderPost(id, p.panel ? (act === "line" ? "textarea" : "input") : `[data-act="${act}"]`);
      return;
    }
    if (act === "close") { const was = p.panel; p.panel = null; p.err = ""; p.lineDraft = null; rerenderPost(id, `[data-act="${was}"]`); return; }
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
      const raw = $("#url-" + id).value.trim();
      if (!raw) { p.err = "Paste the link to your post first."; rerenderPost(id, "input"); return; }
      if (!LINK_OK.test(raw)) { p.err = "That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/"; p.urlDraft = raw; rerenderPost(id, "input"); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "posted", postId: id, url: raw }))) return; }
      catch (e) { p.err = e.message; p.urlDraft = raw; rerenderPost(id, "input"); return; }
      p.panel = null; p.err = ""; p.urlDraft = "";
      rerenderPost(id); refreshProgress(); renderNews();
      // The next post is now "Up next". A card with a panel open keeps what's typed and catches up when it closes.
      const nx = nextPost(); if (nx && !nx.panel) rerenderPost(nx.id);
      const el = $("#post-" + id); if (el) el.focus();
      toast(weekDone()
        ? `${ME.thisWeek.due === 1 ? "That's your post for this week." : `That's all ${ME.thisWeek.due} posts this week.`} Your weekly run is now ${plural(run(), "week")}.`
        : `${dowLong(p.date)}'s post is marked as posted. Add your numbers on ${p.numbersDue ? fmt(p.numbersDue) : "in a week"}.`);
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
      if (!m) return;
      if (!(await copyText(postText(m)))) { toast("Couldn't copy. Please try again.", "error"); return; }
      call({ intent: "copied", postId: id }).catch(() => {});
      toast("Copied. Post it on LinkedIn, then tap I posted it.");
      return;
    }
    if (act === "hist-posted-save") {
      const raw = $("#hurl-" + id).value.trim();
      const bad = !raw ? "Paste the link to your post first." : !LINK_OK.test(raw) ? "That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/" : "";
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
    if (act === "mic") {
      S.listening = !S.listening; if (S.listening) S.spoke = true; S.storyErr = "";
      renderShare(true); $('[data-act="mic"]').focus();
      return;
    }
    if (act === "story-save") {
      const text = $("#story-text").value.trim();
      if (text.length < 10) { S.storyErr = !text && S.listening ? "We didn't catch anything yet. Keep talking, or type it instead." : text ? "Write a few more words first." : "Write a few words first."; renderShare(true); $("#story-text").focus(); return; }
      b.disabled = true;
      try { if (!applyView(await call({ intent: "story", prompt: ME.storyPrompts[S.promptIdx], text }))) return; }
      catch (e) { S.storyErr = e.message; renderShare(true); $("#story-text").focus(); return; }
      S.listening = false; S.spoke = false; S.storyErr = "";
      renderShare(false); focusEl("#share .story");
      toast("Story shared. Thank you, " + ME.first + ".");
      return;
    }
  });

  // Enter in a field saves its panel; Escape closes the panel the focus is in, and only that one.
  const SAVE_FOR = { url: "posted-save", imp: "numbers-save", rea: "numbers-save", com: "numbers-save", hurl: "hist-posted-save", himp: "hist-numbers-save", hrea: "hist-numbers-save", hcom: "hist-numbers-save" };
  document.addEventListener("keydown", (ev) => {
    const t = ev.target;
    if (!t || !t.closest) return;
    if (ev.key === "Enter" && t.tagName === "INPUT") {
      if (t.id === "conn-input") { ev.preventDefault(); $('[data-act="conn-save"]').click(); return; }
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

  /* ---------- first render */
  $("#week-pill").hidden = false;
  if (ME.paused) { const n = $("#notice"); n.textContent = "Your fellowship is paused for now. Message the Studojo team on WhatsApp to pick it back up."; n.hidden = false; }
  renderTop(); renderProfile(); renderCover(); renderPosts(); renderMilestones(); renderShare(false); renderNews(); renderActivity();
  $("#page").classList.add("is-ready");
  $("#main").removeAttribute("aria-busy");
  }
})();
