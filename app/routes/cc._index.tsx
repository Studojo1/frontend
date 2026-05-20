import { motion } from "framer-motion";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
export function meta() {
  return [
    { title: "CareerDojo | AI Career Coach" },
    {
      name: "description",
      content:
        "Get a personalised career roadmap, gap analysis, and outreach strategy — based on your actual profile.",
    },
  ];
}

const steps = [
  {
    num: "1",
    title: "Tell us where you are",
    desc: "The AI coach asks about your degree, skills, experience, and what you're aiming for — in a natural conversation.",
  },
  {
    num: "2",
    title: "Get your Career DNA",
    desc: "You receive a readiness score, gap analysis, and a ranked list of target companies based on your actual profile.",
  },
  {
    num: "3",
    title: "Execute your roadmap",
    desc: "A prioritised week-by-week plan closes your gaps and moves your reply rate from where it is to where it needs to be.",
  },
];

const features = [
  {
    title: "Readiness Score",
    desc: "Know exactly where you stand before you apply anywhere.",
  },
  {
    title: "Gap Analysis",
    desc: "Skills, experience, and industry gaps — ranked by impact on your reply rate.",
  },
  {
    title: "Target Companies",
    desc: "Companies matched to your profile, not generic job board listings.",
  },
  {
    title: "Weekly Action Plan",
    desc: "One thing to do this week — the highest-leverage move for your specific situation.",
  },
];

export default function CcIndex() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 bg-neutral-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block text-xs font-bold tracking-widest uppercase text-violet-400 border border-violet-500 px-3 py-1 rounded-full mb-6">
              Free Beta
            </div>
            <h1 className="font-['Clash_Display'] text-4xl md:text-6xl font-bold leading-tight mb-6">
              Your AI career coach.
            </h1>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-10">
              Stop guessing what employers want. Get a personalised readiness score, gap analysis, and outreach strategy — based on your actual profile.
            </p>
            <Link
              to="/cc/chat"
              className="inline-block bg-violet-500 text-white font-bold text-lg px-10 py-4 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
            >
              Start for free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Clash_Display'] text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-14">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
              >
                <div className="w-10 h-10 bg-violet-500 text-white font-bold text-lg rounded-xl flex items-center justify-center border-2 border-neutral-900 mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Clash_Display'] text-3xl md:text-4xl font-bold text-neutral-900 text-center mb-14">
            What you get
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
              >
                <div className="w-2 h-2 rounded-full bg-violet-500 mb-3" />
                <h3 className="font-bold text-neutral-900 mb-1">{f.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-violet-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-['Clash_Display'] text-3xl md:text-4xl font-bold text-white mb-6">
            Know exactly where you stand.
          </h2>
          <p className="text-violet-100 mb-8 text-lg">
            Takes 10 minutes. Free. No account needed to start.
          </p>
          <Link
            to="/cc/chat"
            className="inline-block bg-white text-violet-600 font-bold text-lg px-10 py-4 rounded-2xl border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all"
          >
            Start for free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
