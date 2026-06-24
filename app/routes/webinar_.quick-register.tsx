import type { Route } from "./+types/webinar_.quick-register";
import { verifyQuickRegToken } from "~/lib/webinar-token.server";
import { quickRegister } from "~/lib/webinar.server";

export function meta() {
  return [{ title: "Registered for the next webinar | Studojo" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const payload = verifyQuickRegToken(token);
  if (!payload) {
    return { ok: false as const };
  }
  try {
    await quickRegister({ email: payload.email, fullName: payload.name || "" });
  } catch (err) {
    console.error("quick-register failed:", err);
    return { ok: false as const };
  }
  return { ok: true as const, name: payload.name || "" };
}

export default function WebinarQuickRegister({ loaderData }: Route.ComponentProps) {
  const ok = loaderData.ok;
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border-2 border-neutral-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] p-10 text-center">
        {ok ? (
          <>
            <div className="text-4xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-neutral-900 font-['Clash_Display']">
              You're registered{loaderData.name ? `, ${loaderData.name}` : ""}!
            </h1>
            <p className="mt-3 text-neutral-600 font-['Satoshi']">
              You're all set for the next Studojo webinar. We'll email you the joining details closer to the date. You'll also be saved a spot for every future webinar automatically.
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">🔗</div>
            <h1 className="text-2xl font-bold text-neutral-900 font-['Clash_Display']">
              This link looks invalid
            </h1>
            <p className="mt-3 text-neutral-600 font-['Satoshi']">
              We couldn't read your registration link. Please use the button from your email, or sign up at{" "}
              <a href="/webinar" className="text-violet-600 underline">studojo.com/webinar</a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
