import { data } from "react-router";
import ProfileBody from "~/components/student-page/body";
import PassHero from "~/components/student-page/hero-pass";
import { ReducedMotionProvider, useSafeReducedMotion } from "~/components/student-page/motion";
import { findStudentPage, studentEmail, toProfile } from "~/lib/student-page.server";
import type { Route } from "./+types/profile_.$slug";

/**
 * /profile/:slug: a student's public page, as they approved it in Studojo's
 * onboarding flow (/flow, Studojo1/outreach-flow, which saves it into
 * user_profile.talent), drawn as the boarding pass. Every claim keeps its
 * resume line, shown on tap. Who can open it is the student's choice: private
 * pages are a 404, and search engines are told to stay out unless the student
 * switched search on. Their email is only on the page when they allow contact.
 * Not nested under /profile (the signed-in account page): the trailing _.
 */

/** The public address: studojo.pro on staging, studojo.com everywhere else. Host, not x-forwarded-host, which a client can set. */
const originOf = (request: Request) => ((request.headers.get("host") ?? "").split(":")[0].toLowerCase() === "studojo.pro" ? "https://studojo.pro" : "https://studojo.com");

export async function loader({ params, request }: Route.LoaderArgs) {
  const slug = (params.slug ?? "").toLowerCase();
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw data("Not found", { status: 404 });
  const found = await findStudentPage(slug);
  if (!found || !found.page.visibility?.link) throw data("Not found", { status: 404 });
  // The address is only read (and only sent to the browser) when the student allows contact.
  const email = found.page.visibility.contact === true ? await studentEmail(found.userId) : null;
  const origin = originOf(request);
  const profile = toProfile(found.row, { origin, email });
  return { profile, search: !!found.page.visibility.search, origin, hasPhoto: !!profile.photo };
}

export function meta({ data: d }: Route.MetaArgs) {
  if (!d) return [{ title: "Page not found | Studojo" }, { name: "robots", content: "noindex, nofollow" }];
  const p = d.profile;
  const url = `${d.origin}/profile/${p.slug}`;
  const title = `${p.name} | Studojo`;
  const description =
    [p.headline && (/[.!?]$/.test(p.headline) ? p.headline : `${p.headline}.`), p.target.role ? `Looking for: ${p.target.role}${p.target.start ? `, from ${p.target.start}` : ""}.` : "", [p.degree, p.college].filter(Boolean).join(", ")]
      .filter(Boolean)
      .join(" ")
      .slice(0, 300) || `${p.name}'s page on Studojo.`;
  const image = d.hasPhoto ? `${url}/photo` : null;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "profile" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Studojo" },
    { property: "profile:first_name", content: p.first },
    ...(image ? [{ property: "og:image", content: image }, { name: "twitter:card", content: "summary" }] : [{ name: "twitter:card", content: "summary" }]),
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(d.search
      ? [
          { tagName: "link", rel: "canonical", href: url },
          {
            "script:ld+json": {
              "@context": "https://schema.org",
              "@type": "Person",
              name: p.name,
              url,
              ...(p.target.role ? { jobTitle: p.target.role } : {}),
              ...(p.headline ? { description: p.headline } : {}),
              ...(p.college ? { alumniOf: { "@type": "CollegeOrUniversity", name: p.college } } : {}),
              ...(p.city ? { homeLocation: { "@type": "Place", name: p.city } } : {}),
              ...(p.skills.length ? { knowsAbout: p.skills.map((s) => s.name) } : {}),
              ...(image ? { image } : {}),
            },
          },
        ]
      : [{ name: "robots", content: "noindex, nofollow" }]),
  ];
}

export default function StudentPage({ loaderData: d }: Route.ComponentProps) {
  return (
    <ReducedMotionProvider>
      <Page profile={d.profile} />
    </ReducedMotionProvider>
  );
}

function Page({ profile }: { profile: Route.ComponentProps["loaderData"]["profile"] }) {
  const reduced = useSafeReducedMotion();
  return (
    <main className="min-h-screen bg-[#faf8fd]">
      <ProfileBody p={profile} reduced={reduced} Hero={PassHero} />
    </main>
  );
}
