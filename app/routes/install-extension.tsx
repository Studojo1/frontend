import { Link } from "react-router";
import { Header, Footer } from "~/components";

export function meta() {
  return [
    { title: "Install the Studojo Extension — LinkedIn Connect" },
    {
      name: "description",
      content:
        "Install the Studojo Chrome Extension to connect your LinkedIn account and find the right people to reach out to for any role you want.",
    },
  ];
}

const STEPS = [
  {
    num: 1,
    title: "Download the extension",
    desc: 'Click the button below to download the extension ZIP file.',
  },
  {
    num: 2,
    title: "Open Chrome Extensions",
    desc: 'Go to chrome://extensions in your browser and turn on "Developer mode" (top right toggle).',
  },
  {
    num: 3,
    title: "Load the extension",
    desc: 'Click "Load unpacked", then select the downloaded and unzipped extension folder.',
  },
  {
    num: 4,
    title: "Connect LinkedIn",
    desc: 'Click the Studojo S icon in your toolbar. Hit "Connect LinkedIn". Done in 5 seconds.',
  },
];

export default function InstallExtension() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <section className="border-b-2 border-neutral-900 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-violet-500 px-4 py-1.5 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              Chrome Extension
            </div>
            <h1 className="font-['Clash_Display'] text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              Connect your LinkedIn.<br />Find who to reach.
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-['Satoshi'] text-base leading-relaxed text-neutral-600">
              The Studojo extension reads your LinkedIn session securely so we
              can find the right people for you to connect with — and write a
              personal note for each one. Install takes under 60 seconds.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-3xl px-4 py-14 md:px-8">
          <div className="mb-10 flex flex-col gap-5">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex gap-5 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-neutral-900 bg-violet-500 font-['Clash_Display'] text-lg font-bold text-white">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-['Clash_Display'] text-lg font-bold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 font-['Satoshi'] text-sm leading-relaxed text-neutral-600">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border-2 border-neutral-900 bg-violet-500 p-8 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <h2 className="font-['Clash_Display'] text-2xl font-bold text-white mb-2">
              Ready to install?
            </h2>
            <p className="font-['Satoshi'] text-sm text-white/80 mb-6">
              Download the extension, unzip it, and load it in Chrome. The whole
              thing takes under a minute.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="https://github.com/Studojo1/frontend/archive/refs/heads/staging.zip"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-sm font-bold text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Extension
              </a>
              <Link
                to="/outreach/linkedin"
                className="flex h-12 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 font-['Satoshi'] text-sm font-bold text-white transition hover:bg-white/20"
              >
                Already installed? Go here
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
              Common questions
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "Is my LinkedIn session safe?",
                  a: "Yes. Your session token is encrypted with AES-256-GCM before it ever touches our servers. We never store or transmit it in plain text. It's only used to make searches on your behalf.",
                },
                {
                  q: "Will LinkedIn know I'm using this?",
                  a: "We make normal LinkedIn searches at a human pace — the same searches you'd make manually. We add random delays and limit searches to avoid any issues.",
                },
                {
                  q: "What does the extension actually access?",
                  a: "Only your LinkedIn session cookie (li_at) and your Studojo session to associate the token with your account. Nothing else.",
                },
                {
                  q: "Can I disconnect LinkedIn later?",
                  a: 'Yes — open the extension popup and click "Disconnect", or go to studojo.com/outreach/linkedin and disconnect from there.',
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]"
                >
                  <h3 className="font-['Clash_Display'] text-base font-bold text-neutral-900 mb-2">
                    {item.q}
                  </h3>
                  <p className="font-['Satoshi'] text-sm leading-relaxed text-neutral-600">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
