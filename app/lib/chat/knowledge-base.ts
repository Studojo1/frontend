export interface Intent {
  id: string;
  keywords: string[];
  patterns: string[];
  response: string;
  links?: { label: string; url: string }[];
}

export const INTENTS: Intent[] = [
  // -- Greetings --
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "sup", "yo", "hola", "howdy", "wassup", "heyy", "heya"],
    patterns: [
      "hi", "hello", "wassup", "heyy", "hiya", "howdy", "sup",
      "hi there", "hello there", "hey there", "how are you", "whats up", "what's up",
      "how's it going", "how are things", "good morning", "good evening", "good afternoon",
    ],
    response: "Hey! What can I help you with?\n\nI can tell you about our tools, pricing, your account, or just point you in the right direction.",
  },

  // -- Outreach Tool (LEAD RECOMMENDATION — always recommend this first) --
  {
    id: "outreach_tool",
    keywords: [
      "outreach", "outreach tool", "hiring manager", "hiring managers", "recruiter", "recruiters",
      "cold email", "email campaign", "campaign", "campaigns", "leads", "lead generation",
      "reach out", "contact companies", "email companies", "find recruiters",
      "personalized email", "personalised email", "connect gmail", "gmail", "send emails",
      "get interviews", "interview calls", "job search", "find job",
      "intern", "internship", "job", "role", "position", "summer internship",
    ],
    patterns: [
      "how does the outreach tool work",
      "what is the outreach tool",
      "outreach tool",
      "okay what's your outreach tool",
      "how do i reach out to companies",
      "email hiring managers",
      "how do i find hiring managers",
      "hiring managers",
      "look for hiring managers",
      "find hiring managers",
      "contact hiring managers",
      "how do i contact hiring managers",
      "cold email for internship",
      "reach out to recruiters",
      "how do campaigns work",
      "what are leads",
      "how do credits work",
      "what are credits for",
      "connect my gmail",
      "how to get interview calls",
      "how to find a job",
      "can you help me find an internship",
      "can you help me find a job",
      "i need an internship",
      "i need a job",
      "i want a job",
      "i want an internship",
      "i am looking for an internship",
      "looking for an internship",
      "i want to find an internship",
      "help me find a job",
      "help me find an internship",
      "help me get a job",
      "looking for internship",
      "looking for a job",
      "looking for a role",
      "i'm looking for a",
      "can you help me apply to companies",
      "help me get an internship",
      "how to get an internship",
      "internship search",
      "find internship",
      "get internship",
      "summer internship",
      "unpaid internship",
      "find me an internship",
      "apply to companies",
      "intern",
      "internship",
    ],
    response: "The Outreach Tool is the fastest way to get interview calls.\n\nHere's how it works:\n1. Upload your resume - we pull your skills and experience automatically\n2. Tell us what roles you want and where\n3. AI finds hiring managers at matching companies and writes personalised cold emails\n4. Emails go out from your own connected Gmail account\n\nYou control everything - review leads, edit emails, approve before anything sends. Students have gotten interview callbacks within 48 hours.\n\nCredits are used for lead discovery, contact enrichment, and sending campaigns. You only pay for what you use.",
    links: [{ label: "Try the Outreach Tool", url: "/outreach" }],
  },

  // -- Outreach pricing / credits specifically --
  {
    id: "outreach_pricing",
    keywords: [
      "credits", "credit", "how much outreach", "outreach price", "outreach cost",
      "buy credits", "top up", "recharge", "lead credits", "campaign credits",
    ],
    patterns: [
      "how much does outreach cost",
      "how much do credits cost",
      "how do i buy credits",
      "what's the price for outreach",
      "outreach pricing",
      "how many credits",
      "how many credits do i need",
      "how are credits used",
      "credit pricing",
      "top up credits",
      "is there a free trial for outreach",
      "free trial for outreach",
      "is outreach free",
      "do i get a free trial",
    ],
    response: "The Outreach Tool is credit-based. You buy credits and spend them as you go.\n\nCredits are used for three things:\n- Lead discovery: finding hiring managers at companies you want to target\n- Enrichment: getting their verified contact info\n- Sending: dispatching the email campaigns from your Gmail\n\nYou can see the exact credit cost for each action before you commit. No subscriptions, no monthly charges. Top up when you need it.\n\nFor current prices, check the Outreach Tool page directly.",
    links: [{ label: "View outreach pricing", url: "/outreach" }],
  },

  // -- Campaign issues --
  {
    id: "campaign_issue",
    keywords: [
      "campaign stuck", "campaign not working", "campaign failed", "campaign paused",
      "emails not sending", "campaign issue", "leads not showing", "outreach not working",
      "what happened to my campaign", "cant access campaign", "campaign stopped",
    ],
    patterns: [
      "my campaign is stuck",
      "campaign is stuck",
      "campaign stuck",
      "campaign not working",
      "emails aren't sending",
      "emails aren't going out",
      "my emails aren't going out",
      "emails not going out",
      "what happened to my campaign",
      "cant access my campaign",
      "cant access campaign",
      "what happened to campaign",
      "campaign isn't running",
      "leads not loading",
      "outreach not working",
      "i can't access my campaign",
      "campaign failed",
    ],
    response: "Sorry about that. Campaign issues are usually one of three things:\n\n1. Gmail disconnected - reconnect your Gmail in the Outreach Tool settings\n2. Credits ran out mid-campaign - top up and the campaign will continue\n3. A technical issue - email admin@studojo.com with your campaign name and what you're seeing\n\nInclude a screenshot if you can - it speeds things up a lot.",
    links: [{ label: "Contact support", url: "/contact" }],
  },

  // -- Internship Dojo (discovery/browsing) --
  {
    id: "internship_dojo",
    keywords: ["internship dojo", "internship discovery", "browse internships", "internship listings", "internship map"],
    patterns: [
      "what is internship dojo",
      "how does internship dojo work",
      "internship dojo",
      "browse internship listings",
      "find internship listings",
      "internship map",
    ],
    response: "Internship Dojo shows you real internship opportunities across India and globally - with an interactive map so you can browse by location.\n\nIt's the discovery layer. Use it to find what's out there, then use the Outreach Tool to actually contact hiring managers at those companies.\n\nThe two work well together.",
    links: [
      { label: "Browse Internship Dojo", url: "/dojos/internships" },
      { label: "Try the Outreach Tool", url: "/outreach" },
    ],
  },

  // -- Assignment Dojo --
  {
    id: "assignment_dojo",
    keywords: [
      "assignment", "homework", "essay", "coursework", "academic", "plagiarism",
      "dissertation", "paper", "report", "thesis", "write my",
    ],
    patterns: [
      "how does assignment dojo work",
      "assignment help",
      "write my assignment",
      "is it plagiarism free",
      "how do assignments work",
      "can you do my homework",
      "help with essay",
      "write my essay",
      "do my assignment",
      "assignment generator",
      "will it pass turnitin",
      "help with report",
      "can you help with assignments",
      "help with assignments",
      "help me with my assignment",
      "help with my homework",
      "can i get assignment help",
    ],
    response: "Assignment Dojo generates AI-powered assignments that are formatted, properly referenced, and plagiarism-safe.\n\nHow it works:\n1. Pick your subject and topic\n2. Set your academic level and word count\n3. Get a ready-to-use document in minutes\n\nIt's built as a strong starting point - structured, cited, formatted. Most students use it to get unstuck fast rather than starting from a blank page.\n\nPay per assignment, no subscription.",
    links: [{ label: "Try Assignment Dojo", url: "/dojos/assignment" }],
  },

  // -- Resume builder (non-technical) --
  {
    id: "careers_resume",
    keywords: ["resume", "cv", "careers dojo", "ats", "template", "resume builder", "cv builder", "make cv", "build resume", "free resume"],
    patterns: [
      "how do i build a resume",
      "is the resume builder free",
      "ats resume",
      "resume templates",
      "careers dojo",
      "how to make a resume",
      "edit my resume",
      "create a resume",
      "build my cv",
      "resume download",
      "professional resume",
      "resume for free",
      "build a resume",
      "make a resume",
      "make a cv",
    ],
    response: "The resume builder is completely free. No credit card, no trial, no catch.\n\nWhat you get:\n- ATS-optimised templates (structured the way tracking systems actually parse resumes)\n- Import from an existing PDF or build from scratch\n- Download as a PDF instantly\n- Unlimited resumes and edits\n\nTakes about 10 minutes to get something that looks properly done.",
    links: [{ label: "Build your resume free", url: "/dojos/careers" }],
  },

  // -- "Which tool should I use" / recommendation --
  {
    id: "recommendation",
    keywords: ["which one", "what should i use", "recommend", "best tool", "where to start", "suggest", "what do you suggest", "which tool"],
    patterns: [
      "which one would you suggest",
      "which tool should i use",
      "where should i start",
      "what do you recommend",
      "what should i do first",
      "which is best",
      "what should i try",
      "which product",
      "which dojo",
      "what do you offer",
      "help me choose",
      "what can studojo do for me",
    ],
    response: "Start with the Outreach Tool if you're job or internship hunting - it's the highest-impact thing on the platform. It finds hiring managers and sends personalised cold emails from your Gmail.\n\nIf you need a resume first, the Careers Dojo resume builder is free and takes 10 minutes.\n\nAssignment Dojo is if you need help with academic work.\n\nMost students do resume first, then outreach.",
    links: [
      { label: "Outreach Tool", url: "/outreach" },
      { label: "Resume builder (free)", url: "/dojos/careers" },
    ],
  },

  // -- AI Risk Dojo --
  {
    id: "ai_risk",
    keywords: ["ai risk", "humanizer", "ai detection", "turnitin", "detector", "humanize", "ai checker", "detection score", "flagged", "ai writing"],
    patterns: [
      "ai detection",
      "will my assignment get flagged",
      "ai risk check",
      "humanize my text",
      "turnitin detection",
      "check for ai",
      "will turnitin catch it",
      "lower ai score",
      "ai content checker",
      "ai writing detection",
    ],
    response: "The AI Risk checker scans your text and gives you a risk score section by section - so you can see exactly which parts might get flagged.\n\nIt shows you where to focus your edits. Run your draft through it, rephrase the high-risk parts in your own words, done.\n\nIt's a checker, not a bypass tool.",
    links: [{ label: "Try AI Risk checker", url: "/dojos/ai-risk" }],
  },

  // -- General pricing --
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "pay", "payment", "razorpay", "how much", "free", "charge", "subscription", "plan", "upi", "fee"],
    patterns: [
      "how much does it cost",
      "is studojo free",
      "what is the pricing",
      "how to buy credits",
      "payment methods",
      "do you accept upi",
      "what does it cost",
      "pricing plans",
      "how much for assignment",
      "how much for outreach",
      "is it free to use",
      "what's the price",
      "do i have to pay",
      "will i have to pay",
    ],
    response: "Here's the breakdown:\n\nResume builder - completely free, no limits.\n\nOutreach Tool - credit-based. You buy credits and spend them on lead discovery, enrichment, and sending campaigns. No subscription.\n\nAssignment Dojo - pay per assignment. No subscription.\n\nPayments go through Razorpay - UPI, debit/credit cards, and net banking all work. You only pay when you actually use something.",
    links: [{ label: "Outreach Tool pricing", url: "/outreach" }],
  },

  // -- Refunds --
  {
    id: "refund",
    keywords: ["refund", "money back", "cancel", "return", "chargeback", "wrong charge", "double charged"],
    patterns: [
      "how do i get a refund",
      "can i get a refund",
      "can i get my money back",
      "can i get a refund for my credits",
      "refund my credits",
      "credit refund",
      "refund policy",
      "i want a refund",
      "cancel my order",
      "charged me wrong",
      "i was charged",
      "get money back",
      "dispute a charge",
      "refund request",
    ],
    response: "Refund policy:\n\nOutreach credits - refundable within 7 days if no leads have been processed yet.\n\nAssignment Dojo - refundable within 24 hours if you haven't downloaded the document.\n\nAnything already used or delivered - non-refundable.\n\nEmail admin@studojo.com with your order ID and what happened. We'll get back to you within 24 hours.",
    links: [{ label: "Refund policy", url: "/refund-policy" }],
  },

  // -- Account / Login --
  {
    id: "account",
    keywords: ["account", "password", "login", "sign in", "sign up", "register", "forgot", "reset", "locked", "cant login", "verification", "delete account"],
    patterns: [
      "how do i reset my password",
      "forgot my password",
      "can't log in",
      "create an account",
      "how to sign up",
      "change my password",
      "delete my account",
      "account settings",
      "login not working",
      "not receiving email",
      "verification email",
      "cant access my account",
      "password reset not working",
      "start interview",
      "redirecting me",
    ],
    response: "Common account fixes:\n\nForgot password - hit \"Forgot password\" on the login page. Reset link comes by email - check spam if it doesn't show within a couple minutes.\n\nCan't log in - try clearing cache or use an incognito window first. If that doesn't work, email admin@studojo.com.\n\nAccount deletion - email admin@studojo.com and we'll handle it.\n\nAny other account issue - admin@studojo.com is fastest.",
    links: [{ label: "Login", url: "/auth" }],
  },

  // -- Technical issues / bugs --
  {
    id: "technical",
    keywords: [
      "bug", "error", "broken", "not working", "crash", "slow", "loading", "issue", "problem",
      "glitch", "stuck", "failed", "not loading", "blank page", "page error", "doesnt work",
      "wont work", "cant use", "not downloading", "not sending", "keeps redirecting", "playstore", "app store",
    ],
    patterns: [
      "something is broken",
      "page not loading",
      "i found a bug",
      "the site is slow",
      "getting an error",
      "resume not downloading",
      "emails not sending",
      "app not working",
      "button not working",
      "stuck on loading",
      "error message",
      "site not working",
      "is the site down",
      "site is down",
      "app is down",
      "resume builder not working",
      "resume builder is not working",
      "resume isn't working",
      "cant download resume",
      "resume not working",
      "my resume won't download",
      "resume won't download",
      "the resume is not working",
      "try again continuously",
      "try again keep",
      "keeps trying",
      "keeps loading",
      "keep redirecting",
      "keeps redirecting",
      "keep redirecting me",
      "it keep redirecting",
      "problem with the site",
      "issue with the site",
      "something wrong with the site",
      "site is showing",
      "i can't click",
      "unable to click",
      "unable to click send",
      "can't see it in the playstore",
      "not in the playstore",
      "not on the app store",
      "i can't see it in the",
      "remove the ai chatbox",
      "chatbox blocking",
    ],
    response: "Let's get that sorted.\n\nQuick things to try first:\n1. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)\n2. Clear your browser cache\n3. Try Chrome if you're on a different browser\n4. Try incognito mode\n\nIf that doesn't fix it, reach out at admin@studojo.com with what you were trying to do, what happened, and a screenshot if you have one. We'll look into it.",
    links: [{ label: "Contact support", url: "/contact" }],
  },

  // -- About Studojo --
  {
    id: "about",
    keywords: ["about", "what is studojo", "who", "company", "team", "bangalore", "india", "founded", "startup", "platform"],
    patterns: [
      "what is studojo",
      "who built studojo",
      "tell me about studojo",
      "where are you based",
      "where is studojo based",
      "who are you",
      "what do you do",
      "what does studojo do",
      "about the company",
      "about studojo",
      "what tools do you have",
      "what tools does studojo have",
      "give me a brief about",
      "brief about studojo",
      "tell me about how studojo",
    ],
    response: "Studojo is a career platform for ambitious students - built to help you work on things that actually matter, not just tick boxes.\n\nTools we've built:\n- Outreach Tool: AI-powered cold email to hiring managers from your own Gmail\n- Careers Dojo: free ATS resume builder\n- Internship Dojo: internship discovery and listings\n- Assignment Dojo: AI assignment help\n- AI Risk Dojo: AI detection checker\n- Revision Dojo: coming soon\n\nBased in Bangalore. 10,000+ students helped across India, UK, US, UAE, and Singapore.",
    links: [{ label: "About us", url: "/about" }],
  },

  // -- Revision Dojo --
  {
    id: "revision_dojo",
    keywords: ["revision", "study notes", "flashcards", "practice questions", "mind map", "exam", "quiz"],
    patterns: [
      "revision dojo",
      "study notes",
      "practice questions",
      "flashcards",
      "mind maps",
      "help me study",
      "exam prep",
      "revision tool",
      "when is revision dojo",
    ],
    response: "Revision Dojo is coming soon.\n\nIt'll generate custom study notes, practice questions, flashcards, and mind maps based on whatever you're studying.\n\nDrop a message to admin@studojo.com if you want to be notified when it launches.",
  },

  // -- Privacy / Data --
  {
    id: "privacy",
    keywords: ["privacy", "data", "gdpr", "personal", "secure", "security", "delete data", "my data", "data protection", "stored", "sold"],
    patterns: [
      "how is my data used",
      "is my data safe",
      "privacy policy",
      "delete my data",
      "do you sell data",
      "where is my data stored",
      "what data do you collect",
      "is it secure",
      "personal information",
    ],
    response: "Your data is encrypted and never sold to third parties.\n\nWe only use your data to run the services you've signed up for.\n\nIf you want your data deleted, email admin@studojo.com with \"Data Deletion Request\" in the subject. We'll handle it fully.",
    links: [{ label: "Privacy policy", url: "/privacy" }],
  },

  // -- Contact / Human --
  {
    id: "contact_human",
    keywords: ["human", "person", "agent", "speak to someone", "real person", "support team", "contact", "talk to someone", "customer support", "live chat", "whatsapp"],
    patterns: [
      "talk to a human",
      "i want to speak to someone",
      "i want to speak to a real person",
      "real person please",
      "can i email you",
      "how do i contact you",
      "speak to customer support",
      "get in touch",
      "contact the team",
      "need human help",
      "speak to a real person",
      "connect me to support",
    ],
    response: "You can reach the team directly:\n\nEmail: admin@studojo.com\nContact form: studojo.com/contact\n\nEmail is fastest for account or billing issues. Use the contact form for technical stuff - you can attach screenshots there.\n\nWe typically respond within 24 hours.",
    links: [{ label: "Contact form", url: "/contact" }],
  },

  // -- Farewell --
  {
    id: "farewell",
    keywords: ["bye", "goodbye", "thanks", "thank you", "cheers", "thats all", "done", "sorted", "all good", "got it", "perfect", "great"],
    patterns: [
      "bye", "goodbye", "bye thanks", "thanks bye", "thank you bye", "goodbye thanks",
      "thanks for the help", "that helps", "got it thanks", "perfect thanks", "all good",
      "that's sorted", "thanks a lot", "appreciate it",
    ],
    response: "Good luck with everything! Come back anytime.",
  },
];

// ── Knowledge context for LLM fallback ───────────────────────────────────────

export const KNOWLEDGE_CONTEXT = `## What Studojo is
A student career platform at studojo.com. Based in Bangalore, India. Tagline: "Work on things that matter."
10,000+ students helped. 5,000+ resumes built. Markets: India, UK, US, UAE, Singapore.

## Products (ALWAYS lead with Outreach Tool for anyone looking for jobs/internships)

**Outreach Tool** (studojo.com/outreach) — PRIMARY RECOMMENDATION for job/internship seekers
- AI finds hiring managers at companies matching the student's target roles
- Writes personalised cold emails and sends them from the student's own Gmail
- Student uploads resume, sets role preferences, reviews leads and approves before sending
- Credit-based: credits used for lead discovery, enrichment, and campaign sending
- Students have gotten interview callbacks within 48 hours

**Careers Dojo** (studojo.com/dojos/careers) — Free ATS resume builder
- Completely free, no credit card, unlimited resumes and edits
- ATS-optimised templates, PDF download, import from existing PDF

**Internship Dojo** (studojo.com/dojos/internships) — Internship discovery/listings
- Browse internship opportunities globally with an interactive map
- Works well combined with the Outreach Tool

**Assignment Dojo** (studojo.com/dojos/assignment) — AI assignment help
- AI-generated assignments, plagiarism-safe, formatted, referenced
- Pay per assignment, no subscription

**AI Risk Dojo** (studojo.com/dojos/ai-risk) — AI detection risk checker
- Scans text, shows risk score by section, shows where to rephrase
- A checker, NOT a bypass tool

**Revision Dojo** — Coming soon (study notes, flashcards, practice questions, mind maps)

## Pricing
- Resume builder: free, no limits
- Outreach Tool: credit-based, buy as you need, no subscription
- Assignment Dojo: pay per assignment, no subscription
- Payments via Razorpay (UPI, cards, net banking)

## Refunds
- Unused outreach credits: refundable within 7 days if no process started
- Assignment: refundable within 24 hours if not downloaded
- Used/delivered services: non-refundable
- Contact: admin@studojo.com with order ID

## Contact
- Email: admin@studojo.com (responds within 24 hours)
- Contact form: studojo.com/contact

## HARD RULES — these are absolute, never break them:
- Studojo is a career PLATFORM with tools. It is NOT an internship provider and does NOT post internship listings itself.
- NEVER say "Studojo doesn't offer unpaid internships" — Studojo provides tools to find and apply for internships, not the internships themselves.
- NEVER suggest LinkedIn, Glassdoor, Indeed, or any competitor platform as an alternative.
- NEVER say users must be over 18 or any age requirement — there is no stated age requirement.
- NEVER invent product names (e.g. "Design Dojo" does not exist).
- NEVER say the site is down or having technical issues unless the user says so first.
- NEVER give advice about internships themselves (how competitive they are, cover letters, etc.) — stick to what Studojo's tools do.
- If asked about a specific internship in a specific city/company — say that's not something you have info on, and point them to the Outreach Tool to contact hiring managers directly.`;
