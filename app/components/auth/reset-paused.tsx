import { Link } from "react-router";
import { Footer, Header } from "~/components";
import { useSiteB2c } from "~/components/site-b2c/host";
import { AuthTop } from "~/components/site-b2c/auth-top";

// RELAUNCH (2 Nov 2026, the owner): password reset emails are paused, so /forgot-password and /reset-password show
// this note instead of a form. Nothing here sends anything. Same card as the sign-in pages (SITE-V2 look on B2C hosts).

/** The note, word for word as the owner wrote it. */
export const RESET_PAUSED_NOTE =
  "Password reset emails are paused for a few days. Write to admin@studojo.com and we will reset it for you.";

export const RESET_CONTACT = "admin@studojo.com";

const BTN_PRIMARY =
  "rounded-2xl border-2 border-neutral-900 bg-purple-500 px-6 py-3 font-['Satoshi'] text-base font-medium leading-6 text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";

export function ResetPaused({ title }: { title: string }) {
  const b2c = useSiteB2c();
  const b2cMark = (part: string) => (b2c ? { "data-b2c": part } : {});
  return (
    <div className={b2c ? "sv2-auth" : "min-h-screen bg-white"}>
      <Header />
      <div className="mx-auto max-w-md px-4 py-16">
        <div {...b2cMark("shell")} className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
          {b2c && <AuthTop kicker="your studojo account" size={56} />}
          <h1 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-neutral-900">{title}</h1>
          <div {...b2cMark("note")} className="mb-6 rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
            <p role="status" className="font-['Satoshi'] text-base text-purple-900">
              {RESET_PAUSED_NOTE}
            </p>
          </div>
          <a
            href={`mailto:${RESET_CONTACT}?subject=${encodeURIComponent("Reset my password")}`}
            className="mb-4 block text-center font-['Satoshi'] text-sm font-medium text-purple-600 hover:underline"
          >
            Email {RESET_CONTACT}
          </a>
          <Link
            to="/auth?mode=signin"
            className={(b2c ? "sv-btn sv-btn-wide " : "") + BTN_PRIMARY + " block text-center"}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
      {b2c && <Footer compact />}
    </div>
  );
}
