import { useState } from "react";
import { Link } from "react-router";
import { FiBookOpen, FiArrowRight } from "react-icons/fi";
import { LuGraduationCap, LuUsersRound } from "react-icons/lu";
import { ChatInterface } from "./chat-interface";
import { FeatureCards } from "./feature-cards";
import { FloatingCardA, FloatingCardB } from "./floating-cards";

export function AssignmentDojoPage() {
  const [hasStartedChat, setHasStartedChat] = useState(false);

  return (
    <div className="w-full bg-white">
      {/* Hero – full width, below header, rounded corners, floating cards */}
      <section className="w-full">
        <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center gap-6 rounded-b-2xl bg-violet-500 px-4 py-16 md:min-h-[400px] md:gap-8 md:py-20">
          {/* Floating cards – left & right, animate across, opacity 0.2 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between overflow-visible px-4 md:px-12 lg:px-16">
            <div className="hidden opacity-20 md:block">
              <FloatingCardA />
            </div>
            <div className="hidden opacity-20 md:block">
              <FloatingCardB />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 text-center md:gap-8">
            {/* Badge */}
            <div className="rounded-full bg-white/20 px-5 py-2 shadow-sm">
              <span className="font-['Satoshi'] text-sm font-normal leading-5 text-white">
                AI-Powered Assignment Generator
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-xl font-['Clash_Display'] text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Create Perfect Assignments in Seconds
            </h1>

            {/* Description */}
            <p className="max-w-2xl font-['Satoshi'] text-sm font-normal leading-6 text-white/90 md:text-base md:leading-7">
              Generate comprehensive, well-structured assignments for any subject
              and academic level. Perfect for educators creating engaging
              coursework.
            </p>
          </div>
        </div>
      </section>

      {/* Chatbox – below hero */}
      <section id="chat" className="w-full bg-white">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-6 md:px-8 md:py-8">
          <div className="flex justify-center">
            <ChatInterface onFirstMessage={() => setHasStartedChat(true)} />
          </div>
        </div>
      </section>

      {/* Feature cards - only show before first message */}
      {!hasStartedChat && (
        <section className="w-full border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
            <div className="flex justify-center">
              <FeatureCards />
            </div>
          </div>
        </section>
      )}

      {/* CTA Boxes - Dissertation and Humanizer & Formatter */}
      <section className="w-full bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Dissertation Package CTA */}
            <Link
              to="/dissertation"
              className="group flex flex-col gap-4 rounded-2xl border-2 border-neutral-900 bg-pink-500 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none md:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 bg-white">
                  <LuGraduationCap className="h-6 w-6 text-pink-600" />
                </div>
                <h2 className="font-['Clash_Display'] text-2xl font-medium leading-7 text-white md:text-3xl">
                  Dissertation Package
                </h2>
              </div>
              <p className="font-['Satoshi'] text-base font-normal leading-6 text-white/90 md:text-lg">
                Get your dissertation done with AI + Human assistance. From research to final draft.
              </p>
              <div className="mt-auto inline-flex items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white px-6 py-3 font-['Satoshi'] text-sm font-medium leading-5 text-pink-600 transition-transform group-hover:translate-x-[1px] group-hover:translate-y-[1px]">
                <span>Get started</span>
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Humanizer & Formatter CTA - Coming Soon */}
            <div className="group flex flex-col gap-4 rounded-2xl border-2 border-neutral-900 bg-amber-500 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] opacity-75 md:p-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-neutral-900 bg-white">
                  <LuUsersRound className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="font-['Clash_Display'] text-2xl font-medium leading-7 text-white md:text-3xl">
                  Humanizer & Formatter
                </h2>
              </div>
              <p className="font-['Satoshi'] text-base font-normal leading-6 text-white/90 md:text-lg">
                Humanize AI Generated Outcomes. Untrackable and against all AI Busters.
              </p>
              <div className="mt-auto inline-flex cursor-not-allowed items-center gap-2 rounded-xl border-2 border-neutral-900 bg-white/80 px-6 py-3 font-['Satoshi'] text-sm font-medium leading-5 text-amber-600">
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
