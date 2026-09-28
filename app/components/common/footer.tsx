import type { ReactNode } from "react";
import { Link } from "react-router";
import { FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";

type FooterLink = {
  to: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
};

const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol?mode=gi_t";

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Company",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/blog", label: "Blog" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { to: "/outreach", label: "Outreach" },
      { to: "/cc", label: "Career Coach" },
      { to: "/dojos/internships", label: "Internship Dojo" },
      { to: "/resume-maker", label: "Resume Maker" },
      { to: "/reports", label: "Reports" },
    ],
  },
  {
    // B2B: Sensei, our hiring-intelligence product for companies.
    heading: "For Business",
    links: [
      { to: "https://sensei.studojo.com/", label: "Sensei", external: true },
      { to: "https://sensei.studojo.com/#how", label: "How it works", external: true },
      { to: "https://sensei.studojo.com/#book", label: "Book a demo", external: true },
      { to: "https://app.studojo.com", label: "Sign in", external: true },
    ],
  },
  {
    heading: "Community",
    links: [
      { to: "https://www.linkedin.com/company/studojo/", label: "LinkedIn", icon: <FaLinkedin />, external: true },
      { to: "https://instagram.com/studojo", label: "Instagram", icon: <FaInstagram />, external: true },
      { to: WHATSAPP_COMMUNITY, label: "WhatsApp", icon: <FaWhatsapp />, external: true },
      { to: "/campus-ambassador", label: "Campus Ambassador", icon: <FiUsers /> },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
      { to: "/refund-policy", label: "Refund Policy" },
    ],
  },
];

const LINK_CLASS =
  "inline-flex min-h-11 items-center gap-2 font-['Satoshi'] text-sm leading-5 text-neutral-900 hover:text-violet-600 md:min-h-0 md:text-base md:leading-6";

function FooterItem({ to, label, icon, external }: FooterLink) {
  const content = (
    <>
      {icon && <span className="text-lg text-neutral-700" aria-hidden>{icon}</span>}
      <span>{label}</span>
    </>
  );
  return external ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {content}
    </a>
  ) : (
    <Link to={to} className={LINK_CLASS}>
      {content}
    </Link>
  );
}

export function Footer() {
  return (
    <footer
      id="resources"
      className="relative scroll-mt-24 overflow-hidden border-t border-neutral-900 bg-white"
    >
      <div className="relative mx-auto max-w-[var(--section-max-width)] px-4 pt-10 md:px-8 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.6fr_repeat(5,minmax(0,1fr))] md:gap-x-8">
          {/* Brand */}
          <div className="col-span-2 flex flex-col justify-between gap-6 md:col-span-1">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="font-['Satoshi'] text-3xl font-black leading-9 tracking-tight text-neutral-900"
              >
                studojo
              </Link>
              <p className="font-['Satoshi'] text-sm leading-5 text-neutral-600 md:text-base md:leading-6">
                We find people who can hire you, and get you replies.
              </p>
              <p className="font-['Satoshi'] text-sm leading-5 text-neutral-600 md:text-base md:leading-6">
                admin@studojo.com · Bangalore, India
              </p>
            </div>
            <p className="hidden font-['Satoshi'] text-sm leading-5 text-neutral-500 md:block">
              © {new Date().getFullYear()} Studojo Labs Private Limited. Crafted with ❤️ by students.
            </p>
          </div>

          {COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="font-['Satoshi'] text-xs font-bold uppercase tracking-wider text-neutral-900 md:text-sm">
                {heading}
              </h3>
              <ul className="mt-3 flex flex-col md:mt-5 md:gap-4" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* On desktop the copyright sits in the brand column. */}
        <p className="mt-10 border-t border-neutral-200 py-6 text-center font-['Satoshi'] text-xs leading-4 text-neutral-500 md:hidden">
          © {new Date().getFullYear()} Studojo Labs Private Limited. Crafted with ❤️ by students.
        </p>
        <div className="hidden md:block md:h-16" />
      </div>

      {/* Massive studojo text at bottom */}
      <div className="relative flex w-full items-center justify-center overflow-hidden px-2 pb-4 pt-4 md:px-0 md:pb-8 md:pt-8">
        <span
          className="pointer-events-none select-none whitespace-nowrap font-['Clash_Display'] font-semibold leading-[0.6] tracking-tight text-purple-50 text-[clamp(72px,22vw,180px)] md:text-[min(356px,40vw)]"
          aria-hidden
        >
          studojo
        </span>
      </div>
    </footer>
  );
}
