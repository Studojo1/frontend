import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-12th-pass-2026",
  "title": "Jobs for 12th Pass Students 2026: 6,049 Listings and Salaries",
  "short": "Jobs for 12th Pass 2026",
  "description": "Jobs for 12th pass: 6,049 October listings mention it and 4,197 state pay, with a median of 3.5 lakh a year. See roles, cities, shifts and how to apply.",
  "keywords": "jobs for 12th pass, jobs for 12th pass 2026, best jobs for 12th pass, salary for 12th pass",
  "h1": "Jobs for 12th Pass in India:",
  "h1em": "What 6,049 Listings Show",
  "sub": "We tracked 6,049 listings in October 2026 whose description mentions 12th pass. 4,197 state pay in rupees, with a median of 3.5 lakh a year, and the middle half runs from 2.6 lakh to 4.5 lakh. Customer service and calling roles dominate.",
  "published": "2026-11-11",
  "scope": "India · 12th pass",
  "findings": [
    "Jobs for 12th pass show up in **6,049 October listings** in the Studojo Jobs Index, and 5,986 of them are entry-level jobs rather than internships.",
    "**Most of these listings state their pay.** 4,197 jobs (70.1%) give a rupee figure, against 28.4% across the whole index, and the median is 3.5 lakh a year.",
    "**Customer service is more than a quarter of the slice.** It has 1,742 listings (28.8%), with telecaller at 741 (12.2%) and field sales at 453 (7.5%).",
    "**Freshers are welcome, and so are shifts.** 3,925 listings (64.9%) mention freshers, 2,066 (34.2%) work from office and 1,171 (19.4%) night, rotational, US or UK shifts.",
    "**The move that works is to email the person who runs the team.** Stu finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "6,049",
      "label": "October listings that mention 12th pass",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 4,197 jobs that state it (70.1%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "25.2%",
      "label": "Of listings with a full description ask for calling or telecalling",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What jobs can you get after 12th pass?",
      "sub": "Titles as employers wrote them",
      "paras": [
        "The slice is every listing whose description mentions 12th pass. It is almost entirely full-time work: 5,986 entry-level jobs and 63 internships (1.0%). The top title is Customer Support Executive with 150 listings, then Sales Associate with 117, Sales Executive with 100 and Field Sales Executive with 88.",
        "Customer Care Executive has 85, Telesales Executive 71, Telecaller 65 and Telecalling Executive 52. Customer Service Executive has 44, and Data Entry Operator has 30. These are voice, sales and back-office jobs, and none of them asks for a degree in the title.",
        "A mention of 12th pass can mean the minimum qualification or one of several accepted ones. 549 listings (9.1%) also say any graduate. Hiring is concentrated: the ten biggest employers hold 27.8% of the listings, a high share, though 2,857 different employers posted."
      ],
      "chart": {
        "id": "rjf1p286Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (6,049 listings with a full description)",
        "labels": [
          "freshers",
          "work from office",
          "incentives",
          "targets",
          "night, rotational, US or UK shifts",
          "PF, ESI or health insurance",
          "immediate joining",
          "work from home",
          "cab or transport",
          "a two-wheeler or driving licence"
        ],
        "values": [
          64.9,
          34.2,
          28.0,
          22.4,
          19.4,
          18.0,
          11.4,
          6.7,
          5.3,
          4.0
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
            "Customer Support Executive",
            "150"
          ],
          [
            "Sales Associate",
            "117"
          ],
          [
            "Sales Executive",
            "100"
          ],
          [
            "Field Sales Executive",
            "88"
          ],
          [
            "Customer Care Executive",
            "85"
          ],
          [
            "Telesales Executive",
            "71"
          ],
          [
            "Telecaller",
            "65"
          ],
          [
            "Telecalling Executive",
            "52"
          ],
          [
            "Customer Service Executive",
            "44"
          ],
          [
            "Data Entry Operator",
            "30"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 2,857 different employers posted these listings, and 0.0% of listings do not name the employer."
      },
      "callout": "**Lead:** Read the line on shifts and incentives before you apply. 28.0% of these listings mention incentives and 22.4% mention targets."
    },
    {
      "title": "Which role groups hire 12th pass candidates?",
      "sub": "Role groups and the skills they ask for",
      "paras": [
        "Customer service leads with 1,742 listings (28.8%), then telecaller with 741 (12.2%) and field sales with 453 (7.5%). Retail sales has 276 (4.6%), operations executive 130 (2.1%) and hotel and hospitality 115 (1.9%). Marketing-executive has 115, HR 99, business development 88, process associate 78, relationship manager 68 and accountant 56.",
        "The skills list is short. Communication skills are in 67.6% of listings and English in 42.1%. Calling or telecalling is in 25.2% and Hindi in 18.4%. Excel is in 9.5%, CRM tools in 5.4% and negotiation in 5.2%. Social media is in 2.1%, Tally in 1.1% and SEO in 0.8%.",
        "English is the real gate: 42.1% of listings mention it, far above the 21.8% across the whole index. If you can speak and write clearly in English and a second language such as Hindi, you meet the main bar for the biggest groups. Excel, even at a basic level, is a differentiator at 9.5%."
      ],
      "chart": {
        "id": "rjf1p286Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (6,049 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "calling or telecalling",
          "Hindi",
          "Excel",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "social media",
          "Tally",
          "SEO"
        ],
        "values": [
          67.6,
          42.1,
          25.2,
          18.4,
          9.5,
          5.4,
          5.2,
          2.1,
          1.1,
          0.8
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
            "customer service",
            "1,742",
            "28.8%"
          ],
          [
            "telecaller",
            "741",
            "12.2%"
          ],
          [
            "field sales",
            "453",
            "7.5%"
          ],
          [
            "retail sales",
            "276",
            "4.6%"
          ],
          [
            "operations executive",
            "130",
            "2.1%"
          ],
          [
            "hotel and hospitality",
            "115",
            "1.9%"
          ],
          [
            "marketing (general)",
            "115",
            "1.9%"
          ],
          [
            "HR",
            "99",
            "1.6%"
          ],
          [
            "business development",
            "88",
            "1.5%"
          ],
          [
            "process associate",
            "78",
            "1.3%"
          ],
          [
            "relationship manager",
            "68",
            "1.1%"
          ],
          [
            "accountant",
            "56",
            "0.9%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "Where are the jobs for 12th pass in India?",
      "sub": "Top cities in the slice",
      "paras": [
        "Mumbai has the most listings with 898 (14.8%). Bengaluru has 559 (9.2%), Pune 521 (8.6%) and Delhi 432 (7.1%). Hyderabad has 267, Gurugram 265, Ahmedabad 264, Noida 254, Chennai 232 and Kolkata 231 (3.8%).",
        "Pune ranks third here, ahead of Delhi, which fits a market heavy on sales, retail and hospitality hiring. A listing can name more than one city. 371 listings (6.1%) are marked remote, and 200 name no city.",
        "Where we found them is unlike the other reports: company career sites and ATS pages carried 41.5%, Naukri 36.9% and Shine 18.3%, while LinkedIn had 2.5% and Internshala 0.8%. This is only where listings live, not a ranking, but it means most of these jobs are not on internship sites. Search by role and city."
      ],
      "chart": {
        "id": "rjf1p286Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=6,049)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Pune",
          "Delhi",
          "Hyderabad",
          "Gurugram",
          "Ahmedabad",
          "Noida",
          "Chennai",
          "Kolkata"
        ],
        "values": [
          898,
          559,
          521,
          432,
          267,
          265,
          264,
          254,
          232,
          231
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
            "Mumbai",
            "898",
            "14.8%"
          ],
          [
            "Bengaluru",
            "559",
            "9.2%"
          ],
          [
            "Pune",
            "521",
            "8.6%"
          ],
          [
            "Delhi",
            "432",
            "7.1%"
          ],
          [
            "Hyderabad",
            "267",
            "4.4%"
          ],
          [
            "Gurugram",
            "265",
            "4.4%"
          ],
          [
            "Ahmedabad",
            "264",
            "4.4%"
          ],
          [
            "Noida",
            "254",
            "4.2%"
          ],
          [
            "Chennai",
            "232",
            "3.8%"
          ],
          [
            "Kolkata",
            "231",
            "3.8%"
          ]
        ],
        "note": "A listing can name more than one city. 371 listings are marked remote and 200 name no city."
      }
    },
    {
      "title": "What is the salary for 12th pass jobs?",
      "sub": "4,197 listings state pay in rupees",
      "paras": [
        "The median stated salary is 3.5 lakh a year, and the middle half runs from 2.6 lakh to 4.5 lakh. This is the top of each stated range, annualised, for 4,197 jobs. Pay is stated far more often here than elsewhere, 70.1% against 28.4% across the whole index, which is good news if you want to compare.",
        "Over half of listings, 2,162 (51.5%), sit in the ₹3 to 5 lakh band. ₹2 to 3 lakh has 842 (20.1%) and ₹5 to 8 lakh has 549 (13.1%). Under ₹2 lakh has 391 (9.3%). At the top, ₹8 to 12 lakh has 112, ₹12 to 20 lakh has 79 and ₹20 lakh or more has 62.",
        "These figures are the top of a range, and many include incentives. Ask for the fixed monthly pay, the variable part and the shift pattern. PF, ESI or health insurance is mentioned in 18.0% of these listings, so ask about benefits too. Only 14 internships state a stipend, with a median of ₹15,000 a month."
      ],
      "chart": {
        "id": "rjf1p286Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (4,197 jobs that state pay in rupees)",
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
          391,
          842,
          2162,
          549,
          112,
          79,
          62
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** A 3.5 lakh median is the top of listed ranges. Ask for the fixed amount you will see in your account each month."
    },
    {
      "title": "How do you get hired after 12th pass?",
      "sub": "Who to email and what to send",
      "paras": [
        "Email the person who runs the team, not only the careers page. For customer service or telecalling, that is the process manager, the team lead or the operations head. For retail, the store manager. For hotels, the front office or HR manager. Only 214 listings (3.5%) put an email in the description, so you will often need to find the name.",
        "Send one piece of proof. For a calling role, a thirty-second voice note reading a short product pitch. For sales, a list of ten shops or offices near you with a first line for each. For data entry, a clean typed sheet. Keep the email to three lines: who you are, what you attached and one question.",
        "Follow up once and stop. Studojo built Stu to do the slow parts: it finds who hires, verifies their work email, writes a personal note from your real work and sends it from your own inbox once you start a campaign. It does not mass apply and does not promise replies. Never pay a fee to get a job."
      ]
    }
  ],
  "method": [
    "This report counts **6,049 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts when its description (200 or more characters) mentions 12th pass.",
    "Pay: 4,197 of 5,986 entry-level listings (70.1%) state a salary in rupees and 14 of 63 internships (22.2%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 6,049 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, Shine, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What jobs can you get after 12th pass?",
      "a": "Customer service has the most listings (1,742), then telecaller (741), field sales (453) and retail sales (276). Hotel and hospitality has 115. Most roles are voice, sales and support."
    },
    {
      "q": "What is the salary for 12th pass jobs?",
      "a": "Among 4,197 listings that state pay, the median is 3.5 lakh a year and the middle half is 2.6 lakh to 4.5 lakh. That is the top of the stated range, so confirm the fixed part."
    },
    {
      "q": "How many jobs for 12th pass are there in 2026?",
      "a": "We tracked 6,049 October listings that mention 12th pass: 5,986 jobs and 63 internships. This counts listings, not hires."
    },
    {
      "q": "Which city has the most jobs for 12th pass?",
      "a": "Mumbai has 898 listings, Bengaluru 559 and Pune 521. Delhi has 432. 371 listings are marked remote."
    },
    {
      "q": "Can 12th pass freshers get a job without experience?",
      "a": "Yes. 3,925 listings (64.9%) mention freshers. English (42.1%) and communication skills (67.6%) are the most common asks."
    },
    {
      "q": "Are there night shifts in 12th pass jobs?",
      "a": "Some. 1,171 listings (19.4%) mention night, rotational, US or UK shifts, and 321 (5.3%) mention cab or transport. Check the shift and the commute before you accept."
    }
  ],
  "takeaway": {
    "sub": "What to remember about jobs for 12th pass",
    "items": [
      [
        "Customer service leads",
        "1,742 listings, 28.8% of the slice."
      ],
      [
        "Pay is usually stated",
        "4,197 jobs (70.1%) state it, with a median of 3.5 lakh a year."
      ],
      [
        "English is the gate",
        "It appears in 42.1% of listings, so practise it out loud."
      ],
      [
        "Mumbai is first",
        "898 listings, ahead of Bengaluru with 559."
      ],
      [
        "Email the team lead",
        "Send one piece of proof and follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Jobs for 12th Pass 2026",
    "description": "6,049 active entry-level and internship listings for India posted in October 2026 (12th pass), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-12th-pass-2026" place="report-end" size="card" title={"Want to email who hires after 12th pass?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
