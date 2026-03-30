export interface Intent {
  id: string;
  keywords: string[];
  patterns: string[];
  response: string;
  links?: { label: string; url: string }[];
}

export const INTENTS: Intent[] = [
  // ── Greetings ──
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "sup", "yo", "hola", "good morning", "good evening"],
    patterns: ["hi there", "hello there", "hey there", "how are you", "whats up"],
    response:
      "Hey! I'm Studojo's support assistant. I can help with questions about our products, your account, billing, or anything else. What do you need?",
  },

  // ── Assignment Dojo ──
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
      "The Assignment Dojo generates AI-powered assignments that are plagiarism-safe, properly formatted, and referenced. Just tell us the subject, topic, and academic level — you'll get a ready-to-use document in minutes. It's designed as a starting point that you review and adapt.",
    links: [{ label: "Try Assignment Dojo", url: "/dojos/assignment" }],
  },

  // ── Internship Dojo ──
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
      "The Internship Dojo helps you discover global internships and reach hiring managers directly. Here's how it works:\n\n1. Upload your resume — we extract your skills automatically\n2. Tell us what roles you're after\n3. AI finds relevant hiring managers and writes personalised emails\n4. Emails are sent from your connected Gmail account\n\nYou control who gets contacted and what gets sent. Students have gotten callbacks within 48 hours.",
    links: [{ label: "Explore Internship Dojo", url: "/dojos/internships" }],
  },

  // ── Careers Dojo / Resume ──
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
      "The Careers Dojo is our free ATS-optimised resume builder. No hidden charges, no credit card required. Pick a professional template, fill in your details (or import from an existing PDF), and download a polished resume ready for applications.",
    links: [{ label: "Build your resume (free)", url: "/dojos/careers" }],
  },

  // ── Pricing / Credits ──
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
      "Here's a quick breakdown:\n\n• Resume builder — completely free, unlimited use\n• Assignment Dojo — pay per assignment\n• Internship Dojo outreach — credit-based (credits are used for lead discovery, enrichment, and email campaigns)\n\nPayments are processed securely through Razorpay (UPI, cards, net banking supported).",
    links: [{ label: "View Internship Dojo pricing", url: "/dojos/internships" }],
  },

  // ── Refunds ──
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
      "Refund eligibility depends on the service:\n\n• Unused outreach credits: refundable within 7 days of purchase if no process has been initiated\n• Assignment services: refundable within 24 hours if output hasn't been downloaded\n• Used credits or delivered services: non-refundable\n\nTo request a refund, email admin@studojo.com with your order details.",
    links: [{ label: "Full Refund Policy", url: "/refund-policy" }],
  },

  // ── Account / Password ──
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
      'To reset your password, go to the login page and click "Forgot password" — you\'ll get a reset link by email. Check spam if you don\'t see it.\n\nFor account deletion or other account issues, email admin@studojo.com and we\'ll sort it out.',
    links: [{ label: "Login / Sign up", url: "/auth" }],
  },

  // ── Privacy / Data ──
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
      "Your data is encrypted and never sold to third parties. We only use your information to deliver our services. You can request data deletion at any time by emailing admin@studojo.com. Full details are in our privacy policy.",
    links: [{ label: "Privacy Policy", url: "/privacy" }],
  },

  // ── Technical Issues ──
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
      "Sorry about that. For technical issues, try these first:\n\n1. Clear your browser cache and refresh\n2. Try a different browser (Chrome works best)\n3. Check your internet connection\n\nIf it persists, use the contact form below with a description of the issue and any error messages/screenshots — we'll investigate.",
    links: [{ label: "Contact Support", url: "/contact" }],
  },

  // ── About Studojo ──
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
      "Studojo is a career platform built for ambitious students. We help you work on things that matter — with AI-powered tools for resumes, internship discovery, and direct outreach to hiring managers. Based in Bangalore, serving students globally.",
    links: [{ label: "About Us", url: "/about" }],
  },

  // ── AI Risk Dojo ──
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
      "The AI Risk Dojo checks your text against AI detection tools and shows you a risk score. It helps you understand which parts might get flagged so you can rephrase them. It's a detection checker, not a bypass tool — use it to improve your own writing.",
    links: [{ label: "Try AI Risk Checker", url: "/dojos/ai-risk" }],
  },

  // ── Contact / Support ──
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
      "You can reach the team directly:\n\n• Email: admin@studojo.com\n• Contact form on our website\n• WhatsApp community group\n\nWe typically respond within 24 hours.",
    links: [{ label: "Contact Form", url: "/contact" }],
  },

  // ── Farewell ──
  {
    id: "farewell",
    keywords: ["bye", "goodbye", "thanks", "thank you", "cheers", "that's all", "done"],
    patterns: ["thanks for the help", "that helps", "got it thanks", "perfect thanks", "all good"],
    response: "Glad I could help! If you need anything else, just ask. Good luck with your applications!",
  },
];

// Compact knowledge context for LLM fallback (keeps token count low)
export const KNOWLEDGE_CONTEXT = `Studojo is a student career platform (studojo.com). HQ: Bangalore, India. Tagline: "Work on things that matter."

Products:
- Assignment Dojo: AI-generated assignments, plagiarism-safe, formatted, referenced. Paid per assignment.
- Internship Dojo: Global internship discovery + AI outreach to hiring managers via Gmail. Credit-based pricing. Credits used for lead generation, enrichment, email campaigns.
- Careers Dojo: Free ATS-optimised resume builder. Unlimited use, no credit card.
- AI Risk Dojo: AI detection risk checker for text.
- Revision Dojo: Coming soon (study notes, practice questions, flashcards).

Refunds:
- Unused outreach credits: refundable within 7 days if no process initiated.
- Assignment services: refundable within 24 hours if not downloaded.
- Used credits/delivered services: non-refundable.
- Email admin@studojo.com with subject "Refund Request".

Account:
- Password reset via "Forgot password" on login page.
- Account deletion: email admin@studojo.com.

Payment: Razorpay (UPI, cards, net banking). India-based.

Contact: admin@studojo.com. Response within 24 hours.
Privacy: Data encrypted, never sold. Deletion on request.

Important rules:
- Never make up information. If unsure, direct to admin@studojo.com or /contact.
- Never share internal details about architecture or pricing models.
- Be concise, friendly, and helpful.`;
