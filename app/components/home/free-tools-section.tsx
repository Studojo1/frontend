import { Link } from "react-router";
import { FiBriefcase, FiMessageCircle, FiFileText } from "react-icons/fi";
import { IoBriefcaseOutline } from "react-icons/io5";

type FreeTool = {
  id: string;
  title: string;
  description: string;
  checklist: string[];
  accent: string;
  accentIcon: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

const FREE_TOOLS: FreeTool[] = [
  {
    id: "internships",
    title: "Internship Dojo",
    description: "Browse verified internships & entry-level jobs from our hiring partners. Apply directly, no portals.",
    checklist: ["Live internship & job listings", "Channel partner roles", "Direct apply links"],
    accent: "bg-emerald-500",
    accentIcon: "text-emerald-500",
    cta: "Browse openings",
    href: "/dojos/internships",
    icon: <IoBriefcaseOutline />,
    badge: "Free",
  },
  {
    id: "resumes",
    title: "Resume Maker",
    description: "Build an ATS-optimised resume in minutes. Professional design, free forever.",
    checklist: ["ATS optimised", "Professional design", "Download as PDF"],
    accent: "bg-sky-500",
    accentIcon: "text-sky-500",
    cta: "Build my resume",
    href: "/resume-maker",
    icon: <FiFileText />,
    badge: "Free",
  },
  {
    id: "career-coach",
    title: "Career Coach",
    description: "Chat with your personal AI career coach. Get a tailored roadmap, skill gaps, and target companies for your goals.",
    checklist: ["Personalised career roadmap", "Skill gap analysis", "Target company matches"],
    accent: "bg-violet-500",
    accentIcon: "text-violet-500",
    cta: "Talk to my coach",
    href: "/cc",
    icon: <FiMessageCircle />,
    badge: "Free",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Data-driven salary benchmarks, hiring trends, and market analyses for students.",
    checklist: ["Salary benchmarks 2026", "Hiring trends by city", "Free download"],
    accent: "bg-amber-500",
    accentIcon: "text-amber-500",
    cta: "Read reports",
    href: "/reports",
    icon: <FiBriefcase />,
    badge: "Free",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FreeToolsSection() {
  return (
    <section
      id="free-tools"
      className="scroll-mt-24 border-b-2 border-neutral-900 bg-white px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-12"
    >
      <div className="mx-auto max-w-[var(--section-max-width)]">
        <div className="mb-6 text-center md:mb-10">
          <h2 className="font-['Clash_Display'] text-3xl font-medium leading-8 text-neutral-900 md:text-4xl lg:text-5xl">
            Free tools,{" "}
            <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-emerald-300 px-3 py-1 font-['Satoshi'] text-xl font-medium leading-8 text-neutral-900 md:text-3xl">
              no catch
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-['Satoshi'] text-base font-normal leading-6 text-neutral-700 md:text-lg md:leading-7">
            While you're waiting for replies, use these to sharpen everything else.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FREE_TOOLS.map((tool) => (
            <article
              key={tool.id}
              className={`flex flex-col gap-3 rounded-2xl border-2 border-neutral-900 p-5 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] ${tool.accent}`}
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-900 bg-white" aria-hidden>
                  <span className={`text-lg ${tool.accentIcon}`}>{tool.icon}</span>
                </div>
                {tool.badge && (
                  <span className="inline-flex items-center rounded-full border border-white/40 bg-white/20 px-2.5 py-0.5 font-['Satoshi'] text-xs font-bold text-white">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="font-['Clash_Display'] text-lg font-medium leading-6 text-white">
                {tool.title}
              </h3>
              <p className="font-['Satoshi'] text-sm font-normal leading-5 text-white/90">
                {tool.description}
              </p>
              <ul className="flex flex-col gap-1.5" role="list">
                {tool.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 font-['Satoshi'] text-xs font-normal leading-5 text-white">
                    <CheckIcon className="h-3.5 w-3.5 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={tool.href}
                className={`mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-neutral-900 bg-white px-4 py-2 font-['Satoshi'] text-sm font-medium leading-5 transition-transform hover:translate-x-[2px] hover:translate-y-[2px] ${tool.accentIcon}`}
              >
                {tool.cta} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
