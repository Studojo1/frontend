import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "business-analyst-jobs-for-freshers-india-2026",
  "title": "Business Analyst Jobs for Freshers in India: 228 Listings 2026",
  "short": "Business Analyst Jobs for Freshers 2026",
  "description": "Business analyst jobs for freshers: 228 October listings in the Studojo Jobs Index, 23.2% in Bengaluru. See titles, skills, degrees asked and how to get hired.",
  "keywords": "business analyst jobs for freshers, business analyst fresher salary, business analyst jobs in india 2026, how to get a business analyst job as a fresher, business analyst internship",
  "h1": "Business Analyst Jobs for Freshers in India:",
  "h1em": "What 228 Listings Show",
  "sub": "We track 228 business analyst jobs for freshers posted in October 2026: 160 jobs and 68 internships. Excel appears in 58.6% of descriptions and SQL in 46.8%. Only 7 jobs state a salary, so this is a small, thin field.",
  "published": "2026-11-11",
  "scope": "India · business analyst · freshers and interns",
  "findings": [
    "The Studojo Jobs Index has **228 business analyst jobs for freshers** for October 2026, a smaller field than data analyst: 160 jobs and 68 internships (29.8%).",
    "**Bengaluru has almost a quarter.** It holds 53 listings (23.2%), more than double Hyderabad at 21, and 47 listings (20.6%) are marked remote.",
    "**Excel and SQL lead the skills.** Excel is in 58.6% of descriptions and SQL in 46.8%, ahead of Power BI at 32.9% and Tableau at 30.2%.",
    "**Degrees matter more than usual.** 32.0% of descriptions mention BTech, BE or computer science and 23.9% mention an MBA or PGDM.",
    "**Email the product or BA lead with a requirements page.** Only 7 listings include an email address, so write to the person who runs the analysis team with one real piece of work."
  ],
  "stats": [
    {
      "num": "228",
      "label": "Business analyst listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "4.4%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "58.6%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are business analyst jobs for freshers called?",
      "sub": "Plain Business Analyst leads, and interns make up a large part.",
      "paras": [
        "Business Analyst has 50 listings (21.9%) and Business Analyst Intern has 24 (10.5%). Associate Business Analyst has 12, Business Analyst Internship has 7 and Junior Business Analyst has 6. Six more carry a Global Solutions & Risk Compliance tag, which points to compliance-flavoured work.",
        "A few titles lean technical. The Associate Consultant (Techno-Functional Business Analyst) title has 2 listings, and that kind of role sits between the business team and the engineers. Read the description to see whether the job is about requirements, reports or process.",
        "The 228 listings come from 142 employers, and the top 10 hold 32.5%. The sample is small, so a handful of employers shape the picture. Only 3 listings (1.3%) hide the employer, which makes it easier to check who you are applying to."
      ],
      "chart": {
        "id": "rbajffi9Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=228)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          160,
          68
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
            "Business Analyst",
            "50"
          ],
          [
            "Business Analyst Intern",
            "24"
          ],
          [
            "Associate Business Analyst",
            "12"
          ],
          [
            "Business Analyst Internship",
            "7"
          ],
          [
            "Junior Business Analyst",
            "6"
          ],
          [
            "Business Analyst, Global Solutions & Risk Compliance (Gsrc)",
            "6"
          ],
          [
            "Business Analyst Intern (Remote)",
            "3"
          ],
          [
            "Business Analyst Internship - Remote Entry-Level Role",
            "2"
          ],
          [
            "Associate Consultant - Techno-Functional Business Analyst",
            "2"
          ],
          [
            "Business Analyst I, Whs Wese",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 142 different employers posted these listings, and 1.3% of listings do not name the employer."
      }
    },
    {
      "title": "Where are business analyst jobs in India for freshers?",
      "sub": "Bengaluru dominates, and remote is a real option.",
      "paras": [
        "Bengaluru has 53 listings (23.2%). Hyderabad has 21 (9.2%), Noida 19 (8.3%), Gurugram 13 (5.7%), and Pune and Mumbai 12 each. Jaipur and Chennai have 6 each. A listing can name more than one city.",
        "Remote is stronger here than in most roles we report on. 47 listings are marked remote (20.6%), and 57 name no city. Some titles even carry Remote in the name. If you do not live in a hub, this is a role where location does not have to stop you.",
        "With only 228 listings, a single large employer can move a city's count by a few. Use the city numbers as a guide to where to look, not as a ranking."
      ],
      "chart": {
        "id": "rbajffi9Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=228)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Noida",
          "Gurugram",
          "Pune",
          "Mumbai",
          "Jaipur",
          "Chennai",
          "Ahmedabad",
          "Kolkata"
        ],
        "values": [
          53,
          21,
          19,
          13,
          12,
          12,
          6,
          6,
          5,
          4
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
            "53",
            "23.2%"
          ],
          [
            "Hyderabad",
            "21",
            "9.2%"
          ],
          [
            "Noida",
            "19",
            "8.3%"
          ],
          [
            "Gurugram",
            "13",
            "5.7%"
          ],
          [
            "Pune",
            "12",
            "5.3%"
          ],
          [
            "Mumbai",
            "12",
            "5.3%"
          ],
          [
            "Jaipur",
            "6",
            "2.6%"
          ],
          [
            "Chennai",
            "6",
            "2.6%"
          ],
          [
            "Ahmedabad",
            "5",
            "2.2%"
          ],
          [
            "Kolkata",
            "4",
            "1.8%"
          ]
        ],
        "note": "A listing can name more than one city. 47 listings are marked remote and 57 name no city."
      }
    },
    {
      "title": "What is a business analyst fresher salary in India, and what degree is asked?",
      "sub": "Pay is almost never stated, and degrees are asked more often.",
      "paras": [
        "Only 7 of the 160 jobs state a salary in rupees (4.4%), so we cannot give a reliable range. For those 7, the median top of range is ₹5.5 lakh a year: 3 in the ₹3 to 5 lakh band, 2 in ₹5 to 8 lakh, 1 in ₹8 to 12 lakh and 1 in ₹12 to 20 lakh. Treat that as a hint, not a rate card.",
        "For internships, 1 of 68 states a stipend, at the ₹10,000 to 20,000 a month band. Ask about pay in your first message, because the listing will not.",
        "The conditions are more telling. 32.0% of full descriptions mention BTech, BE or computer science, 23.9% mention an MBA or PGDM and 18.0% say freshers. BBA is in 16.7% and BCom in 16.2%. A certificate is in 8.1%. You do not need an MBA, but a degree line is clearly part of how these roles are screened."
      ],
      "chart": {
        "id": "rbajffi9Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (222 listings with a full description)",
        "labels": [
          "freshers",
          "a certificate",
          "PF, ESI or health insurance",
          "targets",
          "hybrid",
          "work from office",
          "incentives",
          "a portfolio"
        ],
        "values": [
          18.0,
          8.1,
          6.3,
          5.9,
          4.5,
          4.1,
          2.7,
          2.3
        ],
        "unit": "%"
      }
    },
    {
      "title": "Which skills do business analyst jobs ask freshers for?",
      "sub": "Excel and SQL first, then a dashboard tool.",
      "paras": [
        "Of the 222 listings with a full description, communication skills appear in 68.9%, Excel in 58.6% and SQL in 46.8%. Power BI is in 32.9% and Tableau in 30.2%. English is in 17.1% and Python in 14.4%.",
        "Cloud tools are named in 12.6% and CRM tools in 9.5%. Machine learning or generative AI is in only 6.8%, and statistics in 6.3%. The job is more about asking good questions of business data than about building models.",
        "The ordering looks like a data analyst list with a communication layer on top. A business analyst has to explain what the numbers mean to a team that does not read SQL, so show that in your proof of work, not only the tools."
      ],
      "chart": {
        "id": "rbajffi9Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (222 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "SQL",
          "Power BI",
          "Tableau",
          "English",
          "Python",
          "cloud (AWS, Azure, GCP)",
          "CRM tools (Salesforce, HubSpot or similar)",
          "ChatGPT or AI tools"
        ],
        "values": [
          68.9,
          58.6,
          46.8,
          32.9,
          30.2,
          17.1,
          14.4,
          12.2,
          9.5,
          8.1
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a business analyst fresher?",
      "sub": "Send a one-page requirements note on a product you actually use.",
      "paras": [
        "A portal form is a weak bet in a small field. An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Only 7 of our 228 listings put an email address in the text, so you will have to find the person.",
        "Write to the business analysis lead, the product manager or the head of the team that owns the process. At a start-up, write to the founder. Send a one-page note: a process map or a short requirements document for a real app you use, with three user stories, plus a small Excel or SQL analysis. Plain and tidy is the goal.",
        "Three lines do it: who you are, what you wrote, and a question about how their team gathers requirements. Follow up once. Stu, the AI career agent from Studojo, finds who is hiring, verifies their work email and writes the note, and sends from your own inbox only after you start a campaign."
      ],
      "callout": "**Small field, small pile:** with 228 listings, a good direct email stands out more than in a field with thousands."
    }
  ],
  "method": [
    "This report counts **228 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as business analyst when its job title matches that role (the most common titles here: \"Business Analyst\", \"Business Analyst Intern\", \"Associate Business Analyst\").",
    "Pay: 7 of 160 entry-level listings (4.4%) state a salary in rupees and 1 of 68 internships (1.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 222 listings (97.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Naukri, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many business analyst jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 228 business analyst listings for freshers posted in October 2026: 160 jobs and 68 internships. They are listings we track, not hires, from one month of data."
    },
    {
      "q": "What is the business analyst fresher salary in India?",
      "a": "Only 7 of 160 jobs state a salary in rupees, so the sample is too small for a firm range. Their median top of range is ₹5.5 lakh a year. Ask about pay before you interview."
    },
    {
      "q": "Which skills does a business analyst fresher need?",
      "a": "Communication (68.9% of full descriptions), Excel (58.6%) and SQL (46.8%) lead. Power BI appears in 32.9% and Tableau in 30.2%. Start with Excel and SQL."
    },
    {
      "q": "Do you need an MBA to be a business analyst?",
      "a": "No. 23.9% of full descriptions mention an MBA or PGDM, while 32.0% mention BTech, BE or computer science, and 16.7% mention BBA. Proof of analysis counts alongside the degree."
    },
    {
      "q": "Are there business analyst internships for freshers?",
      "a": "Yes. 68 of the 228 listings are internships (29.8%). Business Analyst Intern has 24. Only 1 internship states a stipend, so ask early."
    },
    {
      "q": "Are business analyst jobs remote in India?",
      "a": "Some are. 47 of the 228 listings (20.6%) are marked remote, and 57 name no city. Bengaluru leads on-site roles with 53 listings."
    }
  ],
  "takeaway": {
    "sub": "What the 228 October listings say about business analysis.",
    "items": [
      [
        "Search Business Analyst and Intern titles",
        "Those two titles cover a third of this small field."
      ],
      [
        "Build Excel and SQL first",
        "They are in 58.6% and 46.8% of descriptions."
      ],
      [
        "Consider remote",
        "47 listings are marked remote, 20.6% of the field."
      ],
      [
        "Read the degree line",
        "BTech is named in 32.0% and MBA in 23.9%."
      ],
      [
        "Email a requirements page",
        "One tidy page of user stories to the analysis lead is easy to judge and easy to forward."
      ]
    ]
  },
  "related": [
    {
      "slug": "data-analyst-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Data Analyst Jobs for Freshers 2026"
    },
    {
      "slug": "machine-learning-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "AI and ML Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Business Analyst Jobs for Freshers 2026",
    "description": "228 active entry-level and internship listings for India posted in October 2026 (business analyst), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-business-analyst-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the analysis lead directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the hiring manager or team head, verifies their work email, and nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
