import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internships-with-ppo-india-2026",
  "title": "Internship With PPO in India 2026: What 460 Listings Actually Say",
  "short": "Internship With PPO in India 2026",
  "description": "Internship with PPO: 460 of 18,458 October 2026 internship listings mention a pre-placement offer. See roles, cities, skills and what they ask for.",
  "keywords": "internship with ppo, ppo in internship, pre placement offer internship, internships that lead to jobs india",
  "h1": "Internship With PPO in India:",
  "h1em": "What 460 Listings Say",
  "sub": "An internship with PPO is rare: 460 of 18,458 October internship listings mention a pre-placement offer. This slice is internships whose description mentions the term. HR, business development and marketing lead, and a PPO is a possibility the listing mentions, not a promise.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "An **internship with PPO** is a small slice: 460 of the 18,458 internship listings in the Studojo Jobs Index for October 2026 mention a pre-placement offer, and all 460 are internships.",
    "**HR leads the slice with 70 listings (15.2%)**, ahead of business development (53) and marketing executive (48). Finance is where the term is most common: 6.6% of finance internship descriptions mention a PPO.",
    "**Bengaluru has the most PPO listings, 89 (19.3%)**, then Noida with 54 and Mumbai with 46. By share, Noida is highest, with 5.5% of its internship descriptions mentioning a PPO.",
    "**More than half ask for a certificate (54.1%)**, 21.7% mention a portfolio, and 6.7% say unpaid. Only 17 of the 460 state a stipend, with a median of ₹12,000 a month.",
    "**A PPO is earned by the person who manages you, so write to that person.** An average opening draws about 242 applications (Business Insider data via The Interview Guys, April 2026). Stu finds the hiring manager and drafts the email."
  ],
  "stats": [
    {
      "num": "460",
      "label": "Listings whose description (200 or more characters) mentions a pre-placement offer (PPO), October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "3.7%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "29.6%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What is an internship with PPO, and how common is it?",
      "sub": "Role groups where listings mention a pre-placement offer.",
      "paras": [
        "A PPO, or pre-placement offer, is a job offer made to an intern before the internship ends. An internship with PPO is a listing that mentions it as a possible next step. In our October data, 460 of 18,458 internship listings do, so it is the exception. The table shows how common the term is by role group, measured across all October internships in each group. Finance is highest at 6.6%. HR follows at 4.6%, business development at 4.1%, mobile app developer at 3.8% and operations executive at 3.5%. UI/UX designer is at 3.3% and Python developer at 2.9%.",
        "Marketing executive internships are numerous, with 2,033 carrying a description, but only 2.4% mention a PPO. Volume and PPO talk do not go together."
      ],
      "table": {
        "head": [
          "Role group",
          "Internships with a description",
          "Share that mention a pre-placement offer (PPO)"
        ],
        "rows": [
          [
            "finance",
            "211",
            "6.6%"
          ],
          [
            "HR",
            "1,526",
            "4.6%"
          ],
          [
            "business development",
            "1,279",
            "4.1%"
          ],
          [
            "mobile app developer",
            "79",
            "3.8%"
          ],
          [
            "operations executive",
            "395",
            "3.5%"
          ],
          [
            "UI/UX designer",
            "181",
            "3.3%"
          ],
          [
            "Python developer",
            "103",
            "2.9%"
          ],
          [
            "supply chain and logistics",
            "113",
            "2.7%"
          ],
          [
            "telecaller",
            "110",
            "2.7%"
          ],
          [
            "interior designer",
            "79",
            "2.5%"
          ],
          [
            "marketing (general)",
            "2,033",
            "2.4%"
          ],
          [
            "graphic designer",
            "396",
            "2.3%"
          ],
          [
            "content writer",
            "462",
            "2.2%"
          ],
          [
            "SEO",
            "201",
            "2.0%"
          ]
        ],
        "note": "Share of all October internships in each role group (not only this report's slice), keyword match on the description."
      },
      "callout": "**Read it carefully:** a mention of PPO means the listing talks about one. It does not mean an offer is given to every intern."
    },
    {
      "title": "Which internships lead to jobs in India?",
      "sub": "Titles and role groups inside the 460 PPO listings.",
      "paras": [
        "Inside the 460 PPO listings, the roles are sales, people and marketing. HR has 70 listings, business development 53, marketing executive 48, social media 22, finance 14 and operations executive 14. Digital marketing has 11, content writer 10 and graphic designer 9. The title table repeats it. Business Development Intern has 18 listings, Human Resources Intern 12 and Business Development (Sales) Internship 9. Talent Acquisition Intern and Social Media Marketing Intern have 7 each. Finance Intern, HR Intern and Junior Trader Intern each have 6.",
        "320 different employers posted these 460 listings, and the top 10 account for 17.0%, so the supply is spread out. That is good news: you are not limited to a handful of firms."
      ],
      "chart": {
        "id": "riwpi295Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=460)",
        "labels": [
          "Bengaluru",
          "Noida",
          "Mumbai",
          "Delhi",
          "Gurugram",
          "Hyderabad",
          "Jaipur",
          "Pune",
          "Chandigarh",
          "Indore"
        ],
        "values": [
          89,
          54,
          46,
          43,
          37,
          20,
          18,
          17,
          12,
          12
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "City",
          "Internships with a description",
          "Share that mention a pre-placement offer (PPO)"
        ],
        "rows": [
          [
            "Mumbai",
            "1,972",
            "2.3%"
          ],
          [
            "Bengaluru",
            "1,972",
            "4.5%"
          ],
          [
            "Chennai",
            "587",
            "1.7%"
          ],
          [
            "Hyderabad",
            "849",
            "2.4%"
          ],
          [
            "Delhi",
            "1,335",
            "3.2%"
          ],
          [
            "Pune",
            "854",
            "2.0%"
          ],
          [
            "Gurugram",
            "895",
            "4.1%"
          ],
          [
            "Ahmedabad",
            "399",
            "2.8%"
          ],
          [
            "Noida",
            "982",
            "5.5%"
          ],
          [
            "Kolkata",
            "237",
            "1.3%"
          ]
        ]
      }
    },
    {
      "title": "Where are PPO internships in India?",
      "sub": "Cities by count, and by how often the term appears.",
      "paras": [
        "Bengaluru has 89 PPO listings (19.3%), Noida 54 (11.7%), Mumbai 46 (10.0%), Delhi 43 (9.3%) and Gurugram 37 (8.0%). Hyderabad has 20, Jaipur 18, Pune 17, and Chandigarh and Indore 12 each. Noida has the highest rate. 5.5% of its internship descriptions mention a PPO. Bengaluru is at 4.5%, Gurugram 4.1% and Delhi 3.2%. Mumbai is at 2.3%, Pune 2.0%, Chennai 1.7% and Kolkata 1.3%.",
        "Remote matters here more than elsewhere: 71 of the 460 (15.4%) are marked remote, and 80 name no city. LinkedIn carries 263 of the 460 (57.2%), Internshala 69 and company career sites 48. That is where these listings were found, not a ranking."
      ],
      "chart": {
        "id": "riwpi295Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (460 listings with a full description)",
        "labels": [
          "a pre-placement offer (PPO)",
          "a certificate",
          "freshers",
          "a portfolio",
          "targets",
          "incentives",
          "work from home",
          "work from office",
          "unpaid",
          "hybrid"
        ],
        "values": [
          100.0,
          54.1,
          27.2,
          21.7,
          19.8,
          15.0,
          11.3,
          9.3,
          6.7,
          6.3
        ],
        "unit": "%"
      }
    },
    {
      "title": "What skills do internships with a pre placement offer ask for?",
      "sub": "Skills named across the 460 listings.",
      "paras": [
        "Communication skills lead at 70.2% of the 460 descriptions. Excel is named in 29.6%, English in 25.9%, social media in 24.6% and CRM tools in 15.9%. Calling or telecalling is in 12.8%, Canva in 11.3% and Hindi in 11.1%. ChatGPT or AI tools appear in 10.7%, which is notable for internships and absent from most full-time listings. Negotiation is in 7.0%, SEO in 6.1%, Adobe tools in 5.2% and Figma in 5.2%.",
        "Conditions are a mix. A certificate is mentioned in 54.1%, freshers in 27.2%, a portfolio in 21.7% and targets in 19.8%. Incentives appear in 15.0% and an MBA or PGDM in 18.3%. Unpaid is written in 6.7%, so check pay before you accept."
      ],
      "chart": {
        "id": "riwpi295Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (460 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "social media",
          "CRM tools (Salesforce, HubSpot or similar)",
          "calling or telecalling",
          "Canva",
          "Hindi",
          "ChatGPT or AI tools",
          "negotiation"
        ],
        "values": [
          70.2,
          29.6,
          25.9,
          24.6,
          15.9,
          12.8,
          11.3,
          11.1,
          10.7,
          7.0
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you turn an internship into a PPO?",
      "sub": "Write to the manager, and make the work visible from day one.",
      "paras": [
        "Start with the person who will manage you: the HR head or talent lead for HR internships, the sales head for business development, the marketing lead for social media. A PPO is that person's decision, so they are the right one to write to before you apply. Send one piece of proof tied to the role. For HR, a short screening checklist. For business development, a list of ten leads with a first message. For social media, a week of post ideas. Say in three lines who you are, what you made, and that you want to do the work well enough to be considered for a full-time role.",
        "Follow up once. Once in, keep a short log of what you delivered each week. Stu does the slow parts before that: it finds who is hiring with a verified work email, drafts the note from your real work and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **460 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts when its description (200 or more characters) mentions a pre-placement offer (PPO). Only internships are counted.",
    "Pay: 17 of 460 internships (3.7%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 460 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What is an internship with PPO?",
      "a": "It is an internship where the employer may offer you a full-time job at the end. PPO stands for pre-placement offer. In October 2026, 460 of 18,458 internship listings we track mention one."
    },
    {
      "q": "Does a PPO in an internship mean a sure job?",
      "a": "No. A listing that mentions a PPO is describing a possibility, and 6.7% of these listings also say unpaid. Ask the manager how past interns were converted before you accept."
    },
    {
      "q": "Which internships have the highest PPO chance?",
      "a": "We cannot measure chance, only how often listings mention it. Finance (6.6% of finance internship descriptions), HR (4.6%) and business development (4.1%) mention a PPO most often."
    },
    {
      "q": "Which internships lead to jobs in India?",
      "a": "The most PPO mentions are in HR (70 listings), business development (53) and marketing executive (48) roles. Bengaluru (89), Noida (54) and Mumbai (46) have the most."
    },
    {
      "q": "Do PPO internships pay a stipend?",
      "a": "Most do not say. Only 17 of the 460 listings state a stipend, with a median of ₹12,000 a month. The word unpaid appears in 6.7% of them."
    },
    {
      "q": "How do I get a pre placement offer internship?",
      "a": "Email the manager who runs the team with one piece of work for that role, then follow up once. Remote options exist: 71 of the 460 listings (15.4%) are marked remote."
    }
  ],
  "takeaway": {
    "sub": "What to remember about PPO listings.",
    "items": [
      [
        "It is rare",
        "460 of 18,458 internship listings mention a PPO."
      ],
      [
        "It is a possibility",
        "A mention is not a promise, so ask how interns were converted."
      ],
      [
        "Look at finance, HR and sales",
        "They mention PPO most often by share."
      ],
      [
        "Check pay",
        "Only 17 of the 460 state a stipend and 6.7% say unpaid."
      ],
      [
        "Write to the manager",
        "The person who manages you decides, not the pile of 242 applications."
      ]
    ]
  },
  "related": [
    {
      "slug": "best-day-to-apply-for-jobs-india-2026",
      "kicker": "Data",
      "title": "Best Day to Apply for Jobs India 2026"
    },
    {
      "slug": "english-and-hindi-job-requirements-india-2026",
      "kicker": "Data",
      "title": "English and Hindi Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Internship With PPO in India 2026",
    "description": "460 active entry-level and internship listings for India posted in October 2026 (internships with a PPO), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-internships-with-ppo-india-2026" place="report-end" size="card" title={"Want to reach the manager who decides?"} line={"Tell Stu the role, the city and the pay you want. Stu finds jobs that fit you and who is hiring, with a verified work email. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
