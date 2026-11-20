import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "data-science-internship-india-2026",
  "title": "Data Science Internship in India 2026: Python, ML and 130 Listings",
  "short": "Data Science Internship 2026",
  "description": "Data science internship in India: 130 listings in the Studojo Jobs Index, 95.3% name Python, 57.8% welcome freshers and only 2 state a stipend.",
  "keywords": "data science internship in india, data science intern, data science internship stipend, data science internship for freshers",
  "h1": "Data Science Internship in India:",
  "h1em": "Python, Models and Proof",
  "sub": "The Studojo Jobs Index has 130 data science internship listings posted 1 to 15 November 2026. Python and machine learning are each named in 95.3% of descriptions, 83.1% are marked remote, and only 2 state a stipend, both between ₹10,000 and ₹20,000 a month.",
  "published": "2026-11-20",
  "scope": "India · data science internship",
  "findings": [
    "**A data science internship in India** appears 130 times in the Studojo Jobs Index, and 92 of those (70.8%) use the exact title Data Science Intern.",
    "**Python and machine learning tie at the top**: each is named in 95.3% of described listings, with statistics at 85.9% and SQL at 52.3%.",
    "**Freshers are openly wanted**: 57.8% of described listings say so, against 25.1% across the whole index, and GitHub is named in 8.6%.",
    "**Only 2 of 130 state a stipend** (1.5%), with a median top of range of ₹14,208 a month, while 41.4% mention a certificate and 4.7% say unpaid.",
    "**The move that works** is an email to the data science or ML lead with a small notebook on GitHub. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "130",
      "label": "Data science internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "1.5%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "95.3%",
      "label": "Of listings with a full description ask for Python",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What is a data science internship called, and who posts it?",
      "sub": "Titles as posted, plus the day of the week each listing went up.",
      "paras": [
        "A data science internship in India is almost always posted as Data Science Intern: 92 of 130 listings (70.8%) use those exact words. Data Science Internship adds 15 (11.5%). Data Scientist Intern has 3, and so does a version that lists Python, Pandas, Statistics and Data Visualization in brackets. Everything else in the top ten is a one-off.",
        "The one-offs are telling. One is a corporate quality role, one mixes AI, ML and data science, and one reads like a tool list, with Flask, VS Code and Jupyter Notebook in the title. A title stuffed with tools is a hint that the team wants you useful in week one. Read those titles as a checklist of what to practise.",
        "Only 43 employers posted these 130 listings, and the ten busiest hold 71.5%, so a handful of employers post most of them. Sunday is the busiest posting day at 22.3%, with Thursday and Saturday at 16.9% each. Across the whole index, Sunday is the quietest day at 5.8%, so a Sunday evening check of the boards pays off here."
      ],
      "chart": {
        "id": "rdsii270Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, 1 to 15 Nov 2026, n=130)",
        "labels": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "values": [
          16,
          14,
          13,
          22,
          14,
          22,
          29
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
            "Data Science Intern",
            "92"
          ],
          [
            "Data Science Internship",
            "15"
          ],
          [
            "Data Scientist Intern",
            "3"
          ],
          [
            "Data Science Intern (Python, Pandas, Statistics, Data Visualization)",
            "3"
          ],
          [
            "Data Science Internship In Pune Hiring Now Aurangabad (India)",
            "1"
          ],
          [
            "Intern - Data Science (Corporate Quality)",
            "1"
          ],
          [
            "Internship - Ai / Ml / Data Science",
            "1"
          ],
          [
            "Data Science, Python, Machine Learning, Sql, Flask, Vs-Code, Jupyter Notebook",
            "1"
          ],
          [
            "Data Science & Machine Learning Intern (Thane)",
            "1"
          ],
          [
            "Data Science Intern (Python, Pandas, Statistics)",
            "1"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 43 different employers posted these listings, and 1.5% of listings do not name the employer."
      }
    },
    {
      "title": "What does a data science intern need to know?",
      "sub": "Keyword share across 128 listings with a full description.",
      "paras": [
        "Python and machine learning come first, each in 95.3% of the 128 described listings. Statistics follows at 85.9%. Across the whole index, Python appears in 3.5% and machine learning or generative AI in 2.4%, so this is a field where the listing tells you the stack outright. Treat those three as the entry fee.",
        "SQL is named in 52.3%, about half. Do not skip it because model work feels more exciting. An intern who can pull and join their own data needs less hand-holding than one who waits for a clean CSV, and that is exactly what a busy lead notices in the first week.",
        "Communication skills appear in 49.2%. Power BI and Tableau tie at 33.6%, and Excel is named in only 13.3%. Cloud appears in 3.1%, and Java and ChatGPT or AI tools in 2.3% each. Pick one visual tool for presenting results, and spend the rest of your time on Python, pandas and one solid model."
      ],
      "chart": {
        "id": "rdsii270Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (128 listings with a full description)",
        "labels": [
          "Python",
          "machine learning or generative AI",
          "statistics",
          "SQL",
          "communication skills",
          "Power BI",
          "Tableau",
          "Excel"
        ],
        "values": [
          95.3,
          95.3,
          85.9,
          52.3,
          49.2,
          33.6,
          33.6,
          13.3
        ],
        "unit": "%"
      }
    },
    {
      "title": "Is a data science internship for freshers?",
      "sub": "What 128 described listings say about who they want and what to show.",
      "paras": [
        "Yes, more openly than most fields. Freshers are named in 57.8% of described listings, more than double the 25.1% across the whole index. BTech, BE or computer science appears in 52.3%, and MBA or PGDM in 2.3%. No listing here names BCom or BBA, so the degree signal points to engineering and science backgrounds.",
        "Proof matters more than marks. A portfolio is asked for in 14.1% and GitHub in 8.6%, against 8.1% and 1.3% across the index. One GitHub link with a clean project answers both asks at once. Work from home is written into 8.6% of descriptions, and none mentions work from office or hybrid.",
        "A certificate is named in 41.4%, six times the index rate of 6.9%. Women candidates are named in 5.5% and a pre-placement offer (PPO) in 0.8%. A certificate is fine as a bonus, but it is not proof you can do the work. A hiring lead is more likely to open your repo than read your certificate."
      ],
      "chart": {
        "id": "rdsii270Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (128 listings with a full description)",
        "labels": [
          "freshers",
          "a certificate",
          "a portfolio",
          "work from home",
          "GitHub",
          "unpaid"
        ],
        "values": [
          57.8,
          41.4,
          14.1,
          8.6,
          8.6,
          4.7
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** GitHub appears in 8.6% of these listings, more than six times the index rate of 1.3%."
    },
    {
      "title": "What is the data science internship stipend, and where are the roles?",
      "sub": "Stated stipends, remote flags and the few cities named.",
      "paras": [
        "Almost no listing names a stipend. 2 of 130 data science internships state one in rupees (1.5%), and both fall in the ₹10,000 to 20,000 a month band, with a median top of ₹14,208. Unpaid is written into 4.7% of descriptions. Two numbers are not a market rate, so ask for the figure in writing.",
        "The index-wide internship median is ₹12,500 a month, across 246 internships that state a stipend. Use it as a loose reference, not a promise. If an offer says certificate and no stipend, ask how many hours a week it takes and whether you will touch real data, then decide if it is worth your time.",
        "Location matters little. 108 of 130 listings (83.1%) are marked remote and 107 name no city. Pune leads the named cities with 6, then Delhi, Hyderabad and Bengaluru with 3 each, and Mumbai and Noida with 2. LinkedIn carries 70.0% of the listings, company career sites 11.5%, Shine 10.8% and Internshala 7.7%."
      ],
      "table": {
        "head": [
          "City",
          "Listings",
          "Share of listings"
        ],
        "rows": [
          [
            "Pune",
            "6",
            "4.6%"
          ],
          [
            "Delhi",
            "3",
            "2.3%"
          ],
          [
            "Hyderabad",
            "3",
            "2.3%"
          ],
          [
            "Bengaluru",
            "3",
            "2.3%"
          ],
          [
            "Mumbai",
            "2",
            "1.5%"
          ],
          [
            "Noida",
            "2",
            "1.5%"
          ],
          [
            "Bhopal",
            "1",
            "0.8%"
          ],
          [
            "Ahmedabad",
            "1",
            "0.8%"
          ],
          [
            "Amravati",
            "1",
            "0.8%"
          ],
          [
            "Kozhikode",
            "1",
            "0.8%"
          ]
        ],
        "note": "A listing can name more than one city. 108 listings are marked remote and 107 name no city."
      },
      "callout": "**Lead:** 2 of 130 data science internships state a stipend. Ask before you accept."
    },
    {
      "title": "How do you get a data science internship?",
      "sub": "Send a notebook, not a certificate, to the person who runs the models.",
      "paras": [
        "Write to the data science lead, the ML engineering lead or, at an AI startup, the founder or CTO. These are the people who review notebooks and would pair with you. No description in this set carries an email address, so you will need to find the right person by name.",
        "Your proof: a public GitHub repo with one notebook. Pick a small public dataset, set a simple baseline, train one model that beats it, report one honest metric, and write a short README on what failed. Keep it to an evening's read. It answers the Python, statistics and machine learning asks in a single link.",
        "The email is three lines: who you are, what the model does and its result, and the role you want. Send one follow-up if a week passes in silence. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), so a short note to one person stands out. Stu can do the finding: it locates who is hiring, checks the work email and sends your note from your own inbox when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **130 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a data science internship when its job title matches that kind of role (the most common titles here: \"Data Science Intern\", \"Data Science Internship\", \"Data Scientist Intern\").",
    "Pay: 2 of 130 internships (1.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 128 listings (98.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many data science internships are open in India?",
      "a": "The Studojo Jobs Index has 130 data science internship listings posted 1 to 15 November 2026, from 43 employers. The ten busiest hold 71.5%, so fewer teams are hiring than the count suggests."
    },
    {
      "q": "What is the data science internship stipend in India?",
      "a": "It is rarely stated. Only 2 of 130 listings (1.5%) give a stipend, both between ₹10,000 and ₹20,000 a month, with a median top of ₹14,208. 4.7% of described listings say unpaid."
    },
    {
      "q": "Can a fresher get a data science internship?",
      "a": "Yes. 57.8% of described listings welcome freshers, more than double the index-wide 25.1%. BTech, BE or computer science is named in 52.3%."
    },
    {
      "q": "Which skills does a data science intern need?",
      "a": "Python and machine learning (95.3% each), then statistics (85.9%) and SQL (52.3%). Power BI and Tableau each appear in 33.6%."
    },
    {
      "q": "Are data science internships remote?",
      "a": "Mostly. 108 of 130 listings (83.1%) are marked remote. Of the named cities, Pune has the most, with 6."
    },
    {
      "q": "Should I add my GitHub to a data science internship application?",
      "a": "Yes. GitHub is named in 8.6% of described listings and a portfolio in 14.1%, both well above the index. One clean repo says more than a certificate, which 41.4% mention."
    }
  ],
  "takeaway": {
    "sub": "Five things to get right before you apply.",
    "items": [
      [
        "Lead with Python",
        "95.3% of described listings name it, tied with machine learning."
      ],
      [
        "Do not skip SQL",
        "It appears in 52.3%, so learn to pull your own data."
      ],
      [
        "Ship one repo",
        "GitHub (8.6%) and portfolio (14.1%) asks run well above the index."
      ],
      [
        "Ask the stipend",
        "Only 2 of 130 listings state one."
      ],
      [
        "Email the ML lead",
        "Send the notebook link and three lines."
      ]
    ]
  },
  "related": [
    {
      "slug": "data-scientist-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Data Scientist Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Data Science Internship 2026",
    "description": "130 active entry-level and internship listings for India posted 1 to 15 November 2026 (data science internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-data-science-internship-india-2026" place="report-end" size="card" title={"Want your notebook in front of a data science lead?"} line={"Tell Stu the internship, the city or remote, and the stipend you want. Stu finds who is hiring, verifies their work email and drafts a note on your real projects. Nothing is sent until you start a campaign."} />
    </DataReport>
  );
}
