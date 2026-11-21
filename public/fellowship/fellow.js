(function () {
  "use strict";
  // A Growth Fellowship fellow's own page, in five tabs: Today, Post, Talk, Numbers and You (plus How LinkedIn works,
  // opened from You). Each tab is its own address under /fellowship-growth/<slug>; the server sends the same shell
  // with body[data-page] set, and this one script draws that page from /api/fellowship-growth/<slug>. Every change
  // is saved there and the server answers with the fresh view, which the page is redrawn from.

  const PAGE = document.body.dataset.page || "today";
  const SLUG = (location.pathname.split("/").filter(Boolean)[1] || "").toLowerCase();
  const BASE = "/fellowship-growth/" + encodeURIComponent(SLUG);
  const API = "/api/fellowship-growth/" + encodeURIComponent(SLUG);
  const HREF = { today: BASE, post: BASE + "/post", talk: BASE + "/talk", numbers: BASE + "/numbers", you: BASE + "/you", learn: BASE + "/learn" };
  // The server's LINKEDIN_POST (app/lib/fellow-view.ts): keep the two identical.
  const LINK_OK = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.|www\.)?linkedin\.com\/(?:posts|feed\/update)\/[^\s<>"'?#/][^\s<>"']*$/i;
  const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  /* ---------- helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = (n) => Number(n).toLocaleString("en-IN");
  const plural = (n, one, many) => nf(n) + " " + (n === 1 ? one : (many || one + "s"));
  const PATHS = {
    today: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    post: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/>',
    talk: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    numbers: '<path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/>',
    you: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    photo: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-9 8"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    back: '<path d="m15 5-7 7 7 7"/>',
    upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    cert: '<circle cx="12" cy="9" r="5"/><path d="m9 13.5-1.5 7L12 18l4.5 2.5-1.5-7"/>',
    tool: '<path d="M4 12h16M12 4v16"/><circle cx="12" cy="12" r="8"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
    people: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.3v.2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/>',
    comment: '<path d="M20 15a2 2 0 0 1-2 2H8.5L4 20.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.7 5.6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    send: '<path d="M20.5 3.5 3.5 10.6l7 2.9 2.9 7 7.1-17z"/><path d="M10.5 13.5l4.4-4.4"/>',
    pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8"/>',
    trend: '<path d="M3.5 17l6-6 4 4 7-7"/><path d="M15 8h5.5v5.5"/>',
  };
  const ic = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[n] || ""}</svg>`;

  // Dates come as "YYYY-MM-DD" (India time) and times as "YYYY-MM-DDTHH:MM:SS+05:30": read them as written.
  const DOWL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const parseD = (s) => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = parseD(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 86400000);
  const dow = (s) => DOWL[parseD(s).getUTCDay()];
  const dshort = (s) => dow(s).slice(0, 3);
  const dnum = (s) => parseD(s).getUTCDate();
  const dmed = (s) => `${dnum(s)} ${MON[parseD(s).getUTCMonth()]}`;
  const dlong = (s) => `${dow(s)}, ${dnum(s)} ${MONL[parseD(s).getUTCMonth()]}`;
  const timeOf = (t) => { let [h, m] = String(t).slice(11, 16).split(":").map(Number); const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + ap; };
  const toInt = (v) => { const s = String(v == null ? "" : v).replace(/[,\s]/g, ""); return /^\d+$/.test(s) ? parseInt(s, 10) : NaN; };
  const focusEl = (sel) => { const el = typeof sel === "string" ? $(sel) : sel; if (el) el.focus(); return !!el; };
  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  /* ---------- network: the slug in the address is the only key */
  async function send(url, opts) {
    let res;
    try { res = await fetch(url, Object.assign({ credentials: "omit", cache: "no-store" }, opts)); }
    catch (e) { throw new Error("You seem to be offline. Check your connection and try again."); }
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      const err = new Error((data && data.error) || "Something went wrong. Please try again.");
      err.status = res.status;
      throw err;
    }
    return data;
  }
  function call(body) {
    if (!body) return send(API, { headers: { Accept: "application/json" } });
    return send(API, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  let toastTimer = null, toastUntil = 0;
  // A soft toast (news that can wait, like feedback arriving) never cuts off the one being shown.
  function toast(msg, kind, soft) {
    const box = $("#toasts");
    if (!box) return;
    if (soft && Date.now() < toastUntil) { setTimeout(() => toast(msg, kind, true), toastUntil - Date.now() + 100); return; }
    box.innerHTML = "";
    const t = document.createElement("div");
    t.className = kind === "error" ? "toast is-error" : "toast";
    t.innerHTML = ic(kind === "error" ? "alert" : "check") + `<span>${esc(msg)}</span>`;
    box.appendChild(t);
    const ms = kind === "error" ? 5200 : 3600;
    toastUntil = Date.now() + ms;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), ms);
  }

  const main = $("#main");
  function problem(title, text) {
    document.body.classList.add("no-tabs");
    document.body.classList.remove("has-tabs");
    const brand = $("a.brand");
    if (brand) brand.removeAttribute("href");
    main.removeAttribute("aria-busy");
    main.innerHTML = `<div class="card message"><h1></h1><p></p></div>`;
    main.querySelector("h1").textContent = title;
    main.querySelector("p").textContent = text;
  }

  /* ---------- the fellow's data */
  let V = null; // { program, me }, exactly as GET /api/fellowship-growth/<slug> returns it
  const LOAD_FAILED = "We couldn't load your page";
  call().then((data) => {
    V = data;
    try { boot(); } catch (e) { problem(LOAD_FAILED, "Something went wrong on our side. Please refresh the page in a minute."); }
  }, (e) => {
    if (e && e.status === 404) { problem("This link isn't working", "Check you opened the whole link from your message. If it still doesn't open, ask the Studojo team on WhatsApp for your link."); return; }
    // The server's message can repeat the title; then the plain next step reads better.
    const msg = e && e.message ? e.message : "";
    problem(LOAD_FAILED, msg && !msg.startsWith(LOAD_FAILED) ? msg : "Something went wrong on our side. Please try again in a minute.");
  });

  const TODAY = () => V.program.today;
  const byDate = (a, b) => a.date.localeCompare(b.date);
  // A post on hold ('blocked') is being fixed by the team: it's shown as on hold, never due, next or counted.
  const onHold = (p) => p.status === "blocked";
  const weekPosts = () => V.me.thisWeek.posts.slice().sort(byDate);
  const counted = () => weekPosts().filter((p) => !onHold(p));
  const postedCount = () => counted().filter((p) => p.status === "posted").length;
  const dueCount = () => V.me.thisWeek.due;
  const weekDone = () => dueCount() > 0 && postedCount() >= dueCount();
  const run = () => V.me.weeklyRun + (weekDone() ? 1 : 0);
  const doneWeeks = () => V.me.completedWeeks + (weekDone() ? 1 : 0);
  const nextPost = () => counted().find((p) => p.status !== "posted") || null;
  // Posts from earlier weeks that never went up: they can still be posted and marked, late.
  const latePosts = () => V.me.history.flatMap((w) => w.missed || []).map((m) => Object.assign({ status: "ready", late: true }, m)).sort(byDate);
  const findPost = (id) => weekPosts().find((p) => p.id === id) || latePosts().find((p) => p.id === id) || null;
  const hasPhoto = (p) => !!(p && p.photos && p.photos.length);
  const copiedHere = new Set(); // copied on this visit (the server keeps copiedAt for this week's posts)
  const isCopied = (p) => !!p.copiedAt || copiedHere.has(p.id);
  const asking = () => V.me.stories.length < V.me.storiesWanted;
  const noPosts = () => (V.me.paused ? "No posts while your fellowship is paused." : "No posts for you this week yet.");

  // No partnership line on posts (the founder, 5 Nov 2026: a Studojo post reads as the fellow's own). An older post
  // that still opens with the line has it taken off here.
  const bodyOf = (p) => {
    const label = V.program.partnershipLabel;
    return p.kind === "studojo" && label && p.body.startsWith(label) ? p.body.slice(label.length).replace(/^\s+/, "") : p.body;
  };
  const postText = (p) => [p.ownLine, bodyOf(p)].filter(Boolean).join("\n\n");
  const postHTML = (p) => [p.ownLine ? `<mark class="own" title="Your line">${esc(p.ownLine)}</mark>` : "", esc(bodyOf(p))].filter(Boolean).join("\n\n");

  /* ---------- the page frame: tabs come from the server; the script adds the initials, sheets and file pickers */
  function boot() {
    const dot = $("#me-dot");
    if (dot) dot.textContent = V.me.initials;
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="sheet" id="sheet" aria-labelledby="sheet-t"></dialog>
      <input class="sr-only" id="photo-file" type="file" accept="image/*" multiple tabindex="-1" aria-hidden="true">
      <input class="sr-only" id="xlsx" type="file" accept=".xlsx,${XLSX}" tabindex="-1" aria-hidden="true">`);
    const sheet = $("#sheet");
    // A tap outside the sheet closes it.
    sheet.addEventListener("click", (ev) => {
      if (ev.target !== sheet) return;
      const r = sheet.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) sheet.close();
    });
    sheet.addEventListener("close", () => { SH = null; });
    $("#photo-file").addEventListener("change", photoPicked);
    $("#xlsx").addEventListener("change", () => { const input = $("#xlsx"), f = input.files[0]; input.value = ""; uploadAnalytics(f); });
    main.removeAttribute("aria-busy");
    render();
    newLook();
  }

  function render() {
    if (PAGE === "post") drawPost();
    else if (PAGE === "talk") drawTalk(true);
    else if (PAGE === "numbers") drawNumbers();
    else if (PAGE === "you") drawYou();
    else if (PAGE === "learn") drawLearn();
    else drawToday();
  }

  /* ---------- the one sheet (Did you post it?, your line, your version, numbers, connections, your stories) */
  let SH = null; // { kind, id, mode }
  function openSheet(kind, html, extra) {
    const d = $("#sheet");
    SH = Object.assign({ kind }, extra || {});
    d.innerHTML = `<button class="sheet-x" type="button" data-act="sheet-close" aria-label="Close">${ic("x")}</button>${html}`;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    const f = d.querySelector("[data-autofocus]");
    if (f) { f.focus(); if (f.setSelectionRange && typeof f.value === "string") f.setSelectionRange(f.value.length, f.value.length); }
    else focusEl(d.querySelector(".actions .btn"));
  }
  function closeSheet() { const d = $("#sheet"); if (d && d.open) d.close(); SH = null; }
  const sheetErr = (id, msg, field) => {
    const e = $("#" + id);
    if (e) e.textContent = msg;
    const f = field && $("#" + field);
    if (f) { f.setAttribute("aria-invalid", "true"); f.focus(); }
  };

  /* ---------- the one-time note: the page has a new look (or, for a new fellow, what's where) */
  function newLook() {
    const KEY = "fellowNewLook:v1:" + SLUG;
    let seen = true, toured = false;
    try { seen = localStorage.getItem(KEY) === "1"; toured = localStorage.getItem("fellowTour:v1:" + SLUG) === "1"; } catch (e) { return; }
    if (seen) return;
    try { localStorage.setItem(KEY, "1"); } catch (e) { /* private mode: it shows again next time */ }
    const M = V.me;
    const existing = toured || M.stories.length > 0 || M.history.length > 0 || M.thisWeek.posts.some((p) => p.status === "posted");
    const tabs = [["today", "Today", "What to do next"], ["post", "Post", "Your posts, one at a time"], ["talk", "Talk", "Share your stories"], ["numbers", "Numbers", "Your LinkedIn results"], ["you", "You", "Milestones and your network"]];
    document.body.insertAdjacentHTML("beforeend", `<dialog class="sheet" id="newlook" aria-labelledby="newlook-t">
        <h2 id="newlook-t">${existing ? "Your page has a new look" : `Welcome, ${esc(M.first)}`}</h2>
        <p class="sheet-sub">${existing
          ? "Everything you've done is still here: your posts, your stories and your numbers. It's now in five simple tabs."
          : "This is your Growth Fellowship page. Your LinkedIn posts are written for you from the stories you share here. It's in five simple tabs."}</p>
        <ul class="newlook-tabs">${tabs.map(([i, l, s]) => `<li>${ic(i)}<b>${l}</b><span>${s}</span></li>`).join("")}</ul>
        <button class="btn btn-primary" type="button" data-act="newlook-ok">Got it</button>
      </dialog>`);
    const d = $("#newlook");
    d.addEventListener("click", (ev) => { if (ev.target.closest('[data-act="newlook-ok"]')) d.close(); });
    setTimeout(() => { if (!d.open && !($("#sheet") && $("#sheet").open)) d.showModal(); }, 300);
  }

  /* ================================================================ Today: the one thing to do next */
  // The weekend asks for the last 7 days' export; Monday to Friday for the week before, if it had posts and none
  // came in since its Saturday. By date, not by where the fellowship week starts (weeks run Wednesday to Tuesday).
  const upToDate = (since) => !!(V.me.analytics && V.me.analytics.at.slice(0, 10) >= since);
  function analyticsWeek() {
    const today = TODAY(), d = parseD(today).getUTCDay();
    const lastSat = addDays(today, -((d + 1) % 7)); // today on a Saturday, yesterday on a Sunday
    const all = V.me.thisWeek.posts.concat(V.me.history.flatMap((w) => w.posts));
    const postedSince = (from, to) => all.filter((p) => p.status !== "blocked" && p.postedAt && p.postedAt.slice(0, 10) >= from && p.postedAt.slice(0, 10) <= to).length;
    if (d === 0 || d === 6) return { weekend: true, sunday: d === 0, since: lastSat, posts: postedSince(addDays(lastSat, -6), today) };
    return { weekend: false, sunday: false, since: lastSat, posts: postedSince(addDays(lastSat, -6), lastSat) };
  }
  const analyticsDue = () => { const w = analyticsWeek(); return w.posts > 0 && !upToDate(w.since); };
  const analyticsTitle = () => { const w = analyticsWeek(); return w.weekend ? (w.sunday ? "Today: your LinkedIn numbers" : "Tomorrow: your LinkedIn numbers") : "Last week's LinkedIn numbers"; };

  const ring = (n, of, label) => {
    const C = 2 * Math.PI * 40, pct = of ? Math.min(1, n / of) : 0;
    return `<svg class="ring" viewBox="0 0 92 92" role="img" aria-label="${esc(label)}"><circle class="bg" cx="46" cy="46" r="40"/><circle class="fg" cx="46" cy="46" r="40" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(2)}"/><text x="46" y="46">${nf(n)}/${nf(of)}</text></svg>`;
  };

  function drawToday() {
    const M = V.me, today = TODAY();
    const posts = weekPosts(), done = postedCount(), due = dueCount(), next = nextPost();
    const hour = new Date().getHours(), hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const cards = [];
    if (M.paused) cards.push(`<div class="notice">${ic("pause")}<p>Your fellowship is paused for now. Message the Studojo team on WhatsApp to pick it back up.</p></div>`);
    // Posts are written only from what a fellow shares, so until they've shared a few stories this leads the page.
    if (asking()) {
      cards.push(`<a class="card next" href="${HREF.talk}">
        <p class="card-label">Finish joining · ${nf(M.stories.length)} of ${nf(M.storiesWanted)} shared</p>
        <h2>Tell us about yourself</h2>
        <p class="body">Share ${nf(M.storiesWanted)} stories about your own life to officially join the fellowship. Your posts are written from them.</p>
        <div class="actions"><span class="btn btn-primary btn-wide">${ic("talk")}Start talking</span></div>
      </a>`);
    }
    if (!counted().length) {
      const held = posts.filter(onHold).length;
      cards.push(`<div class="card next"><p class="card-label">This week</p><h2>${esc(noPosts())}</h2>
        <p class="body">${held ? "Your posts are on hold while the team updates them. We'll let you know when they're back." : M.paused ? "Message the Studojo team on WhatsApp to pick it back up." : "They'll show up here as soon as they're ready."}</p></div>`);
    } else if (!next) {
      cards.push(`<div class="card next"><p class="card-label">This week</p><h2>All done. See you next week.</h2></div>`);
    } else {
      const away = diffDays(today, next.date);
      const when = away === 0 ? "Today" : away < 0 ? "Was due " + dow(next.date) : away === 1 ? "Tomorrow" : dow(next.date);
      const pills = [];
      if (next.yourVersion) pills.push(`<span class="pill pill-blue">${ic("send")}Your version is with Studojo</span>`);
      else if (hasPhoto(next)) pills.push(`<span class="pill pill-good">${ic("check")}Photo added</span>`);
      else pills.push(`<span class="pill pill-warm">${ic("photo")}Needs your photo</span>`);
      if (isCopied(next) && !next.yourVersion) pills.push(`<span class="pill">${ic("copy")}Copied</span>`);
      if (next.kind === "studojo") pills.push(`<span class="pill pill-blue">Studojo</span>`);
      cards.push(`<a class="card next" href="${HREF.post}?id=${encodeURIComponent(next.id)}">
        <p class="card-label">Up next · ${esc(when)}</p>
        <h2>${esc(next.title)}</h2>
        <div class="meta">${pills.join("")}</div>
        <div class="actions"><span class="btn btn-primary btn-wide">Open post</span></div>
      </a>`);
    }
    if (analyticsDue()) {
      cards.push(`<div class="card">
        <p class="card-label">${esc(analyticsTitle())}</p>
        <h2 class="h-sm">Upload this week's file from LinkedIn</h2>
        <p class="body">Your posts' numbers fill in from it. <a class="btn-link" href="${HREF.numbers}">How to get the file</a></p>
        <div class="actions">${uploadButton(false)}</div>
      </div>`);
    }
    if (due) {
      const end = addDays(M.thisWeek.start, 6);
      cards.push(`<div class="card week">
        ${ring(done, due, `${done} of ${due} posted this week`)}
        <div>
          <h3>Posted this week</h3>
          <p>${due - done > 0 ? `${nf(due - done)} to go before ${dow(end)} ends` : "Every post is up"}</p>
          <div class="days">${posts.map((p) => `<span class="day ${onHold(p) ? "hold" : p.status === "posted" ? "done" : next && p.id === next.id ? "next" : ""}" title="${esc(dow(p.date))}${onHold(p) ? ": on hold" : p.status === "posted" ? ": posted" : ""}">${esc(dshort(p.date)[0])}</span>`).join("")}</div>
        </div>
      </div>`);
    }
    const a = M.analytics;
    cards.push(`<div class="tiles">
      <a class="card tile" href="${HREF.talk}"><span class="ic-bubble">${ic("talk")}</span><span><span class="big">Talk</span><span class="small">${M.stories.length ? plural(M.stories.length, "story", "stories") + " shared" : "Share your first story"}</span></span></a>
      <a class="card tile" href="${HREF.numbers}"><span class="ic-bubble">${ic("numbers")}</span><span><span class="big">${a && a.impressions != null ? nf(a.impressions) : "Numbers"}</span><span class="small">${a && a.impressions != null ? "impressions last week" : "Upload on Sunday"}</span></span></a>
    </div>`);
    main.innerHTML = `
      <p class="eyebrow">${esc(dlong(today))} · Week ${nf(M.weekNo)}</p>
      <h1>${hello}, ${esc(M.first)}</h1>
      <div class="stack">${cards.join("")}</div>`;
  }

  /* ================================================================ Post: one post at a time, as LinkedIn shows it */
  const UP = { cur: null, open: false, showVersion: false, photoBusy: null, stock: {}, away: null, focusStock: null };
  const PHOTO_IDEA = "Any photo you took yourself that fits this post: you, your desk, your college, or the place it happened.";
  const photoUrl = (id, t) => `${API}/proof?post=${encodeURIComponent(id)}&photo=${encodeURIComponent(t)}`;
  // LinkedIn's composer with the post filled in. The text parameter is not documented by LinkedIn and phones often
  // open the app without it, so the post is always copied as well. A very long post opens the empty composer.
  const COMPOSE = "https://www.linkedin.com/feed/?shareActive=true";
  const composeUrl = (p) => { const u = COMPOSE + "&text=" + encodeURIComponent(postText(p)); return u.length <= 8000 ? u : COMPOSE; };

  function currentPost() {
    const all = latePosts().concat(weekPosts());
    let p = UP.cur ? all.find((x) => x.id === UP.cur) : null;
    if (!p) {
      const want = new URLSearchParams(location.search).get("id");
      p = all.find((x) => x.id === want) || nextPost() || counted()[0] || weekPosts()[0] || null;
    }
    UP.cur = p ? p.id : null;
    return p;
  }

  function chip(p, now) {
    const cls = p.late ? "late" : onHold(p) ? "hold" : p.status === "posted" ? "done" : now ? "now" : "";
    const state = p.late ? ", not marked as posted" : onHold(p) ? ", on hold" : p.status === "posted" ? ", posted" : "";
    return `<button class="daychip ${cls}" type="button" data-pick="${esc(p.id)}" aria-pressed="${p.id === UP.cur}" aria-label="${esc(dlong(p.date))}${state}: ${esc(p.title)}">${esc(dshort(p.date))}<b>${dnum(p.date)}</b><span class="dot"></span></button>`;
  }

  function drawPost() {
    const M = V.me, today = TODAY();
    const p = currentPost(), next = nextPost(), week = weekPosts();
    const head = `<p class="eyebrow">${p && p.late ? "From an earlier week" : `Week ${nf(M.weekNo)} · ${nf(postedCount())} of ${nf(dueCount())} posted`}</p><h1>Post</h1>`;
    if (!p) {
      main.innerHTML = `${head}<div class="stack"><div class="card"><h2>${esc(noPosts())}</h2><p class="body">${M.paused ? "Message the Studojo team on WhatsApp to pick it back up." : "They'll show up here as soon as they're ready."}</p></div></div>`;
      return;
    }
    const chips = week.map((x) => chip(x, next && x.id === next.id)).join("");
    const bar = `<div class="daybar" role="group" aria-label="Your posts">${chips}</div>`;
    if (onHold(p)) {
      main.innerHTML = `${head}${bar}<div class="stack"><div class="card hold-card">
        <p class="card-label">${esc(dlong(p.date))}</p><h2>${esc(p.title)}</h2>
        <div class="notice">${ic("alert")}<p><b>On hold: the team is updating this post.</b> Please don't post it yet. We'll let you know when it's back.</p></div>
      </div></div>`;
      return;
    }
    const posted = p.status === "posted", photo = hasPhoto(p), copied = isCopied(p), locked = !posted && !!p.yourVersion;
    const n = (p.photos || []).length, busy = UP.photoBusy && UP.photoBusy.id === p.id;
    const sinceDays = posted ? diffDays(p.postedAt.slice(0, 10), today) : 0;
    const liWhen = posted ? (sinceDays === 0 ? "Now" : sinceDays + "d") : dshort(p.date);
    const media = photo
      ? `<div class="li-media n-${Math.min(4, n)}">${p.photos.slice(0, 4).map((t) => `<img src="${esc(photoUrl(p.id, t))}" alt="" loading="lazy">`).join("")}</div>`
      : posted ? "" : `<div class="li-photo is-empty"><div class="hint">${ic("photo")}<span>${esc(p.photoIdea || PHOTO_IDEA)}</span></div></div>`;
    const thumbs = !posted && (n || busy) ? `
      ${n ? `<div class="li-photo-bar">${ic("check")}<span class="grow">${n === 1 ? "Your photo is added" : `${n} photos added`}</span></div>` : ""}
      <div class="thumbs">
        ${p.photos.map((t, i) => `<span class="thumb"><img src="${esc(photoUrl(p.id, t))}" alt="Your photo ${i + 1}" width="64" height="64" loading="lazy"><button type="button" data-act="photo-remove" data-photo="${esc(t)}" aria-label="Remove photo ${i + 1}">${ic("x")}</button></span>`).join("")}
        ${busy ? `<span class="thumb-busy" role="status">Adding ${UP.photoBusy.done + 1} of ${UP.photoBusy.total}</span>`
          : n < V.program.photosPerPost ? `<button class="thumb-add" type="button" data-act="photo" aria-label="Add another photo">${ic("plus")}</button>` : ""}
      </div>` : "";
    const m = p.metrics;
    const stats = posted && m ? `<p class="post-stats"><span><b>${nf(m.impressions)}</b> impressions</span>${m.reactions != null ? `<span><b>${nf(m.reactions)}</b> ${m.reactions === 1 ? "reaction" : "reactions"}</span>` : ""}${m.comments != null ? `<span><b>${nf(m.comments)}</b> ${m.comments === 1 ? "comment" : "comments"}</span>` : ""}</p>` : "";
    const preview = `<article class="card li" aria-label="${esc(p.title)}">
        <div class="li-head"><span class="li-av" aria-hidden="true">${esc(M.initials)}</span><div><p class="li-name">${esc(M.name)}</p><p class="li-sub">${esc(M.headline)}</p><p class="li-when">${esc(liWhen)} · ${ic("globe")}<span class="sr-only">Anyone can see this</span></p></div></div>
        <p class="li-text ${UP.open ? "" : "clamp"}" id="li-text">${postHTML(p)}</p>
        ${UP.open ? "" : `<button class="li-more" type="button" data-act="more" aria-controls="li-text" aria-expanded="false">…see more</button>`}
        ${media}${thumbs}${stats}
      </article>`;
    const stock = !posted && !photo && p.photoHelp && !locked ? stockCard(p) : "";
    const step = posted ? 3 : photo || copied ? 2 : 1;
    const steps = `<div class="steps" aria-label="Steps">
        <span class="step ${step > 1 ? "done" : "now"}"><span class="n">${step > 1 ? ic("check") : 1}</span>Photo</span>
        <span class="step ${step > 2 ? "done" : step === 2 ? "now" : ""}"><span class="n">${step > 2 ? ic("check") : 2}</span>Post</span>
        <span class="step ${posted ? "done" : ""}"><span class="n">${posted ? ic("check") : 3}</span>Done</span>
      </div>`;

    let extra = "", actions = "", notes = [];
    if (posted) {
      const thisWeek = !p.late && week.some((x) => x.id === p.id);
      actions = `<div class="actions">
        ${p.url ? `<a class="btn btn-quiet btn-wide" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${ic("link")}See it on LinkedIn</a>`
          : `<button class="btn btn-primary btn-wide" type="button" data-act="add-link">${ic("link")}Add the link to your post</button>`}
        <div class="row-links">
          ${thisWeek ? `<button class="btn btn-quiet" type="button" data-act="numbers">${ic("numbers")}${m ? "Edit numbers" : "Type your numbers"}</button>` : ""}
          ${next ? `<button class="btn btn-quiet" type="button" data-pick="${esc(next.id)}">Next post${ic("chev")}</button>` : ""}
        </div>
      </div>`;
      notes.push(`Posted ${relDay(p.postedAt)}, ${timeOf(p.postedAt)}.${m ? (p.analyticsAt ? ` Numbers from your LinkedIn file, ${dmed(p.analyticsAt)}.` : "") : p.url ? " Its numbers come in with Sunday's file." : " Add its link so Sunday's file can find its numbers."}`);
    } else if (locked) {
      extra = `<div class="card">
        <p class="card-label">Your version</p>
        <h2 class="h-sm">With Studojo for approval</h2>
        <p class="body">You'll post it once it's approved. Until then, this post stays locked.</p>
        <div class="ver-acts">
          <button class="btn-link" type="button" data-act="ver-see" aria-expanded="${UP.showVersion}" aria-controls="ver-text">${UP.showVersion ? "Hide your version" : "See your version"}</button>
          <button class="btn-link" type="button" data-act="rewrite-withdraw">Withdraw it and post the original</button>
        </div>
        ${UP.showVersion ? `<p class="ver-text" id="ver-text">${esc(p.yourVersion.text)}</p>` : ""}
      </div>`;
    } else {
      const shareA = (cls, label) => `<a class="btn ${cls}" href="${esc(composeUrl(p))}" target="_blank" rel="noopener noreferrer" data-act="share">${ic("share")}${label}<span class="sr-only"> (copies the post and opens LinkedIn)</span></a>`;
      const primary = copied ? `<button class="btn btn-primary btn-wide" type="button" data-act="posted">${ic("check")}I posted it</button>`
        : !photo ? `<button class="btn btn-primary btn-wide" type="button" data-act="photo">${ic("photo")}Add your photo</button>`
        : shareA("btn-primary btn-wide", "Post on LinkedIn");
      const postLinks = [
        copied || !photo ? shareA("btn-quiet", "Post on LinkedIn") : "",
        `<button class="btn btn-quiet" type="button" data-act="copy">${ic("copy")}Copy text</button>`,
        copied ? "" : `<button class="btn btn-quiet" type="button" data-act="posted">${ic("check")}I posted it</button>`,
      ].filter(Boolean).join("");
      const ownLinks = [
        !photo && !p.photoHelp ? `<button class="btn btn-quiet" type="button" data-act="photo-help">No photo for this one?</button>` : "",
        `<button class="btn btn-quiet" type="button" data-act="line">${ic("pen")}${p.ownLine ? "Edit your line" : "Add your line"}</button>`,
        `<button class="btn btn-quiet" type="button" data-act="rewrite">${ic("pen")}Write it your way</button>`,
      ].filter(Boolean).join("");
      actions = `<div class="actions">${primary}<div class="row-links">${postLinks}</div><div class="row-links">${ownLinks}</div></div>`;
      if (p.versionReply) extra = `<div class="notice blue">${ic("comment")}<p><b>Studojo kept the original:</b> ${esc(p.versionReply)}</p></div>`;
    }
    if (!posted) {
      const away = diffDays(today, p.date);
      notes.push(p.late || away < 0 ? `This was due ${dow(p.date)}${p.late ? " " + dmed(p.date) : ""}. Post it when you can.`
        : `For ${away === 0 ? "today" : away === 1 ? "tomorrow" : dow(p.date)}. Post it as written: it's built to do well on LinkedIn.`);
      if (!locked) {
        notes.push((photo ? "Add the same photo on LinkedIn too: the link only carries the text."
          : "Every post goes out with a photo: add yours here, or add it on LinkedIn and paste the post's link when you mark it.")
          + (p.kind === "studojo" ? " Tag @Studojo in it." : ""));
      }
    }
    main.innerHTML = `${head}${bar}
      <div class="stack">${preview}${stock}${extra}</div>
      ${locked ? "" : steps}${actions}
      ${notes.map((t) => `<p class="note">${esc(t)}</p>`).join("")}`;
    fitMore();
    const bar0 = $(".daybar"), on = bar0 && bar0.querySelector('[aria-pressed="true"]');
    if (on) bar0.scrollLeft = Math.max(0, on.offsetLeft - bar0.offsetLeft - (bar0.clientWidth - on.offsetWidth) / 2);
    if (UP.focusStock === p.id && !(UP.stock[p.id] && UP.stock[p.id].busy)) { UP.focusStock = null; focusEl("#stk-q"); }
  }
  const relDay = (s) => { const n = diffDays(s.slice(0, 10), TODAY()); return n === 0 ? "today" : n === 1 ? "yesterday" : "on " + dshort(s) + " " + dmed(s); };
  function fitMore() {
    const t = $("#li-text"), b = $('[data-act="more"]');
    if (t && b) b.hidden = t.scrollHeight <= t.clientHeight + 2;
  }

  // No photo of their own: they search for what it should show, or pick from the photos we chose for the post,
  // see the one they tapped bigger, and use it. Our picks are fetched once; their searches replace the grid.
  function stockCard(p) {
    if (!UP.stock[p.id]) loadStock(p.id);
    const s = UP.stock[p.id];
    let body;
    if (s.busy === "load") body = `<p class="stk-note" role="status">${s.mode === "search" ? "Searching..." : "Finding photos for this post..."}</p>`;
    else if (s.error) body = `<p class="stk-note" role="status">${esc(s.error)}</p><div class="stk-acts"><button class="btn btn-soft btn-sm" type="button" data-act="stock-retry">Try again</button></div>`;
    else if (!s.list.length) body = `<p class="stk-note" role="status">${s.mode === "search" ? `No photos for "${esc(s.q)}". Try other words, like desk, notebook or campus.` : "Search for a photo above."}</p>`;
    else {
      const sel = s.sel != null ? s.list[s.sel] : null;
      body = `<div class="stk-grid">${s.list.map((x, i) => `<button class="stk-tile" type="button" data-act="stock-sel" data-i="${i}" aria-pressed="${s.sel === i}" aria-label="Photo ${i + 1}: ${esc(x.title || "a photo for this post")}"><img src="${esc(x.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer"></button>`).join("")}</div>
        ${sel ? `<div class="stk-pick"><img src="${esc(sel.src)}" alt="${esc(sel.title || "The photo you picked")}" referrerpolicy="no-referrer">
          <div class="stk-acts"><button class="btn btn-primary btn-sm" type="button" data-act="stock-use"${s.busy ? " disabled" : ""}>${s.busy === "use" ? "Adding it..." : "Use this photo"}</button>
            <button class="btn btn-quiet btn-sm" type="button" data-act="stock-unsel">Pick another</button></div></div>`
          : `<p class="stk-note">Tap a photo to see it bigger.</p>`}`;
    }
    return `<div class="card" id="stock">
      <p class="card-label">No photo of your own?</p>
      <h2 class="h-sm">Find a photo for this post</h2>
      <p class="stk-q">Search for what it should show, or pick one of ours. They're free to post, with no credit needed.</p>
      <div class="stk-search" role="search">
        <label class="sr-only" for="stk-q">What should the photo show?</label>
        <input class="field" id="stk-q" type="search" enterkeyhint="search" autocomplete="off" maxlength="60" placeholder="e.g. chai and laptop" value="${esc(s.qDraft != null ? s.qDraft : s.q)}">
        <button class="btn btn-soft btn-sm" type="button" data-act="stock-search">Search</button>
      </div>
      <div class="stk-label"><span>${s.mode === "search" ? `Photos for "${esc(s.q)}"` : "Our picks for this post"}</span>${s.mode === "search" ? `<button class="btn-link" type="button" data-act="stock-picks">Back to our picks</button>` : ""}</div>
      ${body}
    </div>`;
  }
  async function loadStock(id, q) {
    const st = UP.stock[id] || (UP.stock[id] = { picks: null, list: [], mode: "picks", q: "", qDraft: null, busy: null, sel: null, error: "" });
    if (!q && st.picks) { Object.assign(st, { list: st.picks, mode: "picks", q: "", busy: null, sel: null, error: "" }); return; }
    const ask = q || "";
    Object.assign(st, { mode: q ? "search" : "picks", q: ask, busy: "load", sel: null, error: "", list: [] });
    try {
      const r = await send(`${API}/stock?post=${encodeURIComponent(id)}${q ? `&q=${encodeURIComponent(q)}` : ""}`, { headers: { Accept: "application/json" } });
      if (UP.stock[id] !== st || st.q !== ask) return; // a newer search has started
      st.list = (r && r.stock) || [];
      if (!q) st.picks = st.list;
    } catch (e) {
      if (UP.stock[id] !== st || st.q !== ask) return;
      st.error = e.message;
    }
    st.busy = null;
    // Keep their place if they were typing a search while this loaded.
    const typing = document.activeElement && document.activeElement.id === "stk-q";
    if (PAGE === "post" && UP.cur === id) drawPost();
    if (typing) { const el = $("#stk-q"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
  }

  // Every photo is redrawn as a JPEG before it's sent: that drops its hidden details (like where it was
  // taken), turns iPhone HEIC into JPEG and keeps it small: 2048 px on the long side, 5 MB.
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
  let photoFor = null; // which post the photo picker is for
  async function photoPicked() {
    const input = $("#photo-file"), files = [...input.files], id = photoFor;
    input.value = ""; photoFor = null;
    const p = id && findPost(id);
    if (!p || !files.length || UP.photoBusy) return;
    const had = p.photos.length, max = V.program.photosPerPost;
    const take = files.slice(0, Math.max(0, max - had));
    if (!take.length) { toast(`A post can have up to ${max} photos.`, "error"); return; }
    UP.photoBusy = { id, done: 0, total: take.length }; drawPost();
    let added = 0, err = "";
    for (const f of take) {
      try {
        V = await send(`${API}/proof?post=${encodeURIComponent(id)}&kind=photo`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "image/jpeg" }, body: await toJpeg(f) });
        added++; UP.photoBusy.done = added; drawPost();
      } catch (e) { err = e.message; break; }
    }
    UP.photoBusy = null; drawPost();
    if (err) toast(added ? `${plural(added, "photo")} added. ${err}` : err, "error");
    else if (files.length > take.length) toast(`${plural(added, "photo")} added. A post can have up to ${max}.`);
    else toast(had ? `${added === 1 ? "Photo" : plural(added, "photo")} added. Thank you.` : "Photo added. Add the same photo when you post it on LinkedIn.");
  }

  // When the fellow comes back from LinkedIn, ask whether the post went out.
  function cameBack() {
    if (!UP.away || !UP.away.left) return;
    const p = findPost(UP.away.id); UP.away = null;
    if (!p || p.status !== "ready" || p.yourVersion || ($("#sheet") && $("#sheet").open)) return;
    openAsk(p, "mark");
  }
  document.addEventListener("visibilitychange", () => { if (!UP.away) return; if (document.hidden) UP.away.left = true; else cameBack(); });
  window.addEventListener("blur", () => { if (UP.away) UP.away.left = true; });
  window.addEventListener("focus", cameBack);

  function openAsk(p, mode) {
    const need = mode === "link" || !hasPhoto(p);
    openSheet("ask", `
      <h2 id="sheet-t">${mode === "link" ? "Add the link to your post" : "Did you post it?"}</h2>
      <p class="sheet-sub">${esc(dow(p.date))}'s post: ${esc(p.title)}</p>
      <label class="field-label" for="ask-url">Link to your post${need ? "" : ` <span class="opt">(optional)</span>`}</label>
      <p id="ask-help">On LinkedIn, open your post, tap the three dots, then Copy link to post.${mode === "link" ? "" : need ? " With no photo added here, we need the link to see your post." : " You can add it later too."}</p>
      <input class="field" id="ask-url" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="linkedin.com/posts/..." aria-describedby="ask-help ask-err" data-autofocus>
      <p class="err" id="ask-err" role="alert"></p>
      <div class="actions">
        <button class="btn btn-primary btn-wide" type="button" data-act="ask-yes">${mode === "link" ? "Save link" : "Yes, it's up"}</button>
        <button class="btn btn-quiet btn-wide" type="button" data-act="ask-no">${mode === "link" ? "Cancel" : "Not yet"}</button>
      </div>`, { id: p.id, mode });
  }
  async function askYes(b) {
    const p = findPost(SH.id), mode = SH.mode, raw = $("#ask-url").value.trim();
    if (!p) { closeSheet(); return; }
    const bad = raw && !LINK_OK.test(raw) ? "That isn't a LinkedIn post link. It should start with linkedin.com/posts/ or linkedin.com/feed/update/"
      : !raw && mode === "link" ? "Paste the link to your post first."
      : !raw && !hasPhoto(p) ? "Paste the link to your post. With no photo added here, we need it to see your post." : "";
    if (bad) { sheetErr("ask-err", bad, "ask-url"); return; }
    b.disabled = true;
    try { V = await call({ intent: "posted", postId: p.id, url: raw }); }
    catch (e) { b.disabled = false; sheetErr("ask-err", e.message, "ask-url"); return; }
    closeSheet();
    drawPost();
    if (mode === "link") { toast("Link saved."); return; }
    if (p.late) { toast("Marked as posted. Thank you."); return; }
    toast(weekDone()
      ? `${dueCount() === 1 ? "That's your post for this week." : `That's all ${dueCount()} posts this week.`} Your weekly run is now ${plural(run(), "week")}.`
      : `${dow(p.date)}'s post is marked as posted. That's ${postedCount()} of ${dueCount()} this week.`);
  }

  function openLine(p) {
    openSheet("line", `
      <h2 id="sheet-t">Your own line</h2>
      <p id="line-help">One line in your own words. It goes at the top of the post.</p>
      <label class="field-label" for="line-text">Your line <span class="opt">(optional)</span></label>
      <textarea class="field" id="line-text" rows="2" maxlength="220" placeholder="Something only you would say about this" aria-describedby="line-help line-err" data-autofocus>${esc(p.ownLine || "")}</textarea>
      <p class="err" id="line-err" role="alert"></p>
      <div class="actions">
        <button class="btn btn-primary btn-wide" type="button" data-act="line-save">Save line</button>
        ${p.ownLine ? `<button class="btn btn-quiet btn-wide" type="button" data-act="line-remove">Remove line</button>` : ""}
      </div>`, { id: p.id });
  }
  function openRewrite(p) {
    openSheet("rewrite", `
      <h2 id="sheet-t">Write it your way</h2>
      <p id="rw-help">Write it the way you would. Studojo reads it and approves it, and you post it once it's approved. Keep a strong first line and short paragraphs: that's what LinkedIn shows people first.</p>
      <label class="field-label" for="rw-text">Your version of the post</label>
      <textarea class="field tall" id="rw-text" maxlength="3000" aria-describedby="rw-help rw-err" data-autofocus>${esc(p.body)}</textarea>
      <p class="err" id="rw-err" role="alert"></p>
      <div class="actions"><button class="btn btn-primary btn-wide" type="button" data-act="rewrite-send">${ic("send")}Send to Studojo for approval</button></div>`, { id: p.id });
  }
  function openNumbers(p) {
    const m = p.metrics || {};
    const field = (id, label, v) => `<label for="${id}">${label}<input class="field" id="${id}" type="text" inputmode="numeric" autocomplete="off" aria-describedby="num-err" value="${v != null ? esc(v) : ""}"${id === "n-imp" ? " data-autofocus" : ""}></label>`;
    openSheet("numbers", `
      <h2 id="sheet-t">Your numbers</h2>
      <p class="sheet-sub">${esc(p.title)}</p>
      <p>On LinkedIn, open the post and tap the impressions count under it. Sunday's file fills in impressions for posts with their link.</p>
      <div class="num-grid">${field("n-imp", "Impressions", m.impressions)}${field("n-rea", "Reactions", m.reactions)}${field("n-com", "Comments", m.comments)}</div>
      <p class="err" id="num-err" role="alert"></p>
      <div class="actions"><button class="btn btn-primary btn-wide" type="button" data-act="numbers-save">Save numbers</button></div>`, { id: p.id });
  }

  /* ================================================================ Talk: one question and a big microphone */
  // Speaking a story: the browser's own speech service (Google in Chrome and on Android, Apple on iPhone) writes the
  // words into the box as the fellow talks. No audio reaches Studojo, only the text they share.
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canSpeak = () => !!(V && V.program.voice && SpeechRec);
  // A long talk is never cut off: near a story's 8,000-character limit the part so far is saved as its own story and
  // listening carries on into a new part. A part that can't be saved waits on the page and goes with the next Share.
  const PART_AT = 7500;
  const T = {
    promptIdx: 0, listening: false, spoke: false, typed: false, err: "", quietEnds: 0,
    parts: { saved: 0, waiting: [], prompt: null }, reply: null, talkAt: null,
    coachBusy: new Set(), coachErr: {}, coachOpen: new Set(), edit: null, open: new Set(),
  };
  let rec = null;
  const replyFields = () => (T.reply ? { replyTo: T.reply.to, q: T.reply.q } : {});
  const clock = (ms) => { const t = Math.floor(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
  function talkHint(ms) {
    const min = ms / 60000;
    return min >= 10 ? "That's 10 minutes. Tap stop and Share to get your feedback, or keep going."
      : min >= 5 ? "Good length. Finish the story when you're ready."
      : "Aim for 5 to 10 minutes on one story.";
  }
  setInterval(() => {
    if (!T.listening || !T.talkAt) return;
    const ms = Date.now() - T.talkAt, time = $("#timer"), hint = $("#talk-hint");
    if (time) time.textContent = clock(ms);
    if (hint && hint.textContent !== talkHint(ms)) hint.textContent = talkHint(ms);
  }, 1000);

  function stopListening() {
    const r = rec; rec = null; T.listening = false;
    if (r) { try { r.stop(); } catch (e) { /* already stopped */ } }
  }
  function savePart(text) {
    if (!T.parts.prompt) T.parts.prompt = currentPrompt();
    call(Object.assign({ intent: "story", prompt: T.parts.prompt, text, spoken: true }, replyFields())).then((v) => {
      T.parts.saved++; V = v; drawTalk(true);
    }, (e) => {
      T.parts.waiting.push(text);
      stopListening();
      T.err = `Part of your story isn't saved yet: ${e.message} It's kept on this page; tap Share to try again.`;
      drawTalk(true);
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
    const box = $("#said");
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
      const ta = $("#said");
      if (ta) ta.value = (base + heard + interim).replace(/\s+$/, "");
      if ((heard + interim).trim()) { T.spoke = true; T.quietEnds = 0; gotWords = true; }
    };
    r.onerror = (ev) => {
      const why = {
        "not-allowed": "Allow the microphone in your browser to speak your story, or type it instead.",
        "service-not-allowed": "Speaking isn't allowed in this browser. Type your story instead.",
        "audio-capture": "We couldn't find a microphone. Type your story instead.",
        network: "Speaking needs an internet connection. Try again, or type it.",
      }[ev.error];
      if (ev.error === "no-speech" || ev.error === "aborted") return; // counted when the session ends
      if (why) { T.err = why; fatal = true; }
    };
    r.onend = () => {
      if (rec !== r) { if (T.err) drawTalk(true); return; }
      // The browser ends a session on its own after a pause or a while: keep listening until they tap stop.
      // Sessions that keep ending with nothing heard stop after three, with a message.
      if (!gotWords) T.quietEnds++;
      if (!fatal && T.quietEnds >= 3) T.err = T.spoke ? "Listening stopped after a quiet spell. Tap the microphone to carry on, or Share." : "We didn't catch anything. Tap the microphone and try again, or type it.";
      else if (!fatal) { rec = null; startListening(); if (T.listening) return; }
      rec = null; T.listening = false;
      if (fatal) T.typed = true;
      drawTalk(true);
    };
    rec = r; T.listening = true; T.err = "";
    if (!T.talkAt) T.talkAt = Date.now();
    try { r.start(); } catch (e) { rec = null; T.listening = false; T.typed = true; T.err = "We couldn't start the microphone. Type your story instead."; }
  }
  const currentPrompt = () => { const ps = V.me.storyPrompts; return ps[T.promptIdx % ps.length] || ps[0] || ""; };

  function drawTalk(keep) {
    const M = V.me;
    const box = $("#said"), text = keep && box ? box.value : "";
    const speak = canSpeak();
    const showBox = !speak || T.typed || T.listening || !!text.trim() || T.parts.saved > 0 || T.parts.waiting.length > 0;
    const ms = T.talkAt ? Date.now() - T.talkAt : 0;
    const n = M.stories.length;
    const micLabel = T.listening ? `<span class="timer" id="timer">${clock(ms)}</span><span class="hint" id="talk-hint" role="status">${talkHint(ms)}</span>`
      : text.trim() ? "Tap to keep talking" : "Tap and talk for 5 to 10 minutes";
    const mic = speak && !T.typed ? `<button class="mic ${T.listening ? "on" : ""}" type="button" data-act="mic" aria-pressed="${T.listening}" aria-label="${T.listening ? "Stop" : "Start talking"}">${ic("talk")}</button>
      <p class="mic-label">${micLabel}</p>` : "";
    main.innerHTML = `
      <p class="eyebrow">${asking() ? `Finish joining · ${nf(n)} of ${nf(M.storiesWanted)} shared` : `${n ? plural(n, "story", "stories") : "No stories"} shared`}</p>
      <h1>Talk</h1>
      <div class="stack">
        ${asking() ? `<div class="notice blue">${ic("talk")}<p><b>Tell us about yourself.</b> Share ${nf(M.storiesWanted)} stories about your own life to officially join the fellowship. Your posts are written from them.</p></div>` : ""}
        <div class="card talk">
          <p class="card-label">${T.reply ? "Follow-up on your story" : "Today's question"}</p>
          <p class="question" id="question">${esc(T.reply ? T.reply.question : currentPrompt())}</p>
          ${speak && !T.typed && !T.listening && !text.trim() && !T.parts.saved ? `<p class="guide">Talk about one real moment: where you were, who was there, what you did and what happened next. You'll get written feedback when you share it.</p>` : ""}
          ${mic}
          ${showBox ? `<label class="sr-only" for="said">Your story</label><textarea class="said" id="said" aria-describedby="question talk-err" placeholder="${T.listening ? "Listening. Start talking and we'll write it here." : "Type your story here: where it happened, what you did, what came next."}">${esc(text)}</textarea>` : ""}
          <p class="err" id="talk-err" role="alert">${esc(T.err)}</p>
          ${(T.spoke || T.parts.saved) && !T.listening ? `<p class="names">Check the names of companies, colleges and people before you share. Speech to text often gets them wrong: tap the text to fix them.</p>` : ""}
          ${T.parts.saved ? `<p class="parts" role="status">${T.parts.saved === 1 ? "The first part of your story is saved." : `${T.parts.saved} parts of your story are saved.`}${T.listening ? " Keep talking." : " Share the rest when you're done."}</p>` : ""}
          ${showBox && !T.listening ? `<button class="btn btn-primary btn-wide" type="button" data-act="story-save">Share</button>` : ""}
          <div class="row-links">
            ${speak && !T.typed && !T.listening && !text.trim() ? `<button class="btn btn-quiet" type="button" data-act="type">${ic("keyboard")}Type instead</button>` : ""}
            ${speak && T.typed ? `<button class="btn btn-quiet" type="button" data-act="talk-instead">${ic("talk")}Talk instead</button>` : ""}
            ${T.reply ? `<button class="btn btn-quiet" type="button" data-act="reply-cancel">Back to the questions</button>`
              : `<button class="btn btn-quiet" type="button" data-act="another">Another question</button>`}
          </div>
        </div>
        ${speak ? `<p class="small-print">Speaking uses your browser's speech service (Google on Chrome and Android, Apple on iPhone) to turn your voice into text. Check the text, then share it.</p>` : ""}
        ${feedbackCard()}
        <button class="card list pad0" type="button" data-act="told">
          <span class="item"><span class="ic-bubble blue">${ic("book")}</span><span class="item-main"><span class="item-title">What you've told us</span><span class="item-sub">${n ? plural(n, "story", "stories") : "Nothing yet"}</span></span>${ic("chev", "chev")}</span>
        </button>
      </div>`;
  }

  // The newest talk's read-back, on the page itself: what we heard, what can become a post, what we'll leave out,
  // and follow-up questions to answer next. Every other story's read-back is in What you've told us.
  function feedbackCard() {
    const s = V.me.stories.find((x) => T.coachBusy.has(x.id) || x.reading || T.coachErr[x.id] || x.coach || x.canCoach);
    if (!s) return "";
    return `<div class="card" id="feedback"><p class="card-label">Your latest feedback</p>
      <h2 class="h-sm">${s.replyTo ? "Follow-up: " : ""}${esc(s.prompt)}</h2>
      ${coachArea(s, true)}</div>`;
  }
  function coachArea(s, open) {
    const id = esc(s.id), err = T.coachErr[s.id];
    if (T.coachBusy.has(s.id) || s.reading) return `<p class="reading" role="status"><span class="dot" aria-hidden="true"></span>Reading what you shared. Your feedback comes in a few seconds.</p>`;
    if (s.coach) {
      if (open) return coachBlock(s);
      const shown = T.coachOpen.has(s.id);
      return `<button class="btn-link" type="button" data-act="coach-toggle" data-story="${id}" aria-expanded="${shown}">${shown ? "Hide feedback" : "See feedback"}</button>${shown ? coachBlock(s) : ""}`;
    }
    if (err) return `<p class="err">${esc(err.msg)} <button class="btn-link" type="button" data-act="coach-get" data-story="${id}">Try again</button></p>`;
    if (s.canCoach) return `<div class="actions"><button class="btn btn-soft btn-sm" type="button" data-act="coach-get" data-story="${id}">${ic("bulb")}Get feedback</button></div>`;
    return "";
  }
  function coachBlock(s) {
    const c = s.coach, id = esc(s.id);
    const answered = (q) => V.me.stories.some((x) => x.replyTo === s.id && x.prompt === q);
    const list = (lines) => `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
    return `<div class="coach">
        <div class="coach-sec"><p class="coach-h">What we heard</p>${list(c.heard)}</div>
        <div class="coach-sec is-use"><p class="coach-h">${ic("check")}What we can use for posts</p>${c.useful.length ? list(c.useful) : `<p class="coach-none">Nothing we can post yet. The questions below will get us there.</p>`}</div>
        ${c.skip.length ? `<div class="coach-sec is-skip"><p class="coach-h">${ic("x")}What we'll leave out</p>${list(c.skip)}</div>` : ""}
        ${c.next.length ? `<div class="coach-sec is-next"><p class="coach-h">${ic("comment")}Tell us more</p>
          <ol class="coach-q">${c.next.map((q, i) => `<li><span>${esc(q)}</span>${answered(q)
            ? `<span class="pill pill-good">${ic("check")}Answered</span>`
            : `<button class="btn btn-soft btn-sm" type="button" data-act="coach-answer" data-story="${id}" data-q="${i}">Answer</button>`}</li>`).join("")}</ol>
        </div>` : ""}
        ${c.tip ? `<p class="coach-tip">${ic("bulb")}<span><b>Next time:</b> ${esc(c.tip)}</span></p>` : ""}
      </div>`;
  }
  function requestCoach(ids) {
    const key = String(Math.max.apply(null, ids.map(Number)));
    T.coachBusy.add(key); delete T.coachErr[key];
    redrawTalkParts();
    call({ intent: "coach", storyIds: ids }).then((v) => {
      T.coachBusy.delete(key);
      V = v;
      const st = V.me.stories.find((x) => x.id === key);
      if (st && st.coach) { T.coachOpen.add(key); toast("Your feedback is ready.", "", true); }
      else if (st && st.reading) setTimeout(() => call().then((w) => { V = w; redrawTalkParts(); }, () => {}), 20000);
      redrawTalkParts();
    }, (e) => {
      T.coachBusy.delete(key);
      T.coachErr[key] = { msg: e.message, ids };
      redrawTalkParts();
    });
  }
  // Feedback arriving never disturbs a story being typed or spoken: the box keeps its text.
  function redrawTalkParts() {
    if (PAGE !== "talk") return;
    if (SH && SH.kind === "told") renderTold();
    drawTalk(true);
  }

  // "What you've told us": every story they've shared, their own words and the read-backs of them only.
  // A name in a shared story can be fixed (speech to text mishears companies, colleges, places, people and events).
  const PLAIN = new Set(["I", "I'm", "I've", "I'd", "I'll", "A", "An", "The", "My", "We", "It", "So", "But", "And", "This", "That", "Then", "When", "In", "On", "At", "If", "Our", "Of"]);
  const OPENERS = new Set(("during after before today yesterday tomorrow last next these those when while then also now there here every each " +
    "one two three first second finally later once since because although though however what why how where who which they he she you your his " +
    "her their its as with for from to by all some most many few even just still yes no not never always sometimes over back looking working " +
    "being having getting doing going after everyone nobody somebody people students college school class week month year").split(" "));
  // Capitalised words and runs of them ("Jain University", "Peakloop"): the likely names, offered as picks.
  function namesIn(t) {
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
  }
  function renderTold() {
    const list = V.me.stories; // newest first
    const words = list.filter((s) => s.spoken).reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0);
    const mins = Math.round(words / 130); // about how fast people talk
    const talk = !words ? "" : mins < 1 ? ", under a minute of talking" : `, about ${plural(mins, "minute")} of talking`;
    const item = (s) => {
      const id = esc(s.id), editing = T.edit && T.edit.id === s.id, long = s.text.length > 400, open = T.open.has(s.id);
      const names = editing ? namesIn(s.text) : [];
      return `<article class="story">
        <p class="item-sub">${s.replyTo ? "Follow-up: " : ""}${esc(s.prompt)}</p>
        <p class="story-text ${long && !open && !editing ? "clamp" : ""}">${esc(s.text)}</p>
        <p class="story-meta"><span>${s.spoken ? "Spoken" : "Typed"}, ${esc(dmed(s.createdAt))}</span>
          ${long && !editing ? `<button class="btn-link" type="button" data-act="story-more" data-story="${id}" aria-expanded="${open}">${open ? "Show less" : "Show all"}</button>` : ""}
          ${editing ? "" : `<button class="btn-link" type="button" data-act="story-edit" data-story="${id}">Fix a name</button>`}</p>
        ${editing ? `<div class="story-edit">
          <p class="item-sub" id="se-help">Only names can be fixed here: companies, colleges, places, people and events. Posts still to come use your fix.</p>
          ${names.length ? `<div class="name-chips" role="group" aria-label="Names in this story">${names.map((nm) => `<button class="name-chip" type="button" data-act="story-name-pick" data-story="${id}" data-name="${esc(nm)}">${esc(nm)}</button>`).join("")}</div>` : ""}
          <label class="field-label" for="se-from">Name as it's written</label><input class="field" id="se-from" type="text" maxlength="60" autocomplete="off" value="${esc(T.edit.from)}" aria-describedby="se-help se-err">
          <label class="field-label" for="se-to">The right name</label><input class="field" id="se-to" type="text" maxlength="60" autocomplete="off" value="${esc(T.edit.to)}" aria-describedby="se-err">
          <p class="err" id="se-err" role="alert">${esc(T.edit.err)}</p>
          <div class="actions"><button class="btn btn-primary btn-sm" type="button" data-act="story-edit-save" data-story="${id}">Fix the name</button><button class="btn btn-quiet btn-sm" type="button" data-act="story-edit-cancel">Cancel</button></div>
        </div>` : ""}
        ${coachArea(s, false)}
      </article>`;
    };
    const d = $("#sheet"), top = d.scrollTop;
    const html = `
      <h2 id="sheet-t">What you've told us</h2>
      <div class="told-top"><p>${list.length ? plural(list.length, "story", "stories") + talk + ". Your posts are written from these." : "Nothing yet. What you share in Talk shows here."}</p>
        <button class="btn btn-soft btn-sm" type="button" data-act="told-share">${ic("talk")}Share another</button></div>
      <div class="told-list">${list.map(item).join("")}</div>
      ${list.length >= 50 ? `<p>These are your latest 50.</p>` : ""}`;
    if (SH && SH.kind === "told") { d.innerHTML = `<button class="sheet-x" type="button" data-act="sheet-close" aria-label="Close">${ic("x")}</button>${html}`; d.scrollTop = top; }
    else openSheet("told", html);
  }

  /* ================================================================ Numbers: last week's results, and Sunday's file */
  const UN = { busy: false };
  function uploadButton(quiet) {
    if (UN.busy) return `<span class="btn ${quiet ? "btn-soft" : "btn-primary"} btn-wide is-busy" role="status">Reading the file</span>`;
    return `<button class="btn ${quiet ? "btn-soft" : "btn-primary"} btn-wide" type="button" data-act="upload">${ic("upload")}Upload this week's file</button>`;
  }
  async function uploadAnalytics(f) {
    if (!f || UN.busy) return;
    // The server reads the file and says plainly if it isn't LinkedIn's export; only the size is checked here.
    if (f.size > 5 * 1024 * 1024) { toast("That file is too big to be LinkedIn's analytics export.", "error"); return; }
    UN.busy = true; render();
    let v;
    try { v = await send(`${API}/analytics`, { method: "POST", headers: { Accept: "application/json", "Content-Type": XLSX }, body: f }); }
    catch (e) { UN.busy = false; render(); focusEl('[data-act="upload"]'); toast(e.message, "error"); return; }
    UN.busy = false; V = v; render();
    focusEl('[data-act="upload"]');
    const a = V.me.analytics;
    toast(a && a.impressions != null
      ? `Saved${a.periodStart && a.periodEnd ? ` for ${dmed(a.periodStart)} to ${dmed(a.periodEnd)}` : ""}: ${nf(a.impressions)} impressions. Thank you.`
      : "Saved. Thank you.");
  }
  // What we're seeing on the fellow's own posts. Every line comes from their own numbers, and shows only when they exist.
  function seenLines() {
    const M = V.me, seen = new Map();
    for (const w of M.history) for (const p of w.posts) if (p.metrics) seen.set(p.id, p);
    for (const p of M.thisWeek.posts) if (p.status === "posted" && p.metrics) seen.set(p.id, p);
    const posts = [...seen.values()], lines = [];
    const avg = (list) => Math.round(list.reduce((s, p) => s + p.metrics.impressions, 0) / list.length);
    const pct = (x) => Math.round(x * 100) + "%";
    if (posts.length) {
      const best = posts.reduce((a, b) => (b.metrics.impressions > a.metrics.impressions ? b : a));
      lines.push(`Your best post so far: <b>${esc(best.title)}</b>, ${nf(best.metrics.impressions)} impressions.`);
    }
    if (posts.length >= 2) lines.push(`Your posts average <b>${nf(avg(posts))}</b> impressions.`);
    const own = posts.filter((p) => p.kind !== "studojo"), withUs = posts.filter((p) => p.kind === "studojo");
    if (own.length && withUs.length) lines.push(`Posts about you average ${nf(avg(own))} impressions; posts with Studojo, ${nf(avg(withUs))}.`);
    const comments = posts.reduce((s, p) => s + (p.metrics.comments || 0), 0);
    if (comments) lines.push(`Your posts have drawn ${plural(comments, "comment")} so far.`);
    const who = M.analytics && M.analytics.audience;
    if (who && who.jobTitle) lines.push(`Most common job title among your viewers: <b>${esc(who.jobTitle.value)}</b> (${pct(who.jobTitle.pct)}).`);
    if (who && who.location) lines.push(`Where most of them were: <b>${esc(who.location.value)}</b> (${pct(who.location.pct)}).`);
    if (who && who.industry) lines.push(`Their top industry: <b>${esc(who.industry.value)}</b> (${pct(who.industry.pct)}).`);
    const c = M.connections;
    if (c.atJoin != null && c.now != null && c.now !== c.atJoin) lines.push(`Connections: ${nf(c.atJoin)} when you joined, ${nf(c.now)} now (${c.now > c.atJoin ? "+" : ""}${nf(c.now - c.atJoin)}).`);
    return lines;
  }
  function drawNumbers() {
    const M = V.me, a = M.analytics, today = TODAY(), due = analyticsDue(), w = analyticsWeek();
    const done = w.posts > 0 && upToDate(w.since);
    const stats = a && a.impressions != null ? `<div class="stats">
        <div class="stat"><b>${nf(a.impressions)}</b><span>impressions</span></div>
        <div class="stat"><b>${a.membersReached != null ? nf(a.membersReached) : "?"}</b><span>people reached</span></div>
        <div class="stat"><b>${a.newFollowers != null ? "+" + nf(a.newFollowers) : "?"}</b><span>new followers</span></div>
      </div>` : `<h2>Nothing yet</h2><p class="body">Every Sunday, upload LinkedIn's file for the last 7 days. Your posts' numbers fill in from it.</p>`;
    // Posted posts, by week: this week's can always be typed in; an earlier one when it has none and its week is up.
    const weeks = [];
    const thisWeekPosted = counted().filter((p) => p.status === "posted");
    if (thisWeekPosted.length) weeks.push({ label: "This week", sub: `${postedCount()} of ${dueCount()} posted`, posts: thisWeekPosted.map((p) => Object.assign({ editable: true }, p)) });
    for (const wk of M.history) {
      if (!wk.posts.length && !(wk.missed || []).length) continue;
      weeks.push({ label: `${dmed(wk.week)} to ${dmed(addDays(wk.week, 6))}`, sub: wk.complete ? (wk.due === 1 ? "Posted" : `All ${wk.due} posted`) : `${wk.posts.length} of ${wk.due} posted`,
        posts: wk.posts.map((p) => Object.assign({ editable: !p.metrics && !!p.numbersDue && p.numbersDue <= today }, p)), missed: wk.missed || [] });
    }
    const row = (p) => {
      const m = p.metrics, when = p.postedAt ? `${dshort(p.postedAt)} ${dmed(p.postedAt)}` : dmed(p.date);
      const sub = [when, m && m.reactions != null ? plural(m.reactions, "reaction") : "", m && m.comments != null ? plural(m.comments, "comment") : ""].filter(Boolean).join(" · ");
      const end = m ? nf(m.impressions) : p.editable ? "Add" : p.numbersDue ? `Due ${dmed(p.numbersDue)}` : "";
      const inner = `<span class="ic-bubble ${p.kind === "studojo" ? "blue" : ""}">${ic("post")}</span><span class="item-main"><span class="item-title">${esc(p.title)}</span><span class="item-sub">${esc(sub)}</span></span><span class="item-end ${!m && p.editable ? "blue" : ""}">${esc(end)}</span>`;
      return p.editable ? `<button class="item" type="button" data-act="numbers" data-id="${esc(p.id)}" aria-label="${esc(p.title)}: ${m ? `${nf(m.impressions)} impressions. Edit numbers` : "add your numbers"}">${inner}</button>` : `<div class="item">${inner}</div>`;
    };
    // A post from that week that never went up, as on the old page's activity: it opens on Post, where it can still be posted and marked.
    const missedRow = (p) => `<a class="item" href="${HREF.post}?id=${encodeURIComponent(p.id)}"><span class="ic-bubble warm">${ic("post")}</span><span class="item-main"><span class="item-title">${esc(p.title)}</span><span class="item-sub">${esc(`${dshort(p.date)} ${dmed(p.date)} · Not marked as posted`)}</span></span>${ic("chev", "chev")}</a>`;
    const lines = seenLines();
    main.innerHTML = `
      <p class="eyebrow">${a && a.periodStart && a.periodEnd ? `${esc(dmed(a.periodStart))} to ${esc(dmed(a.periodEnd))}` : "Every Sunday"}</p>
      <h1>Numbers</h1>
      <div class="stack">
        <div class="card">
          <p class="card-label">${due ? esc(analyticsTitle()) : "Last week on LinkedIn"}</p>
          ${stats}
          ${done ? `<div class="meta"><span class="pill pill-good">${ic("check")}Uploaded ${esc(dmed(a.at))}</span></div>` : ""}
          <div class="actions">${uploadButton(!due && done)}</div>
        </div>
        <details class="card how" ${due && !a ? "open" : ""}>
          <summary>How to get the file ${ic("chev", "chev")}</summary>
          <ol>
            <li><p>On a computer, open linkedin.com. Click <b>&nbsp;Post impressions&nbsp;</b> on the left, under your profile.</p><img src="/fellowship/guide/export-1-impressions.png" alt="Post impressions on the left of the LinkedIn feed" width="216" height="156" loading="lazy"></li>
            <li><p>Choose <b>&nbsp;7 days&nbsp;</b>, then <b>&nbsp;Show results</b>.</p><img src="/fellowship/guide/export-2-range.png" alt="The date menu with 7 days chosen" width="347" height="426" loading="lazy"></li>
            <li><p>Click <b>&nbsp;Export</b>.</p><img src="/fellowship/guide/export-3-export.png" alt="The Export button" width="553" height="137" loading="lazy"></li>
            <li><p>Click <b>&nbsp;Confirm</b>. LinkedIn saves a file ending in .xlsx. Upload that file here.</p><img src="/fellowship/guide/export-4-confirm.png" alt="The Confirm button" width="544" height="188" loading="lazy"></li>
          </ol>
          <p class="note">These steps are for LinkedIn on a computer.</p>
        </details>
        ${lines.length ? `<div class="card"><p class="card-label">What we're seeing</p><ul class="seen">${lines.map((l) => `<li>${l}</li>`).join("")}</ul></div>` : ""}
        ${weeks.map((wk) => `<div class="card list pad0"><p class="list-title">${esc(wk.label)}</p><p class="item-sub list-sub">${esc(wk.sub)}</p>${(wk.missed || []).map(missedRow).join("") + wk.posts.map(row).join("") || `<div class="item"><span class="item-sub">Nothing posted that week.</span></div>`}</div>`).join("")}
      </div>`;
  }

  /* ================================================================ You: where you're headed */
  const UY = { howto: false };
  const isCert = (m) => /certificate/i.test(m.name) || m.id === "trial" || m.id === "month";
  const msIcon = (m) => (/outreach/i.test(m.id + " " + m.name) ? "tool" : m.weeks == null || /hiring|top performer|pipeline/i.test(m.id + " " + m.name) ? "star" : "cert");
  function drawYou() {
    const M = V.me, done = doneWeeks();
    const list = M.milestones.map((m) => Object.assign({}, m, { earned: m.status === "earned" || (m.weeks != null && done >= m.weeks), toGo: m.weeks != null ? Math.max(0, m.weeks - done) : null }));
    const nx = list.find((m) => !m.earned && m.weeks != null) || null;
    const c = M.connections, grew = c.now != null && c.atJoin != null ? c.now - c.atJoin : null;
    const meta = [M.city, M.course].filter(Boolean).join(", ");
    const item = (m) => {
      const isNext = nx && m.id === nx.id;
      const sub = m.earned ? `Earned ${m.earnedOn ? dmed(m.earnedOn) : "this week"}` : isNext ? `After ${m.weeks} weeks. ${plural(m.toGo, "week")} to go` : m.weeks != null ? `After ${m.weeks} weeks` : "For top performers";
      const how = m.earned && isCert(m);
      return `<div class="item"><span class="ic-bubble ${m.earned ? "good" : isNext ? "blue" : ""}">${ic(m.earned ? "check" : msIcon(m))}</span><span class="item-main"><span class="item-title">${esc(m.name)}</span><span class="item-sub">${esc(sub)}</span></span></div>
        ${how ? `<div class="item-more"><button class="btn-link" type="button" data-act="howto" aria-expanded="${UY.howto}" aria-controls="howto">Add it to your LinkedIn profile</button>
          <ol id="howto" ${UY.howto ? "" : "hidden"}><li>On LinkedIn, open your profile and tap Add section.</li><li>Choose Licenses and certifications.</li><li>Name: ${esc(m.name)}. Issuing organisation: Studojo.</li></ol></div>` : ""}`;
    };
    main.innerHTML = `
      <p class="eyebrow">${[M.cohort ? esc(M.cohort) : "", "Week " + nf(M.weekNo)].filter(Boolean).join(" · ")}</p>
      <h1>You</h1>
      <div class="stack">
        <div class="card who"><span class="li-av" aria-hidden="true">${esc(M.initials)}</span><div><h2>${esc(M.name)}</h2><p>${esc(M.headline)}</p>${meta ? `<p class="who-meta">${esc(meta)}</p>` : ""}</div></div>
        ${nx ? `<div class="card mile">
          ${ring(Math.min(done, nx.weeks), nx.weeks, `${Math.min(done, nx.weeks)} of ${nx.weeks} weeks complete`)}
          <div><p class="card-label">Next milestone</p><h2>${esc(nx.name)}</h2><p class="item-sub">${nx.toGo ? `${plural(nx.toGo, "full week")} of posting to go` : "Earned"}</p>${nx.detail ? `<p class="item-sub">${esc(nx.detail)}</p>` : ""}</div>
        </div>` : list.length ? `<div class="card"><p class="card-label">Milestones</p><h2 class="h-sm">Every milestone so far is yours.</h2></div>` : ""}
        <div class="card"><div class="stats stats-2">
          <div class="stat"><b>${plural(run(), "week")}</b><span>weekly run, every post up</span></div>
          <div class="stat"><b>${plural(done, "week")}</b><span>completed so far</span></div>
        </div></div>
        ${list.length ? `<div class="card list pad0"><p class="list-title">Milestones</p>${list.map(item).join("")}</div>` : ""}
        <div class="card list pad0">
          <button class="item" type="button" data-act="conn-edit"><span class="ic-bubble">${ic("people")}</span><span class="item-main"><span class="item-title">Connections</span><span class="item-sub">${grew != null ? (grew >= 0 ? `+${nf(grew)} since you joined` : `${nf(-grew)} fewer than when you joined`) : c.now != null ? "Tap to update your count" : "Add your count"}</span></span><span class="item-end">${c.now != null ? nf(c.now) : ""}</span></button>
          <a class="item" href="${HREF.learn}"><span class="ic-bubble blue">${ic("book")}</span><span class="item-main"><span class="item-title">How LinkedIn works</span><span class="item-sub">A 3 minute read</span></span>${ic("chev", "chev")}</a>
          <a class="item" href="${HREF.talk}"><span class="ic-bubble blue">${ic("talk")}</span><span class="item-main"><span class="item-title">Your stories</span><span class="item-sub">${M.stories.length ? plural(M.stories.length, "story", "stories") + " shared" : "Share your first one"}</span></span>${ic("chev", "chev")}</a>
        </div>
      </div>`;
  }
  function openConnections() {
    const c = V.me.connections, known = c.now != null;
    const later = (c.atJoin != null ? c.history.slice(1) : c.history).map((h) => `${nf(h.n)} on ${dmed(h.date)}`);
    const hist = (c.atJoin != null ? `You joined with ${nf(c.atJoin)} on ${dmed(V.me.joined)}.` : "")
      + (later.length ? (c.atJoin != null ? " Since then: " : "Your counts so far: ") + later.join(", ") + "." : "");
    openSheet("conn", `
      <h2 id="sheet-t">Your connections</h2>
      <label class="field-label" for="conn-n">How many connections do you have today?</label>
      <input class="field" id="conn-n" type="text" inputmode="numeric" autocomplete="off" value="${known ? c.now : ""}" aria-describedby="conn-err conn-hist" data-autofocus>
      <p class="err" id="conn-err" role="alert"></p>
      ${hist ? `<p id="conn-hist">${esc(hist)}</p>` : ""}
      <div class="actions"><button class="btn btn-primary btn-wide" type="button" data-act="conn-save">Save</button></div>`);
  }

  /* ================================================================ How LinkedIn works (from You) */
  // Every "LinkedIn says" line is something LinkedIn has published; the tips are labelled as creators' rules of thumb.
  // No numbers LinkedIn hasn't published. For the team, the sources are:
  //   engineering.linkedin.com/publishing-platform/maximizing-our-publishing-platform-reach-network-distribution
  //   linkedin.com/blog/engineering/feed/strategies-for-keeping-the-linkedin-feed-relevant
  //   linkedin.com/blog/engineering/member-customer-experience/linkedin-feed-with-creator-side-optimization
  //   linkedin.com/blog/engineering/feed/understanding-feed-dwell-time
  //   linkedin.com/blog/member/product/keeping-your-feed-relevant-and-productive
  //   linkedin.com/blog/member/product/mythbusting-the-feed-how-the-algorithm-works
  //   entrepreneur.com/science-technology/linkedin-changed-its-algorithms-heres-how-your-posts/454728
  //   linkedin.com/help/linkedin/answer/a1338787 and linkedin.com/legal/professional-community-policies
  const GUIDE = [
    ["Your network sees it first", [["says", "A new post goes to the people you're connected to and the people who follow you. When they react, comment or share, it travels on to their networks too."], ["", "So every connection is a door to another network. Growing your connections grows the first circle that sees you."]]],
    ["Every post gets a quick check", [["says", "Within moments, its systems sort each post as spam, low quality or fine. Spam and low-quality posts can be shown to fewer people, kept to your own network, or hidden."], ["says", "The posts that travel furthest are the ones that add ideas, insight and inspiration."]]],
    ["Real conversations beat empty reactions", [["says", "It promotes posts that spark conversations and discussion, and it gives more weight to meaningful comments than to empty ones."], ["", "A comment that responds to what you actually said is worth far more than a quick like or a \"Great post!\". Reply to every comment."]]],
    ["Be yourself", [["says", "People value posts grounded in knowledge and advice, and posts from people they know. It also looks at whether you're writing about something you have real experience in."], ["", "Your internship, your setback, the lesson you learned the hard way: that's your expertise. It's why your posts here are written from the stories you share."]]],
    ["The first two lines decide", [["says", "It measures how long people spend on a post, and shows posts that people scroll straight past to fewer people."], ["", "So the lines people see before \"...more\" matter most. That's what Add your line is for: one line in your own words at the top gives people a reason to stop."]]],
    ["You don't need a big following", [["says", "The first few reactions and comments on a post matter most, and it deliberately moves some attention from the biggest accounts to everyone else."], ["", "A student with a few hundred connections can be seen. Showing up every week is what counts."]]],
    ["Don't ask for likes", [["says", "It won't promote posts that ask for likes or reactions just to boost reach (\"Like if you agree\", \"Comment YES\"), chain posts asking for shares, or repetitive and irrelevant comments. It can limit or remove them."], ["says", "Agreeing with friends to like or share each other's posts breaks its rules: it calls that artificial engagement."]]],
  ];
  const WORKS = [
    "Reply to comments, especially in the first hour after you post.",
    "Post on a steady schedule rather than in bursts. Your weekly posts here do that for you.",
    "Keep your profile complete: a clear photo, a headline that says what you do, and your college.",
    "Short paragraphs and plain words. Write the way you talk.",
    "Tag people only when they're really part of the story.",
    "Post Studojo posts as they're written. If you want your own touch, add your own line at the top instead of rewriting the post.",
  ];
  const paras = (list) => list.map(([k, t]) => `<p>${k ? `<span class="says">LinkedIn says</span>` : ""}${esc(t)}</p>`).join("");
  function drawLearn() {
    // This week's tip: the guide's parts and the creators' tips, one a week in order from the fellow's first week.
    const tips = GUIDE.map(([t, ps]) => ({ t, html: paras(ps) })).concat(WORKS.map((t) => ({ t, html: `<p>A creators' rule of thumb, not LinkedIn's own words.</p>` })));
    const tip = tips[(Math.max(1, V.me.weekNo) - 1) % tips.length];
    const total = GUIDE.length + 1;
    main.innerHTML = `
      <a class="btn btn-quiet back" href="${HREF.you}">${ic("back")}You</a>
      <h1>How LinkedIn works</h1>
      <p class="lede">How LinkedIn decides who sees your post. A 3 minute read.</p>
      <div class="stack">
        <div class="card tip-card"><p class="card-label">This week's tip</p><h2 class="h-sm">${esc(tip.t)}</h2>${tip.html}</div>
        ${GUIDE.map(([t, ps], i) => `<div class="card learn-card"><p class="card-label">${i + 1} of ${total}</p><h2 class="h-sm">${esc(t)}</h2>${paras(ps)}</div>`).join("")}
        <div class="card learn-card"><p class="card-label">${total} of ${total}</p><h2 class="h-sm">What tends to work</h2><p>Creators' rules of thumb, not LinkedIn's own words.</p><ul>${WORKS.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      </div>
      <p class="sources">Sources: LinkedIn Engineering on how posts spread (2014), keeping the feed relevant (2017), giving smaller creators a fair share (2018) and time spent on posts (2020); the LinkedIn blog on what it won't promote (May 2022) and how the feed works (Aug 2022); LinkedIn's Alice Xiong and Dan Roth in Entrepreneur (June 2023); LinkedIn Help on spam, and LinkedIn's Professional Community Policies.</p>`;
  }

  /* ================================================================ what the fellow does */
  function copyNow(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.className = "sr-only";
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return copyNow(text); }
  }
  const markCopied = (p) => {
    if (isCopied(p)) return;
    copiedHere.add(p.id);
    call({ intent: "copied", postId: p.id }).catch(() => {});
  };

  document.addEventListener("click", async (ev) => {
    if (!V) return;
    const pick = ev.target.closest("[data-pick]");
    if (pick) {
      UP.cur = pick.dataset.pick; UP.open = false; UP.showVersion = false;
      history.replaceState(null, "", location.pathname + "?id=" + encodeURIComponent(UP.cur));
      drawPost();
      window.scrollTo({ top: 0, behavior: smooth() });
      return;
    }
    const b = ev.target.closest("[data-act]");
    if (!b || b.tagName === "INPUT") return;
    const act = b.dataset.act;
    const p = PAGE === "post" && UP.cur ? findPost(UP.cur) : null;

    // ---------- the sheet
    if (act === "sheet-close") { closeSheet(); return; }

    // ---------- Post
    if (act === "more") { UP.open = true; drawPost(); const t = $("#li-text"); if (t) { t.setAttribute("tabindex", "-1"); t.focus(); } return; }
    if (act === "photo") { if (UP.photoBusy || !p) return; photoFor = p.id; $("#photo-file").click(); return; }
    if (act === "photo-remove") {
      if (!p) return;
      b.disabled = true;
      try { V = await send(`${API}/proof?post=${encodeURIComponent(p.id)}&photo=${encodeURIComponent(b.dataset.photo)}`, { method: "DELETE", headers: { Accept: "application/json" } }); }
      catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      drawPost();
      toast("Photo removed.");
      return;
    }
    if (act === "photo-help") {
      if (!p) return;
      b.disabled = true;
      try { V = await call({ intent: "photo-help", postId: p.id }); }
      catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      UP.focusStock = p.id;
      drawPost();
      const s = $("#stock"); if (s) s.scrollIntoView({ behavior: smooth(), block: "start" });
      return;
    }
    if (act === "stock-search") {
      const st = p && UP.stock[p.id], q = ($("#stk-q") || {}).value || "";
      if (!st) return;
      if (!q.trim()) { focusEl("#stk-q"); return; }
      st.qDraft = null;
      loadStock(p.id, q.trim()); drawPost(); focusEl("#stk-q");
      return;
    }
    if (act === "stock-picks") { const st = p && UP.stock[p.id]; if (!st) return; st.qDraft = ""; loadStock(p.id); drawPost(); focusEl("#stk-q"); return; }
    if (act === "stock-sel") { const st = p && UP.stock[p.id]; if (!st) return; st.sel = Number(b.dataset.i); drawPost(); focusEl('[data-act="stock-use"]'); return; }
    if (act === "stock-unsel") { const st = p && UP.stock[p.id]; if (!st) return; const was = st.sel; st.sel = null; drawPost(); focusEl(`[data-act="stock-sel"][data-i="${was}"]`); return; }
    if (act === "stock-retry") { const st = p && UP.stock[p.id]; if (!st) return; if (st.mode === "search") loadStock(p.id, st.q); else { st.picks = null; loadStock(p.id); } drawPost(); return; }
    if (act === "stock-use") {
      const st = p && UP.stock[p.id], chosen = st && st.sel != null && st.list[st.sel];
      if (!chosen || st.busy) return;
      st.busy = "use"; drawPost();
      try { V = await call({ intent: "stock-use", postId: p.id, stockId: chosen.id }); }
      catch (e) { st.busy = null; drawPost(); focusEl('[data-act="stock-use"]'); toast(e.message, "error"); return; }
      delete UP.stock[p.id];
      drawPost();
      focusEl('[data-act="share"]');
      toast("Photo added. Add the same photo when you post it on LinkedIn.");
      return;
    }
    if (act === "share") {
      if (!p || p.yourVersion) { ev.preventDefault(); return; }
      // The link itself opens LinkedIn in a new tab; the copy runs first and synchronously, before that tab takes focus.
      const text = postText(p);
      b.href = composeUrl(p);
      if (!copyNow(text) && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
      UP.away = { id: p.id, left: false };
      markCopied(p);
      setTimeout(drawPost, 0);
      return;
    }
    if (act === "copy") {
      if (!p || p.yourVersion) return;
      if (!(await copyText(postText(p)))) { toast("Couldn't copy. Tap see more, then select the text.", "error"); return; }
      markCopied(p); drawPost(); focusEl('[data-act="posted"]');
      toast("Copied. Paste it into a new post on LinkedIn.");
      return;
    }
    if (act === "posted") { if (p) openAsk(p, "mark"); return; }
    if (act === "add-link") { if (p) openAsk(p, "link"); return; }
    if (act === "ask-no") { const mode = SH && SH.mode; closeSheet(); if (mode !== "link") toast("No problem. It stays here until you post it."); return; }
    if (act === "ask-yes") { await askYes(b); return; }
    if (act === "line") { if (p) openLine(p); return; }
    if (act === "line-save" || act === "line-remove") {
      const lp = SH && findPost(SH.id);
      if (!lp) { closeSheet(); return; }
      const v = act === "line-remove" ? "" : $("#line-text").value.trim().replace(/\s+/g, " ");
      b.disabled = true;
      try { V = await call({ intent: "line", postId: lp.id, line: v }); }
      catch (e) { b.disabled = false; sheetErr("line-err", e.message, "line-text"); return; }
      closeSheet();
      if (v) UP.open = true;
      drawPost();
      toast(act === "line-remove" ? "Your line is removed." : v ? "Your line is added at the top of the post." : "No line added. The post stays as it is.");
      return;
    }
    if (act === "rewrite") { if (p) openRewrite(p); return; }
    if (act === "rewrite-send") {
      const rp = SH && findPost(SH.id);
      if (!rp) { closeSheet(); return; }
      const v = $("#rw-text").value.trim();
      if (v.length < 40) { sheetErr("rw-err", "Write out your whole version of the post before you send it.", "rw-text"); return; }
      b.disabled = true;
      try { V = await call({ intent: "rewrite", postId: rp.id, text: v }); }
      catch (e) { b.disabled = false; sheetErr("rw-err", e.message, "rw-text"); return; }
      closeSheet(); UP.showVersion = false;
      drawPost(); focusEl('[data-act="ver-see"]');
      toast("Sent. Studojo will read your version, and you'll post it once it's approved.");
      return;
    }
    if (act === "ver-see") { UP.showVersion = !UP.showVersion; drawPost(); focusEl('[data-act="ver-see"]'); return; }
    if (act === "rewrite-withdraw") {
      if (!p) return;
      b.disabled = true;
      try { V = await call({ intent: "rewrite-withdraw", postId: p.id }); }
      catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      UP.showVersion = false;
      drawPost(); focusEl('[data-act="rewrite"]');
      toast("Withdrawn. You can post the original now.");
      return;
    }
    if (act === "numbers") {
      const id = b.dataset.id || (p && p.id);
      const np = id && (findPost(id) || V.me.history.flatMap((w) => w.posts).find((x) => x.id === id));
      if (np) openNumbers(np);
      return;
    }
    if (act === "numbers-save") {
      const id = SH && SH.id;
      const raw = { impressions: $("#n-imp").value.trim(), reactions: $("#n-rea").value.trim(), comments: $("#n-com").value.trim() };
      const imp = toInt(raw.impressions), rea = toInt(raw.reactions), com = toInt(raw.comments);
      if ([imp, rea, com].some((x) => isNaN(x))) {
        sheetErr("num-err", "Add impressions, reactions and comments as whole numbers. Use 0 if there were none.", isNaN(imp) ? "n-imp" : isNaN(rea) ? "n-rea" : "n-com");
        return;
      }
      b.disabled = true;
      try { V = await call({ intent: "numbers", postId: id, impressions: imp, reactions: rea, comments: com }); }
      catch (e) { b.disabled = false; sheetErr("num-err", e.message, "n-imp"); return; }
      closeSheet(); render();
      toast("Numbers saved. Thank you.");
      return;
    }

    // ---------- Numbers
    if (act === "upload") { if (!UN.busy) $("#xlsx").click(); return; }

    // ---------- You
    if (act === "howto") { UY.howto = !UY.howto; drawYou(); focusEl('[data-act="howto"]'); return; }
    if (act === "conn-edit") { openConnections(); return; }
    if (act === "conn-save") {
      const n = toInt($("#conn-n").value);
      if (isNaN(n)) { sheetErr("conn-err", "Enter your connections as a whole number.", "conn-n"); return; }
      if (n > 30000) { sheetErr("conn-err", "LinkedIn allows up to 30,000 connections. Check the number and try again.", "conn-n"); return; }
      const before = V.me.connections.now;
      b.disabled = true;
      try { V = await call({ intent: "connections", connections: n }); }
      catch (e) { b.disabled = false; sheetErr("conn-err", e.message, "conn-n"); return; }
      closeSheet(); render();
      toast(before == null ? `Connections saved: ${nf(n)}.` : n === before ? "Connections checked. No change." : `Connections updated from ${nf(before)} to ${nf(n)}.`);
      return;
    }

    // ---------- Talk
    if (act === "another") { if (T.listening) stopListening(); T.promptIdx = (T.promptIdx + 1) % Math.max(1, V.me.storyPrompts.length); drawTalk(true); focusEl('[data-act="another"]'); return; }
    if (act === "reply-cancel") { T.reply = null; drawTalk(true); focusEl('[data-act="another"]'); return; }
    if (act === "type") {
      if (T.listening) stopListening();
      T.typed = true; drawTalk(true);
      const ta = $("#said"); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      return;
    }
    if (act === "talk-instead") { T.typed = false; T.err = ""; drawTalk(true); focusEl('[data-act="mic"]'); return; }
    if (act === "mic") {
      if (!canSpeak()) { T.typed = true; drawTalk(true); toast("Your browser can't listen here. Type instead."); return; }
      if (T.listening) stopListening(); else { T.quietEnds = 0; startListening(); }
      drawTalk(true); focusEl('[data-act="mic"]');
      return;
    }
    if (act === "story-save") {
      if (T.listening) stopListening();
      const box = $("#said"), text = box ? box.value.trim() : "";
      const prompt = T.parts.prompt || (T.reply ? T.reply.question : currentPrompt());
      const earlier = T.parts.saved + T.parts.waiting.length;
      if (text.length < 10 && !earlier) { T.err = text ? "Write a few more words first." : "Say or write a few words first."; drawTalk(true); focusEl("#said"); return; }
      const before = V.me.stories.length;
      b.disabled = true;
      try {
        while (T.parts.waiting.length) {
          V = await call(Object.assign({ intent: "story", prompt, text: T.parts.waiting[0], spoken: true }, replyFields()));
          T.parts.waiting.shift(); T.parts.saved++;
        }
        if (text.length >= 10) V = await call(Object.assign({ intent: "story", prompt, text, spoken: T.spoke }, replyFields()));
      } catch (e) { T.err = e.message; drawTalk(true); focusEl("#said"); return; }
      const parts = T.parts.saved + (text.length >= 10 ? 1 : 0);
      const wanted = V.me.storiesWanted, now = V.me.stories.length;
      const joinedNow = now >= wanted && before < wanted;
      Object.assign(T, { listening: false, spoke: false, typed: false, err: "", promptIdx: 0, parts: { saved: 0, waiting: [], prompt: null }, reply: null, talkAt: null });
      drawTalk(false);
      toast(joinedNow ? `You're officially in the Studojo Growth Fellowship, ${V.me.first}. Your first posts arrive here once the team has written them.`
        : parts > 1 ? `Story shared in ${parts} parts. Thank you, ${V.me.first}.` : `Story shared. Thank you, ${V.me.first}.`);
      // The newest stories are this talk's parts: read them back together.
      requestCoach(V.me.stories.slice(0, parts).map((x) => x.id));
      return;
    }
    if (act === "told") { renderTold(); return; }
    if (act === "told-share") { closeSheet(); window.scrollTo({ top: 0, behavior: smooth() }); focusEl(canSpeak() && !T.typed ? '[data-act="mic"]' : "#said"); return; }
    if (act === "coach-toggle") { const sid = b.dataset.story; if (T.coachOpen.has(sid)) T.coachOpen.delete(sid); else T.coachOpen.add(sid); renderTold(); focusEl(`[data-act="coach-toggle"][data-story="${sid}"]`); return; }
    if (act === "coach-get") { const sid = b.dataset.story, err = T.coachErr[sid]; requestCoach(err && err.ids ? err.ids : [sid]); return; }
    if (act === "coach-answer") {
      // One talk at a time: an answer goes in an empty box, so it's sent with its question alone.
      const st = V.me.stories.find((x) => x.id === b.dataset.story), q = Number(b.dataset.q);
      if (!st || !st.coach || !st.coach.next[q]) return;
      const box = $("#said");
      if (T.listening || T.parts.saved || T.parts.waiting.length || (box && box.value.trim())) { toast("Share what's in the box first, then answer this question.", "error"); return; }
      closeSheet();
      T.reply = { to: st.id, q, question: st.coach.next[q] };
      T.err = "";
      if (canSpeak() && !T.typed) { T.quietEnds = 0; startListening(); }
      drawTalk(false);
      window.scrollTo({ top: 0, behavior: smooth() });
      focusEl(canSpeak() && !T.typed ? '[data-act="mic"]' : "#said");
      return;
    }
    if (act === "story-more") { const sid = b.dataset.story; if (T.open.has(sid)) T.open.delete(sid); else T.open.add(sid); renderTold(); focusEl(`[data-act="story-more"][data-story="${sid}"]`); return; }
    if (act === "story-edit") { T.edit = { id: b.dataset.story, from: "", to: "", err: "" }; renderTold(); focusEl("#se-from"); return; }
    if (act === "story-edit-cancel") { const sid = T.edit && T.edit.id; T.edit = null; renderTold(); focusEl(`[data-act="story-edit"][data-story="${sid}"]`); return; }
    if (act === "story-name-pick") { T.edit = { id: b.dataset.story, from: b.dataset.name, to: ($("#se-to") || {}).value || "", err: "" }; renderTold(); focusEl("#se-to"); return; }
    if (act === "story-edit-save") {
      const sid = b.dataset.story, from = $("#se-from").value.trim(), to = $("#se-to").value.trim();
      if (!from || !to) { T.edit = { id: sid, from, to, err: "Add the name as it's written, and the right name." }; renderTold(); focusEl(from ? "#se-to" : "#se-from"); return; }
      b.disabled = true;
      try { V = await call({ intent: "story-name", storyId: sid, from, to }); }
      catch (e) { T.edit = { id: sid, from, to, err: e.message }; renderTold(); focusEl("#se-from"); return; }
      T.edit = null; renderTold(); drawTalk(true);
      focusEl(`[data-act="story-edit"][data-story="${sid}"]`);
      toast(`Fixed: "${from}" is now "${to}". Posts still to come use it.`);
      return;
    }
  });

  // Enter in a one-line field saves its sheet; Enter in the photo search searches.
  const SAVE_FOR = { "ask-url": "ask-yes", "n-imp": "numbers-save", "n-rea": "numbers-save", "n-com": "numbers-save", "conn-n": "conn-save", "se-from": "story-edit-save", "se-to": "story-edit-save" };
  document.addEventListener("keydown", (ev) => {
    const t = ev.target;
    if (ev.key !== "Enter" || !t || t.tagName !== "INPUT") return;
    if (t.id === "stk-q") { ev.preventDefault(); const sb = $('[data-act="stock-search"]'); if (sb) sb.click(); return; }
    const save = SAVE_FOR[t.id];
    if (save) { ev.preventDefault(); const sb = $(`[data-act="${save}"]`); if (sb && !sb.disabled) sb.click(); }
  });
  // What they've typed survives a redraw: the photo search, and a field marked wrong is cleared once they type again.
  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (!t) return;
    if (t.id === "stk-q" && UP.cur && UP.stock[UP.cur]) UP.stock[UP.cur].qDraft = t.value;
    if (t.getAttribute && t.getAttribute("aria-invalid") === "true") t.removeAttribute("aria-invalid");
  });
  let rz;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(fitMore, 120); });
})();
