import type { ResumeDoc } from "~/lib/rsb/types";

function range(start?: string | null, end?: string | null, isCurrent?: boolean) {
  const s = start || "";
  const e = isCurrent ? "Present" : end || "";
  return [s, e].filter(Boolean).join(" – ");
}

type EditableProps = {
  value: string;
  editable: boolean;
  onCommit?: (next: string) => void;
  className?: string;
  as?: "span" | "p" | "div" | "strong" | "h1" | "h2" | "li";
  placeholder?: string;
};

function Editable({ value, editable, onCommit, className = "", as = "span", placeholder }: EditableProps) {
  const Tag = as as any;
  if (!editable) {
    return <Tag className={className}>{value || placeholder || ""}</Tag>;
  }
  return (
    <Tag
      className={`${className} outline-none focus:bg-violet-50 focus:ring-1 focus:ring-violet-400 rounded px-0.5 -mx-0.5`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: any) => {
        const text = (e.currentTarget.innerText || "").trim();
        if (text !== (value || "")) onCommit?.(text);
      }}
    >
      {value || ""}
    </Tag>
  );
}

export function ResumePreview({
  doc,
  editable = false,
  onEdit,
}: {
  doc: ResumeDoc;
  editable?: boolean;
  onEdit?: (next: ResumeDoc) => void;
}) {
  const c = doc.contact || {};
  const contactBits = [c.email, c.phone, c.linkedin].filter(Boolean);
  const hasAny =
    c.full_name ||
    doc.summary ||
    doc.experience.length ||
    doc.education.length ||
    doc.projects.length ||
    doc.skills.technical.length;

  const mutate = (fn: (d: ResumeDoc) => void) => {
    if (!onEdit) return;
    const next = JSON.parse(JSON.stringify(doc)) as ResumeDoc;
    fn(next);
    onEdit(next);
  };

  const setCsv = (key: "technical" | "soft" | "languages" | "certifications", raw: string) =>
    mutate((d) => {
      d.skills[key] = raw.split(",").map((s) => s.trim()).filter(Boolean);
    });

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(25,26,35,1)] overflow-hidden flex flex-col h-full">
      <div className="bg-neutral-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider font-['Satoshi'] flex items-center justify-between shrink-0">
        <span>Live preview{editable ? " · editable" : ""}</span>
        <span className="text-violet-300">A4 · single column · ATS-safe</span>
      </div>

      <div className="p-8 overflow-y-auto flex-1 min-h-0">
        {!hasAny && (
          <div className="text-center text-neutral-400 py-20 font-['Satoshi']">
            Your resume will appear here as you chat.
          </div>
        )}

        {c.full_name !== undefined && (
          <header className="mb-4">
            <Editable
              as="h1"
              className="text-2xl font-bold text-neutral-900 uppercase tracking-wide font-['Clash_Display']"
              value={c.full_name || ""}
              editable={editable}
              onCommit={(v) => mutate((d) => { d.contact.full_name = v; })}
            />
            {contactBits.length > 0 && (
              <p className="text-xs text-neutral-700 mt-1">{contactBits.join("  |  ")}</p>
            )}
          </header>
        )}

        {(
          <Section title="Summary">
            <Editable
              as="p"
              className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap"
              value={doc.summary || ""}
              editable={editable}
              placeholder="Click to add a summary."
              onCommit={(v) => mutate((d) => { d.summary = v; })}
            />
          </Section>
        )}

        {doc.experience.length > 0 && (
          <Section title="Experience">
            {doc.experience.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between gap-3">
                  <strong className="text-sm text-neutral-900">
                    <Editable
                      as="span"
                      value={e.title || ""}
                      editable={editable}
                      onCommit={(v) => mutate((d) => { d.experience[i].title = v; })}
                    />
                    {(e.title && e.company) ? ", " : ""}
                    <Editable
                      as="span"
                      value={e.company || ""}
                      editable={editable}
                      onCommit={(v) => mutate((d) => { d.experience[i].company = v; })}
                    />
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
                        <Editable
                          as="span"
                          value={b.text}
                          editable={editable}
                          onCommit={(v) =>
                            mutate((d) => {
                              d.experience[i].bullets[j].text = v;
                            })
                          }
                        />
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
                    <Editable
                      as="span"
                      value={ed.degree || ""}
                      editable={editable}
                      onCommit={(v) => mutate((d) => { d.education[i].degree = v; })}
                    />
                    {(ed.degree && ed.field) ? ", " : ""}
                    <Editable
                      as="span"
                      value={ed.field || ""}
                      editable={editable}
                      onCommit={(v) => mutate((d) => { d.education[i].field = v; })}
                    />
                    {ed.institution ? "  |  " : ""}
                    <Editable
                      as="span"
                      value={ed.institution || ""}
                      editable={editable}
                      onCommit={(v) => mutate((d) => { d.education[i].institution = v; })}
                    />
                  </strong>
                  <span className="text-xs text-neutral-700 whitespace-nowrap">
                    {range(ed.start, ed.end, false)}
                  </span>
                </div>
                {ed.gpa && <div className="text-xs text-neutral-700">GPA: {ed.gpa}</div>}
                {ed.honors && ed.honors.length > 0 && (
                  <ul className="list-disc pl-5 mt-0.5">
                    {ed.honors.map((h, j) => (
                      <li key={j} className="text-xs text-neutral-800">{h}</li>
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
                  <strong className="text-sm text-neutral-900">
                    <Editable
                      as="span"
                      value={p.name || ""}
                      editable={editable}
                      onCommit={(v) => mutate((d) => { d.projects[i].name = v; })}
                    />
                  </strong>
                  {p.tech && p.tech.length > 0 && (
                    <span className="text-xs text-neutral-700">{p.tech.join(", ")}</span>
                  )}
                </div>
                {p.bullets.length > 0 && (
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-neutral-800">
                        <Editable
                          as="span"
                          value={b.text}
                          editable={editable}
                          onCommit={(v) =>
                            mutate((d) => {
                              d.projects[i].bullets[j].text = v;
                            })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        <Section title="Skills">
          <p className="text-sm text-neutral-800">
            <strong>Technical:</strong>{" "}
            <Editable
              as="span"
              value={doc.skills.technical.join(", ")}
              editable={editable}
              placeholder="—"
              onCommit={(v) => setCsv("technical", v)}
            />
          </p>
          {doc.skills.soft.length > 0 && (
            <p className="text-sm text-neutral-800">
              <strong>Soft:</strong>{" "}
              <Editable
                as="span"
                value={doc.skills.soft.join(", ")}
                editable={editable}
                onCommit={(v) => setCsv("soft", v)}
              />
            </p>
          )}
        </Section>

        <Section title="Languages">
          <p className="text-sm text-neutral-800">
            <Editable
              as="span"
              value={doc.skills.languages.join(", ")}
              editable={editable}
              placeholder="—"
              onCommit={(v) => setCsv("languages", v)}
            />
          </p>
        </Section>

        <Section title="Certifications">
          {doc.skills.certifications.length > 0 ? (
            <ul className="list-disc pl-5 space-y-0.5">
              {doc.skills.certifications.map((cert, i) => (
                <li key={i} className="text-sm text-neutral-800">{cert}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-400">—</p>
          )}
        </Section>

        <Section title="Awards & Achievements">
          {doc.awards && doc.awards.length > 0 ? (
            <ul className="list-disc pl-5 space-y-0.5">
              {doc.awards.map((a, i) => (
                <li key={i} className="text-sm text-neutral-800">{a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-400">—</p>
          )}
        </Section>
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
