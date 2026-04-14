import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

const BANDS = [
  { id: "fresher", label: "Fresher (no work yet)" },
  { id: "0-2y", label: "0 to 2 years" },
  { id: "2-5y", label: "2 to 5 years" },
  { id: "5+y", label: "5+ years" },
];

export type IntakePayload = {
  target_role: string;
  target_industry: string;
  experience_band: string;
  region: string;
  top_skills: string[];
};

export function RoleIntake({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (p: IntakePayload) => void;
}) {
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [band, setBand] = useState("fresher");
  const [region, setRegion] = useState("India");
  const [skills, setSkills] = useState("");

  const canSubmit = role.trim().length > 1;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-white to-amber-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-3 font-['Clash_Display']">
          First, who are we building this for?
        </h1>
        <p className="text-neutral-700 mb-8 font-['Satoshi']">
          Tell us the role and we&apos;ll tune every word to it. You can change this later.
        </p>

        <div className="bg-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] rounded-[32px] p-6 md:p-8 space-y-5 font-['Satoshi']">
          <Field label="Target role" required>
            <input
              className="w-full px-4 py-3 bg-white border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
              placeholder="e.g. Software Engineer, Product Manager, Data Analyst"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </Field>

          <Field label="Industry (optional)">
            <input
              className="w-full px-4 py-3 bg-white border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
              placeholder="e.g. Fintech, SaaS, E-commerce"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </Field>

          <Field label="Experience" required>
            <div className="grid grid-cols-2 gap-2">
              {BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBand(b.id)}
                  className={`px-3 py-3 border-2 border-neutral-900 rounded-xl font-semibold text-sm text-left transition-all ${
                    band === b.id
                      ? "bg-violet-500 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(25,26,35,1)]"
                      : "bg-white text-neutral-800 hover:bg-violet-50"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Target region (optional)">
            <input
              className="w-full px-4 py-3 bg-white border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
              placeholder="e.g. India, Bangalore, Remote, US"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </Field>

          <Field label="Top 3 skills (optional, comma separated)">
            <input
              className="w-full px-4 py-3 bg-white border-2 border-neutral-900 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
              placeholder="e.g. Python, SQL, React"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </Field>

          <button
            disabled={!canSubmit || submitting}
            onClick={() =>
              onSubmit({
                target_role: role.trim(),
                target_industry: industry.trim(),
                experience_band: band,
                region: region.trim(),
                top_skills: skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 3),
              })
            }
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-violet-500 text-neutral-900 font-bold text-lg border-2 border-neutral-900 rounded-2xl shadow-[5px_5px_0px_0px_rgba(25,26,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0px_0px_rgba(25,26,35,1)]"
          >
            {submitting ? "Creating your draft..." : "Start the interview"}
            <FiArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-neutral-900 mb-1.5">
        {label}
        {required && <span className="text-violet-600 ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
