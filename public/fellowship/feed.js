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
      url: p.url, metrics: p.metrics, numbersDue: p.numbersDue || null, shots: p.shots || [],
      photoIdea: p.photoIdea || "", photos: p.photos || [], photoHelp: !!p.photoHelp,
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
    const held = (list) => list.filter((p) => p.status === "blocked").map((p) => p.id).sort().join();
    if (v.program.today !== TODAY || ids(M.thisWeek.posts) !== ids(S.posts) || held(M.thisWeek.posts) !== held(S.posts)) { location.reload(); return false; }
    for (const sp of M.thisWeek.posts) {
      const p = byId(sp.id);
      if (p) Object.assign(p, { status: sp.status, copied: !!sp.copiedAt, ownLine: sp.ownLine || "", postedAt: sp.postedAt, url: sp.url, metrics: sp.metrics, numbersDue: sp.numbersDue || null, shots: sp.shots || [],
        photoIdea: sp.photoIdea || "", photos: sp.photos || [], photoHelp: !!sp.photoHelp });
    }
    ME.thisWeek.due = M.thisWeek.due;
    Object.assign(ME, {
      weeklyRun: M.weeklyRun, completedWeeks: M.completedWeeks, milestones: M.milestones, history: M.history,
      cohortPosition: M.cohortPosition, cohortPostedThisWeek: M.cohortPostedThisWeek, cohortSize: M.cohortSize, cohortFeed: M.cohortFeed,
    });
    S.conn.now = M.connections.now; S.conn.atJoin = M.connections.atJoin; S.conn.history = M.connections.history.slice();
    S.stories = M.stories.slice();
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
    const dots = counted().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<i class="${p.status === "posted" ? "on" : ""}"></i>`).join("");
    $("#week-pill").innerHTML = `<span class="segs" aria-hidden="true">${dots}</span><span>This week: <b>${n} of ${due}</b> posted</span>`;
    $("#week-pill").setAttribute("aria-label", `This week: ${n} of ${due} posted. ${n < due ? "Go to your next post" : "All posts done"}`);
    $("#week-range").textContent = fmt(ME.thisWeek.start, false) + " to " + fmt(addDays(ME.thisWeek.start, 6), false);
    $("#feed-help").textContent = n >= due
      ? `${allPosts(due, "out")} this week. Add your numbers a week after each one.`
      : "As they will look on LinkedIn. Add your own photo to each post, then tap Post on LinkedIn: it copies the post and opens LinkedIn. Add the photo there too, and paste the text if it isn't filled in. You post it yourself: Studojo never posts for you.";
  }

  /* ---------- analytics screenshots: at the end of each week, a screenshot of LinkedIn's analytics for every post
     that went out. Saved privately; only this page and the Studojo team can open them. */
  const shotUrl = (id, t) => `${API}/proof?post=${encodeURIComponent(id)}&shot=${encodeURIComponent(t)}`;
  // The server allows removing one for a day after it's added (the time is the token's first 13 digits).
  const shotFresh = (t) => Date.now() - Number(t.slice(0, 13)) < 23.5 * 3600 * 1000;
  // Any post on the page with images: this week's, last weeks' posted ones, and ones that never went up.
  const imagePost = (id) => byId(id) || ME.history.flatMap((w) => w.posts.concat(w.missed || [])).find((p) => p.id === id);
  function shotStrip(p) {
    const busy = S.shotBusy && S.shotBusy.id === p.id && S.shotBusy.kind === "shot";
    const thumbs = p.shots.map((t, i) => `<span class="shot">
        <a class="shot-img" href="${esc(shotUrl(p.id, t))}" target="_blank" rel="noopener"><img src="${esc(shotUrl(p.id, t))}" alt="Analytics screenshot ${i + 1}, ${esc(p.title)}" width="48" height="72" loading="lazy"></a>
        ${shotFresh(t) ? `<button class="shot-x" type="button" data-act="shot-remove" data-id="${p.id}" data-shot="${esc(t)}" aria-label="Remove analytics screenshot ${i + 1}, ${esc(p.title)}">${ic("x")}</button>` : ""}
      </span>`).join("");
    const add = busy
      ? `<span class="shot-add is-busy">Adding ${S.shotBusy.done + 1} of ${S.shotBusy.total}</span>`
      : p.shots.length >= P.shotsPerPost ? ""
      : `<button class="shot-add" type="button" data-act="shot-add" data-id="${p.id}" aria-label="${p.shots.length ? "Add more analytics screenshots" : "Add analytics screenshot"}, ${esc(p.title)}">${ic("image")}<span>${p.shots.length ? "Add more" : "Add screenshot"}</span></button>`;
    return `<div class="shots-strip">${thumbs}${add}</div>`;
  }
  const SHOTS_HOW = `<details class="shots-how"><summary>How to take them</summary><ol>
      <li>On LinkedIn, open the post and tap the impressions count under it (or View analytics).</li>
      <li>Screenshot the whole analytics page. If it doesn't fit on one screen, scroll and take another: each post can have up to ${P.shotsPerPost}.</li>
      <li>Come back here and tap Add screenshot next to that post.</li>
    </ol></details>`;
  // Saturday and Sunday ask for this week's posts; Monday to Friday for last week's, until they're in.
  function shotWeek() {
    const dow = parseD(TODAY).getUTCDay();
    if (dow === 0 || dow === 6) return { weekend: true, sunday: dow === 0, posts: S.posts.filter((p) => p.status === "posted") };
    const last = ME.history.find((w) => w.week === addDays(ME.thisWeek.start, -7));
    return { weekend: false, sunday: false, posts: last ? last.posts : [] };
  }
  const shotsDue = () => { const w = shotWeek(); return w.posts.length > 0 && (w.weekend || w.posts.some((p) => !p.shots.length)); };
  function renderShots() {
    const w = shotWeek(), missing = w.posts.filter((p) => !p.shots.length).length;
    if (!shotsDue()) {
      $("#shots").className = "card card-pad shots";
      $("#shots").innerHTML = `
        <h2 class="card-title" id="shots-title">${ic("image")}Two things only you can add</h2>
        <ol class="shots-steps">
          <li><b>Your own photo on every post.</b> Add it on the post before you copy it: Copy and Post on LinkedIn unlock once it's there.</li>
          <li><b>Every Sunday, analytics screenshots.</b> A screenshot of LinkedIn's analytics for each post you put out that week, so the team can see how your posts did.</li>
        </ol>
        ${SHOTS_HOW}`;
      return;
    }
    const title = w.weekend ? (w.sunday ? "Today: your analytics screenshots" : "Tomorrow: your analytics screenshots") : "Last week's analytics screenshots";
    const sub = w.weekend
      ? (missing ? `For each post you put out this week, add a screenshot of its LinkedIn analytics. ${missing} of ${w.posts.length} still ${missing === 1 ? "needs" : "need"} one.` : "Every post this week has a screenshot. Thank you. You can still add more.")
      : `${missing} of ${w.posts.length} ${w.posts.length === 1 ? "post" : "posts"} from last week still ${missing === 1 ? "needs" : "need"} a screenshot of its LinkedIn analytics.`;
    $("#shots").className = "card card-pad shots is-due";
    $("#shots").innerHTML = `
      <h2 class="card-title" id="shots-title">${ic("image")}${title}</h2>
      <p class="card-sub">${sub}</p>
      <ul class="shot-rows">${w.posts.map((p) => `<li class="shot-row" id="shotrow-${p.id}">
        <p class="shot-what"><b>${esc(p.day)}</b> ${esc(p.title)}${p.shots.length ? `<span class="chip chip-good">${ic("check", "ic-xs")}${p.shots.length}</span>` : ""}</p>
        ${shotStrip(p)}
      </li>`).join("")}</ul>
      <p class="shots-photo">${ic("image", "ic-sm")}Every post also needs your own photo before you copy it.</p>
      ${SHOTS_HOW}`;
  }
  function refreshShots(id) { renderShots(); if (byId(id) && byId(id).status === "posted") rerenderPost(id); }

  /* ---------- the fellow's own photo: every post goes out with one. Copy, Post on LinkedIn and I posted it
     wait for it, and the server refuses to mark a post posted without one. LinkedIn's share link carries
     only text, so the page reminds them to add the photo there too. */
  const photoUrl = (id, t) => `${API}/proof?post=${encodeURIComponent(id)}&photo=${encodeURIComponent(t)}`;
  const hasPhoto = (p) => !!(p.photos && p.photos.length);
  const PHOTO_IDEA = "A photo you took yourself that fits this post: you, your desk, your college, or the place it happened.";
  function photoBlock(p) {
    const busy = S.shotBusy && S.shotBusy.id === p.id && S.shotBusy.kind === "photo";
    const n = p.photos.length;
    const thumbs = p.photos.map((t, i) => `<span class="shot">
        <a class="shot-img ph-img" href="${esc(photoUrl(p.id, t))}" target="_blank" rel="noopener"><img src="${esc(photoUrl(p.id, t))}" alt="Your photo ${i + 1}, ${esc(p.title)}" width="64" height="64" loading="lazy"></a>
        <button class="shot-x" type="button" data-act="photo-remove" data-id="${p.id}" data-photo="${esc(t)}" aria-label="Remove photo ${i + 1}, ${esc(p.title)}">${ic("x")}</button>
      </span>`).join("");
    const add = busy
      ? `<span class="shot-add is-busy">Adding ${S.shotBusy.done + 1} of ${S.shotBusy.total}</span>`
      : n >= P.photosPerPost ? ""
      : `<button class="shot-add ${n ? "" : "is-primary"}" type="button" data-act="photo-add" data-id="${p.id}" aria-label="${n ? "Add another photo" : "Add your photo"}, ${esc(p.title)}">${ic("image")}<span>${n ? "Add another" : "Add your photo"}</span></button>`;
    const help = !n && !p.photoHelp && !busy ? `<button class="btn-link ph-help" type="button" data-act="photo-help" data-id="${p.id}">I don't have a photo for this</button>` : "";
    const note = n ? "On LinkedIn, add this photo to the post as well: the link only carries the text."
      : p.photoHelp ? "You asked for a photo: the Studojo team will add one here. The post unlocks once it's here, or once you add your own."
      : "Copy and Post on LinkedIn unlock once your own photo is added. Every post goes out with one.";
    return `<div class="ph">
      <p class="ph-idea">${ic("image", "ic-sm")}<span><b>Photo for this post:</b> ${esc(p.photoIdea || PHOTO_IDEA)}</span></p>
      <div class="shots-strip">${thumbs}${add}${help}</div>
      <p class="ph-note ${n ? "" : "is-locked"}" id="phnote-${p.id}">${note}</p>
    </div>`;
  }
  // The post as LinkedIn will show it: the photos under the text.
  function liMedia(p) {
    if (!hasPhoto(p)) return "";
    const list = p.photos.slice(0, 4);
    return `<div class="li-media n-${list.length}">${list.map((t) => `<img src="${esc(photoUrl(p.id, t))}" alt="" loading="lazy">`).join("")}</div>`;
  }
  function refreshPhoto(id) { if (byId(id)) { rerenderPost(id); renderCover(); } else renderActivity(); }

  // Every screenshot is redrawn as a JPEG before it's sent: that drops a photo's hidden details (like where it
  // was taken), turns iPhone HEIC into JPEG and keeps it small. A tall scrolling screenshot keeps its width,
  // so the numbers stay readable.
  const UNREADABLE = "That file isn't a picture the page can read. Choose another one.";
  // Screenshots: at most 1280 px wide and 8 megapixels, 3 MB. Photos: good enough for LinkedIn, 2048 px on the long side, 5 MB.
  const IMAGE = {
    shot: { scale: (w, h) => Math.min(1, 1280 / w, Math.sqrt(8e6 / (w * h))), qs: [0.85, 0.7, 0.55], bytes: 3 * 1024 * 1024, big: "That screenshot is too big to send. Try a shorter one." },
    photo: { scale: (w, h) => Math.min(1, 2048 / Math.max(w, h)), qs: [0.85, 0.75], bytes: 5 * 1024 * 1024, big: "That photo is too big to send. Try another one." },
  };
  function imageFromData(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => reject(new Error(UNREADABLE)); im.src = r.result; };
      r.onerror = () => reject(new Error(UNREADABLE));
      r.readAsDataURL(file);
    });
  }
  async function toJpeg(file, kind) {
    if (file.type && !file.type.startsWith("image/")) throw new Error(UNREADABLE);
    let img;
    try { img = await createImageBitmap(file); } catch (e) { img = await imageFromData(file); }
    const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
    if (!w0 || !h0) throw new Error(UNREADABLE);
    const scale = IMAGE[kind].scale(w0, h0);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w0 * scale)); c.height = Math.max(1, Math.round(h0 * scale));
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    if (img.close) img.close();
    for (const q of IMAGE[kind].qs) {
      const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", q));
      if (blob && blob.size <= IMAGE[kind].bytes) return blob;
    }
    throw new Error(IMAGE[kind].big);
  }
  S.shotBusy = null;
  let pick = null; // which post and which kind the file picker is for
  $("#shot-file").addEventListener("change", async () => {
    const input = $("#shot-file"), files = [...input.files], asked = pick;
    input.value = ""; pick = null;
    const p = asked && imagePost(asked.id);
    if (!p || !files.length || S.shotBusy) return;
    const { id, kind } = asked, photo = kind === "photo";
    const had = photo ? p.photos.length : p.shots.length;
    const take = files.slice(0, (photo ? P.photosPerPost : P.shotsPerPost) - had);
    const refresh = () => (photo ? refreshPhoto(id) : refreshShots(id));
    S.shotBusy = { id, kind, done: 0, total: take.length }; refresh();
    let added = 0, err = "";
    for (const f of take) {
      try {
        const v = await send(`${API}/proof?post=${encodeURIComponent(id)}${photo ? "&kind=photo" : ""}`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "image/jpeg" }, body: await toJpeg(f, kind) });
        if (!applyView(v)) return;
        added++; S.shotBusy.done = added; refresh();
      } catch (e) { err = e.message; break; }
    }
    S.shotBusy = null; refresh();
    focusEl(`[data-act="${photo ? "photo-add" : "shot-add"}"][data-id="${id}"]`);
    const word = photo ? "photo" : "screenshot", most = photo ? P.photosPerPost : P.shotsPerPost;
    if (err) toast(added ? `${plural(added, word)} added. ${err}` : err, "error");
    else if (files.length > take.length) toast(`${plural(added, word)} added. A post can have up to ${most}.`);
    else if (photo && !had) toast("Photo added. Copy and Post on LinkedIn are unlocked.");
    else toast(`${added === 1 ? word[0].toUpperCase() + word.slice(1) : plural(added, word)} added. Thank you.`);
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
            <h1 class="p-name">${esc(ME.name)}</h1>
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
    else if (!hasPhoto(next)) {
      dek = next.photoHelp
        ? `<b>The Studojo team is adding a photo to ${dowLong(next.date)}'s post.</b> It unlocks once the photo is there, or once you add your own.`
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
      // The hard rule: nothing goes out without the fellow's own photo, so these wait for one.
      const locked = !hasPhoto(p), lock = locked ? ` disabled aria-describedby="phnote-${p.id}"` : "";
      const sharePrimary = isNext && !p.copied && !locked, postPrimary = isNext && p.copied && !locked;
      actions = `<div class="actions" role="group" aria-label="${esc(dowLong(p.date))} post actions">
        ${locked
          ? `<button class="act act-share" type="button"${lock}>${ic("share")}<span>Post on LinkedIn</span></button>`
          : `<a class="act act-share ${sharePrimary ? "is-primary" : ""}" href="${esc(composeUrl(p))}" target="_blank" rel="noopener noreferrer" data-act="share" data-id="${p.id}">${ic("share")}<span>Post on LinkedIn</span><span class="sr-only"> (copies the post and opens LinkedIn in a new tab)</span></a>`}
        <button class="act ${p.copied ? "is-done" : ""}" type="button" data-act="copy" data-id="${p.id}"${lock}>${ic(p.copied ? "check" : "copy")}<span>${p.copied ? "Copied" : "Copy"}</span></button>
        <button class="act" type="button" data-act="line" data-id="${p.id}" aria-expanded="${p.panel === "line"}" aria-controls="panel-${p.id}">${ic("pen")}<span>${p.ownLine ? "Edit your line" : "Add your line"}</span></button>
        <button class="act ${postPrimary ? "is-primary" : ""}" type="button" data-act="posted" data-id="${p.id}" aria-expanded="${p.panel === "posted"}" aria-controls="panel-${p.id}"${lock}>${ic("send")}<span>I posted it</span></button>
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
      const link = p.url
        ? `<span class="lt">${esc(shortUrl(p.url))}</span>`
        : `<button class="btn-link" type="button" data-act="posted" data-id="${p.id}" aria-expanded="${p.panel === "posted"}" aria-controls="panel-${p.id}">Add the link to your post</button>`;
      footer = `${strip}<div class="an">${an}<div class="link-row">${ic("link", "ic-sm")}${link}</div>
        <div class="an-shots"><p class="an-shots-label">${ic("image", "ic-sm")}Analytics screenshots</p>${shotStrip(p)}</div></div>`;
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
  function savePart(text) {
    if (!S.parts.prompt) S.parts.prompt = ME.storyPrompts[S.promptIdx] || ME.storyPrompts[0];
    call({ intent: "story", prompt: S.parts.prompt, text, spoken: true }).then((v) => {
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
    try { r.start(); } catch (e) { rec = null; S.listening = false; S.storyErr = "We couldn't start the microphone. Type your story instead."; }
  }
  function renderShare(keepText) {
    const ta = $("#story-text");
    const text = keepText && ta ? ta.value : "";
    const prompts = ME.storyPrompts;
    const pr = prompts[S.promptIdx] || prompts[0];
    // A long story (a long talk saved in parts) shows its first lines until they ask for all of it.
    const stories = S.stories.map((s) => `<li class="story" tabindex="-1">
        <p class="st-prompt">${esc(s.prompt)}</p>
        <p class="st-text ${s.text.length > 400 && !S.storyOpen.has(s.id) ? "is-clamped" : ""}" id="st-${esc(s.id)}">${esc(s.text)}</p>
        ${s.text.length > 400 ? `<button class="btn-link st-more" type="button" data-act="story-more" data-story="${esc(s.id)}" aria-controls="st-${esc(s.id)}" aria-expanded="${S.storyOpen.has(s.id)}">${S.storyOpen.has(s.id) ? "Show less" : "Show all"}</button>` : ""}
        <p class="st-meta">${ic(s.spoken ? "mic" : "keyboard")}${s.spoken ? "Spoken" : "Typed"}, ${fmt(s.createdAt.slice(0, 10), false)}</p>
      </li>`).join("");
    const asking = askingForStories(), left = ME.storiesWanted - S.stories.length;
    $("#share").classList.toggle("is-listening", S.listening);
    $("#share").classList.toggle("is-asking", asking);
    $("#share").innerHTML = `
      <div class="card-head"><h2 class="card-title" id="share-title">${asking ? "Start here: tell us your story" : "Share an experience"}</h2>${asking ? `<span class="chip chip-next">${S.stories.length} of ${ME.storiesWanted} shared</span>` : ""}</div>
      <p class="card-sub">${asking
        ? `Your posts are written from what you share here, so this comes first. Share ${left === 1 ? "one more story" : left + " stories"} about your own life: real places, people and what happened next make the best posts.`
        : "Tell us what happened, in your own words. Your posts are written from these, so new stories mean better posts."}</p>
      <div class="prompt-box">
        <div class="prompt-top">
          <span class="kicker">${ic("bulb")}Question ${S.promptIdx + 1} of ${prompts.length}</span>
          <button class="btn-link" type="button" data-act="prompt-next">Another question${ic("arrow", "ic-sm")}</button>
        </div>
        <p class="prompt-text" id="prompt-text">${esc(pr)}</p>
      </div>
      <label class="sr-only" for="story-text">Your story</label>
      <textarea id="story-text" rows="4" aria-describedby="prompt-text story-err" placeholder="${S.listening ? "Listening. Start talking and we'll write it here." : canSpeak() ? "Type your story, or tap Speak and talk. Where it happened, what you did, what came next." : "Type your story here: where it happened, what you did, what came next."}">${esc(text)}</textarea>
      <p class="err" id="story-err">${S.storyErr ? ic("alert") + esc(S.storyErr) : ""}</p>
      ${S.parts.saved ? `<p class="parts-note" role="status">${ic("check-circle", "ic-sm")}${S.parts.saved === 1 ? "The first part of your story is saved." : `${S.parts.saved} parts of your story are saved.`}${S.listening ? " Keep talking." : " Share the rest when you're done."}</p>` : ""}
      <div class="share-actions">
        ${canSpeak() ? `<button class="mic" type="button" data-act="mic" aria-pressed="${S.listening}">
          <span class="mic-ring">${ic("mic")}</span>
          <span>${S.listening ? "Tap to stop" : "Speak"}</span>
          <span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        </button>` : ""}
        <button class="btn btn-primary" type="button" data-act="story-save">Share</button>
      </div>
      ${canSpeak() ? `<p class="voice-note">Speaking uses your browser's speech service (Google on Chrome and Android, Apple on iPhone) to turn your voice into text. Check the text, then share it.</p>` : ""}
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
      <p class="card-sub">What's happened in ${ME.cohort ? esc(ME.cohort) : "the fellowship"} over the last 7 days.</p>
      <div class="news-hi">${ic("trend")}<div>${ME.cohortPosition ? `<b>${esc(ME.cohortPosition)}</b>` : ""}<span>${ME.cohortPostedThisWeek} of ${ME.cohortSize} ${ME.cohortSize === 1 ? "fellow has" : "fellows have"} posted this week</span></div></div>
      <div class="news-group">
        <p class="kicker">Latest in ${ME.cohort ? esc(ME.cohort) : "the fellowship"}</p>
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
            <button class="btn btn-ghost btn-sm" type="button" data-act="hist-copy" data-id="${m.id}" aria-label="Copy ${esc(m.title)}"${hasPhoto(m) ? "" : ` disabled aria-describedby="phnote-${m.id}"`}>${ic("copy")}Copy</button>
            <button class="btn btn-secondary btn-sm" type="button" data-act="hist-posted" data-id="${m.id}" aria-expanded="${open(m.id, "posted")}" aria-controls="hpanel-${m.id}" aria-label="I posted it: ${esc(m.title)}"${hasPhoto(m) ? "" : ` disabled aria-describedby="phnote-${m.id}"`}>I posted it</button>
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
    if (act === "tab") { if (phone.matches) showTab(b.dataset.tab); else goToSection(b.dataset.tab); return; }
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
    if (act === "shot-add" || act === "photo-add") { if (S.shotBusy) return; pick = { id, kind: act === "photo-add" ? "photo" : "shot" }; $("#shot-file").click(); return; }
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
      refreshPhoto(id);
      focusEl(`[data-act="photo-add"][data-id="${id}"]`);
      toast("Thanks. The Studojo team will add a photo to this post. You can still add your own.");
      return;
    }
    if (act === "shot-remove") {
      b.disabled = true;
      try {
        const v = await send(`${API}/proof?post=${encodeURIComponent(id)}&shot=${encodeURIComponent(b.dataset.shot)}`, { method: "DELETE", headers: { Accept: "application/json" } });
        if (!applyView(v)) return;
      } catch (e) { b.disabled = false; toast(e.message, "error"); return; }
      refreshShots(id);
      focusEl(`[data-act="shot-add"][data-id="${id}"]`);
      toast("Screenshot removed.");
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
    if (act === "mic") {
      if (S.listening) stopListening(); else { S.quietEnds = 0; startListening(); }
      renderShare(true); focusEl('[data-act="mic"]');
      return;
    }
    if (act === "story-more") {
      const sid = b.dataset.story;
      if (S.storyOpen.has(sid)) S.storyOpen.delete(sid); else S.storyOpen.add(sid);
      renderShare(true); focusEl(`[data-act="story-more"][data-story="${sid}"]`);
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
          const v = await call({ intent: "story", prompt, text: S.parts.waiting[0], spoken: true });
          S.parts.waiting.shift(); S.parts.saved++;
          if (!applyView(v)) return;
        }
        if (text.length >= 10 && !applyView(await call({ intent: "story", prompt, text, spoken: S.spoke }))) return;
      } catch (e) { S.storyErr = e.message; renderShare(true); $("#story-text").focus(); return; }
      const parts = S.parts.saved + (text.length >= 10 ? 1 : 0);
      S.listening = false; S.spoke = false; S.storyErr = ""; S.promptIdx = 0; S.parts = { saved: 0, waiting: [], prompt: null };
      renderShare(false); focusEl("#share .story");
      toast(parts > 1 ? `Story shared in ${parts} parts. Thank you, ${ME.first}.` : "Story shared. Thank you, " + ME.first + ".");
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
    home: ["#notice", "#shots", "#ed-cover", ".learn-teaser", ".feed-head", "#posts"],
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
  // Screenshots that are due go first; the rest of the time the reminder sits under the story ask.
  if (!shotsDue()) $("#main").insertBefore($("#shots"), $("#ed-cover"));
  renderTop(); renderProfile(); renderShots(); renderCover(); renderPosts(); renderMilestones(); renderShare(false); renderNews(); renderActivity();
  showTab("home");
  $("#page").classList.add("is-ready");
  $("#main").removeAttribute("aria-busy");
  }
})();
