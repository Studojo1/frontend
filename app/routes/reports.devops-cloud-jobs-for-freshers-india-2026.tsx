import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "devops-cloud-jobs-for-freshers-india-2026",
  "title": "DevOps and Cloud Jobs for Freshers in India 2026: 299 Listings",
  "short": "DevOps and Cloud Jobs for Freshers 2026",
  "description": "DevOps and cloud jobs for freshers in India: 299 October listings, cloud named in 93.6% of descriptions, Python in 54.8%, Bengaluru has 21.1% of them.",
  "keywords": "DevOps and cloud jobs for freshers, DevOps and cloud fresher salary, DevOps and cloud jobs in india 2026, how to get a DevOps and cloud job as a fresher, DevOps and cloud internship",
  "h1": "DevOps and Cloud Jobs for Freshers in India:",
  "h1em": "What 299 Listings Show",
  "sub": "DevOps and cloud jobs for freshers are a small, skill-heavy field: 299 October listings in the Studojo Jobs Index, 245 jobs and 54 internships. Cloud is named in 93.6% of descriptions and Python in 54.8%.",
  "published": "2026-11-11",
  "scope": "India · DevOps and cloud · freshers and interns",
  "findings": [
    "**DevOps and cloud jobs for freshers are few and specific**: 299 October listings, with DevOps Engineer (35) and Site Reliability Engineer (13) the clearest titles.",
    "**Cloud and Python are the entry kit**: 93.6% of listings with a full description name AWS, Azure or GCP and 54.8% name Python, against 11.4% for SQL and Java.",
    "**Bengaluru dominates**: 63 listings (21.1%), then Hyderabad with 39 (13.0%) and Pune with 28 (9.4%).",
    "**Pay is rarely stated but high where it is**: 12 jobs (4.9%) state a figure, with a median top of range of ₹6 lakh a year, and 35.2% of descriptions mention BTech, BE or computer science.",
    "**Email the engineering or platform lead with a deployed project**: it is the proof they trust. We built Stu to find that person and send from your own inbox."
  ],
  "stats": [
    {
      "num": "299",
      "label": "DevOps and cloud listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "4.9%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "93.6%",
      "label": "Of listings with a full description ask for cloud (AWS, Azure, GCP)",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are DevOps and cloud jobs for freshers called?",
      "sub": "DevOps Engineer leads, and some titles are noisy.",
      "paras": [
        "DevOps and cloud jobs for freshers are named DevOps Engineer (35 listings, 11.7%), Site Reliability Engineer (13), Cloud Engineer (12) and Associate Software Engineer with DevOps and Kubernetes (4). There are also Cloud Computing Intern, AWS Developer (3) and Devops Intern (3).",
        "Titles are noisy. Some rows, such as the cyber architecture staff title (10) and Azure Data Engineer (4), are cloud security or data roles rather than classic DevOps, so read titles before applying.",
        "185 different employers posted the listings, the busiest ten hold 23.4% and 3.7% hide the employer. 245 are jobs and 54 are internships, so internships are 18.1% of the set."
      ],
      "chart": {
        "id": "rdcjffi19Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=299)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          245,
          54
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
            "Devops Engineer",
            "35"
          ],
          [
            "Site Reliability Engineer",
            "13"
          ],
          [
            "Cloud Engineer",
            "12"
          ],
          [
            "Tc-CS-Cyber Architecture- OT And Engineering-Azure-Cloud Security-Staff",
            "10"
          ],
          [
            "Azure Data Engineer",
            "4"
          ],
          [
            "Cloud Computing Intern (AWS, Linux, Networking, Cloud Fundamentals) / Remote",
            "4"
          ],
          [
            "Associate Software Engineer - Devops & Kubernetes",
            "4"
          ],
          [
            "AWS Developer",
            "3"
          ],
          [
            "Devops Intern",
            "3"
          ],
          [
            "Software Engineer - Cloud: Azure",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 185 different employers posted these listings, and 3.7% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have DevOps and cloud jobs for freshers?",
      "sub": "Bengaluru leads by a wide margin, and Hyderabad is second.",
      "paras": [
        "Bengaluru has 63 listings (21.1%), the largest single-city share in this group. Hyderabad follows with 39 (13.0%), Pune with 28 (9.4%), Chennai with 26 (8.7%) and Mumbai with 25 (8.4%).",
        "Ahmedabad and Gurugram have 15 each, Noida 12 and Kolkata 12. Thiruvananthapuram appears with 5 (1.7%), a small number but a useful hint if you are in Kerala.",
        "31 listings (10.4%) are marked remote and 46 name no city. Infrastructure work is one of the more remote-friendly fields, but a fresher usually needs a team to learn from, so check how onboarding works."
      ],
      "chart": {
        "id": "rdcjffi19Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=299)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Pune",
          "Chennai",
          "Mumbai",
          "Ahmedabad",
          "Gurugram",
          "Noida",
          "Kolkata",
          "Thiruvananthapuram"
        ],
        "values": [
          63,
          39,
          28,
          26,
          25,
          15,
          15,
          12,
          12,
          5
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
            "63",
            "21.1%"
          ],
          [
            "Hyderabad",
            "39",
            "13.0%"
          ],
          [
            "Pune",
            "28",
            "9.4%"
          ],
          [
            "Chennai",
            "26",
            "8.7%"
          ],
          [
            "Mumbai",
            "25",
            "8.4%"
          ],
          [
            "Ahmedabad",
            "15",
            "5.0%"
          ],
          [
            "Gurugram",
            "15",
            "5.0%"
          ],
          [
            "Noida",
            "12",
            "4.0%"
          ],
          [
            "Kolkata",
            "12",
            "4.0%"
          ],
          [
            "Thiruvananthapuram",
            "5",
            "1.7%"
          ]
        ],
        "note": "A listing can name more than one city. 31 listings are marked remote and 46 name no city."
      }
    },
    {
      "title": "What is a DevOps and cloud fresher salary in India?",
      "sub": "Only 12 jobs state it, around ₹6 lakh. Treat it as a hint.",
      "paras": [
        "12 of 245 jobs (4.9%) state pay in rupees. The median top of range is ₹6 lakh a year, with the middle half between ₹5 lakh and ₹8 lakh. Four jobs sit in ₹5 to 8 lakh, 4 in ₹8 to 12 lakh, 3 in ₹3 to 5 lakh and 1 at ₹20 lakh or more.",
        "That is a very small sample and the tops of ranges, so do not quote it as a fresher average. It does fit the idea that cloud skills are priced above general IT entry roles, but the proof is thin. 95.1% of jobs state nothing.",
        "For internships, 1 of 54 states a stipend at ₹16,667 a month. 5.3% of descriptions say unpaid. Ask both questions early: stipend, and whether the internship converts."
      ],
      "chart": {
        "id": "rdcjffi19Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=299)",
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
          51,
          47,
          46,
          47,
          70,
          30,
          8
        ],
        "unit": "listings"
      },
      "callout": "**Posting day:** 23.4% of listings were posted on a Friday, and 2.7% on a Sunday."
    },
    {
      "title": "What skills do DevOps and cloud fresher jobs ask for?",
      "sub": "Cloud, Python, then SQL and Java.",
      "paras": [
        "Of the 281 listings with a full description, 93.6% mention cloud (AWS, Azure or GCP) and 54.8% mention Python. Communication skills are in 39.9%, SQL in 11.4% and Java in 11.4%. Machine learning or generative AI is in 8.5%, JavaScript, React or Node in 6.8% and AI tools in 6.0%.",
        "That gives a clear order for learning: pick one cloud and go deep, then Python for scripting. Linux and networking matter in practice, though they are not in our keyword set, so we cannot give a share for them.",
        "The terms chart: 35.2% mention BTech, BE or computer science and 30.6% mention GitHub. 12.8% ask for a certificate, 11.0% say freshers and 8.5% mention hybrid. A public GitHub with a pipeline in it is close to a requirement."
      ],
      "chart": {
        "id": "rdcjffi19Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (281 listings with a full description)",
        "labels": [
          "cloud (AWS, Azure, GCP)",
          "Python",
          "communication skills",
          "SQL",
          "Java",
          "machine learning or generative AI",
          "English",
          "JavaScript, React or Node",
          "ChatGPT or AI tools",
          "Excel"
        ],
        "values": [
          93.6,
          54.8,
          39.9,
          11.4,
          11.4,
          8.5,
          6.8,
          6.8,
          6.0,
          4.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a DevOps and cloud fresher?",
      "sub": "Show a project that runs, to the person who owns the platform.",
      "paras": [
        "A small field means each opening gets focused attention, but the usual pile still applies. The Interview Guys (April 2026), citing Business Insider data, put the average opening at about 242 applications. A working project in a direct email gets past a keyword filter.",
        "Email the DevOps or platform lead, the engineering manager, or the CTO in a small startup. Send one proof: a GitHub repo where you deployed a small app to one cloud with a CI pipeline, a container and a short README that shows how to run it and what it costs. Add a one-paragraph note on one thing that broke and how you fixed it.",
        "Three lines: your name and course, the repo, and a request for a short call. Follow up once. Stu handles the slow parts: it finds the hiring manager with a verified work email, writes the note from your real work and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **299 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as DevOps and cloud when its job title matches that role (the most common titles here: \"Devops Engineer\", \"Site Reliability Engineer\", \"Cloud Engineer\").",
    "Pay: 12 of 245 entry-level listings (4.9%) state a salary in rupees and 1 of 54 internships (1.9%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 281 listings (94.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many DevOps and cloud jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 299 October 2026 listings: 245 jobs and 54 internships, from 185 employers. Titles vary, so read each one, and listings are not hires."
    },
    {
      "q": "What is the DevOps and cloud fresher salary in India?",
      "a": "Only 12 jobs state pay. Their median top of range is ₹6 lakh a year, with the middle half between ₹5 lakh and ₹8 lakh. That is a small sample, so use it as a hint."
    },
    {
      "q": "Which cloud should a fresher learn for DevOps jobs in India 2026?",
      "a": "Listings name AWS, Azure and GCP together, and 93.6% mention cloud. Pick one, build a project on it and be able to explain the others at a high level."
    },
    {
      "q": "Is Python required for DevOps jobs?",
      "a": "It is common. 54.8% of descriptions mention Python, against 11.4% for SQL and 11.4% for Java."
    },
    {
      "q": "Can a fresher get a DevOps or cloud internship?",
      "a": "Yes. 54 of 299 listings (18.1%) are internships, including Cloud Computing Intern and Devops Intern. Only 1 states a stipend."
    },
    {
      "q": "Do DevOps jobs need a BTech?",
      "a": "Often. 35.2% of descriptions mention BTech, BE or computer science, and 30.6% mention GitHub. 11.0% say freshers."
    }
  ],
  "takeaway": {
    "sub": "Five steps for a DevOps or cloud search.",
    "items": [
      [
        "Pick one cloud",
        "93.6% of descriptions name cloud. Go deep on AWS, Azure or GCP."
      ],
      [
        "Add Python",
        "54.8% of descriptions mention it."
      ],
      [
        "Ship a pipeline to GitHub",
        "30.6% of descriptions mention GitHub."
      ],
      [
        "Read titles carefully",
        "Some titles are cloud security or data roles, not classic DevOps."
      ],
      [
        "Email the platform lead",
        "One repo, three lines, one follow-up."
      ]
    ]
  },
  "related": [
    {
      "slug": "software-developer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Software Developer Jobs for Freshers 2026"
    },
    {
      "slug": "qa-tester-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "QA and Testing Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: DevOps and Cloud Jobs for Freshers 2026",
    "description": "299 active entry-level and internship listings for India posted in October 2026 (DevOps and cloud), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-devops-cloud-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want your repo seen by the platform lead?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring with a verified work email and writes a short personal email from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
