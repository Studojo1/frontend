// JRS resume editor — left panel. Controlled component over ResumeData.
import { useState } from "react";
import {
  type ResumeData,
  type ExperienceItem,
  type EducationItem,
  type ProjectItem,
  type SkillGroup,
  emptyExperience,
  emptyEducation,
  emptyProject,
  emptySkillGroup,
} from "~/lib/jrs/types";

const inputCls =
  "w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white";
const labelCls = "block text-xs font-semibold text-neutral-600 mb-1";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function Section({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="border-b border-neutral-200 py-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 font-bold text-neutral-900"
        >
          <span className={`text-xs transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          {title}
        </button>
        {onAdd && open && (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-semibold text-violet-600 hover:text-violet-800"
          >
            + {addLabel}
          </button>
        )}
      </div>
      {open && <div className="space-y-3">{children}</div>}
    </section>
  );
}

function ItemCard({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-3">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 text-xs text-neutral-400 hover:text-rose-600"
        aria-label="Remove"
      >
        ✕ Remove
      </button>
      {children}
    </div>
  );
}

export function Editor({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (d: ResumeData) => void;
}) {
  const patch = (p: Partial<ResumeData>) => onChange({ ...data, ...p });
  const setBasics = (k: keyof ResumeData["basics"], v: string) =>
    patch({ basics: { ...data.basics, [k]: v } });

  // Experience
  const updExp = (id: string, p: Partial<ExperienceItem>) =>
    patch({ experience: data.experience.map((e) => (e.id === id ? { ...e, ...p } : e)) });
  const addExp = () => patch({ experience: [...data.experience, emptyExperience()] });
  const rmExp = (id: string) =>
    patch({ experience: data.experience.filter((e) => e.id !== id) });

  // Education
  const updEdu = (id: string, p: Partial<EducationItem>) =>
    patch({ education: data.education.map((e) => (e.id === id ? { ...e, ...p } : e)) });
  const addEdu = () => patch({ education: [...data.education, emptyEducation()] });
  const rmEdu = (id: string) =>
    patch({ education: data.education.filter((e) => e.id !== id) });

  // Projects
  const updProj = (id: string, p: Partial<ProjectItem>) =>
    patch({ projects: data.projects.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  const addProj = () => patch({ projects: [...data.projects, emptyProject()] });
  const rmProj = (id: string) =>
    patch({ projects: data.projects.filter((x) => x.id !== id) });

  // Skills
  const updSkill = (id: string, p: Partial<SkillGroup>) =>
    patch({ skills: data.skills.map((s) => (s.id === id ? { ...s, ...p } : s)) });
  const addSkill = () => patch({ skills: [...data.skills, emptySkillGroup()] });
  const rmSkill = (id: string) => patch({ skills: data.skills.filter((s) => s.id !== id) });

  return (
    <div className="divide-y divide-neutral-100">
      {/* Contact */}
      <Section title="Contact">
        <Field label="Full name" value={data.basics.name} onChange={(v) => setBasics("name", v)} placeholder="Aanya Sharma" />
        <Field label="Headline / title" value={data.basics.title} onChange={(v) => setBasics("title", v)} placeholder="Computer Science Student" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" value={data.basics.email} onChange={(v) => setBasics("email", v)} placeholder="you@email.com" />
          <Field label="Phone" value={data.basics.phone} onChange={(v) => setBasics("phone", v)} placeholder="+91 ..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Location" value={data.basics.location} onChange={(v) => setBasics("location", v)} placeholder="Bengaluru, India" />
          <Field label="Website" value={data.basics.website} onChange={(v) => setBasics("website", v)} placeholder="yoursite.dev" />
        </div>
        <Field label="LinkedIn" value={data.basics.linkedin} onChange={(v) => setBasics("linkedin", v)} placeholder="linkedin.com/in/you" />
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <textarea
          value={data.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          rows={4}
          placeholder="A 2-3 line pitch — who you are, what you're looking for."
          className={inputCls}
        />
      </Section>

      {/* Experience */}
      <Section title="Experience" onAdd={addExp} addLabel="Add role">
        {data.experience.length === 0 && (
          <p className="text-xs text-neutral-400">No roles yet. Click "Add role".</p>
        )}
        {data.experience.map((e) => (
          <ItemCard key={e.id} onRemove={() => rmExp(e.id)}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role" value={e.role} onChange={(v) => updExp(e.id, { role: v })} placeholder="Software Engineering Intern" />
              <Field label="Company" value={e.company} onChange={(v) => updExp(e.id, { company: v })} placeholder="Nimbus Labs" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Start" value={e.start} onChange={(v) => updExp(e.id, { start: v })} placeholder="May 2025" />
              <Field label="End" value={e.end} onChange={(v) => updExp(e.id, { end: v })} placeholder="Aug 2025" />
              <Field label="Location" value={e.location} onChange={(v) => updExp(e.id, { location: v })} placeholder="Remote" />
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={e.current}
                onChange={(ev) => updExp(e.id, { current: ev.target.checked })}
              />
              I currently work here
            </label>
            <div>
              <label className={labelCls}>Bullets (one per line)</label>
              <textarea
                value={e.bullets.join("\n")}
                onChange={(ev) => updExp(e.id, { bullets: ev.target.value.split("\n") })}
                rows={4}
                placeholder="Built X that did Y, improving Z by N%."
                className={inputCls}
              />
            </div>
          </ItemCard>
        ))}
      </Section>

      {/* Projects */}
      <Section title="Projects" onAdd={addProj} addLabel="Add project">
        {data.projects.length === 0 && (
          <p className="text-xs text-neutral-400">No projects yet. Click "Add project".</p>
        )}
        {data.projects.map((p) => (
          <ItemCard key={p.id} onRemove={() => rmProj(p.id)}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" value={p.name} onChange={(v) => updProj(p.id, { name: v })} placeholder="SplitWise Clone" />
              <Field label="Link" value={p.link} onChange={(v) => updProj(p.id, { link: v })} placeholder="github.com/..." />
            </div>
            <Field label="One-line description" value={p.description} onChange={(v) => updProj(p.id, { description: v })} placeholder="Group expense tracker." />
            <div>
              <label className={labelCls}>Bullets (one per line)</label>
              <textarea
                value={p.bullets.join("\n")}
                onChange={(ev) => updProj(p.id, { bullets: ev.target.value.split("\n") })}
                rows={3}
                className={inputCls}
              />
            </div>
          </ItemCard>
        ))}
      </Section>

      {/* Education */}
      <Section title="Education" onAdd={addEdu} addLabel="Add school">
        {data.education.length === 0 && (
          <p className="text-xs text-neutral-400">No education yet. Click "Add school".</p>
        )}
        {data.education.map((e) => (
          <ItemCard key={e.id} onRemove={() => rmEdu(e.id)}>
            <Field label="School" value={e.school} onChange={(v) => updEdu(e.id, { school: v })} placeholder="RV College of Engineering" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Degree" value={e.degree} onChange={(v) => updEdu(e.id, { degree: v })} placeholder="B.E." />
              <Field label="Field" value={e.field} onChange={(v) => updEdu(e.id, { field: v })} placeholder="Computer Science" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Start" value={e.start} onChange={(v) => updEdu(e.id, { start: v })} placeholder="2022" />
              <Field label="End" value={e.end} onChange={(v) => updEdu(e.id, { end: v })} placeholder="2026" />
              <Field label="Location" value={e.location} onChange={(v) => updEdu(e.id, { location: v })} placeholder="Bengaluru" />
            </div>
            <Field label="Details (CGPA, coursework)" value={e.details} onChange={(v) => updEdu(e.id, { details: v })} placeholder="CGPA 8.7/10" />
          </ItemCard>
        ))}
      </Section>

      {/* Skills */}
      <Section title="Skills" onAdd={addSkill} addLabel="Add group">
        {data.skills.length === 0 && (
          <p className="text-xs text-neutral-400">No skills yet. Click "Add group".</p>
        )}
        {data.skills.map((s) => (
          <ItemCard key={s.id} onRemove={() => rmSkill(s.id)}>
            <Field label="Category" value={s.category} onChange={(v) => updSkill(s.id, { category: v })} placeholder="Languages" />
            <Field label="Items (comma-separated)" value={s.items} onChange={(v) => updSkill(s.id, { items: v })} placeholder="TypeScript, Python, SQL" />
          </ItemCard>
        ))}
      </Section>
    </div>
  );
}
