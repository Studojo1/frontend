/**
 * Studojo AI Risk Ontology
 *
 * A sector-based role taxonomy covering 200+ job titles.
 * Structure inspired by:
 *  - ESCO/ISCO occupational classification hierarchies (dahrs/holaProject)
 *  - BTM multi-dimensional competency matching framework (JamalElgebli/BTM-jobs-ontology)
 *  - EMSI job-to-skills ontology (iamgrewal/ontologyAPI)
 *  - Frey & Osbourne automation probability framework (Oxford, 2013)
 *  - WEF Future of Jobs Report 2023
 *
 * Each sector defines:
 *  - Canonical risk profile (risk_pct, timeline_years)
 *  - Risk drivers and human edges (inherited by all roles in sector)
 *  - Default pivots (3, sector-appropriate)
 *
 * Each role entry in ROLE_MAP defines:
 *  - The sector it belongs to
 *  - A risk_pct override (null = use sector default)
 *  - A timeline_years override (null = use sector default)
 *  - Optional role-specific risk_drivers/human_edges/pivots overrides
 *
 * Used by: engine.ts findMatch() as extended lookup for roles not in JOB_DATA
 * Used by: future quiz system for sector classification and skills assessment
 */

export type OntologyPivot = {
  role: string;
  why: string;
  skills: string[];
  timeline: string;
  difficulty: 1 | 2 | 3;
};

export type SectorProfile = {
  name: string;
  risk_pct: number;
  timeline_years: number;
  risk_drivers: string[];
  human_edges: string[];
  pivots: OntologyPivot[];
};

export type OntologyRole = {
  sector: string;
  risk_pct: number | null;       // null = use sector default
  timeline_years: number | null;
  risk_drivers?: string[];       // if set, overrides sector drivers
  human_edges?: string[];        // if set, overrides sector edges
  pivots?: OntologyPivot[];      // if set, overrides sector pivots
};

// ── Sector Profiles ─────────────────────────────────────────────────────────
export const SECTORS: Record<string, SectorProfile> = {

  software_engineering: {
    name: "Software Engineering",
    risk_pct: 42,
    timeline_years: 8,
    risk_drivers: [
      "AI coding assistants (GitHub Copilot, Cursor) write 40-60% of code in modern workflows",
      "LLMs automate boilerplate, test generation, and code review",
      "No-code and low-code platforms are reducing demand for custom development in mid-market",
    ],
    human_edges: [
      "System design and architectural judgment that balances complexity, cost, and team capability",
      "Debugging novel failures across distributed systems where no playbook exists",
      "Translating ambiguous business requirements into robust engineering decisions",
    ],
    pivots: [
      { role: "AI/ML Engineer", why: "Extend your engineering skills to building and deploying AI systems.", skills: ["Python", "PyTorch/TensorFlow", "MLOps", "LLM APIs"], timeline: "6-12 months", difficulty: 2 },
      { role: "Staff Engineer", why: "Move into technical leadership where architectural judgment is the scarce resource.", skills: ["System design", "Technical strategy", "Mentoring", "Cross-team influence"], timeline: "1-2 years", difficulty: 3 },
      { role: "Developer Advocate", why: "Combine your engineering depth with community-building and technical content creation.", skills: ["Technical writing", "Public speaking", "API design", "Developer community"], timeline: "4-8 months", difficulty: 2 },
    ],
  },

  data_analytics: {
    name: "Data & Analytics",
    risk_pct: 45,
    timeline_years: 7,
    risk_drivers: [
      "Self-serve BI tools (Looker, Power BI) enable business users to run their own analysis",
      "AutoML platforms automate feature engineering, model selection, and reporting",
      "LLMs generate SQL queries, dashboards, and insight summaries from natural language",
    ],
    human_edges: [
      "Framing the right business question - knowing what to measure and why",
      "Communicating nuanced data stories to non-technical stakeholders who make decisions",
      "Judgment on data quality, model limitations, and when not to trust a number",
    ],
    pivots: [
      { role: "Analytics Engineer", why: "Build the data models and pipelines that power analytics platforms.", skills: ["dbt", "SQL", "Data warehousing", "Data modelling"], timeline: "3-6 months", difficulty: 1 },
      { role: "Data Product Manager", why: "Own data products end-to-end, combining analytical depth with product thinking.", skills: ["Product management", "Data strategy", "Stakeholder management", "OKR design"], timeline: "6-12 months", difficulty: 2 },
      { role: "AI Strategy Consultant", why: "Advise businesses on how to build data and AI strategies that create real value.", skills: ["Business strategy", "AI landscape", "Data governance", "Stakeholder advisory"], timeline: "9-18 months", difficulty: 3 },
    ],
  },

  cloud_infrastructure: {
    name: "Cloud & Infrastructure",
    risk_pct: 32,
    timeline_years: 9,
    risk_drivers: [
      "Managed cloud services abstract away much of the infrastructure management work",
      "AI-powered IaC tools generate Terraform and Kubernetes configs automatically",
      "AIOps platforms automate incident triage and remediation for common failure patterns",
    ],
    human_edges: [
      "Designing multi-cloud architectures that balance cost, reliability, and security",
      "Incident command during complex outages requiring real-time judgment and communication",
      "Security and compliance decision-making that carries regulatory accountability",
    ],
    pivots: [
      { role: "Cloud Security Architect", why: "Secure cloud-native architectures - demand outpaces talent supply significantly.", skills: ["Zero trust", "IAM design", "Cloud security (AWS/Azure/GCP)", "Compliance frameworks"], timeline: "6-12 months", difficulty: 2 },
      { role: "FinOps Engineer", why: "Optimise cloud spend at scale - a growing discipline as cloud bills balloon.", skills: ["Cloud cost management", "FinOps framework", "Tagging strategy", "Reservation planning"], timeline: "3-6 months", difficulty: 1 },
      { role: "AI Infrastructure Engineer", why: "Build GPU clusters and ML pipelines that the AI wave demands.", skills: ["GPU infrastructure", "Vector databases", "Distributed computing", "MLOps tooling"], timeline: "4-8 months", difficulty: 2 },
    ],
  },

  product_management: {
    name: "Product Management",
    risk_pct: 36,
    timeline_years: 8,
    risk_drivers: [
      "AI tools (Linear AI, Notion AI) generate user stories, roadmaps, and PRDs automatically",
      "Product analytics platforms surface insights without manual analyst work",
      "LLMs conduct synthetic user research and generate competitive analyses",
    ],
    human_edges: [
      "Vision and conviction about what to build - the judgment to say no to good ideas",
      "Cross-functional alignment across engineering, design, and business stakeholders",
      "Reading market timing and the founder instinct for what matters now vs later",
    ],
    pivots: [
      { role: "Chief Product Officer", why: "Product leadership is the direct path to CPO, where vision is the moat.", skills: ["Product strategy", "P&L ownership", "Executive leadership", "Company building"], timeline: "2-5 years", difficulty: 3 },
      { role: "AI Product Manager", why: "Own AI product development - a specialism with severe talent shortage.", skills: ["LLM capabilities", "Evaluation design", "AI product strategy", "Responsible AI"], timeline: "4-8 months", difficulty: 2 },
      { role: "Venture Capital Investor", why: "Your product judgment is exactly what early-stage investors need to evaluate startups.", skills: ["Startup evaluation", "Market sizing", "Founder assessment", "Investment thesis"], timeline: "1-3 years", difficulty: 3 },
    ],
  },

  design: {
    name: "Design",
    risk_pct: 33,
    timeline_years: 8,
    risk_drivers: [
      "AI design tools (Figma AI, Midjourney, Adobe Firefly) generate assets at scale",
      "Template automation reduces demand for production and junior design work",
      "LLMs write UX copy, microcopy, and design briefs faster than human iteration",
    ],
    human_edges: [
      "Design judgment - knowing what looks and feels right beyond what's technically possible",
      "User empathy and the qualitative insight that makes design feel human",
      "Creative direction and the ability to brief, inspire, and evaluate creative teams",
    ],
    pivots: [
      { role: "Design Director", why: "Lead creative teams and set design vision - judgment that AI cannot replicate.", skills: ["Creative leadership", "Design systems", "Strategic vision", "Team management"], timeline: "1-2 years", difficulty: 3 },
      { role: "AI-Augmented Designer", why: "Master AI design tools to produce 10x output - the new baseline for senior designers.", skills: ["Figma AI", "Midjourney/DALL-E", "Prompt engineering for design", "AI prototyping"], timeline: "2-4 months", difficulty: 1 },
      { role: "Design Technologist", why: "Bridge the gap between design and engineering - a role that is growing as AI tools blur the boundary.", skills: ["Framer/Webflow", "Design systems", "Frontend basics", "Prototyping"], timeline: "4-8 months", difficulty: 2 },
    ],
  },

  sales: {
    name: "Sales",
    risk_pct: 55,
    timeline_years: 6,
    risk_drivers: [
      "AI sales tools (Gong, Outreach AI, Apollo) automate prospecting, email sequences, and call coaching",
      "LLMs write personalised cold outreach at scale, removing the SDR's core function",
      "AI conversation intelligence replaces manual pipeline review and forecast calls",
    ],
    human_edges: [
      "Complex enterprise negotiations with multiple stakeholders and long decision cycles",
      "Executive relationships built over years that form the bedrock of large deal flow",
      "Reading the room in live sales situations - improvising when the script fails",
    ],
    pivots: [
      { role: "Enterprise Account Executive", why: "Move upmarket to complex deals where AI cannot replace the relationship.", skills: ["Enterprise sales methodology", "Multi-stakeholder navigation", "Contract negotiation", "Executive relationships"], timeline: "6-12 months", difficulty: 2 },
      { role: "Revenue Operations Manager", why: "Build and own the revenue stack - the AI tools, data, and processes that make sales work.", skills: ["CRM (Salesforce/HubSpot)", "Sales analytics", "Revenue forecasting", "Process design"], timeline: "4-8 months", difficulty: 2 },
      { role: "Customer Success Manager", why: "Expand existing accounts through relationship depth that AI cannot replicate.", skills: ["Account management", "Renewal management", "QBR facilitation", "Upsell identification"], timeline: "3-6 months", difficulty: 1 },
    ],
  },

  finance_ops: {
    name: "Finance Operations",
    risk_pct: 68,
    timeline_years: 5,
    risk_drivers: [
      "AI accounting platforms (Xero AI, QuickBooks) automate bookkeeping, reconciliation, and categorisation",
      "RPA handles invoice processing, expense management, and routine journal entries",
      "LLMs generate management accounts, variance commentary, and board packs from data",
    ],
    human_edges: [
      "Financial judgment in ambiguous situations where the right treatment is genuinely unclear",
      "Stakeholder communication of financial performance and risk to boards and investors",
      "Tax strategy and planning requiring deep regulatory knowledge and client relationships",
    ],
    pivots: [
      { role: "Financial Controller", why: "Move from operational finance to oversight and control - less automatable than transactional work.", skills: ["IFRS/GAAP", "Internal controls", "Financial reporting", "Audit management"], timeline: "6-12 months", difficulty: 2 },
      { role: "FP&A Manager", why: "Strategic financial planning and scenario modelling that drives business decisions.", skills: ["Financial modelling", "Business partnering", "Scenario analysis", "Board communication"], timeline: "4-8 months", difficulty: 2 },
      { role: "CFO", why: "Finance leadership is permanently human - capital allocation and investor trust cannot be automated.", skills: ["Capital markets", "M&A", "Investor relations", "Financial strategy"], timeline: "3-7 years", difficulty: 3 },
    ],
  },

  hr_people: {
    name: "HR & People",
    risk_pct: 48,
    timeline_years: 6,
    risk_drivers: [
      "AI recruiting tools (HireVue, Workday AI, Greenhouse AI) automate screening, scheduling, and candidate matching",
      "LLMs write job descriptions, offer letters, performance review templates, and HR policies",
      "People analytics platforms surface insights on attrition, engagement, and productivity automatically",
    ],
    human_edges: [
      "Sensitive employee relations conversations - redundancy, discipline, mental health - requiring empathy and judgment",
      "Organisational design and culture-building that defines how companies attract and retain talent",
      "Executive hiring where relationships, network, and judgment about people are the whole job",
    ],
    pivots: [
      { role: "People Operations Lead", why: "Own the systems, data, and processes that make HR scalable - a growing operational role.", skills: ["HRIS platforms", "People analytics", "Process automation", "HR tech evaluation"], timeline: "3-6 months", difficulty: 1 },
      { role: "Chief People Officer", why: "HR leadership is the path to CPO - culture, values, and executive hiring are permanently human.", skills: ["Org design", "Executive team management", "Culture strategy", "Board advisory"], timeline: "2-5 years", difficulty: 3 },
      { role: "HR Business Partner (Senior)", why: "Strategic partnering with business units on org design, talent strategy, and change management.", skills: ["Business partnering", "OD methodology", "Executive coaching basics", "Change management"], timeline: "4-8 months", difficulty: 2 },
    ],
  },

  marketing_digital: {
    name: "Digital Marketing",
    risk_pct: 42,
    timeline_years: 7,
    risk_drivers: [
      "Generative AI creates ad copy, social content, and email campaigns at scale",
      "Programmatic advertising automates media buying and optimisation without human input",
      "AI tools (Jasper, Copy.ai) produce SEO content and blog posts faster than human writers",
    ],
    human_edges: [
      "Brand judgment - the cultural intuition for what will resonate vs what will fall flat",
      "Campaign strategy that requires understanding of market context, timing, and competitive dynamics",
      "Creative direction and the ability to recognise and brief great human creative work",
    ],
    pivots: [
      { role: "Growth Lead", why: "Own full-funnel growth strategy - a role that blends marketing with product and data.", skills: ["Growth experimentation", "Funnel analytics", "A/B testing", "Cross-channel strategy"], timeline: "4-8 months", difficulty: 2 },
      { role: "AI Marketing Specialist", why: "Master AI marketing tools and become the person who teaches others to use them.", skills: ["Generative AI for marketing", "Prompt engineering", "Marketing automation", "AI analytics"], timeline: "2-4 months", difficulty: 1 },
      { role: "Head of Marketing", why: "Marketing leadership is the path to CMO - strategy and brand judgment are the moat.", skills: ["Marketing strategy", "Team leadership", "Budget management", "Board communication"], timeline: "1-3 years", difficulty: 3 },
    ],
  },

  legal: {
    name: "Legal",
    risk_pct: 55,
    timeline_years: 6,
    risk_drivers: [
      "AI contract analysis (Harvey, Kira) reviews and extracts contract provisions faster than paralegals",
      "LLMs draft standard agreements, NDAs, and legal memos from templates",
      "Legal research AI (Westlaw Edge, Lexis AI) replaces hours of precedent searching",
    ],
    human_edges: [
      "Client advisory in complex, high-stakes matters where judgment and accountability matter",
      "Courtroom advocacy and negotiation requiring charisma, reading of the room, and improvisation",
      "Novel legal arguments in emerging areas (AI law, crypto regulation) with no established precedent",
    ],
    pivots: [
      { role: "Legal Tech Specialist", why: "Implement and govern AI legal tools - your domain knowledge makes you the critical bridge.", skills: ["Contract management platforms", "eDiscovery tools", "Legal AI governance", "Process design"], timeline: "3-6 months", difficulty: 1 },
      { role: "In-house Counsel", why: "Move from private practice to corporate in-house, where relationships with the business are the whole job.", skills: ["Commercial contracts", "Risk management", "Stakeholder advisory", "Business partnering"], timeline: "4-8 months", difficulty: 2 },
      { role: "Regulatory Affairs Manager", why: "Navigate complex regulatory environments in regulated industries - judgment-intensive and growing.", skills: ["Regulatory strategy", "Government affairs", "Compliance frameworks", "Policy monitoring"], timeline: "6-12 months", difficulty: 2 },
    ],
  },

  healthcare_clinical: {
    name: "Healthcare (Clinical)",
    risk_pct: 16,
    timeline_years: 12,
    risk_drivers: [
      "AI diagnostic tools are improving detection rates in imaging, pathology, and genomics",
      "Automated clinical documentation reduces the admin burden on clinicians",
      "Remote patient monitoring and AI triage systems handle routine patient interactions",
    ],
    human_edges: [
      "Physical examination and clinical intuition developed through years of patient contact",
      "Patient relationships and the trust that underpins effective care",
      "Judgment in complex, multi-system cases where no single algorithm applies",
    ],
    pivots: [
      { role: "Clinical Informatics Lead", why: "Lead digital transformation in healthcare using your clinical credibility.", skills: ["EHR systems", "Clinical workflow design", "Health data standards", "Change management"], timeline: "4-8 months", difficulty: 2 },
      { role: "Medical Affairs Manager", why: "Bridge clinical expertise with commercial strategy at pharma or medtech companies.", skills: ["Medical communications", "KOL management", "Clinical data interpretation", "Regulatory submissions"], timeline: "6-12 months", difficulty: 2 },
      { role: "Health Technology Assessor", why: "Evaluate new medical technologies and treatments for payers, governments, and insurers.", skills: ["HTA frameworks", "Health economics", "Systematic reviews", "NICE/FDA processes"], timeline: "9-18 months", difficulty: 3 },
    ],
  },

  healthcare_admin: {
    name: "Healthcare (Admin & Management)",
    risk_pct: 38,
    timeline_years: 8,
    risk_drivers: [
      "Healthcare administration platforms automate scheduling, billing, and insurance claims",
      "AI-powered patient flow optimisation reduces demand for manual planning",
      "Revenue cycle management is increasingly automated end-to-end",
    ],
    human_edges: [
      "Leading clinical teams through complex operational challenges requiring empathy and authority",
      "Stakeholder management across clinical, administrative, and political systems",
      "Strategic planning in resource-constrained public health systems",
    ],
    pivots: [
      { role: "Healthcare Strategy Manager", why: "Advise health systems on transformation programmes - your operational knowledge is essential.", skills: ["Healthcare strategy", "Service design", "Stakeholder engagement", "Business case development"], timeline: "6-12 months", difficulty: 2 },
      { role: "Digital Health Product Manager", why: "Build digital health products using your understanding of how healthcare actually works.", skills: ["Health product management", "Regulatory pathways (MDR, FDA)", "Clinical workflow mapping", "User research"], timeline: "6-12 months", difficulty: 2 },
      { role: "Health Economist", why: "Model the value of healthcare interventions for payers, governments, and industry.", skills: ["Health economic modelling", "QALY analysis", "Budget impact models", "Pharmacoeconomics"], timeline: "1-2 years", difficulty: 3 },
    ],
  },

  education: {
    name: "Education",
    risk_pct: 22,
    timeline_years: 10,
    risk_drivers: [
      "AI tutors deliver personalised instruction at scale for standard curriculum content",
      "LLMs generate lesson plans, assessments, and differentiated materials instantly",
      "Online learning platforms scale great teachers' reach while reducing overall headcount",
    ],
    human_edges: [
      "Mentoring, motivation, and the relationships that make students believe they can succeed",
      "Classroom management and creating psychologically safe learning environments",
      "Identifying students in crisis - emotional, social, or safeguarding - before problems escalate",
    ],
    pivots: [
      { role: "Instructional Designer", why: "Design the learning experiences that AI tools and platforms execute.", skills: ["E-learning design", "Learning science", "LMS platforms", "UX for learning"], timeline: "3-6 months", difficulty: 1 },
      { role: "EdTech Product Manager", why: "Build AI-powered learning tools using your deep pedagogical knowledge.", skills: ["Product management", "Learning analytics", "Curriculum design", "Stakeholder management"], timeline: "6-12 months", difficulty: 2 },
      { role: "Corporate L&D Lead", why: "Design and run learning programmes for organisations - well-funded, growing, and underserved.", skills: ["Needs analysis", "Workshop facilitation", "LMS administration", "ROI measurement"], timeline: "3-6 months", difficulty: 1 },
    ],
  },

  media_communications: {
    name: "Media & Communications",
    risk_pct: 48,
    timeline_years: 6,
    risk_drivers: [
      "Generative AI produces text, images, audio, and video content at scale and low cost",
      "AI news aggregators and summarisation tools reduce demand for original reporting",
      "Automated social media management tools handle scheduling, responses, and analytics",
    ],
    human_edges: [
      "Original investigative reporting, building source networks and pursuing stories over months",
      "Live editorial judgment in breaking news situations where speed and accuracy conflict",
      "Brand voice and cultural fluency that makes content feel authentically human",
    ],
    pivots: [
      { role: "Content Strategist", why: "Own the editorial strategy above the content generation layer.", skills: ["Content strategy", "Editorial planning", "SEO", "Distribution channels"], timeline: "3-6 months", difficulty: 1 },
      { role: "Podcast/Audio Producer", why: "Long-form human conversation and storytelling remains deeply engaging - and hard to automate.", skills: ["Audio production", "Storytelling", "Guest booking", "Audience development"], timeline: "3-6 months", difficulty: 1 },
      { role: "Communications Director", why: "Strategic comms leadership - reputation management, crisis, and executive messaging.", skills: ["Corporate communications", "Crisis management", "Speechwriting", "Media relations"], timeline: "1-2 years", difficulty: 3 },
    ],
  },

  trades_technical: {
    name: "Trades & Technical",
    risk_pct: 14,
    timeline_years: 14,
    risk_drivers: [
      "AI-assisted design tools generate schematics and installation plans",
      "Some inspection work is being augmented by drones and automated testing equipment",
      "Robotics in manufacturing is reducing demand for some repetitive assembly work",
    ],
    human_edges: [
      "Physical work in unstructured real-world environments that robots cannot yet navigate",
      "Fault diagnosis using tactile feedback, visual inspection, and contextual judgment",
      "Licensed work carrying legal liability - regulatory frameworks require qualified humans",
    ],
    pivots: [
      { role: "Renewable Energy Technician", why: "Solar, wind, and EV infrastructure is booming - your technical skills transfer directly.", skills: ["Solar PV installation", "Battery storage", "EV charging infrastructure", "Smart systems"], timeline: "3-6 months", difficulty: 1 },
      { role: "Building Automation Specialist", why: "Smart building systems need technical installers who understand both buildings and data.", skills: ["BMS systems", "HVAC controls", "IoT sensors", "Building data analytics"], timeline: "4-8 months", difficulty: 2 },
      { role: "Technical Inspector / Surveyor", why: "Inspection work grows as regulation increases - and needs physical presence AI cannot provide.", skills: ["Inspection methodology", "Regulatory standards", "Report writing", "Client communication"], timeline: "4-8 months", difficulty: 2 },
    ],
  },

  management_leadership: {
    name: "General Management & Leadership",
    risk_pct: 30,
    timeline_years: 9,
    risk_drivers: [
      "AI handles information synthesis, meeting summaries, and routine internal communications",
      "Automated dashboards and OKR tools reduce the need for manual reporting and tracking",
      "Some strategic analysis and planning work is being augmented by AI scenario tools",
    ],
    human_edges: [
      "Leading people through uncertainty, setbacks, and conflict - requiring empathy and authority",
      "Building organisational culture and the psychological safety that enables performance",
      "Stakeholder management at board and executive level where trust and relationships dominate",
    ],
    pivots: [
      { role: "Strategy Consultant", why: "Advise on complex strategic problems at multiple companies simultaneously.", skills: ["Strategic frameworks", "Business case development", "Executive communication", "Problem structuring"], timeline: "6-12 months", difficulty: 2 },
      { role: "Executive Coach", why: "Coach C-suite and senior leaders - a human-only craft in high demand as management complexity grows.", skills: ["Coaching methodology (ICF)", "Active listening", "Feedback frameworks", "Leadership psychology"], timeline: "9-18 months", difficulty: 3 },
      { role: "Board Director (Non-Executive)", why: "Governance and oversight are permanently human - your management experience is the credential.", skills: ["Corporate governance", "Board dynamics", "Risk oversight", "Stakeholder accountability"], timeline: "2-5 years", difficulty: 3 },
    ],
  },

  creative_arts: {
    name: "Creative Arts & Entertainment",
    risk_pct: 30,
    timeline_years: 9,
    risk_drivers: [
      "Generative AI creates images, music, video, and 3D assets faster than human production",
      "AI voice synthesis and digital actors are beginning to reduce demand for human talent",
      "Automated video editing and post-production tools compress the production pipeline",
    ],
    human_edges: [
      "Human creativity, lived experience, and authentic emotional expression in storytelling",
      "Live performance and the irreplaceable energy of human artists in real time",
      "Cultural relevance and the ability to read and respond to the moment",
    ],
    pivots: [
      { role: "Creative Director", why: "Direct and curate creative output - the judgment layer above AI production.", skills: ["Creative strategy", "Brief writing", "Talent management", "Brand vision"], timeline: "1-2 years", difficulty: 3 },
      { role: "AI Creative Producer", why: "Use AI tools to produce at 10x scale while maintaining artistic vision.", skills: ["Midjourney/DALL-E/Sora", "Prompt engineering for creatives", "Creative direction", "Production management"], timeline: "2-4 months", difficulty: 1 },
      { role: "IP Licensor / Creative Entrepreneur", why: "Monetise your creative IP through licensing, merchandise, and platforms rather than hourly production.", skills: ["IP law basics", "Brand building", "Platform strategy", "Licensing negotiation"], timeline: "6-18 months", difficulty: 2 },
    ],
  },

  research_science: {
    name: "Research & Science",
    risk_pct: 28,
    timeline_years: 10,
    risk_drivers: [
      "AI models (AlphaFold, AlphaCode) are making significant discoveries in specific scientific domains",
      "LLMs accelerate literature review, hypothesis generation, and grant writing",
      "Automated experimental platforms reduce human time in repetitive lab work",
    ],
    human_edges: [
      "Novel hypothesis generation that requires insight beyond existing data patterns",
      "Interdisciplinary synthesis connecting fields in ways that require broad human knowledge",
      "Ethical judgment and accountability in research design and publication",
    ],
    pivots: [
      { role: "Research Engineer (AI)", why: "Apply scientific rigour to building and evaluating AI systems.", skills: ["Python", "ML research methods", "Academic writing", "Experiment design"], timeline: "6-12 months", difficulty: 2 },
      { role: "Science Communicator", why: "Translate complex research into public understanding - an irreplaceable human skill.", skills: ["Science writing", "Video production", "Public speaking", "Social media for science"], timeline: "4-8 months", difficulty: 2 },
      { role: "Clinical Trials Manager", why: "Manage the human-facing complexity of clinical research that cannot be automated.", skills: ["GCP certification", "Protocol management", "Site coordination", "Regulatory submissions"], timeline: "4-8 months", difficulty: 2 },
    ],
  },

  real_estate_property: {
    name: "Real Estate & Property",
    risk_pct: 48,
    timeline_years: 6,
    risk_drivers: [
      "AI valuation platforms and AVMs are replacing manual appraisal for standard properties",
      "Virtual tours and online platforms reduce friction in property transactions",
      "AI lease abstraction tools extract obligations from commercial leases automatically",
    ],
    human_edges: [
      "Off-market deal sourcing through networks and relationships that no algorithm can replicate",
      "Negotiation in high-stakes property transactions with complex personal and commercial dynamics",
      "Local market knowledge and the pattern recognition built from years of transacting in a specific area",
    ],
    pivots: [
      { role: "PropTech Consultant", why: "Help real estate firms adopt AI tools - your domain knowledge is the critical ingredient.", skills: ["PropTech landscape", "Digital transformation", "Change management", "Client advisory"], timeline: "4-8 months", difficulty: 2 },
      { role: "Commercial Real Estate Analyst", why: "Move into investment analysis for commercial property where complexity resists automation.", skills: ["DCF modelling", "Market research", "Investment appraisal", "Lease analysis"], timeline: "4-8 months", difficulty: 2 },
      { role: "Property Developer", why: "Identify, acquire, and develop property - higher-value work that AI cannot lead.", skills: ["Development appraisal", "Planning and permitting", "Project management", "Development finance"], timeline: "1-3 years", difficulty: 3 },
    ],
  },

  public_sector: {
    name: "Public Sector & Policy",
    risk_pct: 28,
    timeline_years: 10,
    risk_drivers: [
      "AI is automating routine public service interactions through chatbots and digital portals",
      "Policy analysis and evidence synthesis is being augmented by AI research tools",
      "Administrative processing in benefits, licensing, and permits is increasingly automated",
    ],
    human_edges: [
      "Democratic accountability and the human judgment required in decisions that affect citizens' rights",
      "Stakeholder navigation across political, bureaucratic, and civil society systems",
      "Implementation leadership for complex public programmes that require organisational change",
    ],
    pivots: [
      { role: "Policy Adviser", why: "Advise Ministers or C-suite on policy design - judgment, relationships, and political acumen.", skills: ["Policy analysis", "Stakeholder engagement", "Brief writing", "Parliamentary processes"], timeline: "4-8 months", difficulty: 2 },
      { role: "Digital Government Consultant", why: "Help governments adopt digital and AI tools - the market is large and growing.", skills: ["Digital transformation", "Agile delivery", "Public sector procurement", "Change management"], timeline: "4-8 months", difficulty: 2 },
      { role: "Think Tank Researcher", why: "Produce policy-relevant research that shapes public debate - a human intellectual craft.", skills: ["Policy research", "Report writing", "Media engagement", "Stakeholder convening"], timeline: "4-8 months", difficulty: 2 },
    ],
  },
};

// ── Role Map ─────────────────────────────────────────────────────────────────
// Maps normalised job titles and aliases → sector + risk overrides
// Normalised = lowercase, no extra spaces
//
// Structure borrowed from ESCO occupational hierarchy and SOC classification
// Quiz use: sector field enables career path clustering and skills gap assessment

export const ROLE_MAP: Record<string, OntologyRole> = {

  // ─── Software Engineering ─────────────────────────────────────────────────
  "backend developer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "backend engineer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "frontend developer": { sector: "software_engineering", risk_pct: 46, timeline_years: null },
  "frontend engineer": { sector: "software_engineering", risk_pct: 46, timeline_years: null },
  "full stack developer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "full stack engineer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "fullstack developer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "fullstack engineer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "mobile developer": { sector: "software_engineering", risk_pct: 42, timeline_years: null },
  "ios developer": { sector: "software_engineering", risk_pct: 42, timeline_years: null },
  "android developer": { sector: "software_engineering", risk_pct: 42, timeline_years: null },
  "react developer": { sector: "software_engineering", risk_pct: 46, timeline_years: null },
  "react native developer": { sector: "software_engineering", risk_pct: 43, timeline_years: null },
  "node developer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "python developer": { sector: "software_engineering", risk_pct: 42, timeline_years: null },
  "java developer": { sector: "software_engineering", risk_pct: 44, timeline_years: null },
  "golang developer": { sector: "software_engineering", risk_pct: 40, timeline_years: null },
  "ruby developer": { sector: "software_engineering", risk_pct: 46, timeline_years: null },
  "php developer": { sector: "software_engineering", risk_pct: 50, timeline_years: null },
  "wordpress developer": { sector: "software_engineering", risk_pct: 55, timeline_years: 5 },
  "web developer": { sector: "software_engineering", risk_pct: 48, timeline_years: null },
  "game developer": { sector: "software_engineering", risk_pct: 36, timeline_years: 9 },
  "embedded software engineer": { sector: "software_engineering", risk_pct: 30, timeline_years: 10 },
  "firmware engineer": { sector: "software_engineering", risk_pct: 28, timeline_years: 11 },
  "qa engineer": { sector: "software_engineering", risk_pct: 52, timeline_years: 5, risk_drivers: ["AI testing tools write and run test suites automatically", "LLM-powered bug detection catches regressions before humans see them", "No-code testing platforms enable business users to write tests"], human_edges: ["Edge case intuition developed from deep product and user knowledge", "Exploratory testing that finds bugs no specification anticipated", "Quality advocacy across the organisation"], pivots: [{ role: "Software Engineer in Test (SET)", why: "Build the test infrastructure and frameworks that AI tools run on.", skills: ["Test automation frameworks", "CI/CD pipelines", "Python/JavaScript", "Performance testing"], timeline: "3-6 months", difficulty: 1 }, { role: "AI Quality Engineer", why: "Evaluate and validate AI model outputs - a growing discipline with specialist demand.", skills: ["LLM evaluation", "Adversarial testing", "Bias detection", "Model validation"], timeline: "4-8 months", difficulty: 2 }, { role: "Engineering Manager", why: "QA leadership and the people management layer are permanently human.", skills: ["Team leadership", "Engineering processes", "Stakeholder management", "Career development"], timeline: "6-12 months", difficulty: 2 }] },
  "sdet": { sector: "software_engineering", risk_pct: 50, timeline_years: 6 },
  "test engineer": { sector: "software_engineering", risk_pct: 52, timeline_years: 5 },
  "automation engineer": { sector: "software_engineering", risk_pct: 48, timeline_years: 6 },
  "database administrator": { sector: "software_engineering", risk_pct: 50, timeline_years: 6 },
  "dba": { sector: "software_engineering", risk_pct: 50, timeline_years: 6 },
  "it support": { sector: "software_engineering", risk_pct: 58, timeline_years: 5 },
  "help desk": { sector: "software_engineering", risk_pct: 62, timeline_years: 4 },
  "it helpdesk": { sector: "software_engineering", risk_pct: 62, timeline_years: 4 },
  "systems administrator": { sector: "software_engineering", risk_pct: 45, timeline_years: 7 },
  "sysadmin": { sector: "software_engineering", risk_pct: 45, timeline_years: 7 },
  "network engineer": { sector: "cloud_infrastructure", risk_pct: 38, timeline_years: 8 },
  "network administrator": { sector: "cloud_infrastructure", risk_pct: 42, timeline_years: 7 },
  "it manager": { sector: "software_engineering", risk_pct: 35, timeline_years: 8 },
  "cto": { sector: "software_engineering", risk_pct: 14, timeline_years: 12, risk_drivers: ["AI handles information synthesis and technical due diligence", "Technical advisory has some AI substitutes"], human_edges: ["Technology vision and conviction about what to build", "Building and leading engineering organisations through rapid change", "Translating technical strategy to board and investors"] },
  "vp engineering": { sector: "software_engineering", risk_pct: 18, timeline_years: 12 },
  "engineering manager": { sector: "software_engineering", risk_pct: 22, timeline_years: 10 },
  "tech lead": { sector: "software_engineering", risk_pct: 35, timeline_years: 9 },
  "principal engineer": { sector: "software_engineering", risk_pct: 28, timeline_years: 10 },
  "staff engineer": { sector: "software_engineering", risk_pct: 24, timeline_years: 11 },
  "it consultant": { sector: "software_engineering", risk_pct: 38, timeline_years: 8 },
  "erp consultant": { sector: "software_engineering", risk_pct: 42, timeline_years: 7 },
  "salesforce developer": { sector: "software_engineering", risk_pct: 48, timeline_years: 6 },
  "salesforce administrator": { sector: "software_engineering", risk_pct: 52, timeline_years: 6 },
  "sap consultant": { sector: "software_engineering", risk_pct: 42, timeline_years: 7 },
  "blockchain developer": { sector: "software_engineering", risk_pct: 32, timeline_years: 9 },
  "smart contract developer": { sector: "software_engineering", risk_pct: 35, timeline_years: 8 },

  // ─── Data & Analytics ─────────────────────────────────────────────────────
  "data analyst": { sector: "data_analytics", risk_pct: 48, timeline_years: 7 },
  "business intelligence analyst": { sector: "data_analytics", risk_pct: 52, timeline_years: 6 },
  "bi analyst": { sector: "data_analytics", risk_pct: 52, timeline_years: 6 },
  "bi developer": { sector: "data_analytics", risk_pct: 48, timeline_years: 7 },
  "data engineer": { sector: "data_analytics", risk_pct: 38, timeline_years: 8 },
  "analytics engineer": { sector: "data_analytics", risk_pct: 35, timeline_years: 9 },
  "data architect": { sector: "data_analytics", risk_pct: 30, timeline_years: 10 },
  "quantitative analyst": { sector: "data_analytics", risk_pct: 55, timeline_years: 6 },
  "quant analyst": { sector: "data_analytics", risk_pct: 55, timeline_years: 6 },
  "statistician": { sector: "data_analytics", risk_pct: 45, timeline_years: 7 },
  "market research analyst": { sector: "data_analytics", risk_pct: 55, timeline_years: 6 },
  "insights analyst": { sector: "data_analytics", risk_pct: 52, timeline_years: 6 },
  "product analyst": { sector: "data_analytics", risk_pct: 45, timeline_years: 7 },
  "revenue analyst": { sector: "data_analytics", risk_pct: 50, timeline_years: 6 },

  // ─── Cloud & Infrastructure ────────────────────────────────────────────────
  "cloud architect": { sector: "cloud_infrastructure", risk_pct: 28, timeline_years: 10 },
  "solutions architect": { sector: "cloud_infrastructure", risk_pct: 28, timeline_years: 10 },
  "aws architect": { sector: "cloud_infrastructure", risk_pct: 30, timeline_years: 9 },
  "azure architect": { sector: "cloud_infrastructure", risk_pct: 30, timeline_years: 9 },
  "gcp architect": { sector: "cloud_infrastructure", risk_pct: 30, timeline_years: 9 },
  "cloud engineer": { sector: "cloud_infrastructure", risk_pct: 35, timeline_years: 8 },
  "infrastructure engineer": { sector: "cloud_infrastructure", risk_pct: 36, timeline_years: 8 },
  "reliability engineer": { sector: "cloud_infrastructure", risk_pct: 34, timeline_years: 9 },
  "platform engineer": { sector: "cloud_infrastructure", risk_pct: 32, timeline_years: 9 },
  "devsecops engineer": { sector: "cloud_infrastructure", risk_pct: 30, timeline_years: 10 },
  "security engineer": { sector: "cloud_infrastructure", risk_pct: 22, timeline_years: 11 },

  // ─── Product Management ────────────────────────────────────────────────────
  "product owner": { sector: "product_management", risk_pct: 40, timeline_years: 7 },
  "technical product manager": { sector: "product_management", risk_pct: 32, timeline_years: 9 },
  "growth product manager": { sector: "product_management", risk_pct: 38, timeline_years: 8 },
  "platform product manager": { sector: "product_management", risk_pct: 35, timeline_years: 9 },
  "data product manager": { sector: "product_management", risk_pct: 35, timeline_years: 9 },
  "vp product": { sector: "product_management", risk_pct: 22, timeline_years: 11 },
  "chief product officer": { sector: "product_management", risk_pct: 14, timeline_years: 13 },
  "cpo": { sector: "product_management", risk_pct: 14, timeline_years: 13 },
  "head of product": { sector: "product_management", risk_pct: 25, timeline_years: 10 },

  // ─── Design ───────────────────────────────────────────────────────────────
  "visual designer": { sector: "design", risk_pct: 38, timeline_years: 7 },
  "product designer": { sector: "design", risk_pct: 32, timeline_years: 9 },
  "ui designer": { sector: "design", risk_pct: 40, timeline_years: 7 },
  "motion designer": { sector: "design", risk_pct: 42, timeline_years: 7 },
  "interaction designer": { sector: "design", risk_pct: 35, timeline_years: 8 },
  "service designer": { sector: "design", risk_pct: 28, timeline_years: 10 },
  "brand designer": { sector: "design", risk_pct: 36, timeline_years: 8 },
  "graphic designer": { sector: "design", risk_pct: 42, timeline_years: 7 },
  "illustrator": { sector: "design", risk_pct: 45, timeline_years: 6 },
  "3d artist": { sector: "design", risk_pct: 48, timeline_years: 6 },
  "animator": { sector: "design", risk_pct: 46, timeline_years: 6 },
  "design system lead": { sector: "design", risk_pct: 28, timeline_years: 10 },
  "head of design": { sector: "design", risk_pct: 22, timeline_years: 11 },
  "vp design": { sector: "design", risk_pct: 18, timeline_years: 12 },

  // ─── Sales ─────────────────────────────────────────────────────────────────
  "account executive": { sector: "sales", risk_pct: 48, timeline_years: 6 },
  "ae": { sector: "sales", risk_pct: 48, timeline_years: 6 },
  "enterprise account executive": { sector: "sales", risk_pct: 35, timeline_years: 8 },
  "sales development representative": { sector: "sales", risk_pct: 72, timeline_years: 4, risk_drivers: ["AI outreach tools write and send personalised cold sequences at scale", "AI lead scoring removes the manual qualification work SDRs do", "Automated dialers and email tools run entire outbound motions unattended"], human_edges: ["Live prospect calls requiring improvisation and genuine rapport", "Creative multi-touch strategies for hard-to-reach prospects", "Building the early relationship that transitions into a long-term account"], pivots: [{ role: "Account Executive", why: "Graduate from prospecting to owning the full sales cycle.", skills: ["Discovery methodology", "Demo skills", "Contract negotiation", "Forecasting"], timeline: "6-12 months", difficulty: 2 }, { role: "Revenue Operations Analyst", why: "Build the sales tech stack and data systems - your pipeline knowledge is the advantage.", skills: ["Salesforce/HubSpot", "SQL", "Sales analytics", "Process design"], timeline: "4-8 months", difficulty: 1 }, { role: "Growth Marketing Manager", why: "Shift from outbound sales to building inbound pipelines that scale without headcount.", skills: ["Demand generation", "Performance marketing", "Marketing automation", "Content strategy"], timeline: "6-12 months", difficulty: 2 }] },
  "sdr": { sector: "sales", risk_pct: 72, timeline_years: 4 },
  "bdr": { sector: "sales", risk_pct: 70, timeline_years: 4 },
  "business development representative": { sector: "sales", risk_pct: 70, timeline_years: 4 },
  "inside sales": { sector: "sales", risk_pct: 60, timeline_years: 5 },
  "inside sales representative": { sector: "sales", risk_pct: 60, timeline_years: 5 },
  "sales manager": { sector: "sales", risk_pct: 35, timeline_years: 8 },
  "vp sales": { sector: "sales", risk_pct: 22, timeline_years: 11 },
  "chief revenue officer": { sector: "sales", risk_pct: 18, timeline_years: 12 },
  "cro": { sector: "sales", risk_pct: 18, timeline_years: 12 },
  "head of sales": { sector: "sales", risk_pct: 25, timeline_years: 10 },
  "channel sales manager": { sector: "sales", risk_pct: 42, timeline_years: 7 },
  "field sales representative": { sector: "sales", risk_pct: 44, timeline_years: 7 },
  "retail sales associate": { sector: "sales", risk_pct: 65, timeline_years: 5 },
  "retail assistant": { sector: "sales", risk_pct: 68, timeline_years: 5 },
  "customer success manager": { sector: "sales", risk_pct: 38, timeline_years: 8 },
  "csm": { sector: "sales", risk_pct: 38, timeline_years: 8 },
  "account manager": { sector: "sales", risk_pct: 42, timeline_years: 7 },
  "key account manager": { sector: "sales", risk_pct: 36, timeline_years: 8 },
  "revenue operations manager": { sector: "sales", risk_pct: 32, timeline_years: 9 },
  "revops manager": { sector: "sales", risk_pct: 32, timeline_years: 9 },
  "sales enablement manager": { sector: "sales", risk_pct: 45, timeline_years: 7 },
  "partnerships manager": { sector: "sales", risk_pct: 35, timeline_years: 8 },

  // ─── Finance Operations ────────────────────────────────────────────────────
  "accounts payable": { sector: "finance_ops", risk_pct: 78, timeline_years: 4 },
  "accounts receivable": { sector: "finance_ops", risk_pct: 75, timeline_years: 4 },
  "payroll specialist": { sector: "finance_ops", risk_pct: 72, timeline_years: 4 },
  "payroll manager": { sector: "finance_ops", risk_pct: 62, timeline_years: 5 },
  "accounts assistant": { sector: "finance_ops", risk_pct: 78, timeline_years: 4 },
  "finance manager": { sector: "finance_ops", risk_pct: 52, timeline_years: 6 },
  "finance director": { sector: "finance_ops", risk_pct: 38, timeline_years: 8 },
  "financial controller": { sector: "finance_ops", risk_pct: 45, timeline_years: 7 },
  "fp&a analyst": { sector: "finance_ops", risk_pct: 52, timeline_years: 6 },
  "fp&a manager": { sector: "finance_ops", risk_pct: 40, timeline_years: 8 },
  "treasury analyst": { sector: "finance_ops", risk_pct: 58, timeline_years: 6 },
  "treasury manager": { sector: "finance_ops", risk_pct: 45, timeline_years: 7 },
  "tax manager": { sector: "finance_ops", risk_pct: 50, timeline_years: 6 },
  "tax consultant": { sector: "finance_ops", risk_pct: 55, timeline_years: 6 },
  "audit manager": { sector: "finance_ops", risk_pct: 48, timeline_years: 7 },
  "internal auditor": { sector: "finance_ops", risk_pct: 55, timeline_years: 6 },
  "external auditor": { sector: "finance_ops", risk_pct: 58, timeline_years: 6 },
  "credit analyst": { sector: "finance_ops", risk_pct: 62, timeline_years: 5 },
  "portfolio manager": { sector: "finance_ops", risk_pct: 52, timeline_years: 6 },
  "wealth manager": { sector: "finance_ops", risk_pct: 48, timeline_years: 7 },
  "private banker": { sector: "finance_ops", risk_pct: 42, timeline_years: 7 },
  "fund accountant": { sector: "finance_ops", risk_pct: 68, timeline_years: 5 },
  "hedge fund analyst": { sector: "finance_ops", risk_pct: 62, timeline_years: 5 },
  "trader": { sector: "finance_ops", risk_pct: 60, timeline_years: 6 },
  "equities trader": { sector: "finance_ops", risk_pct: 65, timeline_years: 5 },
  "cfo": { sector: "finance_ops", risk_pct: 15, timeline_years: 13 },
  "chief financial officer": { sector: "finance_ops", risk_pct: 15, timeline_years: 13 },

  // ─── HR & People ──────────────────────────────────────────────────────────
  "talent acquisition specialist": { sector: "hr_people", risk_pct: 55, timeline_years: 5 },
  "recruiter": { sector: "hr_people", risk_pct: 58, timeline_years: 5 },
  "technical recruiter": { sector: "hr_people", risk_pct: 52, timeline_years: 6 },
  "talent acquisition manager": { sector: "hr_people", risk_pct: 42, timeline_years: 7 },
  "head of talent": { sector: "hr_people", risk_pct: 35, timeline_years: 8 },
  "hrbp": { sector: "hr_people", risk_pct: 38, timeline_years: 8 },
  "hr business partner": { sector: "hr_people", risk_pct: 38, timeline_years: 8 },
  "hr generalist": { sector: "hr_people", risk_pct: 52, timeline_years: 6 },
  "hr coordinator": { sector: "hr_people", risk_pct: 62, timeline_years: 5 },
  "hr administrator": { sector: "hr_people", risk_pct: 68, timeline_years: 4 },
  "compensation and benefits manager": { sector: "hr_people", risk_pct: 55, timeline_years: 6 },
  "learning and development manager": { sector: "hr_people", risk_pct: 38, timeline_years: 8 },
  "l&d manager": { sector: "hr_people", risk_pct: 38, timeline_years: 8 },
  "organisational development manager": { sector: "hr_people", risk_pct: 30, timeline_years: 9 },
  "people analytics manager": { sector: "hr_people", risk_pct: 40, timeline_years: 8 },
  "chief people officer": { sector: "hr_people", risk_pct: 14, timeline_years: 13 },
  "chief hr officer": { sector: "hr_people", risk_pct: 14, timeline_years: 13 },

  // ─── Digital Marketing ────────────────────────────────────────────────────
  "seo specialist": { sector: "marketing_digital", risk_pct: 55, timeline_years: 5 },
  "seo manager": { sector: "marketing_digital", risk_pct: 50, timeline_years: 6 },
  "paid media manager": { sector: "marketing_digital", risk_pct: 52, timeline_years: 6 },
  "ppc specialist": { sector: "marketing_digital", risk_pct: 55, timeline_years: 5 },
  "performance marketing manager": { sector: "marketing_digital", risk_pct: 48, timeline_years: 6 },
  "social media manager": { sector: "marketing_digital", risk_pct: 55, timeline_years: 5 },
  "social media specialist": { sector: "marketing_digital", risk_pct: 58, timeline_years: 5 },
  "email marketing manager": { sector: "marketing_digital", risk_pct: 58, timeline_years: 5 },
  "crm manager": { sector: "marketing_digital", risk_pct: 50, timeline_years: 6 },
  "lifecycle marketing manager": { sector: "marketing_digital", risk_pct: 50, timeline_years: 6 },
  "growth hacker": { sector: "marketing_digital", risk_pct: 40, timeline_years: 7 },
  "community manager": { sector: "marketing_digital", risk_pct: 40, timeline_years: 8 },
  "influencer marketing manager": { sector: "marketing_digital", risk_pct: 38, timeline_years: 8 },
  "content marketing manager": { sector: "marketing_digital", risk_pct: 52, timeline_years: 6 },
  "copywriter": { sector: "marketing_digital", risk_pct: 62, timeline_years: 5 },
  "digital marketing manager": { sector: "marketing_digital", risk_pct: 44, timeline_years: 7 },
  "demand generation manager": { sector: "marketing_digital", risk_pct: 45, timeline_years: 7 },
  "cmo": { sector: "marketing_digital", risk_pct: 16, timeline_years: 12 },
  "chief marketing officer": { sector: "marketing_digital", risk_pct: 16, timeline_years: 12 },
  "head of marketing": { sector: "marketing_digital", risk_pct: 25, timeline_years: 10 },
  "vp marketing": { sector: "marketing_digital", risk_pct: 20, timeline_years: 11 },
  "affiliate marketing manager": { sector: "marketing_digital", risk_pct: 55, timeline_years: 5 },
  "product marketing manager": { sector: "marketing_digital", risk_pct: 38, timeline_years: 8 },
  "developer relations": { sector: "marketing_digital", risk_pct: 30, timeline_years: 10 },
  "devrel": { sector: "marketing_digital", risk_pct: 30, timeline_years: 10 },

  // ─── Legal ────────────────────────────────────────────────────────────────
  "solicitor": { sector: "legal", risk_pct: 52, timeline_years: 6 },
  "barrister": { sector: "legal", risk_pct: 35, timeline_years: 9 },
  "corporate lawyer": { sector: "legal", risk_pct: 50, timeline_years: 6 },
  "in-house counsel": { sector: "legal", risk_pct: 42, timeline_years: 7 },
  "general counsel": { sector: "legal", risk_pct: 28, timeline_years: 10 },
  "ip lawyer": { sector: "legal", risk_pct: 45, timeline_years: 7 },
  "employment lawyer": { sector: "legal", risk_pct: 48, timeline_years: 7 },
  "family lawyer": { sector: "legal", risk_pct: 32, timeline_years: 9 },
  "criminal lawyer": { sector: "legal", risk_pct: 28, timeline_years: 10 },
  "criminal barrister": { sector: "legal", risk_pct: 25, timeline_years: 11 },
  "immigration lawyer": { sector: "legal", risk_pct: 42, timeline_years: 7 },
  "real estate lawyer": { sector: "legal", risk_pct: 55, timeline_years: 5 },
  "legal counsel": { sector: "legal", risk_pct: 48, timeline_years: 7 },
  "attorney": { sector: "legal", risk_pct: 50, timeline_years: 6 },

  // ─── Healthcare (Clinical) ────────────────────────────────────────────────
  "radiologist": { sector: "healthcare_clinical", risk_pct: 28, timeline_years: 10, risk_drivers: ["AI diagnostic imaging outperforms humans in specific cancer detection tasks", "Deep learning models for chest X-ray and MRI read are FDA-cleared"], human_edges: ["Complex multi-system cases requiring clinical correlation beyond imaging", "Patient communication and shared decision-making on imaging findings", "Interventional radiology procedures requiring physical dexterity"] },
  "pathologist": { sector: "healthcare_clinical", risk_pct: 30, timeline_years: 10 },
  "dentist": { sector: "healthcare_clinical", risk_pct: 20, timeline_years: 12 },
  "optometrist": { sector: "healthcare_clinical", risk_pct: 24, timeline_years: 11 },
  "physiotherapist": { sector: "healthcare_clinical", risk_pct: 12, timeline_years: 14 },
  "physical therapist": { sector: "healthcare_clinical", risk_pct: 12, timeline_years: 14 },
  "occupational therapist": { sector: "healthcare_clinical", risk_pct: 10, timeline_years: 15 },
  "dietitian": { sector: "healthcare_clinical", risk_pct: 25, timeline_years: 10 },
  "nutritionist": { sector: "healthcare_clinical", risk_pct: 30, timeline_years: 9 },
  "speech therapist": { sector: "healthcare_clinical", risk_pct: 12, timeline_years: 14 },
  "paramedic": { sector: "healthcare_clinical", risk_pct: 8, timeline_years: 99 },
  "midwife": { sector: "healthcare_clinical", risk_pct: 6, timeline_years: 99 },
  "psychiatrist": { sector: "healthcare_clinical", risk_pct: 18, timeline_years: 12 },
  "psychologist": { sector: "healthcare_clinical", risk_pct: 16, timeline_years: 13 },
  "epidemiologist": { sector: "healthcare_clinical", risk_pct: 28, timeline_years: 10 },
  "medical researcher": { sector: "research_science", risk_pct: 25, timeline_years: 10 },
  "clinical researcher": { sector: "research_science", risk_pct: 28, timeline_years: 10 },
  "clinical trials manager": { sector: "research_science", risk_pct: 30, timeline_years: 9 },
  "gp": { sector: "healthcare_clinical", risk_pct: 18, timeline_years: 12 },
  "dermatologist": { sector: "healthcare_clinical", risk_pct: 30, timeline_years: 10 },
  "anaesthesiologist": { sector: "healthcare_clinical", risk_pct: 18, timeline_years: 12 },
  "anesthesiologist": { sector: "healthcare_clinical", risk_pct: 18, timeline_years: 12 },
  "emergency physician": { sector: "healthcare_clinical", risk_pct: 12, timeline_years: 14 },

  // ─── Healthcare (Admin) ───────────────────────────────────────────────────
  "healthcare manager": { sector: "healthcare_admin", risk_pct: 35, timeline_years: 9 },
  "hospital administrator": { sector: "healthcare_admin", risk_pct: 40, timeline_years: 8 },
  "clinic manager": { sector: "healthcare_admin", risk_pct: 38, timeline_years: 8 },
  "medical receptionist": { sector: "healthcare_admin", risk_pct: 65, timeline_years: 5 },
  "medical secretary": { sector: "healthcare_admin", risk_pct: 70, timeline_years: 4 },
  "medical coder": { sector: "healthcare_admin", risk_pct: 78, timeline_years: 4 },
  "health informatics manager": { sector: "healthcare_admin", risk_pct: 28, timeline_years: 10 },
  "patient experience manager": { sector: "healthcare_admin", risk_pct: 32, timeline_years: 9 },

  // ─── Education ────────────────────────────────────────────────────────────
  "school counselor": { sector: "education", risk_pct: 12, timeline_years: 14 },
  "school principal": { sector: "education", risk_pct: 14, timeline_years: 13 },
  "academic advisor": { sector: "education", risk_pct: 35, timeline_years: 8 },
  "curriculum designer": { sector: "education", risk_pct: 30, timeline_years: 9 },
  "corporate trainer": { sector: "education", risk_pct: 35, timeline_years: 8 },
  "training specialist": { sector: "education", risk_pct: 40, timeline_years: 7 },
  "elearning developer": { sector: "education", risk_pct: 45, timeline_years: 6 },
  "education administrator": { sector: "education", risk_pct: 45, timeline_years: 7 },
  "university lecturer": { sector: "education", risk_pct: 22, timeline_years: 11 },
  "special education teacher": { sector: "education", risk_pct: 10, timeline_years: 15 },
  "early years educator": { sector: "education", risk_pct: 8, timeline_years: 99 },
  "teaching assistant": { sector: "education", risk_pct: 28, timeline_years: 10 },

  // ─── Media & Communications ───────────────────────────────────────────────
  "journalist": { sector: "media_communications", risk_pct: 48, timeline_years: 6 },
  "reporter": { sector: "media_communications", risk_pct: 52, timeline_years: 6 },
  "editor": { sector: "media_communications", risk_pct: 40, timeline_years: 7 },
  "video editor": { sector: "media_communications", risk_pct: 52, timeline_years: 6 },
  "photographer": { sector: "media_communications", risk_pct: 38, timeline_years: 8 },
  "videographer": { sector: "media_communications", risk_pct: 42, timeline_years: 7 },
  "pr manager": { sector: "media_communications", risk_pct: 40, timeline_years: 8 },
  "public relations manager": { sector: "media_communications", risk_pct: 40, timeline_years: 8 },
  "communications manager": { sector: "media_communications", risk_pct: 38, timeline_years: 8 },
  "podcast producer": { sector: "media_communications", risk_pct: 30, timeline_years: 10 },
  "broadcast journalist": { sector: "media_communications", risk_pct: 42, timeline_years: 7 },
  "screenwriter": { sector: "creative_arts", risk_pct: 40, timeline_years: 8 },
  "film director": { sector: "creative_arts", risk_pct: 18, timeline_years: 13 },
  "music producer": { sector: "creative_arts", risk_pct: 38, timeline_years: 8 },

  // ─── Trades & Technical ───────────────────────────────────────────────────
  "plumber": { sector: "trades_technical", risk_pct: 10, timeline_years: 99 },
  "carpenter": { sector: "trades_technical", risk_pct: 12, timeline_years: 14 },
  "joiner": { sector: "trades_technical", risk_pct: 12, timeline_years: 14 },
  "welder": { sector: "trades_technical", risk_pct: 22, timeline_years: 10 },
  "hvac technician": { sector: "trades_technical", risk_pct: 14, timeline_years: 14 },
  "hvac engineer": { sector: "trades_technical", risk_pct: 14, timeline_years: 14 },
  "mechanical engineer": { sector: "trades_technical", risk_pct: 22, timeline_years: 11 },
  "civil engineer": { sector: "trades_technical", risk_pct: 20, timeline_years: 12 },
  "structural engineer": { sector: "trades_technical", risk_pct: 22, timeline_years: 11 },
  "quantity surveyor": { sector: "trades_technical", risk_pct: 45, timeline_years: 7 },
  "site manager": { sector: "trades_technical", risk_pct: 18, timeline_years: 12 },
  "construction manager": { sector: "trades_technical", risk_pct: 20, timeline_years: 11 },
  "building inspector": { sector: "trades_technical", risk_pct: 28, timeline_years: 10 },
  "quality control inspector": { sector: "trades_technical", risk_pct: 45, timeline_years: 7 },
  "maintenance engineer": { sector: "trades_technical", risk_pct: 22, timeline_years: 11 },
  "facilities manager": { sector: "trades_technical", risk_pct: 30, timeline_years: 9 },
  "health and safety manager": { sector: "trades_technical", risk_pct: 25, timeline_years: 10 },
  "environmental engineer": { sector: "trades_technical", risk_pct: 20, timeline_years: 11 },
  "chemical engineer": { sector: "trades_technical", risk_pct: 25, timeline_years: 10 },
  "process engineer": { sector: "trades_technical", risk_pct: 28, timeline_years: 10 },
  "manufacturing engineer": { sector: "trades_technical", risk_pct: 30, timeline_years: 9 },
  "controls engineer": { sector: "trades_technical", risk_pct: 22, timeline_years: 11 },
  "logistics coordinator": { sector: "trades_technical", risk_pct: 55, timeline_years: 5 },
  "warehouse manager": { sector: "trades_technical", risk_pct: 42, timeline_years: 7 },

  // ─── Management & Leadership ──────────────────────────────────────────────
  "ceo": { sector: "management_leadership", risk_pct: 8, timeline_years: 99 },
  "chief executive officer": { sector: "management_leadership", risk_pct: 8, timeline_years: 99 },
  "coo": { sector: "management_leadership", risk_pct: 14, timeline_years: 13 },
  "chief operating officer": { sector: "management_leadership", risk_pct: 14, timeline_years: 13 },
  "general manager": { sector: "management_leadership", risk_pct: 28, timeline_years: 10 },
  "country manager": { sector: "management_leadership", risk_pct: 24, timeline_years: 10 },
  "regional manager": { sector: "management_leadership", risk_pct: 30, timeline_years: 9 },
  "executive assistant": { sector: "management_leadership", risk_pct: 55, timeline_years: 5 },
  "office manager": { sector: "management_leadership", risk_pct: 52, timeline_years: 6 },
  "chief of staff": { sector: "management_leadership", risk_pct: 25, timeline_years: 10 },
  "strategy manager": { sector: "management_leadership", risk_pct: 32, timeline_years: 9 },
  "head of strategy": { sector: "management_leadership", risk_pct: 25, timeline_years: 10 },
  "policy analyst": { sector: "public_sector", risk_pct: 32, timeline_years: 9 },
  "management consultant": { sector: "management_leadership", risk_pct: 38, timeline_years: 8 },
  "strategy consultant": { sector: "management_leadership", risk_pct: 35, timeline_years: 8 },

  // ─── Real Estate & Property ───────────────────────────────────────────────
  "property manager": { sector: "real_estate_property", risk_pct: 45, timeline_years: 7 },
  "commercial property manager": { sector: "real_estate_property", risk_pct: 40, timeline_years: 8 },
  "letting agent": { sector: "real_estate_property", risk_pct: 55, timeline_years: 5 },
  "property developer": { sector: "real_estate_property", risk_pct: 22, timeline_years: 11 },
  "real estate investor": { sector: "real_estate_property", risk_pct: 20, timeline_years: 12 },
  "valuation surveyor": { sector: "real_estate_property", risk_pct: 48, timeline_years: 6 },
  "commercial property surveyor": { sector: "real_estate_property", risk_pct: 40, timeline_years: 8 },

  // ─── Public Sector & Policy ───────────────────────────────────────────────
  "civil servant": { sector: "public_sector", risk_pct: 30, timeline_years: 9 },
  "government analyst": { sector: "public_sector", risk_pct: 38, timeline_years: 8 },
  "public health officer": { sector: "public_sector", risk_pct: 25, timeline_years: 10 },
  "diplomat": { sector: "public_sector", risk_pct: 10, timeline_years: 99 },
  "military officer": { sector: "public_sector", risk_pct: 12, timeline_years: 14 },
  "police officer": { sector: "public_sector", risk_pct: 22, timeline_years: 11, risk_drivers: ["Predictive policing AI tools flag high-risk individuals and locations", "Automated surveillance and facial recognition reduce beat patrol requirements", "AI processes crime data, generates reports, and manages evidence"], human_edges: ["De-escalation, physical presence, and the human authority that maintains public order", "Community policing relationships and trust that prevent crime before it happens", "Moral and legal judgment in complex situations where discretion is essential"], pivots: [{ role: "Cybercrime Investigator", why: "Apply your investigation skills to digital crime - the fastest growing category of criminal offending.", skills: ["Digital forensics", "OSINT", "Network analysis", "Cyber law"], timeline: "6-12 months", difficulty: 2 }, { role: "Security Consultant", why: "Private sector security roles pay significantly more and use your risk assessment expertise.", skills: ["Physical security assessment", "Risk management", "Client advisory", "Report writing"], timeline: "4-8 months", difficulty: 1 }, { role: "Intelligence Analyst", why: "Analytical skills and investigative judgment are in high demand in intelligence and corporate risk.", skills: ["Intelligence analysis methods", "Data analysis", "Report writing", "OSINT"], timeline: "4-8 months", difficulty: 2 }] },
  "detective": { sector: "public_sector", risk_pct: 20, timeline_years: 12 },
  "social policy analyst": { sector: "public_sector", risk_pct: 30, timeline_years: 9 },
  "urban planner": { sector: "public_sector", risk_pct: 28, timeline_years: 10 },
  "town planner": { sector: "public_sector", risk_pct: 28, timeline_years: 10 },

  // ─── Creative Arts & Entertainment ────────────────────────────────────────
  "actor": { sector: "creative_arts", risk_pct: 25, timeline_years: 10 },
  "musician": { sector: "creative_arts", risk_pct: 30, timeline_years: 9 },
  "singer": { sector: "creative_arts", risk_pct: 28, timeline_years: 10 },
  "dancer": { sector: "creative_arts", risk_pct: 18, timeline_years: 12 },
  "comedian": { sector: "creative_arts", risk_pct: 15, timeline_years: 13 },
  "author": { sector: "creative_arts", risk_pct: 35, timeline_years: 8 },
  "novelist": { sector: "creative_arts", risk_pct: 32, timeline_years: 9 },
  "game designer": { sector: "creative_arts", risk_pct: 30, timeline_years: 9 },
  "voice actor": { sector: "creative_arts", risk_pct: 42, timeline_years: 7 },

  // ─── Research & Science ───────────────────────────────────────────────────
  "academic researcher": { sector: "research_science", risk_pct: 25, timeline_years: 11 },
  "research scientist": { sector: "research_science", risk_pct: 22, timeline_years: 12 },
  "data scientist": { sector: "data_analytics", risk_pct: 40, timeline_years: 8 },
  "economist": { sector: "research_science", risk_pct: 38, timeline_years: 8 },
  "environmental scientist": { sector: "research_science", risk_pct: 22, timeline_years: 11 },
  "biotechnologist": { sector: "research_science", risk_pct: 20, timeline_years: 12 },
  "biologist": { sector: "research_science", risk_pct: 22, timeline_years: 11 },
  "chemist": { sector: "research_science", risk_pct: 28, timeline_years: 10 },
  "physicist": { sector: "research_science", risk_pct: 18, timeline_years: 12 },
  "materials scientist": { sector: "research_science", risk_pct: 22, timeline_years: 11 },

  // ─── Hospitality & Service ────────────────────────────────────────────────
  "hotel manager": { sector: "management_leadership", risk_pct: 30, timeline_years: 9 },
  "restaurant manager": { sector: "management_leadership", risk_pct: 32, timeline_years: 9 },
  "events manager": { sector: "management_leadership", risk_pct: 28, timeline_years: 10 },
  "event coordinator": { sector: "management_leadership", risk_pct: 35, timeline_years: 8 },
  "cabin crew": { sector: "management_leadership", risk_pct: 20, timeline_years: 12 },
  "flight attendant": { sector: "management_leadership", risk_pct: 20, timeline_years: 12 },
  "travel agent": { sector: "sales", risk_pct: 62, timeline_years: 5 },
  "concierge": { sector: "management_leadership", risk_pct: 38, timeline_years: 8 },
};

// ── Lookup function ──────────────────────────────────────────────────────────

/**
 * Look up a normalised job title in the ontology.
 * Returns a fully resolved role profile (sector defaults merged with overrides).
 */
export function lookupOntology(normalisedInput: string): {
  title: string;
  risk_pct: number;
  timeline_years: number;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_drivers: string[];
  human_edges: string[];
  pivots: OntologyPivot[];
  sector: string;
} | null {
  // Direct lookup
  const entry = ROLE_MAP[normalisedInput];
  if (!entry) return null;

  const sector = SECTORS[entry.sector];
  if (!sector) return null;

  const risk_pct = entry.risk_pct ?? sector.risk_pct;
  const timeline_years = entry.timeline_years ?? sector.timeline_years;

  return {
    title: toTitleCase(normalisedInput),
    risk_pct,
    timeline_years,
    risk_level: getRiskLevel(risk_pct),
    risk_drivers: entry.risk_drivers ?? sector.risk_drivers,
    human_edges: entry.human_edges ?? sector.human_edges,
    pivots: entry.pivots ?? sector.pivots,
    sector: sector.name,
  };
}

function getRiskLevel(pct: number): "low" | "medium" | "high" | "critical" {
  if (pct >= 80) return "critical";
  if (pct >= 60) return "high";
  if (pct >= 30) return "medium";
  return "low";
}

function toTitleCase(s: string): string {
  const exceptions = new Set(["and", "of", "in", "at", "for", "the", "a", "an"]);
  return s
    .split(/\s+/)
    .map((w, i) => (i === 0 || !exceptions.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(" ");
}
