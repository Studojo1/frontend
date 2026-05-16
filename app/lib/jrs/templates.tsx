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

const PAGE: React.CSSProperties = {
  width: "210mm",
  minHeight: "297mm",
  background: "#fff",
  boxSizing: "border-box",
  color: "#1a1a1a",
};

// ─── Modern: accent sidebar + main column ──────────────────────────────────
function Modern({ data }: { data: ResumeData }) {
  const exp = data.experience.filter(expHas);
  const edu = data.education.filter(eduHas);
  const proj = data.projects.filter(projHas);
  const skills = data.skills.filter((s) => nonEmpty(s.items));
  return (
    <div style={{ ...PAGE, display: "flex", fontFamily: "'Inter', Arial, sans-serif", fontSize: 10.5 }}>
      <aside style={{ width: "33%", background: "#1e1b4b", color: "#e9e7ff", padding: "14mm 8mm" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.1, margin: 0, color: "#fff" }}>
          {data.basics.name || "Your Name"}
        </h1>
        {nonEmpty(data.basics.title) && (
          <p style={{ fontSize: 11, margin: "4px 0 0", color: "#c4b5fd" }}>{data.basics.title}</p>
        )}
        <div style={{ marginTop: 18 }}>
          {contactLine(data).map((c) => (
            <p key={c} style={{ margin: "0 0 6px", fontSize: 9.5, wordBreak: "break-word" }}>
              {c}
            </p>
          ))}
        </div>
        {skills.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <h2 style={sidebarHead}>Skills</h2>
            {skills.map((s) => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                {nonEmpty(s.category) && (
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 9.5, color: "#fff" }}>{s.category}</p>
                )}
                <p style={{ margin: "2px 0 0", fontSize: 9.5 }}>{s.items}</p>
              </div>
            ))}
          </div>
        )}
        {edu.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <h2 style={sidebarHead}>Education</h2>
            {edu.map((e) => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 9.5, color: "#fff" }}>
                  {e.degree} {e.field}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 9.5 }}>{e.school}</p>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: "#c4b5fd" }}>
                  {dateRange(e.start, e.end, false)}
                </p>
                {nonEmpty(e.details) && (
                  <p style={{ margin: "2px 0 0", fontSize: 9 }}>{e.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>
      <main style={{ flex: 1, padding: "14mm 10mm" }}>
        {nonEmpty(data.summary) && (
          <section style={{ marginBottom: 14 }}>
            <h2 style={mainHead("#1e1b4b")}>Summary</h2>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{data.summary}</p>
          </section>
        )}
        {exp.length > 0 && (
          <section style={{ marginBottom: 14 }}>
            <h2 style={mainHead("#1e1b4b")}>Experience</h2>
            {exp.map((e) => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 11 }}>{e.role}</strong>
                  <span style={{ fontSize: 9.5, color: "#555" }}>
                    {dateRange(e.start, e.end, e.current)}
                  </span>
                </div>
                <p style={{ margin: "1px 0 4px", fontSize: 10, color: "#4338ca" }}>
                  {e.company}
                  {nonEmpty(e.location) ? ` · ${e.location}` : ""}
                </p>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </section>
        )}
        {proj.length > 0 && (
          <section>
            <h2 style={mainHead("#1e1b4b")}>Projects</h2>
            {proj.map((p) => (
              <div key={p.id} style={{ marginBottom: 9 }}>
                <strong style={{ fontSize: 10.5 }}>{p.name}</strong>
                {nonEmpty(p.link) && (
                  <span style={{ fontSize: 9, color: "#4338ca", marginLeft: 6 }}>{p.link}</span>
                )}
                {nonEmpty(p.description) && (
                  <p style={{ margin: "2px 0 3px", fontSize: 10 }}>{p.description}</p>
                )}
                <Bullets items={p.bullets} />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
const sidebarHead: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 1,
  margin: "0 0 8px",
  color: "#a78bfa",
};
function mainHead(color: string): React.CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
    color,
    margin: "0 0 6px",
    borderBottom: `2px solid ${color}`,
    paddingBottom: 2,
  };
}

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
    case "modern":
    default:
      return <Modern data={data} />;
  }
}
