/**
 * The sensei.studojo.com look, shared by /start and /profile: Geist, Instrument
 * Serif accents, JetBrains Mono labels, hairline panels, pill buttons, mono
 * tags. Scope everything under a .ss wrapper.
 */
export const SENSEI_CSS = `
@font-face { font-family: "Geist"; src: url(/fonts/geist/Geist-Variable.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
@font-face { font-family: "Instrument Serif"; src: url(/fonts/sensei/InstrumentSerif-400.woff2) format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Instrument Serif"; src: url(/fonts/sensei/InstrumentSerif-400-italic.woff2) format("woff2"); font-style: italic; font-weight: 400; font-display: swap; }
@font-face { font-family: "JetBrains Mono"; src: url(/fonts/sensei/JetBrainsMono-400.woff2) format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "JetBrains Mono"; src: url(/fonts/sensei/JetBrainsMono-500.woff2) format("woff2"); font-weight: 500; font-display: swap; }
.ss {
  --bg:#FBFBFD; --bg-2:#F4F4F9; --panel:#FFFFFF; --ink:#16161E; --text-2:#585B6C; --text-3:#8A8D9E; --text-4:#AAADBC;
  --border:rgba(22,22,40,.09); --border-2:rgba(22,22,40,.15);
  --accent:#5B63E8; --accent-deep:#4148C6; --accent-soft:#EEEFFE; --accent-line:rgba(91,99,232,.28);
  --mint:#1E9E6E; --mint-soft:#E7F8F0; --amber:#B4801E; --amber-soft:#FBF0DA; --rose:#C4477A; --rose-soft:#FCEAF0;
  --sans:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; --serif:'Instrument Serif',Georgia,serif; --mono:'JetBrains Mono',ui-monospace,Menlo,monospace;
  --ease:cubic-bezier(.4,0,.2,1);
  --sh-sm:0 1px 2px rgba(18,20,45,.06),0 1px 3px rgba(18,20,45,.05); --sh-md:0 8px 24px -8px rgba(18,20,45,.14); --sh-lg:0 32px 72px -28px rgba(18,20,45,.30);
  font-family:var(--sans); color:var(--ink); font-size:16px; line-height:1.6; letter-spacing:-.011em; -webkit-font-smoothing:antialiased;
}
.ss *:focus-visible { outline:2px solid var(--accent); outline-offset:2px; border-radius:8px; }
.ss h1 { font-size:clamp(2rem,4.2vw,2.75rem); line-height:1.04; letter-spacing:-.035em; font-weight:600; text-wrap:balance; margin:0; }
.ss h1 em, .ss .em { font-family:var(--serif); font-style:italic; font-weight:400; letter-spacing:-.01em; color:var(--accent); }
.ss .lead { font-size:1.02rem; color:var(--text-2); line-height:1.6; max-width:56ch; margin:10px 0 0; }
.ss .mono { font-family:var(--mono); }
.ss .label { font-family:var(--mono); font-size:10.5px; letter-spacing:.04em; text-transform:uppercase; color:var(--text-3); }
.ss .tag { display:inline-flex; align-items:center; gap:5px; font-family:var(--mono); font-size:10.5px; padding:3px 9px; border-radius:999px; white-space:nowrap; border:1px solid var(--accent-line); color:var(--accent-deep); background:var(--accent-soft); }
.ss .tag.amber { color:var(--amber); border-color:rgba(180,128,30,.3); background:var(--amber-soft); }
.ss .tag.rose { color:var(--rose); border-color:rgba(196,71,122,.3); background:var(--rose-soft); }
.ss .tag.mint { color:var(--mint); border-color:rgba(30,158,110,.3); background:var(--mint-soft); }
.ss .tag.plain { color:var(--text-3); border-color:var(--border); background:var(--bg-2); }
.ss .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; padding:12px 22px; font:500 15px var(--sans); border:0; cursor:pointer; white-space:nowrap; text-decoration:none;
  transition:transform .15s var(--ease), box-shadow .15s var(--ease), border-color .15s, background .15s; }
.ss .btn--dark { background:var(--ink); color:#fff; }
.ss .btn--dark:hover { transform:translateY(-1px); box-shadow:0 12px 28px -12px rgba(18,20,45,.55); }
.ss .btn--accent { background:var(--accent); color:#fff; }
.ss .btn--accent:hover { transform:translateY(-1px); box-shadow:0 12px 28px -12px rgba(91,99,232,.6); }
.ss .btn--ghost { background:#fff; color:var(--ink); border:1px solid var(--border-2); }
.ss .btn--ghost:hover { border-color:var(--ink); }
.ss .btn[disabled] { opacity:.5; pointer-events:none; }
.ss .link { background:none; border:0; padding:0; font:inherit; font-weight:500; color:var(--accent-deep); cursor:pointer; text-decoration:none; }
.ss .link:hover { text-decoration:underline; }
.ss .chip { display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border:1px solid var(--border); border-radius:999px; background:#fff; font-size:13.5px; color:var(--text-2); cursor:pointer; transition:border-color .15s, background .15s, color .15s; }
.ss .chip:hover { border-color:var(--border-2); color:var(--ink); }
.ss .chip.on { border-color:var(--accent-line); background:var(--accent-soft); color:var(--accent-deep); }
.ss .panel { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--sh-lg); overflow:hidden; }
.ss .panel__bar { display:flex; align-items:center; gap:10px; padding:12px 18px; border-bottom:1px solid var(--border); background:var(--bg-2); font-family:var(--mono); font-size:11.5px; color:var(--text-3); }
.ss .tile { background:#fff; border:1px solid var(--border); border-radius:14px; box-shadow:var(--sh-sm); }
.ss .row { display:flex; align-items:center; gap:14px; padding:14px 18px; border-bottom:1px solid var(--border); }
.ss .row:last-child { border-bottom:0; }
.ss .sq { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:grid; place-items:center; color:#fff; font-weight:600; font-size:13px; }
.ss .dot { width:7px; height:7px; border-radius:50%; background:var(--mint); box-shadow:0 0 0 3px rgba(30,158,110,.15); }
.ss input.field { width:100%; border:1px solid var(--border-2); border-radius:12px; padding:11px 14px; font:400 15px var(--sans); color:var(--ink); background:#fff; outline:none; }
.ss input.field:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
@keyframes ssIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
.ss .fade { animation:ssIn .3s var(--ease) both; }
@media (prefers-reduced-motion: reduce) { .ss .fade { animation:none } .ss .btn { transition:none } }
`;
