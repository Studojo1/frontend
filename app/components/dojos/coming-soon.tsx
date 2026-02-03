import { FiAlertCircle } from "react-icons/fi";

export function ComingSoon() {
  return (
    <div className="w-full bg-white">
      <section className="w-full">
        <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center gap-6 rounded-b-2xl bg-amber-500 px-4 py-16 md:min-h-[400px] md:gap-8 md:py-20">
          <div className="relative z-10 flex flex-col items-center gap-6 text-center md:gap-8">
            {/* Construction Icon */}
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/20">
              <FiAlertCircle className="h-12 w-12 text-white" />
            </div>

            {/* Heading */}
            <h1 className="max-w-xl font-['Clash_Display'] text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Coming Soon
            </h1>

            {/* Description */}
            <p className="max-w-2xl font-['Satoshi'] text-sm font-normal leading-6 text-white/90 md:text-base md:leading-7">
              Humanizer Dojo is currently under construction. This feature will be available soon.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-[var(--section-max-width)] px-4 py-12 md:px-8 md:py-16">
          <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500 bg-white">
              <FiAlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-amber-900">
              Feature Under Construction
            </h2>
            <p className="font-['Satoshi'] text-base text-amber-800">
              We're working hard to bring you this feature. Stay tuned for updates!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

