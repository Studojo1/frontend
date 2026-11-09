(function () {
  "use strict";
  // The onboarding tour: a few steps that light up one part of the fellow's page at a time and say what it's
  // for, ending on the story box (sharing three stories is the last step of joining). It opens by itself on a
  // fellow's first visit (remembered in this browser) and again from the "Take the tour" button. feed.js
  // hands over window.fellowTour once the page is drawn; nothing here talks to the server.
  const KEY = "fellowTour:v1:";
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const icon = (id) => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function steps(T) {
    const ms = T.milestones.map((m) => `${m.weeks} weeks: ${m.name}`);
    return [
      { icon: "home", title: `Welcome, ${T.first}`, body: "This is your Growth Fellowship page. Your LinkedIn posts are written for you from what you share here, and everything you need each week lives on this page. Here's a quick look around." },
      { icon: "mic", tab: "stories", sel: "#share", title: "Tell us your stories", body: "Speak or type about real moments from your life: what you did, who was there, what happened next. After each one you get written feedback on what we can use, plus follow-up questions you can answer by tapping Answer." },
      { icon: "compose", tab: "home", sel: "#ed-cover", title: "Your posts for the week", body: "Five posts a week: three about you and two about Studojo. For each one: copy it, add a photo of your own (every post needs one), post it on LinkedIn, then mark it as posted." },
      { icon: "chart", tab: "home", sel: "#analytics, #shots", title: "Your weekly analytics", body: "Every Sunday, you send us your LinkedIn analytics here. The steps are on this card. It shows us what's working, so we can help you grow." },
      { icon: "cert", tab: "milestones", sel: "#milestones", title: "Milestones", body: ms.length ? `Each week you post all your posts counts toward these: ${ms.join(" · ")}.` : "Each week you post all your posts counts toward your milestones." },
      { icon: "mic", tab: "stories", sel: "#share", title: "Last step: tell us about yourself", body: T.joined() ? "You've already shared your first stories, so you're in. Keep adding new ones: new stories mean better posts." : `Share ${T.storiesWanted} stories about your own life to complete your onboarding and officially join the fellowship. We already have what we covered on your call, so start with something happening in your life right now: a project, a conversation, a setback.`, last: true },
    ];
  }

  let T = null, list = [], at = 0, layer = null, hole = null, card = null, lastFocus = null, tick = null;

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8 && getComputedStyle(el).visibility !== "hidden";
  }
  function place() {
    if (!layer) return;
    const s = list[at], el = s.sel ? document.querySelector(s.sel) : null;
    const lit = visible(el);
    layer.classList.toggle("is-center", !lit);
    if (lit) {
      const r = el.getBoundingClientRect(), pad = 6;
      Object.assign(hole.style, { top: `${r.top - pad}px`, left: `${r.left - pad}px`, width: `${r.width + pad * 2}px`, height: `${Math.min(r.height + pad * 2, innerHeight - 24)}px` });
    }
    if (T.phone() || !lit) {
      card.style.top = ""; card.style.left = "";
      // Phones: the card sits at the bottom, unless that would cover the lit part; then it goes to the top.
      if (lit && T.phone()) {
        const r = el.getBoundingClientRect();
        card.classList.toggle("tour-card-top", r.bottom > innerHeight - card.offsetHeight - 80 && r.top > card.offsetHeight + 70);
      } else card.classList.remove("tour-card-top");
      return;
    }
    // Desktop: beside the lit part, on whichever side has room, kept on screen.
    const r = el.getBoundingClientRect(), cw = card.offsetWidth, ch = card.offsetHeight, gap = 16;
    let left = r.right + gap <= innerWidth - cw - 12 ? r.right + gap : r.left - gap - cw >= 12 ? r.left - gap - cw : Math.max(12, Math.min(innerWidth - cw - 12, r.left));
    let top = left === r.right + gap || left === r.left - gap - cw ? r.top : r.bottom + gap;
    if (top + ch > innerHeight - 12) top = Math.max(12, innerHeight - ch - 12);
    card.style.left = `${left}px`; card.style.top = `${Math.max(12, top)}px`;
  }
  function show(i) {
    at = Math.max(0, Math.min(list.length - 1, i));
    const s = list[at];
    if (s.tab) T.open(s.tab);
    const el = s.sel ? document.querySelector(s.sel) : null;
    if (el && visible(el)) el.scrollIntoView({ behavior: "auto", block: T.phone() ? "start" : "center" });
    // A blue header (the step's icon, how far along, the title and a bar for the whole tour), then the text.
    card.innerHTML = `
      <div class="tour-head">
        <div class="tour-top"><span class="tour-badge" aria-hidden="true">${icon(s.icon)}</span><p class="tour-step">Step ${at + 1} of ${list.length}</p></div>
        <h2 class="tour-title" id="tour-title">${esc(s.title)}</h2>
        <div class="tour-bar" aria-hidden="true">${list.map((_, i) => `<i class="${i <= at ? "on" : ""}"></i>`).join("")}</div>
      </div>
      <p class="tour-body" id="tour-body">${esc(s.body)}</p>
      <div class="tour-actions">
        ${at > 0 ? '<button class="tour-btn tour-quiet" type="button" data-tour="back">Back</button>' : '<button class="tour-btn tour-quiet" type="button" data-tour="skip">Skip</button>'}
        <button class="tour-btn tour-main" type="button" data-tour="${s.last ? "done" : "next"}">${s.last ? (T.joined() ? "Done" : "Tell us about yourself") : at === 0 ? "Show me" : "Next"}${s.last && T.joined() ? "" : icon("arrow")}</button>
      </div>`;
    requestAnimationFrame(() => { place(); const b = card.querySelector(".tour-main"); if (b) b.focus(); });
  }
  function close(toStory) {
    if (!layer) return;
    removeEventListener("resize", place); removeEventListener("scroll", place, true); clearInterval(tick);
    document.removeEventListener("keydown", onKey, true);
    layer.remove(); layer = hole = card = null;
    document.documentElement.classList.remove("tour-on");
    if (toStory) { T.open("stories"); setTimeout(() => T.focusStory(), 50); }
    else if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // A tap on the lit part ends the tour and does what it would have done without it: a fellow who taps the
  // story box, Speak or Type or edit while it's lit gets to use it straight away.
  function passThrough(ev) {
    if (card.contains(ev.target)) return;
    const s = list[at], el = s.sel ? document.querySelector(s.sel) : null;
    if (!visible(el)) return;
    const r = el.getBoundingClientRect(), x = ev.clientX, y = ev.clientY;
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
    close(false);
    const hit = document.elementFromPoint(x, y);
    if (!hit) return;
    const field = hit.closest("textarea, input, select");
    if (field) { field.focus(); return; }
    const target = hit.closest("button, a, label");
    if (target) target.click();
  }
  function onKey(ev) {
    if (!layer) return;
    if (ev.key === "Escape") { ev.preventDefault(); close(false); return; }
    if (ev.key === "ArrowRight" && !list[at].last) { ev.preventDefault(); show(at + 1); return; }
    if (ev.key === "ArrowLeft" && at > 0) { ev.preventDefault(); show(at - 1); return; }
    if (ev.key === "Tab") {
      // Keep focus in the card while the tour is open.
      const f = [...card.querySelectorAll("button")];
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (ev.shiftKey && (i <= 0)) { ev.preventDefault(); f[f.length - 1].focus(); }
      else if (!ev.shiftKey && i === f.length - 1) { ev.preventDefault(); f[0].focus(); }
    }
  }
  function start() {
    if (layer || !T) return;
    // Seen once it opens, so leaving halfway doesn't bring it back over the page on every visit.
    try { localStorage.setItem(KEY + T.slug, "1"); } catch (e) { /* private mode: it just shows again next time */ }
    list = steps(T);
    lastFocus = document.activeElement;
    layer = document.createElement("div");
    layer.className = "tour" + (reduce() ? " tour-still" : "");
    layer.innerHTML = '<div class="tour-hole" aria-hidden="true"></div><div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body"></div>';
    hole = layer.querySelector(".tour-hole"); card = layer.querySelector(".tour-card");
    layer.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-tour]");
      if (!b) { passThrough(ev); return; }
      const a = b.dataset.tour;
      if (a === "next") show(at + 1);
      else if (a === "back") show(at - 1);
      else if (a === "skip") close(false);
      else if (a === "done") close(!T.joined());
    });
    document.body.appendChild(layer);
    document.documentElement.classList.add("tour-on");
    addEventListener("resize", place); addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKey, true);
    tick = setInterval(place, 400); // the page redraws parts of itself; keep the light on the right place
    show(0);
  }
  function addButton() {
    const bar = document.querySelector(".topbar-in");
    if (!bar || document.getElementById("tour-open")) return;
    const b = document.createElement("button");
    b.id = "tour-open"; b.type = "button"; b.className = "tour-open";
    b.setAttribute("aria-label", "Take the tour of your page");
    b.innerHTML = '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-info"/></svg><span>Take the tour</span>';
    b.addEventListener("click", start);
    bar.appendChild(b);
  }
  function ready() {
    T = window.fellowTour;
    if (!T) return;
    addButton();
    let seen = false;
    try { seen = localStorage.getItem(KEY + T.slug) === "1"; } catch (e) { seen = false; }
    if (!seen) setTimeout(start, 500);
  }
  if (window.fellowTour) ready(); else document.addEventListener("fellow:ready", ready, { once: true });
})();
