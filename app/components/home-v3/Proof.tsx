import type { CSSProperties } from "react";
import { companyLogoUrl, faviconUrl } from "~/lib/company-logo";

// HOMEPAGE V3: proof (#proof). 28 Oct 2026, the owner: not sign-ups ("why will I join just because 8,500 others signed
// up? pretty mid") and no footnotes under the numbers; "we have data across these many jobs, these many job boards,
// and hiring manager information from these many companies". The three counts were read from our own databases on
// 27 Oct 2026 (read-only, test and staff accounts left out; the queries are kept in
// ~/Documents/Internreach-ai/homepage_v3/round2/metrics_queries), each rounded down:
// - 1,856,712 distinct job postings across Stu's job index, Sensei and Mesa, one posting per job id or cleaned link;
// - 7,748 job boards and company career sites read in the 24 hours before (Stu re-reads each at least every 12 hours);
// - 8,384 companies (by email domain) where we hold a named founder, manager, head, director, VP, recruiter or HR
//   contact with a found work email (Outreach Dojo and Sensei, production).
// Stu's job index and its readers run on staging (studojo.pro), where this page runs; if this page reaches studojo.com
// before Stu does, the first two must be read again from production.
// Motion: the three counts float in and count up from 0 (the page's own text is what the server renders); the
// companies run past in two rows going opposite ways, and stop under the pointer (a still, wrapped list with reduced
// motion; the second copy of each row is hidden from assistive tech). The company strip is as published on
// studojo.com/outreach. No quotes or testimonials of any kind.
// 1 Nov 2026, the founder: the label says "connected with", and each company shows its logo before its name, from
// Context.dev's free Logo Link CDN (app/lib/company-logo.ts, as the Sensei table does; Google's favicon when the client
// id is not set or a logo fails, and no logo at all if that fails too). The logos are decoration (alt=""): the name
// stays the label.

// Each company with its own primary domain (for its logo).
const COMPANIES: [name: string, domain: string][] = [
  ["Google", "google.com"], ["McKinsey", "mckinsey.com"], ["BCG", "bcg.com"], ["Amazon", "amazon.com"],
  ["Razorpay", "razorpay.com"], ["Deloitte", "deloitte.com"], ["Microsoft", "microsoft.com"], ["CRED", "cred.club"],
  ["Bain & Co.", "bain.com"], ["Revolut", "revolut.com"], ["Zepto", "zeptonow.com"], ["Spotify", "spotify.com"],
  ["Groww", "groww.in"], ["PwC", "pwc.com"], ["Swiggy", "swiggy.com"], ["Airbnb", "airbnb.com"],
  ["Morgan Stanley", "morganstanley.com"], ["Freshworks", "freshworks.com"], ["EY", "ey.com"], ["Zomato", "zomato.com"],
  ["InMobi", "inmobi.com"],
];
const ROWS = [COMPANIES.slice(0, 11), COMPANIES.slice(11)];
// For these two, Logo Link's pick for a light surface is their wide wordmark (a sliver in a 22px square), so they take
// its default square icon (checked 1 Nov 2026).
const SQUARE_ICON = new Set(["bcg.com", "ey.com"]);
const d = (ms: number) => ({ "--hv3-d": `${ms}ms` }) as CSSProperties;

// A logo that fails gives way to Google's favicon, and if that fails too the chip keeps just its name. `failed` is the
// address that failed, so a late second report about it changes nothing.
function logoFailed(img: HTMLImageElement, domain: string, failed: string) {
  if (img.getAttribute("src") !== failed) return;
  const next = faviconUrl(domain);
  if (failed !== next) img.src = next;
  else img.style.display = "none";
}

function Company({ name, domain }: { name: string; domain: string }) {
  const src = companyLogoUrl(domain, SQUARE_ICON.has(domain) ? null : "light");
  return (
    <li>
      <img
        src={src}
        alt=""
        width={22}
        height={22}
        loading="lazy"
        decoding="async"
        onError={(e) => logoFailed(e.currentTarget, domain, src)}
        // React only hears an image's error once the page is live, so one that already failed is caught here
        ref={(img) => {
          if (img?.complete) img.decode().catch(() => logoFailed(img, domain, src));
        }}
      />
      {name}
    </li>
  );
}

export function Proof() {
  return (
    <section className="hv-sec hv3-sec" id="proof" aria-labelledby="proof-h">
      <div className="hv3-in">
        <header className="hv3-head" data-reveal>
          <h2 className="hv3-h2" id="proof-h">We know where the jobs are, and who&apos;s hiring</h2>
        </header>
        <div className="hv3-stats">
          <div className="hv-card hv3-stat" data-reveal data-count style={d(0)}><b>1,800,000+</b><span>job postings in our data</span></div>
          <div className="hv-card hv3-stat" data-reveal data-count style={d(120)}><b>7,700+</b><span>job boards and company career sites checked every day</span></div>
          <div className="hv-card hv3-stat" data-reveal data-count style={d(240)}><b>8,300+</b><span>companies where we&apos;ve found hiring managers</span></div>
        </div>
        <div className="hv3-logos" data-reveal>
          <p className="hv3-logos-label">People using Studojo have connected with hiring managers at</p>
          {ROWS.map((row, i) => (
            <div className={`hv3-row${i ? " hv3-row-rev" : ""}`} key={i}>
              <ul>
                {row.map(([name, domain]) => (
                  <Company key={name} name={name} domain={domain} />
                ))}
              </ul>
              <ul aria-hidden="true">
                {row.map(([name, domain]) => (
                  <Company key={name} name={name} domain={domain} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
