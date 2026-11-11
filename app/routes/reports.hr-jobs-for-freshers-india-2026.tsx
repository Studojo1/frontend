import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-for-freshers-india-2026",
  "title": "HR Jobs for Freshers in India: 7,267 Listings Analysed, 2026",
  "short": "HR Jobs for Freshers 2026",
  "description": "HR jobs for freshers: 7,267 October listings in the Studojo Jobs Index, most of them recruiter roles. See titles, stated pay, skills and how to get hired.",
  "keywords": "HR jobs for freshers, HR fresher salary, HR jobs in india 2026, how to get a HR job as a fresher, HR internship",
  "h1": "HR Jobs for Freshers in India:",
  "h1em": "What 7,267 Listings Show",
  "sub": "We track 7,267 HR jobs for freshers posted in October 2026: 5,673 jobs and 1,594 internships. Recruiter titles dominate the list. 1,785 jobs state a salary, with a median top of range of about ₹3.2 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · HR · freshers and interns",
  "findings": [
    "The Studojo Jobs Index has **7,267 HR jobs for freshers** for October 2026, and recruiter titles lead: Opt Recruiter (378) and HR Recruiter (318) are the two biggest.",
    "**Communication is the skill.** It appears in 73.5% of descriptions, far ahead of Excel at 27.7% and negotiation at 15.5%.",
    "**HR pays in a tight band.** 1,785 of 5,673 jobs (31.5%) state a salary, the median top of range is about ₹3.2 lakh a year, and 938 of them sit in the ₹3 to 5 lakh band.",
    "**Targets and shifts are common.** 16.3% of descriptions mention targets and 10.7% mention night, rotational, US or UK shifts, so read recruiter listings as sales-style roles.",
    "**Email the HR head with a hiring sheet.** 551 listings (8.8%) include an email address, which is higher than most fields, so write to the person who runs recruitment with proof you can screen and schedule."
  ],
  "stats": [
    {
      "num": "7,267",
      "label": "HR listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.2 lakh",
      "label": "Median stated pay a year, from the 1,785 jobs that state it (31.5%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "27.7%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are HR jobs for freshers called?",
      "sub": "Recruiter is the most common word on the list.",
      "paras": [
        "Opt Recruiter has 378 listings (5.2%) and HR Recruiter has 318 (4.4%). Human Resources (HR) Internship has 296 (4.1%), HR Service Delivery Associate has 214 (2.9%) and Human Resources Intern has 198 (2.7%). HR Executive has 155 and Talent Acquisition Executive has 116.",
        "That makes recruitment, not payroll or policy, the biggest door into HR for freshers. Many of these are agency-style roles where you source and screen candidates for client companies. They are real jobs, and they teach you hiring fast, but read each description for targets and shifts.",
        "The 7,267 listings come from 3,586 employers, and the top 10 hold 19.4%. Another 376 listings (5.2%) do not name the employer, which is a higher share than in most fields we track."
      ],
      "chart": {
        "id": "rhjffi23Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=7,267)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          5673,
          1594
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
            "Opt Recruiter",
            "378"
          ],
          [
            "HR Recruiter",
            "318"
          ],
          [
            "Human Resources (HR) Internship",
            "296"
          ],
          [
            "HR Service Delivery Associate",
            "214"
          ],
          [
            "Human Resources Intern",
            "198"
          ],
          [
            "HR Executive",
            "155"
          ],
          [
            "Human Resource Recruiter",
            "148"
          ],
          [
            "Recruiting Associate",
            "131"
          ],
          [
            "Human Resource Intern",
            "116"
          ],
          [
            "Talent Acquisition Executive",
            "116"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 3,586 different employers posted these listings, and 5.2% of listings do not name the employer."
      }
    },
    {
      "title": "Where are HR jobs in India for freshers?",
      "sub": "Bengaluru and Mumbai lead, with Noida and Ahmedabad strong behind them.",
      "paras": [
        "Bengaluru has 1,017 listings (14.0%) and Mumbai has 914 (12.6%). Hyderabad has 568, Delhi 532 and Noida 512. Ahmedabad has 439 (6.0%), ahead of Pune with 431 and Gurugram with 420. A listing can name more than one city.",
        "Ahmedabad's place in the top 6 is the surprise. If you are in Gujarat, you do not have to leave to find HR work. Noida also outranks Gurugram, which matters if you live in the east side of the NCR.",
        "Remote HR work is limited: 650 listings are marked remote (8.9%) and 566 name no city. For most fresher HR roles, expect to be in an office, and confirm the location before you spend time on an application."
      ],
      "chart": {
        "id": "rhjffi23Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=7,267)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Hyderabad",
          "Delhi",
          "Noida",
          "Ahmedabad",
          "Pune",
          "Gurugram",
          "Chennai",
          "Kolkata"
        ],
        "values": [
          1017,
          914,
          568,
          532,
          512,
          439,
          431,
          420,
          377,
          153
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
            "1,017",
            "14.0%"
          ],
          [
            "Mumbai",
            "914",
            "12.6%"
          ],
          [
            "Hyderabad",
            "568",
            "7.8%"
          ],
          [
            "Delhi",
            "532",
            "7.3%"
          ],
          [
            "Noida",
            "512",
            "7.0%"
          ],
          [
            "Ahmedabad",
            "439",
            "6.0%"
          ],
          [
            "Pune",
            "431",
            "5.9%"
          ],
          [
            "Gurugram",
            "420",
            "5.8%"
          ],
          [
            "Chennai",
            "377",
            "5.2%"
          ],
          [
            "Kolkata",
            "153",
            "2.1%"
          ]
        ],
        "note": "A listing can name more than one city. 650 listings are marked remote and 566 name no city."
      }
    },
    {
      "title": "What is an HR fresher salary in India?",
      "sub": "A narrow band for jobs, and thin data for internships.",
      "paras": [
        "1,785 of the 5,673 jobs state a salary in rupees (31.5%). The median top of range is about ₹3.2 lakh a year, and the middle half runs from ₹2.5 lakh to ₹4.2 lakh.",
        "The ₹3 to 5 lakh band has 938 listings, more than half of those that state pay. Another 413 sit at ₹2 to 3 lakh and 258 at ₹5 to 8 lakh. Only 120 are under ₹2 lakh, and only 45 state ₹8 to 12 lakh, so high pay is rare at entry level.",
        "For internships, 84 of 1,594 state a stipend (5.3%). The median top of range is ₹14,583 a month, and 45 of the 84 sit in the ₹10,000 to 20,000 band. Another 2.2% of descriptions call the role unpaid, so check before you commit."
      ],
      "chart": {
        "id": "rhjffi23Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (1,785 jobs that state pay in rupees)",
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
          120,
          413,
          938,
          258,
          45,
          7,
          4
        ],
        "unit": "listings"
      },
      "callout": "**Stipend check:** 6 internships state under ₹5,000 a month. Ask what the role pays before the interview, not after."
    },
    {
      "title": "Which skills do HR jobs ask freshers for?",
      "sub": "Talking and listening, then spreadsheets.",
      "paras": [
        "Of the 6,269 listings with a full description, communication skills appear in 73.5%. Excel is second at 27.7%, then English at 21.0%, negotiation at 15.5% and social media at 14.3%. Calling or telecalling is named in 5.4%.",
        "Social media at 14.3% reflects sourcing candidates through LinkedIn and job groups. CRM tools show up in 3.3%, which means a hiring tracker is part of the job in some teams.",
        "On conditions, 23.7% say freshers, 16.3% mention targets and 13.0% ask for an MBA or PGDM. Incentives appear in 12.7% and shifts in 10.7%. Only 4.7% ask for BTech, so HR remains open to many degrees, and 6.7% say any graduate."
      ],
      "chart": {
        "id": "rhjffi23Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (6,269 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "negotiation",
          "social media",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "ChatGPT or AI tools"
        ],
        "values": [
          73.5,
          27.7,
          21.0,
          15.5,
          14.3,
          5.4,
          3.3,
          3.0,
          2.5,
          1.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as an HR fresher?",
      "sub": "Show you can run one small hiring task from start to finish.",
      "paras": [
        "A portal application is a weak bet in a field this crowded. An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). HR is the one field where 551 of our 7,267 listings include an email address.",
        "Write to the HR head or the talent acquisition manager. At a small company, write to the founder. Send one piece of proof: a job description you rewrote, a sourcing sheet with ten profiles matched to a role, or a short screening script and scorecard. Keep it to a page.",
        "Use three lines: who you are, what you built, and one question about the roles they are hiring for. Follow up once. Stu, the AI career agent from Studojo, finds the person who hires, verifies their work email and drafts the note, and it sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **7,267 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Opt Recruiter\", \"HR Recruiter\", \"Human Resources (HR) Internship\").",
    "Pay: 1,785 of 5,673 entry-level listings (31.5%) state a salary in rupees and 84 of 1,594 internships (5.3%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 6,269 listings (86.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 7,267 HR listings for freshers posted in October 2026: 5,673 jobs and 1,594 internships. These are listings we track, not hires, from one month of data."
    },
    {
      "q": "What is the HR fresher salary in India?",
      "a": "Of 5,673 jobs, 1,785 state a salary in rupees. The median top of range is about ₹3.2 lakh a year, and the middle half is ₹2.5 lakh to ₹4.2 lakh. About 68% do not state pay."
    },
    {
      "q": "How do you get an HR job as a fresher?",
      "a": "Aim at recruiter and executive roles first, since HR Recruiter, Opt Recruiter and HR Executive are the most common titles. Send proof of one small hiring task to the HR head, and follow up once."
    },
    {
      "q": "Are there HR internships for freshers?",
      "a": "Yes. 1,594 of the 7,267 listings are internships (21.9%). Human Resources (HR) Internship has 296 listings. Only 84 internships state a stipend, with a median top of range of ₹14,583 a month."
    },
    {
      "q": "Do you need an MBA for an HR job?",
      "a": "Not always. 13.0% of full descriptions mention an MBA or PGDM, while 6.7% say any graduate and 5.2% mention BBA. For recruiter roles, communication skills matter more."
    },
    {
      "q": "Which cities have the most HR jobs for freshers?",
      "a": "Bengaluru leads with 1,017 listings (14.0%), then Mumbai with 914, Hyderabad with 568, Delhi with 532 and Noida with 512. 650 listings are marked remote."
    }
  ],
  "takeaway": {
    "sub": "What the 7,267 October listings say about HR.",
    "items": [
      [
        "Start with recruiter titles",
        "Opt Recruiter, HR Recruiter and Recruiting Associate lead the list."
      ],
      [
        "Practise talking, then Excel",
        "Communication is in 73.5% of descriptions and Excel in 27.7%."
      ],
      [
        "Read for targets and shifts",
        "16.3% mention targets and 10.7% mention shifts."
      ],
      [
        "Ask the stipend",
        "Only 84 internships state it, with a median of ₹14,583 a month."
      ],
      [
        "Email with proof",
        "A rewritten job description or a screening scorecard shows you can already do the work."
      ]
    ]
  },
  "related": [
    {
      "slug": "legal-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Legal Jobs for Freshers in India 2026"
    },
    {
      "slug": "teacher-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Teaching Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: HR Jobs for Freshers 2026",
    "description": "7,267 active entry-level and internship listings for India posted in October 2026 (HR), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the HR head directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the hiring manager or recruiter, verifies their work email, and nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
