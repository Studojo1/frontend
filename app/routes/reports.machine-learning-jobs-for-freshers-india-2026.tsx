import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "machine-learning-jobs-for-freshers-india-2026",
  "title": "AI and Machine Learning Jobs for Freshers in India: 631 Listings",
  "short": "AI and ML Jobs for Freshers 2026",
  "description": "AI and machine learning jobs for freshers in India: 631 October listings, 44.4% internships, 31.7% remote, and Python in 81.2% of descriptions.",
  "keywords": "AI and machine learning jobs for freshers, AI and machine learning fresher salary, AI and machine learning jobs in india 2026, how to get a AI and machine learning job as a fresher, AI and machine learning internship",
  "h1": "AI and Machine Learning Jobs for Freshers in India:",
  "h1em": "What 631 Listings Show",
  "sub": "We tracked 631 AI and machine learning jobs for freshers posted in October 2026. 280 are internships (44.4%) and 200 are marked remote (31.7%). Python appears in 81.2% of descriptions, and only 26 jobs state pay.",
  "published": "2026-11-11",
  "scope": "India · AI and machine learning · freshers and interns",
  "findings": [
    "There are **631 AI and machine learning jobs for freshers** in the Studojo Jobs Index for October 2026, and 280 of them (44.4%) are internships, not full-time jobs.",
    "**Remote work is common here.** 200 listings (31.7%) are marked remote, against 1.8% to 4.2% for civil, electrical and legal roles in this batch.",
    "**Python is close to a requirement.** It appears in 496 of the 611 listings with a full description (81.2%), and statistics in 134 (21.9%).",
    "**Pay is the weak spot.** Only 26 jobs (7.4%) state pay, with a median of ₹6.8 lakh a year, and just 1 internship states a stipend, at ₹25,000 a month.",
    "**Email the ML lead with one notebook.** Send a small project with an honest evaluation, and follow up once. Stu finds the person and drafts the email from your real work."
  ],
  "stats": [
    {
      "num": "631",
      "label": "AI and machine learning listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "7.4%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "89.0%",
      "label": "Of listings with a full description ask for machine learning or generative AI",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are AI and machine learning fresher jobs called?",
      "sub": "Intern titles outnumber engineer titles.",
      "paras": [
        "Artificial Intelligence Intern is the top title with 57 of 631 listings (9.0%). Machine Learning Intern has 36 (5.7%) and Artificial Intelligence (AI) Internship 27. On the job side, AI Engineer has 26, Artificial Intelligence Engineer 26, Machine Learning Engineer 12 and AI/ML Engineer 11.",
        "The titles are as employers wrote them, so spelling and casing are inconsistent. Search for AI, ML, Artificial Intelligence and Machine Learning separately. One title, Associate, Ml Data Operations, has 10 listings and is closer to data labelling and review than model building. Read before you apply.",
        "374 different employers posted these listings, and the top ten account for 20.1%. About 1.9% hide the employer. Startups and mid-sized teams make up much of the spread, which means the person who decides is often an ML lead or a founder you can reach."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Artificial Intelligence Intern",
            "57"
          ],
          [
            "Machine Learning Intern",
            "36"
          ],
          [
            "Artificial Intelligence (AI) Internship",
            "27"
          ],
          [
            "AI Engineer",
            "26"
          ],
          [
            "Artificial Intelligence Engineer",
            "26"
          ],
          [
            "Machine Learning Internship",
            "16"
          ],
          [
            "Machine Learning Engineer",
            "12"
          ],
          [
            "AI/ML Engineer",
            "11"
          ],
          [
            "AI/ML Intern",
            "10"
          ],
          [
            "Associate, ML Data Operations, Go-AI Operations",
            "10"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 374 different employers posted these listings, and 1.9% of listings do not name the employer."
      }
    },
    {
      "title": "Where are AI and machine learning jobs in India?",
      "sub": "Bengaluru leads, and a lot of the work has no city at all.",
      "paras": [
        "Bengaluru has 102 listings (16.2%), about twice Hyderabad at 52 (8.2%). Mumbai and Pune each have 37, Gurugram 35 and Noida 28. Delhi has 23 and Chennai 19. Chennai is far lower here than in civil or electrical roles, so this is a different map.",
        "234 listings name no city and 200 are marked remote. A listing can name more than one city, so the shares do not add up. The practical read: location matters less for this work than for any site or plant role.",
        "If you are outside a metro, filter for remote and hybrid. 39 listings mention hybrid and 77 mention work from home. Remote internships can be easy to apply to and hard to tell apart, so ask who you would report to before you accept."
      ],
      "chart": {
        "id": "rmljffi35Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=631)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Mumbai",
          "Pune",
          "Gurugram",
          "Noida",
          "Delhi",
          "Chennai",
          "Ahmedabad",
          "Surat"
        ],
        "values": [
          102,
          52,
          37,
          37,
          35,
          28,
          23,
          19,
          12,
          9
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
            "102",
            "16.2%"
          ],
          [
            "Hyderabad",
            "52",
            "8.2%"
          ],
          [
            "Mumbai",
            "37",
            "5.9%"
          ],
          [
            "Pune",
            "37",
            "5.9%"
          ],
          [
            "Gurugram",
            "35",
            "5.5%"
          ],
          [
            "Noida",
            "28",
            "4.4%"
          ],
          [
            "Delhi",
            "23",
            "3.6%"
          ],
          [
            "Chennai",
            "19",
            "3.0%"
          ],
          [
            "Ahmedabad",
            "12",
            "1.9%"
          ],
          [
            "Surat",
            "9",
            "1.4%"
          ]
        ],
        "note": "A listing can name more than one city. 200 listings are marked remote and 234 name no city."
      }
    },
    {
      "title": "Are AI and machine learning jobs mostly internships?",
      "sub": "Almost half are, and pay is rarely stated.",
      "paras": [
        "Of 631 listings, 351 are jobs and 280 are internships (44.4%). Across the whole index, internships are 10.8% of listings, so this role group leans heavily towards internships. If you are a fresher, an internship is a normal route in, not a lesser one.",
        "Pay is thin data. Only 26 of 351 jobs (7.4%) state pay in rupees, with a median of ₹6.8 lakh a year and a middle range from ₹4.2 lakh to ₹9 lakh. Seven sit at ₹3 to 5 lakh, 8 at ₹5 to 8 lakh, 6 at ₹8 to 12 lakh and 5 above ₹12 lakh.",
        "Only 1 of 280 internships states a stipend, at ₹25,000 a month. 24 listings (3.9%) say unpaid. With so little stated, the honest answer to the salary question is that you will need to ask. A conversation with the hiring lead is where the number gets named."
      ],
      "chart": {
        "id": "rmljffi35Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=631)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          351,
          280
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do AI and machine learning fresher listings ask for?",
      "sub": "Python first, then cloud, statistics and SQL.",
      "paras": [
        "Of 611 listings with a full description, 544 (89.0%) mention machine learning or generative AI, which is expected for this role group. Python appears in 496 (81.2%), cloud in 204 (33.4%), statistics in 134 (21.9%) and SQL in 118 (19.3%). JavaScript, React or Node appears in 67 (11.0%).",
        "ChatGPT or AI tools appear in 123 listings (20.1%), so employers are asking you to work with these tools, not just build models. Communication skills still appear in 255 (41.7%). Employers want someone who can explain results to people who are not technical.",
        "On conditions, 287 listings (47.0%) mention a BTech, BE or computer science degree, 158 (25.9%) say freshers and 127 (20.8%) mention a certificate. GitHub appears in 82 (13.4%) and a portfolio in 64 (10.5%). Your public repo is part of the application."
      ],
      "chart": {
        "id": "rmljffi35Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (611 listings with a full description)",
        "labels": [
          "machine learning or generative AI",
          "Python",
          "communication skills",
          "cloud (AWS, Azure, GCP)",
          "statistics",
          "ChatGPT or AI tools",
          "SQL",
          "JavaScript, React or Node",
          "calling or telecalling",
          "English"
        ],
        "values": [
          89.0,
          81.2,
          41.7,
          33.4,
          21.9,
          20.1,
          19.3,
          11.0,
          9.3,
          7.9
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as an AI and machine learning fresher?",
      "sub": "Show a model you built and how you checked it.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). LinkedIn carries 44.5% of these listings, so the queue is long. 26 listings (4.3%) put an email in the description. For the rest, write to the ML lead, the head of data science or the founder at a small team.",
        "Send one small project. A notebook that trains a model on a public dataset, with a clear metric, a baseline and a short note on what failed, is enough. Put it on GitHub with a readme. Do not send five projects.",
        "The email is three lines: who you are, the link, and a question about whether the team takes interns or junior engineers. Follow up once. Friday has the most postings at 19.0%, so write early in the week. Stu finds the right lead, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **631 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as AI and machine learning when its job title matches that role (the most common titles here: \"Artificial Intelligence Intern\", \"Machine Learning Intern\", \"Artificial Intelligence (AI) Internship\").",
    "Pay: 26 of 351 entry-level listings (7.4%) state a salary in rupees and 1 of 280 internships (0.4%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 611 listings (96.8%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best AI and machine learning jobs for freshers?",
      "a": "Artificial Intelligence Intern (57 listings) and Machine Learning Intern (36) are the largest titles. On the job side, AI Engineer and Artificial Intelligence Engineer have 26 each. Choose the one where your project shows."
    },
    {
      "q": "What is an AI and machine learning fresher salary in India?",
      "a": "Among 26 jobs that state pay, the median is ₹6.8 lakh a year. Only 7.4% of jobs state pay, and one internship states a stipend, at ₹25,000 a month. Ask during the conversation."
    },
    {
      "q": "Can I get an AI and machine learning job without a BTech?",
      "a": "Possibly. 287 of 611 described listings (47.0%) mention a BTech, BE or computer science degree, so more than half do not. Python, a public project and a clear evaluation matter as much."
    },
    {
      "q": "Are AI and machine learning jobs remote in India?",
      "a": "Many are. 200 of 631 listings (31.7%) are marked remote, and 77 mention work from home. 234 name no city, so location is often flexible."
    },
    {
      "q": "Is there an AI and machine learning internship for freshers?",
      "a": "Yes, 280 of 631 listings (44.4%) are internships. Only one states a stipend, at ₹25,000 a month, and 24 say unpaid. Ask about the stipend before you start."
    },
    {
      "q": "How do I get an AI and machine learning job as a fresher?",
      "a": "Email the ML lead or the founder with one small project on GitHub and a clear evaluation. Three lines, one follow-up. That is more direct than competing with about 242 applications for each opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 631 October listings.",
    "items": [
      [
        "Internships are the main door",
        "280 listings, 44.4% of the total, are internships."
      ],
      [
        "Remote is real",
        "200 listings, 31.7%, are marked remote."
      ],
      [
        "Python comes first",
        "It appears in 81.2% of full descriptions."
      ],
      [
        "Put your work on GitHub",
        "GitHub appears in 82 listings and a portfolio in 64."
      ],
      [
        "Ask about pay",
        "Only 26 jobs and 1 internship state it."
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
    "name": "Studojo Jobs Index, October 2026: AI and ML Jobs for Freshers 2026",
    "description": "631 active entry-level and internship listings for India posted in October 2026 (AI and machine learning), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-machine-learning-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Who leads ML at the team you want to join?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
