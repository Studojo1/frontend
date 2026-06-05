import { useState } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";

const BASE_URL = "https://studojo.com";

export function meta() {
  const ogImage = `${BASE_URL}/og-reports.png`;
  return [
    { title: "Career Market Reports | Studojo" },
    { name: "description", content: "Free career market reports for students. Entry-level salary benchmarks, hiring trends, skill gaps, and job data across Finance, Sales, CS, and more | India 2026." },
    { name: "robots", content: "index, follow" },
    { name: "keywords", content: "career market report, entry level jobs india 2026, fresher salary india, internship market report, student career data" },
    { tagName: "link", rel: "canonical", href: `${BASE_URL}/reports` },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Career Market Reports | Studojo" },
    { property: "og:description", content: "Free career market reports for students. Entry-level salary benchmarks, hiring trends, and skill gaps across Finance, Sales, CS, and more." },
    { property: "og:url", content: `${BASE_URL}/reports` },
    { property: "og:site_name", content: "Studojo" },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: "Studojo Career Market Reports — data-driven guides for students" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@studojo" },
    { name: "twitter:title", content: "Career Market Reports | Studojo" },
    { name: "twitter:description", content: "Free career market reports for students. Entry-level salary benchmarks, hiring trends, and skill gaps across Finance, Sales, CS, and more." },
    { name: "twitter:image", content: ogImage },
  ];
}

type ReportType = "Sector" | "Internships" | "Cities" | "Colleges" | "Hiring Calendar";

const TYPE_COLORS: Record<ReportType, string> = {
  "Sector":          "bg-blue-500",
  "Internships":     "bg-amber-500",
  "Cities":          "bg-emerald-500",
  "Colleges":        "bg-violet-500",
  "Hiring Calendar": "bg-orange-500",
};

const REPORTS = [
  {
    slug: "luck-report-how-much-career-success-is-luck-2026",
    publishDate: "2026-06-05",
    title: "The Luck Report: How Much of Career Success Is Actually Luck?",
    subtitle: "The Luck Report · 2026",
    excerpt: "Every career story is told backward: skill and grit explain the outcome. Forward-looking data tells a messier story. Macro timing, family networks, geographic lottery, and random meetings explain a large share of who lands the role, who gets promoted, and who stalls. This report separates what luck actually means in careers, quantifies what researchers can measure, and maps a practical playbook for increasing your exposure to good fortune without pretending you control the dice.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "June 2026",
    findings: 7,
    badge: "New",
  },
  {
    slug: "interview-report-why-candidates-fail-after-shortlist-2026",
    publishDate: "2026-06-04",
    title: "The Interview Report: Why Candidates Fail After Getting Shortlisted",
    subtitle: "The Interview Report · 2026",
    excerpt: "Getting shortlisted means your paper profile passed. Most rejections after that happen for reasons candidates rarely hear: unclear structure, shallow prep, misread scope, or a stronger peer in the same week. This report maps why interviews fail after the shortlist, what changes by round, and how to protect the slot you already earned.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "June 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "tier-2-cities-hiring-jobs-leaving-bangalore-mumbai-2026",
    publishDate: "2026-05-30",
    title: "Tier 2 Cities Are Hiring: The Jobs Leaving Bangalore and Mumbai",
    subtitle: "India Labour Market · 2026",
    excerpt: "Bangalore and Mumbai still dominate headlines, but GCCs, IT services, and cost-conscious product teams are expanding in Pune, Hyderabad, Chennai, Ahmedabad, and other tier 2 hubs. This report maps which job lanes are actually shifting, what pay looks like in INR, and how to target the right city without guessing from LinkedIn noise.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "data-ai-internships-entry-level-reality-2026",
    publishDate: "2026-06-01",
    title: "Data and AI Internships 2026: Entry-Level Reality",
    subtitle: "Data & AI Internships · 2026",
    excerpt: "Every job post says AI, but most entry-level internships are still SQL, dashboards, and careful experimentation. This report maps what data and AI intern roles actually involve in 2026, which skills move shortlists, illustrative pay bands, who's hiring, and how to build proof when you do not have a PhD.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "June 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "finance-internships-india-ib-consulting-fintech-2026",
    publishDate: "2026-06-04",
    title: "Finance Internships India 2026: IB, Consulting, and Fintech",
    subtitle: "Finance Internships · India 2026",
    excerpt: "Finance internships in India split across investment banking, consulting, and fintech, each with different screens, stipend bands, and conversion paths. This report maps where hiring energy sits in 2026, what serious programmes pay in INR, and how students get shortlists when portals feel noisy.",
    category: "Finance",
    type: "Internships" as ReportType,
    date: "June 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "growth-marketing-jobs-skills-pay-hiring-2026",
    publishDate: "2026-05-30",
    title: "Growth Marketing Jobs 2026: Skills, Pay, and Who's Hiring",
    subtitle: "Growth Marketing · 2026",
    excerpt: "Growth marketing roles exploded on job boards, but titles vary wildly. This report defines what employers mean in 2026, which skills actually show up in reqs, illustrative US pay bands, who is hiring, and how students and career switchers break in with experiments instead of adjectives.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "unpaid-internship-report-where-legal-2026",
    publishDate: "2026-06-01",
    title: "The Unpaid Internship Report: Where It's Legal and Where It Isn't",
    subtitle: "The Unpaid Internship Report · 2026",
    excerpt: "Unpaid does not mean the same thing in every country. This report maps where zero-pay internships can be lawful, where minimum stipends apply, the tests courts and regulators use, and the practical questions students should ask before accepting an offer. Informational only, not legal advice.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "June 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "first-job-india-2026",
    publishDate: "2026-06-02",
    title: "First Job Report India 2026: What Entry-Level Actually Looks Like",
    subtitle: "First Jobs · India 2026",
    excerpt: "India's first-job market in 2026 is not one ladder. IT services, GCCs, startups, BFSI, and sales teams all hire at 0 to 2 years, but campus brand, city, and proof shape who gets shortlists. This report maps where entry-level hiring concentrates, what CTC bands look like without fairy tales, and how to search when portals feel noisy.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "June 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "singapore-remote-from-india-2026",
    publishDate: "2026-05-23",
    title: "Singapore Remote Jobs from India 2026: The Real Map",
    subtitle: "Singapore Remote · 2026",
    excerpt: "Nine in ten Singapore remote listings filter India out before you click apply. The ones that do not pay two to three times the Indian market. We map which roles cross borders, which Singapore companies already employ India remote, how the money actually moves through EORs and contractor structures, and the channels where these roles surface before they ever hit LinkedIn.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "May 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "rejection-report-what-happens-after-you-apply-2026",
    publishDate: "2026-05-20",
    title: "The Rejection Report: What Happens After You Apply",
    subtitle: "The Rejection Report · 2026",
    excerpt: "You clicked submit. Then nothing, or a generic rejection three weeks later. This report traces what happens inside ATS queues, why silence is the default outcome, how ghost jobs and post-interview ghosting differ, and how to run a pipeline when rejection is normal rather than personal.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "referrals-vs-applications-how-people-get-hired-2026",
    publishDate: "2026-05-20",
    title: "Referrals vs Applications: The Data on How People Actually Get Hired",
    subtitle: "Referrals vs Applications · 2026",
    excerpt: "Everyone is told to apply online. The hiring data tells a different story: referrals and warm introductions are a small fraction of applications but an outsized share of hires. This report compares channel volume to channel outcomes, explains why conversion beats volume, and maps a realistic mix for students and early-career candidates without a big network.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "mba-internship-market-india-2026",
    publishDate: "2026-05-19",
    title: "The MBA Internship Market India 2026: Who Hires, What They Pay, and How Offers Actually Close",
    subtitle: "MBA Internships · India 2026",
    excerpt: "MBA summer internships in India sit at the intersection of consulting, investment banking, FMCG, and tech strategy. This report maps where hiring energy is concentrated in 2026, what stipend bands look like for structured programmes, and how students get shortlists when portals feel noisy.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "linkedin-profile-what-hiring-managers-look-at-2026",
    publishDate: "2026-05-18",
    title: "The LinkedIn Profile Report: What Hiring Managers Look At",
    subtitle: "LinkedIn Profile · 2026",
    excerpt: "Your resume gets fifteen seconds. Your LinkedIn often gets less. This report maps the exact order hiring managers scan a profile, the signals that earn a second look, and practical templates for headline, about, and experience sections you can update in one sitting.",
    category: "LinkedIn",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 5,
    badge: "New",
  },
  {
    slug: "internships-singapore-what-gets-you-hired-2026",
    publishDate: "2026-05-12",
    title: "Internships in Singapore 2026: What Gets You Hired",
    subtitle: "Singapore internships · Hiring signals · 2026",
    excerpt: "Singapore packs MNC regional headquarters, fast-growing startups, and public-sector innovation programmes into a tight labour market. This report explains what hiring managers screen for in 2026, where intern demand concentrates, and how to convert interest into a signed offer without burning months on generic applications.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "cold-outreach-what-gets-reply-2026",
    publishDate: "2026-05-12",
    title: "Cold Outreach: What Actually Gets a Reply",
    subtitle: "Cold Outreach · 2026",
    excerpt: "Most cold messages never get a reply because they look like bulk mail the moment they land. This report breaks down what recipients actually scan for, how to structure a message that respects their time, and how to follow up without training people to ignore you.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 4,
    badge: "New",
  },
  {
    slug: "product-management-internships-india-2026",
    publishDate: "2026-05-10",
    title: "Product Management Internships India 2026: Who Hires, What You Earn, and How Offers Actually Close",
    subtitle: "PM Internships · India 2026",
    excerpt: "Product internships in India sit at the intersection of consumer apps, B2B SaaS, fintech, and scaled marketplaces. This report maps where hiring energy is concentrated in 2026, what stipend bands look like for APM and PM-intern roles, and how students actually get shortlists when portals feel noisy.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "dubai-hiring-whos-hiring-and-pay-2026",
    publishDate: "2026-05-08",
    title: "Dubai Hiring Report 2026: Who's Actually Hiring and What They Pay",
    subtitle: "Dubai Labour Market 2026",
    excerpt: "Dubai remains a magnet for regional headquarters, finance, logistics, and digital operations. This report maps where hiring energy is concentrated in 2026, what early-career pay bands look like in AED, and how offers surface beyond public listings.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "linkedin-easy-apply-killing-chances-2026",
    publishDate: "2026-05-07",
    title: "Why LinkedIn Easy Apply Is Killing Your Chances",
    subtitle: "Easy Apply 2026",
    excerpt: "A 2026 breakdown of why LinkedIn Easy Apply often correlates with worse outcomes: volume incentives, thin signals, recruiter triage, and a practical playbook to use the button without becoming noise.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 5,
    badge: "New",
  },
  {
    slug: "hidden-job-market-70-percent-never-posted-2026",
    publishDate: "2026-05-07",
    title: "The Hidden Job Market: How 70% of Roles Never Get Posted",
    subtitle: "Hidden Hiring 2026",
    excerpt: "A 2026 look at the hidden job market: why a large share of roles are filled through networks, referrals, and internal moves, what that means for board-only search, and how to build presence where hiring actually starts.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 5,
    badge: "New",
  },
  {
    slug: "why-80-percent-applications-get-no-response-2026",
    publishDate: "2026-05-07",
    title: "Why 80% of Applications Get No Response",
    subtitle: "Application Silence 2026",
    excerpt: "A 2026 breakdown of why job applications often get no response: automated filters, recruiter bandwidth, timing, weak role-fit signals, and practical ways to increase reply odds.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 5,
    badge: "New",
  },
  {
    slug: "tier-2-college-to-top-company-conversion-2026",
    publishDate: "2026-05-07",
    title: "Tier 2 College to Top Company: The Real Conversion Rate",
    subtitle: "Placement Math 2026",
    excerpt: "A clear 2026 breakdown of how Tier 2 students actually reach top-tier employers: what campus conversion means, why headline percentages mislead, and which paths compress the funnel.",
    category: "Career",
    type: "Colleges" as ReportType,
    date: "May 2026",
    findings: 5,
    badge: "New",
  },
  {
    slug: "unpaid-internship-trap-2026",
    publishDate: "2026-05-05",
    title: "The Unpaid Internship Trap: Is It Ever Worth It?",
    subtitle: "Unpaid Internships 2026",
    excerpt: "A practical 2026 framework to evaluate unpaid internships: the real upside, hidden costs, and the minimum conditions that make an unpaid role worth considering.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "May 2026",
    findings: 4,
    badge: "New",
  },
  {
    slug: "ops-india-2026",
    publishDate: "2026-04-12",
    title: "Operations Interns in India: The Skill Gap Nobody Talks About",
    subtitle: "Q1 2026",
    excerpt:
      "12,400+ ops intern openings. Only 19% of applicants work-ready. The Excel crisis, the SOP gap, and why Notion fluency is now the deciding factor in ops intern hiring across India.",
    category: "Operations",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-ai-india-2026",
    publishDate: "2026-04-08",
    title: "How Internships Are Changing Post-AI",
    subtitle: "Q1 2026",
    excerpt:
      "48% of applicants were ghosted last year. AI/ML intern stipends now run 3x higher than traditional roles. Here is what is actually shifting in internship hiring, which categories are collapsing, and what the AI-era intern looks like.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "cs-india-2026",
    publishDate: "2026-04-01",
    title: "CS in India: What Freshers Are Actually Getting Into",
    subtitle: "Q1 2026",
    excerpt:
      "135,000 IT hires projected for FY26. A 12x salary gap at Year 0 based purely on which company you join. And the one skill gap (DSA fluency) keeping 94.5% of engineering graduates out of the roles worth having.",
    category: "Tech",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "sales-india-2026",
    publishDate: "2026-04-01",
    title: "Sales in India: What Freshers Actually Face",
    subtitle: "Q1 2026",
    excerpt:
      "28,600+ entry-level openings. A ₹12 LPA ceiling that almost nobody in their first year reaches. And the one skill gap (CRM fluency) that ends 60% of sales interviews before they start.",
    category: "Sales",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "",
  },
  {
    slug: "finance-india-2026",
    publishDate: "2026-04-01",
    title: "Finance in India: What Graduates Actually Face",
    subtitle: "Q1 2026",
    excerpt:
      "1,400+ entry-level openings. A 20 LPA ceiling at global banks that almost nobody reaches. And the one skill gap that sends 75% of finance graduates home before the first round.",
    category: "Finance",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "",
  },
  {
    slug: "marketing-india-2026",
    publishDate: "2026-04-05",
    title: "Marketing Internships in India: Where the Good Roles Actually Are",
    subtitle: "Q1 2026",
    excerpt:
      "22,000+ listings. A 6x stipend gap between niche and generic roles. And the reason 90% of students apply to the wrong ones, and get nothing back.",
    category: "Marketing",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "pune-jobs-2026",
    publishDate: "2026-04-05",
    title: "Pune's Job Market in 2026: What Students Are Actually Walking Into",
    subtitle: "Q1 2026",
    excerpt:
      "4,800+ openings. A 3x salary gap between niche and generic roles. And why Hinjewadi isn't the only game in town anymore.",
    category: "City Report",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-15k-india-2026",
    publishDate: "2026-04-10",
    title: "Roles That Land You Above ₹15k: The Internship Map India 2026",
    subtitle: "Q2 2026",
    excerpt: "48 roles mapped across 8 domains. Which categories own the ₹30k+ bracket, which skills unlock the floor, and which roles will never pay ₹15k no matter who you are.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "April 2026",
    findings: 3,
    badge: "New",
  },
  {
    slug: "flame-marketing-2026",
    publishDate: "2026-04-15",
    title: "Flame University & Marketing Roles: Where Flame Grads Actually Land",
    subtitle: "Q1 2026",
    excerpt:
      "7 role tracks. A 1.7x salary gap between campus and off-campus. And the one skill that moves a Flame grad into the top 20% of marketing applicants immediately.",
    category: "Colleges",
    type: "Colleges" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "hiring-calendar-india-2026",
    publishDate: "2026-04-10",
    title: "India Hiring Calendar 2026: Which Companies Hire in Which Month",
    subtitle: "Q2 2026",
    excerpt:
      "80+ companies mapped with exact application windows. HUL opens 8 months before start. Goldman opens in August for a March internship. Miss the window and you wait a year.",
    category: "Hiring Calendar",
    type: "Hiring Calendar" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-germany-2026",
    publishDate: "2026-04-20",
    title: "Do Interns in Germany Get Paid? Stipends, Laws and What to Expect",
    subtitle: "Q1 2026",
    excerpt:
      "Germany's minimum wage is EUR 13.90/hour from Jan 2026 but mandatory internships are legally exempt. DAX 40 companies pay EUR 1,500 to 3,000/month. The exact rules, city data, and how international students qualify.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-uk-2026",
    publishDate: "2026-04-20",
    title: "Do Interns in the UK Get Paid? NLW Rules, Sector Rates and What to Expect",
    subtitle: "Q1 2026",
    excerpt:
      "The UK National Living Wage hits £12.71/hr in April 2026 and applies to most interns. Unpaid placements are largely illegal. Goldman pays £5,000/month. Here's what every sector actually pays and how to get in.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "skills-ai-entry-level-2026",
    publishDate: "2026-04-20",
    title: "Breaking Into AI in 2026: The Skills, Roles and Hiring Reality for Entry-Level Candidates",
    subtitle: "Q2 2026",
    excerpt:
      "94% of AI job postings want Python. 42% of roles are application-layer, not model-building. A deployed project scores 9.2/10 with hiring managers; a certificate scores 4.2. The exact stack, real salaries, and a 90-day path to your first AI role.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "internships-australia-2026",
    publishDate: "2026-04-20",
    title: "Do Interns in Australia Get Paid? Minimum Wage, Sector Rates and How to Apply",
    subtitle: "Q1 2026",
    excerpt:
      "Australia's minimum wage is AUD $24.95/hr from July 2025 and unpaid internships are tightly regulated under the Fair Work Act. Canva pays AUD $90,000+ annualised. Here's what the market actually looks like.",
    category: "Cities",
    type: "Cities" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "christ-university-finance-2026",
    publishDate: "2026-04-23",
    title: "Christ University & Finance Roles: What the Data Actually Says",
    subtitle: "Q2 2026",
    excerpt:
      "Bangalore has 600+ finance roles open right now. Most Christ students never see them. The 2x salary gap between campus and off-campus, the one skill separating 5 LPA from 10 LPA, and the companies worth targeting directly.",
    category: "Colleges",
    type: "Colleges" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "degree-vs-skills-2026",
    publishDate: "2026-05-03",
    title: "Degree vs Skills: What Hirers Actually Look at in 2026",
    subtitle: "Degree vs Skills Report 2026",
    excerpt: "55% of employers dropped degree requirements. But 65% of recruiters still filter by degree. A data-backed breakdown of what hirers actually rank, where degrees still gate, and how to position yourself either way.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "remote-internships-2026",
    publishDate: "2026-05-03",
    title: "Remote Internships 2026: Which Ones Are Real",
    subtitle: "Behavioural Report 2026",
    excerpt: "Around 35% of remote internship listings show at least one major fake signal. Red flags, green flags, pay as a signal, platform quality comparison, and a 4-step verification checklist.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "May 2026",
    findings: 6,
    badge: "New",
  },
  {
    slug: "startup-vs-mnc-2026",
    publishDate: "2026-05-03",
    title: "Startup vs MNC: A Real Comparison for Early-Career Talent",
    subtitle: "Startup vs MNC Report 2026",
    excerpt: "Salary, learning speed, brand name value, job security, and career velocity — compared across five dimensions with actual data. Neither is universally better. Here is how to decide.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 5,
    badge: "New",
  },
  {
    slug: "linkedin-profile-2026",
    publishDate: "2026-05-02",
    title: "The LinkedIn Profile Report: What Hiring Managers Actually Look At",
    subtitle: "LinkedIn Profile Report 2026",
    excerpt: "Hiring managers spend 7 seconds on your LinkedIn. A data-backed breakdown of what gets seen, what gets skipped, why referrals convert 4x, and the exact profile fixes that change your odds.",
    category: "Career",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 7,
    badge: "New",
  },
  {
    slug: "application-response-rate-2026",
    publishDate: "2026-05-01",
    title: "Why 80% of Applications Get No Response",
    subtitle: "Application Response Rate Report 2026",
    excerpt: "75% of resumes are filtered before a human sees them. A documented breakdown of every reason applications disappear: ATS filtering, volume, timing, ghost jobs, and the referral wall.",
    category: "Sector",
    type: "Sector" as ReportType,
    date: "May 2026",
    findings: 8,
    badge: "New",
  },
  {
    slug: "ghost-jobs-2026",
    publishDate: "2026-04-27",
    title: "Why Companies Post Jobs Without Planning to Hire",
    subtitle: "Ghost Jobs Report 2026",
    excerpt: "68% of managers have posted a job they weren't actively trying to fill. Ghost jobs, SEO theater, legal cover, investor optics | a documented breakdown of all 11 reasons a job posting exists with nothing to do with hiring.",
    category: "Sector",
    type: "Sector" as ReportType,
    date: "April 2026",
    findings: 11,
    badge: "New",
  },
  {
    slug: "job-search-2026",
    publishDate: "2026-04-22",
    title: "Job Boards Are Dead: How Students Actually Get Hired in 2026",
    subtitle: "Q2 2026",
    excerpt: "Job board callback rates sit at 2-7%. 75% of roles are filled through the hidden market. A referral makes you 5x more likely to get an interview. Here is the data and the system that actually works.",
    category: "Internships",
    type: "Internships" as ReportType,
    date: "April 2026",
    findings: 8,
    badge: "New",
  },
];

const FILTERS: Array<"All" | ReportType> = ["All", "Sector", "Internships", "Cities", "Colleges", "Hiring Calendar"];

function RequestForm() {
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/report-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Something went wrong"); setState("error"); return; }
      setState("done");
    } catch {
      setErrorMsg("Could not connect. Try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border-2 border-neutral-900 bg-green-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-green-500">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="font-['Clash_Display'] text-xl font-bold text-neutral-900">Request received</div>
        <p className="mt-2 font-['Satoshi'] text-sm text-neutral-500">We will review it and let you know when it is published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-neutral-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
      <div className="mb-2 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-violet-600">Request a Report</div>
      <h3 className="mb-1 font-['Clash_Display'] text-2xl font-bold text-neutral-900">
        What should we research next?
      </h3>
      <p className="mb-6 font-['Satoshi'] text-sm text-neutral-500">
        Tell us which job market, industry, or role you want data on. We review every request and publish the most-requested ones.
      </p>

      <div className="mb-4">
        <label className="mb-1.5 block font-['Satoshi'] text-sm font-semibold text-neutral-800">
          What would you like us to research? <span className="text-red-500">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Software engineering salaries in Bengaluru, Data science internships in India, MBA vs direct hire for finance..."
          required
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        />
        <div className="mt-1 text-right font-['Satoshi'] text-xs text-neutral-400">{topic.length}/500</div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block font-['Satoshi'] text-sm font-semibold text-neutral-800">
          Email <span className="text-neutral-400 font-normal">(optional, we will notify you when it is live)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={200}
          className="w-full rounded-xl border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        />
      </div>

      {state === "error" && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-['Satoshi'] text-sm text-red-700">{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={state === "loading" || !topic.trim()}
        className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-neutral-900 bg-violet-500 font-['Satoshi'] text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] disabled:opacity-60 disabled:pointer-events-none"
      >
        {state === "loading" ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}

const BASE_URL_COMPONENT = "https://studojo.com";

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Career Market Reports | Studojo",
  "description": "Free career market reports for students. Entry-level salary benchmarks, hiring trends, and skill gaps across Finance, Sales, CS, and more.",
  "url": `${BASE_URL_COMPONENT}/reports`,
  "publisher": {
    "@type": "Organization",
    "name": "Studojo",
    "url": BASE_URL_COMPONENT,
    "logo": { "@type": "ImageObject", "url": `${BASE_URL_COMPONENT}/favicon.png` },
  },
  "hasPart": REPORTS.map((r) => ({
    "@type": "Article",
    "headline": r.title,
    "url": `${BASE_URL_COMPONENT}/reports/${r.slug}`,
    "datePublished": r.publishDate,
    "author": { "@type": "Organization", "name": "Studojo" },
  })),
};

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState<"All" | ReportType>("All");
  const sorted = [...REPORTS].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  const visibleReports = activeFilter === "All" ? sorted : sorted.filter((r) => r.type === activeFilter);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-neutral-50">
        {/* Hero */}
        <section className="border-b-2 border-neutral-900 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-neutral-900 bg-violet-500 px-4 py-1.5 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]">
              Studojo Research
            </div>
            <h1 className="font-['Clash_Display'] text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              Market Reports
            </h1>
            <p className="mt-4 max-w-2xl font-['Satoshi'] text-lg text-neutral-600">
              Data-driven analyses of job markets, salary benchmarks, and hiring trends for students across India and beyond. No fluff. Just the numbers that matter.
            </p>
          </div>
        </section>

        {/* Filter tabs */}
        <section className="border-b-2 border-neutral-900 bg-white px-4 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex gap-1 overflow-x-auto py-3">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap rounded-full border-2 px-4 py-1.5 font-['Satoshi'] text-sm font-semibold transition-colors ${
                    activeFilter === f
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Reports grid */}
        <section className="mx-auto max-w-5xl px-4 py-12 md:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleReports.map((report) => (
              <Link
                key={report.slug}
                to={`/reports/${report.slug}`}
                className="group flex flex-col rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
              >
                {/* Card top */}
                <div className={`${TYPE_COLORS[report.type]} flex h-[168px] shrink-0 flex-col justify-between rounded-t-xl border-b-2 border-neutral-900 p-6`}>
                  <div className="flex items-start justify-between">
                    <span
                      className={
                        report.type === "Cities"
                          ? "rounded-full border-2 border-emerald-100/90 bg-emerald-950/45 px-3 py-1 font-['Satoshi'] text-xs font-bold text-emerald-50"
                          : "rounded-full border-2 border-white/40 bg-white/20 px-3 py-1 font-['Satoshi'] text-xs font-bold text-white"
                      }
                    >
                      {report.category}
                    </span>
                    {report.badge && (
                      <span className="rounded-full border-2 border-neutral-900 bg-amber-400 px-3 py-1 font-['Satoshi'] text-xs font-bold text-neutral-900">
                        {report.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-['Satoshi'] text-xs font-semibold uppercase tracking-widest text-white/70 line-clamp-2">
                    {report.findings} findings · {report.subtitle}
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-['Clash_Display'] text-lg font-bold leading-snug text-neutral-900">
                    {report.title}
                  </h2>
                  <p className="mt-2 flex-1 font-['Satoshi'] text-sm leading-relaxed text-neutral-600">
                    {report.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-['Satoshi'] text-xs text-neutral-400">{report.date}</span>
                    <span className="font-['Satoshi'] text-sm font-semibold text-violet-600 group-hover:underline">
                      Read report →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming soon placeholder */}
            <div className="flex flex-col rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 opacity-60">
              <div className="mb-3 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-400">
                Coming soon
              </div>
              <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-400">
                PM Roles in Bangalore 2026
              </h2>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-400">
                5,200+ open PM roles. Salary data, AI skill premiums, and where to actually apply.
              </p>
            </div>

            {/* Coming soon placeholder 2 */}
            <div className="flex flex-col rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 opacity-60">
              <div className="mb-3 font-['Satoshi'] text-xs font-bold uppercase tracking-widest text-neutral-400">
                Coming soon
              </div>
              <h2 className="font-['Clash_Display'] text-lg font-bold text-neutral-400">
                Data Science & Analytics Roles India 2026
              </h2>
              <p className="mt-2 font-['Satoshi'] text-sm text-neutral-400">
                Entry-level salaries, skill gaps, and which companies actually hire freshers into real data roles.
              </p>
            </div>

          </div>
        </section>

        {/* CTA banner */}
        <section className="border-t-2 border-neutral-900 bg-violet-500 px-4 py-14 text-center">
          <h2 className="font-['Clash_Display'] text-3xl font-bold text-white md:text-4xl">
            Find the roles these reports talk about.
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-['Satoshi'] text-base text-white/80">
            Use the Studojo Outreach tool to discover and apply to niche finance, PM, and marketing roles across India. ATS resume builder included.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/outreach"
              className="flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-8 font-['Satoshi'] text-sm font-bold text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)]"
            >
              Browse Internships
            </Link>
            <Link
              to="/dojos/careers"
              className="flex h-12 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 font-['Satoshi'] text-sm font-bold text-white transition hover:bg-white/20"
            >
              Build Your Resume Free
            </Link>
          </div>
        </section>

        {/* Request a report */}
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
          <div className="mx-auto max-w-2xl">
            <RequestForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
