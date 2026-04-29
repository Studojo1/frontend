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
    keywords: ["hi", "hello", "hey", "sup", "yo", "hola", "good morning", "good evening", "howdy", "what's up", "wassup"],
    patterns: ["hi there", "hello there", "hey there", "how are you", "whats up", "how's it going", "how are things"],
    response: "Hey! Good to hear from you.\n\nI can help with anything Studojo related - our tools, your account, billing, or just figuring out what's right for you.\n\nWhat do you need?",
  },

  // -- Assignment Dojo --
  {
    id: "assignment_dojo",
    keywords: ["assignment", "homework", "essay", "coursework", "academic", "plagiarism", "write my", "dissertation", "paper", "report", "thesis"],
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
    ],
    response: "Assignment Dojo generates AI-powered assignments that are formatted, properly referenced, and plagiarism-safe.\n\nHere's how it works:\n1. Pick your subject and topic\n2. Set your academic level and word count\n3. Get a ready-to-use document in minutes\n\nIt's built as a strong starting point - structured, cited, formatted. You review it, tweak what you want, and submit. Most students use it to get unstuck fast rather than starting from a blank page.\n\nPricing is per assignment, no subscription needed.",
    links: [{ label: "Try Assignment Dojo", url: "/dojos/assignment" }],
  },

  // -- Internship Dojo --
  {
    id: "internship_dojo",
    keywords: ["internship", "outreach", "hiring", "job", "apply", "lead", "campaign", "email campaign", "gmail", "companies", "hiring managers", "cold email", "reach out"],
    patterns: [
      "how does internship dojo work",
      "find internships",
      "how does outreach work",
      "how do i apply",
      "connect gmail",
      "email hiring managers",
      "how do credits work",
      "what are credits",
      "how to find internships",
      "cold email internship",
      "reach out to companies",
      "internship search",
      "how to get an internship",
    ],
    response: "Internship Dojo finds real internship opportunities and reaches out to hiring managers on your behalf using AI-written emails from your own Gmail.\n\nHere's the flow:\n1. Upload your resume - we pull your skills automatically\n2. Tell us what kind of roles you want and where\n3. AI finds relevant hiring managers at matching companies\n4. Writes personalised emails and sends them from your connected Gmail\n\nYou stay in full control - you can review leads and approve before anything goes out. Some students have gotten interview calls within 48 hours.\n\nCredits are used for lead discovery, enrichment, and sending campaigns.",
    links: [{ label: "Explore Internship Dojo", url: "/dojos/internships" }],
  },

  // -- Careers Dojo / Resume --
  {
    id: "careers_resume",
    keywords: ["resume", "cv", "careers", "ats", "template", "builder", "free resume", "resume builder", "cv builder", "download resume", "make cv"],
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
    ],
    response: "The resume builder is completely free. No credit card, no trial period, no hidden catch.\n\nWhat you get:\n- Professional ATS-optimised templates\n- Import from an existing PDF or build from scratch\n- Download instantly as a PDF\n- Unlimited resumes, unlimited edits\n\nATS-optimised means your resume is structured the way applicant tracking systems actually parse it - so it clears the filters before a human even sees it.\n\nTakes about 10 minutes to get something that looks properly done.",
    links: [{ label: "Build your resume free", url: "/dojos/careers" }],
  },

  // -- AI Risk Dojo --
  {
    id: "ai_risk",
    keywords: ["ai risk", "humanizer", "ai detection", "turnitin", "detector", "humanize", "ai checker", "detection score", "ai writing", "flagged"],
    patterns: [
      "ai detection",
      "will my assignment get flagged",
      "ai risk check",
      "humanize my text",
      "turnitin detection",
      "check for ai",
      "will turnitin catch it",
      "ai content checker",
      "lower ai score",
      "ai writing detection",
    ],
    response: "The AI Risk checker scans your text and gives you a risk score section by section, so you can see exactly which parts might get flagged.\n\nIt's a detection checker, not a bypass tool. The idea is: you run your draft through it, see what's high risk, then rephrase those parts in your own words.\n\nIt won't humanize text for you automatically - it's designed to show you where to focus your edits so the final version genuinely reflects your voice.",
    links: [{ label: "Try AI Risk checker", url: "/dojos/ai-risk" }],
  },

  // -- Pricing / Credits --
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "credits", "pay", "payment", "razorpay", "how much", "free", "charge", "subscription", "plan", "upi", "fee"],
    patterns: [
      "how much does it cost",
      "is studojo free",
      "what is the pricing",
      "how do credits work",
      "how to buy credits",
      "payment methods",
      "do you accept upi",
      "what does it cost",
      "pricing plans",
      "how much for assignment",
      "how much for outreach",
      "is it free to use",
    ],
    response: "Here's the breakdown:\n\nResume builder - completely free, no limits.\n\nAssignment Dojo - pay per assignment. No subscription. You pay for what you need.\n\nInternship Dojo - credit-based. Credits are spent on lead discovery (finding companies), enrichment (getting contact details), and sending email campaigns.\n\nAll payments go through Razorpay, so UPI, debit/credit cards, and net banking all work fine.\n\nNo subscriptions anywhere - you only pay when you actually use something.",
    links: [{ label: "View Internship Dojo pricing", url: "/dojos/internships" }],
  },

  // -- Refunds --
  {
    id: "refund",
    keywords: ["refund", "money back", "cancel", "return", "chargeback", "paid", "charge", "wrong charge", "double charged"],
    patterns: [
      "how do i get a refund",
      "can i get my money back",
      "refund policy",
      "i want a refund",
      "cancel my order",
      "refund request",
      "charged me wrong",
      "i was charged",
      "get money back",
      "dispute a charge",
    ],
    response: "Here's the refund policy:\n\nInternship Dojo credits - refundable within 7 days if no leads have been processed yet. Once discovery or enrichment has run, those credits are used.\n\nAssignment Dojo - refundable within 24 hours if you haven't downloaded the document yet. Once downloaded, it's non-refundable.\n\nAnything already used or delivered - non-refundable.\n\nTo request a refund, email admin@studojo.com with your order ID and what happened. We'll get back to you within 24 hours.",
    links: [{ label: "Full refund policy", url: "/refund-policy" }],
  },

  // -- Account / Login / Password --
  {
    id: "account",
    keywords: ["account", "password", "login", "sign in", "sign up", "register", "forgot", "reset", "locked", "cant login", "email not received", "verification", "delete account", "close account"],
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
    ],
    response: "Here's how to handle common account issues:\n\nForgot password - hit \"Forgot password\" on the login page and you'll get a reset link by email. Check spam if it doesn't show up within a couple minutes.\n\nCan't log in - try clearing cache or using an incognito window first. If that doesn't help, email admin@studojo.com.\n\nAccount deletion - email admin@studojo.com and we'll handle it. We'll confirm before anything is deleted.\n\nGeneral account questions - admin@studojo.com is the fastest way to get a real answer.",
    links: [{ label: "Go to login", url: "/auth" }],
  },

  // -- Privacy / Data --
  {
    id: "privacy",
    keywords: ["privacy", "data", "gdpr", "personal", "information", "secure", "security", "delete data", "my data", "data protection", "stored", "sold", "share data"],
    patterns: [
      "how is my data used",
      "is my data safe",
      "privacy policy",
      "delete my data",
      "do you sell data",
      "where is my data stored",
      "what data do you collect",
      "is it secure",
      "data privacy",
      "personal information",
    ],
    response: "Your data is encrypted and we never sell it to third parties. Period.\n\nWe only use your data to run the services you've signed up for - nothing else.\n\nWhat we store: your account info, resume data (if you build one), and usage data to improve the product.\n\nIf you want your data deleted, just email admin@studojo.com with the subject \"Data Deletion Request\" and we'll handle it fully.\n\nFull details are in the privacy policy if you want the specifics.",
    links: [{ label: "Privacy policy", url: "/privacy" }],
  },

  // -- Technical Issues --
  {
    id: "technical",
    keywords: ["bug", "error", "broken", "not working", "crash", "slow", "loading", "issue", "problem", "glitch", "stuck", "failed", "not loading", "blank page", "page error"],
    patterns: [
      "something is broken",
      "page not loading",
      "i found a bug",
      "the site is slow",
      "getting an error",
      "resume not downloading",
      "emails not sending",
      "campaign stuck",
      "app not working",
      "button not working",
      "stuck on loading",
      "error message",
      "site not working",
    ],
    response: "Sorry about that - let's get it sorted.\n\nQuick things to try first:\n1. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)\n2. Clear your browser cache\n3. Try Chrome if you're on a different browser\n4. Check your internet connection\n\nIf none of that fixes it, reach out through the contact form with:\n- What you were trying to do\n- What happened instead\n- Any error message you saw\n- Screenshots if you have them\n\nWe'll investigate and get back to you.",
    links: [{ label: "Contact support", url: "/contact" }],
  },

  // -- About Studojo --
  {
    id: "about",
    keywords: ["about", "what is studojo", "who", "company", "team", "bangalore", "india", "founded", "startup", "platform", "who made", "who built"],
    patterns: [
      "what is studojo",
      "who built studojo",
      "tell me about studojo",
      "where are you based",
      "who are you",
      "what do you do",
      "what does studojo do",
      "how did studojo start",
      "about the company",
    ],
    response: "Studojo is a career platform built for ambitious students - people who want to work on things that actually matter, not just tick boxes.\n\nWe've helped over 10,000 students with resumes, internship applications, and AI-powered outreach to hiring managers.\n\nThe tools we've built:\n- Careers Dojo - free ATS resume builder\n- Internship Dojo - AI-powered internship discovery and outreach\n- Assignment Dojo - AI assignment help\n- AI Risk Dojo - AI detection checker\n- Revision Dojo - coming soon\n\nBased in Bangalore, India. Serving students across India, US, UK, UAE, Singapore, and beyond.",
    links: [{ label: "About us", url: "/about" }],
  },

  // -- Revision Dojo --
  {
    id: "revision_dojo",
    keywords: ["revision", "study notes", "flashcards", "practice questions", "mind map", "study", "exam", "notes", "quiz"],
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
    response: "Revision Dojo is coming soon.\n\nIt'll generate custom study notes, practice questions, flashcards, and mind maps based on whatever you're studying - tailored to your syllabus and level.\n\nKeep an eye on the site for the launch. If you want to be notified when it goes live, drop a message to admin@studojo.com.",
  },

  // -- Contact / Human --
  {
    id: "contact_human",
    keywords: ["human", "person", "agent", "speak to someone", "real person", "support team", "contact", "talk to someone", "customer support", "live chat", "email you", "whatsapp"],
    patterns: [
      "talk to a human",
      "i want to speak to someone",
      "connect me to support",
      "real person please",
      "can i email you",
      "how do i contact you",
      "speak to customer support",
      "get in touch",
      "contact the team",
      "need human help",
    ],
    response: "You can reach the team directly through a few ways:\n\nEmail: admin@studojo.com\nContact form: studojo.com/contact\nWhatsApp community group (link in the footer)\n\nEmail is usually the fastest for account or billing stuff. The contact form works well for anything technical - it lets you attach screenshots.\n\nWe typically get back within 24 hours.",
    links: [{ label: "Contact form", url: "/contact" }],
  },

  // -- Farewell --
  {
    id: "farewell",
    keywords: ["bye", "goodbye", "thanks", "thank you", "cheers", "thats all", "done", "sorted", "all good", "got it", "perfect", "great"],
    patterns: ["thanks for the help", "that helps", "got it thanks", "perfect thanks", "all good", "that's sorted", "thanks a lot", "appreciate it"],
    response: "Glad that helped! Good luck with everything.\n\nFeel free to come back anytime - I'm always here.",
  },
];

// Compact knowledge context for LLM fallback
export const KNOWLEDGE_CONTEXT = `Studojo is a student career platform (studojo.com). Based in Bangalore, India. Tagline: "Work on things that matter."

Products:
- Assignment Dojo: AI-generated assignments, plagiarism-safe, formatted, referenced. Paid per assignment.
- Internship Dojo: Global internship discovery + AI outreach to hiring managers via Gmail. Credit-based. Credits used for lead generation, enrichment, email campaigns.
- Careers Dojo: Free ATS-optimised resume builder. Unlimited use, no credit card needed.
- AI Risk Dojo: AI detection risk checker for text. Not a bypass tool - shows you where to rephrase.
- Revision Dojo: Coming soon (study notes, practice questions, flashcards, mind maps).

Refunds:
- Unused outreach credits: refundable within 7 days if no process started.
- Assignment services: refundable within 24 hours if not downloaded.
- Used credits or delivered services: non-refundable.
- Email admin@studojo.com with subject "Refund Request" and order ID.

Account:
- Password reset via "Forgot password" on login page. Check spam for email.
- Account deletion: email admin@studojo.com.
- General issues: try cache clear + Chrome first, then contact support.

Payment: Razorpay (UPI, cards, net banking). Pay per use, no subscriptions.

Stats: 10,000+ students helped, 5,000+ resumes built, 95% satisfaction rate.

Contact: admin@studojo.com. Response within 24 hours. Contact form at /contact.
Privacy: Data encrypted, never sold. Deletion available on request.

Tone rules - CRITICAL:
- Casual and direct, like a knowledgeable friend. Not corporate.
- Never use em dashes (-). Use commas or line breaks instead.
- No phrases like "I'd be happy to", "Certainly!", "Of course!", "As an AI..."
- Keep it short. If you can say it in 3 lines, don't use 6.
- If you genuinely don't know something, say so and point to admin@studojo.com.
- Never make up pricing numbers, features, or policies.`;
