/**
 * AI Job Risk Engine, deterministic, zero API calls.
 * Data sourced from: Oxford/Frey & Osborne automation probabilities,
 * McKinsey Global Institute, Goldman Sachs (2023), WEF Future of Jobs.
 */

export interface Pivot {
  role: string;
  why: string;
  skills: string[];
  timeline: string;
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
}

export interface JobRisk {
  title: string;
  aliases: string[];
  risk_pct: number;
  timeline_years: number; // 99 = "never"
  risk_drivers: string[];
  human_edges: string[];
  pivots: Pivot[];
}

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface AnalysisResult {
  job_input: string;
  matched_title: string;
  risk_pct: number;
  timeline_years: number;
  risk_level: RiskLevel;
  verdict: string;
  risk_drivers: string[];
  human_edges: string[];
  pivots: Pivot[];
  confidence: "high" | "medium" | "low";
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function getRiskLevel(pct: number): RiskLevel {
  if (pct >= 75) return "critical";
  if (pct >= 50) return "high";
  if (pct >= 25) return "medium";
  return "low";
}

export function getVerdict(title: string, pct: number, years: number): string {
  const t = title;
  if (years >= 99) return `${t}s are one of the few roles AI will actively create more demand for, not replace.`;
  if (pct >= 75) return `${t}s are in AI's crosshairs, the window to pivot is closing fast.`;
  if (pct >= 50) return `AI is already doing large parts of what ${t}s do. Adaptation is urgent.`;
  if (pct >= 25) return `AI will reshape the ${t} role significantly, but won't eliminate it.`;
  return `The ${t} role is remarkably resilient, AI will assist here, not replace.`;
}

// ── Job database ───────────────────────────────────────────────────────────

export const JOB_DATA: JobRisk[] = [
  // ── CRITICAL RISK ─────────────────────────────────────────────────────
  {
    title: "Data Entry Clerk",
    aliases: ["data entry", "data entry operator", "clerk", "data clerk", "data processor", "records clerk"],
    risk_pct: 95,
    timeline_years: 2,
    risk_drivers: [
      "LLMs can extract, validate, and input structured data from any source with near-zero error rates",
      "RPA tools have automated 90%+ of repetitive form-filling and spreadsheet work since 2021",
      "OCR + AI now processes documents faster and more accurately than any human team",
      "Cloud platforms like UiPath and Automation Anywhere have commoditised this entirely",
    ],
    human_edges: [
      "Handling deeply ambiguous or context-dependent data that requires judgment calls",
      "Liaising with clients to resolve data discrepancies that require explanation",
      "Setting up and supervising the automation systems themselves",
    ],
    pivots: [
      {
        role: "RPA Developer",
        why: "You already understand the workflows, now learn to build the bots that automate them.",
        skills: ["UiPath", "Automation Anywhere", "Python basics", "Process mapping"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Data Analyst",
        why: "Move from inputting data to interpreting it, a skill AI can assist but not replace.",
        skills: ["Excel/Google Sheets", "SQL basics", "Power BI or Tableau", "Data storytelling"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Operations Coordinator",
        why: "Your process knowledge is valuable, coordinate the humans and tools instead of doing manual work.",
        skills: ["Project management basics", "Notion or Airtable", "Stakeholder communication"],
        timeline: "2-4 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "Telemarketer",
    aliases: ["telesales", "cold caller", "inside sales rep", "sales caller", "outbound sales", "telephone sales"],
    risk_pct: 92,
    timeline_years: 2,
    risk_drivers: [
      "AI voice agents like Bland AI and Retell can run outbound calls indistinguishably from humans",
      "LLM-powered scripts personalise pitches in real time based on CRM data",
      "Automated dialers with AI qualification filters already handle millions of calls daily",
      "Regulation is pushing companies toward AI to reduce compliance liability from human agents",
    ],
    human_edges: [
      "Complex consultative sales requiring deep product knowledge and negotiation",
      "High-value enterprise deals where relationship and trust matter",
      "Managing and training the AI systems themselves",
    ],
    pivots: [
      {
        role: "Account Executive (B2B)",
        why: "Move upmarket, enterprise deals require human relationship-building that AI can't replicate.",
        skills: ["Consultative selling", "Salesforce CRM", "Negotiation", "LinkedIn Sales Navigator"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Sales Ops Analyst",
        why: "Your knowledge of what converts becomes valuable when managing AI-driven sales pipelines.",
        skills: ["CRM administration", "Sales analytics", "Excel/SQL", "Process optimisation"],
        timeline: "3-5 months",
        difficulty: 2,
      },
      {
        role: "Customer Success Manager",
        why: "Retaining existing customers needs empathy and relationship skills, harder for AI to replicate.",
        skills: ["Relationship management", "HubSpot or Gainsight", "Communication", "Problem-solving"],
        timeline: "2-4 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "Customer Service Representative",
    aliases: [
      "customer support", "support agent", "help desk", "customer care", "call center agent",
      "customer service agent", "support rep", "service desk", "cs agent", "customer support agent",
    ],
    risk_pct: 85,
    timeline_years: 3,
    risk_drivers: [
      "GPT-4 class models resolve 70%+ of tier-1 support tickets without human involvement",
      "Sentiment analysis lets AI escalate exactly the right cases, reducing the role of human triage",
      "Self-service AI portals have cut inbound volumes by 40-60% at large SaaS companies",
      "Cost pressure: AI handles ~$0.10/interaction vs $5-15 for a human agent",
    ],
    human_edges: [
      "De-escalating genuinely distressed or vulnerable customers in crisis",
      "Complex multi-product issues requiring cross-functional judgment",
      "Quality assurance and training AI support systems",
    ],
    pivots: [
      {
        role: "Customer Success Manager",
        why: "Your deep knowledge of customer pain points is exactly what CSM teams need.",
        skills: ["Account management", "Churn analysis", "Gainsight or Totango", "Stakeholder communication"],
        timeline: "2-5 months",
        difficulty: 1,
      },
      {
        role: "AI Trainer / RLHF Specialist",
        why: "Companies urgently need people who can label and improve AI support conversations.",
        skills: ["Conversation annotation", "Quality rubrics", "Basic prompt engineering", "Data labelling tools"],
        timeline: "1-3 months",
        difficulty: 1,
      },
      {
        role: "UX Researcher",
        why: "Your frontline understanding of user frustrations is gold for product teams.",
        skills: ["User interview techniques", "Usability testing", "Affinity mapping", "Figma basics"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Cashier",
    aliases: ["checkout operator", "retail cashier", "store cashier", "checkout assistant", "till operator"],
    risk_pct: 82,
    timeline_years: 4,
    risk_drivers: [
      "Automated checkout is now standard, Walmart, Amazon, and Tesco have deployed at massive scale",
      "Computer vision systems handle loss prevention better than human observation",
      "Mobile payment and scan-and-go eliminate the checkout interaction entirely",
      "Labour costs make automation ROI-positive within 18 months at most retail scales",
    ],
    human_edges: [
      "Age verification and regulated product sales requiring human judgment",
      "Handling exceptions, complaints, and situations requiring empathy",
      "Maintaining customer loyalty in premium or high-touch retail environments",
    ],
    pivots: [
      {
        role: "Retail Team Leader / Supervisor",
        why: "Managing automated systems and the remaining human staff requires exactly your floor experience.",
        skills: ["Team management", "Inventory systems", "Loss prevention basics", "Staff scheduling"],
        timeline: "3-6 months",
        difficulty: 1,
      },
      {
        role: "E-commerce Operations Coordinator",
        why: "Retail knowledge translates directly to managing online order fulfilment and returns.",
        skills: ["Shopify or WooCommerce", "Logistics coordination", "Customer communication", "Inventory management"],
        timeline: "3-5 months",
        difficulty: 2,
      },
      {
        role: "Visual Merchandiser",
        why: "Physical retail still needs humans who understand product and customer behaviour.",
        skills: ["Store layout principles", "Trend awareness", "Brand guidelines", "Display design"],
        timeline: "2-4 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "Tax Preparer",
    aliases: ["tax consultant", "tax advisor", "tax filing", "tax preparer", "income tax preparer"],
    risk_pct: 80,
    timeline_years: 3,
    risk_drivers: [
      "TurboTax and H&R Block's AI already handles 90% of standard individual returns end-to-end",
      "LLMs can now interpret complex tax code and apply it to specific scenarios",
      "Government APIs are enabling direct filing systems that bypass preparers entirely",
      "Rule-based tax law is exactly the type of structured knowledge AI learns best",
    ],
    human_edges: [
      "Complex cross-border, multi-entity, or business tax situations requiring holistic judgment",
      "Client relationships and advisory conversations about tax strategy",
      "Representing clients in disputes, audits, and negotiations with tax authorities",
    ],
    pivots: [
      {
        role: "Tax Strategist / Advisor",
        why: "Move from compliance to strategy, advising on tax planning that AI can't personalise.",
        skills: ["Advanced tax planning", "Business structures", "Financial planning basics", "Client advisory skills"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "Financial Planner",
        why: "Tax knowledge is a core part of holistic financial planning, a human-led service.",
        skills: ["Financial planning certification (CFP)", "Investment basics", "Retirement planning", "Client communication"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "Bookkeeper → Controller",
        why: "Manage the broader financial picture for small businesses, more AI-proof than pure tax filing.",
        skills: ["QuickBooks or Xero", "Management accounts", "Cash flow forecasting", "Financial reporting"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Bookkeeper",
    aliases: [
      "accounts assistant", "accounts clerk", "junior accountant", "billing clerk",
      "accounts payable", "accounts receivable", "bookkeeper", "payroll clerk",
    ],
    risk_pct: 78,
    timeline_years: 3,
    risk_drivers: [
      "QuickBooks AI and Xero's auto-categorisation handles 80%+ of transaction coding automatically",
      "Bank feeds and receipt scanning have eliminated manual data entry from most bookkeeping",
      "AI reconciliation tools catch discrepancies faster and more accurately than human review",
      "The entire compliance/reporting cycle is being automated by accounting platforms",
    ],
    human_edges: [
      "Advising clients on financial decisions and interpreting what numbers mean for their business",
      "Managing complex multi-entity structures with unusual transactions",
      "Building client relationships and acting as a trusted finance partner",
    ],
    pivots: [
      {
        role: "Management Accountant",
        why: "Move from recording transactions to analysing them, AI handles the former, not the latter.",
        skills: ["Management accounting (CIMA)", "Financial modelling", "Excel/Power BI", "Business partnering"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "Finance Systems Administrator",
        why: "Someone has to configure and maintain the AI accounting tools, your domain knowledge is perfect.",
        skills: ["QuickBooks/Xero admin", "System integrations", "Data migration", "User training"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Virtual CFO (for SMEs)",
        why: "Small businesses will always need human financial guidance, package your knowledge as advisory.",
        skills: ["Cash flow management", "Financial strategy", "Budgeting", "Investor-ready reporting"],
        timeline: "6-18 months",
        difficulty: 3,
      },
    ],
  },
  {
    title: "Loan Officer",
    aliases: ["mortgage officer", "lending officer", "credit officer", "mortgage advisor", "loan processor", "underwriter"],
    risk_pct: 76,
    timeline_years: 4,
    risk_drivers: [
      "ML credit scoring models outperform human underwriters on default prediction by 15-20%",
      "Automated decisioning handles 80%+ of standard consumer loan applications in minutes",
      "Open banking data gives AI real-time financial snapshots that human assessors can't match",
      "Regulatory pressure for consistency and auditability favours algorithmic over human decisions",
    ],
    human_edges: [
      "Complex commercial lending requiring judgement on business viability and character",
      "Relationship banking for high-net-worth clients who demand personalised service",
      "Explaining declined applications and advising customers on improving their profile",
    ],
    pivots: [
      {
        role: "Commercial Relationship Manager",
        why: "Business banking is far more relationship-driven, your credit knowledge is a genuine edge.",
        skills: ["Business finance analysis", "Relationship management", "Commercial credit", "Stakeholder negotiation"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Credit Risk Analyst",
        why: "Oversee the AI models, validate, challenge, and improve automated credit decisions.",
        skills: ["Credit modelling", "SQL/Python basics", "Statistical analysis", "Risk frameworks"],
        timeline: "5-9 months",
        difficulty: 3,
      },
      {
        role: "Mortgage Broker (Independent)",
        why: "Independent brokers add value through market knowledge and advocacy, AI can't replicate that.",
        skills: ["Whole-of-market knowledge", "Client advisory", "CeMAP or equivalent", "Business development"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },

  // ── HIGH RISK ──────────────────────────────────────────────────────────
  {
    title: "Accountant",
    aliases: [
      "chartered accountant", "ca", "cpa", "auditor", "finance analyst",
      "financial accountant", "management accountant", "cost accountant",
    ],
    risk_pct: 68,
    timeline_years: 5,
    risk_drivers: [
      "AI audit tools from EY and Deloitte already test entire ledgers rather than statistical samples",
      "LLMs can draft standard audit reports, management accounts, and board packs from structured data",
      "Real-time accounting platforms are eliminating the year-end crunch that employed thousands",
      "Regulatory standardisation is making compliance work increasingly algorithmic",
    ],
    human_edges: [
      "Complex judgement calls on accounting treatments for unusual transactions",
      "Advising on business strategy, tax planning, and capital allocation",
      "Maintaining client trust and acting as a sounding board for major financial decisions",
      "Forensic accounting and fraud investigation requiring adversarial thinking",
    ],
    pivots: [
      {
        role: "CFO / Finance Director",
        why: "Strategic leadership of finance will always need a human, your technical base is perfect.",
        skills: ["Financial strategy", "Board communication", "M&A basics", "Leadership"],
        timeline: "2-5 years (progressive)",
        difficulty: 3,
      },
      {
        role: "FP&A Analyst",
        why: "Forward-looking financial planning and business partnering is where humans add most value.",
        skills: ["Financial modelling", "Business partnering", "Power BI/Tableau", "Scenario planning"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Sustainability Reporting Specialist",
        why: "ESG reporting is a fast-growing, under-automated area where accounting skills translate directly.",
        skills: ["ESG frameworks (GRI, TCFD)", "Carbon accounting", "Stakeholder reporting", "Assurance basics"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Paralegal",
    aliases: ["legal assistant", "legal secretary", "law clerk", "junior lawyer", "legal researcher", "conveyancing assistant"],
    risk_pct: 65,
    timeline_years: 5,
    risk_drivers: [
      "Harvey AI and CoCounsel are already replacing first-draft legal research and contract review",
      "LLMs can summarise case law, flag risks in contracts, and draft standard legal documents",
      "eDiscovery AI reviews millions of documents faster and more accurately than human teams",
      "Commoditised legal work (wills, standard contracts, NDAs) is being automated to near-zero cost",
    ],
    human_edges: [
      "Court appearances, advocacy, and procedural matters requiring physical presence",
      "Client-facing work involving sensitive personal or business situations",
      "Novel legal arguments and creative case strategy",
      "Cross-jurisdictional complexity that requires judgement beyond pattern matching",
    ],
    pivots: [
      {
        role: "Legal Tech Specialist",
        why: "Law firms urgently need people who understand both the legal domain and the tools replacing it.",
        skills: ["Legal tech platforms (Clio, Harvey)", "Contract lifecycle management", "Process design", "Change management"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Compliance Officer",
        why: "Regulatory compliance needs human judgement, not just document review, your legal base is ideal.",
        skills: ["Regulatory frameworks", "Risk assessment", "Policy writing", "Stakeholder management"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Contract Manager",
        why: "Negotiating, managing, and strategising around contracts is more human than drafting them.",
        skills: ["Contract negotiation", "Commercial awareness", "Relationship management", "CLM software"],
        timeline: "3-6 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Content Writer",
    aliases: [
      "copywriter", "blog writer", "seo writer", "web content writer", "content creator",
      "technical writer", "content strategist", "ghostwriter", "article writer",
    ],
    risk_pct: 63,
    timeline_years: 3,
    risk_drivers: [
      "GPT-4 produces publication-ready first drafts in seconds at a fraction of the cost",
      "SEO content at scale is already dominated by AI, MediaMath, Jasper, and hundreds of others",
      "Commodity content (product descriptions, press releases, standard articles) is fully automated",
      "The price of generic content has collapsed to near zero, squeezing entry-level writers out",
    ],
    human_edges: [
      "Original reporting, investigative journalism, and content requiring lived experience",
      "Brand voice and editorial strategy that shapes a company's identity",
      "Long-form narrative and storytelling that builds genuine audience connection",
      "Content that requires accountability, bylined thought leadership, sensitive topics",
    ],
    pivots: [
      {
        role: "Content Strategist",
        why: "Move from production to strategy, deciding what to create, for whom, and why. AI can't do this.",
        skills: ["Content strategy frameworks", "Audience research", "Analytics (GA4)", "Editorial planning"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "AI Content Editor",
        why: "Companies now need expert humans to direct, edit, and QA AI-generated content at scale.",
        skills: ["Prompt engineering", "Editorial standards", "Brand voice guidelines", "AI tools (Claude, GPT)"],
        timeline: "1-3 months",
        difficulty: 1,
      },
      {
        role: "Journalist / Investigative Reporter",
        why: "Original sourcing, interviews, and accountability journalism remain entirely human domains.",
        skills: ["Source development", "Investigative techniques", "Data journalism", "Long-form narrative"],
        timeline: "6-12 months",
        difficulty: 3,
      },
    ],
  },
  {
    title: "Translator",
    aliases: [
      "interpreter", "language specialist", "localisation specialist", "localization specialist",
      "subtitler", "transcriber", "language translator",
    ],
    risk_pct: 62,
    timeline_years: 3,
    risk_drivers: [
      "DeepL and GPT-4 now match human-level quality for most language pairs in standard contexts",
      "Neural machine translation has reduced the market for commodity translation by over 50%",
      "Real-time AI interpretation is already deployed in international conferences and courts",
      "The volume of content needing translation is growing but the humans needed to translate it is falling",
    ],
    human_edges: [
      "Literary translation requiring cultural adaptation, wordplay, and emotional nuance",
      "Legal and medical translation where errors carry liability, still requires certified humans",
      "Simultaneous interpretation in high-stakes live settings requiring presence and adaptability",
      "Localisation strategy that goes beyond word-for-word to cultural relevance",
    ],
    pivots: [
      {
        role: "Localisation Manager",
        why: "Oversee the AI translation workflow and ensure cultural accuracy, human judgement required.",
        skills: ["Translation management systems", "Cultural consulting", "Project management", "AI post-editing"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Language Teacher / Tutor",
        why: "Teaching language is a deeply human interaction that AI supplements but cannot replace.",
        skills: ["Pedagogy", "TEFL/CELTA (if English)", "Online teaching platforms", "Curriculum design"],
        timeline: "2-4 months",
        difficulty: 1,
      },
      {
        role: "Cross-Cultural Consultant",
        why: "Helping companies expand internationally requires cultural intelligence beyond language.",
        skills: ["Market entry strategy", "Cultural training", "International business", "Stakeholder management"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Financial Analyst",
    aliases: [
      "investment analyst", "equity analyst", "research analyst", "credit analyst",
      "finance analyst", "valuation analyst", "investment banking analyst",
    ],
    risk_pct: 58,
    timeline_years: 5,
    risk_drivers: [
      "Bloomberg's AI tools already generate earnings summaries and sector reports automatically",
      "LLMs can produce first-draft financial models and DCF valuations from company filings",
      "Quantitative hedge funds now use AI for pattern recognition that previously needed analyst insight",
      "Junior analyst work (data gathering, slide decks, standard reports) is largely automatable",
    ],
    human_edges: [
      "Investment thesis development requiring original insight about competitive dynamics",
      "Investor relationships and conviction-based communication of complex ideas",
      "Cross-sector judgement calls on macro trends and strategic positioning",
      "Due diligence on private companies where data is messy and incomplete",
    ],
    pivots: [
      {
        role: "Portfolio Manager",
        why: "Decision-making authority over capital allocation remains stubbornly human-led.",
        skills: ["Portfolio construction", "Risk management", "CFA progression", "Investment thesis writing"],
        timeline: "2-5 years",
        difficulty: 3,
      },
      {
        role: "Data Scientist (Finance)",
        why: "Build the models instead of being replaced by them, Python and ML skills open this path.",
        skills: ["Python (pandas, numpy)", "Machine learning", "Financial modelling", "SQL"],
        timeline: "6-12 months",
        difficulty: 3,
      },
      {
        role: "Investor Relations Manager",
        why: "Communicating financial performance to investors requires trust, narrative, and relationship skills.",
        skills: ["Equity story narrative", "Investor communication", "Financial reporting", "Stakeholder management"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Graphic Designer",
    aliases: [
      "visual designer", "digital designer", "branding designer", "marketing designer",
      "print designer", "layout designer", "production designer",
    ],
    risk_pct: 52,
    timeline_years: 5,
    risk_drivers: [
      "Midjourney, DALL-E, and Firefly produce commercial-quality visuals in seconds",
      "Canva's AI features have democratised basic design, eliminating demand for entry-level work",
      "Stock imagery and template-based design has already compressed the market significantly",
      "Automated brand toolkits now generate consistent assets at scale without designer involvement",
    ],
    human_edges: [
      "Brand strategy, visual identity creation, and design thinking for complex problems",
      "Art direction, curating, directing, and having a point of view that shapes culture",
      "Motion, spatial, and environmental design requiring physical and spatial intelligence",
      "Client relationships where trust, interpretation, and iteration matter",
    ],
    pivots: [
      {
        role: "Brand Strategist",
        why: "The thinking behind great design, positioning, identity, narrative, can't be prompted.",
        skills: ["Brand strategy", "Competitive positioning", "Workshop facilitation", "Presentation skills"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "AI Art Director",
        why: "Companies need human creative directors who can direct AI tools to produce on-brand work.",
        skills: ["Advanced prompting (Midjourney, Firefly)", "Creative direction", "Brand guidelines", "Production oversight"],
        timeline: "2-4 months",
        difficulty: 1,
      },
      {
        role: "UX/Product Designer",
        why: "Interaction design, user flows, and usability require human empathy and systems thinking.",
        skills: ["Figma", "UX research methods", "Prototyping", "Design systems"],
        timeline: "5-9 months",
        difficulty: 2,
      },
    ],
  },

  // ── MEDIUM RISK ────────────────────────────────────────────────────────
  {
    title: "Software Engineer",
    aliases: [
      "software developer", "programmer", "coder", "backend developer", "backend engineer",
      "frontend developer", "frontend engineer", "full stack developer", "full stack engineer",
      "developer", "web developer", "engineer", "sde", "swe",
    ],
    risk_pct: 42,
    timeline_years: 8,
    risk_drivers: [
      "GitHub Copilot and Cursor write 40-60% of code in modern development workflows",
      "LLMs can generate boilerplate, write tests, and explain codebases at near-human level",
      "No-code and low-code tools are enabling non-engineers to build applications that previously needed developers",
      "AI is particularly good at the most common, well-defined engineering tasks",
    ],
    human_edges: [
      "System architecture and technical decision-making at scale requiring trade-off judgement",
      "Debugging complex, novel failures in large distributed systems",
      "Understanding user and business requirements and translating them into correct technical decisions",
      "Leading engineering teams, setting technical direction, and mentoring others",
    ],
    pivots: [
      {
        role: "AI Engineer / LLM Integrator",
        why: "The fastest-growing engineering role right now, your coding skills are directly transferable.",
        skills: ["LangChain or LlamaIndex", "Prompt engineering", "Vector databases", "API integration"],
        timeline: "2-4 months",
        difficulty: 1,
      },
      {
        role: "Engineering Manager",
        why: "Leading teams, setting direction, and solving organisational problems is AI-proof.",
        skills: ["Engineering leadership", "1:1 coaching", "Roadmap planning", "Stakeholder management"],
        timeline: "1-3 years (progressive)",
        difficulty: 2,
      },
      {
        role: "Technical Product Manager",
        why: "Bridge the gap between engineering and business, a role where technical depth plus product sense wins.",
        skills: ["Product strategy", "User research", "Prioritisation frameworks", "Stakeholder alignment"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Data Scientist",
    aliases: [
      "data analyst", "ml engineer", "machine learning engineer", "analytics engineer",
      "data engineer", "business intelligence analyst", "bi analyst",
    ],
    risk_pct: 40,
    timeline_years: 7,
    risk_drivers: [
      "AutoML platforms automate feature engineering, model selection, and hyperparameter tuning",
      "LLMs can write data analysis pipelines and interpret results from plain English descriptions",
      "Tableau and Power BI's AI features are enabling business users to do their own analysis",
      "Standard ML use cases (churn, fraud, recommendations) are now off-the-shelf solutions",
    ],
    human_edges: [
      "Problem framing, deciding which data problems are worth solving and how to measure success",
      "Communicating complex findings to non-technical stakeholders who need to make decisions",
      "Designing novel experiments and building the right intuition about causality vs correlation",
      "Domain expertise that shapes what the models should actually be optimising for",
    ],
    pivots: [
      {
        role: "AI Product Manager",
        why: "Owning the roadmap for AI-powered products needs someone who understands both data and users.",
        skills: ["Product strategy", "ML system design", "Stakeholder management", "Metrics frameworks"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "ML Engineer",
        why: "Move from model building to model deployment, productionising AI is a distinct and growing skill.",
        skills: ["MLOps (MLflow, Kubeflow)", "Docker/Kubernetes", "Cloud platforms (AWS/GCP)", "CI/CD for ML"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Decision Intelligence Lead",
        why: "Helping organisations make better decisions using data, a uniquely human-AI hybrid role.",
        skills: ["Decision frameworks", "Causal inference", "Executive communication", "Strategy consulting basics"],
        timeline: "6-12 months",
        difficulty: 3,
      },
    ],
  },
  {
    title: "Marketing Manager",
    aliases: [
      "marketing executive", "digital marketer", "growth marketer", "performance marketer",
      "brand manager", "marketing specialist", "marketing analyst", "marketing coordinator",
      "marketing director", "head of marketing", "cmo",
    ],
    risk_pct: 38,
    timeline_years: 7,
    risk_drivers: [
      "AI generates ad copy, email campaigns, and social content at scale with minimal human input",
      "Programmatic advertising has automated media buying and optimisation entirely",
      "Personalisation at scale, something that previously needed large teams, is now AI-native",
      "Performance marketing analytics and A/B testing is increasingly automated end-to-end",
    ],
    human_edges: [
      "Brand strategy and positioning, deciding who you are and what you stand for",
      "Creative direction and campaign concepting that requires cultural intuition",
      "Building relationships with media, creators, and partners",
      "Navigating brand crises and sensitive communications requiring human judgment",
    ],
    pivots: [
      {
        role: "Brand Strategist",
        why: "The 'why' behind marketing, positioning, narrative, audience insight, is a deeply human skill.",
        skills: ["Brand positioning", "Consumer insights", "Competitive analysis", "Creative briefing"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Growth Lead",
        why: "Cross-functional growth work combining product, data, and marketing is hard to automate.",
        skills: ["Growth frameworks", "Experimentation", "SQL/analytics", "Product sense"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "AI Marketing Specialist",
        why: "Orchestrating AI tools to run campaigns at scale is a new role with high demand.",
        skills: ["AI content tools", "Prompt engineering for marketing", "Campaign analytics", "Workflow automation"],
        timeline: "2-4 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "HR Manager",
    aliases: [
      "human resources manager", "hr", "people ops", "talent manager", "hr generalist",
      "recruiter", "talent acquisition", "people partner", "hr business partner", "hrbp",
    ],
    risk_pct: 42,
    timeline_years: 6,
    risk_drivers: [
      "AI screening tools filter CVs, rank candidates, and schedule interviews automatically",
      "Engagement survey analysis, sentiment tracking, and attrition prediction are now AI-native",
      "Standard HR workflows (onboarding, benefits admin, policy queries) are handled by chatbots",
      "LLMs draft job descriptions, offer letters, and performance review frameworks instantly",
    ],
    human_edges: [
      "Navigating complex employee relations, grievances, terminations, sensitive disputes",
      "Organisational design and culture shaping that requires deep contextual understanding",
      "Leadership coaching and development conversations",
      "Judgment calls on fairness, equity, and edge cases that AI can't make accountably",
    ],
    pivots: [
      {
        role: "People Analytics Lead",
        why: "Combining HR knowledge with data skills is one of the most in-demand hybrid roles right now.",
        skills: ["HR analytics", "Power BI/Tableau", "Python basics", "Workforce planning"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Organisational Design Consultant",
        why: "Designing how companies are structured, layer by layer, is irreducibly human work.",
        skills: ["OD frameworks", "Change management", "Stakeholder facilitation", "Strategy consulting basics"],
        timeline: "6-12 months",
        difficulty: 3,
      },
      {
        role: "Executive Coach",
        why: "Developing leaders through 1:1 coaching is a high-value, human-only domain.",
        skills: ["Coaching certification (ICF)", "Psychological frameworks", "Active listening", "Leadership development"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Product Manager",
    aliases: [
      "product owner", "associate product manager", "apm", "product lead",
      "senior product manager", "group product manager", "head of product", "vp product",
    ],
    risk_pct: 35,
    timeline_years: 8,
    risk_drivers: [
      "AI is automating user research synthesis, PRD generation, and roadmap prioritisation",
      "LLMs can produce competitive analyses, feature specs, and go-to-market plans in minutes",
      "No-code tools are reducing the need for PM-as-translator between business and engineering",
      "Data analytics copilots let PMs get insights without needing analysts on their team",
    ],
    human_edges: [
      "Stakeholder alignment and navigating organisational politics, pure human territory",
      "Building the conviction and vision that inspires engineering teams to do their best work",
      "Customer empathy and the judgment to know which problems are worth solving",
      "Making irreversible bets under uncertainty, AI can inform but not be held accountable",
    ],
    pivots: [
      {
        role: "Founder / Entrepreneur",
        why: "PM skills, problem identification, prioritisation, user empathy, are the exact skills for building companies.",
        skills: ["Business model design", "Fundraising basics", "GTM strategy", "Leadership"],
        timeline: "Variable",
        difficulty: 3,
      },
      {
        role: "AI Product Lead",
        why: "Owning the roadmap for AI-native products is a new discipline with massive demand.",
        skills: ["LLM product design", "AI ethics and safety", "Evaluation frameworks", "Technical literacy (MLOps)"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Venture Capital Analyst",
        why: "Your product instincts translate directly to evaluating startups and spotting what will work.",
        skills: ["Investment thesis", "Market sizing", "Due diligence", "Financial modelling basics"],
        timeline: "6-18 months",
        difficulty: 3,
      },
    ],
  },
  {
    title: "Journalist",
    aliases: ["reporter", "news writer", "sub-editor", "news editor", "correspondent", "broadcaster", "media professional"],
    risk_pct: 48,
    timeline_years: 4,
    risk_drivers: [
      "AI already writes earnings reports, sports scores, and weather summaries for major outlets",
      "LLMs synthesise press releases, research, and sources into first drafts faster than any reporter",
      "Newsroom economics are forcing outlets to replace junior writers with AI tools",
      "Personalised news curation is AI-native, reducing the need for volume content production",
    ],
    human_edges: [
      "Investigative journalism: source relationships, document analysis, and moral courage",
      "Breaking news requiring physical presence and real-time human judgment",
      "Column writing and commentary with a distinctive voice that builds audience loyalty",
      "Editorial leadership and the judgment to know what stories matter",
    ],
    pivots: [
      {
        role: "Investigative Reporter",
        why: "The kind of journalism AI can't do, sources, documents, legal risk, moral accountability.",
        skills: ["FOI/FOIA requests", "Data journalism", "Source protection", "Long-form narrative"],
        timeline: "1-2 years",
        difficulty: 3,
      },
      {
        role: "Content Strategist",
        why: "Editorial judgment about what to publish, for whom, and why, a human skill AI can't replace.",
        skills: ["Audience research", "SEO strategy", "Editorial calendars", "Content analytics"],
        timeline: "3-6 months",
        difficulty: 2,
      },
      {
        role: "Communications Director",
        why: "Strategic communications for organisations needs journalism instincts plus stakeholder management.",
        skills: ["Crisis communications", "Media relations", "Executive communications", "Stakeholder strategy"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "UX Designer",
    aliases: [
      "ui designer", "ui/ux designer", "ux researcher", "product designer",
      "interaction designer", "user experience designer", "ui/ux",
    ],
    risk_pct: 28,
    timeline_years: 9,
    risk_drivers: [
      "AI design tools (Figma AI, Adobe Firefly) auto-generate UI variants and layouts",
      "Automated usability testing platforms reduce the need for manual research sessions",
      "Component libraries and design systems are increasingly AI-generated and self-maintaining",
      "LLMs can generate wireframes and user flows from product requirements",
    ],
    human_edges: [
      "Deep user empathy, understanding emotional context, accessibility, and lived experience",
      "Design critique and the aesthetic judgment that separates good from great",
      "Facilitating design sprints and cross-functional alignment sessions",
      "Designing for edge cases, vulnerable users, and novel contexts with no prior data",
    ],
    pivots: [
      {
        role: "Design Systems Lead",
        why: "Governing the design language of a product at scale is a systems-thinking, human-led role.",
        skills: ["Design tokens", "Component architecture", "Design governance", "Front-end basics"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Service Designer",
        why: "Designing end-to-end service experiences (not just screens) requires holistic human insight.",
        skills: ["Service blueprinting", "Journey mapping", "Stakeholder facilitation", "Systems thinking"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "AI Experience Designer",
        why: "Designing how humans interact with AI systems is a new field with almost no competition yet.",
        skills: ["Conversational UX", "LLM interaction patterns", "AI ethics in design", "Evaluation methods"],
        timeline: "3-6 months",
        difficulty: 2,
      },
    ],
  },

  // ── LOW RISK ───────────────────────────────────────────────────────────
  {
    title: "Therapist",
    aliases: [
      "psychologist", "counsellor", "counselor", "mental health therapist",
      "psychotherapist", "life coach", "psychiatrist", "clinical psychologist",
    ],
    risk_pct: 10,
    timeline_years: 15,
    risk_drivers: [
      "AI chatbots (Woebot, Wysa) handle scale and accessibility for mild mental health support",
      "LLMs can deliver CBT-based interventions and psychoeducation content",
      "Administrative burden (notes, care plans, progress tracking) is increasingly automated",
    ],
    human_edges: [
      "Therapeutic alliance, the human relationship that is the evidence-based mechanism of change",
      "Trauma-informed care and managing acute crises requiring presence, intuition, and accountability",
      "Clinical diagnosis requiring holistic assessment of the whole person",
      "Ethical responsibility and professional accountability that AI cannot carry",
    ],
    pivots: [
      {
        role: "Digital Mental Health Specialist",
        why: "Design and validate AI mental health tools, your clinical expertise is essential for this.",
        skills: ["Digital health platforms", "Clinical evaluation", "User research", "Healthcare UX"],
        timeline: "4-8 months",
        difficulty: 2,
      },
      {
        role: "Organisational Psychologist",
        why: "Applying psychology to workplace wellbeing and performance is a growing, premium field.",
        skills: ["OD frameworks", "Psychometric assessment", "Wellbeing programme design", "Executive coaching"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Nurse",
    aliases: [
      "registered nurse", "rn", "nursing", "clinical nurse", "healthcare worker",
      "ward nurse", "practice nurse", "district nurse", "staff nurse",
    ],
    risk_pct: 14,
    timeline_years: 12,
    risk_drivers: [
      "AI diagnostic tools assist with pattern recognition in imaging and test results",
      "Automated dispensing, monitoring, and documentation reduce administrative nursing workload",
      "Remote patient monitoring reduces the need for some in-person check-ins",
    ],
    human_edges: [
      "Physical assessment and patient care requiring touch, presence, and clinical intuition",
      "Emotional support and advocacy for patients navigating frightening situations",
      "Clinical judgment in rapidly changing situations where protocols don't cover every case",
      "Leading and coordinating care teams in high-pressure, real-time environments",
    ],
    pivots: [
      {
        role: "Nurse Informaticist",
        why: "Bridge clinical expertise with health IT, a role in massive demand as hospitals digitise.",
        skills: ["EHR systems (Epic, Cerner)", "Health data standards (HL7, FHIR)", "Clinical informatics", "Project management"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "Clinical AI Validator",
        why: "AI diagnostic tools need nurses to validate their outputs before clinical deployment.",
        skills: ["Clinical trial basics", "Medical device regulation", "Data annotation", "Quality assurance"],
        timeline: "3-6 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Teacher",
    aliases: [
      "professor", "lecturer", "educator", "tutor", "instructor", "faculty",
      "school teacher", "primary teacher", "secondary teacher",
    ],
    risk_pct: 20,
    timeline_years: 10,
    risk_drivers: [
      "AI tutors (Khan Academy Khanmigo) are delivering personalised instruction at scale",
      "LLMs can generate lesson plans, assessments, and differentiated content in seconds",
      "Administrative tasks (marking, progress reporting, resource creation) are increasingly automated",
      "Online learning platforms are scaling human teachers' reach while reducing headcount needed",
    ],
    human_edges: [
      "Mentoring, motivation, and the relationships that make students believe they can succeed",
      "Classroom management and creating safe, inclusive learning environments",
      "Identifying and supporting students who are struggling emotionally or socially",
      "Physical, practical, and experiential learning that requires a human presence",
    ],
    pivots: [
      {
        role: "Instructional Designer",
        why: "Design the learning experiences for AI tools and online platforms, pedagogy is your edge.",
        skills: ["E-learning design (Articulate, Rise)", "Learning science", "LMS platforms", "UX for learning"],
        timeline: "3-6 months",
        difficulty: 1,
      },
      {
        role: "Education Technology Specialist",
        why: "Schools need educators who can evaluate, deploy, and train on new AI learning tools.",
        skills: ["EdTech platforms", "Teacher training", "Learning analytics", "Change management"],
        timeline: "3-5 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "Social Worker",
    aliases: ["case worker", "social care worker", "community worker", "welfare officer", "social care", "family support worker"],
    risk_pct: 12,
    timeline_years: 15,
    risk_drivers: [
      "Risk assessment tools use AI to flag cases requiring intervention",
      "Administrative documentation and case management is increasingly automated",
      "AI triage in social care referral systems is reducing frontline workload",
    ],
    human_edges: [
      "Building trust with vulnerable individuals and families in complex, sensitive situations",
      "Navigating multi-agency systems and advocating for clients with lived empathy",
      "Moral and legal accountability for child protection and safeguarding decisions",
      "Physical presence and relationship continuity that are core to effective intervention",
    ],
    pivots: [
      {
        role: "Social Care Policy Analyst",
        why: "Your frontline insight is invaluable for designing better policy and systems.",
        skills: ["Policy analysis", "Stakeholder consultation", "Report writing", "Evidence synthesis"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Surgeon",
    aliases: [
      "doctor", "physician", "gp", "general practitioner", "medical doctor",
      "specialist doctor", "consultant doctor", "orthopaedic surgeon", "cardiologist",
    ],
    risk_pct: 16,
    timeline_years: 12,
    risk_drivers: [
      "Robotic surgery systems (Da Vinci) assist with precision tasks already",
      "AI diagnostic tools are improving detection rates in radiology, pathology, and ophthalmology",
      "LLMs are being trialled for clinical note generation and discharge summary writing",
    ],
    human_edges: [
      "Intraoperative judgment during unexpected complications requiring real-time decision-making",
      "Patient consent, communication of risk, and shared decision-making",
      "Holistic patient assessment integrating physical, psychological, and social factors",
      "Legal and ethical accountability that requires a qualified, licensed human",
    ],
    pivots: [
      {
        role: "Clinical AI Lead",
        why: "Lead the adoption of AI diagnostic tools in your specialty, you're the domain expert they need.",
        skills: ["AI in healthcare", "Clinical governance", "Health informatics", "Change management"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Entrepreneur",
    aliases: [
      "founder", "startup founder", "ceo", "co-founder", "business owner",
      "self employed", "startup ceo", "managing director", "md",
    ],
    risk_pct: 8,
    timeline_years: 99,
    risk_drivers: [
      "AI lowers the cost of building, founders can now do in days what took teams months",
      "Competitor companies can also use AI, raising the baseline of what it takes to compete",
    ],
    human_edges: [
      "Vision, conviction, and the willingness to take personal risk, the core of entrepreneurship",
      "Fundraising, which is ultimately a human trust and relationship game",
      "Building and leading teams through uncertainty, setbacks, and rapid change",
      "Identifying genuinely new problems worth solving, the most human of activities",
    ],
    pivots: [
      {
        role: "Venture Capitalist",
        why: "Your operator experience is exactly what the best VC funds are looking for.",
        skills: ["Investment analysis", "Founder network development", "Portfolio management", "Deal structuring"],
        timeline: "1-3 years",
        difficulty: 3,
      },
      {
        role: "Chief of Staff",
        why: "Founders who join scaled companies as CoS bring invaluable operational judgment.",
        skills: ["Executive communication", "Strategic planning", "OKR management", "Cross-functional leadership"],
        timeline: "Variable",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Creative Director",
    aliases: [
      "art director", "design director", "creative lead", "chief creative officer",
      "executive creative director", "ecd",
    ],
    risk_pct: 22,
    timeline_years: 11,
    risk_drivers: [
      "AI generates campaign concepts, visual directions, and creative briefs",
      "Generative AI dramatically reduces the production cost of executing creative work",
      "Junior creative roles (the traditional path to CD) are being cut, shrinking the talent pipeline",
    ],
    human_edges: [
      "Taste, the irreducible human capacity to know what resonates and what doesn't",
      "Cultural relevance and the ability to read the room on what a moment demands",
      "Leading and inspiring creative teams, cultivating talent, and setting a vision",
      "Client relationships built on trust in your judgment, not just your output",
    ],
    pivots: [
      {
        role: "AI Creative Director",
        why: "Direct generative AI tools at scale while providing the taste and strategy they can't have.",
        skills: ["Advanced prompting", "Generative AI production pipelines", "Creative strategy", "Brand guardianship"],
        timeline: "2-4 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "Management Consultant",
    aliases: [
      "consultant", "strategy consultant", "business consultant",
      "strategy analyst", "associate consultant", "senior consultant",
    ],
    risk_pct: 30,
    timeline_years: 8,
    risk_drivers: [
      "LLMs can produce strategy frameworks, competitor analyses, and market sizing in minutes",
      "AI tools are commoditising the PowerPoint and Excel work that junior consultants rely on",
      "Self-serve analytics platforms reduce the need for consultants to gather and present data",
      "Clients are becoming more sophisticated and questioning the value of expensive generalist advice",
    ],
    human_edges: [
      "Political navigation inside client organisations, understanding who really holds power",
      "Change management, getting organisations to actually implement recommendations",
      "Building the trusted advisor relationship that gets you invited back for the next engagement",
      "Novel problem framing where there is no prior playbook",
    ],
    pivots: [
      {
        role: "Strategy Director (In-house)",
        why: "Move from advice to accountability, internal strategy roles are harder to automate.",
        skills: ["Corporate strategy", "M&A analysis", "Board-level communication", "Decision frameworks"],
        timeline: "6-12 months",
        difficulty: 2,
      },
      {
        role: "Transformation Lead",
        why: "Executing change, not just diagnosing it, is the most human, most valuable part of consulting.",
        skills: ["Change management (Prosci)", "Programme leadership", "Stakeholder engagement", "Agile delivery"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Cybersecurity Analyst",
    aliases: [
      "security analyst", "infosec engineer", "penetration tester", "ethical hacker",
      "soc analyst", "threat analyst", "security engineer", "information security",
    ],
    risk_pct: 14,
    timeline_years: 10,
    risk_drivers: [
      "AI-powered SIEM tools automate threat detection and initial triage",
      "LLMs can generate vulnerability reports and assist with standard security assessments",
      "Automated vulnerability scanning reduces the manual effort in security testing",
    ],
    human_edges: [
      "Adversarial thinking, imagining attack vectors that no training data has covered yet",
      "Incident response requiring real-time judgment under pressure",
      "Social engineering awareness and human-in-the-loop security decisions",
      "Security strategy and risk communication to boards and executives",
    ],
    pivots: [
      {
        role: "AI Security Specialist",
        why: "Securing AI systems and defending against AI-powered attacks is one of the fastest growing fields.",
        skills: ["LLM security", "Adversarial ML", "AI red teaming", "Security architecture"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Chef",
    aliases: ["cook", "sous chef", "head chef", "pastry chef", "line cook", "culinary", "executive chef"],
    risk_pct: 22,
    timeline_years: 10,
    risk_drivers: [
      "Industrial food production is increasingly automated, robotic arms, smart ovens, portioning systems",
      "AI recipe generation and nutritional optimisation is replacing menu development for mass-market food",
      "Ghost kitchens and delivery-only brands are mechanising high-volume production",
    ],
    human_edges: [
      "Creative cuisine, plating, and the artistry of fine dining that is about experience, not just food",
      "Adapting in real-time to ingredient quality, customer preferences, and kitchen chaos",
      "The hospitality dimension, reading a room, storytelling through food, building a following",
      "Ownership and entrepreneurship, running a restaurant is a human business through and through",
    ],
    pivots: [
      {
        role: "Food Entrepreneur",
        why: "Build your own brand, a product line, supper club, or food content channel. Your craft is the moat.",
        skills: ["Food product development", "Brand building", "Food safety", "Social media for food"],
        timeline: "6-18 months",
        difficulty: 2,
      },
      {
        role: "Culinary Educator",
        why: "Teaching cooking, in person, online, or corporate, is a human skill that scales well.",
        skills: ["Curriculum design", "Online course creation", "Video production basics", "Brand development"],
        timeline: "3-6 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "AI Engineer",
    aliases: [
      "ai engineer", "llm engineer", "genai engineer", "ai researcher",
      "machine learning engineer", "ml engineer", "deep learning engineer",
      "applied ai engineer", "nlp engineer",
    ],
    risk_pct: 6,
    timeline_years: 99,
    risk_drivers: [
      "AI tools help AI engineers write code and run experiments faster",
      "AutoML is automating some of the more routine model training tasks",
    ],
    human_edges: [
      "Research intuition, knowing which experiments are worth running and why",
      "System design for novel AI architectures that don't yet have templates",
      "Aligning AI systems with human values, a problem that requires being human",
      "The field is growing faster than it's being automated, net job creation, not destruction",
    ],
    pivots: [
      {
        role: "AI Safety Researcher",
        why: "As AI gets more powerful, ensuring it's safe and aligned becomes the most critical work of our era.",
        skills: ["Alignment research", "Interpretability", "RLHF", "Academic research methods"],
        timeline: "1-2 years",
        difficulty: 3,
      },
      {
        role: "AI Product Manager",
        why: "Define what AI products should do, a role that will always need a human to own the vision.",
        skills: ["LLM capabilities and limitations", "Product strategy", "Evaluation design", "Stakeholder management"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Electrician",
    aliases: ["electrical engineer", "electrical technician", "wireman", "electrician", "electrical installer"],
    risk_pct: 12,
    timeline_years: 14,
    risk_drivers: [
      "AI-assisted design tools can generate electrical schematics and installation plans",
      "Some inspection work is being aided by drones and automated testing equipment",
    ],
    human_edges: [
      "Physical installation in unpredictable environments that robots cannot yet navigate",
      "Fault diagnosis requiring tactile feedback, visual inspection, and contextual judgment",
      "Licensed work carrying legal liability, regulatory frameworks require qualified humans",
      "Emergency repairs under time pressure in dangerous conditions",
    ],
    pivots: [
      {
        role: "Renewable Energy Technician",
        why: "Solar, wind, and EV charging infrastructure is booming, your electrical skills are perfectly transferable.",
        skills: ["Solar PV installation", "Battery storage systems", "EV charging infrastructure", "Smart home systems"],
        timeline: "3-6 months",
        difficulty: 1,
      },
    ],
  },
  {
    title: "Real Estate Agent",
    aliases: [
      "realtor", "property agent", "estate agent", "property consultant",
      "letting agent", "property manager",
    ],
    risk_pct: 50,
    timeline_years: 6,
    risk_drivers: [
      "AI-powered property valuation and matching tools are becoming consumer-facing",
      "Virtual tours and online platforms reduce the need for in-person agent involvement",
      "Transaction management platforms are automating the administrative side of property deals",
      "Discount brokerages using AI are competing with full-service agents on price",
    ],
    human_edges: [
      "Negotiation, the human dynamics of a property transaction require skilled advocacy",
      "Local market knowledge and the network of relationships that find off-market deals",
      "Emotional guidance through major life decisions, buying a home is not a rational process",
      "Commercial property deals with complex structuring requirements",
    ],
    pivots: [
      {
        role: "Property Developer",
        why: "Identify, acquire, and develop property rather than transact it, a higher-value, more AI-proof role.",
        skills: ["Property development finance", "Planning and permitting", "Project management", "Investment appraisal"],
        timeline: "1-3 years",
        difficulty: 3,
      },
      {
        role: "Commercial Real Estate Broker",
        why: "Corporate occupier deals and investment sales involve complex negotiations that need human expertise.",
        skills: ["Commercial lease structures", "Investment valuation", "Corporate relationships", "Due diligence"],
        timeline: "6-12 months",
        difficulty: 2,
      },
    ],
  },
  {
    title: "Pharmacist",
    aliases: ["pharmacy", "clinical pharmacist", "dispensing pharmacist", "community pharmacist", "hospital pharmacist"],
    risk_pct: 45,
    timeline_years: 7,
    risk_drivers: [
      "Automated dispensing robots now handle 90%+ of routine prescription filling in large pharmacies",
      "AI drug interaction checkers outperform manual review for standard cases",
      "Online pharmacy platforms with AI triage are handling growing volumes without pharmacists",
      "Medicines reconciliation and discharge summaries are increasingly AI-generated",
    ],
    human_edges: [
      "Clinical pharmacy, optimising complex medication regimens for individual patients",
      "Medication counselling and patient education requiring empathy and communication",
      "Identifying rare interactions and edge cases that fall outside algorithmic rules",
      "Accountability and professional judgment in high-stakes clinical decisions",
    ],
    pivots: [
      {
        role: "Clinical Pharmacist Specialist",
        why: "Move towards clinical practice and patient care, the human end of pharmacy that AI can't automate.",
        skills: ["Clinical therapeutics", "Independent prescribing", "Patient consultation", "Ward-based pharmacy"],
        timeline: "1-2 years",
        difficulty: 2,
      },
      {
        role: "Pharmacy Informatics Specialist",
        why: "Configure and govern AI dispensing systems, your domain knowledge is irreplaceable.",
        skills: ["Pharmacy systems (JAC, Ascribe)", "Clinical informatics", "Data analysis", "Change management"],
        timeline: "4-8 months",
        difficulty: 2,
      },
    ],
  },
];

// ── Matching logic ─────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\b(senior|junior|associate|principal|lead|chief|head|director|vp|vice president|manager|specialist|executive|officer|analyst|coordinator|assistant|intern)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordOverlap(a: string, b: string): number {
  const wa = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const wb = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  let count = 0;
  wa.forEach((w) => { if (wb.has(w)) count++; });
  return count / Math.max(wa.size, wb.size, 1);
}

function findMatch(input: string): { job: JobRisk; confidence: "high" | "medium" | "low" } | null {
  const norm = normalise(input);
  const raw = input.toLowerCase().trim();

  // 1. Exact title match
  for (const job of JOB_DATA) {
    if (job.title.toLowerCase() === raw || normalise(job.title) === norm) {
      return { job, confidence: "high" };
    }
  }

  // 2. Exact alias match
  for (const job of JOB_DATA) {
    for (const alias of job.aliases) {
      if (alias === raw || alias === norm) return { job, confidence: "high" };
    }
  }

  // 3. Contains match
  for (const job of JOB_DATA) {
    for (const alias of job.aliases) {
      if (raw.includes(alias) || alias.includes(raw)) {
        return { job, confidence: "high" };
      }
    }
  }

  // 4. Word overlap ≥ 0.4
  let best: { job: JobRisk; score: number } | null = null;
  for (const job of JOB_DATA) {
    const candidates = [job.title, ...job.aliases];
    for (const c of candidates) {
      const score = wordOverlap(norm, normalise(c));
      if (score >= 0.4 && (!best || score > best.score)) {
        best = { job, score };
      }
    }
  }
  if (best) return { job: best.job, confidence: "medium" };

  return null;
}

function inferFromKeywords(input: string): AnalysisResult {
  const s = input.toLowerCase();
  let risk_pct = 48;
  let timeline_years = 6;
  let cluster = "general";

  // Primary clusters (engine-matched roles never reach here; these are fallback only)
  if (/sales|insurance|broker|agent/.test(s)) { risk_pct = 60; timeline_years = 5; cluster = "sales"; }
  else if (/engineer|developer|software|code|programmer/.test(s)) { risk_pct = 42; timeline_years = 8; cluster = "tech"; }
  else if (/doctor|medical|nurse|clinical|hospital|physio|dentist|surgeon|pharmacist/.test(s)) { risk_pct = 18; timeline_years = 12; cluster = "health"; }
  else if (/legal|law|solicitor|barrister|compliance|paralegal|attorney/.test(s)) { risk_pct = 58; timeline_years = 5; cluster = "legal"; }
  else if (/creative|design|art|illustrat|graphic|ux|ui|motion/.test(s)) { risk_pct = 35; timeline_years = 8; cluster = "creative"; }
  else if (/teach|school|education|professor|academic|tutor|instructor/.test(s)) { risk_pct = 20; timeline_years = 10; cluster = "education"; }
  else if (/market|brand|digital|growth|content|campaign|seo|sem/.test(s)) { risk_pct = 40; timeline_years = 7; cluster = "marketing"; }
  else if (/data|analytics|analysis|research|scientist|statistician/.test(s)) { risk_pct = 42; timeline_years = 7; cluster = "data"; }
  else if (/financ|accounting|audit|tax|bookkeep|payroll|actuar/.test(s)) { risk_pct = 65; timeline_years = 5; cluster = "finance"; }
  else if (/manag|direct|lead|vp|chief|head|president|founder|entrepreneur/.test(s)) { risk_pct = 32; timeline_years = 8; cluster = "leadership"; }
  else if (/trade|plumb|electric|construct|mechanic|hvac|weld|carpenter/.test(s)) { risk_pct = 14; timeline_years = 14; cluster = "trades"; }
  // Extended fallback clusters — used when LLM is unavailable
  else if (/police|officer|detective|law enforce|security guard|bodyguard|sheriff|constable|patrol/.test(s)) { risk_pct = 22; timeline_years = 12; cluster = "trades"; }
  else if (/chef|cook|culinary|bartend|waiter|waitress|barista|restaurant|baker|pastry|hospitality|catering/.test(s)) { risk_pct = 20; timeline_years = 12; cluster = "trades"; }
  else if (/actor|actress|performer|musician|singer|dancer|comedian|entertainer|model|streamer|podcaster/.test(s)) { risk_pct = 28; timeline_years = 10; cluster = "creative"; }
  else if (/pilot|cabin crew|flight attendant|air traffic|sailor|captain|logistics|supply chain|warehouse|driver|trucker|delivery/.test(s)) { risk_pct = 38; timeline_years = 8; cluster = "general"; }
  else if (/social work|counsell|psycholog|therapist|welfare|nonprofit|ngo|charity|humanitarian/.test(s)) { risk_pct = 16; timeline_years = 12; cluster = "health"; }
  else if (/real estate|property|estate agent|mortgage|leasing|realt/.test(s)) { risk_pct = 55; timeline_years = 6; cluster = "sales"; }
  else if (/\bhr\b|human resource|people ops|recruiter|talent|headhunter/.test(s)) { risk_pct = 50; timeline_years = 6; cluster = "leadership"; }
  else if (/product manager|product owner|program manager|scrum|agile/.test(s)) { risk_pct = 38; timeline_years = 7; cluster = "leadership"; }
  else if (/invest|hedge fund|asset manag|wealth|portfolio|equity|trader/.test(s)) { risk_pct = 55; timeline_years = 6; cluster = "finance"; }
  else if (/journalist|reporter|editor|press|media|public relation/.test(s)) { risk_pct = 45; timeline_years = 7; cluster = "creative"; }
  else if (/civil serv|government|public sector|policy|diplomat|military|army|navy|air force/.test(s)) { risk_pct = 30; timeline_years = 10; cluster = "leadership"; }
  else if (/stripper|exotic|escort|adult entertain|onlyfans|sex work/.test(s)) { risk_pct = 15; timeline_years = 15; cluster = "trades"; }

  const title = input.trim() || "This role";
  const level = getRiskLevel(risk_pct);

  const riskMap: Record<string, string[]> = {
    sales: ["Repetitive outreach and qualification is already automated", "AI dialers and email sequences have cut entry-level roles", "CRM intelligence removes the need for manual research"],
    tech: ["AI coding assistants write 40-60% of code in modern workflows", "No-code tools reduce demand for developers", "LLMs automate boilerplate and documentation"],
    health: ["AI assists with diagnostics and documentation", "Automated monitoring reduces some routine tasks"],
    legal: ["AI contract review and legal research is well-established", "Document drafting is increasingly automated"],
    creative: ["Generative AI creates visuals, copy, and concepts at scale", "Template automation reduces need for production work"],
    education: ["AI tutors and personalised learning platforms scale one-to-many teaching", "Admin and assessment work is increasingly automated"],
    marketing: ["AI generates copy, ads, and campaign assets at scale", "Programmatic buying has replaced media planning work"],
    data: ["AutoML automates model selection and feature engineering", "BI tools enable self-serve analytics"],
    finance: ["AI handles data gathering, modelling, and report generation", "Automated compliance and reconciliation tools are widespread"],
    leadership: ["AI handles information synthesis and routine communication", "Some planning and reporting work is automated"],
    trades: ["Physical work in unstructured environments remains hard to automate", "Some inspection and design work is AI-assisted"],
    general: ["AI is automating the most routine and structured parts of this role", "Pattern-recognition tasks are increasingly machine-led"],
  };

  const edgeMap: Record<string, string[]> = {
    sales: ["Complex deals requiring relationship, trust, and negotiation", "Enterprise sales with long cycles and multiple stakeholders"],
    tech: ["System architecture and engineering judgment at scale", "Understanding user needs and translating them into decisions"],
    health: ["Physical presence, touch, and patient relationships", "Clinical judgment in novel and complex cases"],
    legal: ["Client advocacy, negotiation, and novel legal arguments", "Accountability and professional judgment"],
    creative: ["Cultural intuition, taste, and original creative vision", "Leading teams and directing creative strategy"],
    education: ["Mentoring, motivation, and emotional support for students", "Managing classroom dynamics and learning environments"],
    marketing: ["Brand strategy and the human insight behind positioning", "Crisis communications and sensitive stakeholder management"],
    data: ["Problem framing and deciding which data questions matter", "Communicating insights to non-technical audiences"],
    finance: ["Strategic financial advice and business partnering", "Client relationships and trust in judgment"],
    leadership: ["Organisational navigation and people leadership", "Vision-setting and building conviction in teams"],
    trades: ["On-site judgment and physical problem-solving", "Emergency situations requiring real-time adaptive response"],
    general: ["Complex judgment calls requiring contextual understanding", "Relationship building and trust that takes time to develop"],
  };

  return {
    job_input: input,
    matched_title: title,
    risk_pct,
    timeline_years,
    risk_level: level,
    verdict: getVerdict(title, risk_pct, timeline_years),
    risk_drivers: riskMap[cluster] || riskMap.general,
    human_edges: edgeMap[cluster] || edgeMap.general,
    pivots: [
      {
        role: "AI Augmented Specialist",
        why: "Learn to work alongside AI tools in your field to stay ahead of those who don't.",
        skills: ["Prompt engineering", "AI tools in your domain", "Data literacy", "Workflow automation"],
        timeline: "1-3 months",
        difficulty: 1,
      },
      {
        role: "Domain Expert Consultant",
        why: "Deep expertise in a specific area is more valuable as AI handles generalist tasks.",
        skills: ["Deep domain specialisation", "Advisory communication", "Client management", "Thought leadership"],
        timeline: "6-18 months",
        difficulty: 2,
      },
    ],
    confidence: "low",
  };
}

// ── Main export ────────────────────────────────────────────────────────────

export function analyseJob(input: string): AnalysisResult {
  if (!input.trim()) {
    return inferFromKeywords("general");
  }

  const match = findMatch(input);

  if (match) {
    const { job, confidence } = match;
    return {
      job_input: input,
      matched_title: job.title,
      risk_pct: job.risk_pct,
      timeline_years: job.timeline_years,
      risk_level: getRiskLevel(job.risk_pct),
      verdict: getVerdict(job.title, job.risk_pct, job.timeline_years),
      risk_drivers: job.risk_drivers,
      human_edges: job.human_edges,
      pivots: job.pivots,
      confidence,
    };
  }

  return inferFromKeywords(input);
}