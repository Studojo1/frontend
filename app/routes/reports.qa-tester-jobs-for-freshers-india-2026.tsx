import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "qa-tester-jobs-for-freshers-india-2026",
  "title": "QA and Software Testing Jobs for Freshers in India 2026: 975 Listings",
  "short": "QA and Testing Jobs for Freshers 2026",
  "description": "QA and software testing jobs for freshers in India: 975 October listings, Mumbai leads with 20.4%, SQL in 22.3% of descriptions, median stated pay ₹4.5 lakh.",
  "keywords": "QA and software testing jobs for freshers, QA and software testing fresher salary, QA and software testing jobs in india 2026, how to get a QA and software testing job as a fresher, QA and software testing internship",
  "h1": "QA and Software Testing Jobs for Freshers:",
  "h1em": "What 975 Listings Show",
  "sub": "QA and software testing jobs for freshers number 975 October listings in the Studojo Jobs Index, 848 jobs and 127 internships. Mumbai has 20.4% of them, SQL is in 22.3% of descriptions, and the median stated salary is ₹4.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · QA and software testing · freshers and interns",
  "findings": [
    "**QA and software testing jobs for freshers are led by one title**: Test Engineer has 121 of 975 October listings (12.4%), well ahead of Software Tester (25) and QA Engineer (21).",
    "**Mumbai, not Bengaluru, is first**: 199 listings (20.4%) against 133 (13.6%) for Bengaluru and 121 (12.4%) for Pune.",
    "**Testing asks for more than clicking**: 22.3% of descriptions mention SQL, 16.4% Python and 13.9% Java, and 32.3% mention BTech, BE or computer science.",
    "**Pay has a wide spread**: 136 jobs (16.0%) state pay, with a median top of range of ₹4.5 lakh a year and a middle half from ₹3 lakh to ₹6.5 lakh.",
    "**Email the QA lead with a bug report you wrote**: it is the most direct proof of the job. We built Stu to find that person and send your email from your own inbox."
  ],
  "stats": [
    {
      "num": "975",
      "label": "QA and software testing listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4.5 lakh",
      "label": "Median stated pay a year, from the 136 jobs that state it (16.0%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "22.3%",
      "label": "Of listings with a full description ask for SQL",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are QA and software testing jobs called, and who posts them?",
      "sub": "Test Engineer is the dominant title, with many small variants.",
      "paras": [
        "QA and software testing jobs for freshers are most often called Test Engineer, with 121 listings (12.4%). After that come Software Tester (25), QA Engineer (21), Quality Assurance Engineer (12) and Software Testing Internship (12). QA Tester, QA Testing and QA Test Engineer have 9 each, and Testing Engineer has 8.",
        "Search all of them. QA, Quality Assurance, Test and Testing are one craft with several labels, and a search on only one will lose you most of the supply.",
        "609 different employers posted these 975 listings, the busiest ten hold 17.9% and 7.1% of listings do not name the employer. 848 are jobs and 127 are internships, so internships are 13.0% of the field."
      ],
      "chart": {
        "id": "rqtjffi18Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=975)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          848,
          127
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
            "Test Engineer",
            "121"
          ],
          [
            "Software Tester",
            "25"
          ],
          [
            "Test Engineer Qualitykiosk",
            "22"
          ],
          [
            "QA Engineer",
            "21"
          ],
          [
            "Quality Assurance Engineer",
            "12"
          ],
          [
            "Software Testing Internship",
            "12"
          ],
          [
            "QA Tester",
            "9"
          ],
          [
            "QA Testing",
            "9"
          ],
          [
            "QA Test Engineer",
            "9"
          ],
          [
            "Testing Engineer",
            "8"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 609 different employers posted these listings, and 7.1% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have QA and testing jobs for freshers?",
      "sub": "Mumbai leads, then Bengaluru and Pune.",
      "paras": [
        "Mumbai has 199 listings (20.4%), the highest city share in this group of tech-adjacent reports. Bengaluru has 133 (13.6%), Pune 121 (12.4%), Hyderabad 83 (8.5%) and Chennai 74 (7.6%).",
        "Testing is a service-heavy field, which is why Mumbai and Pune rank above where you might expect. Ahmedabad has 48, Noida 47, Delhi 38 and Gurugram 31.",
        "58 listings (5.9%) are marked remote and 87 name no city. Most testing jobs are in an office, so plan around the city where the team sits."
      ],
      "chart": {
        "id": "rqtjffi18Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=975)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Pune",
          "Hyderabad",
          "Chennai",
          "Ahmedabad",
          "Noida",
          "Delhi",
          "Gurugram",
          "Chandigarh"
        ],
        "values": [
          199,
          133,
          121,
          83,
          74,
          48,
          47,
          38,
          31,
          13
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
            "199",
            "20.4%"
          ],
          [
            "Bengaluru",
            "133",
            "13.6%"
          ],
          [
            "Pune",
            "121",
            "12.4%"
          ],
          [
            "Hyderabad",
            "83",
            "8.5%"
          ],
          [
            "Chennai",
            "74",
            "7.6%"
          ],
          [
            "Ahmedabad",
            "48",
            "4.9%"
          ],
          [
            "Noida",
            "47",
            "4.8%"
          ],
          [
            "Delhi",
            "38",
            "3.9%"
          ],
          [
            "Gurugram",
            "31",
            "3.2%"
          ],
          [
            "Chandigarh",
            "13",
            "1.3%"
          ]
        ],
        "note": "A listing can name more than one city. 58 listings are marked remote and 87 name no city."
      }
    },
    {
      "title": "What is a QA tester fresher salary in India?",
      "sub": "A median of ₹4.5 lakh a year, with a long upper tail.",
      "paras": [
        "136 of 848 jobs state pay in rupees (16.0%). The median top of range is ₹4.5 lakh a year, and the middle half runs from ₹3 lakh to ₹6.5 lakh. 54 jobs (39.7%) sit in ₹3 to 5 lakh, 40 (29.4%) in ₹5 to 8 lakh and 15 (11.0%) in ₹2 to 3 lakh.",
        "The tail is longer than in most roles: 8 jobs (5.9%) reach ₹8 to 12 lakh, 12 (8.8%) reach ₹12 to 20 lakh and 4 (2.9%) reach ₹20 lakh or more. Those are likely automation or senior titles that matched our filter, so do not read them as fresher pay. Only 3 jobs sit under ₹2 lakh.",
        "For internships, 1 of 127 states a stipend, at ₹41,667 a month. One listing says nothing about the typical stipend, so ask."
      ],
      "chart": {
        "id": "rqtjffi18Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (136 jobs that state pay in rupees)",
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
          15,
          54,
          40,
          8,
          12,
          4
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do QA and testing fresher jobs ask for?",
      "sub": "SQL, Python and Java sit behind communication.",
      "paras": [
        "Of the 877 listings with a full description, 43.9% mention communication skills. SQL follows at 22.3%, Python at 16.4% and Java at 13.9%. Cloud tools are in 12.8%, JavaScript, React or Node in 9.9% and Excel in 6.5%. AI or machine learning appears in 4.6% and AI tools in 4.0%.",
        "SQL at 22.3% is the easiest win. You can learn enough to check a database after a test in a few weekends. Python or Java lets you move into automation, which is where the higher stated pay seems to be.",
        "The terms chart is clear on degrees: 32.3% mention BTech, BE or computer science, 13.1% say freshers and 7.0% ask for a certificate. 4.8% mention GitHub, 5.2% hybrid and 5.2% work from office. Testing is not a no-code job."
      ],
      "chart": {
        "id": "rqtjffi18Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (877 listings with a full description)",
        "labels": [
          "communication skills",
          "SQL",
          "Python",
          "Java",
          "cloud (AWS, Azure, GCP)",
          "JavaScript, React or Node",
          "Excel",
          "English",
          "machine learning or generative AI",
          "ChatGPT or AI tools"
        ],
        "values": [
          43.9,
          22.3,
          16.4,
          13.9,
          12.8,
          9.9,
          6.5,
          6.4,
          4.6,
          4.0
        ],
        "unit": "%"
      },
      "callout": "**Proof tip:** 4.8% of descriptions mention GitHub. A public repo with test cases is a cheap, visible signal."
    },
    {
      "title": "How do you get hired as a QA and software testing fresher?",
      "sub": "Send a real bug report to the person who leads testing.",
      "paras": [
        "Testing listings draw crowded applications. The Interview Guys (April 2026) cite roughly 0.1% to 2% as the typical success rate per online application. One email to the person who owns quality will be read in a different way from a form entry.",
        "Email the QA lead, the test manager, or the engineering manager in a small team. Send one proof: a bug report you wrote for a public website or app, with steps to reproduce, expected and actual results and a screenshot, plus ten test cases for one feature written in a simple sheet. If you can, add a small automated check on GitHub.",
        "Three lines: who you are, the bug or test cases you wrote, and a request for a short call. Follow up once. Stu does the slow parts: it finds the hiring manager with a verified work email, writes the note from your real work and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **975 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as QA and software testing when its job title matches that role (the most common titles here: \"Test Engineer\", \"Software Tester\", \"Test Engineer Qualitykiosk\").",
    "Pay: 136 of 848 entry-level listings (16.0%) state a salary in rupees and 1 of 127 internships (0.8%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 877 listings (89.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many QA and software testing jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 975 October 2026 listings: 848 jobs and 127 internships, from 609 employers. That counts listings we track, not hires."
    },
    {
      "q": "What is the QA and software testing fresher salary in India?",
      "a": "Among 136 jobs that state pay, the median top of range is ₹4.5 lakh a year, with the middle half between ₹3 lakh and ₹6.5 lakh. 16.0% of jobs state pay."
    },
    {
      "q": "Do I need coding for QA and software testing jobs?",
      "a": "Often some. SQL is in 22.3% of descriptions, Python in 16.4% and Java in 13.9%. Manual testing roles exist, but coding widens your options."
    },
    {
      "q": "Is a BTech required for software testing jobs?",
      "a": "Not always. 32.3% of descriptions mention BTech, BE or computer science, while 13.1% say freshers. 7.0% ask for a certificate."
    },
    {
      "q": "Is there a software testing internship for freshers?",
      "a": "Yes. 127 of 975 listings (13.0%) are internships, including Software Testing Internship with 12. Only 1 states a stipend."
    },
    {
      "q": "Which city has the most QA and testing jobs in India 2026?",
      "a": "Mumbai, with 199 listings (20.4%), then Bengaluru with 133 (13.6%) and Pune with 121 (12.4%)."
    }
  ],
  "takeaway": {
    "sub": "Five steps for a first QA role.",
    "items": [
      [
        "Search every label",
        "Test Engineer, QA Engineer and Software Tester are all the same craft."
      ],
      [
        "Learn SQL",
        "22.3% of descriptions mention it."
      ],
      [
        "Write a bug report",
        "A real report on a public app is your best proof."
      ],
      [
        "Put tests on GitHub",
        "4.8% of descriptions mention it."
      ],
      [
        "Email the QA lead",
        "One report, three lines, one follow-up."
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
      "slug": "devops-cloud-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "DevOps and Cloud Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: QA and Testing Jobs for Freshers 2026",
    "description": "975 active entry-level and internship listings for India posted in October 2026 (QA and software testing), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-qa-tester-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want your bug report read by the QA lead?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring with a verified work email and writes a short personal email from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
