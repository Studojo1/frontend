import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "financial-analyst-jobs-for-freshers-india-2026",
  "title": "Finance Jobs for Freshers in India 2026: 641 Listings Analysed",
  "short": "Finance Jobs for Freshers 2026",
  "description": "Finance jobs for freshers in India: 641 October listings, 33.7% of them internships, and Excel in 60.4% of descriptions. Cities, pay, skills, how to get hired.",
  "keywords": "finance jobs for freshers, finance fresher salary, finance jobs in india 2026, how to get a finance job as a fresher, finance internship",
  "h1": "Finance Jobs for Freshers in India:",
  "h1em": "What 641 Listings Show",
  "sub": "Finance jobs for freshers are mostly Finance Executive, analyst and intern roles: 641 October listings in the Studojo Jobs Index, 425 jobs and 216 internships. Excel appears in 60.4% of descriptions, and only 17.6% of the jobs state pay.",
  "published": "2026-11-11",
  "scope": "India · finance · freshers and interns",
  "findings": [
    "**Finance jobs for freshers are plentiful but loosely named**: 641 October listings in the Studojo Jobs Index, and the biggest single title is plain Finance Executive with 82 listings.",
    "**One in three listings is an internship**: 216 of 641 (33.7%), which is far higher than the 10.8% internship share across the whole index.",
    "**Excel is the entry ticket**: 60.4% of listings with a full description mention it, well ahead of Tally (16.2%), GST (15.7%) and Power BI (7.4%).",
    "**Pay is thin on the page**: only 75 jobs (17.6%) state a salary in rupees, with a median top of range of ₹4.5 lakh a year, and just 1 internship states a stipend.",
    "**The move that works is emailing the person who runs the numbers**: the finance manager or head of FP&A reads one short email with one piece of real work. We built Stu to find that person and write that email."
  ],
  "stats": [
    {
      "num": "641",
      "label": "Finance listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4.5 lakh",
      "label": "Median stated pay a year, from the 75 jobs that state it (17.6%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "60.4%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are finance jobs for freshers called, and who posts them?",
      "sub": "Titles are broad, and 423 different employers posted them.",
      "paras": [
        "Finance jobs for freshers in India are mostly posted under generic titles. Finance Executive leads with 82 listings, then Financial Analyst Internship with 46, Finance Associate with 37 and Finance Intern with 37. The sharper analyst titles are rarer: Financial Analyst has 24, Equity Research Analyst 13 and Credit Analyst 10.",
        "The employer side is wide. 423 different employers posted the 641 listings, the ten busiest account for 18.7% of them, and only 2.3% of listings hide the employer. That is a fairly open field for a fresher: no single recruiter owns it, so there is rarely one gate to knock on.",
        "The mix matters too. 425 listings are full-time entry-level jobs and 216 are internships. If you are a final-year BCom or MBA student, the internship route is a real share of the supply here, not a side door."
      ],
      "chart": {
        "id": "rfajffi10Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=641)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          425,
          216
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
            "Finance Executive",
            "82"
          ],
          [
            "Financial Analyst Internship",
            "46"
          ],
          [
            "Finance Associate",
            "37"
          ],
          [
            "Finance Intern",
            "37"
          ],
          [
            "Finance Internship",
            "28"
          ],
          [
            "Financial Analyst",
            "24"
          ],
          [
            "Equity Research Analyst",
            "13"
          ],
          [
            "Credit Analyst",
            "10"
          ],
          [
            "Senior Finance Executive",
            "8"
          ],
          [
            "Financial Analyst Intern",
            "8"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 423 different employers posted these listings, and 2.3% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have the most finance jobs for freshers?",
      "sub": "Bengaluru and Mumbai lead, and remote is a real option.",
      "paras": [
        "Bengaluru has 113 finance listings (17.6%) and Mumbai has 98 (15.3%). Together they hold roughly a third of the set. Chennai follows with 55 (8.6%), then Gurugram with 41, Delhi with 32 and Pune with 31.",
        "Two quieter signals sit under the city chart. 102 listings (15.9%) are marked remote, which is a high share for entry-level work, and 134 name no city at all. A listing can name more than one city, so the table counts overlap.",
        "If you live outside the big two, look at Chennai, Gurugram and Pune first. Vadodara and Ahmedabad both make the top ten, with 13 and 21 listings, which is useful if your family base is in Gujarat."
      ],
      "chart": {
        "id": "rfajffi10Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=641)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Chennai",
          "Gurugram",
          "Delhi",
          "Pune",
          "Hyderabad",
          "Ahmedabad",
          "Noida",
          "Vadodara"
        ],
        "values": [
          113,
          98,
          55,
          41,
          32,
          31,
          23,
          21,
          20,
          13
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
            "113",
            "17.6%"
          ],
          [
            "Mumbai",
            "98",
            "15.3%"
          ],
          [
            "Chennai",
            "55",
            "8.6%"
          ],
          [
            "Gurugram",
            "41",
            "6.4%"
          ],
          [
            "Delhi",
            "32",
            "5.0%"
          ],
          [
            "Pune",
            "31",
            "4.8%"
          ],
          [
            "Hyderabad",
            "23",
            "3.6%"
          ],
          [
            "Ahmedabad",
            "21",
            "3.3%"
          ],
          [
            "Noida",
            "20",
            "3.1%"
          ],
          [
            "Vadodara",
            "13",
            "2.0%"
          ]
        ],
        "note": "A listing can name more than one city. 102 listings are marked remote and 134 name no city."
      }
    },
    {
      "title": "What is a fresher finance salary in India?",
      "sub": "Only 17.6% of jobs say. The ones that do cluster at ₹3 to 5 lakh.",
      "paras": [
        "Of 425 finance jobs, 75 state pay in rupees. Taking the top of each stated range, the median is ₹4.5 lakh a year, with the middle half running from ₹3 lakh to ₹5.5 lakh. The biggest band is ₹3 to 5 lakh with 37 jobs (49.3%), then ₹5 to 8 lakh with 19 (25.3%).",
        "Treat those figures as ceilings, not offers. We use the top of the range, and 82.4% of jobs do not state pay at all, so the sample is the employers who chose to publish a number. Only 6 jobs reach ₹8 to 12 lakh and 2 reach ₹12 to 20 lakh.",
        "For internships the data is almost empty: 1 of 216 states a stipend, at ₹20,833 a month. One listing is not a benchmark. Ask for the stipend in your first email, plainly, rather than guessing from a chart."
      ],
      "chart": {
        "id": "rfajffi10Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (75 jobs that state pay in rupees)",
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
          2,
          9,
          37,
          19,
          6,
          2,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Read it right:** the pay chart covers 75 jobs, not 641. Silence on pay is the norm in finance listings."
    },
    {
      "title": "What skills do finance fresher jobs ask for?",
      "sub": "Excel first, then communication, then Tally and GST.",
      "paras": [
        "Of the 618 listings with a full description, 373 mention Excel (60.4%) and 343 mention communication skills (55.5%). The accounting-flavoured tools come next: Tally in 16.2% and GST in 15.7%. Statistics shows up in 8.6%, Power BI and SAP in 7.4% each, and SQL in 5.3%.",
        "Python is in only 3.7% and machine learning in 1.9%, so for a first finance job a clean Excel model beats a half-learned coding stack. If you have both, say so, but do not delay your search to add Python.",
        "The terms chart shows the entry rules. 17.0% say freshers, 15.7% ask for a certificate and 13.4% ask for a portfolio. 18.3% mention an MBA or PGDM and 15.9% mention BCom. Only 3.2% say unpaid, so most finance internships are not advertised as free work."
      ],
      "chart": {
        "id": "rfajffi10Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (618 listings with a full description)",
        "labels": [
          "Excel",
          "communication skills",
          "Tally",
          "GST",
          "English",
          "statistics",
          "Power BI",
          "SAP",
          "ChatGPT or AI tools",
          "SQL"
        ],
        "values": [
          60.4,
          55.5,
          16.2,
          15.7,
          12.5,
          8.6,
          7.4,
          7.4,
          5.5,
          5.3
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a finance fresher?",
      "sub": "Skip the pile of applications. Email the person who runs the numbers.",
      "paras": [
        "An open finance role draws a pile of applications. The Interview Guys (April 2026), citing Business Insider data, put the average opening at about 242 applications, and the same article cites a typical online success rate of roughly 0.1% to 2% per application. Your edge is a smaller room: one email to the person who owns the work.",
        "Email the finance manager, the head of FP&A, the controller, or in a small company the founder who signs off the books. Do not email a generic HR inbox first. Send one small piece of proof: a one-sheet Excel variance analysis of a public quarterly result, with the formulas visible, or a clean GST reconciliation you built from sample data.",
        "Keep the email to three lines: who you are and what you studied, the one thing you built and why it fits their team, and one clear ask for a short call. Follow up once, a week later, and stop. Stu does the slow parts: it finds the hiring manager with a verified work email, drafts the email from your real work, and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **641 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as finance when its job title matches that role (the most common titles here: \"Finance Executive\", \"Financial Analyst Internship\", \"Finance Associate\").",
    "Pay: 75 of 425 entry-level listings (17.6%) state a salary in rupees and 1 of 216 internships (0.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 618 listings (96.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many finance jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 641 October 2026 listings that match finance roles at entry level or internship: 425 jobs and 216 internships. That is the count of listings we track, not the whole market, and listings are not hires."
    },
    {
      "q": "What is the finance fresher salary in India?",
      "a": "Among the 75 finance jobs that state pay, the median top of range is ₹4.5 lakh a year, with the middle half between ₹3 lakh and ₹5.5 lakh. Only 17.6% of jobs state pay, so many offers will differ."
    },
    {
      "q": "Which skills do you need for finance jobs in India 2026?",
      "a": "Excel is the main one, mentioned in 60.4% of listings with a full description. Communication skills follow at 55.5%, then Tally at 16.2% and GST at 15.7%. Python appears in only 3.7%."
    },
    {
      "q": "How do I get a finance internship as a fresher?",
      "a": "Look at the 216 finance internship listings, then email the finance manager of the team directly with one small piece of work. 33.7% of finance listings are internships, so the supply is real."
    },
    {
      "q": "Do finance fresher jobs need an MBA?",
      "a": "Not always. 18.3% of listings mention an MBA or PGDM, while 15.9% mention BCom and 8.6% mention BBA. Another 1.5% say any graduate is fine."
    },
    {
      "q": "Which city has the most finance jobs for freshers?",
      "a": "Bengaluru, with 113 listings (17.6%), then Mumbai with 98 (15.3%) and Chennai with 55 (8.6%). A further 102 listings are marked remote."
    }
  ],
  "takeaway": {
    "sub": "Five things to do this week if you want a finance job.",
    "items": [
      [
        "Build one Excel model",
        "Excel is in 60.4% of descriptions. Make a one-sheet analysis you can attach to an email."
      ],
      [
        "Learn Tally or GST basics",
        "They appear in 16.2% and 15.7% of listings, which is where accounting-leaning roles sit."
      ],
      [
        "Do not skip internships",
        "216 of 641 listings are internships, and some lead to full-time offers (2.3% mention a PPO)."
      ],
      [
        "Ask about pay",
        "Only 17.6% of jobs state pay, so raise it politely on the first call."
      ],
      [
        "Email the finance lead",
        "Pick ten teams, find the manager, send one short email, follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "accountant-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Accountant Jobs for Freshers 2026"
    },
    {
      "slug": "audit-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Audit Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Finance Jobs for Freshers 2026",
    "description": "641 active entry-level and internship listings for India posted in October 2026 (finance), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-financial-analyst-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want the finance manager's email, not another portal?"} line={"Tell Stu the role, the city and the pay you want. Stu finds fitting jobs and the person hiring, with a verified work email, and nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
