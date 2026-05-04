// GET /api/autoapply/local-capture-script?token=XXX
// Returns a Python script that the user runs on their own machine.
// The script opens a browser, lets them log into LinkedIn, then POSTs
// the captured cookies back using the one-time token (no Studojo auth needed).

import type { Route } from "./+types/api.autoapply.local-capture-script";

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return new Response("token required", { status: 400 });

  const apiBase = origin; // e.g. https://studojo.pro
  const captureUrl = `${apiBase}/api/autoapply/session-capture`;

  const script = `#!/usr/bin/env python3
"""Studojo LinkedIn session capture — runs on your machine, not our server."""
import sys, subprocess, json

# Install playwright silently if not present
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Installing playwright...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "playwright"], check=True)
    subprocess.run([sys.executable, "-m", "playwright", "install", "chromium", "--quiet"], check=True)
    from playwright.sync_api import sync_playwright

TOKEN = "${token}"
API_URL = "${captureUrl}"
COOKIE_NAMES = {"li_at", "JSESSIONID", "bcookie", "bscookie", "lidc", "li_gc", "li_sugr"}

print("\\n=== Studojo LinkedIn Connect ===\\n")
print("A browser window will open. Log into LinkedIn if you aren't already.")
print("Once you see your LinkedIn feed, come back here and press Enter.\\n")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, args=["--start-maximized"])
    context = browser.new_context(no_viewport=True)
    page = context.new_page()
    page.goto("https://www.linkedin.com/feed/")

    input("Press Enter when you are logged into LinkedIn... ")

    cookies = context.cookies("https://www.linkedin.com")
    cookie_map = {c["name"]: c["value"] for c in cookies if c["name"] in COOKIE_NAMES}
    li_at = cookie_map.get("li_at")

    if not li_at:
        print("\\n❌ li_at cookie not found. Make sure you are fully logged in.")
        browser.close()
        sys.exit(1)

    cookie_str = "; ".join(f"{k}={v}" for k, v in cookie_map.items())
    user_agent = page.evaluate("() => navigator.userAgent")
    timezone = page.evaluate("() => Intl.DateTimeFormat().resolvedOptions().timeZone")
    locale = page.evaluate("() => navigator.language || 'en-US'")

    browser.close()

import urllib.request, urllib.error

payload = json.dumps({
    "token": TOKEN,
    "liAt": li_at,
    "cookies": cookie_str,
    "userAgent": user_agent,
    "timezone": timezone,
    "locale": locale,
}).encode()

req = urllib.request.Request(
    API_URL,
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        if result.get("ok"):
            print("\\n✅ LinkedIn connected! You can close this window and return to Studojo.")
        else:
            print(f"\\n❌ Server error: {result}")
            sys.exit(1)
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"\\n❌ HTTP {e.code}: {body}")
    sys.exit(1)
`;

  return new Response(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
