import { Link } from "react-router";
import { FiBriefcase, FiMessageCircle, FiFileText } from "react-icons/fi";
import { IoBriefcaseOutline } from "react-icons/io5";

type FreeTool = {
  id: string;
  title: string;
  description: string;
  checklist: string[];
  bg: string;
  iconBg: string;
  textColor: string;
  ctaColor: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
};

const FREE_TOOLS: FreeTool[] = [
  {
    id: "internships",
    title: "Internship Dojo",
    description: "Verified internships and entry-level jobs from our hiring partners. No portals.",
    checklist: ["Live listings updated daily", "Channel partner roles", "Direct apply links"],
    bg: "bg-emerald-500",
    iconBg: "bg-emerald-600",
    textColor: "text-white",
    ctaColor: "text-emerald-600",
    cta: "Browse openings",
    href: "/dojos/internships",
    icon: <IoBriefcaseOutline />,
  },
  {
    id: "resumes",
    title: "Resume Maker",
    description: "ATS-optimised resume in minutes. Professional design, free forever.",
    checklist: ["ATS optimised templates", "AI-assisted writing", "Download as PDF"],
    bg: "bg-sky-500",
    iconBg: "bg-sky-600",
    textColor: "text-white",
    ctaColor: "text-sky-600",
    cta: "Build my resume",
    href: "/resume-maker",
    icon: <FiFileText />,
  },
  {
    id: "career-coach",
    title: "Career Coach",
    description: "Personal AI coach. Roadmap, skill gaps, and target companies for your goals.",
    checklist: ["Personalised career roadmap", "Skill gap analysis", "Target company matches"],
    bg: "bg-violet-500",
    iconBg: "bg-violet-600",
    textColor: "text-white",
    ctaColor: "text-violet-600",
    cta: "Talk to my coach",
    href: "/cc",
    icon: <FiMessageCircle />,
  },
  {
    id: "reports",
    title: "Reports",
    description: "Data-driven salary benchmarks, hiring trends, and market analyses.",
    checklist: ["Salary benchmarks 2026", "Hiring trends by city", "Free to download"],
    bg: "bg-amber-500",
    iconBg: "bg-amber-600",
    textColor: "text-white",
    ctaColor: "text-amber-600",
    cta: "Read reports",
    href: "/reports",
    icon: <FiBriefcase />,
  },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0 text-white/80" aria-hidden>
      <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FreeToolsSection() {
  return (
    <section id="free-tools" className="scroll-mt-24 border-b-2 border-neutral-900 bg-white px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[var(--section-max-width)]">

        <div className="mb-10 text-center">
          <p className="inline-block rounded-full border-2 border-neutral-900 bg-emerald-100 px-4 py-1.5 font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-emerald-700 shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] mb-4">
            Free forever
          </p>
          <h2 className="font-['Clash_Display'] text-3xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
            Free tools,{" "}
            <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-emerald-300 px-3 py-1 font-['Satoshi'] text-xl font-medium text-neutral-900 md:text-3xl">
              no catch
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-['Satoshi'] text-base text-neutral-500 md:text-lg">
            While you're waiting for replies, use these to get ahead.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FREE_TOOLS.map((tool) => (
            <article
              key={tool.id}
              className={`relative flex flex-col rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] overflow-hidden ${tool.bg}`}
            >
              {/* Top accent bar */}
              <div className={`h-1 w-full ${tool.iconBg}`} />

              <div className="flex flex-col gap-4 p-5 flex-1">
                {/* Icon */}
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/30 ${tool.iconBg}`}>
                  <span className="text-xl text-white">{tool.icon}</span>
                </div>

                {/* Title + description */}
                <div>
                  <h3 className="font-['Clash_Display'] text-xl font-semibold text-white leading-tight">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 font-['Satoshi'] text-sm text-white/80 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Checklist */}
                <ul className="flex flex-col gap-1.5 mt-auto">
                  {tool.checklist.map((item) => (
                    <li key={item} className="flex items-center gap-2 font-['Satoshi'] text-xs text-white/90">
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <Link
                  to={tool.href}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-neutral-900 bg-white py-2.5 font-['Satoshi'] text-sm font-bold shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${tool.ctaColor}`}
                >
                  {tool.cta} →
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
