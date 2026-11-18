import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "business-development-jobs-in-delhi-for-freshers-2026",
  "title": "Business Development Jobs in Delhi for Freshers: 272 Listings, 2026",
  "short": "Business Development Jobs in Delhi 2026",
  "description": "Business development jobs in Delhi for freshers: 272 listings from 1 to 15 November, 69 are internships, and the median stated pay tops out at ₹4.8 lakh a year.",
  "keywords": "business development jobs in delhi for freshers, fresher business development jobs delhi, business development salary in delhi for freshers, business development internship in delhi",
  "h1": "Business Development Jobs in Delhi for Freshers:",
  "h1em": "What 272 Listings Show",
  "sub": "The Studojo Jobs Index has 272 business development listings in Delhi from the first half of November 2026, and 69 are internships (25.4%). 64.6% of described listings mention targets, and median stated pay tops out at ₹4.8 lakh a year.",
  "published": "2026-11-17",
  "scope": "business development in Delhi · freshers",
  "findings": [
    "**Business development jobs in Delhi for freshers** come to 272 listings in the Studojo Jobs Index: 203 jobs and 69 internships, a 25.4% internship share against 13.7% across the index.",
    "**Negotiation matters more here**: 41.0% of described listings mention it, against 8.2% across the whole index, and 85.8% mention communication skills.",
    "**Only 41 jobs state pay** (20.2%), with a median top of range of ₹4.8 lakh a year, and 5 listings reach ₹8 to ₹12 lakh.",
    "**Not one Delhi internship states a stipend** in these listings, so the amount is something you must ask for.",
    "**The move that works** is to email the sales head, or the founder at a small firm, with a prospect list. Stu finds who hires and sends from your own inbox."
  ],
  "stats": [
    {
      "num": "272",
      "label": "Business development in Delhi listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹4.8 lakh",
      "label": "Median stated pay a year, from the 41 jobs that state it (20.2%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "47.0%",
      "label": "Of listings with a full description ask for CRM tools (Salesforce, HubSpot or similar)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What do Delhi business development listings for freshers look like?",
      "sub": "Who posts them and what the titles are.",
      "paras": [
        "Business development jobs in Delhi for freshers lead with Business Development Executive at 52 listings, then Business Development Associate at 28. Business Development (Sales) Internship follows with 25 and Business Development Intern with 21, so internships rank high on the list.",
        "Some titles mix duties. Hr Recruiter & Business Development Executive has 9 listings, and It Business Development Sales (B2B Sales) has 6. Read these closely: half the job may be recruiting or technical selling. Inside Sales Executive has 10, Business Development Executive (Bde) 9, and an Associate, Business Development title 7.",
        "The 272 listings come from 191 employers and the top ten hold 22.1%. Hidden employers are 1.5%. There are 203 jobs and 69 internships, a bigger internship slice than most cities in this batch of reports."
      ],
      "chart": {
        "id": "rbdjidf11Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=272)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          203,
          69
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
            "Business Development Executive",
            "52"
          ],
          [
            "Business Development Associate",
            "28"
          ],
          [
            "Business Development (Sales) Internship",
            "25"
          ],
          [
            "Business Development Intern",
            "21"
          ],
          [
            "Inside Sales Executive",
            "10"
          ],
          [
            "Business Development Executive (Bde)",
            "9"
          ],
          [
            "Hr Recruiter & Business Development Executive",
            "9"
          ],
          [
            "Associate - Business Development",
            "7"
          ],
          [
            "It Business Development Sales (B2B Sales)",
            "6"
          ],
          [
            "Business Development Internship",
            "5"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 191 different employers posted these listings, and 1.5% of listings do not name the employer."
      }
    },
    {
      "title": "What does a fresher earn in business development in Delhi?",
      "sub": "Stated pay, top of range, per year.",
      "paras": [
        "The median top of range among the 41 Delhi jobs that state pay is ₹4.8 lakh a year. The lower quarter is ₹3.6 lakh and the upper quarter ₹6 lakh. That is above the whole-index median of ₹3.8 lakh, though only for the fifth of listings that show pay at all.",
        "The bands: 18 listings (43.9%) at ₹3 to ₹5 lakh, 14 (34.1%) at ₹5 to ₹8 lakh, 5 (12.2%) at ₹8 to ₹12 lakh and 4 (9.8%) at ₹2 to ₹3 lakh. None is under ₹2 lakh or above ₹12 lakh. Top of range is not base pay, so expect a variable part.",
        "Internships are the blind spot. Of 69 internship listings, none states a stipend in rupees. If you are weighing an internship against a job, ask about the stipend and any pre-placement route on the first call, and ask early."
      ],
      "chart": {
        "id": "rbdjidf11Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (41 jobs that state pay in rupees)",
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
          0,
          4,
          18,
          14,
          5,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 5 Delhi listings reach ₹8 to ₹12 lakh, but 80% of jobs state no pay."
    },
    {
      "title": "Which skills do Delhi business development listings ask for?",
      "sub": "Skills named in 268 listings with a full description.",
      "paras": [
        "Communication skills appear in 85.8% of the 268 described listings. CRM tools follow at 47.0%, negotiation at 41.0% and English at 38.1%. Negotiation stands out: the whole index is at 8.2%, so Delhi listings lean on it far more.",
        "Calling or telecalling is named in 29.1%, Excel in 23.1%, social media in 14.6% and Hindi in 12.3%. Cloud tools reach 4.1%, which hints at the technology-sales titles in the list. Hindi at 12.3% is worth stating if you speak it, since many buyers do.",
        "Practise the negotiation part. Write a one-page note on how you would handle a buyer who says the price is too high, with two replies. It is cheap to produce, and it shows the exact skill 41.0% of listings name."
      ],
      "chart": {
        "id": "rbdjidf11Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (268 listings with a full description)",
        "labels": [
          "communication skills",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "English",
          "calling or telecalling",
          "Excel",
          "social media",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "SEO"
        ],
        "values": [
          85.8,
          47.0,
          41.0,
          38.1,
          29.1,
          23.1,
          14.6,
          12.3,
          4.1,
          2.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "Is a degree or MBA needed for business development in Delhi?",
      "sub": "What the descriptions say about the job and who can apply.",
      "paras": [
        "Not often. Any graduate is named in 6.0% of described listings and an MBA or PGDM in 6.7%. BBA appears in 4.5% and BTech, BE or computer science in 4.1%. Freshers are welcome in 28.7%, which is the clearest signal that the door is open.",
        "Targets show up in 64.6% and incentives in 25.4%. A certificate is named in 12.7% and women candidates in 8.2%. Work from office is stated in 3.7% and hybrid in 3.4%, so most listings do not say where you sit. Ask.",
        "Where the listings were found: LinkedIn 37.9%, Internshala 21.7%, company career sites and ATS pages 18.8%, Shine 15.8% and Naukri 5.9%. Tuesday is the busiest posting day at 20.2%, and Sunday is 8.8%, a weekend that took in the Diwali week."
      ],
      "chart": {
        "id": "rbdjidf11Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (268 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "a certificate",
          "work from office",
          "a portfolio",
          "hybrid",
          "a two-wheeler or driving licence",
          "immediate joining",
          "work from home"
        ],
        "values": [
          64.6,
          28.7,
          25.4,
          12.7,
          3.7,
          3.7,
          3.4,
          3.4,
          3.0,
          3.0
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** 64.6% mention targets. Find out how the first quarter is measured."
    },
    {
      "title": "How can a fresher get a business development job in Delhi?",
      "sub": "Go to the person who owns the number.",
      "paras": [
        "Email the sales head, the business head or, at a startup in Connaught Place, Nehru Place or Saket, the founder. Skip HR for this role: the sales head decides who can sell. About 11.6% of listings carry an email address, so most need you to find the person yourself.",
        "Prove you can sell by doing a little of it. Send ten prospects with one line each on why they would buy, and a sample opening email to one. Say in three lines who you are, what you noticed about their customers, and what is attached. One follow-up, then move on.",
        "Stu does the slow parts. It finds the person who hires, verifies their work email, writes the note from your real work, and sends it from your own inbox once you start a campaign. It does not mass apply, and it never promises replies."
      ]
    }
  ],
  "method": [
    "This report counts **272 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as business development when its job title matches that role (the most common titles here: \"Business Development Executive\", \"Business Development Associate\", \"Business Development (Sales) Internship\"). It counts for the city when it names Delhi as a location.",
    "Pay: 41 of 203 entry-level listings (20.2%) state a salary in rupees and 0 of 69 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 268 listings (98.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many business development jobs for freshers are there in Delhi?",
      "a": "The Studojo Jobs Index has 272 business development listings in Delhi posted 1 to 15 November 2026: 203 jobs and 69 internships. Listings are not hires."
    },
    {
      "q": "What is the business development salary in Delhi for freshers?",
      "a": "Among the 41 jobs that state pay, the median top of range is ₹4.8 lakh a year, with the middle half from ₹3.6 to ₹6 lakh. Incentives are common, so ask what part is fixed."
    },
    {
      "q": "Is there a business development internship in Delhi?",
      "a": "Yes, 69 of the 272 listings (25.4%) are internships. Business Development (Sales) Internship has 25 and Business Development Intern has 21. None of them states a stipend in rupees."
    },
    {
      "q": "Do Delhi business development roles require negotiation skills?",
      "a": "Often. 41.0% of described listings mention negotiation, and 64.6% mention targets. Prepare two replies to a buyer who says the price is too high."
    },
    {
      "q": "Can I get a business development job in Delhi without an MBA?",
      "a": "Yes. An MBA or PGDM is named in 6.7% of described listings, while any graduate is named in 6.0% and freshers are welcome in 28.7%. Proof of selling counts for more than the degree name."
    },
    {
      "q": "Where are Delhi business development jobs listed?",
      "a": "LinkedIn carries 37.9% of the listings we track, Internshala 21.7%, company career sites and ATS pages 18.8%, Shine 15.8% and Naukri 5.9%. That only shows where they were found."
    }
  ],
  "takeaway": {
    "sub": "Five points before you apply in Delhi.",
    "items": [
      [
        "Read mixed titles",
        "Hr Recruiter & Business Development Executive has 9 listings and is not pure sales."
      ],
      [
        "Practise negotiation",
        "41.0% of described listings mention it."
      ],
      [
        "Ask about stipends",
        "None of the 69 internships states one in rupees."
      ],
      [
        "Know the pay signal",
        "Median stated top of range is ₹4.8 lakh a year across 41 jobs."
      ],
      [
        "Email the sales head",
        "Attach ten prospects and a sample note, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "business-development-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Business Development Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Business Development Jobs in Delhi 2026",
    "description": "272 active entry-level and internship listings for India posted 1 to 15 November 2026 (business development in Delhi), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-business-development-jobs-in-delhi-for-freshers-2026" place="report-end" size="card" title={"Want to email the Delhi sales head yourself?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short personal email from your real work, and sends it from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
