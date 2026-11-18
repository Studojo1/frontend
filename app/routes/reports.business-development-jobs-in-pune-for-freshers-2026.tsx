import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "business-development-jobs-in-pune-for-freshers-2026",
  "title": "Business Development Jobs in Pune for Freshers: 149 Listings, 2026",
  "short": "Business Development Jobs in Pune 2026",
  "description": "Business development jobs in Pune for freshers: 149 listings posted 1 to 15 November, 31 are internships, and the median stated pay tops out at ₹4 lakh a year.",
  "keywords": "business development jobs in pune for freshers, fresher business development jobs pune, business development salary in pune for freshers, business development internship in pune",
  "h1": "Business Development Jobs in Pune for Freshers:",
  "h1em": "What 149 Listings Show",
  "sub": "The Studojo Jobs Index has 149 business development listings in Pune from the first half of November 2026, and 31 are internships (20.8%). 31 jobs state pay with a median top of range of ₹4 lakh a year, and 2 internships state a stipend.",
  "published": "2026-11-18",
  "scope": "business development in Pune · freshers",
  "findings": [
    "**Business development jobs in Pune for freshers** come to 149 listings in the Studojo Jobs Index: 118 jobs and 31 internships, a 20.8% internship share against 13.7% across the index.",
    "**Pune has a stipend signal**: 2 internships state a stipend, both in the ₹10,000 to 20,000 a month band.",
    "**Digital skills show up in sales**: social media is named in 15.1% of described listings and paid ads in 6.2%, against 7.4% for social media across the index.",
    "**Pay is stated in 31 jobs** (26.3%), with a median top of range of ₹4 lakh a year, and 3 listings reach ₹8 to ₹12 lakh.",
    "**The move that works** is to email the sales head or founder with a short lead list. Stu finds who hires and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "149",
      "label": "Business development in Pune listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 31 jobs that state it (26.3%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "52.7%",
      "label": "Of listings with a full description ask for CRM tools (Salesforce, HubSpot or similar)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What business development jobs for freshers does Pune list?",
      "sub": "Titles, internships and who posts them.",
      "paras": [
        "Business development jobs in Pune for freshers begin with Business Development Associate at 20 listings, narrowly ahead of Business Development Executive at 18. Inside Sales Executive has 11, Business Development Intern 8 and Business Development (Sales) Internship 8.",
        "The tail is varied. Sales Development Representative has 4, Business Development Executive (Bde) 5, and Marketing And Business Development Intern, Inside Sales Engineer and Business Development Representative have 2 each. The engineer title points to technical selling, so read the description.",
        "Of the 149 listings, 118 are jobs and 31 are internships. 124 employers posted, the top ten hold 19.5% and 1.3% hide the name. With so many small posters, you will meet a lot of founders rather than big HR desks."
      ],
      "chart": {
        "id": "rbdjipf31Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=149)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          118,
          31
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
            "Business Development Associate",
            "20"
          ],
          [
            "Business Development Executive",
            "18"
          ],
          [
            "Inside Sales Executive",
            "11"
          ],
          [
            "Business Development Intern",
            "8"
          ],
          [
            "Business Development (Sales) Internship",
            "8"
          ],
          [
            "Business Development Executive (Bde)",
            "5"
          ],
          [
            "Sales Development Representative",
            "4"
          ],
          [
            "Marketing And Business Development Intern",
            "2"
          ],
          [
            "Inside Sales Engineer",
            "2"
          ],
          [
            "Business Development Representative",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 124 different employers posted these listings, and 1.3% of listings do not name the employer."
      }
    },
    {
      "title": "How much do Pune business development roles pay freshers?",
      "sub": "Stated pay and stipends.",
      "paras": [
        "Of the 118 jobs, 31 (26.3%) state pay in rupees, under the 36.2% across the index. The median top of range is ₹4 lakh a year, against ₹3.8 lakh for the index, with a lower quarter of ₹3 lakh and an upper quarter of ₹5.4 lakh.",
        "The ₹3 to ₹5 lakh band holds 14 listings (45.2%), ₹5 to ₹8 lakh holds 8 (25.8%), ₹2 to ₹3 lakh holds 4 (12.9%), ₹8 to ₹12 lakh holds 3 (9.7%) and under ₹2 lakh holds 2 (6.5%). Nothing is above ₹12 lakh. Counts are small, so read them as a hint, not a rate card.",
        "Only 2 of the 31 internships (6.5%) state a stipend, both between ₹10,000 and ₹20,000 a month, with a median of ₹11,500. That is still better than a blank. Across the index, 2.1% of internships state one."
      ],
      "chart": {
        "id": "rbdjipf31Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (31 jobs that state pay in rupees)",
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
          2,
          4,
          14,
          8,
          3,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 2 of 31 Pune internships state a stipend, median ₹11,500 a month."
    },
    {
      "title": "Which skills do Pune business development listings ask for?",
      "sub": "Skills named in 146 listings with a full description.",
      "paras": [
        "Communication skills appear in 84.9% of the 146 described listings. CRM tools follow at 52.7%, English at 43.8%, calling or telecalling at 34.9% and negotiation at 32.2%. Excel is named in 24.0% and Hindi in 15.8%.",
        "Pune stands out on digital skills. Social media is named in 15.1%, paid ads in 6.2%, SEO in 5.5% and cloud tools in 5.5%. That blend suggests agency, SaaS and marketing-tech sales, so a short note on how you would pitch an online service can help.",
        "SQL is named in 3.4% and ChatGPT or AI tools in 2.1%. These are small numbers, but they show that a few Pune sales roles want you to be comfortable with data or a tool, not only with phone calls."
      ],
      "chart": {
        "id": "rbdjipf31Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (146 listings with a full description)",
        "labels": [
          "communication skills",
          "CRM tools (Salesforce, HubSpot or similar)",
          "English",
          "calling or telecalling",
          "negotiation",
          "Excel",
          "Hindi",
          "social media",
          "paid ads (Google, Meta, PPC)",
          "SEO"
        ],
        "values": [
          84.9,
          52.7,
          43.8,
          34.9,
          32.2,
          24.0,
          15.8,
          15.1,
          6.2,
          5.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "Are Pune business development jobs hybrid, and who can apply?",
      "sub": "Entry rules and working conditions in the descriptions.",
      "paras": [
        "Targets are named in 61.6% of described listings and incentives in 21.9%. Freshers are named in 25.3%, level with the 25.1% index figure. A certificate is named in 10.3% and an MBA or PGDM in 7.5%. Any graduate is 6.8% and BBA 5.5%.",
        "Pune is a little more flexible than average. Hybrid is named in 6.2%, against 2.1% across the index, and work from office in 11.0%. Work from home is 2.1%. A two-wheeler or driving licence appears in 6.2%, so check for field visits.",
        "Where they were found: LinkedIn 33.6%, company career sites and ATS pages 28.9%, Internshala 14.8%, Naukri 14.1% and Shine 8.7%. Thursday is the busiest posting day at 26.8%."
      ],
      "chart": {
        "id": "rbdjipf31Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (146 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "work from office",
          "a certificate",
          "immediate joining",
          "hybrid",
          "a two-wheeler or driving licence",
          "PF, ESI or health insurance"
        ],
        "values": [
          61.6,
          25.3,
          21.9,
          11.0,
          10.3,
          8.2,
          6.2,
          6.2,
          4.8
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 6.2% of described listings mention hybrid work."
    },
    {
      "title": "How do you get hired in business development as a fresher in Pune?",
      "sub": "Founders and sales heads, with a lead list.",
      "paras": [
        "Email the sales head or, at a startup, the founder. Pune has many small teams in Hinjewadi, Kharadi and Baner, so say which area you can reach. About 15.1% of descriptions carry an email address, so read the listing text first.",
        "Proof is a lead list. Choose ten companies that could buy their product, add the person you would call at each and one line on why they would care. Attach it. Your email says who you are, what you noticed and what is attached, in three lines. Follow up once, then move on.",
        "Stu does the slow parts. It finds who hires, verifies their work email, writes the note from your real work and sends it from your own inbox once you start a campaign. It does not mass apply and never promises replies."
      ]
    }
  ],
  "method": [
    "This report counts **149 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as business development when its job title matches that role (the most common titles here: \"Business Development Associate\", \"Business Development Executive\", \"Inside Sales Executive\"). It counts for the city when it names Pune as a location.",
    "Pay: 31 of 118 entry-level listings (26.3%) state a salary in rupees and 2 of 31 internships (6.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 146 listings (98.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many business development jobs for freshers are there in Pune?",
      "a": "The Studojo Jobs Index has 149 business development listings in Pune posted 1 to 15 November 2026: 118 jobs and 31 internships. Listings are not hires."
    },
    {
      "q": "What is the business development salary in Pune for freshers?",
      "a": "Among the 31 jobs that state pay, the median top of range is ₹4 lakh a year, with the middle half between ₹3 and ₹5.4 lakh. The sample is small, so treat it as a hint."
    },
    {
      "q": "Is there a business development internship in Pune?",
      "a": "Yes. 31 of the 149 listings (20.8%) are internships. Business Development Intern has 8 and Business Development (Sales) Internship has 8. Two state a stipend, with a median of ₹11,500 a month."
    },
    {
      "q": "Do Pune business development roles allow hybrid work?",
      "a": "Some do. Hybrid is named in 6.2% of described listings and work from home in 2.1%, while work from office is named in 11.0%. Most listings do not say, so ask."
    },
    {
      "q": "Can I get a business development job in Pune without an MBA?",
      "a": "Yes. An MBA or PGDM is named in 7.5% of described listings, any graduate in 6.8% and BBA in 5.5%. Communication skills are named in 84.9%."
    },
    {
      "q": "Where are Pune business development jobs listed?",
      "a": "LinkedIn carries 33.6% of the listings we track, company career sites and ATS pages 28.9%, Internshala 14.8%, Naukri 14.1% and Shine 8.7%. That only shows where they were found."
    }
  ],
  "takeaway": {
    "sub": "Five points before you apply in Pune.",
    "items": [
      [
        "Ask about the stipend",
        "Only 2 of 31 internships state one."
      ],
      [
        "Learn CRM and social tools",
        "CRM is named in 52.7% and social media in 15.1%."
      ],
      [
        "Plan for targets",
        "61.6% of described listings mention them."
      ],
      [
        "Ask about hybrid",
        "6.2% name it, against 2.1% across the index."
      ],
      [
        "Email the sales head",
        "Attach a ten-company lead list and follow up once."
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Business Development Jobs in Pune 2026",
    "description": "149 active entry-level and internship listings for India posted 1 to 15 November 2026 (business development in Pune), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-business-development-jobs-in-pune-for-freshers-2026" place="report-end" size="card" title={"Want to email a Pune sales head yourself?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short personal email from your real work, and sends it from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
