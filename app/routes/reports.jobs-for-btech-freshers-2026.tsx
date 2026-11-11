import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-btech-freshers-2026",
  "title": "Jobs for BTech Freshers in India 2026: Roles, Pay and Cities",
  "short": "Jobs for BTech Freshers 2026",
  "description": "Jobs for BTech freshers: 10,670 October listings in the Studojo Jobs Index, 25.2% internships, 14.7% remote, and a median stated pay of ₹3.8 lakh a year.",
  "keywords": "jobs for btech freshers, jobs for btech freshers 2026, best jobs for btech and be graduates, salary for btech and be graduates",
  "h1": "Jobs for BTech Freshers in India:",
  "h1em": "What 10,670 Listings Show",
  "sub": "We tracked 10,670 October listings whose descriptions mention BTech, BE or computer science. 25.2% are internships, 14.7% are remote, and the median stated pay is ₹3.8 lakh a year. Only 24.7% of the jobs state pay.",
  "published": "2026-11-11",
  "scope": "India · BTech and BE graduates",
  "findings": [
    "**10,670 listings** for BTech and BE freshers were posted in October 2026 by 5,275 employers. 7,979 are jobs and 2,691 are internships (25.2%).",
    "**Software and data lead, but customer service is close.** Software developer is the largest role group at 4.7%, and customer service follows at 3.8%, ahead of front-end and full stack.",
    "**Stated pay has a median of ₹3.8 lakh a year**, from 1,971 jobs. Only 24.7% of jobs state pay, and 53.7% of those fall between ₹3 and 5 lakh.",
    "**Python appears in 21.9% of descriptions**, cloud in 16.5%, Excel in 15.9% and SQL in 15.8%. GitHub is named in 7.9%, so a public project helps.",
    "**The move that works is a short email to the engineering manager or tech lead** with a link to one project. Stu can find that person and write the note, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "10,670",
      "label": "October listings that mention BTech and BE graduates",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.8 lakh",
      "label": "Median stated pay a year, from the 1,971 jobs that state it (24.7%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "21.9%",
      "label": "Of listings with a full description ask for Python",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Which jobs are open to BTech freshers?",
      "sub": "Role groups matched on the job title, plus the jobs and internships split.",
      "paras": [
        "Jobs for BTech freshers cover more than software. Out of 10,670 listings, software developer is the biggest role group with 498 (4.7%). Customer service is second with 403 (3.8%), then front-end developer (345), full stack developer (337) and data analyst (309). HR has 293, AI and machine learning 287, QA and software testing 283 and technical support 260.",
        "The mix shows where a degree meets demand. Mechanical engineer has 197 listings (1.8%), cybersecurity 190 and business development 175. Many titles, such as associate, executive or trainee, match no group, so these shares understate the whole. They are a map of the named roles, not a complete count.",
        "Internships are a quarter of the pool. 2,691 listings (25.2%) are internships, against 7,979 jobs. That is a much larger internship share than the 10.8% across the whole index, which tells you that technical employers lean on internships as a way to hire. If you are still in your final year, start there."
      ],
      "chart": {
        "id": "rjfbf283Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=10,670)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          7979,
          2691
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "software developer",
            "498",
            "4.7%"
          ],
          [
            "customer service",
            "403",
            "3.8%"
          ],
          [
            "front-end developer",
            "345",
            "3.2%"
          ],
          [
            "full stack developer",
            "337",
            "3.2%"
          ],
          [
            "data analyst",
            "309",
            "2.9%"
          ],
          [
            "HR",
            "293",
            "2.7%"
          ],
          [
            "AI and machine learning",
            "287",
            "2.7%"
          ],
          [
            "QA and software testing",
            "283",
            "2.7%"
          ],
          [
            "technical support",
            "260",
            "2.4%"
          ],
          [
            "mechanical engineer",
            "197",
            "1.8%"
          ],
          [
            "cybersecurity",
            "190",
            "1.8%"
          ],
          [
            "business development",
            "175",
            "1.6%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "What job titles do BTech and BE graduates see, and where are the jobs?",
      "sub": "Titles exactly as written, and the ten biggest cities.",
      "paras": [
        "The most common single title is Data Analyst Intern with 111 listings (1.0%). Software Engineer has 50, Full Stack Development Internship 50, Associate Software Engineer 49 and Trainee Technology 46. Frontend Development Intern (44), Business Analytics Intern (43) and several web development titles follow. Titles are spread thin, so searching by skill beats searching by one name.",
        "Bengaluru has the most listings with 1,720 (16.1%), followed by Hyderabad with 1,064 (10.0%), Mumbai with 817 (7.7%), Pune with 757 (7.1%) and Chennai with 742 (7.0%). Gurugram has 580, Noida 453, Delhi 416, Ahmedabad 311 and Chandigarh 165. The top two cities hold over a quarter of the listings.",
        "Remote work is larger here than across the index. 1,566 listings (14.7%) are marked remote, against 5.3% across all listings, and 2,017 name no city. That opens the pool for anyone outside the main hubs. A listing can name more than one city. 5,275 employers posted these listings, and the ten biggest hold just 9.7%."
      ],
      "chart": {
        "id": "rjfbf283Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=10,670)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Mumbai",
          "Pune",
          "Chennai",
          "Gurugram",
          "Noida",
          "Delhi",
          "Ahmedabad",
          "Chandigarh"
        ],
        "values": [
          1720,
          1064,
          817,
          757,
          742,
          580,
          453,
          416,
          311,
          165
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
            "111"
          ],
          [
            "Software Engineer",
            "50"
          ],
          [
            "Full Stack Development Internship",
            "50"
          ],
          [
            "Associate Software Engineer",
            "49"
          ],
          [
            "Trainee Technology",
            "46"
          ],
          [
            "Frontend Development Intern",
            "44"
          ],
          [
            "Business Analytics Intern",
            "43"
          ],
          [
            "Web Development Intern",
            "39"
          ],
          [
            "Full Stack Web Developer Intern",
            "38"
          ],
          [
            "Web Development Internship",
            "35"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 5,275 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "What is the salary for BTech and BE graduates in India?",
      "sub": "Only 24.7% of jobs state pay, and almost no internships do.",
      "paras": [
        "The salary for BTech and BE graduates, as the listings state it, has a median of ₹3.8 lakh a year, taking the top of each range. The middle half runs from ₹3 lakh to ₹5 lakh. That is from 1,971 jobs, which is 24.7% of the 7,979 jobs. About three in four state no pay at all.",
        "The bands are wide at the top. 1,059 jobs (53.7%) fall in ₹3 to 5 lakh and 409 (20.8%) in ₹5 to 8 lakh. 328 (16.6%) are at ₹2 to 3 lakh and 75 (3.8%) under ₹2 lakh. Higher up, 58 (2.9%) reach ₹8 to 12 lakh, 26 (1.3%) ₹12 to 20 lakh and 16 (0.8%) ₹20 lakh or more. Higher figures are rare.",
        "Internship stipends are even scarcer. Only 37 of 2,691 internships (1.4%) state one, with a median of ₹16,667 a month. 19 of those fall in ₹10,000 to 20,000 and 15 in ₹20,000 to 40,000. If an internship does not state a stipend, ask before you accept, and ask whether it can lead to a job."
      ],
      "chart": {
        "id": "rjfbf283Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (1,971 jobs that state pay in rupees)",
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
          75,
          328,
          1059,
          409,
          58,
          26,
          16
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do jobs for BTech freshers ask for?",
      "sub": "Share of the 10,670 listings that mention each skill.",
      "paras": [
        "Communication skills lead at 62.6%, which surprises many engineers. Python is next at 21.9%, then English at 18.6%, cloud at 16.5%, Excel at 15.9% and SQL at 15.8%. JavaScript, React or Node appears in 14.2%, machine learning or generative AI in 11.5%, Java in 9.2% and statistics in 6.9%.",
        "Excel and SQL together show how many of these jobs sit in analysis, not code. A BTech fresher who can write a clean query and explain a result in plain English fits both the developer and the analyst lists. Machine learning and generative AI at 11.5% is large, but it is still far behind Python.",
        "On conditions, freshers are welcome in 26.9%, a certificate is named in 15.3% and GitHub in 7.9%. A portfolio appears in 7.8%. Night, rotational, US or UK shifts show up in 8.6%, which points to support and service roles. Work from home is named in 6.8% and work from office in 6.4%. Check the shift and location terms before you apply."
      ],
      "chart": {
        "id": "rjfbf283Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (10,670 listings with a full description)",
        "labels": [
          "communication skills",
          "Python",
          "English",
          "cloud (AWS, Azure, GCP)",
          "Excel",
          "SQL",
          "JavaScript, React or Node",
          "machine learning or generative AI",
          "Java",
          "statistics"
        ],
        "values": [
          62.6,
          21.9,
          18.6,
          16.5,
          15.9,
          15.8,
          14.2,
          11.5,
          9.2,
          6.9
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a BTech fresher?",
      "sub": "Email the person who builds the team, and show one project.",
      "paras": [
        "With 5,275 employers and many applicants per posting, a portal alone is a long shot. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% per online application and about 242 applications per opening (citing Business Insider data). Email the engineering manager, the tech lead or the head of data on the team you want. At a small startup, write to the founder or CTO.",
        "Send one piece of real work: a link to one project and two lines on it. Pick a project that fits the role, such as a small data analysis for an analyst job or a working app with a clear README for a developer job. Say what problem it solves, what you built it with and one thing you would improve. A public repository is a strong proof point, since GitHub appears in 7.9% of descriptions.",
        "Keep the email to three lines: who you are, the project link, and a request for a short call. Follow up once. Stu does the slow parts: it finds the person who hires, verifies the work email, writes the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **10,670 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts when its description (200 or more characters) mentions BTech, BE or computer science.",
    "Pay: 1,971 of 7,979 entry-level listings (24.7%) state a salary in rupees and 37 of 2,691 internships (1.4%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 10,670 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best jobs for BTech and BE graduates?",
      "a": "The most listed are software developer (498 listings), customer service (403), front-end developer (345), full stack developer (337) and data analyst (309). Listings are not hires, so choose by the work you want."
    },
    {
      "q": "What is the salary for BTech and BE graduates in India?",
      "a": "The median stated pay is ₹3.8 lakh a year, taking the top of each range. It comes from 1,971 jobs, 24.7% of the total. The middle half runs from ₹3 lakh to ₹5 lakh."
    },
    {
      "q": "Are there jobs for BTech freshers in 2026 without experience?",
      "a": "Yes. 26.9% of descriptions say freshers are welcome and 25.2% of the 10,670 listings are internships. Many titles are trainee or intern roles built for a first job."
    },
    {
      "q": "Which cities have the most jobs for BTech freshers?",
      "a": "Bengaluru has 1,720 listings, Hyderabad 1,064 and Mumbai 817. Pune has 757 and Chennai 742. 1,566 listings are marked remote."
    },
    {
      "q": "Can BTech freshers get remote jobs?",
      "a": "Yes. 14.7% of the listings are marked remote, and 6.8% of descriptions mention work from home. That is far above the 5.3% across all listings in the index."
    },
    {
      "q": "How do BTech freshers get hired without mass applying?",
      "a": "Email the engineering manager or tech lead with a link to one project. Keep it to three lines and follow up once. Stu can find the person and draft the email, and you send it from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a BTech or BE fresher.",
    "items": [
      [
        "Look beyond software",
        "Customer service, HR, QA and mechanical roles all appear in the role table."
      ],
      [
        "Use the internship route",
        "25.2% of listings are internships, so apply while you study."
      ],
      [
        "Check the remote flag",
        "14.7% are remote, which widens your pool beyond Bengaluru."
      ],
      [
        "Learn Python and SQL",
        "They appear in 21.9% and 15.8% of descriptions."
      ],
      [
        "Email with a project link",
        "Write to the tech lead, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "fresher-salary-india-2026",
      "kicker": "Data",
      "title": "Fresher Salary in India 2026"
    },
    {
      "slug": "skills-in-demand-fresher-jobs-india-2026",
      "kicker": "Data",
      "title": "Skills in Demand for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Jobs for BTech Freshers 2026",
    "description": "10,670 active entry-level and internship listings for India posted in October 2026 (BTech and BE graduates), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-btech-freshers-2026" place="report-end" size="card" title={"Want to email the tech lead instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
