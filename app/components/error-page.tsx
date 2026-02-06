import { Link } from "react-router";
import { motion } from "framer-motion";
import { Header } from "./header";

interface ErrorPageProps {
  statusCode?: number;
  message: string;
  details: string;
  stack?: string;
}

export function ErrorPage({ statusCode, message, details, stack }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[var(--section-max-width)] flex-col items-center justify-center px-4 py-16 md:min-h-[calc(100vh-6rem)] md:px-8">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          {/* Glitch Error Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <h1 className="glitch-text font-['Clash_Display'] text-8xl font-bold leading-none text-neutral-900 md:text-9xl lg:text-[12rem]">
              {statusCode || "?"}
            </h1>
            {statusCode && (
              <div className="glitch-text-2 absolute inset-0 font-['Clash_Display'] text-8xl font-bold leading-none text-purple-500 md:text-9xl lg:text-[12rem] pointer-events-none">
                {statusCode}
              </div>
            )}
            {statusCode && (
              <div className="glitch-text-3 absolute inset-0 font-['Clash_Display'] text-8xl font-bold leading-none text-pink-500 md:text-9xl lg:text-[12rem] pointer-events-none">
                {statusCode}
              </div>
            )}
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <h2 className="font-['Clash_Display'] text-3xl font-bold leading-tight text-neutral-900 md:text-4xl lg:text-5xl">
              {message}
            </h2>
            <p className="font-['Satoshi'] text-lg font-normal leading-7 text-neutral-700 md:text-xl">
              {details}
            </p>
          </motion.div>

          {/* Decorative Shapes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative flex items-center justify-center gap-4"
          >
            <div className="h-16 w-16 rounded-2xl border-2 border-purple-500 bg-purple-100 shadow-[4px_4px_0px_0px_rgba(139,92,246,1)] md:h-20 md:w-20 md:shadow-[6px_6px_0px_0px_rgba(139,92,246,1)]" />
            <div className="h-12 w-12 rounded-2xl border-2 border-pink-500 bg-pink-100 shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] md:h-16 md:w-16 md:shadow-[6px_6px_0px_0px_rgba(236,72,153,1)]" />
            <div className="h-16 w-16 rounded-2xl border-2 border-yellow-500 bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] md:h-20 md:w-20 md:shadow-[6px_6px_0px_0px_rgba(234,179,8,1)]" />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              to="/"
              className="rounded-2xl border-2 border-neutral-900 bg-purple-500 px-8 py-4 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Go Home
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-2xl border-2 border-neutral-900 bg-white px-8 py-4 font-['Satoshi'] text-base font-medium leading-6 text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Go Back
            </button>
          </motion.div>

          {/* Stack Trace (Dev Only) */}
          {stack && import.meta.env.DEV && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 w-full rounded-2xl border-2 border-neutral-900 bg-neutral-50 p-6 text-left"
            >
              <summary className="cursor-pointer font-['Satoshi'] text-sm font-medium leading-6 text-neutral-700">
                Stack Trace (Dev Only)
              </summary>
              <pre className="mt-4 overflow-x-auto font-mono text-xs leading-relaxed text-neutral-900">
                <code>{stack}</code>
              </pre>
            </motion.details>
          )}
        </div>
      </main>
    </div>
  );
}

