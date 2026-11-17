import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "accountant-jobs-in-bangalore-for-freshers-2026",
  "title": "Accountant Jobs in Bangalore for Freshers: 191 Listings, Tally and GST 2026",
  "short": "Accountant Jobs in Bangalore for Freshers 2026",
  "description": "Accountant jobs in Bangalore for freshers: 191 listings in the Jobs Index. GST appears in 46.5% of descriptions, Tally in 36.2%, median stated pay ₹3 lakh.",
  "keywords": "accountant jobs in bangalore for freshers, fresher accountant jobs bangalore, accountant salary in bangalore for freshers, accounts executive jobs in bangalore",
  "h1": "Accountant Jobs in Bangalore for Freshers:",
  "h1em": "191 Listings, GST and Tally",
  "sub": "The Studojo Jobs Index has 191 accountant listings in Bangalore posted in the first half of November 2026. GST is named in 46.5% of described listings and Tally in 36.2%. Of the 64 jobs that state pay, the median top of range is ₹3 lakh a year.",
  "published": "2026-11-17",
  "scope": "accountant in Bangalore · freshers",
  "findings": [
    "**Accountant jobs in Bangalore for freshers** number 191 listings: 181 jobs and only 10 internships (5.2%).",
    "**The plain titles lead**: Accountant has 31 listings, Accounts Executive 16, Chartered Accountant 9 and Junior Accountant 8. Tax Associate has 6.",
    "**Pay is stated on 64 jobs** (35.4%), with a median top of range of ₹3 lakh a year. No internship states a stipend.",
    "**GST, Excel and Tally are the checklist**: 46.5% of described listings mention GST, 43.2% Excel and 36.2% Tally. BCom is named in 23.2%.",
    "**The move that works** is to email the finance controller or accounts manager with a reconciled sample ledger. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "191",
      "label": "Accountant in Bangalore listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 64 jobs that state it (35.4%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "46.5%",
      "label": "Of listings with a full description ask for GST",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What are fresher accountant jobs in Bangalore called?",
      "sub": "Accountant and accounts executive lead, with a shared-services ladder.",
      "paras": [
        "Accountant jobs in Bangalore for freshers start with the plainest title. Accountant has 31 listings (16.2%), Accounts Executive 16 and Junior Accountant 8. Chartered Accountant appears 9 times and Tax Associate 6, so the audit and tax side is visible too.",
        "A second pattern is a numbered ladder. Accounting Services Associate II has 9 listings, III has 6, IV has 5 and I has 4. Those are shared-services style roles, where you work on a process such as payables for a set of clients. Accountant Cum Office Assistant has 4 and mixes books with admin.",
        "Of the 191 listings, 181 are jobs and 10 are internships. 140 employers posted, the top ten account for 26.7% and 1.6% hide the name. Across the whole index, the title Accountant has 321 listings, and 31 of them are in Bangalore."
      ],
      "chart": {
        "id": "rajibff26Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=191)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          181,
          10
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
            "Accountant",
            "31"
          ],
          [
            "Accounts Executive",
            "16"
          ],
          [
            "Chartered Accountant",
            "9"
          ],
          [
            "Accounting Services Associate Ii",
            "9"
          ],
          [
            "Junior Accountant",
            "8"
          ],
          [
            "Tax Associate",
            "6"
          ],
          [
            "Accounting Services Associate Iii",
            "6"
          ],
          [
            "Accounting Services Associate Iv",
            "5"
          ],
          [
            "Accountant Cum Office Assistant",
            "4"
          ],
          [
            "Accounting Services Associate I",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 140 different employers posted these listings, and 1.6% of listings do not name the employer."
      }
    },
    {
      "title": "What is the accountant salary in Bangalore for freshers?",
      "sub": "Stated pay, top of range, on 64 jobs.",
      "paras": [
        "Among the 64 jobs that state pay in rupees, the median top of range is ₹3 lakh a year. The lower quarter is ₹2.6 lakh and the upper quarter ₹4 lakh. Only 35.4% of jobs state pay, so nearly two in three do not.",
        "The ₹3 to 5 lakh band holds 31 listings (48.4%) and ₹2 to 3 lakh holds 19 (29.7%). At the high end, 5 listings reach ₹5 to 8 lakh, 4 reach ₹8 to 12 lakh and 2 reach ₹12 to 20 lakh. Those are probably CA, tax or audit roles. 3 listings are under ₹2 lakh.",
        "There is no internship pay to report. 10 internships exist and none state a stipend. If you are weighing an internship, you will have to ask what it pays. Pay is the top of a range, so the offer can land lower."
      ],
      "chart": {
        "id": "rajibff26Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (64 jobs that state pay in rupees)",
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
          3,
          19,
          31,
          5,
          4,
          2,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** the middle half of stated accountant pay in Bangalore runs from ₹2.6 to 4 lakh a year."
    },
    {
      "title": "Do you need Tally and GST for an accountant job in Bangalore?",
      "sub": "Keyword share across 185 described listings.",
      "paras": [
        "Often, yes. GST is named in 46.5% of the 185 described listings, communication skills in 44.9%, Excel in 43.2% and Tally in 36.2%. Excel is named in 43.2% here, against 14.1% across the whole index, so this is a numbers role where the spreadsheet is a given.",
        "English appears in 15.1%, SAP in 5.4% and Adobe tools in 4.9%, which is probably design-adjacent listings caught by the keyword. Hindi is named in 3.8% and calling in 1.6%. Power BI shows up in 0.5%, a single listing.",
        "A fresher who can post entries in Tally, file a GST return working from sample data and reconcile a bank statement in Excel meets the three biggest asks. SAP at 5.4% is a bonus, not a barrier."
      ],
      "chart": {
        "id": "rajibff26Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (185 listings with a full description)",
        "labels": [
          "GST",
          "communication skills",
          "Excel",
          "Tally",
          "English",
          "SAP",
          "Adobe tools (Photoshop, Illustrator)",
          "Hindi"
        ],
        "values": [
          46.5,
          44.9,
          43.2,
          36.2,
          15.1,
          5.4,
          4.9,
          3.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Bangalore accountant jobs ask for BCom or a CA?",
      "sub": "What the descriptions say about degrees and terms.",
      "paras": [
        "BCom is named in 23.2% of the 185 described listings, MBA or PGDM in 9.7% and BBA in 3.2%. 16.2% say freshers are welcome, and 3.2% say 12th pass. A certificate appears in 2.7%. Chartered Accountant is a title in 9 listings, which means a CA role is a small slice.",
        "Terms are quiet. PF, ESI or health insurance appears in 13.5%, work from office in 4.9% and hybrid in 4.3%. Targets show up in 6.5% and night, rotational, US or UK shifts in 5.9%. 4.9% mention a portfolio, usually a design sample, so skip it unless the role needs one.",
        "No listing in this slice carries the remote flag. One described listing mentions a registration, training or deposit fee (0.5%). A real employer does not charge you to work, so walk away. Thursday (23.6%) and Wednesday (20.9%) are the busiest posting days, and Sunday has 3.7%."
      ],
      "chart": {
        "id": "rajibff26Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (185 listings with a full description)",
        "labels": [
          "freshers",
          "PF, ESI or health insurance",
          "targets",
          "night, rotational, US or UK shifts",
          "work from office",
          "a portfolio",
          "hybrid",
          "a certificate"
        ],
        "values": [
          16.2,
          13.5,
          6.5,
          5.9,
          4.9,
          4.9,
          4.3,
          2.7
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 38.2% of the slice is on Naukri, 24.1% on company career sites and 19.9% on LinkedIn, so employer career pages matter here."
    },
    {
      "title": "How do you get hired as an accountant fresher in Bangalore?",
      "sub": "Send a reconciled ledger to the finance lead.",
      "paras": [
        "Write to the finance controller, the accounts manager or the finance head, depending on company size. In a small business around Koramangala or the Outer Ring Road, the owner or a senior accountant often decides. Aim at small and mid-sized employers, not only the largest names.",
        "Attach a reconciled sample ledger: a month of made-up transactions entered in Tally, a bank reconciliation in Excel and a one-line GST summary. Use dummy data, never a former employer's. One page, clean totals, and a note on what you checked.",
        "Your email is three lines: who you are, what the sample shows and the role you want. Follow up once. 16.2% of descriptions include an email address, more than the 8.1% across the whole index, so look there first. For the rest, Stu finds the person who hires, verifies the work email and sends from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **191 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as accountant when its job title matches that role (the most common titles here: \"Accountant\", \"Accounts Executive\", \"Chartered Accountant\"). It counts for the city when it names Bengaluru as a location.",
    "Pay: 64 of 181 entry-level listings (35.4%) state a salary in rupees and 0 of 10 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 185 listings (96.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many accountant jobs for freshers are there in Bangalore?",
      "a": "The Studojo Jobs Index has 191 accountant listings in Bangalore posted 1 to 15 November 2026: 181 jobs and 10 internships. Listings are not hires."
    },
    {
      "q": "What is the accountant salary in Bangalore for freshers?",
      "a": "Among 64 jobs that state pay, the median top of range is ₹3 lakh a year, with the middle half from ₹2.6 to 4 lakh. 64.6% of jobs do not state pay."
    },
    {
      "q": "Is Tally needed for accountant jobs in Bangalore?",
      "a": "It is named in 36.2% of the 185 described listings. GST is higher at 46.5% and Excel at 43.2%. Learn all three, since most listings name at least one."
    },
    {
      "q": "What does an accounts executive do?",
      "a": "Accounts Executive has 16 listings and is usually a day-to-day books role: entries, invoices, reconciliations and GST filing support. Read each description, since the duties vary by employer."
    },
    {
      "q": "Do I need a CA for accountant jobs in Bangalore?",
      "a": "No. Chartered Accountant is the title on only 9 of 191 listings, while BCom is named in 23.2% of described listings and 16.2% welcome freshers."
    },
    {
      "q": "Are there remote accountant jobs in Bangalore?",
      "a": "Almost none. No listing in this slice carries the remote flag, and 4.3% of described listings mention hybrid. Most roles expect you in the office."
    }
  ],
  "takeaway": {
    "sub": "Five points for accountant freshers in Bangalore.",
    "items": [
      [
        "Learn the big three",
        "GST 46.5%, Excel 43.2% and Tally 36.2% of described listings."
      ],
      [
        "Search by ladder",
        "Accountant, Accounts Executive and Junior Accountant cover 55 listings between them."
      ],
      [
        "Know the range",
        "The median stated top of range is ₹3 lakh a year, on 64 jobs."
      ],
      [
        "Check career pages",
        "24.1% of the slice is on company career sites and ATS pages."
      ],
      [
        "Email the finance lead",
        "Attach a reconciled sample ledger on dummy data."
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
      "slug": "how-to-get-a-job-in-bangalore-fresher-2026",
      "kicker": "Report",
      "title": "How to Get a Job in Bangalore as a Fresher 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Accountant Jobs in Bangalore for Freshers 2026",
    "description": "191 active entry-level and internship listings for India posted 1 to 15 November 2026 (accountant in Bangalore), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-accountant-jobs-in-bangalore-for-freshers-2026" place="report-end" size="card" title={"Want to email Bangalore finance heads directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies a work email and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
