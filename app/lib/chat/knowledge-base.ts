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
    keywords: ["hi", "hello", "hey", "sup", "yo", "hola", "good morning", "good evening"],
    patterns: ["hi there", "hello there", "hey there", "how are you", "whats up"],
    response: "Hey! I'm here to help with anything Studojo related. What's up?",
  },

  // -- Assignment Dojo --
  {
    id: "assignment_dojo",
    keywords: ["assignment", "homework", "essay", "coursework", "academic", "plagiarism", "write my"],
    patterns: [
      "how does assignment dojo work",
      "assignment help",
      "write my assignment",
      "is it plagiarism free",
      "how do assignments work",
      "can you do my homework",
    ],
    response:
      "Assignment Dojo generates AI-powered assignments that are plagiarism-safe, formatted, and properly referenced.\n\nJust pick your subject, topic, and academic level. You'll get a ready-to-use document in minutes. It's meant as a solid starting point that you can review and tweak.",
    links: [{ label: "Try Assignment Dojo", url: "/dojos/assignment" }],
  },

  // -- Internship Dojo --
  {
    id: "internship_dojo",
    keywords: ["internship", "outreach", "hiring", "job", "apply", "lead", "campaign", "email campaign", "gmail"],
    patterns: [
      "how does internship dojo work",
      "find internships",
      "how does outreach work",
      "how do i apply",
      "connect gmail",
      "email hiring managers",
      "how do credits work",
      "what are credits",
    ],
    response:
      "Here's how Internship Dojo works:\n\n1. Upload your resume, we extract your skills automatically\n2. Tell us what kind of roles you want\n3. AI finds relevant hiring managers and writes personalised emails\n4. Emails go out from your connected Gmail\n\nYou're in control of who gets contacted. Some students have gotten callbacks within 48 hours.",
    links: [{ label: "Explore Internship Dojo", url: "/dojos/internships" }],
  },

  // -- Careers Dojo / Resume --
  {
    id: "careers_resume",
    keywords: ["resume", "cv", "careers", "ats", "template", "builder", "free resume"],
    patterns: [
      "how do i build a resume",
      "is the resume builder free",
      "ats resume",
      "resume templates",
      "careers dojo",
      "how to make a resume",
      "edit my resume",
    ],
    response:
      "Yep, the resume builder is 100% free. No hidden charges, no credit card.\n\nPick a professional template, fill in your details (or import from an existing PDF), and download. Everything is ATS-optimised so your resume actually gets past the filters.",
    links: [{ label: "Build your resume", url: "/dojos/careers" }],
  },

  // -- Pricing / Credits --
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "credits", "pay", "payment", "razorpay", "how much", "free", "charge"],
    patterns: [
      "how much does it cost",
      "is studojo free",
      "what is the pricing",
      "how do credits work",
      "how to buy credits",
      "payment methods",
      "do you accept upi",
    ],
    response:
      "Quick breakdown:\n\nResume builder is completely free, no limits.\nAssignment Dojo is pay per assignment.\nInternship Dojo outreach uses credits for lead discovery, enrichment, and email campaigns.\n\nPayments go through Razorpay, so UPI, cards, and net banking all work.",
    links: [{ label: "View pricing", url: "/dojos/internships" }],
  },

  // -- Refunds --
  {
    id: "refund",
    keywords: ["refund", "money back", "cancel", "return", "chargeback"],
    patterns: [
      "how do i get a refund",
      "can i get my money back",
      "refund policy",
      "i want a refund",
      "cancel my order",
      "refund request",
    ],
    response:
      "Here's the short version:\n\nUnused outreach credits can be refunded within 7 days if nothing has been processed yet. Assignment services are refundable within 24 hours if you haven't downloaded the output. Anything already used or delivered is non-refundable.\n\nTo request a refund, email admin@studojo.com with your order details.",
    links: [{ label: "Full refund policy", url: "/refund-policy" }],
  },

  // -- Account / Password --
  {
    id: "account",
    keywords: ["account", "password", "login", "sign in", "sign up", "register", "forgot", "reset", "locked", "can't login"],
    patterns: [
      "how do i reset my password",
      "forgot my password",
      "can't log in",
      "create an account",
      "how to sign up",
      "change my password",
      "delete my account",
      "account settings",
    ],
    response:
      "For password reset, hit \"Forgot password\" on the login page. You'll get a reset link by email (check spam if you don't see it).\n\nFor account deletion or anything else account-related, just email admin@studojo.com and we'll sort it out.",
    links: [{ label: "Go to login", url: "/auth" }],
  },

  // -- Privacy / Data --
  {
    id: "privacy",
    keywords: ["privacy", "data", "gdpr", "personal", "information", "secure", "security", "delete data"],
    patterns: [
      "how is my data used",
      "is my data safe",
      "privacy policy",
      "delete my data",
      "do you sell data",
      "where is my data stored",
    ],
    response:
      "Your data is encrypted and we never sell it to anyone. We only use it to deliver the services you signed up for.\n\nIf you want your data deleted, just email admin@studojo.com and we'll handle it.",
    links: [{ label: "Privacy policy", url: "/privacy" }],
  },

  // -- Technical Issues --
  {
    id: "technical",
    keywords: ["bug", "error", "broken", "not working", "crash", "slow", "loading", "issue", "problem", "glitch"],
    patterns: [
      "something is broken",
      "page not loading",
      "i found a bug",
      "the site is slow",
      "getting an error",
      "resume not downloading",
      "emails not sending",
      "campaign stuck",
    ],
    response:
      "Sorry about that! Try these quick fixes first:\n\n1. Clear your browser cache and refresh\n2. Try Chrome if you're on a different browser\n3. Check your internet connection\n\nIf it's still not working, drop us a message through the contact form with what went wrong and any screenshots. We'll look into it.",
    links: [{ label: "Contact support", url: "/contact" }],
  },

  // -- About Studojo --
  {
    id: "about",
    keywords: ["about", "what is studojo", "who", "company", "team", "bangalore", "india"],
    patterns: [
      "what is studojo",
      "who built studojo",
      "tell me about studojo",
      "where are you based",
      "who are you",
    ],
    response:
      "Studojo is a career platform for ambitious students. We help you work on things that matter, with AI tools for resumes, internship discovery, and outreach to hiring managers.\n\nBased in Bangalore, serving students globally.",
    links: [{ label: "About us", url: "/about" }],
  },

  // -- AI Risk Dojo --
  {
    id: "ai_risk",
    keywords: ["ai risk", "humanizer", "ai detection", "turnitin", "detector", "humanize"],
    patterns: [
      "ai detection",
      "will my assignment get flagged",
      "ai risk check",
      "humanize my text",
      "turnitin detection",
    ],
    response:
      "The AI Risk checker scans your text and shows you a risk score, so you can see which parts might get flagged.\n\nIt's a detection checker, not a bypass tool. Use it to know where to rephrase things in your own words.",
    links: [{ label: "Try AI Risk checker", url: "/dojos/ai-risk" }],
  },

  // -- Contact / Human --
  {
    id: "contact_human",
    keywords: ["human", "person", "agent", "speak to someone", "real person", "support team", "contact"],
    patterns: [
      "talk to a human",
      "i want to speak to someone",
      "connect me to support",
      "real person please",
      "can i email you",
      "how do i contact you",
    ],
    response:
      "You can reach the team a few ways:\n\nEmail: admin@studojo.com\nContact form on the website\nWhatsApp community group\n\nWe usually get back within 24 hours.",
    links: [{ label: "Contact form", url: "/contact" }],
  },

  // -- Farewell --
  {
    id: "farewell",
    keywords: ["bye", "goodbye", "thanks", "thank you", "cheers", "that's all", "done"],
    patterns: ["thanks for the help", "that helps", "got it thanks", "perfect thanks", "all good"],
    response: "Happy to help! Good luck with everything. Feel free to come back anytime.",
  },
];

// Compact knowledge context for LLM fallback
export const KNOWLEDGE_CONTEXT = `Studojo is a student career platform (studojo.com). Based in Bangalore, India. Tagline: "Work on things that matter."

Products:
- Assignment Dojo: AI-generated assignments, plagiarism-safe, formatted, referenced. Paid per assignment.
- Internship Dojo: Global internship discovery + AI outreach to hiring managers via Gmail. Credit-based. Credits used for lead generation, enrichment, email campaigns.
- Careers Dojo: Free ATS-optimised resume builder. Unlimited use, no credit card needed.
- AI Risk Dojo: AI detection risk checker for text.
- Revision Dojo: Coming soon (study notes, practice questions, flashcards).

Refunds:
- Unused outreach credits: refundable within 7 days if no process started.
- Assignment services: refundable within 24 hours if not downloaded.
- Used credits or delivered services: non-refundable.
- Email admin@studojo.com with subject "Refund Request".

Account:
- Password reset via "Forgot password" on login page.
- Account deletion: email admin@studojo.com.

Payment: Razorpay (UPI, cards, net banking).

Contact: admin@studojo.com. Response within 24 hours.
Privacy: Data encrypted, never sold. Deletion available on request.

Important:
- Never make up info. If unsure, point to admin@studojo.com or /contact.
- Never share internal details about architecture or pricing models.
- Keep it casual, friendly, and short.`;
