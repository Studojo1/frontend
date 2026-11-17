import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "field-sales-jobs-in-delhi-for-freshers-2026",
  "title": "Field Sales Jobs in Delhi for Freshers: 311 Listings and Pay in 2026",
  "short": "Field Sales Jobs in Delhi for Freshers 2026",
  "description": "Field sales jobs in Delhi for freshers: 311 listings posted 1 to 15 November, 73.3% mention targets, and the median stated top of range is ₹3.5 lakh a year.",
  "keywords": "field sales jobs in delhi for freshers, fresher field sales jobs delhi, field sales salary in delhi for freshers, field sales internship in delhi",
  "h1": "Field Sales Jobs in Delhi for Freshers:",
  "h1em": "What 311 Listings Show",
  "sub": "The Studojo Jobs Index has 311 field sales listings in Delhi, posted 1 to 15 November 2026. Half (156) state pay, with a median top of range of ₹3.5 lakh a year, and 73.3% of described listings mention targets.",
  "published": "2026-11-17",
  "scope": "field sales in Delhi · freshers",
  "findings": [
    "**Field sales jobs in Delhi for freshers** number 311 listings posted in the first half of November, from 219 employers, and only 5 are internships.",
    "**Targets lead the descriptions**: 73.3% mention targets and 24.1% mention incentives, compared with 20.9% and 9.3% across the whole index.",
    "**Pay is stated on 156 listings** (51.0%), with a median top of range of ₹3.5 lakh a year, and 92 of them (59.0%) sit in the ₹3 to 5 lakh band.",
    "**Insurance and loan sales fill the lower rows**: Sales Officer has 10 listings, the insurance titles add 14 between them, and Home Loan Sales Executive has 3.",
    "**The move that works** is to email the branch manager or the area sales manager with a short beat plan for one market. Stu finds that person and writes the email."
  ],
  "stats": [
    {
      "num": "311",
      "label": "Field sales in Delhi listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 156 jobs that state it (51.0%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "34.2%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What titles do Delhi field sales jobs use?",
      "sub": "Sales Executive first, then officer, insurance and loan titles.",
      "paras": [
        "Field sales jobs in Delhi for freshers are most often called Sales Executive, with 76 listings (24.4%), and Field Sales Executive follows with 42 (13.5%). Sales Officer has 10, Corporate Sales Executive 8, and Field Sales Associate and B2B Sales Executive have 4 and 3. The word field is missing from most of the roles.",
        "Financial products show up in the title text. One bulk-hiring insurance officer title appears 6 times, Insurance Sales Executive has 5, Sales Executive in life insurance has 3 and Home Loan Sales Executive has 3. Officer is the usual word for these roles, so search Sales Officer as well.",
        "The 311 listings come from 219 employers, the top ten hold 18.3%, and only 0.3% hide the employer. Of the total, 306 are jobs and 5 are internships, so the way in is a full-time entry-level job."
      ],
      "chart": {
        "id": "rfsjidf15Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=311)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          306,
          5
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
            "76"
          ],
          [
            "Field Sales Executive",
            "42"
          ],
          [
            "Sales Officer",
            "10"
          ],
          [
            "Corporate Sales Executive",
            "8"
          ],
          [
            "Bulk Hiring /I Insurance Sales Officer // Gurugram/Gurugram",
            "6"
          ],
          [
            "Insurance Sales Executive",
            "5"
          ],
          [
            "Field Sales Associate",
            "4"
          ],
          [
            "Sales Executive - Life Insurance",
            "3"
          ],
          [
            "B2B Sales Executive",
            "3"
          ],
          [
            "Home Loan Sales Executive",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 219 different employers posted these listings, and 0.3% of listings do not name the employer."
      }
    },
    {
      "title": "How much do Delhi field sales jobs pay freshers?",
      "sub": "Top of the stated range, per year.",
      "paras": [
        "156 of the 311 listings state pay in rupees (51.0%), against 36.2% across the whole index. The median top of range is ₹3.5 lakh a year. The lower quarter is ₹3 lakh and the upper quarter ₹4.5 lakh, so the spread is narrow.",
        "The ₹3 to 5 lakh band holds 92 listings (59.0%). Then ₹2 to 3 lakh has 29 (18.6%), ₹5 to 8 lakh has 26 (16.7%) and ₹8 to 12 lakh has 4 (2.6%). Four sit under ₹2 lakh and one reaches the ₹12 to 20 lakh band. The top of range is not the take-home figure.",
        "Because 24.1% of descriptions mention incentives, part of that pay is usually variable. Ask for the fixed amount in writing before you decide. No internship in this slice states a stipend in rupees."
      ],
      "chart": {
        "id": "rfsjidf15Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (156 jobs that state pay in rupees)",
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
          29,
          92,
          26,
          4,
          1,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 59.0% of stated salaries fall between 3 and ₹5 lakh a year."
    },
    {
      "title": "Is communication or calling more important in Delhi field sales?",
      "sub": "Skills named in 307 listings with a full description.",
      "paras": [
        "Communication skills lead at 77.2% of the 307 described listings, well above the 57.2% across the index. Negotiation follows at 34.2%. Delhi field sales leans on talk, because you walk into a shop, convince the owner and come back next week.",
        "Calling or telecalling is named in 23.8%, double the whole-index share of 11.7%, since reps book their own visits by phone. CRM tools appear in 27.7%, English in 22.1%, Hindi in 12.7% and Excel in 9.4%. Hindi is lower than you might expect, which suggests many listings assume it.",
        "So prepare in that order. Be able to open a call, handle a no, and note the outcome in a simple sheet. Those three habits are easy to show in an email, and most applicants never show them."
      ],
      "chart": {
        "id": "rfsjidf15Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (307 listings with a full description)",
        "labels": [
          "communication skills",
          "negotiation",
          "CRM tools (Salesforce, HubSpot or similar)",
          "calling or telecalling",
          "English",
          "Hindi",
          "Excel",
          "social media",
          "SEO",
          "paid ads (Google, Meta, PPC)"
        ],
        "values": [
          77.2,
          34.2,
          27.7,
          23.8,
          22.1,
          12.7,
          9.4,
          2.0,
          1.6,
          1.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "What do Delhi field sales listings say about freshers, travel and targets?",
      "sub": "Terms in the descriptions.",
      "paras": [
        "Targets appear in 73.3% of described listings and incentives in 24.1%. A two-wheeler or driving licence is named in 10.1%. With a territory that can run from Karol Bagh to Nehru Place, ask which area is yours and whether fuel is reimbursed.",
        "Freshers are welcome in 29.3%, 12th pass is accepted in 11.4% and any graduate in 2.9%, while 4.2% ask for an MBA or PGDM. PF, ESI or health insurance is named in 8.1%, work from office in 7.8%, immediate joining in 6.5% and women candidates in 3.3%.",
        "Posting is steady from Tuesday to Friday, each near 18%, then drops to 9.0% on Saturday and 3.5% on Sunday. Shine carries 36.7%, company career sites 22.8%, Naukri 20.3%, LinkedIn 10.9% and Internshala 9.3%. That only shows where we found them."
      ],
      "chart": {
        "id": "rfsjidf15Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (307 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "a two-wheeler or driving licence",
          "PF, ESI or health insurance",
          "work from office",
          "immediate joining",
          "a portfolio"
        ],
        "values": [
          73.3,
          29.3,
          24.1,
          10.1,
          8.1,
          7.8,
          6.5,
          4.6
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** 73.3% mention targets. Ask what the number is for the first three months."
    },
    {
      "title": "Who should a Delhi fresher email for a field sales job?",
      "sub": "The person who runs the beat, and a plan for one market.",
      "paras": [
        "Email the branch manager or the area sales manager. They run the beat and know which patches nobody covers. For insurance or loan roles, the sales team lead at the branch is the right person. At a small distributor, write to the owner. Name the product you would sell.",
        "Your proof is a beat plan for one market: the lanes you would cover, the kind of shop in each, and the order you would walk them. One page, plain. The email has three lines: who you are, which market you chose, the plan attached. Follow up once after a few days.",
        "Only 6.5% of descriptions carry an email address, so you will rarely know the name. Stu finds who hires, verifies their work email, writes a note from your real work, and sends it from your own inbox once you start a campaign, then follows up politely."
      ]
    }
  ],
  "method": [
    "This report counts **311 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as field sales when its job title matches that role (the most common titles here: \"Sales Executive\", \"Field Sales Executive\", \"Sales Officer\"). It counts for the city when it names Delhi as a location.",
    "Pay: 156 of 306 entry-level listings (51.0%) state a salary in rupees and 0 of 5 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 307 listings (98.7%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Shine, Naukri, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many field sales jobs for freshers are there in Delhi?",
      "a": "The Studojo Jobs Index lists 311 field sales listings in Delhi posted 1 to 15 November 2026. 306 are jobs and 5 are internships. These are listings we track, not hires."
    },
    {
      "q": "What is the salary for a fresher in field sales in Delhi?",
      "a": "Of the 156 listings that state pay, the median top of range is ₹3.5 lakh a year, and the middle half is ₹3 to 4.5 lakh. Incentives are named in 24.1% of descriptions, so check the fixed part."
    },
    {
      "q": "Are there field sales internships in Delhi?",
      "a": "Very few. Only 5 of the 311 listings are internships, and none states a stipend in rupees. A job listing is the likelier route."
    },
    {
      "q": "Do I need a two-wheeler for field sales in Delhi?",
      "a": "Only some listings say so. A two-wheeler or driving licence is named in 10.1% of described listings. Ask about the size of the territory and travel reimbursement."
    },
    {
      "q": "Can I get a field sales job in Delhi after 12th?",
      "a": "Sometimes. 11.4% of described listings accept 12th pass and 2.9% say any graduate. Communication skills, named in 77.2%, count for more than the certificate."
    },
    {
      "q": "What is a sales officer job and how is it different?",
      "a": "Sales Officer is another title for a field role, with 10 listings in Delhi. It often appears for insurance and loans, so read the product and the target before you apply."
    }
  ],
  "takeaway": {
    "sub": "Five points for field sales freshers in Delhi.",
    "items": [
      [
        "Search officer as well",
        "Sales Executive has 76 listings and Sales Officer has 10, mostly in insurance and loans."
      ],
      [
        "Expect ₹3 to 5 lakh",
        "59.0% of stated salaries sit there, and 156 listings state pay."
      ],
      [
        "Prepare for targets",
        "73.3% mention targets and 24.1% mention incentives."
      ],
      [
        "Practise the call and the pitch",
        "Communication is named in 77.2% and calling in 23.8%."
      ],
      [
        "Email the branch manager",
        "Attach a one-page beat plan for one market."
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Field Sales Jobs in Delhi for Freshers 2026",
    "description": "311 active entry-level and internship listings for India posted 1 to 15 November 2026 (field sales in Delhi), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-field-sales-jobs-in-delhi-for-freshers-2026" place="report-end" size="card" title={"Want to reach the manager hiring in Delhi?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who hires and verifies their work email, then writes a short note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
