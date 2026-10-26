import { Link } from "react-router";
import { authClient } from "~/lib/auth-client";
import { BLOG, CONTACT_EMAIL, PRIVACY, REFUNDS, REPORTS, SECTION_HOW, SIGN_IN, stuHref, TERMS } from "./links";
import { Logo } from "./Logo";

// The footer on B2C hosts (studojo.pro): used by the B2C homepage and, through components/common/footer.tsx,
// by every other page there. No old products (outreach, dojos, resume maker, career coach).
// Placeholder look: columns and links are final, the visual design lands after the owner's pick.

type Item = { label: string; to: string; kind: "route" | "page" | "mail" };

const LINK = "inline-flex min-h-11 items-center font-satoshi text-sm text-studojo-muted hover:text-studojo-purple-strong md:min-h-0 md:text-base";

function FooterLink({ label, to, kind }: Item) {
  // "page": another app or an in-page anchor, a full page load (links.ts); "route": this site's router.
  if (kind === "route") {
    return (
      <Link to={to} className={LINK}>
        {label}
      </Link>
    );
  }
  return (
    <a href={to} className={LINK}>
      {label}
    </a>
  );
}

export function FooterB2C() {
  const { data: session } = authClient.useSession();
  const columns: { heading: string; items: Item[] }[] = [
    {
      heading: "Product",
      items: [
        { label: "How it works", to: `/#${SECTION_HOW}`, kind: "page" },
        { label: "Talk to Stu", to: stuHref(!!session), kind: "page" },
        ...(session ? [] : [{ label: "Sign in", to: SIGN_IN, kind: "route" as const }]),
      ],
    },
    {
      heading: "Resources",
      items: [
        { label: "Blog", to: BLOG, kind: "route" },
        { label: "Reports", to: REPORTS, kind: "route" },
      ],
    },
    {
      heading: "Company",
      items: [{ label: "Contact", to: `mailto:${CONTACT_EMAIL}`, kind: "mail" }],
    },
    {
      heading: "Legal",
      items: [
        { label: "Terms", to: TERMS, kind: "route" },
        { label: "Privacy", to: PRIVACY, kind: "route" },
        { label: "Refunds", to: REFUNDS, kind: "route" },
      ],
    },
  ];

  return (
    <footer className="border-t border-lilac-line bg-lilac-50">
      <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))] md:gap-x-8">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Logo />
            <p className="font-satoshi text-sm text-studojo-muted md:text-base">Find jobs with Studojo.</p>
            <p className="font-satoshi text-sm text-studojo-muted md:text-base">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-studojo-purple-strong">
                {CONTACT_EMAIL}
              </a>
              {" · Bangalore, India"}
            </p>
          </div>
          {columns.map(({ heading, items }) => (
            <div key={heading}>
              <h3 className="font-satoshi text-xs font-bold uppercase tracking-wider text-studojo-ink md:text-sm">{heading}</h3>
              <ul className="mt-3 flex flex-col md:mt-4 md:gap-3" role="list">
                {items.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-lilac-line pt-6 font-satoshi text-xs text-studojo-muted md:text-sm">
          © {new Date().getFullYear()} Studojo Labs Private Limited
        </p>
      </div>
    </footer>
  );
}
