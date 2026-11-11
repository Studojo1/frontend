import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-mba-freshers-2026",
  "title": "Jobs for MBA Freshers 2026: 4,708 Listings and Stated Salaries",
  "short": "Jobs for MBA Freshers 2026",
  "description": "Jobs for MBA freshers: 4,708 October listings mention MBA or PGDM, and 968 state pay with a median of 4 lakh a year. Roles, cities, skills and what to do.",
  "keywords": "jobs for mba freshers, jobs for mba freshers 2026, best jobs for mba freshers, salary for mba freshers",
  "h1": "Jobs for MBA Freshers in India:",
  "h1em": "What 4,708 Listings Show",
  "sub": "We tracked 4,708 entry-level and internship listings in October 2026 whose description mentions MBA or PGDM. Of the 968 that state pay in rupees, the median is 4 lakh a year, and the middle half runs from 3 lakh to 5.5 lakh.",
  "published": "2026-11-11",
  "scope": "India · MBA freshers",
  "findings": [
    "Jobs for MBA freshers show up in **4,708 October listings** in the Studojo Jobs Index, from 2,651 different employers.",
    "**HR is the largest role group by far.** It has 818 listings (17.4%), more than double business development with 418 (8.9%) and relationship manager with 249 (5.3%).",
    "**The stated salary median is 4 lakh a year, the same as the whole index.** 968 jobs (28.1%) state pay, and the middle half runs from 3 lakh to 5.5 lakh.",
    "**Bengaluru (664 listings) and Mumbai (599) lead.** Hyderabad has 494, and 334 listings are marked remote.",
    "**The move that works is to email the head of the function you want.** Stu finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "4,708",
      "label": "October listings that mention MBA freshers",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 968 jobs that state it (28.1%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "40.1%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What jobs are there for MBA freshers?",
      "sub": "Titles as employers wrote them",
      "paras": [
        "The slice is every listing whose description mentions MBA or PGDM, and it is a mix of roles that value the degree and roles that merely allow it. Of the 4,708, 3,448 are entry-level jobs and 1,260 are internships (26.8%), a much bigger internship share than in the whole index.",
        "The most common titles are Business Development (Sales) Internship with 64 listings and Business Development Executive with 62. Human Resources internships appear under three spellings: 46, 35 and 34 listings. E-Commerce Executive has 33, Relationship Manager 24 and Management Trainee 24. HR Recruiter and Sales Executive have 23 each.",
        "A mention is not a requirement. A listing may say MBA preferred, or list MBA beside BBA or BCom. Read each description for what it actually asks. The 2,651 different employers behind these listings means no single company dominates, and the ten biggest hold 9.8%."
      ],
      "chart": {
        "id": "rjfmf284Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=4,708)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          3448,
          1260
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
            "64"
          ],
          [
            "Business Development Executive",
            "62"
          ],
          [
            "Human Resources (HR) Internship",
            "46"
          ],
          [
            "Human Resource Intern",
            "35"
          ],
          [
            "Human Resources Intern",
            "34"
          ],
          [
            "E-Commerce Executive",
            "33"
          ],
          [
            "Relationship Manager",
            "24"
          ],
          [
            "Management Trainee",
            "24"
          ],
          [
            "HR Recruiter",
            "23"
          ],
          [
            "Sales Executive",
            "23"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 2,651 different employers posted these listings, and 0.0% of listings do not name the employer."
      },
      "callout": "**Lead:** More than one in four MBA-mentioning listings is an internship, so a short internship is a real route in, not a fallback."
    },
    {
      "title": "Which role groups hire MBA freshers?",
      "sub": "Role groups and the skills they ask for",
      "paras": [
        "HR leads with 818 listings (17.4%), followed by business development with 418 (8.9%) and relationship manager with 249 (5.3%). Marketing-executive has 192 (4.1%), field sales 174 (3.7%), accountant 167 (3.5%), finance 113 (2.4%) and management trainee 113 (2.4%). Business analyst has 53 (1.1%).",
        "That means the MBA mention is more often attached to people and sales work than to strategy or analytics. If you want finance or analytics, the group counts are small, so you will search harder and email more directly.",
        "Skills tell the same story. Communication skills appear in 76.0% of listings, Excel in 40.1% and English in 26.3%. CRM tools (14.6%) and negotiation (14.4%) follow. Calling or telecalling is in 8.3%, social media in 8.2%, Hindi in 6.4%, cloud in 4.4% and Power BI in 4.4%. Excel is the single most useful thing to be able to show."
      ],
      "chart": {
        "id": "rjfmf284Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (4,708 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "calling or telecalling",
          "social media",
          "Hindi",
          "Power BI",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          76.0,
          40.1,
          26.3,
          14.6,
          14.4,
          8.3,
          8.2,
          6.4,
          4.4,
          4.4
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "HR",
            "818",
            "17.4%"
          ],
          [
            "business development",
            "418",
            "8.9%"
          ],
          [
            "relationship manager",
            "249",
            "5.3%"
          ],
          [
            "marketing (general)",
            "192",
            "4.1%"
          ],
          [
            "field sales",
            "174",
            "3.7%"
          ],
          [
            "accountant",
            "167",
            "3.5%"
          ],
          [
            "finance",
            "113",
            "2.4%"
          ],
          [
            "management trainee",
            "113",
            "2.4%"
          ],
          [
            "customer service",
            "109",
            "2.3%"
          ],
          [
            "operations executive",
            "85",
            "1.8%"
          ],
          [
            "retail sales",
            "54",
            "1.1%"
          ],
          [
            "business analyst",
            "53",
            "1.1%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "Where are the MBA fresher jobs in India?",
      "sub": "Top cities in the slice",
      "paras": [
        "Bengaluru has the most MBA-mentioning listings with 664 (14.1%), then Mumbai with 599 (12.7%) and Hyderabad with 494 (10.5%). Gurugram has 342, Pune 325, Delhi 279, Noida 263 and Chennai 247. Ahmedabad has 190 and Kolkata 104 (2.2%).",
        "Hyderabad ranks higher here than in the whole index, where it sits fourth overall. A listing can name more than one city, and 334 listings (7.1%) are marked remote while 428 name no city. The NCR cities together (Delhi, Gurugram and Noida) add up to a strong cluster if you are willing to commute across them.",
        "Where listings were found: Naukri 37.9%, LinkedIn 29.3%, company career sites and ATS pages 14.4%, Internshala 9.9% and Shine 8.1%. iimjobs carried 0.4%. This is only where we found them, not a ranking of portals. Check more than one, since the same role can be listed twice."
      ],
      "chart": {
        "id": "rjfmf284Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=4,708)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Hyderabad",
          "Gurugram",
          "Pune",
          "Delhi",
          "Noida",
          "Chennai",
          "Ahmedabad",
          "Kolkata"
        ],
        "values": [
          664,
          599,
          494,
          342,
          325,
          279,
          263,
          247,
          190,
          104
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
            "664",
            "14.1%"
          ],
          [
            "Mumbai",
            "599",
            "12.7%"
          ],
          [
            "Hyderabad",
            "494",
            "10.5%"
          ],
          [
            "Gurugram",
            "342",
            "7.3%"
          ],
          [
            "Pune",
            "325",
            "6.9%"
          ],
          [
            "Delhi",
            "279",
            "5.9%"
          ],
          [
            "Noida",
            "263",
            "5.6%"
          ],
          [
            "Chennai",
            "247",
            "5.2%"
          ],
          [
            "Ahmedabad",
            "190",
            "4.0%"
          ],
          [
            "Kolkata",
            "104",
            "2.2%"
          ]
        ],
        "note": "A listing can name more than one city. 334 listings are marked remote and 428 name no city."
      }
    },
    {
      "title": "What is the salary for MBA freshers?",
      "sub": "968 listings state pay in rupees",
      "paras": [
        "The median stated salary is 4 lakh a year, and the middle half of listings runs from 3 lakh to 5.5 lakh. That is the top of the stated range, annualised, for the 968 jobs that state pay in rupees (28.1% of the jobs). Most listings say nothing, so this is the pay that employers chose to show.",
        "The biggest band is ₹3 to 5 lakh with 441 listings (45.6%). The band above it, ₹5 to 8 lakh, has 286 (29.5%). That is a larger share than in the whole index, where ₹5 to 8 lakh holds 22.1%, so the MBA mention does tilt the upper half upwards, though the median is the same 4 lakh. ₹8 to 12 lakh has 47, ₹12 to 20 lakh has 17 and ₹20 lakh or more has 5.",
        "At the low end, ₹2 to 3 lakh has 125 listings (12.9%) and under ₹2 lakh has 47 (4.9%). For internships, 36 state a stipend (2.9%) with a median of ₹16,667 a month. If an offer sits well under 3 lakh, ask what the role leads to before you accept."
      ],
      "chart": {
        "id": "rjfmf284Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (968 jobs that state pay in rupees)",
        "labels": [
          "under ₹2 lakh",
          "₹2 to 3 lakh",
          "₹3 to 5 lakh",
          "₹5 to 8 lakh",
          "₹8 to 12 lakh",
          "₹12 to 20 lakh",
          "₹20 lakh or more"
        ],
        "values": [
          47,
          125,
          441,
          286,
          47,
          17,
          5
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 4 lakh is a median, not an offer. Ask for the fixed pay, the variable part and the location before you compare."
    },
    {
      "title": "How do you get hired as an MBA fresher?",
      "sub": "Who to email and what to send",
      "paras": [
        "Email the head of the function you want, not the general careers inbox. For HR that is the HR head or the talent acquisition lead. For business development, the sales or regional head. For relationship manager roles, the branch or cluster manager. 525 MBA-mentioning listings (11.2%) put an email in the description, so check that first.",
        "Send one small piece of work. An HR candidate could send a one-page screening plan for a role. A sales candidate could send a short account plan for one segment. A finance candidate could send a tidy Excel model with three assumptions. Keep the note to three lines: who you are, what you attached and one question.",
        "Follow up once and stop. Terms matter, too: freshers appear in 33.5% of listings and targets in 26.7%, so be ready to talk about a sales target. Studojo built Stu for the slow part: it finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign. It does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **4,708 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts when its description (200 or more characters) mentions MBA or PGDM.",
    "Pay: 968 of 3,448 entry-level listings (28.1%) state a salary in rupees and 36 of 1,260 internships (2.9%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 4,708 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Internshala, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best jobs for MBA freshers?",
      "a": "By volume, HR (818 listings), business development (418) and relationship manager (249) lead. Marketing-executive has 192 and finance 113. Best depends on your specialisation and city, so match the group to proof of work you can show."
    },
    {
      "q": "What is the salary for MBA freshers?",
      "a": "Among 968 listings that state pay, the median is 4 lakh a year and the middle half runs from 3 lakh to 5.5 lakh. That is the top of the stated range. Most listings do not state pay."
    },
    {
      "q": "How many jobs for MBA freshers are there in 2026?",
      "a": "We tracked 4,708 October listings that mention MBA or PGDM: 3,448 jobs and 1,260 internships. This counts listings, not openings filled or hires."
    },
    {
      "q": "Which city has the most jobs for MBA freshers?",
      "a": "Bengaluru has 664 listings, Mumbai 599 and Hyderabad 494. Gurugram has 342 and Pune 325. 334 listings are marked remote."
    },
    {
      "q": "Do MBA freshers need a certificate or extra skills?",
      "a": "Communication skills appear in 76.0% of these listings and Excel in 40.1%. A certificate is mentioned in 13.6%. Show one real piece of work in Excel before adding another course."
    },
    {
      "q": "Are there internships for MBA students?",
      "a": "Yes. 1,260 of the 4,708 listings are internships (26.8%). Business Development (Sales) Internship has 64 listings and the HR internship titles have 46, 35 and 34. Only 36 state a stipend, with a median of ₹16,667 a month."
    }
  ],
  "takeaway": {
    "sub": "What to remember about jobs for MBA freshers",
    "items": [
      [
        "HR and sales lead",
        "HR has 818 listings and business development 418."
      ],
      [
        "Median is 4 lakh",
        "968 listings state pay, and the middle half is 3 lakh to 5.5 lakh."
      ],
      [
        "Bengaluru and Mumbai",
        "664 and 599 listings. Hyderabad has 494."
      ],
      [
        "Excel is the proof",
        "It appears in 40.1% of descriptions, behind communication skills at 76.0%."
      ],
      [
        "Email the function head",
        "Send one small piece of work and follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "fresher-salary-india-2026",
      "kicker": "Data",
      "title": "Fresher Salary in India 2026"
    },
    {
      "slug": "skills-in-demand-fresher-jobs-india-2026",
      "kicker": "Data",
      "title": "Skills in Demand for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Jobs for MBA Freshers 2026",
    "description": "4,708 active entry-level and internship listings for India posted in October 2026 (MBA freshers), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-mba-freshers-2026" place="report-end" size="card" title={"Want to email the person who hires MBAs?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing is sent until you start a campaign."} />
    </DataReport>
  );
}
