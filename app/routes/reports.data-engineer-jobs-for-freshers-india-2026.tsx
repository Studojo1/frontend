import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "data-engineer-jobs-for-freshers-india-2026",
  "title": "Data Engineer Jobs for Freshers in India: 236 Listings, 2026",
  "short": "Data Engineer Jobs for Freshers 2026",
  "description": "Data engineer jobs for freshers in India: 236 October listings, 22.9% in Bengaluru, cloud in 63.3% of descriptions, median stated pay ₹4.8 lakh.",
  "keywords": "data engineer jobs for freshers, data engineer fresher salary, data engineer jobs in india 2026, how to get a data engineer job as a fresher, data engineer internship",
  "h1": "Data Engineer Jobs for Freshers in India:",
  "h1em": "What 236 Listings Show",
  "sub": "We tracked 236 data engineer jobs for freshers posted in October 2026. 213 are full-time jobs and Bengaluru has 22.9% of them. Python, SQL and cloud lead the skills, and the median stated salary is ₹4.8 lakh a year from 19 listings.",
  "published": "2026-11-11",
  "scope": "India · data engineer · freshers and interns",
  "findings": [
    "There are **236 data engineer jobs for freshers** in the Studojo Jobs Index for October 2026. 213 are jobs and 23 are internships (9.7%), so this is a job-first role.",
    "**Bengaluru has the biggest share.** It has 54 listings (22.9%), then Mumbai at 37 (15.7%) and Chennai at 31 (13.1%).",
    "**Cloud sits beside SQL and Python.** Of 210 described listings, 149 mention Python (71.0%), 145 SQL (69.0%) and 133 cloud (63.3%).",
    "**Pay is stated in only 19 jobs (8.9%).** The median stated salary is ₹4.8 lakh a year, and 10 of the 19 sit in the ₹3 to 5 lakh band.",
    "**Email the data platform lead with one pipeline.** Send a small, working pipeline and follow up once. Stu finds the person and drafts the email from your real work."
  ],
  "stats": [
    {
      "num": "236",
      "label": "Data engineer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "8.9%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "71.0%",
      "label": "Of listings with a full description ask for Python",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are data engineer fresher jobs called?",
      "sub": "Data Engineer leads, and ETL and Azure titles follow.",
      "paras": [
        "Data Engineer is the top title with 42 of 236 listings (17.8%). Associate Data Engineer has 18 (7.6%), Azure Data Engineer 4 and Junior Data Engineer 4. Four more are internships titled as Data Engineering. The cloud name in the Azure title shows how often the stack is part of the job name.",
        "Some titles are not what they seem. ETL Automation Gig has 11 listings (4.7%), which describes pipeline work on a short engagement, and a digital associate title for data engineering services has 9. Read the description for the stack and the contract type before you apply.",
        "141 different employers posted these listings. The top ten account for 27.5%, and 7.2% hide the employer. Much of the hiring comes from services and analytics firms, so the person to reach is the delivery or data platform lead, not a generic recruiter."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Data Engineer",
            "42"
          ],
          [
            "Associate Data Engineer",
            "18"
          ],
          [
            "Etl-Automation-Gig",
            "11"
          ],
          [
            "Digital Associate, Ring Data Engineering Services",
            "9"
          ],
          [
            "Azure Data Engineer",
            "4"
          ],
          [
            "Junior Data Engineer",
            "4"
          ],
          [
            "Intern (Bach) Data Engineering",
            "4"
          ],
          [
            "Associate Data Engineer (Data Intelligence)",
            "3"
          ],
          [
            "Associate - Data Engineer",
            "3"
          ],
          [
            "Associate Data Engineer - R01571250",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 141 different employers posted these listings, and 7.2% of listings do not name the employer."
      }
    },
    {
      "title": "Where are data engineer jobs in India?",
      "sub": "Bengaluru has almost a quarter, and the hub cities follow.",
      "paras": [
        "Bengaluru has 54 listings (22.9%), Mumbai 37 (15.7%), Chennai 31 (13.1%), Hyderabad 22 (9.3%), Pune 21 (8.9%) and Gurugram 20 (8.5%). Noida has 12 and Delhi 5. Mumbai and Chennai ranking second and third makes sense for firms with large data estates, such as banks and services companies.",
        "Only 14 listings name no city and 5 (2.1%) are marked remote. That is very different from data science, where about a third are remote. Data engineering here is largely office-based or hybrid. 21 listings (10.0%) mention hybrid.",
        "A listing can name more than one city. If you are outside these hubs, expect to relocate or to find a hybrid role in one of them. Indore and Ahmedabad appear with 3 listings each, which is a start but not a market."
      ],
      "chart": {
        "id": "rdejffi37Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=236)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Chennai",
          "Hyderabad",
          "Pune",
          "Gurugram",
          "Noida",
          "Delhi",
          "Ahmedabad",
          "Indore"
        ],
        "values": [
          54,
          37,
          31,
          22,
          21,
          20,
          12,
          5,
          3,
          3
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
            "54",
            "22.9%"
          ],
          [
            "Mumbai",
            "37",
            "15.7%"
          ],
          [
            "Chennai",
            "31",
            "13.1%"
          ],
          [
            "Hyderabad",
            "22",
            "9.3%"
          ],
          [
            "Pune",
            "21",
            "8.9%"
          ],
          [
            "Gurugram",
            "20",
            "8.5%"
          ],
          [
            "Noida",
            "12",
            "5.1%"
          ],
          [
            "Delhi",
            "5",
            "2.1%"
          ],
          [
            "Ahmedabad",
            "3",
            "1.3%"
          ],
          [
            "Indore",
            "3",
            "1.3%"
          ]
        ],
        "note": "A listing can name more than one city. 5 listings are marked remote and 14 name no city."
      }
    },
    {
      "title": "What is a data engineer fresher salary, and what are the terms?",
      "sub": "Stated pay centres on ₹3 to 5 lakh, with a handful higher.",
      "paras": [
        "Of 213 jobs, 19 (8.9%) state pay in rupees. The median stated salary, using the top of each range, is ₹4.8 lakh a year, with a middle range from ₹3.8 lakh to ₹7 lakh. That is a very small base, so use it only as a rough guide.",
        "10 of the 19 (52.6%) sit in the ₹3 to 5 lakh band and 6 (31.6%) in ₹5 to 8 lakh. One reaches ₹8 to 12 lakh and 2 reach ₹12 to 20 lakh. No internship states a stipend, so ask the hiring lead what the stipend is.",
        "Conditions: of 210 described listings, 68 (32.4%) mention a BTech, BE or computer science degree and 24 (11.4%) say freshers. 27 (12.9%) mention targets, which likely points to sales-adjacent or services roles tagged as data work. Read those carefully. A certificate appears in 11 and GitHub in 11."
      ],
      "chart": {
        "id": "rdejffi37Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (210 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "hybrid",
          "a portfolio",
          "a certificate",
          "GitHub",
          "work from home",
          "incentives"
        ],
        "values": [
          12.9,
          11.4,
          10.0,
          6.2,
          5.2,
          5.2,
          4.3,
          2.4
        ],
        "unit": "%"
      }
    },
    {
      "title": "What skills do data engineer fresher listings ask for?",
      "sub": "SQL, Python and a cloud platform are the core three.",
      "paras": [
        "Python appears in 149 of 210 described listings (71.0%), SQL in 145 (69.0%) and cloud in 133 (63.3%). Machine learning or generative AI appears in 64 (30.5%), Power BI in 37 (17.6%) and Excel in 31 (14.8%). Java appears in 23 (11.0%).",
        "Cloud at 63.3% is the number to act on. Our keyword list groups AWS, Azure and GCP, so we cannot say which one, but a fresher who has built something on one of them stands out. Communication skills appear in 77 (36.7%), lower than in sales or support roles.",
        "ChatGPT or AI tools are named in 18 listings (8.6%). Employers are starting to mention them, but they do not replace SQL. If you have to choose how to spend a month, spend it on SQL joins, a small warehouse and one pipeline that runs on a schedule."
      ],
      "chart": {
        "id": "rdejffi37Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (210 listings with a full description)",
        "labels": [
          "Python",
          "SQL",
          "cloud (AWS, Azure, GCP)",
          "communication skills",
          "machine learning or generative AI",
          "Power BI",
          "Excel",
          "English",
          "Java",
          "ChatGPT or AI tools"
        ],
        "values": [
          71.0,
          69.0,
          63.3,
          36.7,
          30.5,
          17.6,
          14.8,
          13.8,
          11.0,
          8.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a data engineer fresher?",
      "sub": "Show a pipeline that runs, not a certificate.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Only 3 listings (1.4%) put an email in the description, so you will have to find the person. Look for the data platform lead, the engineering manager for data, or the head of analytics.",
        "Send one small, working pipeline. Pull data from a public API, clean it with Python and SQL, load it into a database on a schedule, and write a short readme on what breaks. A diagram and a repo link are enough. Say which cloud service you used.",
        "Keep the email to three lines: who you are, the link, and a question about whether the team takes junior engineers or interns. Follow up once. Friday carries 22.5% of postings and Thursday 21.2%, so write early in the week. Stu finds the right lead, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **236 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as data engineer when its job title matches that role (the most common titles here: \"Data Engineer\", \"Associate Data Engineer\", \"Etl-Automation-Gig\").",
    "Pay: 19 of 213 entry-level listings (8.9%) state a salary in rupees and 0 of 23 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 210 listings (89.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best data engineer jobs for freshers in India?",
      "a": "Data Engineer (42 listings) and Associate Data Engineer (18) are the main entry titles in the October listings. Azure Data Engineer and Junior Data Engineer have 4 each. Choose roles that name the stack you have practised."
    },
    {
      "q": "What is a data engineer fresher salary in India?",
      "a": "Among 19 jobs that state pay, the median is ₹4.8 lakh a year, and 52.6% sit in the ₹3 to 5 lakh band. Only 8.9% of jobs state pay, so ask the hiring lead for the range."
    },
    {
      "q": "Which skills do data engineer fresher jobs need?",
      "a": "Python (71.0% of described listings), SQL (69.0%) and cloud (63.3%) are the core three. Machine learning appears in 30.5% and Power BI in 17.6%."
    },
    {
      "q": "Which city has the most data engineer jobs?",
      "a": "Bengaluru has 54 of 236 listings (22.9%). Mumbai has 37 and Chennai 31. Only 5 listings are marked remote."
    },
    {
      "q": "Is there a data engineer internship for freshers?",
      "a": "There are 23 internships among 236 listings, 9.7%. None states a stipend, so ask before you accept. Most freshers enter through an associate or junior data engineer job."
    },
    {
      "q": "How do I get a data engineer job as a fresher?",
      "a": "Email the data platform lead or engineering manager with a small working pipeline and a readme. Three lines, one follow-up. This is a better route than one of about 242 applications per opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 236 October listings.",
    "items": [
      [
        "Learn SQL deeply",
        "It appears in 69.0% of described listings."
      ],
      [
        "Touch one cloud",
        "Cloud appears in 63.3%, so build something on one."
      ],
      [
        "Aim at the hubs",
        "Bengaluru has 54 listings, Mumbai 37 and Chennai 31."
      ],
      [
        "Check what the job is",
        "Titles like ETL Automation Gig are not the same as a permanent role."
      ],
      [
        "Write to the platform lead",
        "Only 3 listings include an email."
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
    "name": "Studojo Jobs Index, October 2026: Data Engineer Jobs for Freshers 2026",
    "description": "236 active entry-level and internship listings for India posted in October 2026 (data engineer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-data-engineer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Who leads data platform where you want to work?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
