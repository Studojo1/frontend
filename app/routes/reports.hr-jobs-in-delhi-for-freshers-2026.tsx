import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-in-delhi-for-freshers-2026",
  "title": "HR Jobs in Delhi for Freshers: 304 Listings, Internships and Pay 2026",
  "short": "HR Jobs in Delhi for Freshers 2026",
  "description": "HR jobs in Delhi for freshers: 304 listings in the Studojo Jobs Index, 86 of them internships, and a median stated top of range of ₹3.2 lakh a year.",
  "keywords": "hr jobs in delhi for freshers, fresher hr jobs delhi, hr salary in delhi for freshers, hr internship in delhi",
  "h1": "HR Jobs in Delhi for Freshers:",
  "h1em": "304 Listings, Read Closely",
  "sub": "The Studojo Jobs Index has 304 HR listings in Delhi posted in the first half of November 2026, and 86 of them (28.3%) are internships. Among the 106 jobs that state pay, the median top of range is ₹3.2 lakh a year.",
  "published": "2026-11-17",
  "scope": "HR in Delhi · freshers",
  "findings": [
    "**HR jobs in Delhi for freshers** number 304 listings in the Studojo Jobs Index: 218 jobs and 86 internships, an internship share of 28.3% against 13.7% across the whole index.",
    "**The employer pool is wide**: 223 employers posted, and the top ten account for only 19.4% of listings.",
    "**Pay is stated on 106 jobs** (48.6%) of the jobs. The median top of range is ₹3.2 lakh a year, but only 8 of the 86 internships state a stipend.",
    "**Excel beats HR software**: 25.3% of described listings mention Excel and 70.0% communication skills, while CRM tools appear in 2.0%.",
    "**The move that works** is a short email to the HR head or talent acquisition lead with a one-page screening scorecard. Stu finds the person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "304",
      "label": "HR in Delhi listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3.2 lakh",
      "label": "Median stated pay a year, from the 106 jobs that state it (48.6%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "25.3%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which HR titles do Delhi employers post for freshers?",
      "sub": "Internships first, then recruiter and executive roles.",
      "paras": [
        "Delhi is where an HR internship is the easiest door. Human Resources (Hr) Internship leads the table with 17 listings, then Human Resources Intern with 13 and Hr Intern with 8. Together that is 38 listings under three spellings of the same idea.",
        "On the job side, Hr Recruiter has 13, Talent Acquisition Specialist 12, Human Resource Recruiter 10 and Hr Executive 10. Hr Recruiter & Business Development Executive has 9, which means the role blends hiring with sales. Talent Acquisition Executive has 7.",
        "Of the 304 listings, 218 are jobs and 86 are internships. 223 employers posted, and 2.0% of listings do not name the employer. When the top ten hold 19.4%, a fresher in Nehru Place or Connaught Place has many small teams to approach, not a few giants."
      ],
      "chart": {
        "id": "rhjidff7Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=304)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          218,
          86
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
            "Human Resources (Hr) Internship",
            "17"
          ],
          [
            "Hr Recruiter",
            "13"
          ],
          [
            "Human Resources Intern",
            "13"
          ],
          [
            "Talent Acquisition Specialist",
            "12"
          ],
          [
            "Human Resource Recruiter",
            "10"
          ],
          [
            "Hr Executive",
            "10"
          ],
          [
            "Hr Recruiter & Business Development Executive",
            "9"
          ],
          [
            "Human Resource Executive",
            "8"
          ],
          [
            "Hr Intern",
            "8"
          ],
          [
            "Talent Acquisition Executive",
            "7"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 223 different employers posted these listings, and 2.0% of listings do not name the employer."
      }
    },
    {
      "title": "How much do HR freshers earn in Delhi?",
      "sub": "Stated pay, top of range, on 106 jobs.",
      "paras": [
        "The median top of range for a Delhi HR job is ₹3.2 lakh a year, across the 106 jobs that state pay in rupees. The lower quarter is ₹2.5 lakh and the upper quarter ₹5 lakh. 48.6% of jobs state pay, so about half still leave you guessing.",
        "The biggest band is ₹3 to 5 lakh with 48 listings (45.3%). Then ₹2 to 3 lakh has 25 (23.6%) and ₹5 to 8 lakh has 23 (21.7%). Under ₹2 lakh there are 4, ₹8 to 12 lakh has 4, and 2 listings reach ₹20 lakh or more.",
        "Internship pay is thin. 8 of 86 internships state a stipend (9.3%), with a median top of range of ₹11,000 a month. Another signal: 2.4% of described listings say unpaid. Ask the stipend question early, before you spend a week on a task."
      ],
      "chart": {
        "id": "rhjidff7Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (106 jobs that state pay in rupees)",
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
          4,
          25,
          48,
          23,
          4,
          0,
          2
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** the median stated top of range for a Delhi HR job is ₹3.2 lakh a year, and the median internship stipend is ₹11,000 a month."
    },
    {
      "title": "What skills do Delhi HR jobs want from a fresher?",
      "sub": "Keyword share across 293 described listings.",
      "paras": [
        "Communication skills lead at 70.0% of the 293 described listings. Excel is next at 25.3%, ahead of English at 24.6%. If you can build a clean candidate tracker with filters and a pivot table, you match a quarter of these listings on the one tool they name.",
        "Social media appears in 16.0% and negotiation in 13.0%. Hindi is named in 6.8%, equal to calling or telecalling at 6.8%, which is worth knowing in a city where many calls are in Hindi. CRM tools show up in 2.0% and cloud in 1.0%.",
        "The pattern is simple. Delhi listings ask for people skills and a spreadsheet, not a software stack. You do not need a certificate course in an HR tool to apply, though 13.0% of described listings do mention a certificate."
      ],
      "chart": {
        "id": "rhjidff7Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (293 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "social media",
          "negotiation",
          "Hindi",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)"
        ],
        "values": [
          70.0,
          25.3,
          24.6,
          16.0,
          13.0,
          6.8,
          6.8,
          2.0
        ],
        "unit": "%"
      }
    },
    {
      "title": "Are Delhi HR jobs remote, and do they have targets?",
      "sub": "What the descriptions say about conditions.",
      "paras": [
        "Targets appear in 24.2% of the 293 described listings and incentives in 10.2%. Freshers are welcomed in 32.1%. MBA or PGDM is named in 10.2% and any graduate in 5.5%, so the degree bar is low.",
        "Work from home is named in 11.6% and work from office in 10.2%. 21 listings (6.9%) carry the remote flag, close to the 6.5% across the index. Night or rotational shifts are rare at 2.7%, and PF, ESI or health insurance appears in 4.8%.",
        "Posting is steady from Monday to Friday, between 15.8% and 18.4% a day, then 9.5% on Saturday and 5.9% on Sunday. Naukri carries 41.8%, LinkedIn 19.1%, Shine 17.4% and Internshala 10.9%, so one portal will not show you everything."
      ],
      "chart": {
        "id": "rhjidff7Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (293 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "a certificate",
          "work from home",
          "work from office",
          "incentives",
          "PF, ESI or health insurance",
          "immediate joining",
          "night, rotational, US or UK shifts",
          "unpaid"
        ],
        "values": [
          32.1,
          24.2,
          13.0,
          11.6,
          10.2,
          10.2,
          4.8,
          3.8,
          2.7,
          2.4
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 1.0% of described listings mention a bond or service agreement. Read the terms before you sign."
    },
    {
      "title": "How do you get hired as an HR fresher in Delhi?",
      "sub": "Write to the head of HR with a scorecard.",
      "paras": [
        "Choose a short list of companies in your part of the city and write to the head of HR, or the talent acquisition lead where the company has one. For an internship, the recruitment manager is often the one who decides. Address the email to that person by name.",
        "Send a one-page screening scorecard for a role the company has open: five questions, what a good answer sounds like, and how you would score it. It is real HR work and takes you an evening. A CV line cannot do that.",
        "Your email says who you are, what you attached and the role you want, in three lines. Follow up once. Only 9.2% of descriptions carry an email address, so you will have to find the person. Stu does that part: it finds who hires, verifies the work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **304 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Human Resources (Hr) Internship\", \"Hr Recruiter\", \"Human Resources Intern\"). It counts for the city when it names Delhi as a location.",
    "Pay: 106 of 218 entry-level listings (48.6%) state a salary in rupees and 8 of 86 internships (9.3%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 293 listings (96.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in Delhi?",
      "a": "The Studojo Jobs Index has 304 HR listings in Delhi posted 1 to 15 November 2026: 218 jobs and 86 internships. Listings are not hires."
    },
    {
      "q": "What is the salary of an HR fresher in Delhi?",
      "a": "Of 106 jobs that state pay, the median top of range is ₹3.2 lakh a year, with the middle half between 2.5 and ₹5 lakh. Pay is the top of the range, so offers can be lower."
    },
    {
      "q": "Can I find an HR internship in Delhi?",
      "a": "Yes, and more easily than in most cities: 28.3% of the listings are internships. Human Resources (Hr) Internship alone has 17. Only 8 state a stipend, with a median of ₹11,000 a month."
    },
    {
      "q": "Which skills matter for HR freshers in Delhi?",
      "a": "Communication skills (70.0% of described listings), Excel (25.3%) and English (24.6%). Hindi appears in 6.8%."
    },
    {
      "q": "Do Delhi HR jobs ask for an MBA?",
      "a": "Only some. MBA or PGDM is named in 10.2% of described listings, while 32.1% welcome freshers and 5.5% say any graduate."
    },
    {
      "q": "Are there work from home HR jobs in Delhi?",
      "a": "Some. 21 listings (6.9%) are marked remote and 11.6% of described listings mention work from home. Another 10.2% name work from office."
    }
  ],
  "takeaway": {
    "sub": "Five points for HR freshers in Delhi.",
    "items": [
      [
        "Start with internships",
        "86 of 304 listings are internships, and 17 use the exact title Human Resources (Hr) Internship."
      ],
      [
        "Check the stipend",
        "Only 8 internships state one, with a median of ₹11,000 a month."
      ],
      [
        "Build a tracker",
        "25.3% of described listings mention Excel."
      ],
      [
        "Use several portals",
        "Naukri carries 41.8% and no portal holds them all."
      ],
      [
        "Email the HR head",
        "Attach a screening scorecard for one open role."
      ]
    ]
  },
  "related": [
    {
      "slug": "hr-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "HR Jobs for Freshers 2026"
    },
    {
      "slug": "jobs-for-freshers-in-delhi-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Delhi 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: HR Jobs in Delhi for Freshers 2026",
    "description": "304 active entry-level and internship listings for India posted 1 to 15 November 2026 (HR in Delhi), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-in-delhi-for-freshers-2026" place="report-end" size="card" title={"Want to email the HR head at a Delhi company?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the people who are hiring, verifies their work emails and writes each note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
