import { Instagram, WhatsApp } from "./icons";
import type { ReactNode } from "react";
import { Link } from "react-router";
import footCss from "./footer.css?url";
import { StartLink } from "./start";
import { StuArt } from "./StuArt";

// The homepage's own footer: the one closing start (HOMEPAGE V3; 28 Oct 2026, no call length: "Ready to find your next
// job?"), with Stu's head and the same start (StartLink: signed out it opens the call takeover, signed in it is "Open
// my jobs" to /b2cnew). The floating agent watches #hv-foot-btn and steps aside when it comes into view. Motion: the
// closing start floats in, Stu bounces, the button pulses twice.
// Under it (1 Nov 2026, the founder: "the bottom section, similar to what studojo.com has, made for the new product")
// the full footer, in studojo.com's structure (components/common/footer.tsx): the wordmark, one line about Stu, the
// contact, the link columns, the legal name, and the big faded wordmark at the very bottom. Only Stu's own pages: none
// of the old products. Its rules are in footer.css (.hv3-ft*), linked here, so nothing else on the site gets them.

type FootLink = { label: string; href: string; icon?: ReactNode };

// The same community links and icons as studojo.com's footer.
const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol?mode=gi_t";

const COLUMNS: { heading: string; links: FootLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Why reach the person", href: "#why" },
      { label: "Questions", href: "#faq" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Instagram", href: "https://instagram.com/studojo", icon: <Instagram size={18} /> },
      { label: "WhatsApp", href: WHATSAPP_COMMUNITY, icon: <WhatsApp size={18} /> },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

/** A section of this page (#how) is a plain anchor, another site a new tab, a page of ours the router. */
function FootItem({ label, href, icon }: FootLink) {
  const inner = (
    <>
      {icon ? (
        <span className="hv3-ft-ic" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </>
  );
  if (href.startsWith("#")) {
    return (
      <a className="hv3-ft-a" href={href}>
        {inner}
      </a>
    );
  }
  if (href.startsWith("http")) {
    return (
      <a className="hv3-ft-a" href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link className="hv3-ft-a" to={href}>
      {inner}
    </Link>
  );
}

export function HomeFooter() {
  return (
    <footer className="hv-foot hv3-foot" data-section="footer">
      <link rel="stylesheet" href={footCss} precedence="default" />
      <div className="hv-foot-cta hv3-foot-cta" data-reveal>
        <StuArt />
        <h2 className="hv3-h2">Ready to find your next job?</h2>
        <p className="hv3-lead">Tell Stu what you want. Stu takes it from there.</p>
        <StartLink place="footer" className="hv-btn-start" id="hv-foot-btn" />
      </div>
      <div className="hv3-ft">
        <div className="hv3-ft-in">
          <div className="hv3-ft-grid">
            <div className="hv3-ft-brand">
              <Link className="hv-brand" to="/" aria-label="studojo home">
                <img src="/stu/logo-doodle.png" width={24} height={30} alt="" />
                <b>studojo</b>
              </Link>
              <p className="hv3-ft-line">Stu finds jobs that fit you and reaches the person who&apos;s hiring.</p>
              <address className="hv3-ft-contact">
                <a href="mailto:admin@studojo.com">admin@studojo.com</a>
                <span aria-hidden="true">·</span>
                <span>Bangalore, India</span>
              </address>
            </div>
            <nav className="hv3-ft-nav" aria-label="Footer">
              {COLUMNS.map(({ heading, links }) => (
                <div className="hv3-ft-col" key={heading}>
                  <h2 className="hv3-ft-h">{heading}</h2>
                  <ul>
                    {links.map((link) => (
                      <li key={link.label}>
                        <FootItem {...link} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          {/* The year is the visitor's; around New Year the server's may differ, so no hydration warning for it. */}
          <p className="hv3-ft-copy" suppressHydrationWarning>
            {`© ${new Date().getFullYear()} Studojo Labs Private Limited`}
          </p>
        </div>
        <div className="hv3-ft-mark" aria-hidden="true">
          studojo
        </div>
      </div>
    </footer>
  );
}
