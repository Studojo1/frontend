import { data } from "react-router";
import StudentPage from "~/components/student-page/page";
import { profileView } from "~/components/student-page/profile-view";
import { clean } from "~/lib/student-page-text";
import { findStudentPage, studentEmail, toProfile } from "~/lib/student-page.server";
import type { Route } from "./+types/profile_.$slug";

/**
 * /profile/:slug: a student's public page, as they approved it in Studojo's
 * onboarding flow (/flow, Studojo1/outreach-flow, which saves it into
 * user_profile.talent), drawn as a typeset CV (app/components/student-page).
 * Every claim keeps its resume lines, shown on tap. Who can open it is the student's choice: private
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
  // The same cleaned strings the page shows.
  const v = profileView(p);
  const url = `${d.origin}/profile/${p.slug}`;
  const role = clean(p.target.role);
  const start = clean(p.target.start);
  // A preview has no "Looking for" label around it, so the title says it is the ask: "Riya Menon, Business
  // Analyst Intern" reads as a job she already holds; "Riya Menon, looking for Business Analyst Intern roles" does not.
  const roles = /\b(roles?|positions?|jobs?|internships?|opportunities)$/i.test(role) ? role : `${role} roles`;
  const dated = /\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(start);
  const when = start ? (dated ? ` from ${start}` : `, ${start.charAt(0).toLowerCase()}${start.slice(1)}`) : "";
  const title = role ? `${v.name}, looking for ${roles}${when}` : `${v.name} | Studojo`;
  const who = [[v.degree, v.college].filter(Boolean).join(", "), v.classOf && `Class of ${v.classOf}`].filter(Boolean).join(", ");
  const description = ([who && `${who}.`, v.proof && `${v.proof.matched} of ${v.proof.total} claims matched to ${v.poss} resume.`].filter(Boolean).join(" ") || v.headline || `${v.name}\u2019s page on Studojo.`).slice(0, 300);
  // The student's photo when they chose to show it, else the site's card.
  const image = d.hasPhoto ? `${url}/photo` : `${d.origin}/og-default.png`;
  return [
    { title: `${v.name} | Studojo` },
    { name: "description", content: description },
    { property: "og:type", content: "profile" },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: d.hasPhoto ? `Photo of ${v.name}` : "Studojo" },
    { property: "profile:first_name", content: v.first },
    { name: "twitter:card", content: d.hasPhoto ? "summary" : "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    ...(d.search
      ? [
          { tagName: "link", rel: "canonical", href: url },
          {
            "script:ld+json": {
              "@context": "https://schema.org",
              "@type": "Person",
              name: v.name,
              url,
              ...(role ? { jobTitle: role } : {}),
              ...(v.headline ? { description: v.headline } : {}),
              ...(v.college ? { alumniOf: { "@type": "CollegeOrUniversity", name: v.college } } : {}),
              ...(clean(p.city) ? { homeLocation: { "@type": "Place", name: clean(p.city) } } : {}),
              ...(v.skills.length ? { knowsAbout: v.skills.flatMap((g) => g.names) } : {}),
              ...(d.hasPhoto ? { image } : {}),
            },
          },
        ]
      : [{ name: "robots", content: "noindex, nofollow" }]),
  ];
}

export default function Page({ loaderData: d }: Route.ComponentProps) {
  return <StudentPage p={d.profile} />;
}
