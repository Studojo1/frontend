export type Bullet = {
  text: string;
  has_metric?: boolean;
  action_verb?: string | null;
};

export type Contact = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
};

export type Target = {
  role?: string | null;
  industry?: string | null;
  experience_band?: string | null;
  region?: string | null;
};

export type ExperienceItem = {
  company?: string | null;
  title?: string | null;
  location?: string | null;
  start?: string | null;
  end?: string | null;
  dates?: string | null;
  is_current?: boolean;
  bullets: Bullet[];
};

export type EducationItem = {
  institution?: string | null;
  degree?: string | null;
  field?: string | null;
  start?: string | null;
  end?: string | null;
  dates?: string | null;
  gpa?: string | null;
  honors?: string[];
};

export type ProjectItem = {
  name?: string | null;
  link?: string | null;
  tech?: string[];
  bullets: Bullet[];
};

export type Skills = {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
};

export type ResumeDoc = {
  contact: Contact;
  target: Target;
  summary?: string | null;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: Skills;
  awards?: string[];
  volunteer?: string[];
  publications?: string[];
};

export type Ats = {
  score: number;
  keyword_matches: string[];
  missing_keywords: string[];
  suggestions: string[];
};

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: Record<string, unknown> | null;
  created_at?: string;
};

export type StepInfo = {
  step_id: string;
  prompt: string;
  kind: "text" | "mcq" | "confirm" | "done";
  options: string[];
  is_complete: boolean;
};

export type RsbSession = {
  id: string;
  target_role: string;
  target_industry: string | null;
  experience_band: string | null;
  region: string | null;
  status: string;
  chat_step: string;
  resume_doc: ResumeDoc;
  ats: Ats;
  updated_at: string | null;
};

export type ChatResponse = {
  session: RsbSession;
  assistant_message: string;
  next_step: StepInfo;
};
