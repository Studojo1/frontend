import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "business-development-jobs-in-chennai-for-freshers-2026",
  "title": "Business Development Jobs in Chennai for Freshers: 210 Listings, 2026",
  "short": "Business Development Jobs in Chennai 2026",
  "description": "Business development jobs in Chennai for freshers: 210 listings posted 1 to 15 November, 59 state pay, and the median top of range is ₹3.6 lakh a year.",
  "keywords": "business development jobs in chennai for freshers, fresher business development jobs chennai, business development salary in chennai for freshers, business development internship in chennai",
  "h1": "Business Development Jobs in Chennai for Freshers:",
  "h1em": "210 Listings, Closely Read",
  "sub": "The Studojo Jobs Index has 210 business development listings in Chennai from the first half of November 2026, and 17 are internships (8.1%). 59 jobs state pay, and the median top of range is ₹3.6 lakh a year, below the index median.",
  "published": "2026-11-18",
  "scope": "business development in Chennai · freshers",
  "findings": [
    "**Business development jobs in Chennai for freshers** come to 210 listings in the Studojo Jobs Index: 193 jobs and 17 internships, an 8.1% internship share against 13.7% across the index.",
    "**Chennai pays a little less at the top**: the median top of range among 59 jobs that state pay is ₹3.6 lakh a year, against ₹3.8 lakh for the whole index.",
    "**Targets lead the descriptions**: 63.9% mention targets, 43.8% name CRM tools and 39.4% name negotiation.",
    "**Company sites matter here**: 31.4% of listings were found on company career sites and ATS pages, close to LinkedIn at 33.8%.",
    "**The move that works** is to email the sales head or the founder with a short account plan. Stu finds who hires and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "210",
      "label": "Business development in Chennai listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3.6 lakh",
      "label": "Median stated pay a year, from the 59 jobs that state it (30.6%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "43.8%",
      "label": "Of listings with a full description ask for CRM tools (Salesforce, HubSpot or similar)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which business development jobs for freshers does Chennai list?",
      "sub": "Titles, and a smaller internship share than most.",
      "paras": [
        "Business development jobs in Chennai for freshers are led by Business Development Executive with 46 listings. Business Development Associate has 23 and Business Development Executive (Bde) 16. Inside Sales Executive has 10, Inside Sales Representative 8 and Sales Development Representative 6.",
        "A few titles name a niche. An interior design variant of the executive title has 3 listings, and Senior Business Development Executive 3, which is unusual for a fresher search. Internship titles are fewer here: Business Development (Sales) Internship has 5 and Business Development Intern 3.",
        "Of the 210 listings, 193 are jobs and 17 are internships. 150 employers posted, the top ten hold 23.3% and 1.0% hide the employer name. This is a market of many small posters, so no single firm sets the tone."
      ],
      "chart": {
        "id": "rbdjicf30Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=210)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          193,
          17
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
            "46"
          ],
          [
            "Business Development Associate",
            "23"
          ],
          [
            "Business Development Executive (Bde)",
            "16"
          ],
          [
            "Inside Sales Executive",
            "10"
          ],
          [
            "Inside Sales Representative",
            "8"
          ],
          [
            "Sales Development Representative",
            "6"
          ],
          [
            "Business Development (Sales) Internship",
            "5"
          ],
          [
            "Senior Business Development Executive",
            "3"
          ],
          [
            "Business Development Intern",
            "3"
          ],
          [
            "Business Development Executive - Interior Design",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 150 different employers posted these listings, and 1.0% of listings do not name the employer."
      }
    },
    {
      "title": "What do Chennai business development jobs pay?",
      "sub": "Stated pay, top of range, per year.",
      "paras": [
        "Of the 193 jobs, only 59 (30.6%) state pay in rupees, a little under the 36.2% across the index. The median top of range is ₹3.6 lakh a year, with a lower quarter of ₹3 lakh and an upper quarter of ₹5 lakh. The index median is ₹3.8 lakh.",
        "The ₹3 to ₹5 lakh band dominates with 31 listings (52.5%). ₹5 to ₹8 lakh has 14 (23.7%), ₹2 to ₹3 lakh has 10 (16.9%), under ₹2 lakh has 3 (5.1%) and ₹8 to ₹12 lakh has 1 (1.7%). Nothing is above ₹12 lakh.",
        "None of the 17 internships states a stipend. Seven in ten jobs give no figure at all, so raise pay on the first call, and ask what share is fixed when 30.3% of described listings mention incentives."
      ],
      "chart": {
        "id": "rbdjicf30Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (59 jobs that state pay in rupees)",
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
          10,
          31,
          14,
          1,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 52.5% of stated pay sits in the ₹3 to ₹5 lakh band."
    },
    {
      "title": "Which skills do Chennai business development listings ask for?",
      "sub": "Skills named in 208 listings with a full description.",
      "paras": [
        "Communication skills appear in 85.6% of the 208 described listings. CRM tools follow at 43.8%, English at 40.9%, negotiation at 39.4% and calling or telecalling at 24.0%. The CRM share is far above the 9.6% across the index.",
        "Excel is named in 17.3% and Hindi in 11.1%. Social media is 4.3%, cloud tools 3.8% and GST 1.4%. That GST mention hints at sales of accounting or compliance products, so a basic idea of invoicing helps there.",
        "Hindi at 11.1% is nearly double the 6.4% index share, a small surprise for a Tamil Nadu city. Tell them what languages you can sell in, since the listing may expect calls outside the city."
      ],
      "chart": {
        "id": "rbdjicf30Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (208 listings with a full description)",
        "labels": [
          "communication skills",
          "CRM tools (Salesforce, HubSpot or similar)",
          "English",
          "negotiation",
          "calling or telecalling",
          "Excel",
          "Hindi",
          "social media",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          85.6,
          43.8,
          40.9,
          39.4,
          24.0,
          17.3,
          11.1,
          4.3,
          3.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Chennai business development jobs need a degree or a bike?",
      "sub": "Entry rules and field conditions in the descriptions.",
      "paras": [
        "Targets are named in 63.9% of described listings, against 20.9% across the index. Freshers are named in 33.2% and incentives in 30.3%. Any graduate is named in 12.0% and an MBA or PGDM in 4.3%, so the degree name matters less than your proof.",
        "A two-wheeler or driving licence appears in 5.8%, against 2.9% for the index. That points to field sales, so check how many client visits a week the job expects. Work from office is 7.2%, hybrid 2.9% and work from home 1.4%.",
        "PF, ESI or health insurance is mentioned in 8.7% and immediate joining in 6.7%. Where listings were found: LinkedIn 33.8%, company career sites and ATS pages 31.4%, Shine 15.2%, Naukri 12.9% and Internshala 6.7%."
      ],
      "chart": {
        "id": "rbdjicf30Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (208 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "PF, ESI or health insurance",
          "work from office",
          "immediate joining",
          "a two-wheeler or driving licence",
          "a certificate",
          "hybrid"
        ],
        "values": [
          63.9,
          33.2,
          30.3,
          8.7,
          7.2,
          6.7,
          5.8,
          3.8,
          2.9
        ],
        "unit": "%"
      },
      "callout": "**Check:** 5.8% of described listings ask for a two-wheeler or licence."
    },
    {
      "title": "How do you get hired in business development as a fresher in Chennai?",
      "sub": "Write to the person who owns the number.",
      "paras": [
        "Email the sales head, the regional business head or, at a small firm, the founder. Many teams sit along OMR or around Guindy, so say which area you can reach. About 11.1% of descriptions carry an email address, so look in the listing first, then find the person yourself.",
        "Proof is a one-page account plan. Pick one company the team sells to, list three people you would call and write the opening line for each. Your email says who you are, what you noticed and what is attached, in three lines. Follow up once, a few days later.",
        "Stu handles the slow parts. It finds who hires, verifies their work email, writes a note from your real work and sends it from your own inbox once you start a campaign. It does not mass apply, and it does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **210 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as business development when its job title matches that role (the most common titles here: \"Business Development Executive\", \"Business Development Associate\", \"Business Development Executive (Bde)\"). It counts for the city when it names Chennai as a location.",
    "Pay: 59 of 193 entry-level listings (30.6%) state a salary in rupees and 0 of 17 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 208 listings (99.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Naukri, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many business development jobs for freshers are there in Chennai?",
      "a": "The Studojo Jobs Index has 210 business development listings in Chennai posted 1 to 15 November 2026: 193 jobs and 17 internships. Listings are not hires."
    },
    {
      "q": "What is the business development salary in Chennai for freshers?",
      "a": "Among the 59 jobs that state pay, the median top of range is ₹3.6 lakh a year, with the middle half between ₹3 and ₹5 lakh. These are tops of ranges, so offers can be lower."
    },
    {
      "q": "Is there a business development internship in Chennai?",
      "a": "A few. 17 of the 210 listings (8.1%) are internships, and none states a stipend in rupees. Business Development (Sales) Internship has 5 listings."
    },
    {
      "q": "Do Chennai business development jobs need a two-wheeler?",
      "a": "Sometimes. A two-wheeler or driving licence is named in 5.8% of described listings, so ask whether the role means field visits before you accept."
    },
    {
      "q": "Can I get a business development job in Chennai without an MBA?",
      "a": "Yes. An MBA or PGDM is named in 4.3% of described listings, while any graduate is named in 12.0% and freshers in 33.2%. Proof of selling counts for more."
    },
    {
      "q": "Where are Chennai business development jobs listed?",
      "a": "LinkedIn carries 33.8% of the listings we track, company career sites and ATS pages 31.4%, Shine 15.2%, Naukri 12.9% and Internshala 6.7%. That only shows where they were found."
    }
  ],
  "takeaway": {
    "sub": "Five points before you apply in Chennai.",
    "items": [
      [
        "Ask about pay early",
        "Only 30.6% of jobs state it."
      ],
      [
        "Know the CRM basics",
        "43.8% of described listings name CRM tools."
      ],
      [
        "Check for field work",
        "5.8% ask for a two-wheeler or licence."
      ],
      [
        "Look beyond job portals",
        "31.4% were found on company career sites and ATS pages."
      ],
      [
        "Email the sales head",
        "Attach a one-page account plan and follow up once."
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Business Development Jobs in Chennai 2026",
    "description": "210 active entry-level and internship listings for India posted 1 to 15 November 2026 (business development in Chennai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-business-development-jobs-in-chennai-for-freshers-2026" place="report-end" size="card" title={"Want to email a Chennai sales head yourself?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short personal email from your real work, and sends it from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
