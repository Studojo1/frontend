import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-freshers-in-surat-2026",
  "title": "Jobs for Freshers in Surat 2026: What 1,891 Listings Show",
  "short": "Jobs for Freshers in Surat 2026",
  "description": "Jobs for freshers in Surat: 1,891 October listings, with graphic designer a top title and a stated median of ₹4 lakh a year. Roles, pay and how to get hired.",
  "keywords": "jobs for freshers in surat, how to get a job in surat, surat fresher jobs 2026, fresher salary in surat, internships in surat",
  "h1": "Jobs for Freshers in Surat:",
  "h1em": "What 1,891 Listings Show",
  "sub": "Surat had 1,891 entry-level and internship listings in October 2026. Customer service leads at 14.4%, but Graphic Designer is the single most repeated title, and the stated median pay is ₹4 lakh a year.",
  "published": "2026-11-11",
  "scope": "Surat · freshers and interns",
  "findings": [
    "**Jobs for freshers in Surat** are led by customer service (14.4% of 1,891 listings), relationship manager (8.4%) and field sales (5.6%), with 106 field sales listings.",
    "**Graphic Designer is the top single title** with 35 listings, and graphic designer is a role group of 50 listings (2.6%), which is unusual for a city this size.",
    "Only **18.4% of Surat descriptions say freshers**, below the 21.8% index share, so many listings expect some experience or a visible portfolio.",
    "The stated median is **₹4 lakh a year**, matching the index, but only 34.4% of listings state pay.",
    "**Email the creative or sales lead** with one piece of real work attached. Stu can find the person and verify their work email, and you send when you start a campaign."
  ],
  "stats": [
    {
      "num": "1,891",
      "label": "Entry-level jobs and internships listed in Surat, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 624 jobs that state it (34.4%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "11.9%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What jobs for freshers are there in Surat?",
      "sub": "Role groups across 1,891 October listings, matched on the job title.",
      "paras": [
        "Jobs for freshers in Surat start with customer service at 272 listings, 14.4% of the city. Relationship manager has 159 (8.4%) and field sales has 106 (5.6%). Together those three groups cover over a quarter of the city's listings.",
        "What sets Surat apart is the next tier. HR has 79 listings (4.2%), accountant 58 (3.1%) and graphic designer 50 (2.6%). Hotel and hospitality has 49 and business development 46. A designer in Surat has more direct roles to aim at than the index-wide numbers would lead you to guess.",
        "Role groups are matched on the job title. A title can sit in several groups and generic titles such as executive match none, so the shares are a floor. Use the table to pick which team to write to first, not to rank jobs by quality."
      ],
      "chart": {
        "id": "rjffis263Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=1,891)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          1815,
          76
        ],
        "unit": "listings"
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
            "272",
            "14.4%"
          ],
          [
            "relationship manager",
            "159",
            "8.4%"
          ],
          [
            "field sales",
            "106",
            "5.6%"
          ],
          [
            "HR",
            "79",
            "4.2%"
          ],
          [
            "accountant",
            "58",
            "3.1%"
          ],
          [
            "graphic designer",
            "50",
            "2.6%"
          ],
          [
            "hotel and hospitality",
            "49",
            "2.6%"
          ],
          [
            "business development",
            "46",
            "2.4%"
          ],
          [
            "technical support",
            "28",
            "1.5%"
          ],
          [
            "operations executive",
            "26",
            "1.4%"
          ],
          [
            "social media",
            "24",
            "1.3%"
          ],
          [
            "telecaller",
            "24",
            "1.3%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Mix:** 1,815 jobs and 76 internships, so 4.0% of Surat listings are internships."
    },
    {
      "title": "What are fresher job titles in Surat really called?",
      "sub": "Titles as posted, plus the terms behind them.",
      "paras": [
        "Graphic Designer leads the title table with 35 listings, the only creative title near the top of any city report in this group. Next is Office Executive for administration and sales coordination with 30, then Sales Executive with 22. Two relationship titles and Opt Recruiter have 19 or 20 each, which usually points to one batch posting.",
        "The office executive title is worth reading closely. It joins admin and sales coordination in one job, which means filing and calls in the same day. If a title packs two roles, ask which one you will spend most of your time on.",
        "Among the listings with a full description, 22.0% mention targets and 18.4% say freshers. Work from office appears in 8.8%, PF, ESI or health insurance in 7.5% and incentives in 6.0%. A portfolio is asked for in 5.5%, and BTech or computer science in 4.7%. The portfolio line is the one to prepare for."
      ],
      "chart": {
        "id": "rjffis263Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (1,610 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "work from office",
          "PF, ESI or health insurance",
          "incentives",
          "a portfolio",
          "immediate joining",
          "night, rotational, US or UK shifts",
          "cab or transport",
          "a certificate"
        ],
        "values": [
          22.0,
          18.4,
          8.8,
          7.5,
          6.0,
          5.5,
          4.6,
          4.6,
          3.3,
          2.4
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
            "Graphic Designer",
            "35"
          ],
          [
            "Office Executive - Administration & Sales Coordination",
            "30"
          ],
          [
            "Sales Executive",
            "22"
          ],
          [
            "Relationship Officer Top Bank Gips Consultancy Services",
            "20"
          ],
          [
            "Opt Recruiter",
            "20"
          ],
          [
            "Relationship Manager Accounts Top Bank Gips Consultancy Services",
            "19"
          ],
          [
            "Relationship Manager",
            "16"
          ],
          [
            "Field Sales Executive",
            "14"
          ],
          [
            "Account Executive",
            "12"
          ],
          [
            "Relationship Manager Gold Loan Top Bank Gips Consultancy Services",
            "12"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 753 different employers posted these listings, and 11.0% of listings do not name the employer."
      }
    },
    {
      "title": "What is the fresher salary in Surat?",
      "sub": "Stated pay only: 624 listings, top of the range, per year.",
      "paras": [
        "The fresher salary in Surat has a stated median of ₹4 lakh a year, with the middle half between ₹3 lakh and ₹5 lakh. That equals the index median. Only 34.4% of Surat listings state pay, so about two in three leave it blank.",
        "The ₹3 to 5 lakh band holds 43.1% of stated listings, and ₹5 to 8 lakh holds 28.0%. Another 19.6% sit at ₹2 to 3 lakh and 5.4% under ₹2 lakh. Few reach the top: 2.4% at ₹8 to 12 lakh, 0.8% at ₹12 to 20 lakh and 0.6% at ₹20 lakh or more.",
        "Internship pay is nearly missing. Of 76 internships only 2 state a stipend, with a median of ₹15,833 a month. Two listings are not a rate. For design roles, ask whether pay depends on a portfolio test, because a trial task can be unpaid."
      ],
      "chart": {
        "id": "rjffis263Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (624 jobs that state pay in rupees)",
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
          34,
          122,
          269,
          175,
          15,
          5,
          4
        ],
        "unit": "listings"
      },
      "callout": "**Design check:** ask whether the portfolio task is paid before you spend a weekend on it."
    },
    {
      "title": "What skills do Surat employers ask freshers for?",
      "sub": "Share of descriptions that mention each skill.",
      "paras": [
        "Communication skills appear in 55.3% of Surat descriptions, below the 60.2% index share. English follows at 14.8%, Excel at 11.9% and calling or telecalling at 11.0%. CRM tools sit at 8.8% and negotiation at 8.1%.",
        "Negotiation at 8.1% is above the 7.2% index share, which fits a city where field sales has 106 listings and customer-facing roles dominate. For a designer, the skill list tells you little, and the portfolio, asked for in 5.5% of descriptions, does more of the work.",
        "Surat listings also come from a slightly different mix of places: Naukri carries 65.8%, company career sites and ATS pages 13.4%, Shine 9.1% and LinkedIn 9.1%. Career-site listings are worth reading, and 6.8% of Surat descriptions include an email address."
      ],
      "chart": {
        "id": "rjffis263Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,610 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "social media",
          "Adobe tools (Photoshop, Illustrator)",
          "Hindi",
          "GST"
        ],
        "values": [
          55.3,
          14.8,
          11.9,
          11.0,
          8.8,
          8.1,
          6.2,
          4.1,
          4.0,
          3.1
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a fresher in Surat?",
      "sub": "Who to email, what to send, what to say.",
      "paras": [
        "For designer roles, email the creative director or the design lead, and at a small firm the owner. For field sales and relationship roles, write to the sales manager or the area manager. For accountant roles, write to the accounts head. For office executive roles, write to the admin or operations manager.",
        "Send one piece of real work. A designer sends a single-page layout built for a real local product, not a folder of ten. A salesperson sends a list of twelve shops with the opening line for each. An accounts fresher sends a tidy sheet for a sample month. Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018), so lead with the work, not the CV.",
        "Keep the email to three lines and follow up once after about a week. Stu handles the slow parts: it finds the person who hires, verifies the work email and drafts a note from your real work. You decide when to start a campaign, and nothing is sent before that."
      ]
    }
  ],
  "method": [
    "This report counts **1,891 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts for Surat when it names Surat as a location; a listing can name more than one city.",
    "Pay: 624 of 1,815 entry-level listings (34.4%) state a salary in rupees and 2 of 76 internships (2.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,610 listings (85.1%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, Shine, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How do I get a job in Surat as a fresher?",
      "a": "Choose a role group with volume, such as customer service (272 listings), relationship manager (159) or field sales (106), and email the team lead with one piece of real work. Online applications succeed roughly 0.1% to 2% of the time (The Interview Guys, April 2026)."
    },
    {
      "q": "What is the fresher salary in Surat?",
      "a": "The stated median is ₹4 lakh a year from 624 listings, and the middle half runs from ₹3 lakh to ₹5 lakh. Only 34.4% of Surat listings state pay."
    },
    {
      "q": "Are there internships in Surat?",
      "a": "Yes, 76 of 1,891 listings, 4.0%, against 10.8% index-wide. Only 2 state a stipend."
    },
    {
      "q": "Are there graphic design jobs for freshers in Surat?",
      "a": "Yes. Graphic designer is a role group of 50 listings (2.6%), and Graphic Designer is the top single title with 35. A portfolio is mentioned in 5.5% of descriptions."
    },
    {
      "q": "Do Surat listings say freshers can apply?",
      "a": "Some do. 18.4% of descriptions say freshers, below the 21.8% index share, and 22.0% mention targets. Read each description for the experience expected."
    },
    {
      "q": "Can I work from home as a fresher in Surat?",
      "a": "Rarely. 2.0% of listings carry a remote flag, and 8.8% of descriptions say work from office."
    }
  ],
  "takeaway": {
    "sub": "What 1,891 October listings say about Surat.",
    "items": [
      [
        "Three groups lead",
        "Customer service, relationship manager and field sales cover over a quarter of listings."
      ],
      [
        "Design is visible",
        "Graphic Designer is the top title, with 35 listings."
      ],
      [
        "Fresher is said less",
        "Only 18.4% of descriptions say freshers, below the index."
      ],
      [
        "Pay matches the index",
        "The stated median is ₹4 lakh, from 34.4% of listings."
      ],
      [
        "Lead with work",
        "Email the team lead one piece of real work, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-lucknow-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Lucknow 2026"
    },
    {
      "slug": "jobs-for-freshers-in-nagpur-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Nagpur 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Jobs for Freshers in Surat 2026",
    "description": "1,891 active entry-level and internship listings for India posted in October 2026 (Surat), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-freshers-in-surat-2026" place="report-end" size="card" title={"Want to reach the Surat team that hires?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
