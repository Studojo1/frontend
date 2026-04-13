import type { ResumeDoc } from "~/lib/rsb/types";

function range(start?: string | null, end?: string | null, isCurrent?: boolean) {
  const s = start || "";
  const e = isCurrent ? "Present" : end || "";
  return [s, e].filter(Boolean).join(" – ");
}

export function ResumePreview({ doc }: { doc: ResumeDoc }) {
  const c = doc.contact || {};
  const contactBits = [c.email, c.phone, c.location, c.linkedin, c.github, c.portfolio].filter(Boolean);
  const hasAny =
    c.full_name ||
    doc.summary ||
    doc.experience.length ||
    doc.education.length ||
    doc.projects.length ||
    doc.skills.technical.length;

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] overflow-hidden h-full">
      <div className="bg-neutral-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider font-['Satoshi'] flex items-center justify-between">
        <span>Live preview</span>
        <span className="text-violet-300">A4 · single column · ATS-safe</span>
      </div>

      <div className="p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
        {!hasAny && (
          <div className="text-center text-neutral-400 py-20 font-['Satoshi']">
            Your resume will appear here as you chat.
          </div>
        )}

        {c.full_name && (
          <header className="mb-4">
            <h1 className="text-2xl font-bold text-neutral-900 uppercase tracking-wide font-['Clash_Display']">
              {c.full_name}
            </h1>
            {contactBits.length > 0 && (
              <p className="text-xs text-neutral-700 mt-1">{contactBits.join("  |  ")}</p>
            )}
          </header>
        )}

        {doc.summary && (
          <Section title="Summary">
            <p className="text-sm text-neutral-800 leading-relaxed">{doc.summary}</p>
          </Section>
        )}

        {doc.experience.length > 0 && (
          <Section title="Experience">
            {doc.experience.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <strong className="text-sm text-neutral-900">
                    {[e.title, e.company].filter(Boolean).join(", ")}
                  </strong>
                  <span className="text-xs text-neutral-700 whitespace-nowrap">
                    {range(e.start, e.end, e.is_current)}
                  </span>
                </div>
                {e.location && <div className="text-xs text-neutral-600 italic">{e.location}</div>}
                {e.bullets.length > 0 && (
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    {e.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-neutral-800">
                        {b.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {doc.education.length > 0 && (
          <Section title="Education">
            {doc.education.map((ed, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between gap-3">
                  <strong className="text-sm text-neutral-900">
                    {[ed.degree, ed.field].filter(Boolean).join(", ")}
                    {ed.institution ? `  |  ${ed.institution}` : ""}
                  </strong>
                  <span className="text-xs text-neutral-700 whitespace-nowrap">
                    {range(ed.start, ed.end, false)}
                  </span>
                </div>
                {ed.gpa && <div className="text-xs text-neutral-700">GPA: {ed.gpa}</div>}
                {ed.honors && ed.honors.length > 0 && (
                  <ul className="list-disc pl-5 mt-0.5">
                    {ed.honors.map((h, j) => (
                      <li key={j} className="text-xs text-neutral-800">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {doc.projects.length > 0 && (
          <Section title="Projects">
            {doc.projects.map((p, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <strong className="text-sm text-neutral-900">{p.name}</strong>
                  {p.tech && p.tech.length > 0 && (
                    <span className="text-xs text-neutral-700">{p.tech.join(", ")}</span>
                  )}
                </div>
                {p.bullets.length > 0 && (
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-neutral-800">
                        {b.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {(doc.skills.technical.length > 0 ||
          doc.skills.soft.length > 0 ||
          doc.skills.languages.length > 0 ||
          doc.skills.certifications.length > 0) && (
          <Section title="Skills">
            {doc.skills.technical.length > 0 && (
              <p className="text-sm text-neutral-800">
                <strong>Technical:</strong> {doc.skills.technical.join(", ")}
              </p>
            )}
            {doc.skills.soft.length > 0 && (
              <p className="text-sm text-neutral-800">
                <strong>Soft:</strong> {doc.skills.soft.join(", ")}
              </p>
            )}
            {doc.skills.languages.length > 0 && (
              <p className="text-sm text-neutral-800">
                <strong>Languages:</strong> {doc.skills.languages.join(", ")}
              </p>
            )}
            {doc.skills.certifications.length > 0 && (
              <p className="text-sm text-neutral-800">
                <strong>Certifications:</strong> {doc.skills.certifications.join(", ")}
              </p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h2 className="text-[11px] font-bold text-neutral-900 uppercase tracking-[0.1em] border-b-[1.5px] border-neutral-900 pb-0.5 mb-1.5 font-['Clash_Display']">
        {title}
      </h2>
      {children}
    </section>
  );
}
