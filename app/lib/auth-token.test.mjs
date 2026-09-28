// Server code must get our JWT with auth.api.getToken, not getAccessToken.
//
// getAccessToken is for an OAuth provider's token (Google's) and throws 400
// without a providerId. Three places used it to fetch our JWT, so the admin
// check behind the Humanizer page returned false for everyone and the other
// two only worked through a fallback. This fails if it creeps back in, and
// proves against a real database that getToken is the call that works.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let bad = 0;
const check = (ok, label, detail = "") => {
  if (ok) { console.log(`  ok   ${label}`); return; }
  bad++;
  console.log(`  FAIL ${label}\n       ${detail}`);
};

const APP = new URL("../", import.meta.url).pathname;
const offenders = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name) && /auth\.api\.getAccessToken\s*\(/.test(readFileSync(p, "utf8"))) offenders.push(p.slice(APP.length));
  }
};
walk(APP);
check(offenders.length === 0, "no server code fetches our JWT with auth.api.getAccessToken", offenders.join(", "));

if (!process.env.DATABASE_URL) {
  console.log("  skip real-database checks (DATABASE_URL not set)");
} else {
  const { betterAuth } = await import("better-auth");
  const { jwt } = await import("better-auth/plugins");
  const { drizzleAdapter } = await import("better-auth/adapters/drizzle");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pg = (await import("pg")).default;
  const schema = await import("../../auth-schema.ts");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  const auth = betterAuth({
    secret: "test-secret-test-secret-test-secret-00",
    baseURL: "http://localhost:3000",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification, jwks: schema.jwks },
      transaction: true,
    }),
    emailAndPassword: { enabled: true },
    plugins: [jwt()],
    logger: { disabled: true },
  });
  const r = await auth.api.signUpEmail({
    body: { email: `tok-${Date.now()}@example.test`, password: "correct-horse-1", name: "T" },
    returnHeaders: true,
  });
  const headers = new Headers({ cookie: r.headers.get("set-cookie").split(";")[0] });
  let threw = false;
  try { await auth.api.getAccessToken({ headers }); } catch { threw = true; }
  check(threw, "control: getAccessToken without a providerId throws");
  const t = await auth.api.getToken({ headers });
  check(typeof t?.token === "string" && t.token.split(".").length === 3, "getToken returns our JWT for a signed-in user");
  await pool.end();
}

if (bad) { console.log(`\n${bad} failed`); process.exit(1); }
console.log("\nauth-token: all passed");
