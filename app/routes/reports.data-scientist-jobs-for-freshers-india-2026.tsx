import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "data-scientist-jobs-for-freshers-india-2026",
  "title": "Data Scientist Jobs for Freshers in India: 332 Listings, 2026",
  "short": "Data Scientist Jobs for Freshers 2026",
  "description": "Data scientist jobs for freshers in India: 332 October listings, 46.4% internships, statistics in 70.9% of descriptions, and few that state pay.",
  "keywords": "data scientist jobs for freshers, data scientist fresher salary, data scientist jobs in india 2026, how to get a data scientist job as a fresher, data scientist internship",
  "h1": "Data Scientist Jobs for Freshers in India:",
  "h1em": "What 332 Listings Show",
  "sub": "We tracked 332 data scientist jobs for freshers posted in October 2026. 154 are internships (46.4%) and 116 are marked remote (34.9%). Python is in 91.3% of descriptions and statistics in 70.9%, but only 6 jobs state pay.",
  "published": "2026-11-11",
  "scope": "India · data scientist · freshers and interns",
  "findings": [
    "There are **332 data scientist jobs for freshers** in the Studojo Jobs Index for October 2026, and 154 of them (46.4%) are internships. Only 178 are full-time jobs.",
    "**Data Science Intern is the biggest title.** It has 85 listings (25.6%), against 35 for Data Scientist (10.5%), so most fresher entry points are internships.",
    "**The skill bar is high and specific.** Of 309 described listings, 282 mention Python (91.3%), 219 statistics (70.9%) and 187 SQL (60.5%).",
    "**Pay data is almost absent.** Only 6 jobs (3.4%) state pay, with a median of ₹10.8 lakh a year, and 1 internship states ₹16,667 a month. Treat both as anecdotes.",
    "**Email the head of data science with one analysis.** Send a notebook that answers a real question, and follow up once. Stu finds the person and drafts the email."
  ],
  "stats": [
    {
      "num": "332",
      "label": "Data scientist listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "3.4%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "91.3%",
      "label": "Of listings with a full description ask for Python",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are data scientist fresher jobs called?",
      "sub": "Intern titles lead, and a few listings are teaching roles.",
      "paras": [
        "Data Science Intern is the top title with 85 of 332 listings (25.6%). Data Science Internship has 22. For full-time work, Data Scientist has 35 (10.5%), Data Scientist I has 9 and Associate Data Scientist has 9. Analyst titles with Data Science in them add a handful more.",
        "Data Science Trainer has 11 listings (3.3%). These are teaching and curriculum roles, not model-building jobs. If your aim is a modelling role, skip them. If you like explaining, they can be a way to get paid while you build a portfolio.",
        "180 different employers posted these listings, and the top ten account for 31.6%, a higher concentration than for engineering roles. About 4.5% hide the employer. A small number of companies post many internships, so a direct note to the data lead matters."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Data Science Intern",
            "85"
          ],
          [
            "Data Scientist",
            "35"
          ],
          [
            "Data Science Internship",
            "22"
          ],
          [
            "Data Science Trainer",
            "11"
          ],
          [
            "Data Scientist I",
            "9"
          ],
          [
            "Associate Data Scientist",
            "9"
          ],
          [
            "Analyst-Data Science",
            "5"
          ],
          [
            "Data Science Engineer Codoid",
            "5"
          ],
          [
            "Analyst - Data Science",
            "4"
          ],
          [
            "Engr Iii Cslt-Data Science",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 180 different employers posted these listings, and 4.5% of listings do not name the employer."
      }
    },
    {
      "title": "Where are data scientist jobs in India?",
      "sub": "Bengaluru leads, and a large share of listings name no city.",
      "paras": [
        "Bengaluru has 46 listings (13.9%), Hyderabad 29 (8.7%), Gurugram 23 (6.9%) and Pune 21 (6.3%). Mumbai has 14, Chennai and Noida 13 each. Gurugram ranking above Mumbai is a small surprise, since Mumbai leads the whole index.",
        "133 listings name no city, and 116 (34.9%) are marked remote. A listing can name more than one city, so shares do not add up. For data work, a laptop is often enough, so a student in Indore or Kochi can compete on the same listings as one in Bengaluru.",
        "Remote does not mean easy. If 116 remote listings draw applicants from everywhere, the queue is longer, not shorter. Hybrid is named in 23 listings (7.4%) and work from home in 31 (10.0%). Writing to the person who runs the team is how you stand out from the pile."
      ],
      "chart": {
        "id": "rdsjffi36Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=332)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Gurugram",
          "Pune",
          "Mumbai",
          "Chennai",
          "Noida",
          "Ahmedabad",
          "Delhi",
          "Kochi"
        ],
        "values": [
          46,
          29,
          23,
          21,
          14,
          13,
          13,
          7,
          7,
          4
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
            "Bengaluru",
            "46",
            "13.9%"
          ],
          [
            "Hyderabad",
            "29",
            "8.7%"
          ],
          [
            "Gurugram",
            "23",
            "6.9%"
          ],
          [
            "Pune",
            "21",
            "6.3%"
          ],
          [
            "Mumbai",
            "14",
            "4.2%"
          ],
          [
            "Chennai",
            "13",
            "3.9%"
          ],
          [
            "Noida",
            "13",
            "3.9%"
          ],
          [
            "Ahmedabad",
            "7",
            "2.1%"
          ],
          [
            "Delhi",
            "7",
            "2.1%"
          ],
          [
            "Kochi",
            "4",
            "1.2%"
          ]
        ],
        "note": "A listing can name more than one city. 116 listings are marked remote and 133 name no city."
      }
    },
    {
      "title": "Is data science mostly internships, and what does it pay?",
      "sub": "Nearly half are internships, and pay is rarely stated.",
      "paras": [
        "Of 332 listings, 178 are jobs and 154 are internships (46.4%). Across the whole index, internships are 10.8% of listings, so data science leans much harder towards internships than most roles. As a fresher, an internship is the normal first step.",
        "Pay is the honest gap. Only 6 of 178 jobs (3.4%) state pay in rupees. Their median is ₹10.8 lakh a year, but six listings cannot describe a market, and two of them reach ₹20 lakh or more. One sits at ₹3 to 5 lakh and two at ₹5 to 8 lakh.",
        "Only 1 of 154 internships states a stipend, at ₹16,667 a month. Do not build a salary expectation from these numbers. Ask the hiring lead for the range early, and weigh the work you will do and who you will learn from. That tells you more than one stated figure can."
      ],
      "chart": {
        "id": "rdsjffi36Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=332)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          178,
          154
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do data scientist fresher listings ask for?",
      "sub": "Python, machine learning, statistics and SQL are close to a standard kit.",
      "paras": [
        "Of 309 listings with a full description, 282 (91.3%) mention Python and 266 (86.1%) mention machine learning or generative AI. Statistics appears in 219 (70.9%) and SQL in 187 (60.5%). Communication skills appear in 157 (50.8%), so explaining results counts as a skill.",
        "BI tools matter more here than in pure ML roles. Power BI appears in 120 listings (38.8%) and Tableau in 105 (34.0%). Cloud appears in 63 (20.4%) and Excel in 41 (13.3%). If you have only built models, add one dashboard to your work.",
        "On conditions, 144 listings (46.6%) mention a BTech, BE or computer science degree, 92 (29.8%) say freshers and 55 (17.8%) mention a certificate. A portfolio appears in 33 (10.7%) and GitHub in 14 (4.5%). Employers want to see your analysis, not just a course certificate."
      ],
      "chart": {
        "id": "rdsjffi36Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (309 listings with a full description)",
        "labels": [
          "Python",
          "machine learning or generative AI",
          "statistics",
          "SQL",
          "communication skills",
          "Power BI",
          "Tableau",
          "cloud (AWS, Azure, GCP)",
          "Excel",
          "English"
        ],
        "values": [
          91.3,
          86.1,
          70.9,
          60.5,
          50.8,
          38.8,
          34.0,
          20.4,
          13.3,
          6.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a data scientist fresher?",
      "sub": "Show an analysis that answers a real question.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). LinkedIn carries 46.1% of these listings, and only 10 listings (3.2%) put an email in the description. Find the head of data science, the analytics lead or the founder of a small team.",
        "Send one analysis. Pick a public dataset, ask one clear question, and show the SQL, the model or chart and a short note on what you would do next. Put it on GitHub or share it as a notebook link. A single clean project beats a list of courses.",
        "Keep the email to three lines: who you are, the link, and a question about whether the team takes interns or a junior data scientist. Follow up once. Thursday is the busiest posting day at 24.4%, so write on Monday or Tuesday. Stu finds the right lead, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **332 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as data scientist when its job title matches that role (the most common titles here: \"Data Science Intern\", \"Data Scientist\", \"Data Science Internship\").",
    "Pay: 6 of 178 entry-level listings (3.4%) state a salary in rupees and 1 of 154 internships (0.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 309 listings (93.1%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best data scientist jobs for freshers?",
      "a": "Data Science Intern is the most common title, with 85 of 332 October listings. For full-time roles, Data Scientist has 35 listings and Associate Data Scientist 9. Data Science Trainer roles (11) are teaching jobs."
    },
    {
      "q": "What is a data scientist fresher salary in India?",
      "a": "Only 6 jobs state pay, with a median of ₹10.8 lakh a year, so no reliable fresher figure comes from these listings. One internship states ₹16,667 a month. Ask for the range during the conversation."
    },
    {
      "q": "Can I get a data scientist job as a fresher without experience?",
      "a": "Yes, through internships first. 154 of 332 listings (46.4%) are internships, and 92 of 309 described listings (29.8%) mention freshers. A public analysis helps more than a certificate."
    },
    {
      "q": "Which skills do I need for data scientist jobs in India?",
      "a": "Python (91.3% of described listings), machine learning (86.1%), statistics (70.9%) and SQL (60.5%) come first. Power BI appears in 38.8% and Tableau in 34.0%."
    },
    {
      "q": "Is a data scientist internship worth applying for?",
      "a": "It is the main route in. There are 154 internships in the October listings. Only one states a stipend, at ₹16,667 a month, so ask about pay and who will review your work."
    },
    {
      "q": "How do I get a data scientist job as a fresher?",
      "a": "Email the head of data science or analytics lead with one notebook that answers a real question. Three lines, one follow-up. That works better than adding to about 242 applications per opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 332 October listings.",
    "items": [
      [
        "Internships come first",
        "154 listings, 46.4% of the total, are internships."
      ],
      [
        "Statistics is not optional",
        "It appears in 70.9% of described listings."
      ],
      [
        "Learn one BI tool",
        "Power BI appears in 38.8% and Tableau in 34.0%."
      ],
      [
        "Pay is a blank",
        "Only 6 jobs state pay, so ask."
      ],
      [
        "Send one analysis",
        "A single clean notebook beats a list of courses."
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
      "slug": "business-analyst-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Business Analyst Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Data Scientist Jobs for Freshers 2026",
    "description": "332 active entry-level and internship listings for India posted in October 2026 (data scientist), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-data-scientist-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Who leads data science where you want to work?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
