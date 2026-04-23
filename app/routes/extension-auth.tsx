import { redirect } from "react-router";
import { auth } from "~/lib/auth";
import { getSessionFromRequest } from "~/lib/onboarding.server";
import type { Route } from "./+types/extension-auth";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = new URL(request.url);
    throw redirect(`/auth?redirect=/extension-auth?ext=${url.searchParams.get("ext") ?? ""}`);
  }

  const url = new URL(request.url);
  const extId = url.searchParams.get("ext") ?? "";

  // Get a JWT for the extension to use
  const tokenRes = await auth.api.getAccessToken({ headers: request.headers });
  const token = (tokenRes as any)?.token ?? (tokenRes as any)?.accessToken ?? null;

  return { token, extId, name: session.user.name };
}

export default function ExtensionAuth({ loaderData }: Route.ComponentProps) {
  const { token, extId, name } = loaderData;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>Connect Extension – Studojo</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: #fff;
            border: 2px solid #1a1a1a;
            border-radius: 16px;
            box-shadow: 5px 5px 0 #1a1a1a;
            padding: 32px;
            max-width: 360px;
            width: 100%;
            text-align: center;
          }
          .icon { font-size: 40px; margin-bottom: 12px; }
          h1 { font-size: 20px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
          p { font-size: 14px; color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
          .status {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: 14px; font-weight: 600; padding: 10px 20px;
            border: 2px solid #1a1a1a; border-radius: 10px;
            background: #f0fdf4; color: #059669;
          }
          .error { background: #fef2f2; color: #dc2626; }
          .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">⚡</div>
          <h1>Connecting AutoApply</h1>
          <p>Signed in as <strong>{name}</strong>.<br />Sending your credentials to the extension…</p>
          <div id="status" className="status">
            <div className="dot" />
            Connecting...
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const extId = ${JSON.stringify(extId)};
                const token = ${JSON.stringify(token)};
                const el = document.getElementById('status');

                function setStatus(ok, msg) {
                  el.className = 'status' + (ok ? '' : ' error');
                  el.innerHTML = '<div class="dot"></div>' + msg;
                }

                if (!extId || !token) {
                  setStatus(false, 'Missing extension ID or token. Please retry from the extension.');
                  return;
                }

                try {
                  chrome.runtime.sendMessage(extId, { type: 'SAVE_TOKEN', token }, (res) => {
                    if (chrome.runtime.lastError) {
                      setStatus(false, 'Extension not found. Make sure it is installed and enabled.');
                    } else if (res?.ok) {
                      setStatus(true, 'Connected! You can close this tab.');
                      setTimeout(() => window.close(), 1500);
                    } else {
                      setStatus(false, 'Connection failed. Try again.');
                    }
                  });
                } catch (e) {
                  setStatus(false, 'Could not reach extension: ' + e.message);
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
