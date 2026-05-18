// JRS resume templates. Each renders a ResumeData onto a 210mm A4 page.
// All templates are pure text (ATS-safe) — no images, no canvas.
import type { ResumeData, ExperienceItem, EducationItem, ProjectItem, TemplateId } from "./types";

function nonEmpty(s: string | undefined): boolean {
  return !!s && s.trim().length > 0;
}
function expHas(e: ExperienceItem): boolean {
  return nonEmpty(e.company) || nonEmpty(e.role);
}
function eduHas(e: EducationItem): boolean {
  return nonEmpty(e.school) || nonEmpty(e.degree) || nonEmpty(e.field);
}
function projHas(p: ProjectItem): boolean {
  return nonEmpty(p.name) || nonEmpty(p.description);
}
function dateRange(start: string, end: string, current: boolean): string {
  const e = current ? "Present" : end;
  if (nonEmpty(start) && nonEmpty(e)) return `${start} — ${e}`;
  return start || e || "";
}
function contactLine(d: ResumeData): string[] {
  return [d.basics.email, d.basics.phone, d.basics.location, d.basics.website, d.basics.linkedin].filter(
    nonEmpty,
  );
}

// Width is 100% so the template fills whatever container it's given — the
// preview/print wrapper sets the real page width. This lets the density
// zoom keep full page width while scaling everything else.
const PAGE: React.CSSProperties = {
  width: "100%",
  minHeight: "297mm",
  background: "#fff",
  boxSizing: "border-box",
  color: "#1a1a1a",
};

function Bullets({ items }: { items: string[] }) {
  const real = items.filter(nonEmpty);
  if (real.length === 0) return null;
  return (
    <ul style={{ margin: "2px 0 0", paddingLeft: 16 }}>
      {real.map((b, i) => (
        <li key={i} style={{ marginBottom: 2, lineHeight: 1.45 }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

// ─── Classic: centered serif, single column ────────────────────────────────
function Classic({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: 2,
    margin: "14px 0 6px",
  };
  return (
    <div style={{ ...PAGE, padding: "16mm 16mm", fontFamily: "'Georgia', serif", fontSize: 10.5 }}>
      <header style={{ textAlign: "center", borderBottom: "2px solid #1a1a1a", paddingBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: 1 }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "3px 0 0", fontSize: 12, fontStyle: "italic" }}>{data.basics.title}</p>
        )}
        <p style={{ margin: "5px 0 0", fontSize: 9.5 }}>{contactLine(data).join("  ·  ")}</p>
      </header>
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>Summary</h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {e.role}, {e.company}
                </strong>
                <span style={{ fontSize: 9.5 }}>{dateRange(e.start, e.end, e.current)}</span>
              </div>
              {nonEmpty(e.location) && (
                <p style={{ margin: "1px 0 2px", fontSize: 9.5, fontStyle: "italic" }}>{e.location}</p>
              )}
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <strong>{p.name}</strong>
              {nonEmpty(p.link) && <span style={{ fontSize: 9 }}> — {p.link}</span>}
              {nonEmpty(p.description) && (
                <p style={{ margin: "1px 0 2px" }}>{p.description}</p>
              )}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {edu.length > 0 && (
        <>
          <h2 style={head}>Education</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {e.degree} {e.field} — {e.school}
                </strong>
                <span style={{ fontSize: 9.5 }}>{dateRange(e.start, e.end, false)}</span>
              </div>
              {nonEmpty(e.details) && <p style={{ margin: "1px 0 0" }}>{e.details}</p>}
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>Skills</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 3px" }}>
              {nonEmpty(s.category) && <strong>{s.category}: </strong>}
              {s.items}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Compact: dense single column ──────────────────────────────────────────
function Compact({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 10.5,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f766e",
    margin: "9px 0 3px",
  };
  return (
    <div style={{ ...PAGE, padding: "12mm 12mm", fontFamily: "'Inter', Arial, sans-serif", fontSize: 9.5 }}>
      <header style={{ borderBottom: "2px solid #0f766e", paddingBottom: 5 }}>
        <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{data.basics.name || "Your Name"}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          {nonEmpty(data.basics.title) && (
            <span style={{ fontSize: 10.5, color: "#0f766e", fontWeight: 600 }}>{data.basics.title}</span>
          )}
          <span style={{ fontSize: 8.5, color: "#555" }}>{contactLine(data).join("  ·  ")}</span>
        </div>
      </header>
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>Summary</h2>
          <p style={{ margin: 0, lineHeight: 1.4 }}>{data.summary}</p>
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {e.role} · {e.company}
                </strong>
                <span style={{ fontSize: 8.5, color: "#555" }}>
                  {dateRange(e.start, e.end, e.current)}
                </span>
              </div>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 5 }}>
              <strong>{p.name}</strong>
              {nonEmpty(p.description) && <span> — {p.description}</span>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      <div style={{ display: "flex", gap: 16 }}>
        {edu.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={head}>Education</h2>
            {edu.map((e) => (
              <div key={e.id} style={{ marginBottom: 4 }}>
                <strong>
                  {e.degree} {e.field}
                </strong>
                <p style={{ margin: 0 }}>
                  {e.school} · {dateRange(e.start, e.end, false)}
                </p>
              </div>
            ))}
          </div>
        )}
        {skills.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={head}>Skills</h2>
            {skills.map((s) => (
              <p key={s.id} style={{ margin: "0 0 2px" }}>
                {nonEmpty(s.category) && <strong>{s.category}: </strong>}
                {s.items}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Minimal: whitespace, thin ─────────────────────────────────────────────
function Minimal({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 9.5,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: "#999",
    margin: "20px 0 8px",
  };
  return (
    <div style={{ ...PAGE, padding: "20mm 18mm", fontFamily: "'Inter', Arial, sans-serif", fontSize: 10.5, fontWeight: 300 }}>
      <h1 style={{ fontSize: 26, fontWeight: 300, margin: 0, letterSpacing: 1 }}>
        {data.basics.name || "Your Name"}
      </h1>
      {nonEmpty(data.basics.title) && (
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{data.basics.title}</p>
      )}
      <p style={{ margin: "8px 0 0", fontSize: 9, color: "#999" }}>{contactLine(data).join("    ")}</p>
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>Profile</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontWeight: 600 }}>{e.role}</strong>
                <span style={{ fontSize: 9, color: "#999" }}>
                  {dateRange(e.start, e.end, e.current)}
                </span>
              </div>
              <p style={{ margin: "1px 0 4px", fontSize: 10, color: "#666" }}>{e.company}</p>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 10 }}>
              <strong style={{ fontWeight: 600 }}>{p.name}</strong>
              {nonEmpty(p.description) && (
                <p style={{ margin: "2px 0 3px", color: "#666" }}>{p.description}</p>
              )}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {edu.length > 0 && (
        <>
          <h2 style={head}>Education</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <strong style={{ fontWeight: 600 }}>
                {e.degree} {e.field}
              </strong>
              <span style={{ color: "#666" }}>
                {" "}
                — {e.school}, {dateRange(e.start, e.end, false)}
              </span>
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>Skills</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 4px", color: "#666" }}>
              {nonEmpty(s.category) && <strong style={{ fontWeight: 600, color: "#1a1a1a" }}>{s.category} </strong>}
              {s.items}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Technical: mono accents ───────────────────────────────────────────────
function Technical({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const mono = "'JetBrains Mono', 'Courier New', monospace";
  const head: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: mono,
    color: "#0369a1",
    margin: "12px 0 5px",
  };
  return (
    <div style={{ ...PAGE, padding: "14mm 14mm", fontFamily: "'Inter', Arial, sans-serif", fontSize: 10 }}>
      <header>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: mono }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#0369a1" }}>{data.basics.title}</p>
        )}
        <p style={{ margin: "5px 0 0", fontSize: 9, fontFamily: mono, color: "#555" }}>
          {contactLine(data).join("  |  ")}
        </p>
      </header>
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>// summary</h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>// skills</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 3px", fontFamily: mono, fontSize: 9 }}>
              {nonEmpty(s.category) && <span style={{ color: "#0369a1" }}>{s.category}: </span>}
              {s.items}
            </p>
          ))}
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>// experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 10.5 }}>
                  {e.role} @ {e.company}
                </strong>
                <span style={{ fontSize: 8.5, fontFamily: mono, color: "#555" }}>
                  {dateRange(e.start, e.end, e.current)}
                </span>
              </div>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>// projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: 10.5 }}>{p.name}</strong>
              {nonEmpty(p.link) && (
                <span style={{ fontSize: 8.5, fontFamily: mono, color: "#0369a1", marginLeft: 6 }}>
                  {p.link}
                </span>
              )}
              {nonEmpty(p.description) && <p style={{ margin: "1px 0 2px" }}>{p.description}</p>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {edu.length > 0 && (
        <>
          <h2 style={head}>// education</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 5 }}>
              <strong>
                {e.degree} {e.field}
              </strong>{" "}
              — {e.school}{" "}
              <span style={{ fontSize: 8.5, fontFamily: mono, color: "#555" }}>
                {dateRange(e.start, e.end, false)}
              </span>
              {nonEmpty(e.details) && <p style={{ margin: "1px 0 0" }}>{e.details}</p>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Harvard: the classic academic format, education-first ─────────────────
function Harvard({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: 1,
    margin: "13px 0 5px",
  };
  const rowTop: React.CSSProperties = { display: "flex", justifyContent: "space-between" };
  return (
    <div
      style={{
        ...PAGE,
        padding: "16mm 18mm",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: 10.5,
      }}
    >
      <header style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 2 }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "2px 0 0", fontSize: 10.5, fontStyle: "italic" }}>
            {data.basics.title}
          </p>
        )}
        <p style={{ margin: "3px 0 0", fontSize: 9.5 }}>{contactLine(data).join("  •  ")}</p>
      </header>
      {edu.length > 0 && (
        <>
          <h2 style={head}>Education</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <div style={rowTop}>
                <strong>{e.school}</strong>
                <span>{e.location}</span>
              </div>
              <div style={{ ...rowTop, fontStyle: "italic" }}>
                <span>
                  {e.degree} {e.field}
                </span>
                <span>{dateRange(e.start, e.end, false)}</span>
              </div>
              {nonEmpty(e.details) && <p style={{ margin: "1px 0 0" }}>{e.details}</p>}
            </div>
          ))}
        </>
      )}
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>Summary</h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <div style={rowTop}>
                <strong>{e.company}</strong>
                <span>{nonEmpty(e.location) ? e.location : ""}</span>
              </div>
              <div style={{ ...rowTop, fontStyle: "italic" }}>
                <span>{e.role}</span>
                <span>{dateRange(e.start, e.end, e.current)}</span>
              </div>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 6 }}>
              <strong>{p.name}</strong>
              {nonEmpty(p.link) && <span style={{ fontStyle: "italic" }}> — {p.link}</span>}
              {nonEmpty(p.description) && <p style={{ margin: "1px 0 1px" }}>{p.description}</p>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>Skills</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 3px" }}>
              {nonEmpty(s.category) && <strong>{s.category}: </strong>}
              {s.items}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Marketing: bold colour header, skills as pills ────────────────────────
function Pills({ items, bg, fg }: { items: string; bg: string; fg: string }) {
  const list = items
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
      {list.map((x, i) => (
        <span
          key={i}
          style={{
            background: bg,
            color: fg,
            fontSize: 8.5,
            padding: "2px 7px",
            borderRadius: 9,
          }}
        >
          {x}
        </span>
      ))}
    </div>
  );
}
function Marketing({ data }: { data: ResumeData }) {
  const accent = "#4f46e5";
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: accent,
    margin: "0 0 6px",
    borderBottom: `2px solid ${accent}`,
    paddingBottom: 2,
  };
  return (
    <div style={{ ...PAGE, fontFamily: "'Inter', Arial, sans-serif", fontSize: 10.5 }}>
      <header style={{ background: accent, color: "#fff", padding: "12mm 12mm 10mm" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#c7d2fe" }}>{data.basics.title}</p>
        )}
        <p style={{ margin: "8px 0 0", fontSize: 9 }}>{contactLine(data).join("    •    ")}</p>
      </header>
      <main style={{ padding: "8mm 12mm" }}>
        {nonEmpty(data.summary) && (
          <section style={{ marginBottom: 12 }}>
            <h2 style={head}>Profile</h2>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
          </section>
        )}
        {exp.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            <h2 style={head}>Experience</h2>
            {exp.map((e) => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 11 }}>{e.role}</strong>
                  <span style={{ fontSize: 9, color: "#666" }}>
                    {dateRange(e.start, e.end, e.current)}
                  </span>
                </div>
                <p style={{ margin: "1px 0 3px", fontSize: 10, color: accent, fontWeight: 600 }}>
                  {e.company}
                  {nonEmpty(e.location) ? ` · ${e.location}` : ""}
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            <h2 style={head}>Skills</h2>
            {skills.map((s) => (
              <div key={s.id} style={{ marginBottom: 5 }}>
                {nonEmpty(s.category) && (
                  <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700 }}>{s.category}</p>
                )}
                <Pills items={s.items} bg="#eef2ff" fg={accent} />
              </div>
            ))}
          </section>
        )}
        {proj.length > 0 && (
          <section style={{ marginBottom: 12 }}>
            <h2 style={head}>Projects</h2>
            {proj.map((p) => (
              <div key={p.id} style={{ marginBottom: 7 }}>
                <strong style={{ fontSize: 10.5 }}>{p.name}</strong>
                {nonEmpty(p.description) && (
                  <p style={{ margin: "1px 0 2px" }}>{p.description}</p>
                )}
                <Bullets items={p.bullets} />
              </div>
            ))}
          </section>
        )}
        {edu.length > 0 && (
          <section>
            <h2 style={head}>Education</h2>
            {edu.map((e) => (
              <div key={e.id} style={{ marginBottom: 5 }}>
                <strong>
                  {e.degree} {e.field}
                </strong>
                <p style={{ margin: 0, fontSize: 10 }}>
                  {e.school} · {dateRange(e.start, e.end, false)}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// ─── Executive: refined serif, understated ─────────────────────────────────
function Executive({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 3,
    color: "#6b7280",
    margin: "16px 0 6px",
  };
  return (
    <div
      style={{
        ...PAGE,
        padding: "18mm 18mm",
        fontFamily: "'Georgia', serif",
        fontSize: 10.5,
        color: "#222",
      }}
    >
      <header style={{ borderBottom: "2px solid #222", paddingBottom: 8 }}>
        <h1 style={{ fontSize: 27, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
          {data.basics.name || "Your Name"}
        </h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 3 }}>
          {nonEmpty(data.basics.title) && (
            <span style={{ fontSize: 12, fontStyle: "italic", color: "#444" }}>
              {data.basics.title}
            </span>
          )}
          <span style={{ fontSize: 9, color: "#666" }}>{contactLine(data).join("  ·  ")}</span>
        </div>
      </header>
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>Profile</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ fontSize: 11.5 }}>{e.company}</strong>
                <span style={{ fontSize: 9, color: "#666" }}>
                  {dateRange(e.start, e.end, e.current)}
                </span>
              </div>
              <p style={{ margin: "1px 0 3px", fontSize: 10.5, fontStyle: "italic", color: "#444" }}>
                {e.role}
                {nonEmpty(e.location) ? `, ${e.location}` : ""}
              </p>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Selected Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 7 }}>
              <strong>{p.name}</strong>
              {nonEmpty(p.description) && <p style={{ margin: "1px 0 2px" }}>{p.description}</p>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {edu.length > 0 && (
        <>
          <h2 style={head}>Education</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>
                  {e.degree} {e.field}
                </strong>
                , {e.school}
                {nonEmpty(e.details) ? ` — ${e.details}` : ""}
              </span>
              <span style={{ fontSize: 9, color: "#666" }}>{dateRange(e.start, e.end, false)}</span>
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>Competencies</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 3px" }}>
              {nonEmpty(s.category) && <strong>{s.category}: </strong>}
              {s.items}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Creative: warm two-tone with a sidebar ────────────────────────────────
function Creative({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const accent = "#c2410c"; // warm rust
  const head: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: accent,
    margin: "0 0 6px",
  };
  return (
    <div style={{ ...PAGE, display: "flex", fontFamily: "'Inter', Arial, sans-serif", fontSize: 10.5 }}>
      <main style={{ flex: 1, padding: "14mm 10mm" }}>
        <h1 style={{ fontSize: 25, fontWeight: 800, margin: 0, color: "#1a1a1a" }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ fontSize: 12, margin: "3px 0 0", color: accent, fontWeight: 600 }}>
            {data.basics.title}
          </p>
        )}
        {nonEmpty(data.summary) && (
          <section style={{ marginTop: 14 }}>
            <h2 style={head}>About</h2>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
          </section>
        )}
        {exp.length > 0 && (
          <section style={{ marginTop: 14 }}>
            <h2 style={head}>Experience</h2>
            {exp.map((e) => (
              <div key={e.id} style={{ marginBottom: 10, borderLeft: `2px solid #fed7aa`, paddingLeft: 8 }}>
                <strong style={{ fontSize: 11 }}>{e.role}</strong>
                <p style={{ margin: "1px 0 3px", fontSize: 10, color: accent }}>
                  {e.company}
                  {nonEmpty(e.location) ? ` · ${e.location}` : ""}
                  {" · "}
                  <span style={{ color: "#999" }}>{dateRange(e.start, e.end, e.current)}</span>
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </section>
        )}
        {proj.length > 0 && (
          <section style={{ marginTop: 14 }}>
            <h2 style={head}>Projects</h2>
            {proj.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 10.5 }}>{p.name}</strong>
                {nonEmpty(p.description) && (
                  <p style={{ margin: "1px 0 2px" }}>{p.description}</p>
                )}
                <Bullets items={p.bullets} />
              </div>
            ))}
          </section>
        )}
      </main>
      <aside style={{ width: "32%", background: "#fff7ed", padding: "14mm 8mm" }}>
        <div>
          {contactLine(data).map((c) => (
            <p key={c} style={{ margin: "0 0 5px", fontSize: 9, wordBreak: "break-word" }}>
              {c}
            </p>
          ))}
        </div>
        {skills.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ ...head, fontSize: 11 }}>Skills</h2>
            {skills.map((s) => (
              <div key={s.id} style={{ marginBottom: 7 }}>
                {nonEmpty(s.category) && (
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 9.5 }}>{s.category}</p>
                )}
                <p style={{ margin: "1px 0 0", fontSize: 9.5 }}>{s.items}</p>
              </div>
            ))}
          </div>
        )}
        {edu.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ ...head, fontSize: 11 }}>Education</h2>
            {edu.map((e) => (
              <div key={e.id} style={{ marginBottom: 9 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 9.5 }}>
                  {e.degree} {e.field}
                </p>
                <p style={{ margin: "1px 0 0", fontSize: 9.5 }}>{e.school}</p>
                <p style={{ margin: "1px 0 0", fontSize: 9, color: "#999" }}>
                  {dateRange(e.start, e.end, false)}
                </p>
                {nonEmpty(e.details) && (
                  <p style={{ margin: "1px 0 0", fontSize: 9 }}>{e.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

// ─── Onyx: dark navy header band, classic serif body ────────────────────────
function Onyx({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#0f172a",
    borderBottom: "1.5px solid #0f172a",
    paddingBottom: 3,
    margin: "14px 0 6px",
  };
  return (
    <div style={{ ...PAGE, fontFamily: "'Inter', Arial, sans-serif", fontSize: 10.5 }}>
      <header style={{ background: "#0f172a", color: "#fff", padding: "14mm 14mm 10mm" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#cbd5e1" }}>{data.basics.title}</p>
        )}
        <p style={{ margin: "8px 0 0", fontSize: 9.5, color: "#94a3b8" }}>
          {contactLine(data).join("    ·    ")}
        </p>
      </header>
      <main style={{ padding: "8mm 14mm 14mm" }}>
        {nonEmpty(data.summary) && (
          <>
            <h2 style={head}>Summary</h2>
            <p style={{ margin: 0, lineHeight: 1.55 }}>{data.summary}</p>
          </>
        )}
        {exp.length > 0 && (
          <>
            <h2 style={head}>Experience</h2>
            {exp.map((e) => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 11 }}>{e.role}</strong>
                  <span style={{ fontSize: 9.5, color: "#475569" }}>
                    {dateRange(e.start, e.end, e.current)}
                  </span>
                </div>
                <p style={{ margin: "1px 0 3px", fontSize: 10, color: "#0f172a", fontWeight: 600 }}>
                  {e.company}
                  {nonEmpty(e.location) ? ` · ${e.location}` : ""}
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </>
        )}
        {proj.length > 0 && (
          <>
            <h2 style={head}>Projects</h2>
            {proj.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <strong>{p.name}</strong>
                {nonEmpty(p.link) && (
                  <span style={{ fontSize: 9, color: "#475569", marginLeft: 6 }}>{p.link}</span>
                )}
                {nonEmpty(p.description) && (
                  <p style={{ margin: "1px 0 2px" }}>{p.description}</p>
                )}
                <Bullets items={p.bullets} />
              </div>
            ))}
          </>
        )}
        {edu.length > 0 && (
          <>
            <h2 style={head}>Education</h2>
            {edu.map((e) => (
              <div key={e.id} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>
                    {e.degree} {e.field} · {e.school}
                  </strong>
                  <span style={{ fontSize: 9.5, color: "#475569" }}>
                    {dateRange(e.start, e.end, false)}
                  </span>
                </div>
                {nonEmpty(e.details) && <p style={{ margin: "1px 0 0" }}>{e.details}</p>}
              </div>
            ))}
          </>
        )}
        {skills.length > 0 && (
          <>
            <h2 style={head}>Skills</h2>
            {skills.map((s) => (
              <p key={s.id} style={{ margin: "0 0 3px" }}>
                {nonEmpty(s.category) && <strong>{s.category}: </strong>}
                {s.items}
              </p>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Indus: traditional Indian format, formal serif, centered ──────────────
function Indus({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#1a1a1a",
    background: "#f3f4f6",
    padding: "3px 6px",
    margin: "14px 0 6px",
    borderLeft: "3px solid #1a1a1a",
  };
  return (
    <div style={{ ...PAGE, padding: "16mm 16mm", fontFamily: "'Times New Roman', Georgia, serif", fontSize: 10.5 }}>
      <header style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "2px 0 0", fontSize: 11.5, fontStyle: "italic" }}>{data.basics.title}</p>
        )}
        <p style={{ margin: "5px 0 0", fontSize: 9.5 }}>{contactLine(data).join("  |  ")}</p>
      </header>
      <hr style={{ border: "none", borderTop: "1.5px double #1a1a1a", margin: "8px 0 0" }} />
      {nonEmpty(data.summary) && (
        <>
          <h2 style={head}>Career Objective</h2>
          <p style={{ margin: 0, lineHeight: 1.55 }}>{data.summary}</p>
        </>
      )}
      {edu.length > 0 && (
        <>
          <h2 style={head}>Educational Qualifications</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {e.degree} {e.field}, {e.school}
                </strong>
                <span style={{ fontSize: 9.5 }}>{dateRange(e.start, e.end, false)}</span>
              </div>
              {nonEmpty(e.details) && <p style={{ margin: "1px 0 0" }}>{e.details}</p>}
            </div>
          ))}
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Professional Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {e.role}, {e.company}
                </strong>
                <span style={{ fontSize: 9.5 }}>{dateRange(e.start, e.end, e.current)}</span>
              </div>
              {nonEmpty(e.location) && (
                <p style={{ margin: "1px 0 2px", fontSize: 9.5, fontStyle: "italic" }}>{e.location}</p>
              )}
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 7 }}>
              <strong>{p.name}</strong>
              {nonEmpty(p.description) && <p style={{ margin: "1px 0 2px" }}>{p.description}</p>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>Skills</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 3px" }}>
              {nonEmpty(s.category) && <strong>{s.category}: </strong>}
              {s.items}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Banner: bold colour band with reversed-out name ────────────────────────
function Banner({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#b45309",
    margin: "12px 0 5px",
  };
  return (
    <div style={{ ...PAGE, fontFamily: "'Inter', Arial, sans-serif", fontSize: 10.5 }}>
      <header
        style={{
          background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          color: "#fff",
          padding: "12mm 14mm",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600 }}>{data.basics.title}</p>
        )}
        <p style={{ margin: "10px 0 0", fontSize: 9.5, opacity: 0.92 }}>
          {contactLine(data).join("   ·   ")}
        </p>
      </header>
      <main style={{ padding: "10mm 14mm 14mm" }}>
        {nonEmpty(data.summary) && (
          <>
            <h2 style={head}>About</h2>
            <p style={{ margin: 0, lineHeight: 1.55 }}>{data.summary}</p>
          </>
        )}
        {exp.length > 0 && (
          <>
            <h2 style={head}>Experience</h2>
            {exp.map((e) => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 11 }}>{e.role}</strong>
                  <span style={{ fontSize: 9.5, color: "#78716c" }}>
                    {dateRange(e.start, e.end, e.current)}
                  </span>
                </div>
                <p style={{ margin: "1px 0 3px", fontSize: 10, color: "#b45309", fontWeight: 600 }}>
                  {e.company}
                  {nonEmpty(e.location) ? ` · ${e.location}` : ""}
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </>
        )}
        {proj.length > 0 && (
          <>
            <h2 style={head}>Projects</h2>
            {proj.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <strong>{p.name}</strong>
                {nonEmpty(p.description) && <p style={{ margin: "1px 0 2px" }}>{p.description}</p>}
                <Bullets items={p.bullets} />
              </div>
            ))}
          </>
        )}
        {edu.length > 0 && (
          <>
            <h2 style={head}>Education</h2>
            {edu.map((e) => (
              <div key={e.id} style={{ marginBottom: 5 }}>
                <strong>{e.degree} {e.field}</strong>
                <span> — {e.school} </span>
                <span style={{ fontSize: 9.5, color: "#78716c" }}>
                  {dateRange(e.start, e.end, false)}
                </span>
              </div>
            ))}
          </>
        )}
        {skills.length > 0 && (
          <>
            <h2 style={head}>Skills</h2>
            {skills.map((s) => (
              <p key={s.id} style={{ margin: "0 0 3px" }}>
                {nonEmpty(s.category) && <strong>{s.category}: </strong>}
                {s.items}
              </p>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Consulting: MBB-style, dense, neutral grays ────────────────────────────
function Consulting({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  const head: React.CSSProperties = {
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#374151",
    background: "#f3f4f6",
    padding: "3px 8px",
    margin: "10px 0 5px",
  };
  return (
    <div style={{ ...PAGE, padding: "14mm 16mm", fontFamily: "'Inter', Arial, sans-serif", fontSize: 9.75 }}>
      <header style={{ borderBottom: "1.5px solid #111827", paddingBottom: 6 }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "#111827" }}>
          {data.basics.name || "Your Name"}
        </h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          {nonEmpty(data.basics.title) && (
            <span style={{ fontSize: 10.5, color: "#4b5563", fontWeight: 500 }}>
              {data.basics.title}
            </span>
          )}
          <span style={{ fontSize: 9, color: "#6b7280" }}>{contactLine(data).join("  ·  ")}</span>
        </div>
      </header>
      {edu.length > 0 && (
        <>
          <h2 style={head}>Education</h2>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{e.school}</strong>
                <span style={{ fontSize: 9, color: "#6b7280" }}>
                  {dateRange(e.start, e.end, false)}
                </span>
              </div>
              <p style={{ margin: "1px 0 0" }}>
                {e.degree} {e.field}
                {nonEmpty(e.details) ? ` · ${e.details}` : ""}
              </p>
            </div>
          ))}
        </>
      )}
      {exp.length > 0 && (
        <>
          <h2 style={head}>Professional Experience</h2>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {e.company}
                  {nonEmpty(e.location) ? `, ${e.location}` : ""}
                </strong>
                <span style={{ fontSize: 9, color: "#6b7280" }}>
                  {dateRange(e.start, e.end, e.current)}
                </span>
              </div>
              <p style={{ margin: "1px 0 2px", fontStyle: "italic" }}>{e.role}</p>
              <Bullets items={e.bullets} />
            </div>
          ))}
        </>
      )}
      {proj.length > 0 && (
        <>
          <h2 style={head}>Selected Projects</h2>
          {proj.map((p) => (
            <div key={p.id} style={{ marginBottom: 6 }}>
              <strong>{p.name}</strong>
              {nonEmpty(p.description) && <span> — {p.description}</span>}
              <Bullets items={p.bullets} />
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <h2 style={head}>Skills &amp; Additional</h2>
          {skills.map((s) => (
            <p key={s.id} style={{ margin: "0 0 2px" }}>
              {nonEmpty(s.category) && <strong>{s.category}: </strong>}
              {s.items}
            </p>
          ))}
        </>
      )}
    </div>
  );
}

export function ResumeTemplate({ id, data }: { id: TemplateId; data: ResumeData }) {
  switch (id) {
    case "classic":
      return <Classic data={data} />;
    case "compact":
      return <Compact data={data} />;
    case "minimal":
      return <Minimal data={data} />;
    case "technical":
      return <Technical data={data} />;
    case "harvard":
      return <Harvard data={data} />;
    case "marketing":
      return <Marketing data={data} />;
    case "executive":
      return <Executive data={data} />;
    case "creative":
      return <Creative data={data} />;
    case "onyx":
      return <Onyx data={data} />;
    case "indus":
      return <Indus data={data} />;
    case "banner":
      return <Banner data={data} />;
    case "consulting":
      return <Consulting data={data} />;
    case "harvard":
      return <Harvard data={data} />;
    default:
      return <Harvard data={data} />;
  }
}
