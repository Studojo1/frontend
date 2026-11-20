import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "data-analyst-internship-india-2026",
  "title": "Data Analyst Internship in India: 288 Listings, Almost No Stipends",
  "short": "Data Analyst Internship 2026",
  "description": "Data analyst internship in India: 288 listings in the Studojo Jobs Index, 85.8% marked remote, 92.0% name SQL, and only 1 states a stipend.",
  "keywords": "data analyst internship in india, data analytics internship, business analytics internship, data analyst internship stipend",
  "h1": "Data Analyst Internship in India:",
  "h1em": "Excel, SQL and Silent Stipends",
  "sub": "The Studojo Jobs Index has 288 data analyst internship listings posted 1 to 15 November 2026. 85.8% are marked remote, Excel and SQL are named in 95.1% and 92.0% of descriptions, and just 1 of 288 states a stipend.",
  "published": "2026-11-20",
  "scope": "India · data analyst internship",
  "findings": [
    "**A data analyst internship in India** shows up 288 times in the Studojo Jobs Index, and Data Analyst Intern alone is the title on 147 of them (51.0%).",
    "**A handful of employers post most of these**: 68 employers posted all 288, and the ten busiest hold 73.3%, against 13.0% across the whole index.",
    "**Excel and SQL are the floor**: 95.1% of described listings name Excel and 92.0% name SQL, with Python at 68.5% and statistics at 63.6%.",
    "**The stipend is almost never written down**: 1 of 288 listings (0.3%) states one, while 56.3% mention a certificate and 6.3% say unpaid.",
    "**The move that works** is a short email to the analytics or BI lead with one small analysis you built. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "288",
      "label": "Data analyst internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "0.3%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "95.1%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Data analyst or business analytics intern: what are these internships called?",
      "sub": "The ten most common titles as posted, across 288 listings.",
      "paras": [
        "A data analyst internship in India usually carries one plain title. Data Analyst Intern covers 147 of 288 listings (51.0%). Business Analytics Intern is next with 61 (21.2%), then Data Analytics Internship with 15, Data Analyst with 12 and Data Analyst Internship with 8. Business Analytics Internship adds 5 more. That is almost the whole pool in six names.",
        "Search for business analytics and data analytics as well as data analyst, or you will miss more than a quarter of the openings. A few titles put the skills in brackets, like Data Analyst Intern (Excel, Sql, Power Bi, Data Cleaning) with 4 listings. One mixes in accounts: Account / Mis Executive Intern, also with 4, which adds Tally and reconciliation to the usual Excel.",
        "This is a concentrated pool. 68 employers posted all 288 listings, and the ten busiest hold 73.3% of them. Across the whole index, the top ten hold 13.0%. When a few names post dozens of near-identical internships, each listing may be closer to a batch intake than a single seat on a team, so read what the work actually is before you apply."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Data Analyst Intern",
            "147"
          ],
          [
            "Business Analytics Intern",
            "61"
          ],
          [
            "Data Analytics Internship",
            "15"
          ],
          [
            "Data Analyst",
            "12"
          ],
          [
            "Data Analyst Internship",
            "8"
          ],
          [
            "Business Analytics Internship",
            "5"
          ],
          [
            "Account / Mis Executive Intern (Advanced Excel, Tally, Mis Reports, Reconciliation)",
            "4"
          ],
          [
            "Data Analyst Intern (Excel, Sql, Power Bi, Data Cleaning)",
            "4"
          ],
          [
            "Data Analysis Trainee",
            "3"
          ],
          [
            "Data Analyst Intern (Excel, Sql, Power Bi)",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 68 different employers posted these listings, and 0.7% of listings do not name the employer."
      }
    },
    {
      "title": "Is a data analyst internship remote, and which cities have one?",
      "sub": "Named cities, remote flags and where the listings were found.",
      "paras": [
        "Most of these internships have no city at all. 247 of 288 are marked remote (85.8%), against 6.5% across the whole index, and 256 name no city. Of those that do, Mumbai has 6, Hyderabad 5, Delhi and Bengaluru 4 each, and Gurugram 3. Pune and Chennai have 2 each, and Nagpur, Dwarka and Turbhe 1 each.",
        "So the city chart is tiny for a reason. A remote analytics internship can be done from Nagpur or Kochi as easily as from Bengaluru. That widens the pool you compete with, and it puts more weight on proof you can show on a screen: a query, a dashboard, a short written finding that someone can check in a minute.",
        "Work from home is written into 19.6% of descriptions, work from office into 1.4% and hybrid into 0.7%. LinkedIn carries 81.2% of these listings, Internshala 7.6% and company career sites 6.6%. Saturday (22.6%) and Sunday (18.1%) are the busiest posting days here, while across the whole index they are the quietest, at 9.2% and 5.8%."
      ],
      "chart": {
        "id": "rdaii269Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=288)",
        "labels": [
          "Mumbai",
          "Hyderabad",
          "Delhi",
          "Bengaluru",
          "Gurugram",
          "Pune",
          "Chennai",
          "Dwarka",
          "Nagpur",
          "Turbhe"
        ],
        "values": [
          6,
          5,
          4,
          4,
          3,
          2,
          2,
          1,
          1,
          1
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "City",
          "Listings",
          "Share of listings"
        ],
        "rows": [
          [
            "Mumbai",
            "6",
            "2.1%"
          ],
          [
            "Hyderabad",
            "5",
            "1.7%"
          ],
          [
            "Delhi",
            "4",
            "1.4%"
          ],
          [
            "Bengaluru",
            "4",
            "1.4%"
          ],
          [
            "Gurugram",
            "3",
            "1.0%"
          ],
          [
            "Pune",
            "2",
            "0.7%"
          ],
          [
            "Chennai",
            "2",
            "0.7%"
          ],
          [
            "Dwarka",
            "1",
            "0.3%"
          ],
          [
            "Nagpur",
            "1",
            "0.3%"
          ],
          [
            "Turbhe",
            "1",
            "0.3%"
          ]
        ],
        "note": "A listing can name more than one city. 247 listings are marked remote and 256 name no city."
      }
    },
    {
      "title": "What is the data analyst internship stipend?",
      "sub": "What 286 described listings say about pay, certificates and degrees.",
      "paras": [
        "Almost none say. Only 1 of 288 data analyst internships states a stipend in rupees, which is 0.3%. That one listing tops out at ₹25,000 a month. One number is not a market rate, so do not quote it in a negotiation. Across all internships in the index, 2.1% state a stipend, with a median of ₹12,500 a month.",
        "Unpaid is written into 6.3% of described listings, and a registration, training or deposit fee into 0.3%. A certificate is named in 56.3%, more than eight times the index rate of 6.9%. A pre-placement offer (PPO) appears in 0.3%. When the certificate is the headline and the stipend is missing, ask what data you will work on, who reviews your work, and what you are paid.",
        "On degrees, BTech, BE or computer science is named in 71.7%, BCom in 18.5% and BBA in 18.5%. MBA or PGDM appears in 5.2%. Freshers are welcomed in 31.8%, above the index-wide 25.1%, and women candidates in 6.3%. Commerce and management graduates are clearly in the frame for analytics, not only engineers."
      ],
      "chart": {
        "id": "rdaii269Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (286 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "work from home",
          "unpaid",
          "incentives",
          "a portfolio"
        ],
        "values": [
          56.3,
          31.8,
          19.6,
          6.3,
          4.2,
          2.8
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** 1 of 288 listings states a stipend and 6.3% say unpaid. Get the number in writing before you start."
    },
    {
      "title": "Which skills do you need for a data analytics internship?",
      "sub": "Keyword share across 286 listings with a full description.",
      "paras": [
        "Excel and SQL, almost without exception. Excel is named in 95.1% of the 286 described listings and SQL in 92.0%. Across the whole index, SQL appears in just 2.5%. If you can join two tables, group by a column and filter by date without looking anything up, you clear the most common bar in this pool.",
        "Python is named in 68.5% and statistics in 63.6%. You do not need machine learning, which appears in only 5.9%. You need to clean a messy column, read a mean against a median and explain why a number moved. Communication skills appear in 70.3%, because an analyst's work ends in a sentence someone else acts on.",
        "For dashboards, Power BI (44.8%) edges Tableau (40.2%). Pick one and build a single clean report rather than half-learning both. ChatGPT or AI tools show up in 8.7%, English in 4.5% and cloud in 2.1%. A recruiter's first resume scan lasts about 6 to 7 seconds (Ladders eye-tracking study, 2018), so put SQL and your dashboard tool near the top."
      ],
      "chart": {
        "id": "rdaii269Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (286 listings with a full description)",
        "labels": [
          "Excel",
          "SQL",
          "communication skills",
          "Python",
          "statistics",
          "Power BI",
          "Tableau",
          "ChatGPT or AI tools",
          "machine learning or generative AI",
          "English"
        ],
        "values": [
          95.1,
          92.0,
          70.3,
          68.5,
          63.6,
          44.8,
          40.2,
          8.7,
          5.9,
          4.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get a data analyst internship?",
      "sub": "Send one real analysis to the person who reads the dashboards.",
      "paras": [
        "Email the analytics or BI lead, the head of data, or at a startup the founder or the growth lead who lives in the numbers. In this set, no description carries an email address, so you will not find one by reading the post. Look for the person who owns reporting at the company and write to them by name.",
        "Your proof is one small analysis. Take a public dataset close to their business, write a few SQL queries, and build one Power BI or Excel dashboard page. Add a short note: the question, what you found, one chart, one caveat and what you would check next. A link or a short PDF is enough.",
        "The email is three lines: who you are, the one finding from your analysis, and a request to intern on their team. Follow up once after about a week. Stu handles the slow parts: it finds who hires, verifies the work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **288 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a data analyst internship when its job title matches that kind of role (the most common titles here: \"Data Analyst Intern\", \"Business Analytics Intern\", \"Data Analytics Internship\").",
    "Pay: 1 of 288 internships (0.3%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 286 listings (99.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many data analyst internships are there in India?",
      "a": "The Studojo Jobs Index has 288 data analyst internship listings posted 1 to 15 November 2026, from 68 employers. The ten busiest employers hold 73.3% of them. Listings count openings, not hires."
    },
    {
      "q": "What is the data analyst internship stipend in India?",
      "a": "Almost no listing says. Only 1 of 288 (0.3%) states a stipend, topping out at ₹25,000 a month, and 6.3% of described listings say unpaid. Ask before you accept."
    },
    {
      "q": "Is a business analytics internship different from a data analyst internship?",
      "a": "The title changes more than the toolkit. Business Analytics Intern has 61 listings next to 147 for Data Analyst Intern. Across this pool, Excel (95.1%) and SQL (92.0%) lead either way, so search both titles."
    },
    {
      "q": "Can I do a data analyst internship from home?",
      "a": "Yes, most are remote. 247 of 288 listings (85.8%) are marked remote and 19.6% of described listings mention work from home. Only 1.4% mention work from office."
    },
    {
      "q": "Can I get a data analytics internship with a BCom or BBA?",
      "a": "Yes. BCom and BBA are each named in 18.5% of described listings, next to BTech, BE or computer science at 71.7%. Strong Excel and SQL count for more than the degree line."
    },
    {
      "q": "Do I need Python for a data analyst internship?",
      "a": "It helps. Python is named in 68.5% of described listings, behind Excel (95.1%) and SQL (92.0%). Machine learning appears in only 5.9%, so basic Python for cleaning data is enough to start."
    }
  ],
  "takeaway": {
    "sub": "Five points before you apply for a data analyst internship.",
    "items": [
      [
        "Get solid at SQL",
        "92.0% of described listings name SQL, next to Excel at 95.1%."
      ],
      [
        "Search three titles",
        "Data analyst, data analytics and business analytics all appear."
      ],
      [
        "Ask the stipend",
        "Only 1 of 288 listings states one."
      ],
      [
        "Weigh the certificate",
        "56.3% mention a certificate, so ask what real data you will touch."
      ],
      [
        "Write to the BI lead",
        "Send one small analysis and a three-line email."
      ]
    ]
  },
  "related": [
    {
      "slug": "data-analyst-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Data Analyst Jobs for Freshers 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Data Analyst Internship 2026",
    "description": "288 active entry-level and internship listings for India posted 1 to 15 November 2026 (data analyst internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-data-analyst-internship-india-2026" place="report-end" size="card" title={"Want to email the analytics lead instead of applying cold?"} line={"Tell Stu you want a data analyst internship and the stipend you need. Stu finds the person who runs analytics, verifies the work email and writes a short note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
