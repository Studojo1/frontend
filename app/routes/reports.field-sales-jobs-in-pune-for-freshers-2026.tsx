import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "field-sales-jobs-in-pune-for-freshers-2026",
  "title": "Field Sales Jobs in Pune for Freshers: 147 Listings and Their Pay",
  "short": "Field Sales Jobs in Pune for Freshers 2026",
  "description": "Field sales jobs in Pune for freshers: 147 listings posted 1 to 15 November, 58.0% of the jobs state pay, and the median top of range is ₹4 lakh a year.",
  "keywords": "field sales jobs in pune for freshers, fresher field sales jobs pune, field sales salary in pune for freshers, field sales internship in pune",
  "h1": "Field Sales Jobs in Pune for Freshers:",
  "h1em": "A Close Read of 147",
  "sub": "Pune has 147 field sales listings in the Studojo Jobs Index from 1 to 15 November 2026, of which 9 are internships. 80 jobs state pay, with a median top of range of ₹4 lakh a year, and 18.4% of described listings ask for a two-wheeler or driving licence.",
  "published": "2026-11-20",
  "scope": "field sales in Pune · freshers",
  "findings": [
    "**Field sales jobs in Pune for freshers** total 147 listings in the Studojo Jobs Index for 1 to 15 November, posted by 118 different employers, and the top ten hold just 21.8%.",
    "**Pay is stated on 80 jobs** (58.0%), against 36.2% across the whole index, with a median top of range of ₹4 lakh a year and 43 of them in the ₹3 to ₹5 lakh band.",
    "**Hindi is named in 19.7%** of described listings, about three times the 6.4% index share, and negotiation in 39.5%.",
    "**Freshers are named in 38.1%** of listings and a two-wheeler or driving licence in 18.4%, so sort out the licence before you start applying.",
    "**The move that works** is to email the area sales manager with a one-week visit plan for one Pune neighbourhood. Stu finds that manager and writes the note from your real work."
  ],
  "stats": [
    {
      "num": "147",
      "label": "Field sales in Pune listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 80 jobs that state it (58.0%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "39.5%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which field sales jobs in Pune take freshers, and what are they called?",
      "sub": "Generic sales titles first, then property, banking and internship versions.",
      "paras": [
        "Field sales jobs in Pune for freshers mostly carry the plain Sales Executive title, with 29 listings (19.7%). Field Sales Executive follows with 19 (12.9%) and Sales Officer with 6. So a search for the word field alone misses most of them. Add Sales Executive and Sales Officer to your saved searches, and read the description to see whether the role is on the road.",
        "The smaller titles show what you would sell. Real Estate Sales Executive has 4 and Presales Executive 3, which usually means site visits and walk-ins at housing projects. Casa Sales Officer has 3: CASA is bank shorthand for current and savings accounts. Area Sales Manager has 3, B2B Sales Executive 2 and a life insurance sales title 2.",
        "Of the 147 listings, 138 are jobs and 9 are internships (6.1%), and 3 of those internships are titled Field Sales Internship. None of the 9 states a stipend. The employer base is wide: 118 different employers, the top ten hold 21.8%, and no listing hides the employer. That spread means many small teams, each with its own manager to write to."
      ],
      "chart": {
        "id": "rfsjipf57Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=147)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          138,
          9
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
            "Sales Executive",
            "29"
          ],
          [
            "Field Sales Executive",
            "19"
          ],
          [
            "Sales Officer",
            "6"
          ],
          [
            "Real Estate Sales Executive",
            "4"
          ],
          [
            "Field Sales Internship",
            "3"
          ],
          [
            "Casa Sales Officer",
            "3"
          ],
          [
            "Presales Executive",
            "3"
          ],
          [
            "Area Sales Manager",
            "3"
          ],
          [
            "B2B Sales Executive",
            "2"
          ],
          [
            "Sales Executive - Life Insurance",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 118 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "What pay do Pune field sales listings put in writing?",
      "sub": "80 jobs print a figure; this is the top of each range, per year.",
      "paras": [
        "More Pune listings state pay than most. 80 of the 138 jobs (58.0%) give a figure in rupees, against 36.2% across the whole index. Their median top of range is ₹4 lakh a year (₹3,96,000), with half of them topping out between ₹3 lakh and ₹5 lakh. That is close to the ₹3.8 lakh median for the whole index.",
        "Just over half, 43 listings (53.8%), top out at ₹3 to ₹5 lakh. Below that band, 15 (18.8%) sit at ₹2 to ₹3 lakh and 1 is under ₹2 lakh. Above the band, 14 (17.5%) reach ₹5 to ₹8 lakh, 4 reach ₹8 to ₹12 lakh, 2 reach ₹12 to ₹20 lakh and 1 goes past ₹20 lakh. Treat those last few as outliers rather than a fresher benchmark.",
        "Incentives are named in 23.8% of described listings, so a slice of that pay may depend on the target. Ask three questions: the fixed monthly amount, whether fuel or travel is paid on top, and when incentives are settled. For the 9 internships, ask about the stipend before you accept, since none of them states one."
      ],
      "chart": {
        "id": "rfsjipf57Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (80 jobs that state pay in rupees)",
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
          1,
          15,
          43,
          14,
          4,
          2,
          1
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 43 of 80 stated salaries sit between ₹3 lakh and ₹5 lakh a year."
    },
    {
      "title": "Do you need Hindi or Marathi for field sales in Pune?",
      "sub": "Skills named across all 147 listings, each with a full description.",
      "paras": [
        "Hindi helps more here than in most places. It is named in 19.7% of the 147 described listings, about three times the 6.4% across the whole index, and English in 21.8%. Marathi is not in our keyword list, so the data cannot count it. A shop owner in Pimpri-Chinchwad or Kothrud may well prefer it, so say so in your note if you speak it.",
        "Communication skills top the chart at 71.4%, and negotiation follows at 39.5%, nearly five times its 8.2% index share. CRM tools appear in 27.9%, calling or telecalling in 13.6% and Excel in only 4.1%. The job is to persuade in person and then record what happened, not to build spreadsheets, so spend your prep time on the pitch rather than on formulas.",
        "Show those skills on paper with a short pitch for one product, written in the two or three languages you speak, plus one line on how you would handle the most common objection, which is usually price. Add a sample visit log: shop, person met, outcome, next step. That log is the CRM habit the listings ask for."
      ],
      "chart": {
        "id": "rfsjipf57Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (147 listings with a full description)",
        "labels": [
          "communication skills",
          "negotiation",
          "CRM tools (Salesforce, HubSpot or similar)",
          "English",
          "Hindi",
          "calling or telecalling",
          "Excel"
        ],
        "values": [
          71.4,
          39.5,
          27.9,
          21.8,
          19.7,
          13.6,
          4.1
        ],
        "unit": "%"
      }
    },
    {
      "title": "How hard are the targets, and who can apply in Pune?",
      "sub": "Terms named in the 147 descriptions.",
      "paras": [
        "Targets are named in 66.0% of described listings, more than three times the 20.9% across the whole index, and incentives in 23.8%. A two-wheeler or driving licence is named in 18.4%, against 2.9% index-wide. Work from office appears in 4.8%, and only one listing mentions hybrid work. One in ten (10.2%) names PF, ESI or health insurance.",
        "The door is wide open for freshers. They are named in 38.1% of descriptions, above the 25.1% index share. Any graduate and 12th pass each appear in 7.5%, MBA or PGDM in 6.8%, and BCom, BBA and BTech in 2.0% each. A certificate is named in 4.1%, and one listing mentions a pre-placement offer.",
        "Territories can stretch past the city. 21 of the 147 listings also name Mumbai, 6 Nagpur and 5 Nashik, so a Pune search can return roles that cover more of Maharashtra. Posting runs steadily from Tuesday to Friday, and Saturday still carries 13.6% of listings, above the 9.2% across the whole index, so check on weekends too."
      ],
      "chart": {
        "id": "rfsjipf57Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (147 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "a two-wheeler or driving licence",
          "PF, ESI or health insurance",
          "work from office",
          "a certificate",
          "a portfolio"
        ],
        "values": [
          66.0,
          38.1,
          23.8,
          18.4,
          10.2,
          4.8,
          4.1,
          3.4
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** whose bike is it, who pays the fuel, and what is the first month's target?"
    },
    {
      "title": "Who should you email for a field sales job in Pune, and what do you send?",
      "sub": "The territory owner, plus a plan for one week.",
      "paras": [
        "Email the area sales manager or the territory sales manager for the product. For property titles, write to the sales head for that project; for CASA or insurance seats, write to the branch manager. 17 of the 147 descriptions (11.6%) print an email address. For the rest you need a name, and the area manager is usually the one who signs off a new rep.",
        "Your proof is a one-week visit plan for one Pune neighbourhood, say Wakad or Kothrud: the streets, the type of shop or office on each, the order you would walk them, and what you would say in the first ten seconds at the counter. One page is enough. It shows you have already done the part most new reps put off.",
        "The email: one line on who you are and the area you know, one line on the plan you attached, one line on when you can start and that you have a licence. If nothing comes back in a week, send one short follow-up. If you would rather not hunt for each manager, Stu finds them, verifies their work emails and writes each note, and none of it leaves your own inbox before you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **147 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as field sales when its job title matches that role (the most common titles here: \"Sales Executive\", \"Field Sales Executive\", \"Sales Officer\"). It counts for the city when it names Pune as a location.",
    "Pay: 80 of 138 entry-level listings (58.0%) state a salary in rupees and 0 of 9 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 147 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Shine, Naukri, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many fresher field sales jobs are open in Pune?",
      "a": "We count 147 Pune listings in the Studojo Jobs Index for 1 to 15 November 2026, of which 9 are internships, posted by 118 employers. A listing is not a hire, but the spread of employers means many separate managers to approach."
    },
    {
      "q": "What field sales salary in Pune for freshers should you expect?",
      "a": "Expect around ₹4 lakh a year at the top of the range: that is the median across the 80 jobs that state pay, and half of them sit between ₹3 lakh and ₹5 lakh. Incentives are named in 23.8% of descriptions, so confirm the fixed part."
    },
    {
      "q": "Is a field sales internship in Pune paid?",
      "a": "The listings do not say. 9 of the 147 are internships, 3 of them titled Field Sales Internship, and not one states a stipend. Ask what it pays before you say yes."
    },
    {
      "q": "Is a two-wheeler compulsory for field sales jobs in Pune?",
      "a": "Not always, but often enough to plan for. 18.4% of described listings ask for a two-wheeler or driving licence, against 2.9% across the whole index. Ask who pays for fuel."
    },
    {
      "q": "Are real estate sales jobs in Pune open to freshers?",
      "a": "Some are. Real Estate Sales Executive has 4 listings and Presales Executive 3 in this data. Freshers are named in 38.1% of all Pune field sales descriptions, so read each one for the experience line."
    },
    {
      "q": "Where do Pune field sales jobs get posted?",
      "a": "Company career sites and ATS pages carry 34.0% of the listings we track, Shine 25.9%, Naukri 23.1%, LinkedIn 11.6% and Internshala 5.4%. Those shares describe where we found listings, nothing more."
    }
  ],
  "takeaway": {
    "sub": "Your Pune checklist before the first email.",
    "items": [
      [
        "Search three titles",
        "Sales Executive (29), Field Sales Executive (19) and Sales Officer (6) all hold field roles."
      ],
      [
        "Anchor on ₹4 lakh",
        "It is the median stated top of range across 80 jobs, not take-home pay."
      ],
      [
        "Name your languages",
        "Hindi is named in 19.7% of listings; add Marathi if you speak it."
      ],
      [
        "Sort the licence",
        "Nearly one listing in five (18.4%) wants a two-wheeler or driving licence."
      ],
      [
        "Write to the area sales manager",
        "Attach a one-week plan for one neighbourhood and follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "field-sales-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Field Sales Jobs for Freshers 2026"
    },
    {
      "slug": "pune-jobs-2026",
      "kicker": "Report",
      "title": "Pune's Job Market in 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Field Sales Jobs in Pune for Freshers 2026",
    "description": "147 active entry-level and internship listings for India posted 1 to 15 November 2026 (field sales in Pune), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-field-sales-jobs-in-pune-for-freshers-2026" place="report-end" size="card" title={"Want to reach the manager who runs a Pune territory?"} line={"One short call with Stu is the start: say the role, the city and the pay you want. Stu finds who hires, writes a personal note from your real work and follows up politely once your campaign starts."} />
    </DataReport>
  );
}
