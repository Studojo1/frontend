import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internships-mumbai-2026",
  "title": "Internships in Mumbai 2026: What 2,122 October Listings Show",
  "short": "Internships in Mumbai 2026",
  "description": "Internships in Mumbai: 2,122 October listings, but only 45 state a stipend (median ₹14,583 a month). Roles, titles, skills and how to judge an unpaid offer.",
  "keywords": "internships in mumbai, paid internship in mumbai, internship in mumbai for students, stipend in mumbai, how to get an internship in mumbai",
  "h1": "Internships in Mumbai:",
  "h1em": "What 2,122 Listings Show",
  "sub": "We tracked 2,122 Mumbai internship listings posted in October 2026. Only 45 state a stipend in rupees, and the median of those is ₹14,583 a month. The rest leave pay blank, so you have to ask before you say yes.",
  "published": "2026-11-11",
  "scope": "Mumbai · internships",
  "findings": [
    "Internships in Mumbai are easy to find: **2,122 October listings** in the Studojo Jobs Index, from 1,346 different employers.",
    "**Pay is the missing piece.** Just 45 listings (2.1%) state a stipend in rupees, and the median of the top of those ranges is ₹14,583 a month.",
    "**Marketing and people roles dominate.** The marketing-executive group covers 283 listings (13.3%), social media 204 (9.6%) and HR 190 (9.0%).",
    "**A certificate is promised far more often than money.** 788 listings with a full description (40.0%) mention a certificate, while 19 (1.0%) say the role is unpaid.",
    "**The move that works is to email the person who runs the team.** A short note with one piece of real work gets read in a way a portal application does not, and Stu can find that person and send the email from your own inbox."
  ],
  "stats": [
    {
      "num": "2,122",
      "label": "Internships listed in Mumbai, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹14,583",
      "label": "Median stated stipend a month, from the 45 internships that state one",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "28.1%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Which internships in Mumbai are open right now?",
      "sub": "Role groups across 2,122 October listings",
      "paras": [
        "Internships in Mumbai skew towards marketing, people and sales work. The table groups listings by job title, and the biggest group is marketing-executive with 283 listings, which is 13.3% of everything we track for the city. Social media follows with 204 (9.6%), then HR with 190 (9.0%) and business development with 113 (5.3%).",
        "The second tier is more varied. Operations executive has 66 listings, content writer 61, video editor 54, digital marketing 50 and graphic designer 49. Accountant (37), audit (32) and legal (30) are smaller but real if you are a commerce or law student.",
        "A caution on reading the table: groups come from title matching, so one title can land in two groups, and many titles such as associate, executive or trainee match none. Treat the shares as a guide to where the volume is, not a full census of Mumbai internships."
      ],
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "marketing (general)",
            "283",
            "13.3%"
          ],
          [
            "social media",
            "204",
            "9.6%"
          ],
          [
            "HR",
            "190",
            "9.0%"
          ],
          [
            "business development",
            "113",
            "5.3%"
          ],
          [
            "operations executive",
            "66",
            "3.1%"
          ],
          [
            "content writer",
            "61",
            "2.9%"
          ],
          [
            "video editor",
            "54",
            "2.5%"
          ],
          [
            "digital marketing",
            "50",
            "2.4%"
          ],
          [
            "graphic designer",
            "49",
            "2.3%"
          ],
          [
            "accountant",
            "37",
            "1.7%"
          ],
          [
            "audit",
            "32",
            "1.5%"
          ],
          [
            "legal",
            "30",
            "1.4%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Lead:** If you are a creative or marketing student, Mumbai has the most listings in the city for you. If you want finance or tech, expect fewer and email harder."
    },
    {
      "title": "What are Mumbai internships called, and when are they posted?",
      "sub": "Top titles and posting days",
      "paras": [
        "The most common title is Business Development (Sales) Internship with 62 listings, followed by Human Resources (HR) Internship with 60. Two Trailblazer trainee titles take 60 and 58 listings, which looks like one recruiter posting the same programme under two names. Social Media Marketing Internship has 52 and Content And Social Media Marketing Internship has 49.",
        "Spread is wide: 1,346 different employers posted these listings, and the ten biggest titles together are a small slice of the 2,122. The top ten employers hold only 7.9% of listings, so no one company decides the Mumbai internship market. About 5.3% of listings do not name the employer at all.",
        "The chart shows posting days. Wednesday leads with 477 listings (22.5%), then Thursday with 447 (21.1%) and Friday with 392 (18.5%). Sunday has just 43 (2.0%). These are listing dates, not hires, but they tell you when new roles appear and when to check."
      ],
      "chart": {
        "id": "rim269Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=2,122)",
        "labels": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "values": [
          299,
          285,
          477,
          447,
          392,
          179,
          43
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Business Development (Sales) Internship",
            "62"
          ],
          [
            "Human Resources (HR) Internship",
            "60"
          ],
          [
            "Trainee - Trailblazer",
            "60"
          ],
          [
            "Trainee Trailblazer Qualitykiosk",
            "58"
          ],
          [
            "Social Media Marketing Internship",
            "52"
          ],
          [
            "Content And Social Media Marketing Internship",
            "49"
          ],
          [
            "Marketing Internship",
            "29"
          ],
          [
            "Digital Marketing Internship",
            "24"
          ],
          [
            "Graphic Design Internship",
            "24"
          ],
          [
            "Video Editing/Making Internship",
            "23"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 1,346 different employers posted these listings, and 5.3% of listings do not name the employer."
      }
    },
    {
      "title": "Is there a paid internship in Mumbai, and what is the stipend?",
      "sub": "Only 45 of 2,122 listings state a stipend",
      "paras": [
        "Very few Mumbai internships say what they pay. Of 2,122 listings, 45 state a stipend in rupees, which is 2.1%. That does not mean the others are unpaid. It means the listing does not say, so you cannot compare them until you ask.",
        "For the 45 that do state it, the stipend in Mumbai is concentrated in the middle. 16 listings top out at ₹10,000 to 20,000 a month and 11 at ₹20,000 to 40,000. 12 sit at ₹5,000 to 10,000, 4 reach ₹40,000 or more, and 2 are under ₹5,000. The median of the top of these ranges is ₹14,583 a month.",
        "Only 19 listings (1.0%) use the word unpaid, and 46 (2.3%) mention a pre-placement offer. A stated stipend is also the top of a range, so the first month may pay less. Use ₹14,583 as a reference point for what an employer who bothers to state a figure offers, not as a promise."
      ],
      "chart": {
        "id": "rim269Stipend",
        "kind": "bar",
        "label": "Stated stipend, top of range, per month (45 internships that state pay in rupees)",
        "labels": [
          "under ₹5,000",
          "₹5,000 to 10,000",
          "₹10,000 to 20,000",
          "₹20,000 to 40,000",
          "₹40,000 or more"
        ],
        "values": [
          2,
          12,
          16,
          11,
          4
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** Before you accept an unstated stipend, ask for the monthly figure, the weekly hours and what you will produce. A firm answer in writing is a good sign, a vague one is your answer."
    },
    {
      "title": "What skills do Mumbai internship listings ask for?",
      "sub": "Share of 1,972 listings with a full description",
      "paras": [
        "Communication skills appear in 60.4% of Mumbai listings with a full description (1,191 of 1,972). That is the most common line by a wide margin, and it is not a skill you can prove with a certificate. It is something a good email shows in three sentences.",
        "Excel is next at 28.1%, social media at 26.0% and English at 23.6%. Canva appears in 9.4%, CRM tools in 8.8%, Adobe tools in 8.4% and SEO in 7.0%. Negotiation (6.3%) and content writing or copywriting (6.2%) round out the list, and 6.2% mention ChatGPT or AI tools.",
        "Notice what is not here: nobody is asking for advanced software. A portfolio is mentioned in 10.6% of listings and women candidates in 20.3%. If you can show one small Excel sheet or one Canva post you made, you are ahead of most applicants who only list tools on a profile."
      ],
      "chart": {
        "id": "rim269Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,972 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "social media",
          "English",
          "Canva",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Adobe tools (Photoshop, Illustrator)",
          "SEO",
          "negotiation",
          "content writing or copywriting"
        ],
        "values": [
          60.4,
          28.1,
          26.0,
          23.6,
          9.4,
          8.8,
          8.4,
          7.0,
          6.3,
          6.2
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get an internship in Mumbai?",
      "sub": "Who to email and what to send",
      "paras": [
        "Email the person who runs the team you would join. For a marketing internship that is the marketing head or the brand manager. For HR it is the HR head. For sales it is the sales lead or branch manager. Only 6.7% of Mumbai listings (132) put an email address in the description, so most of the time you have to find the name yourself.",
        "Send one small piece of real work, made for that company. A marketing intern could attach a one-page plan for three posts. An HR intern could send a short sourcing sheet for one open role. A design intern could redo one banner. Keep the email to three lines: who you are, what you made, and one question about the role.",
        "Follow up once, after about a week, and stop. Studojo built Stu to do the slow parts: it finds the person who hires, checks their work email, drafts a personal note and sends it from your own inbox once you start a campaign. Stu does not promise replies, and no email replaces doing the work."
      ]
    }
  ],
  "method": [
    "This report counts **2,122 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. Only internships are counted, and a listing counts for Mumbai when it names Mumbai as a location.",
    "Pay: 45 of 2,122 internships (2.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,972 listings (92.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Internshala, LinkedIn, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many internships are there in Mumbai?",
      "a": "We tracked 2,122 internship listings in Mumbai posted in October 2026, from 1,346 different employers. That is a count of listings in the Studojo Jobs Index, not of openings filled or hires made."
    },
    {
      "q": "Is there a paid internship in Mumbai?",
      "a": "Yes, but few listings say so. 45 of 2,122 state a stipend in rupees, and the median of the top of those ranges is ₹14,583 a month. Only 19 listings say unpaid, so most simply leave pay out and you need to ask."
    },
    {
      "q": "What is the stipend in Mumbai for interns?",
      "a": "Among the 45 listings that state one, 16 top out at ₹10,000 to 20,000 a month and 11 at ₹20,000 to 40,000. The median is ₹14,583 a month. Stated figures are the top of a range, so confirm the exact amount."
    },
    {
      "q": "What internships in Mumbai are there for students?",
      "a": "Marketing-executive roles lead with 283 listings, then social media with 204 and HR with 190. Business development has 113 and operations executive 66. A student with a commerce, design or media background has the most choice."
    },
    {
      "q": "Where are Mumbai internships listed?",
      "a": "We found 835 on Internshala (39.3%), 574 on LinkedIn (27.0%), 299 on Naukri (14.1%) and 275 on company career sites and ATS pages (13.0%). Shine had 139 (6.6%). Portals overlap, so the same role can appear more than once."
    },
    {
      "q": "How do you judge an unpaid or unstated internship offer?",
      "a": "Ask four things before you agree: the monthly amount, the weekly hours, who you report to and what you will make. Compare the figure with the ₹14,583 median that listings state. A certificate on its own is not pay, though 788 listings offer one."
    }
  ],
  "takeaway": {
    "sub": "What to remember about Mumbai internships",
    "items": [
      [
        "Pay is rarely stated",
        "45 of 2,122 listings give a stipend. Ask for the number before you accept."
      ],
      [
        "Use the median",
        "₹14,583 a month is the median among listings that state pay. Use it to sense-check an offer."
      ],
      [
        "Marketing leads",
        "Marketing-executive (283), social media (204) and HR (190) are the biggest role groups."
      ],
      [
        "Show, do not list",
        "Communication skills show up in 60.4% of descriptions. Prove it with one short, specific email."
      ],
      [
        "Email the team lead",
        "Send one piece of work to the person who runs the team, and follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-mumbai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Mumbai 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Internships in Mumbai 2026",
    "description": "2,122 active entry-level and internship listings for India posted in October 2026 (Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
    "variables": [
      "listings",
      "city",
      "stated salary (INR, top of range)",
      "stated stipend (INR per month)",
      "skills and terms mentioned",
      "posting weekday"
    ]
  }
};

export function meta() {
  return dataReportMeta(R);
}

export default function Report() {
  return (
    <DataReport r={R}>
      <StuCta via="report-internships-mumbai-2026" place="report-end" size="card" title={"Want to email the person who hires in Mumbai?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
