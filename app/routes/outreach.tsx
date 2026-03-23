import { Link, useNavigate } from "react-router";
import { FiUpload, FiSearch, FiMail, FiArrowRight, FiClipboard } from "react-icons/fi";
import { Header } from "~/components/common/header";
import { Footer } from "~/components/common/footer";

const FEATURES = [
  { icon: <FiUpload className="w-6 h-6" />, title: "Upload Your Resume", desc: "Our AI analyzes your background and career goals in under a minute." },
  { icon: <FiSearch className="w-6 h-6" />, title: "Discover Decision Makers", desc: "We find hiring managers at companies that match your profile." },
  { icon: <FiMail className="w-6 h-6" />, title: "Launch Outreach", desc: "Send personalized emails at scale with intelligent scheduling." },
];

export default function OutreachLanding() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white">
      <Header />

      {/* Hero */}
      <section className="border-b border-studojo-ink bg-gradient-to-br from-violet-700 via-purple-700 to-violet-800">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 pt-8 pb-8 md:px-8 md:py-20">
          <div className="flex flex-col gap-6 text-center md:gap-8 md:text-left">
            <h1 className="max-w-3xl font-clash text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Find Hiring Managers for Your Dream Job
            </h1>
            <p className="max-w-xl font-satoshi text-sm font-normal leading-6 text-white/90 md:text-base md:leading-7">
              OpportunityApply uses AI to discover decision makers, enrich contacts, and launch personalized outreach campaigns — all from your resume.
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
              <button
                onClick={() => navigate("/outreach/onboarding/upload")}
                className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                Get Started <FiArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate("/outreach/orders")}
                className="inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-transparent text-white font-satoshi font-medium text-base border-2 border-white/40 transition-all hover:bg-white/10"
              >
                <FiClipboard className="w-5 h-5 mr-2" /> View Campaigns
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-studojo-ink bg-white">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 pt-8 pb-8 md:px-8 md:pt-24 md:pb-16">
          <h2 className="font-clash text-3xl font-bold text-center mb-12 text-studojo-ink">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-8 text-center transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <div className="w-14 h-14 rounded-xl bg-purple-100 border-2 border-studojo-ink flex items-center justify-center mx-auto text-studojo-purple mb-6">
                  {f.icon}
                </div>
                <h3 className="font-clash text-xl font-bold mb-2 text-studojo-ink">{f.title}</h3>
                <p className="text-sm text-studojo-muted font-satoshi">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-studojo-ink bg-gradient-to-br from-purple-100 via-violet-100 to-purple-50">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 pt-8 pb-8 md:px-8 md:py-24 text-center">
          <h2 className="font-clash text-3xl font-bold mb-4 text-studojo-ink">Ready to find your next opportunity?</h2>
          <p className="text-lg text-studojo-muted mb-10 font-satoshi">
            Upload your resume and let AI do the outreach.
          </p>
          <button
            onClick={() => navigate("/outreach/onboarding/upload")}
            className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-studojo-purple text-white font-satoshi font-medium text-base border-2 border-studojo-ink shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Start Now <FiArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}