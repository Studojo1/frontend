import { motion } from "framer-motion";
import { Link } from "react-router";
import { FiArrowRight, FiArrowDown, FiMail, FiUser, FiMessageSquare } from "react-icons/fi";


export function Hero() {
  return (
    <section className="border-b border-neutral-900 bg-purple-50">
      <div className="mx-auto flex max-w-[var(--section-max-width)] flex-col gap-10 px-4 pt-8 pb-8 md:flex-row md:items-center md:justify-between md:gap-16 md:px-8 md:py-20">

        {/* Left: copy */}
        <div className="flex flex-col gap-5 md:max-w-lg md:gap-7 lg:max-w-xl">
          {/* H1 */}
          <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight tracking-tight text-neutral-900 md:text-5xl lg:text-6xl">
            Job boards are dead.{" "}
            <span className="inline-flex rounded-2xl border-2 border-neutral-900 bg-purple-300 px-3 py-1 font-['Satoshi'] text-2xl font-medium text-neutral-900 md:text-4xl lg:text-5xl">
              We get you replies.
            </span>
          </h1>

          {/* Subtext */}
          <p className="font-['Satoshi'] text-base font-normal leading-7 text-neutral-700 md:text-lg md:leading-8">
            We find people who can hire you, write them a personal email, and send it as you.{" "}
            <strong className="font-semibold text-neutral-900">Most students get a reply within a week.</strong>
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <Link
              to="/outreach"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none md:w-auto md:px-8"
            >
              Get Contacted <FiArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="#free-tools"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white font-['Satoshi'] text-base font-medium text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none md:w-auto md:px-8"
            >
              See free tools <FiArrowDown className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Right: app simulation cards — stacked, gentle float only on y-axis */}
        <div className="hidden shrink-0 flex-col gap-4 md:flex md:w-[320px] lg:w-[360px]">
          {/* Card 1: Contact Found */}
          <motion.div
            className="w-full rounded-2xl border-2 border-neutral-900 bg-violet-500 p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 4, ease: "easeInOut" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-white/20">
                <FiUser className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-white/80">
                Contact Found
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 font-['Clash_Display'] text-sm font-bold text-white">
                RS
              </div>
              <div>
                <p className="font-['Satoshi'] text-sm font-bold text-white">Rohan S.</p>
                <p className="font-['Satoshi'] text-xs text-white/80">VP Engineering</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Email Written */}
          <motion.div
            className="w-full rounded-2xl border-2 border-neutral-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 4, ease: "easeInOut", delay: 1.3 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-100">
                <FiMail className="h-3.5 w-3.5 text-violet-600" />
              </span>
              <span className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-500">
                Email Written
              </span>
            </div>
            <p className="font-['Satoshi'] text-xs leading-5 text-neutral-700">
              Hi Rohan, I came across your recent work and was really impressed by the scale of problems you&apos;re solving...
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              <span className="font-['Satoshi'] text-xs font-semibold text-violet-700">Personalised</span>
            </div>
          </motion.div>

          {/* Card 3: Reply Received */}
          <motion.div
            className="w-full rounded-2xl border-2 border-neutral-900 bg-emerald-400 p-5 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 4, ease: "easeInOut", delay: 2.6 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 bg-white/20">
                <FiMessageSquare className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-white/80">
                Reply Received
              </span>
            </div>
            <p className="font-['Satoshi'] text-sm font-medium text-white">
              "This looks really interesting. Are you free for a quick call this week?"
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
