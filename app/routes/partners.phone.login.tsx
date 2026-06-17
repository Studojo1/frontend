import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { phonePartnersPost, setToken, setStoredUser } from "~/lib/partnersPhone/api";
import type { Route } from "./+types/partners.phone.login";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign In | Studojo Phone API" }];
}

export default function PhonePartnersLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await phonePartnersPost<{
        token: string;
        partner_id: number;
        name: string;
        email: string;
        company?: string;
      }>("/api/v1/phone/partners/login", form);
      setToken(res.token);
      setStoredUser({ id: res.partner_id, name: res.name, email: res.email, company: res.company });
      navigate("/partners/phone/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 font-['Satoshi'] px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/partners/phone" className="mb-8 block text-center font-['Clash_Display'] text-2xl font-bold text-neutral-900">
          Studojo Phone API
        </Link>

        <div className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)]">
          <h1 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">Welcome back</h1>
          <p className="mb-6 text-sm text-neutral-500">
            New here?{" "}
            <Link to="/partners/phone/signup" className="font-semibold text-violet-600 underline">
              Create an account
            </Link>
          </p>

          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full rounded-xl border-2 border-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                className="w-full rounded-xl border-2 border-neutral-900 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-2 border-neutral-900 bg-violet-500 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
