import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "business-development-internship-india-2026",
  "title": "Business Development Internship in India: 760 Listings, Targets 2026",
  "short": "Business Development Internship 2026",
  "description": "Business development internship in India: 760 listings in the Studojo Jobs Index, 43.1% mention targets, and only 9 state a stipend.",
  "keywords": "business development internship in india, bde internship, business development internship stipend, sales internship in india",
  "h1": "Business Development Internship in India:",
  "h1em": "760 Listings and Targets",
  "sub": "The Studojo Jobs Index has 760 business development internship listings posted in the first half of November 2026. 43.1% of described listings mention targets, and only 9 (1.2%) state a stipend, with a median top of range of ₹13,000 a month.",
  "published": "2026-11-18",
  "scope": "India · business development internship",
  "findings": [
    "**A business development internship in India** has 760 listings in the Studojo Jobs Index from 654 employers, and Business Development (Sales) Internship alone accounts for 258.",
    "**Targets define the work**: 43.1% of described listings mention targets and 35.6% incentives, against 20.9% and 9.3% across the whole index.",
    "**Stated pay is rare**: 9 listings (1.2%) give a stipend, and the median top of range is ₹13,000 a month. The other 98.8% say nothing.",
    "**CRM tools are named in 46.1%** of described listings and calling or telecalling in 26.5%, so the job is mostly outreach and follow-up.",
    "**The move that works** is a short email to the sales or business head with a small prospect list as proof. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "760",
      "label": "Business development internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "1.2%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "46.1%",
      "label": "Of listings with a full description ask for CRM tools (Salesforce, HubSpot or similar)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What are business development internships called, and what do they ask for?",
      "sub": "Titles as posted, then keyword share across 759 described listings.",
      "paras": [
        "Business Development (Sales) Internship leads with 258 listings, a third of all 760, and Business Development Intern has 174. Business Development Internship adds 33. The brackets matter: the plain sales wording tells you this is closer to a sales seat than a strategy desk.",
        "Inside Sales Internship has 18 and Inside Sales Intern 12. Marketing And Business Development Intern has 11 and International Business Development Internship 8. A BDE internship is the same role under a shorter name, so search for both.",
        "Communication skills appear in 80.8% of described listings, CRM tools in 46.1% and English in 41.9%. Excel is at 28.7%, calling at 26.5%, social media at 25.4% and negotiation at 23.7%. Hindi is named in 13.7%, which signals many calls are made in it."
      ],
      "chart": {
        "id": "rbdii244Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (759 listings with a full description)",
        "labels": [
          "communication skills",
          "CRM tools (Salesforce, HubSpot or similar)",
          "English",
          "Excel",
          "calling or telecalling",
          "social media",
          "negotiation",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "ChatGPT or AI tools"
        ],
        "values": [
          80.8,
          46.1,
          41.9,
          28.7,
          26.5,
          25.4,
          23.7,
          13.7,
          6.2,
          4.5
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Business Development (Sales) Internship",
            "258"
          ],
          [
            "Business Development Intern",
            "174"
          ],
          [
            "Business Development Internship",
            "33"
          ],
          [
            "Inside Sales Internship",
            "18"
          ],
          [
            "Inside Sales Intern",
            "12"
          ],
          [
            "Marketing And Business Development Intern",
            "11"
          ],
          [
            "Business Development Executive Internship",
            "11"
          ],
          [
            "International Business Development Internship",
            "8"
          ],
          [
            "Business Development Executive",
            "7"
          ],
          [
            "Business Development Executive Intern",
            "7"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 654 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "Where are business development internships in India?",
      "sub": "Top cities and remote share.",
      "paras": [
        "Bengaluru has 105 business development internship listings (13.8%), well ahead of Delhi with 69 and Noida with 56. Mumbai has 55, Gurugram 46 and Hyderabad 43. Indore appears in the top ten with 19, which is unusual for a metro-heavy field.",
        "202 listings (26.6%) are marked remote, against 6.5% across the whole index, and 207 name no city. Work from home is named in 20.8% of described listings and work from office in 5.9%. Many of these roles are phone and screen based.",
        "Posting runs Monday to Friday, with Thursday highest at 19.7%. LinkedIn carries 44.1% of listings and Internshala 41.8%, a closer split than most fields, so check both before you decide there is nothing open."
      ],
      "chart": {
        "id": "rbdii244Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=760)",
        "labels": [
          "Bengaluru",
          "Delhi",
          "Noida",
          "Mumbai",
          "Gurugram",
          "Hyderabad",
          "Pune",
          "Indore",
          "Chennai",
          "Kolkata"
        ],
        "values": [
          105,
          69,
          56,
          55,
          46,
          43,
          31,
          19,
          17,
          14
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "City",
          "Listings",
          "Share of listings"
        ],
        "rows": [
          [
            "Bengaluru",
            "105",
            "13.8%"
          ],
          [
            "Delhi",
            "69",
            "9.1%"
          ],
          [
            "Noida",
            "56",
            "7.4%"
          ],
          [
            "Mumbai",
            "55",
            "7.2%"
          ],
          [
            "Gurugram",
            "46",
            "6.1%"
          ],
          [
            "Hyderabad",
            "43",
            "5.7%"
          ],
          [
            "Pune",
            "31",
            "4.1%"
          ],
          [
            "Indore",
            "19",
            "2.5%"
          ],
          [
            "Chennai",
            "17",
            "2.2%"
          ],
          [
            "Kolkata",
            "14",
            "1.8%"
          ]
        ],
        "note": "A listing can name more than one city. 202 listings are marked remote and 207 name no city."
      }
    },
    {
      "title": "How much does a business development internship pay?",
      "sub": "Stated stipend, top of range, on 9 internships.",
      "paras": [
        "Only 9 of 760 business development internships state a stipend in rupees, which is 1.2%. Nothing is stated on 98.8%. That is a very small sample, so treat the numbers as a hint, not a rate card.",
        "Among those 9, the median top of range is ₹13,000 a month. Five sit in the ₹10,000 to 20,000 band (55.6%) and 4 in ₹20,000 to 40,000 (44.4%). None are below ₹10,000 and none reach ₹40,000.",
        "Many of these roles pair a small base with incentives, named in 35.6% of described listings. So ask what is fixed and what is variable, and whether incentives count from day one. Unpaid is mentioned in 4.5%, and 1 listing mentions a fee. Never pay to be hired."
      ],
      "callout": "**Lead:** only 9 of 760 business development internships state a stipend, and 43.1% of described listings mention targets."
    },
    {
      "title": "Do business development internships have targets?",
      "sub": "What the descriptions say about the terms.",
      "paras": [
        "Yes, often. Targets appear in 43.1% of described listings and incentives in 35.6%. A certificate is named in 50.5%, the single most common term. Freshers are welcomed in 29.2% and women candidates in 25.7%.",
        "Read the target line closely. A target can mean calls made, meetings booked or revenue closed, and those are very different jobs for an intern. Ask which one, how it is measured and whether a missed target changes your stipend or your certificate.",
        "Hybrid is named in 4.1% and a pre-placement offer (PPO) in 4.1%. MBA or PGDM is mentioned in 10.7% and BBA in 8.0%. A two-wheeler or driving licence is named in 1.3%, which usually means field visits."
      ],
      "chart": {
        "id": "rbdii244Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (759 listings with a full description)",
        "labels": [
          "a certificate",
          "targets",
          "incentives",
          "freshers",
          "work from home",
          "work from office",
          "unpaid",
          "hybrid",
          "a pre-placement offer (PPO)",
          "your own laptop"
        ],
        "values": [
          50.5,
          43.1,
          35.6,
          29.2,
          20.8,
          5.9,
          4.5,
          4.1,
          4.1,
          2.9
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** ask whether targets are calls, meetings or revenue before you start."
    },
    {
      "title": "How do you get a business development internship?",
      "sub": "Write to the sales or business head with a prospect list.",
      "paras": [
        "At a startup, write to the founder, who is usually also the head of sales. At a larger company, write to the sales manager or the business head who runs the team you would join. Only 10.3% of descriptions carry an email address, so expect to find the person yourself.",
        "Send one small proof: a one-page list of ten prospects for their product, each with a one-line reason they would buy and a sample first message you would send. It shows research and writing, which is what the calling and CRM lines in these listings test. Keep the list short and specific.",
        "The email is three lines: who you are, what you attached and what you ask. Follow up once. Stu does the slow parts: it finds who hires, verifies the work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **760 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a business development internship when its job title matches that kind of role (the most common titles here: \"Business Development (Sales) Internship\", \"Business Development Intern\", \"Business Development Internship\").",
    "Pay: 9 of 760 internships (1.2%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 759 listings (99.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many business development internships are there in India?",
      "a": "The Studojo Jobs Index has 760 business development internship listings posted 1 to 15 November 2026, from 654 employers. Listings are not hires."
    },
    {
      "q": "What is a BDE internship?",
      "a": "BDE stands for business development executive. A BDE internship is the intern version: prospecting, calls, follow-ups and tracking leads. CRM tools appear in 46.1% of described listings."
    },
    {
      "q": "What is the stipend for a business development internship?",
      "a": "Only 9 listings (1.2%) state a stipend. The median top of range among them is ₹13,000 a month. Incentives are named in 35.6% of described listings."
    },
    {
      "q": "Is a sales internship in India the same thing?",
      "a": "Close. Business Development (Sales) Internship is the top title with 258 listings, and Inside Sales Internship has 18. Calling or telecalling appears in 26.5% of described listings."
    },
    {
      "q": "Do business development internships have targets?",
      "a": "Often: 43.1% of described listings mention targets, against 20.9% across the whole index. Ask whether targets are calls, meetings or revenue."
    },
    {
      "q": "Can I do a business development internship from home?",
      "a": "Yes. 202 listings (26.6%) are marked remote and 20.8% of described listings mention work from home."
    }
  ],
  "takeaway": {
    "sub": "Five points for a business development internship.",
    "items": [
      [
        "Search BDE and sales",
        "Business Development (Sales) Internship has 258 listings."
      ],
      [
        "Ask what the target is",
        "43.1% mention targets and 35.6% incentives."
      ],
      [
        "Ask about pay",
        "Only 9 of 760 state a stipend, with a median of ₹13,000 a month."
      ],
      [
        "Know a CRM",
        "46.1% of described listings name CRM tools."
      ],
      [
        "Email the sales head",
        "Attach a short prospect list for their product."
      ]
    ]
  },
  "related": [
    {
      "slug": "business-development-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Business Development Jobs for Freshers 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Business Development Internship 2026",
    "description": "760 active entry-level and internship listings for India posted 1 to 15 November 2026 (business development internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-business-development-internship-india-2026" place="report-end" size="card" title={"Want to email a sales head directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies the work email and writes a short note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
