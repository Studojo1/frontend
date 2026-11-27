import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "retail-sales-jobs-in-pune-for-freshers-2026",
  "title": "Retail Sales Jobs in Pune for Freshers 2026: Stores, Banks and Pay",
  "short": "Retail Sales Jobs in Pune for Freshers",
  "description": "Retail sales jobs in Pune for freshers: 87 listings in early November, 8 of them internships, and a ₹3 lakh median stated pay across 35 jobs.",
  "keywords": "retail sales jobs in pune for freshers, fresher retail sales jobs pune, retail sales salary in pune for freshers, retail sales internship in pune",
  "h1": "Retail Sales Jobs in Pune for Freshers:",
  "h1em": "Shops, Banks and Saturdays",
  "sub": "The Studojo Jobs Index holds 87 Pune retail sales listings from 1 to 15 November 2026: 79 jobs and 8 internships. Of the jobs, 35 give a salary, and their median top of range is ₹3 lakh a year. Some titles are bank sales, not shop floors, and the top ten employers post 41.4%.",
  "published": "2026-11-27",
  "scope": "retail sales in Pune · freshers",
  "findings": [
    "**Retail sales jobs in Pune for freshers** come to 87 listings dated 1 to 15 November. 8 of them (9.2%) are internships, and none of those states a stipend.",
    "**Retail here often means banking**: Retail Bank Sales Executive Gl Internship has 8 listings, and Relationship Manager titles tied to retail or retail banking add 3 and 2 more.",
    "**A handful of employers post a large share**: the top ten hold 41.4% of listings, against 13.0% across the whole index, and 61 employers posted all 87.",
    "**Pay is stated in 44.3% of jobs**, above the 36.2% index share, and the median top of range is ₹3 lakh a year. 14.3% of stated salaries sit under ₹2 lakh.",
    "**The move that works** is an email to the store or branch manager with a one-page comparison of two stores you visited. Stu finds that person and writes the email for you."
  ],
  "stats": [
    {
      "num": "87",
      "label": "Retail sales in Pune listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 35 jobs that state it (44.3%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "17.1%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What counts as retail sales in Pune: shop floor or bank desk?",
      "sub": "Top ten titles as posted, and how many are internships.",
      "paras": [
        "Retail sales jobs in Pune for freshers split into two kinds of work. Store titles come first: Sales Associate has 9 of the 87 listings, Store Executive 7, Retail Sales Executive 5 and Cashier 5. One more store executive title carries a brand name and has 3. These are counter and floor jobs in shops and showrooms, where you sell to whoever walks in.",
        "The second kind sits in banks. Retail Bank Sales Executive Gl Internship has 8 listings, Relationship Manager with a retail tag has 3 and Relationship Manager in retail banking has 2. Here retail means selling accounts, cards or loans to individual customers, often from a branch. International Sales Associate for US hotels, with 2, is likely phone or chat sales to overseas guests.",
        "The chart shows 79 jobs and 8 internships. The internship title in the table also has 8 listings, which suggests most internships here are bank sales seats. None of the 8 states a stipend in rupees. If you want a store floor, filter for jobs; if a bank appeals to you, the internship can be a way in, as long as you ask about pay first."
      ],
      "chart": {
        "id": "rrsjipf108Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=87)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          79,
          8
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
            "Sales Associate",
            "9"
          ],
          [
            "Retail Bank Sales Executive Gl Internship",
            "8"
          ],
          [
            "Store Executive",
            "7"
          ],
          [
            "Retail Sales Executive",
            "5"
          ],
          [
            "Cashier",
            "5"
          ],
          [
            "Relationship Manager - Retail",
            "3"
          ],
          [
            "Relationship Manager - Retail Banking",
            "2"
          ],
          [
            "Retail Sales Associate",
            "2"
          ],
          [
            "International Sales Associate - Us Hotels",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 61 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "What does a Pune retail sales job pay a fresher?",
      "sub": "Stated pay, top of range, per year, for 35 jobs.",
      "paras": [
        "Pune listings state pay more often than the index as a whole: 35 of 79 jobs (44.3%) give a figure in rupees, against 36.2% across the whole index. At the median, the top of range is ₹3 lakh a year (₹3,00,000). A quarter of stated salaries top out at ₹2.4 lakh or less, and three quarters at ₹4 lakh or less. The median sits below the ₹3.8 lakh median for the whole index.",
        "The ₹3 to ₹5 lakh band leads with 16 listings (45.7%), and ₹2 to ₹3 lakh follows with 12 (34.3%). Five listings (14.3%) sit under ₹2 lakh, the band to watch, and only 2 reach ₹5 to ₹8 lakh. Nothing stated goes above that. Put simply, a Pune store or bank sales start is a ₹2.4 to ₹4 lakh conversation.",
        "Remember these are the top of each range. Incentives appear in only 7.3% of described listings, so most of the money is the fixed part. And the 8 internships state no stipend, so before you join one, ask in writing what you will be paid each month and whether a job offer can follow at the end."
      ],
      "chart": {
        "id": "rrsjipf108Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (35 jobs that state pay in rupees)",
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
          5,
          12,
          16,
          2,
          0,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Watch:** 14.3% of stated salaries are under ₹2 lakh a year. Ask for the monthly fixed pay in writing."
    },
    {
      "title": "Which skills do Pune retail sales jobs ask for?",
      "sub": "Skill words found in 82 Pune descriptions.",
      "paras": [
        "Communication leads at 62.2% of described listings, above the 57.2% index share. English is named in 20.7%, a little under the 22.3% across the index, and Hindi in 9.8%. Marathi is not tracked as a skill here, but in a Laxmi Road saree shop or a store on FC Road it can decide whether a customer trusts you.",
        "Negotiation is named in 17.1%, double the 8.2% across the index, which fits bank sales and showroom selling where price talk matters. CRM tools appear in 11.0%. Excel and SAP are each named in 6.1%; SAP points to larger chains where stock and billing sit in one system, so a little familiarity with any billing screen helps.",
        "Your prep, then: one product you can explain and defend on price, a basic grasp of how a sale is logged, and a clear sense of which kind of retail you want. A bank relationship role and a store counter role use the same talk but very different products, so say plainly in your email which one you are after."
      ],
      "chart": {
        "id": "rrsjipf108Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (82 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "negotiation",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Hindi",
          "Excel",
          "SAP"
        ],
        "values": [
          62.2,
          20.7,
          17.1,
          11.0,
          9.8,
          6.1,
          6.1
        ],
        "unit": "%"
      }
    },
    {
      "title": "Are Pune retail jobs open to 12th pass, and what do they promise?",
      "sub": "Entry bars, benefits and posting days in Pune listings.",
      "paras": [
        "A sales target is written into 37.8% of Pune descriptions, close to double the index share of 20.9%. On who can apply, 26.8% welcome freshers, 8.5% take 12th pass and 6.1% say any graduate will do. MBA or PGDM shows in just 3.7%, so the bar to enter is low. What decides the hire is whether you can carry a sales conversation, not the degree on your sheet.",
        "Benefits get a mention in 11.0% (PF, ESI or health insurance), above the 7.4% index share. Shifts appear in 9.8% and immediate joining in 6.1%. Incentives and work from office are each named in 7.3%. A portfolio also shows in 7.3%, which in the bank roles probably means the book of customers you look after, not design work, so ask what they mean.",
        "Postings came in late in the week: Saturday carried 19 listings (21.8%) and Friday 18 (20.7%), against just 6 on Sunday. Across the whole index, Saturday holds only 9.2%. In Pune, check boards and career sites over the weekend and send your email on Monday morning, when managers plan the week."
      ],
      "chart": {
        "id": "rrsjipf108Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (82 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "PF, ESI or health insurance",
          "night, rotational, US or UK shifts",
          "work from office",
          "incentives",
          "a portfolio",
          "immediate joining"
        ],
        "values": [
          37.8,
          26.8,
          11.0,
          9.8,
          7.3,
          7.3,
          7.3,
          6.1
        ],
        "unit": "%"
      },
      "callout": "**Weekend check:** Saturday carried 21.8% of Pune listings, more than any other day."
    },
    {
      "title": "How do you land a retail sales job in Pune as a fresher?",
      "sub": "Pick your kind of retail, then write to the person who runs it.",
      "paras": [
        "Decide first: shop floor or bank desk. For a store, email the store manager, or the cluster manager who runs several outlets across, say, Koregaon Park and Viman Nagar. For bank sales, email the branch manager. Only 3 of 82 described listings (3.7%) carry an email address, so you will need to find the name yourself.",
        "Send proof that you have looked closely. Visit two stores of the same kind, write one page on why one sells better, and say what you would do on a slow weekday. For a bank role, write half a page on which customer you would call first and why. Three lines are enough for the email: who you are, what you looked at, the page attached. Follow up once.",
        "Company career sites carried 41.4% of these listings, against 21.4% across the index, and a few employers post a big share, so apply there too. Then write to the manager. If finding names is the slow part, Stu does it: it tracks down who is hiring, verifies the work email and writes a short note from your real work, sent from your own inbox when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **87 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as retail sales when its job title matches that role (the most common titles here: \"Sales Associate\", \"Retail Bank Sales Executive Gl Internship\", \"Store Executive\"). It counts for the city when it names Pune as a location.",
    "Pay: 35 of 79 entry-level listings (44.3%) state a salary in rupees and 0 of 8 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 82 listings (94.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Naukri, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "Are there fresher retail sales jobs in Pune right now?",
      "a": "Yes. In the Studojo Jobs Index, Pune shows 87 retail sales listings from 1 to 15 November 2026, split into 79 entry-level jobs and 8 internships, posted by 61 employers. Treat it as the slice we can see, not the whole city; a posted listing is not a filled job."
    },
    {
      "q": "How much is the retail sales salary in Pune for freshers?",
      "a": "The median top of range is ₹3 lakh a year across the 35 jobs that state pay, and the middle half runs from ₹2.4 lakh to ₹4 lakh. 14.3% of stated salaries fall under ₹2 lakh, so check the fixed part before you accept."
    },
    {
      "q": "Does Pune have a retail sales internship for freshers?",
      "a": "Yes, 8 of the 87 listings are internships, and the Retail Bank Sales Executive Gl Internship title also has 8 listings, so most look like bank sales seats. None of the internships states a stipend in rupees. Ask about pay, and whether a job can follow, before you start."
    },
    {
      "q": "Is retail banking sales the same as store sales?",
      "a": "No. Store titles like Sales Associate (9) and Store Executive (7) sell products to walk-in shoppers. Relationship Manager titles tagged retail or retail banking (3 and 2) sell accounts and loans to individuals. Both reward clear talk, named in 62.2% of descriptions."
    },
    {
      "q": "Which day should I check Pune retail listings?",
      "a": "Saturday and Friday. In this data, Saturday carried 19 listings (21.8%) and Friday 18 (20.7%), while Sunday had 6. Check over the weekend and email on Monday."
    },
    {
      "q": "Do Pune retail employers post on their own websites?",
      "a": "Many do. Company career sites and ATS pages carried 41.4% of these listings, ahead of LinkedIn at 19.5% and Shine and Naukri at 16.1% each. That is where we found them, not a ranking; apply there, then email the manager."
    }
  ],
  "takeaway": {
    "sub": "Settle these before you apply in Pune.",
    "items": [
      [
        "Choose store or bank",
        "Store titles lead, but bank sales titles and the 8 internships pull retail toward branches."
      ],
      [
        "Expect about ₹3 lakh",
        "That is the median top of range across the 35 jobs that state pay."
      ],
      [
        "Check on Saturday",
        "Saturday carried 21.8% of listings, the most of any day."
      ],
      [
        "Use career sites, then email",
        "They carried 41.4% of listings; follow with a note to the store or branch manager."
      ],
      [
        "Get the stipend in writing",
        "None of the 8 internships states one."
      ]
    ]
  },
  "related": [
    {
      "slug": "retail-sales-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Retail Sales Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Retail Sales Jobs in Pune for Freshers",
    "description": "87 active entry-level and internship listings for India posted 1 to 15 November 2026 (retail sales in Pune), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-retail-sales-jobs-in-pune-for-freshers-2026" place="report-end" size="card" title={"Want to reach the Pune store or branch manager directly?"} line={"Start with one short call: tell Stu whether you want a store or a bank desk in Pune, and the pay you want. Stu finds who is hiring and writes the email, sent from your own inbox only once you start a campaign."} />
    </DataReport>
  );
}
