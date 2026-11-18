import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-in-chennai-for-freshers-2026",
  "title": "HR Jobs in Chennai for Freshers: 204 Listings and Stated Pay in 2026",
  "short": "HR Jobs in Chennai for Freshers 2026",
  "description": "HR jobs in Chennai for freshers: 204 listings in the Studojo Jobs Index, and the median stated top of range is ₹3 lakh a year. See titles, skills and terms.",
  "keywords": "hr jobs in chennai for freshers, fresher hr jobs chennai, hr salary in chennai for freshers, hr internship in chennai",
  "h1": "HR Jobs in Chennai for Freshers:",
  "h1em": "What 204 Listings Say",
  "sub": "The Studojo Jobs Index has 204 HR listings in Chennai posted in the first half of November 2026. 71 jobs state pay, with a median top of range of ₹3 lakh a year. Only 16.7% are internships.",
  "published": "2026-11-17",
  "scope": "HR in Chennai · freshers",
  "findings": [
    "**HR jobs in Chennai for freshers** total 204 listings: 170 jobs and 34 internships (16.7%).",
    "**The titles are varied**: Us It Recruiter and Hr Assistant lead with 8 each, then Talent Acquisition Executive, Human Resource Intern and Hr Executive with 7 each.",
    "**Pay is stated on 71 jobs** (41.8%), with a median top of range of ₹3 lakh a year. 52.1% of those sit in the ₹3 to ₹5 lakh band, and 8.5% are under ₹2 lakh.",
    "**Terms are mild**: targets appear in 12.8% of described listings, incentives in 5.6% and night, rotational, US or UK shifts in 3.1%. PF, ESI or health insurance is named in 10.7%.",
    "**The move that works** is to email the HR manager or recruitment lead with a short onboarding checklist. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "204",
      "label": "HR in Chennai listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 71 jobs that state it (41.8%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "24.0%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What job titles do Chennai HR freshers apply to?",
      "sub": "Assistant, executive and talent acquisition titles all appear.",
      "paras": [
        "Chennai titles are varied. Us It Recruiter and Hr Assistant lead with 8 listings each. Talent Acquisition Executive, Human Resource Intern and Hr Executive follow with 7 each, and Human Resources (Hr) Internship has 6.",
        "Further down are Talent Acquisition Specialist at 5, a second US IT recruiter title also at 5, Human Resource Executive at 4 and plain Recruiter at 4. Hr Assistant is a useful title to search for, because it is usually the lowest rung, written for a fresh graduate.",
        "Of the 204 listings, 170 are jobs and 34 are internships. 162 employers posted, the top ten hold only 15.2%, and 2.5% do not name the employer. A spread that wide means a fresher around OMR or Guindy is not limited to a few big hirers."
      ],
      "chart": {
        "id": "rhjicff9Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=204)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          170,
          34
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
            "Us It Recruiter",
            "8"
          ],
          [
            "Hr Assistant",
            "8"
          ],
          [
            "Talent Acquisition Executive",
            "7"
          ],
          [
            "Human Resource Intern",
            "7"
          ],
          [
            "Hr Executive",
            "7"
          ],
          [
            "Human Resources (Hr) Internship",
            "6"
          ],
          [
            "Talent Acquisition Specialist",
            "5"
          ],
          [
            "Us It Recruiter Apptad Inc",
            "5"
          ],
          [
            "Human Resource Executive",
            "4"
          ],
          [
            "Recruiter",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 162 different employers posted these listings, and 2.5% of listings do not name the employer."
      }
    },
    {
      "title": "How much does an HR fresher make in Chennai?",
      "sub": "Stated pay, top of range, on 71 jobs.",
      "paras": [
        "The median top of range for a Chennai HR job is ₹3 lakh a year across 71 jobs that state pay. The lower quarter is ₹2.2 lakh and the upper quarter ₹3.5 lakh. The spread is tight, so the numbers cluster.",
        "The ₹3 to ₹5 lakh band has 37 listings (52.1%). 23 (32.4%) sit at ₹2 to ₹3 lakh and 6 (8.5%) are under ₹2 lakh. Only 5 reach ₹5 to ₹8 lakh (7.0%), and none state more than that. If you want the upper tail, Chennai gives you fewer examples.",
        "Internship pay is stated on 3 of 34 listings (8.8%), and all three fall in the 10,000 to 20,000 a month band, with a median top of range of ₹12,500. That is useful as a floor to ask for, but it is only three listings. Treat it as a hint, not a rate."
      ],
      "chart": {
        "id": "rhjicff9Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (71 jobs that state pay in rupees)",
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
          6,
          23,
          37,
          5,
          0,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** the middle half of stated HR pay in Chennai runs from ₹2.2 to ₹3.5 lakh a year."
    },
    {
      "title": "Which skills do HR listings in Chennai ask for?",
      "sub": "Keyword share across 196 described listings.",
      "paras": [
        "Communication skills appear in 66.3% of the 196 described listings. Excel is the second most named tool at 24.0%, then English at 19.9%, negotiation at 14.8% and social media at 14.3%. The order is the same as elsewhere, with a lower top number.",
        "Hindi appears in 8.2% and calling or telecalling in 6.1%. Cloud shows up in 5.1%, SQL in 2.0%, Python in 2.0%, CRM tools in 2.0% and Java in 2.0%, mainly in IT recruiter descriptions that list the skills of the people they hire.",
        "So what do you need? A clear voice, a tidy spreadsheet and the habit of reading a job description carefully. If you can list the five skills in a technical job post and explain them in one sentence each, you are ahead of most freshers who apply."
      ],
      "chart": {
        "id": "rhjicff9Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (196 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "negotiation",
          "social media",
          "Hindi",
          "calling or telecalling",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          66.3,
          24.0,
          19.9,
          14.8,
          14.3,
          8.2,
          6.1,
          5.1
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Chennai HR jobs need an MBA or come with benefits?",
      "sub": "What the descriptions say about the terms.",
      "paras": [
        "Qualification asks are modest. MBA or PGDM is named in 15.8% of the 196 described listings, any graduate in 13.3%, BTech or computer science in 5.1%, BBA in 3.6% and BCom in 2.0%. Freshers are welcomed in 24.0%, and a certificate in 5.6%.",
        "Benefits get a mention: PF, ESI or health insurance in 10.7%. Immediate joining is named in 10.2%, work from office in 7.7%, targets in 12.8% and incentives in 5.6%. Women candidates are named in 6.1%.",
        "16 listings (7.8%) carry the remote flag, above the 6.5% across the whole index. Wednesday (24.0%) and Friday (20.6%) are the busiest posting days, and Monday has 9.8%. Naukri carries 61.3% of the slice, so start there, then check LinkedIn at 13.2%."
      ],
      "chart": {
        "id": "rhjicff9Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (196 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "PF, ESI or health insurance",
          "immediate joining",
          "work from office",
          "incentives",
          "a certificate",
          "work from home",
          "night, rotational, US or UK shifts"
        ],
        "values": [
          24.0,
          12.8,
          10.7,
          10.2,
          7.7,
          5.6,
          5.6,
          4.1,
          3.1
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 7.8% of Chennai HR listings are marked remote, slightly above the whole index at 6.5%."
    },
    {
      "title": "How do you get an HR job in Chennai as a fresher?",
      "sub": "Email the HR manager with an onboarding checklist.",
      "paras": [
        "Write to the HR manager or the recruitment lead, not to a general careers inbox. In a smaller company the owner or the admin head may run hiring, so look for whoever signs the offer letters. Pick ten places you would work at, and write to each by name.",
        "Attach a one-page onboarding checklist for a new joiner: day one, week one, month one, with who does what. It shows you understand how HR actually runs a job, and it takes an afternoon. For an HR Assistant role it is the most direct proof you can send.",
        "Keep the email to three lines and follow up once. Only 9.7% of descriptions carry an email address, so the contact has to be found. That is the slow part Stu handles: it finds the person who hires, verifies a work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **204 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Us It Recruiter\", \"Hr Assistant\", \"Talent Acquisition Executive\"). It counts for the city when it names Chennai as a location.",
    "Pay: 71 of 170 entry-level listings (41.8%) state a salary in rupees and 3 of 34 internships (8.8%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 196 listings (96.1%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in Chennai?",
      "a": "The Studojo Jobs Index has 204 HR listings in Chennai posted 1 to 15 November 2026. That is 170 jobs and 34 internships. Listings are not hires."
    },
    {
      "q": "What is the HR salary in Chennai for freshers?",
      "a": "Of the 71 jobs that state pay, the median top of range is ₹3 lakh a year, and the middle half runs from ₹2.2 to ₹3.5 lakh. 58.2% of jobs do not state pay."
    },
    {
      "q": "Is there an HR internship in Chennai?",
      "a": "Yes. 34 of the 204 listings (16.7%) are internships, with Human Resource Intern at 7 and Human Resources (Hr) Internship at 6. Only 3 state a stipend, with a median top of range of ₹12,500 a month."
    },
    {
      "q": "What is an HR assistant job in Chennai?",
      "a": "Hr Assistant is a common entry title, with 8 listings. It is usually a support role under an HR executive or manager, so read the description to see whether it covers hiring, records or payroll."
    },
    {
      "q": "Do I need Excel for an HR job in Chennai?",
      "a": "It helps. Excel is named in 24.0% of described listings, second only to communication skills at 66.3%. A simple tracker is enough to show it."
    },
    {
      "q": "Are there remote HR jobs in Chennai?",
      "a": "Some. 16 listings (7.8%) are marked remote and 4.1% of described listings mention work from home. 7.7% name work from office."
    }
  ],
  "takeaway": {
    "sub": "Five points for HR freshers in Chennai.",
    "items": [
      [
        "Search Hr Assistant",
        "It has 8 listings and is written for a fresh graduate."
      ],
      [
        "Know the range",
        "The median stated top of range is ₹3 lakh a year, on 71 jobs."
      ],
      [
        "Check benefits",
        "PF, ESI or health insurance appears in 10.7% of described listings."
      ],
      [
        "Start on Naukri",
        "61.3% of the slice is listed there."
      ],
      [
        "Email the HR manager",
        "Attach an onboarding checklist for a new joiner."
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
      "slug": "jobs-for-freshers-in-chennai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Chennai 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: HR Jobs in Chennai for Freshers 2026",
    "description": "204 active entry-level and internship listings for India posted 1 to 15 November 2026 (HR in Chennai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-in-chennai-for-freshers-2026" place="report-end" size="card" title={"Want to email Chennai HR managers directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies a work email and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
