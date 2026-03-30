import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import { Link } from "react-router";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About – Studojo" },
    {
      name: "description",
      content: "Built for students who want to work on things that matter. Learn about Studojo, our products, and who we serve.",
    },
  ];
}

export default function About() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-900 bg-purple-50 py-16 md:py-24">
          <Section width="narrow" className="text-center">
            <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-neutral-900 md:text-5xl">
              Built for students who want to work on things that matter.
            </h1>
            <p className="mt-6 font-['Satoshi'] text-lg font-normal leading-7 text-neutral-700 md:text-xl">
              Studojo is a global student career platform. We build tools that cut through the noise so ambitious students can spend their time on work that genuinely moves the needle.
            </p>
          </Section>
        </section>

        <Section width="narrow" className="py-12 md:py-16">
          <div className="space-y-8">

            {/* Our Story */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                Our Story
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo was founded in Bengaluru, India with a simple observation: most career tools are built for employers, not students. The platforms that existed were designed to help companies filter applicants, not to help students stand out.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Students were spending hours on job boards and finding nothing. Writing generic cover letters nobody read. Applying into silence and never hearing back. The tools available were either built for recruiters or built to extract money from students in exchange for marginal improvements.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo was built to flip that. Give students research-grade tools, AI that actually understands their context, and outreach infrastructure previously only available to paid recruiters. No tutorials. No unnecessary friction. Just tools that work.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo is operated by Synovate People Solutions Private Limited, registered in Bengaluru, Karnataka, India.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                What We've Built
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 text-center md:p-5">
                  <p className="font-['Clash_Display'] text-3xl font-medium text-violet-600 md:text-4xl">10,000+</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700 md:text-base">students helped globally</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 text-center md:p-5">
                  <p className="font-['Clash_Display'] text-3xl font-medium text-violet-600 md:text-4xl">5,000+</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700 md:text-base">resumes built</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 text-center md:p-5">
                  <p className="font-['Clash_Display'] text-3xl font-medium text-violet-600 md:text-4xl">95%</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700 md:text-base">satisfaction rate</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 text-center md:p-5">
                  <p className="font-['Clash_Display'] text-3xl font-medium text-violet-600 md:text-4xl">24/7</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700 md:text-base">availability</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-gray-200 bg-purple-50 p-4 text-center md:col-span-2 md:p-5">
                  <p className="font-['Clash_Display'] text-3xl font-medium text-violet-600 md:text-4xl">5 markets</p>
                  <p className="mt-1 font-['Satoshi'] text-sm text-neutral-700 md:text-base">India, US, UK, UAE, and Singapore</p>
                </div>
              </div>
            </div>

            {/* The Dojos */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                The Dojos
              </h2>
              <p className="mb-4 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                Each Dojo is a focused tool for one job. No bloat.
              </p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Assignment Dojo</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    AI-powered assignment help. Plagiarism-safe, formatted, properly referenced. Built for students who need something done right, not just done.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Internship Dojo</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Global internship discovery, ATS resume builder, AI-powered outreach to hiring managers and founders, application tracking. The full pipeline from "I need an internship" to "I got the interview."
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Careers Dojo</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    ATS-optimized resume builder. Professional-grade, 100% free. No paywalls on the thing every student needs most.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Revision Dojo <span className="ml-2 inline-block rounded-full bg-neutral-900 px-2 py-0.5 font-['Satoshi'] text-xs text-white">Coming soon</span></p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Custom study notes, practice questions, flashcards, and mind maps. Everything you need to actually retain what you learn.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Think */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                How We Think
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    No tutorials. No onboarding courses. Pick what you need, answer 2-3 questions, get something ready to use. That's the whole experience.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We build for the student who doesn't have time to waste. Every product decision runs through one filter: does this help a student work on something that actually matters?
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We have opinions about what's a good opportunity and what isn't. We don't just surface data — we editorialize. A role at a climate startup is different from a role at a bank. We'll tell you which one might teach you more.
                  </p>
                </div>
              </div>
            </div>

            {/* Who We Serve */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                Who We Serve
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Undergrad and postgrad students, 18-25, who are serious about building real careers. Not passive job seekers. Students who want to work on things that genuinely move the needle.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="mb-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">India</p>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      DU, IIMs, IITs, NITs, BITS, Symbiosis, Christ, Manipal, and a strong tier-2 and tier-3 college base.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="mb-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">United States</p>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      Large state schools and private universities. Students navigating a competitive internship market.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="mb-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">United Kingdom</p>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      Russell Group and post-92 universities. Students looking at structured programs and graduate schemes.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="mb-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Dubai and UAE</p>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      Expat and local university students. LinkedIn-heavy market with strong direct founder hiring.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="mb-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Singapore</p>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      NUS, NTU, and SMU students. Highly competitive, internationally focused, strong MNC and startup scene.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="mb-1 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">And beyond</p>
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      Wherever ambitious students are trying to build real careers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline Section */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                Our Tagline
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-6 text-center md:p-8">
                <p className="font-['Clash_Display'] text-3xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
                  Work on things that matter.
                </p>
              </div>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    This isn't motivational fluff. It's a filter.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    It means: is this role going to teach you something real? Will this experience make a difference to someone? Will you be proud of what you worked on?
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    That's the standard we hold our products to. We think students should hold their opportunities to it too.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-violet-500 p-6 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h3 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">
                Ready to work on things that matter?
              </h3>
              <p className="mb-6 font-['Satoshi'] text-base leading-7 text-white">
                10,000+ students already have.
              </p>
              <Link
                to="/"
                className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-6 font-['Satoshi'] text-base font-medium text-violet-600 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Explore Studojo
              </Link>
            </div>

          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
