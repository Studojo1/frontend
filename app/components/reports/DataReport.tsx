import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

// SEO-BULK (11 Nov 2026): one layout for the data reports built from the Studojo Jobs Index (October 2026). Each
// route file (routes/reports.<slug>.tsx) holds its own content object and its own Stu card; this file draws the page
// with the same classes as the hand-built reports (rpt-hero, keyfindings, stat-bar, rpt-section...), so
// site-reports.css restyles it the same way on studojo.com.

const BASE_URL = "https://studojo.com";

export type DataReportChart = {
  /** Canvas id, unique across reports. */
  id: string;
  kind: "bar" | "hbar" | "doughnut";
  /** The line above the chart: what it shows and where the numbers come from. */
  label: string;
  labels: string[];
  values: number[];
  /** Tooltip suffix, for example "listings" or "%". */
  unit: string;
};

export type DataReportSection = {
  title: string;
  sub: string;
  /** Paragraphs; **text** renders bold. */
  paras: string[];
  chart?: DataReportChart;
  table?: { head: string[]; rows: string[][]; note?: string };
  /** One dark callout; **text** renders bold. */
  callout?: string;
};

export type DataReportContent = {
  slug: string;
  /** The page title and Article headline (" | Studojo" is added to <title>). */
  title: string;
  /** Short name for the breadcrumb, og:title and the related cards. */
  short: string;
  description: string;
  keywords: string;
  h1: string;
  /** The emphasised end of the h1. */
  h1em: string;
  sub: string;
  /** YYYY-MM-DD */
  published: string;
  scope: string;
  findings: string[];
  stats: { num: string; label: string; source: string }[];
  sections: DataReportSection[];
  /** How we counted: the dataset, the filters, the limits. */
  method: string[];
  faq: { q: string; a: string }[];
  takeaway: { sub: string; items: [string, string][] };
  related: { slug: string; kicker: string; title: string }[];
  dataset: { name: string; description: string; variables: string[] };
  /** The index page only: every report and guide built on this data, grouped. */
  directory?: { title: string; sub: string; groups: { heading: string; links: { href: string; label: string }[] }[] };
};

export function dataReportMeta(r: DataReportContent) {
  const url = `${BASE_URL}/reports/${r.slug}`;
  return [
    { title: `${r.title} | Studojo` },
    { name: "description", content: r.description },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: r.keywords },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "article" },
    { property: "og:title", content: r.short },
    { property: "og:description", content: r.description },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: `${BASE_URL}/og-reports.png` },
    { property: "og:locale", content: "en_IN" },
    { property: "article:published_time", content: `${r.published}T00:00:00Z` },
    { property: "article:author", content: "Studojo" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${r.short} | Studojo` },
    { name: "twitter:description", content: r.description },
    { name: "twitter:image", content: `${BASE_URL}/og-reports.png` },
  ];
}

declare global {
  interface Window { Chart: any; }
}

const PALETTE = ["#8B5CF6", "#a78bfa", "#c4b5fd", "#6d28d9", "#ddd6fe", "#737373", "#a3a3a3", "#d4d4d4"];

function drawCharts(charts: DataReportChart[]) {
  const Chart = window.Chart;
  if (!Chart) return;
  Chart.defaults.font.family = "Satoshi, sans-serif";
  Chart.defaults.color = "#171717";
  const gridOpts = { color: "#f0f0ee", lineWidth: 1 };
  for (const c of charts) {
    const el = document.getElementById(c.id) as HTMLCanvasElement | null;
    if (!el || el.dataset.rendered) continue;
    el.dataset.rendered = "1";
    const tip = { callbacks: { label: (ctx: any) => ` ${Number(ctx.raw).toLocaleString("en-IN")} ${c.unit}` } };
    if (c.kind === "doughnut") {
      new Chart(el, {
        type: "doughnut",
        data: { labels: c.labels, datasets: [{ data: c.values, backgroundColor: PALETTE, borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12, padding: 14 } }, tooltip: tip },
        },
      });
      continue;
    }
    const horizontal = c.kind === "hbar";
    const valueAxis = { grid: gridOpts, border: { dash: [4, 4] }, ticks: { font: { size: 11 }, color: "#737373" } };
    const labelAxis = { grid: { display: false }, ticks: { font: { size: 11 }, color: "#171717" } };
    new Chart(el, {
      type: "bar",
      data: { labels: c.labels, datasets: [{ data: c.values, backgroundColor: "#8B5CF6", borderColor: "#171717", borderWidth: 1.5, borderRadius: 6 }] },
      options: {
        indexAxis: horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: tip },
        scales: horizontal ? { x: valueAxis, y: labelAxis } : { x: labelAxis, y: valueAxis },
      },
    });
  }
}

/** **text** to <strong>. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</>;
}

export function DataReport({ r, children }: { r: DataReportContent; children: ReactNode }) {
  const url = `${BASE_URL}/reports/${r.slug}`;
  useEffect(() => {
    const charts = r.sections.flatMap((s) => (s.chart ? [s.chart] : []));
    if (typeof window === "undefined" || charts.length === 0) return;
    if (window.Chart) { drawCharts(charts); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.onload = () => drawCharts(charts);
    document.head.appendChild(script);
  }, [r]);
  const updated = new Date(`${r.published}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const month = new Date(`${r.published}T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": r.title,
        "description": r.description,
        "url": url,
        "datePublished": `${r.published}T00:00:00Z`,
        "dateModified": `${r.published}T00:00:00Z`,
        "author": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "publisher": { "@type": "Organization", "name": "Studojo", "url": BASE_URL, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url },
        "image": `${BASE_URL}/og-reports.png`,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
          { "@type": "ListItem", "position": 2, "name": "Reports", "item": `${BASE_URL}/reports` },
          { "@type": "ListItem", "position": 3, "name": r.short, "item": url },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": r.faq.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": r.dataset.name,
        "description": r.dataset.description,
        "url": url,
        "isAccessibleForFree": true,
        "creator": { "@type": "Organization", "name": "Studojo", "url": BASE_URL },
        "temporalCoverage": "2026-10-01/2026-10-31",
        "spatialCoverage": { "@type": "Place", "name": "India" },
        "variableMeasured": r.dataset.variables,
        "dateModified": `${r.published}T00:00:00Z`,
      }) }} />

      <Header />
      <style dangerouslySetInnerHTML={{ __html: reportCSS }} />
      <main>
        <div className="rpt-hero">
          <div className="rpt-hero-inner">
            <div className="rpt-badge">Studojo Research · {month}</div>
            <nav className="rpt-breadcrumb" aria-label="Breadcrumb">
              <Link to="/reports" className="rpt-breadcrumb-link">Reports</Link>
              <span className="rpt-breadcrumb-sep">›</span>
              <span>{r.short}</span>
            </nav>
            <h1>{r.h1} <em>{r.h1em}</em></h1>
            <p className="rpt-hero-sub">{r.sub}</p>
            <div className="rpt-meta">
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Scope</span>
                <span className="rpt-meta-value">{r.scope}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Data</span>
                <span className="rpt-meta-value">Studojo Jobs Index, October 2026</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Updated</span>
                <span className="rpt-meta-value">{updated}</span>
              </div>
              <div className="rpt-meta-item">
                <span className="rpt-meta-label">Prepared by</span>
                <span className="rpt-meta-value">Studojo Research</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rpt-body">
          <div className="keyfindings">
            <h2>Key findings</h2>
            <div className="kf-list">
              {r.findings.map((f) => (
                <div className="kf-item" key={f}><span className="kf-check">✓</span><span><Rich text={f} /></span></div>
              ))}
            </div>
          </div>

          <div className="stat-bar">
            {r.stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="sc-num">{s.num}</div>
                <div className="sc-label">{s.label}</div>
                <div className="sc-source">{s.source}</div>
              </div>
            ))}
          </div>

          {r.sections.map((s, i) => (
            <div className="rpt-section" key={s.title}>
              <div className="sec-header">
                <div className="sec-num">{i + 1}</div>
                <div>
                  <h2 className="sec-title">{s.title}</h2>
                  <div className="sec-sub">{s.sub}</div>
                </div>
              </div>
              {s.paras.map((p) => <p key={p}><Rich text={p} /></p>)}
              {s.chart && (
                <div className="chart-wrap">
                  <div className="chart-label">{s.chart.label}</div>
                  <div style={{ height: s.chart.kind === "hbar" ? Math.max(220, s.chart.labels.length * 34) : 260 }}>
                    <canvas id={s.chart.id} role="img" aria-label={s.chart.label} />
                  </div>
                </div>
              )}
              {s.table && (
                <>
                  <table className="data-table">
                    <thead><tr>{s.table.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {s.table.rows.map((row) => (
                        <tr key={row.join("|")}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                  {s.table.note && <p className="rpt-note">{s.table.note}</p>}
                </>
              )}
              {s.callout && <div className="callout"><Rich text={s.callout} /></div>}
            </div>
          ))}

          <div className="rpt-section">
            <div className="sec-header">
              <div className="sec-num">{r.sections.length + 1}</div>
              <div>
                <h2 className="sec-title">How we counted</h2>
                <div className="sec-sub">The data behind this report, and its limits</div>
              </div>
            </div>
            {r.method.map((p) => <p key={p}><Rich text={p} /></p>)}
            <div className="highlight">
              <strong>Cite this report:</strong> {r.title}. Studojo Research, {updated}. Studojo Jobs Index, October 2026. {url}
            </div>
          </div>

          {r.directory && (
            <div className="rpt-section">
              <div className="sec-header">
                <div>
                  <h2 className="sec-title">{r.directory.title}</h2>
                  <div className="sec-sub">{r.directory.sub}</div>
                </div>
              </div>
              <div className="dir-grid">
                {r.directory.groups.map((g) => (
                  <div className="dir-group" key={g.heading}>
                    <h3 className="dir-head">{g.heading}</h3>
                    <ul className="dir-list">
                      {g.links.map((l) => <li key={l.href}><Link to={l.href}>{l.label}</Link></li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="faq-section">
            <div className="sec-header">
              <div>
                <h2 className="sec-title">Frequently asked questions</h2>
                <div className="sec-sub">Straight answers, from the data above</div>
              </div>
            </div>
            {r.faq.map((f) => (
              <div className="faq-item" key={f.q}>
                <h3 className="faq-q">{f.q}</h3>
                <div className="faq-a">{f.a}</div>
              </div>
            ))}
          </div>

          <div className="takeaway-section">
            <div className="sec-header">
              <div className="sec-num" style={{ background: "#6d28d9" }}>→</div>
              <div>
                <h2 className="sec-title" style={{ color: "#3b0764" }}>What this means for you</h2>
                <div className="sec-sub" style={{ color: "#7c3aed" }}>{r.takeaway.sub}</div>
              </div>
            </div>
            <div className="blist">
              {r.takeaway.items.map(([title, detail]) => (
                <div className="blist-item" key={title}>
                  <div className="blist-dot" style={{ background: "#6d28d9" }} />
                  <span style={{ color: "#3b0764" }}><strong>{title}.</strong> {detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="related">
            <h2>Related reports</h2>
            <div className="related-grid">
              {r.related.map((x) => (
                <Link to={`/reports/${x.slug}`} className="related-card" key={x.slug}>
                  <div className="rc-kicker">{x.kicker}</div>
                  <div className="rc-title">{x.title}</div>
                </Link>
              ))}
            </div>
          </div>

          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

const reportCSS = `
  .rpt-hero { background: #171717; padding: 64px 0 52px; border-bottom: 3px solid #171717; position: relative; overflow: hidden; }
  .rpt-hero::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: #8B5CF6; }
  .rpt-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
  .rpt-badge { display: inline-block; background: #8B5CF6; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 14px; border-radius: 999px; margin-bottom: 24px; }
  .rpt-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .rpt-breadcrumb-link { color: #8B5CF6; text-decoration: none; font-weight: 600; }
  .rpt-breadcrumb-sep { color: #525252; }
  .rpt-breadcrumb span:last-child { color: #737373; }
  .rpt-hero h1 { font-size: 48px; font-weight: 700; color: #f8f6f1; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 18px; }
  .rpt-hero h1 em { color: #8B5CF6; font-style: normal; }
  .rpt-hero-sub { font-size: 17px; color: #737373; font-weight: 500; line-height: 1.65; max-width: 600px; margin-bottom: 36px; }
  .rpt-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .rpt-meta-item { display: flex; flex-direction: column; gap: 3px; }
  .rpt-meta-label { font-size: 10px; font-weight: 700; color: #525252; text-transform: uppercase; letter-spacing: 1.5px; }
  .rpt-meta-value { font-size: 14px; font-weight: 600; color: #a3a3a3; }

  .rpt-body { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }

  .keyfindings { background: #faf5fe; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #8B5CF6; padding: 32px 40px; }
  @media (max-width: 640px) { .keyfindings { padding: 24px 20px; } }
  .keyfindings h2 { font-size: 13px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; }
  .kf-list { display: flex; flex-direction: column; gap: 12px; }
  .kf-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: #3b0764; line-height: 1.6; font-weight: 500; }
  .kf-check { width: 20px; height: 20px; border-radius: 6px; background: #8B5CF6; color: #fff; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .kf-item strong { color: #6d28d9; }

  .stat-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 640px) { .stat-bar { grid-template-columns: 1fr; } .rpt-hero h1 { font-size: 32px; } }
  .stat-card { background: #fff; border: 2px solid #171717; border-radius: 16px; box-shadow: 4px 4px 0 #171717; padding: 24px 26px; }
  .stat-card .sc-num { font-size: 42px; font-weight: 700; color: #8B5CF6; letter-spacing: -2px; line-height: 1; margin-bottom: 6px; }
  .stat-card .sc-label { font-size: 13px; font-weight: 600; color: #171717; line-height: 1.4; margin-bottom: 6px; }
  .stat-card .sc-source { font-size: 10px; font-weight: 500; color: #a3a3a3; letter-spacing: 0.5px; }

  .rpt-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .rpt-section { padding: 28px 20px; } }
  .sec-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
  .sec-num { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #8B5CF6; color: #fff; font-size: 13px; font-weight: 700; border-radius: 50%; border: 2px solid #171717; flex-shrink: 0; }
  .sec-title { font-size: 24px; font-weight: 700; color: #171717; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 4px; }
  .sec-sub { font-size: 13px; color: #737373; font-weight: 500; }
  .rpt-section p { font-size: 15px; color: #404040; line-height: 1.75; margin-bottom: 14px; }
  .rpt-section p:last-child { margin-bottom: 0; }
  .rpt-section p.rpt-note { font-size: 12px; color: #737373; line-height: 1.6; }

  .highlight { background: #faf5fe; border: 1.5px solid #c4b5fd; border-radius: 12px; padding: 18px 22px; margin: 18px 0 0; font-size: 13px; font-weight: 500; color: #5b21b6; line-height: 1.6; overflow-wrap: anywhere; }
  .highlight strong { color: #6d28d9; }
  .callout { background: #171717; border-radius: 12px; padding: 20px 24px; margin: 20px 0 0; font-size: 14px; color: #d4d4d4; line-height: 1.65; font-weight: 500; }
  .callout strong { color: #8B5CF6; }

  .blist { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .blist-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: #404040; line-height: 1.6; }
  .blist-dot { width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; flex-shrink: 0; margin-top: 7px; }

  .chart-wrap { margin: 24px 0; }
  .chart-label { font-size: 12px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }

  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0 8px; font-size: 13px; border-radius: 12px; overflow: hidden; border: 1.5px solid #e5e5e5; }
  .data-table th { background: #171717; color: #f8f6f1; font-weight: 700; padding: 11px 16px; text-align: left; letter-spacing: 0.5px; }
  .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #404040; vertical-align: top; line-height: 1.55; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #fafafa; }
  @media (max-width: 640px) { .data-table { display: block; overflow-x: auto; } }

  .faq-section { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 40px 48px; }
  @media (max-width: 640px) { .faq-section { padding: 28px 20px; } }
  .faq-item { border-bottom: 1px solid #f0f0f0; padding: 18px 0; }
  .faq-item:first-of-type { padding-top: 0; }
  .faq-item:last-child { border-bottom: none; padding-bottom: 0; }
  .faq-q { font-size: 16px; font-weight: 700; color: #171717; line-height: 1.4; margin-bottom: 8px; }
  .faq-a { font-size: 14px; color: #404040; line-height: 1.7; }

  .related { background: #fff; border: 2px solid #171717; border-radius: 20px; box-shadow: 4px 4px 0 #171717; padding: 32px 40px; }
  @media (max-width: 640px) { .related { padding: 24px 20px; } }
  .related h2 { font-size: 13px; font-weight: 700; color: #737373; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
  .related-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .related-grid { grid-template-columns: 1fr; } }
  .related-card { display: block; border: 1.5px solid #e5e5e5; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s; }
  .related-card:hover { border-color: #8B5CF6; }
  .related-card .rc-kicker { font-size: 10px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .related-card .rc-title { font-size: 14px; font-weight: 600; color: #171717; line-height: 1.4; }

  .dir-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; }
  @media (max-width: 640px) { .dir-grid { grid-template-columns: 1fr; } }
  .dir-head { font-size: 13px; font-weight: 700; color: #6d28d9; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .dir-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .dir-list a { font-size: 14px; color: #171717; text-decoration: underline; text-decoration-color: #c4b5fd; text-underline-offset: 3px; line-height: 1.5; }
  .dir-list a:hover { text-decoration-color: #8B5CF6; }

  .takeaway-section { background: #faf5fe; border: 2px solid #c4b5fd; border-radius: 20px; box-shadow: 4px 4px 0 #c4b5fd; padding: 40px 48px; }
  @media (max-width: 640px) { .takeaway-section { padding: 28px 20px; } }
`;
