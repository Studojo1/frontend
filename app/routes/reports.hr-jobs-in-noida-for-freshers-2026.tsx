import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-in-noida-for-freshers-2026",
  "title": "HR Jobs in Noida for Freshers: 294 Listings and What They Pay 2026",
  "short": "HR Jobs in Noida for Freshers 2026",
  "description": "HR jobs in Noida for freshers: 294 listings in the Studojo Jobs Index, 27.6% internships, and a median stated top of range of ₹3.9 lakh a year.",
  "keywords": "hr jobs in noida for freshers, fresher hr jobs noida, hr salary in noida for freshers, hr internship in noida",
  "h1": "HR Jobs in Noida for Freshers:",
  "h1em": "294 Listings, Pay and Terms",
  "sub": "We found 294 HR listings in Noida in the Studojo Jobs Index, posted in the first half of November 2026. 81 are internships. Of the 94 jobs that state pay, the median top of range is ₹3.9 lakh a year.",
  "published": "2026-11-17",
  "scope": "HR in Noida · freshers",
  "findings": [
    "**HR jobs in Noida for freshers** come to 294 listings: 213 jobs and 81 internships (27.6%), with Human Resources (Hr) Internship the top single title at 17.",
    "**Tech recruiting sits beside classic HR**: Us It Recruiter has 10 listings, Technical Recruiter 8 and It Recruiter 6, next to Hr Executive at 10.",
    "**Pay is stated on 94 jobs** (44.1%). The median top of range is ₹3.9 lakh a year, and 53 of them (56.4%) fall in the ₹3 to ₹5 lakh band.",
    "**Terms are lighter than you might expect**: targets appear in 16.8% of described listings, shifts in 13.6% and incentives in 11.9%.",
    "**The move that works** is to email the HR head or a talent acquisition lead with a short hiring tracker. Stu finds the person and sends from your own inbox after you start a campaign."
  ],
  "stats": [
    {
      "num": "294",
      "label": "HR in Noida listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3.9 lakh",
      "label": "Median stated pay a year, from the 94 jobs that state it (44.1%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "22.7%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What do Noida companies call their fresher HR roles?",
      "sub": "Internships lead, tech recruiters follow.",
      "paras": [
        "In Noida, an internship is the most common title. Human Resources (Hr) Internship has 17 listings, Human Resources Intern 8 and Hr Intern 6. Three spellings, one entry point.",
        "The job titles split two ways. Hr Executive has 10, Human Resource Recruiter 9, Hr Recruiter 7 and Hr Recruiter & Business Development Executive 7. The tech side has Us It Recruiter at 10, Technical Recruiter at 8 and It Recruiter at 6.",
        "Of 294 listings, 213 are jobs and 81 are internships, against an index-wide internship share of 13.7%. 208 employers posted and the top ten hold 20.1%. 1.7% of listings hide the employer, so a small office in Sector 62 is as likely to be hiring as a large one."
      ],
      "chart": {
        "id": "rhjinff8Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=294)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          213,
          81
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
            "Hr Executive",
            "10"
          ],
          [
            "Us It Recruiter",
            "10"
          ],
          [
            "Human Resource Recruiter",
            "9"
          ],
          [
            "Technical Recruiter",
            "8"
          ],
          [
            "Human Resources Intern",
            "8"
          ],
          [
            "Hr Recruiter",
            "7"
          ],
          [
            "Hr Recruiter & Business Development Executive",
            "7"
          ],
          [
            "Hr Intern",
            "6"
          ],
          [
            "It Recruiter",
            "6"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 208 different employers posted these listings, and 1.7% of listings do not name the employer."
      }
    },
    {
      "title": "What is the HR fresher salary in Noida?",
      "sub": "Top of the stated range, per year, on 94 jobs.",
      "paras": [
        "For the 94 Noida HR jobs that state pay in rupees, the median top of range is ₹3.9 lakh a year. The lower quarter is ₹3 lakh and the upper quarter ₹5 lakh. Stated pay appears on 44.1% of jobs, so 55.9% leave you to ask.",
        "The ₹3 to ₹5 lakh band dominates with 53 listings (56.4%). 24 listings (25.5%) reach ₹5 to ₹8 lakh and 11 (11.7%) sit at ₹2 to ₹3 lakh. 3 are under ₹2 lakh, 2 reach ₹8 to ₹12 lakh and 1 reaches ₹12 to ₹20 lakh.",
        "Only 5 of the 81 internships state a stipend (6.2%), with a median top of range of ₹10,000 a month. Stipends in the sample run from the 5,000 to 10,000 band up to 20,000 to 40,000, which is a wide spread on five listings. Ask what the number is before you accept."
      ],
      "chart": {
        "id": "rhjinff8Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (94 jobs that state pay in rupees)",
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
          11,
          53,
          24,
          2,
          1,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 56.4% of Noida HR jobs that state pay sit in the ₹3 to ₹5 lakh a year band."
    },
    {
      "title": "Which skills do Noida HR listings mention?",
      "sub": "Keyword share across 286 described listings.",
      "paras": [
        "Communication skills appear in 76.6% of the 286 described listings. Excel follows at 22.7%, English at 18.5%, negotiation at 18.2% and social media at 17.5%. These five are the core. Everything else is far behind.",
        "Calling or telecalling is named in 4.2% and Hindi in 3.1%. On the tech side, cloud appears in 3.8% and SAP in 2.4%, with CRM tools also at 2.4%. Machine learning or generative AI shows up in 1.4%, and so do ChatGPT or AI tools.",
        "That last number is small but useful. A few employers now expect you to use AI tools for drafting job posts or screening notes. If you can show one example, such as a job description you wrote and then improved by hand, you stand out from freshers who only list tools."
      ],
      "chart": {
        "id": "rhjinff8Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (286 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "negotiation",
          "social media",
          "calling or telecalling",
          "cloud (AWS, Azure, GCP)",
          "Hindi",
          "SAP",
          "CRM tools (Salesforce, HubSpot or similar)"
        ],
        "values": [
          76.6,
          22.7,
          18.5,
          18.2,
          17.5,
          4.2,
          3.8,
          3.1,
          2.4,
          2.4
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Noida HR jobs involve targets, shifts or an MBA?",
      "sub": "What the descriptions say about terms.",
      "paras": [
        "Targets appear in 16.8% of described listings, work from office in 15.7%, and night, rotational, US or UK shifts in 13.6%. Incentives are named in 11.9% and immediate joining in 12.2%. Freshers are welcomed in 26.9%.",
        "On qualifications, MBA or PGDM is named in 13.3%, a certificate in 9.8%, any graduate in 5.2%, BBA in 3.8% and BTech or computer science in 3.8%. PF, ESI or health insurance appears in 4.9% and women candidates in 6.6%.",
        "9 listings (3.1%) carry the remote flag, compared with 6.5% across the whole index, and 3.8% mention work from home. Thursday (19.7%) and Tuesday (18.4%) are the busiest posting days, with Saturday at 7.1% and Sunday at 4.1%. Naukri carries 44.9%, Shine 17.0% and LinkedIn 16.3%."
      ],
      "chart": {
        "id": "rhjinff8Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (286 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "work from office",
          "night, rotational, US or UK shifts",
          "immediate joining",
          "incentives",
          "a certificate",
          "PF, ESI or health insurance",
          "work from home",
          "cab or transport"
        ],
        "values": [
          26.9,
          16.8,
          15.7,
          13.6,
          12.2,
          11.9,
          9.8,
          4.9,
          3.8,
          2.4
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 0.7% of described listings mention a bond or service agreement. Most do not, but read the offer letter anyway."
    },
    {
      "title": "How do you get hired as an HR fresher in Noida?",
      "sub": "Show a small piece of hiring work.",
      "paras": [
        "Start with the HR head at companies near you, or the talent acquisition lead if the team is big enough to have one. For tech recruiter roles, the engineering hiring manager often owns the headcount, so write to them as well.",
        "Attach a one-page hiring tracker: a sheet with columns for candidate, source, stage and next step, filled with ten pretend candidates for one open role. It proves the Excel skill that 22.7% of listings ask for, and shows you think in pipelines.",
        "Three lines in the email: who you are, what you attached, the role you want. Follow up once and stop. Only 12.2% of descriptions include an email address. Stu finds the person who hires, verifies the work email and sends from your own inbox once you start a campaign, and it stops when someone replies."
      ]
    }
  ],
  "method": [
    "This report counts **294 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Human Resources (Hr) Internship\", \"Hr Executive\", \"Us It Recruiter\"). It counts for the city when it names Noida as a location.",
    "Pay: 94 of 213 entry-level listings (44.1%) state a salary in rupees and 5 of 81 internships (6.2%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 286 listings (97.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, Shine, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in Noida?",
      "a": "The Studojo Jobs Index has 294 HR listings in Noida posted 1 to 15 November 2026. 213 are jobs and 81 are internships. Listings are not hires."
    },
    {
      "q": "What is the fresher HR salary in Noida?",
      "a": "Among 94 jobs that state pay, the median top of range is ₹3.9 lakh a year, and the middle half runs from ₹3 to ₹5 lakh. 55.9% of jobs do not state pay."
    },
    {
      "q": "Is there an HR internship in Noida?",
      "a": "Yes. 81 of 294 listings (27.6%) are internships, and Human Resources (Hr) Internship is the most common title with 17. Only 5 state a stipend, with a median of ₹10,000 a month."
    },
    {
      "q": "Do Noida companies hire freshers as IT recruiters?",
      "a": "Yes. Us It Recruiter has 10 listings, Technical Recruiter 8 and It Recruiter 6. Some of these mention shifts, which appear in 13.6% of described listings."
    },
    {
      "q": "Which skills should an HR fresher in Noida learn first?",
      "a": "Communication skills (76.6% of described listings) and Excel (22.7%). Negotiation (18.2%) and social media (17.5%) come next."
    },
    {
      "q": "Can I work from home in a Noida HR job?",
      "a": "Rarely. 9 listings (3.1%) are marked remote and 3.8% of described listings mention work from home, while 15.7% name work from office."
    }
  ],
  "takeaway": {
    "sub": "Five points for HR freshers in Noida.",
    "items": [
      [
        "Use the internship door",
        "81 listings are internships and 17 carry the exact title Human Resources (Hr) Internship."
      ],
      [
        "Know the pay",
        "The median stated top of range is ₹3.9 lakh a year, on 94 jobs."
      ],
      [
        "Practise Excel",
        "22.7% of described listings mention it."
      ],
      [
        "Check the terms",
        "Targets appear in 16.8% and shifts in 13.6%."
      ],
      [
        "Email the hiring side",
        "Send a hiring tracker for one open role to the HR head."
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
      "slug": "jobs-for-freshers-in-noida-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Noida 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: HR Jobs in Noida for Freshers 2026",
    "description": "294 active entry-level and internship listings for India posted 1 to 15 November 2026 (HR in Noida), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-in-noida-for-freshers-2026" place="report-end" size="card" title={"Want to email HR heads at Noida companies?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short personal note for each. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
