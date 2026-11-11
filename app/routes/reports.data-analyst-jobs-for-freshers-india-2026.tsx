import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "data-analyst-jobs-for-freshers-india-2026",
  "title": "Data Analyst Jobs for Freshers in India: 831 Listings, 2026",
  "short": "Data Analyst Jobs for Freshers 2026",
  "description": "Data analyst jobs for freshers: 831 October listings in the Studojo Jobs Index. See titles, cities, stated pay, skills and how to get hired in India.",
  "keywords": "data analyst jobs for freshers, data analyst fresher salary, data analyst jobs in india 2026, how to get a data analyst job as a fresher, data analyst internship",
  "h1": "Data Analyst Jobs for Freshers in India:",
  "h1em": "What 831 Listings Show",
  "sub": "We track 831 data analyst jobs for freshers posted in October 2026, and 369 of them are internships. Excel shows up in 72.4% of descriptions, SQL in 53.8%. Only 123 jobs state a salary, and the median is ₹3 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · data analyst · freshers and interns",
  "findings": [
    "There are **831 data analyst jobs for freshers** in the Studojo Jobs Index for October 2026: 462 full-time entry-level jobs and 369 internships.",
    "**Excel is the entry ticket.** It appears in 72.4% of descriptions, ahead of SQL at 53.8% and Python at 41.9%.",
    "**Most listings hide the pay.** Only 123 of the 462 jobs state a salary in rupees (26.6%), the median top-of-range is ₹3 lakh a year, and just 2 of the 369 internships state a stipend.",
    "**Remote is common here.** 351 listings (42.2%) are marked remote, and 367 name no city at all, so your search should not stop at Mumbai and Bengaluru.",
    "**Email the analytics lead, not the portal.** Only 17 listings (2.1%) put an email address in the description, so send a small piece of real analysis to the person who runs the team."
  ],
  "stats": [
    {
      "num": "831",
      "label": "Data analyst listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 123 jobs that state it (26.6%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "72.4%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are data analyst jobs for freshers actually called?",
      "sub": "The title on the listing is rarely just Data Analyst.",
      "paras": [
        "The most common title is Data Analyst Intern, with 143 listings (17.2%). Second is MIS Executive with 113 (13.6%), and plain Data Analyst is third with 59 (7.1%). So the word analyst is only part of what you should search for.",
        "MIS Executive is a different kind of job from an analytics internship. It usually means reports, trackers and spreadsheet upkeep for a business team. It is still data work, and it is where many people start. Read the description before you decide it is beneath you.",
        "The list is spread across 422 different employers, and the top 10 account for 29.5% of listings. That is a fairly open field. Another 13 listings (1.6%) do not name the employer at all."
      ],
      "chart": {
        "id": "rdajffi0Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=831)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          462,
          369
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
            "Data Analyst Intern",
            "143"
          ],
          [
            "MIS Executive",
            "113"
          ],
          [
            "Data Analyst",
            "59"
          ],
          [
            "Business Analytics Intern",
            "43"
          ],
          [
            "Data Analytics Internship",
            "31"
          ],
          [
            "Data Analysis Trainee",
            "22"
          ],
          [
            "Business Analytics Internship",
            "12"
          ],
          [
            "Hiring MIS Executive-Ahmedabad Location",
            "10"
          ],
          [
            "Data Analyst Internship",
            "10"
          ],
          [
            "Drilling Data Analyst",
            "9"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 422 different employers posted these listings, and 1.6% of listings do not name the employer."
      },
      "callout": "**Search tip:** try Business Analytics Intern, Data Analysis Trainee and MIS Executive as well as Data Analyst. Together they add up to hundreds of listings."
    },
    {
      "title": "Where are data analyst jobs in India for freshers?",
      "sub": "Mumbai leads, but the real story is how many listings are remote or name no city.",
      "paras": [
        "Mumbai has the most data analyst listings with 75 (9.0%), then Bengaluru with 57 (6.9%), Gurugram with 49 (5.9%) and Hyderabad with 41 (4.9%). Pune follows with 33 and Chennai with 30. A listing can name more than one city.",
        "Look at the other columns before you plan a move. 351 listings are marked remote, which is 42.2% of the total, and 367 name no city. Those two groups are large enough that your location matters less than it does for most fresher roles.",
        "For an October snapshot, that is useful news if you are studying in a smaller town. You can build a portfolio and apply from where you are, and then decide on a city once a team has answered you."
      ],
      "chart": {
        "id": "rdajffi0Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=831)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Gurugram",
          "Hyderabad",
          "Pune",
          "Chennai",
          "Noida",
          "Delhi",
          "Kolkata",
          "Ahmedabad"
        ],
        "values": [
          75,
          57,
          49,
          41,
          33,
          30,
          24,
          23,
          19,
          18
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
            "75",
            "9.0%"
          ],
          [
            "Bengaluru",
            "57",
            "6.9%"
          ],
          [
            "Gurugram",
            "49",
            "5.9%"
          ],
          [
            "Hyderabad",
            "41",
            "4.9%"
          ],
          [
            "Pune",
            "33",
            "4.0%"
          ],
          [
            "Chennai",
            "30",
            "3.6%"
          ],
          [
            "Noida",
            "24",
            "2.9%"
          ],
          [
            "Delhi",
            "23",
            "2.8%"
          ],
          [
            "Kolkata",
            "19",
            "2.3%"
          ],
          [
            "Ahmedabad",
            "18",
            "2.2%"
          ]
        ],
        "note": "A listing can name more than one city. 351 listings are marked remote and 367 name no city."
      }
    },
    {
      "title": "What is a data analyst fresher salary in India?",
      "sub": "Pay is stated on a minority of listings, so treat these numbers as a floor of knowledge, not a rate card.",
      "paras": [
        "Only 123 of the 462 jobs state a salary in rupees (26.6%). For those, the top of the range has a median of ₹3 lakh a year. The middle half sits between ₹2.4 lakh and ₹4.5 lakh.",
        "The biggest band is ₹3 to 5 lakh with 52 listings, then ₹2 to 3 lakh with 40. Another 19 jobs state ₹5 to 8 lakh, 5 state ₹8 to 12 lakh and 1 states ₹12 to 20 lakh. At the bottom, 6 listings sit under ₹2 lakh.",
        "Internships are even quieter. Just 2 of 369 state a stipend (0.5%): one in the ₹10,000 to 20,000 band and one in the ₹20,000 to 40,000 band. Ask about stipend early, because the listing probably will not tell you."
      ],
      "chart": {
        "id": "rdajffi0Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (123 jobs that state pay in rupees)",
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
          40,
          52,
          19,
          5,
          1,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do data analyst fresher jobs ask for?",
      "sub": "Spreadsheets first, then SQL, then a visualisation tool.",
      "paras": [
        "Among the 807 listings with a full description, Excel appears in 72.4%. SQL is next at 53.8%, communication skills at 52.3%, Python at 41.9% and statistics at 38.3%. Power BI (36.2%) is mentioned more often than Tableau (27.8%).",
        "Machine learning or generative AI shows up in only 10.4%, and cloud tools in 4.5%. If you are choosing what to learn first, the data says to be solid at Excel and SQL before you spend a month on a model.",
        "The conditions matter too. 38.3% mention BTech, BE or computer science, 25.9% say freshers and 24.9% ask for a certificate. A portfolio is named in only 3.2%, which means a real project can set you apart."
      ],
      "chart": {
        "id": "rdajffi0Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (807 listings with a full description)",
        "labels": [
          "Excel",
          "SQL",
          "communication skills",
          "Python",
          "statistics",
          "Power BI",
          "Tableau",
          "English",
          "machine learning or generative AI",
          "social media"
        ],
        "values": [
          72.4,
          53.8,
          52.3,
          41.9,
          38.3,
          36.2,
          27.8,
          16.5,
          10.4,
          6.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a data analyst fresher?",
      "sub": "Send one small piece of analysis to the person who runs the data team.",
      "paras": [
        "Applying online is a weak bet. An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Only 17 of our 831 listings include an email address, so the door most people use is crowded.",
        "Email the analytics or BI lead, or the head of the team that posted the role. For a MIS Executive job, write to the operations or finance manager who uses the reports. Attach or link one real piece of work: a one-page analysis of a public dataset, a Power BI dashboard, or a SQL query that answers a real question.",
        "Keep the email to three lines: who you are, what you built and what you noticed in it, and one question about their team. Follow up once after a few days. Stu, the AI career agent from Studojo, finds the person who hires, verifies their work email and writes the note for you to send from your own inbox."
      ],
      "callout": "**Proof beats keywords:** a dashboard built on a dataset you cleaned yourself says more than a certificate line."
    }
  ],
  "method": [
    "This report counts **831 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as data analyst when its job title matches that role (the most common titles here: \"Data Analyst Intern\", \"MIS Executive\", \"Data Analyst\").",
    "Pay: 123 of 462 entry-level listings (26.6%) state a salary in rupees and 2 of 369 internships (0.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 807 listings (97.1%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many data analyst jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 831 data analyst listings for freshers posted in October 2026: 462 jobs and 369 internships. These are listings we track, not hires, and it is one month of data."
    },
    {
      "q": "What is the data analyst fresher salary in India?",
      "a": "Of 462 jobs, 123 state a salary in rupees, and the median top-of-range is ₹3 lakh a year. The middle half falls between ₹2.4 lakh and ₹4.5 lakh. Nearly three in four jobs do not state pay."
    },
    {
      "q": "Which skills do you need for a data analyst job as a fresher?",
      "a": "Excel (72.4% of listings with a full description) and SQL (53.8%) lead. Communication skills appear in 52.3%, Python in 41.9% and Power BI in 36.2%. Start with Excel and SQL."
    },
    {
      "q": "Are there data analyst internships for freshers?",
      "a": "Yes. 369 of the 831 listings are internships, which is 44.4%. Data Analyst Intern is the most common single title with 143 listings. Only 2 internships state a stipend, so ask before you accept."
    },
    {
      "q": "Can you get a data analyst job in India without a BTech?",
      "a": "Often, yes. 38.3% of full descriptions mention BTech, BE or computer science, but 8.3% mention BCom, 7.2% BBA and 3.5% say any graduate. Proof of skill matters in a role like this."
    },
    {
      "q": "Are data analyst jobs remote in India?",
      "a": "Many are marked remote. 351 of the 831 listings (42.2%) carry the remote flag, and 11.9% of full descriptions mention work from home. Check each listing, because some remote roles still need office days."
    }
  ],
  "takeaway": {
    "sub": "What the 831 October listings say, in five lines.",
    "items": [
      [
        "Learn Excel and SQL first",
        "They sit in 72.4% and 53.8% of descriptions, well ahead of machine learning at 10.4%."
      ],
      [
        "Search more than one title",
        "Data Analyst Intern, MIS Executive and Business Analytics Intern all count."
      ],
      [
        "Do not rule out remote",
        "351 listings are marked remote and 367 name no city."
      ],
      [
        "Ask about pay",
        "Only 123 jobs and 2 internships state it."
      ],
      [
        "Send real work to a person",
        "One small analysis, emailed to the analytics lead, beats another portal application."
      ]
    ]
  },
  "related": [
    {
      "slug": "business-analyst-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Business Analyst Jobs for Freshers 2026"
    },
    {
      "slug": "machine-learning-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "AI and ML Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Data Analyst Jobs for Freshers 2026",
    "description": "831 active entry-level and internship listings for India posted in October 2026 (data analyst), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-data-analyst-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the analytics lead directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the person who hires, verifies their work email, and nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
