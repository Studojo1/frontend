import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "studojo-jobs-index-october-2026",
  "title": "Studojo Jobs Index: Fresher Jobs Data for India, October 2026",
  "short": "Studojo Jobs Index, October 2026",
  "description": "Fresher jobs data for India: 170,927 entry-level jobs and internships posted in October 2026, with pay, cities, roles and skills, and 100 reports on them.",
  "keywords": "fresher jobs data india, entry level jobs india 2026, internship data india, job market for freshers india 2026, fresher salary india, studojo jobs index",
  "h1": "The Studojo Jobs Index: fresher jobs data for India,",
  "h1em": "October 2026",
  "sub": "We track entry-level jobs and internships across India's job boards and company career pages. In October 2026 that was 170,927 listings. Here is what they pay, where they are, what they ask for, and 100 reports that go deeper.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "The index holds **170,927 entry-level and internship listings** for India posted in October 2026: **152,469 entry-level jobs and 18,458 internships** (10.8%).",
    "**Only 28.4% of entry-level jobs state a salary**, and **just 2.1% of internships state a stipend**. Where pay is stated, the median top of the range is **₹4 lakh a year** for jobs and **₹15,000 a month** for internships.",
    "**Mumbai (21,016) and Bengaluru (20,817)** lead the cities, then Chennai, Hyderabad and Delhi. **5.3% of listings are marked remote.**",
    "**Customer service is the biggest role group with 20,127 listings**, then HR (7,267) and business development (6,891). **Communication skills appear in 60.2% of descriptions**, Excel in 13.7%.",
    "**Only 7.0% of listings with a description give an email address**; the rest send you to a form. The move that works is finding the person who hires and writing to them, which is what Stu does for you."
  ],
  "stats": [
    {
      "num": "170,927",
      "label": "Entry-level and internship listings in India, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 43,254 jobs that state it (28.4%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "13.7%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "How many fresher jobs and internships were posted in India in October 2026?",
      "sub": "What the index counts, in one picture",
      "paras": [
        "The Studojo Jobs Index holds 170,927 active listings for India that were posted between 1 and 31 October 2026 and are tagged entry-level or internship. 152,469 of them are entry-level jobs and 18,458 are internships, so roughly 1 listing in 9 is an internship.",
        "These are listings, not hires. They come from job boards and company career pages, and the same opening can sit on two sites at once. Naukri carried 53.7% of the listings we found, LinkedIn 16.5%, company career sites and applicant tracking pages 16.1%, Shine 7.8% and Internshala 5.9%.",
        "47,920 different employers posted them, and 5.8% of listings do not name the employer at all. No single company dominates: the 10 biggest posters account for 17.7% of everything in the index."
      ],
      "chart": {
        "id": "rsjio2100Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=170,927)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          152469,
          18458
        ],
        "unit": "listings"
      },
      "callout": "**Why we built it:** Stu, our AI career agent, matches you to jobs from this index and finds the person hiring. Publishing the numbers lets you see the market the way Stu does."
    },
    {
      "title": "Which roles have the most fresher jobs?",
      "sub": "Every role group in the index, with pay where it is stated",
      "paras": [
        "Customer service is the giant: 20,127 listings, almost all of them entry-level jobs rather than internships. HR (7,267), business development (6,891), hotel and hospitality (6,414) and relationship manager roles (5,839) follow. If you are a fresher who will take a phone or a client meeting, the volume is on your side.",
        "The internship share tells a different story. Marketing roles in general are 61.1% internships and social media roles 52.4%, while customer service is 1.2% internships. In marketing, the internship is usually the door; in service and sales, you are hired straight into the job.",
        "Pay disclosure swings by role too. 52.4% of telecaller jobs and 43.8% of field sales jobs state a salary, against 14.6% for business development. Each role below has its own report on this page with the cities, the pay bands and the skills its listings ask for."
      ],
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Internships",
          "Jobs stating pay",
          "Median stated pay, per year"
        ],
        "rows": [
          [
            "customer service",
            "20,127",
            "1.2%",
            "40.8%",
            "4 lakh"
          ],
          [
            "HR",
            "7,267",
            "21.9%",
            "31.5%",
            "3.2 lakh"
          ],
          [
            "business development",
            "6,891",
            "18.8%",
            "14.6%",
            "4.1 lakh"
          ],
          [
            "hotel and hospitality",
            "6,414",
            "0.9%",
            "9.3%",
            "2.8 lakh"
          ],
          [
            "relationship manager",
            "5,839",
            "1.0%",
            "25.4%",
            "4.2 lakh"
          ],
          [
            "field sales",
            "5,137",
            "2.5%",
            "43.8%",
            "3.6 lakh"
          ],
          [
            "process associate",
            "3,779",
            "0.5%",
            "16.5%",
            "4 lakh"
          ],
          [
            "marketing (general)",
            "3,441",
            "61.1%",
            "30.6%",
            "3.5 lakh"
          ],
          [
            "telecaller",
            "3,420",
            "3.2%",
            "52.4%",
            "3.2 lakh"
          ],
          [
            "accountant",
            "2,738",
            "7.9%",
            "38.9%",
            "3 lakh"
          ],
          [
            "operations executive",
            "2,663",
            "15.4%",
            "30.7%",
            "3.5 lakh"
          ],
          [
            "retail sales",
            "2,633",
            "9.0%",
            "26.2%",
            "3 lakh"
          ],
          [
            "social media",
            "2,225",
            "52.4%",
            "18.2%",
            "3.5 lakh"
          ],
          [
            "technical support",
            "1,946",
            "1.7%",
            "22.1%",
            "4.5 lakh"
          ],
          [
            "content writer",
            "1,743",
            "27.8%",
            "10.7%",
            "3.5 lakh"
          ],
          [
            "digital marketing",
            "1,592",
            "44.6%",
            "21.2%",
            "4 lakh"
          ],
          [
            "supply chain and logistics",
            "1,503",
            "7.9%",
            "24.0%",
            "3.2 lakh"
          ],
          [
            "graphic designer",
            "1,447",
            "28.5%",
            "19.3%",
            "3 lakh"
          ],
          [
            "teaching",
            "1,399",
            "2.1%",
            "27.5%",
            "3.5 lakh"
          ],
          [
            "video editor",
            "1,248",
            "34.2%",
            "25.1%",
            "3 lakh"
          ],
          [
            "mechanical engineer",
            "1,027",
            "10.7%",
            "31.5%",
            "3.2 lakh"
          ],
          [
            "QA and software testing",
            "975",
            "13.0%",
            "16.0%",
            "4.5 lakh"
          ],
          [
            "electrical and electronics engineer",
            "906",
            "12.0%",
            "26.9%",
            "3.5 lakh"
          ],
          [
            "software developer",
            "904",
            "20.6%",
            "4.9%",
            "6 lakh"
          ],
          [
            "audit",
            "861",
            "14.2%",
            "22.7%",
            "3.5 lakh"
          ],
          [
            "data analyst",
            "831",
            "44.4%",
            "26.6%",
            "3 lakh"
          ],
          [
            "lab and quality control",
            "780",
            "6.9%",
            "34.3%",
            "3.6 lakh"
          ],
          [
            "trust and safety",
            "705",
            "0.7%",
            "13.1%",
            "5.5 lakh"
          ],
          [
            "academic counsellor",
            "675",
            "2.8%",
            "54.3%",
            "4.5 lakh"
          ],
          [
            "front-end developer",
            "661",
            "42.8%",
            "7.7%",
            "too few"
          ],
          [
            "finance",
            "641",
            "33.7%",
            "17.6%",
            "4.5 lakh"
          ],
          [
            "AI and machine learning",
            "631",
            "44.4%",
            "7.4%",
            "too few"
          ],
          [
            "legal",
            "620",
            "21.9%",
            "23.6%",
            "3.5 lakh"
          ],
          [
            "full stack developer",
            "612",
            "50.2%",
            "11.8%",
            "4.5 lakh"
          ],
          [
            "civil engineer",
            "611",
            "4.6%",
            "35.5%",
            "3.6 lakh"
          ],
          [
            "interior designer",
            "591",
            "13.4%",
            "27.5%",
            "4.2 lakh"
          ],
          [
            "SEO",
            "580",
            "35.9%",
            "18.0%",
            "2.4 lakh"
          ],
          [
            "management trainee",
            "524",
            "3.2%",
            "33.9%",
            "6 lakh"
          ],
          [
            "graduate engineer trainee",
            "479",
            "14.0%",
            "31.8%",
            "3 lakh"
          ],
          [
            "cybersecurity",
            "418",
            "29.4%",
            "4.1%",
            "too few"
          ],
          [
            "UI/UX designer",
            "385",
            "47.5%",
            "9.4%",
            "too few"
          ],
          [
            "data scientist",
            "332",
            "46.4%",
            "3.4%",
            "too few"
          ],
          [
            "SAP",
            "326",
            "1.5%",
            "19.9%",
            "5 lakh"
          ],
          [
            "pharmacist",
            "305",
            "3.3%",
            "36.9%",
            "3 lakh"
          ],
          [
            "DevOps and cloud",
            "299",
            "18.1%",
            "4.9%",
            "too few"
          ],
          [
            "Python developer",
            "293",
            "35.5%",
            "5.3%",
            "too few"
          ],
          [
            "mobile app developer",
            "288",
            "28.8%",
            "9.3%",
            "too few"
          ],
          [
            "events",
            "269",
            "30.1%",
            "12.2%",
            "too few"
          ],
          [
            "Java developer",
            "252",
            "21.0%",
            "11.6%",
            "too few"
          ],
          [
            "data engineer",
            "236",
            "9.7%",
            "8.9%",
            "too few"
          ],
          [
            "business analyst",
            "228",
            "29.8%",
            "4.4%",
            "too few"
          ],
          [
            "associate product manager",
            "227",
            "26.4%",
            "7.2%",
            "too few"
          ],
          [
            "medical representative",
            "189",
            "0.0%",
            "36.0%",
            "4 lakh"
          ],
          [
            "network engineer",
            "160",
            "5.0%",
            "28.3%",
            "3.5 lakh"
          ],
          [
            "PR and communications",
            "136",
            "42.6%",
            "12.8%",
            "too few"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many generic titles match none."
      }
    },
    {
      "title": "Where are the fresher jobs in India?",
      "sub": "The cities with the most listings",
      "paras": [
        "Mumbai (21,016 listings) and Bengaluru (20,817) are almost level at the top, each with about 12% of all listings. Chennai (11,860), Hyderabad (11,719) and Delhi (10,249) form the next tier, with Pune, Gurugram, Ahmedabad and Noida close behind.",
        "Internships cluster differently. Mumbai has 2,122 and Bengaluru 2,090, but Delhi (1,393) and Noida (1,031) carry far more internships than their job counts suggest, while Chennai has 658 internships against 11,860 listings.",
        "8,995 listings are marked remote, which is 5.3% of the index. 11,816 name no city at all. Every city in the table has its own report, and the internship cities have theirs."
      ],
      "chart": {
        "id": "rsjio2100Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=170,927)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Chennai",
          "Hyderabad",
          "Delhi",
          "Pune",
          "Gurugram",
          "Ahmedabad",
          "Noida",
          "Kolkata"
        ],
        "values": [
          21016,
          20817,
          11860,
          11719,
          10249,
          9664,
          9378,
          8448,
          8043,
          3953
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "City",
          "Listings",
          "Internships"
        ],
        "rows": [
          [
            "Mumbai",
            "21,016",
            "2,122"
          ],
          [
            "Bengaluru",
            "20,817",
            "2,090"
          ],
          [
            "Chennai",
            "11,860",
            "658"
          ],
          [
            "Hyderabad",
            "11,719",
            "933"
          ],
          [
            "Delhi",
            "10,249",
            "1,393"
          ],
          [
            "Pune",
            "9,664",
            "966"
          ],
          [
            "Gurugram",
            "9,378",
            "942"
          ],
          [
            "Ahmedabad",
            "8,448",
            "421"
          ],
          [
            "Noida",
            "8,043",
            "1,031"
          ],
          [
            "Kolkata",
            "3,953",
            "249"
          ],
          [
            "Jaipur",
            "3,413",
            "344"
          ],
          [
            "Chandigarh",
            "2,749",
            "188"
          ],
          [
            "Coimbatore",
            "2,675",
            "108"
          ],
          [
            "Vadodara",
            "2,645",
            "65"
          ],
          [
            "Indore",
            "2,308",
            "212"
          ],
          [
            "Kochi",
            "2,095",
            "127"
          ],
          [
            "Surat",
            "1,891",
            "76"
          ],
          [
            "Lucknow",
            "1,878",
            "162"
          ],
          [
            "Nagpur",
            "1,438",
            "97"
          ],
          [
            "Bhubaneswar",
            "1,293",
            "65"
          ]
        ]
      }
    },
    {
      "title": "What is the average fresher salary in India?",
      "sub": "What listings that state pay actually offer",
      "paras": [
        "43,254 entry-level listings state a salary in rupees, 28.4% of all jobs. Taking the top of each stated range, the median is ₹4 lakh a year and the middle half runs from ₹3 lakh to ₹5 lakh. 48.3% sit in the ₹3 to 5 lakh band, and only 4.0% offer ₹8 to 12 lakh.",
        "Internships are far quieter about money. Only 385 of 18,458 internships state a stipend in rupees. Among those, the median top of range is ₹15,000 a month and 46.8% fall between ₹10,000 and ₹20,000.",
        "So the honest answer to what a fresher earns is that most listings will not tell you. Read a stated range as the ceiling, ask about pay before you accept, and use the salary and stipend reports on this page for your role and city."
      ],
      "chart": {
        "id": "rsjio2100Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (43,254 jobs that state pay in rupees)",
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
          2283,
          7490,
          20876,
          9544,
          1733,
          609,
          719
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do employers ask freshers for?",
      "sub": "The skills and job titles that come up most",
      "paras": [
        "We read the 147,916 listings with a full description (86.5% of the index). Communication skills come up in 60.2% of them and English in 21.8%. Excel appears in 13.7%, calling or telecalling in 10.4% and CRM tools in 9.0%. Freshers are named outright in 21.8% of descriptions and targets in 20.5%.",
        "The most posted job titles are a snapshot of the volume: Associate Housekeeping (2,811 listings), Business Development Associate (1,348), Customer Support Executive (1,199) and Sales Executive (1,071). The skills report and the fresher jobs list on this page break both down by role.",
        "Then there is the part no chart shows. Only 7.0% of listings with a description give an email address. The rest route you through a form that hundreds of others fill in. The people who stand out find the hiring manager and write to them directly."
      ],
      "chart": {
        "id": "rsjio2100Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (147,916 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "social media",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "Python"
        ],
        "values": [
          60.2,
          21.8,
          13.7,
          10.4,
          9.0,
          7.2,
          7.2,
          5.4,
          3.3,
          3.1
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Associate Housekeeping",
            "2,811"
          ],
          [
            "Business Development Associate",
            "1,348"
          ],
          [
            "Customer Support Executive",
            "1,199"
          ],
          [
            "Sales Executive",
            "1,071"
          ],
          [
            "Business Development Executive",
            "923"
          ],
          [
            "Customer Service Executive",
            "854"
          ],
          [
            "Business Development (Sales) Internship",
            "596"
          ],
          [
            "Record To Report Ops Associate",
            "570"
          ],
          [
            "Field Sales Executive",
            "566"
          ],
          [
            "Steward",
            "549"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 47,920 different employers posted these listings, and 5.8% of listings do not name the employer."
      }
    }
  ],
  "method": [
    "This report counts **170,927 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. It covers every listing in the index for that month.",
    "Pay: 43,254 of 152,469 entry-level listings (28.4%) state a salary in rupees and 385 of 18,458 internships (2.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 147,916 listings (86.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many fresher jobs were posted in India in October 2026?",
      "a": "The Studojo Jobs Index holds 170,927 active entry-level and internship listings for India posted in October 2026: 152,469 entry-level jobs and 18,458 internships. These are listings on job boards and company career pages, not hires, and the same opening can appear on two sites."
    },
    {
      "q": "What is the average fresher salary in India in 2026?",
      "a": "Among the 43,254 entry-level listings that state a salary in rupees, the median top of the stated range is ₹4 lakh a year, and the middle half runs from ₹3 lakh to ₹5 lakh. Only 28.4% of entry-level listings state pay at all, so read this as what employers advertise."
    },
    {
      "q": "How much do internships in India pay?",
      "a": "Only 385 of 18,458 internship listings (2.1%) state a stipend in rupees. Among those, the median top of range is ₹15,000 a month and 46.8% sit between ₹10,000 and ₹20,000. Most internship listings say nothing about pay, so ask before you accept."
    },
    {
      "q": "Which city has the most fresher jobs in India?",
      "a": "Mumbai, with 21,016 October listings, just ahead of Bengaluru with 20,817. Chennai (11,860), Hyderabad (11,719) and Delhi (10,249) come next. For internships, Mumbai and Bengaluru lead again, with Delhi and Noida close behind."
    },
    {
      "q": "On which day are most jobs posted in India?",
      "a": "Wednesday carried 20.0% of October listings, Monday 19.6% and Thursday 19.6%, while Sunday carried only 1.9%. October 2026 had five Thursdays, Fridays and Saturdays, so compare shares with care; the best-day report on this page goes further."
    },
    {
      "q": "Can I cite the Studojo Jobs Index?",
      "a": "Yes. Cite it as Studojo Jobs Index, October 2026, and link this page. Every report built on the index states its own count, its filters and its method, so you can quote any of them directly."
    }
  ],
  "takeaway": {
    "sub": "Use the index to aim, then reach the person who hires",
    "items": [
      [
        "Pick the role and city where the volume is",
        "The tables above show where the listings are. A role with thousands of listings in your city gives you more doors to knock on."
      ],
      [
        "Treat stated pay as the ceiling",
        "Only 28.4% of jobs and 2.1% of internships state pay. Ask early, and use the salary report for your role to set your number."
      ],
      [
        "Build the one skill the listings repeat",
        "Communication and Excel show up across roles. The role reports show the skill that matters for yours."
      ],
      [
        "Do not stop at the form",
        "Only 7.0% of listings with a description give you an email. Find the hiring manager for the role and write to them with one piece of real work."
      ],
      [
        "Let Stu do the slow parts",
        "Stu finds jobs from this index that fit you, finds who is hiring, verifies the work email and writes the email for you to send."
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
      "slug": "fresher-jobs-list-india-2026",
      "kicker": "Data",
      "title": "Fresher Jobs List India 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Studojo Jobs Index, October 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (the Studojo Jobs Index), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
    "variables": [
      "listings",
      "city",
      "stated salary (INR, top of range)",
      "stated stipend (INR per month)",
      "skills and terms mentioned",
      "posting weekday"
    ]
  },
  "directory": {
    "title": "Every report and guide built on this index",
    "sub": "100 data reports, newest first by topic",
    "groups": [
      {
        "heading": "Pay, skills and the shape of the market",
        "links": [
          {
            "href": "/reports/fresher-salary-india-2026",
            "label": "Fresher Salary in India 2026"
          },
          {
            "href": "/reports/skills-in-demand-fresher-jobs-india-2026",
            "label": "Skills in Demand for Freshers 2026"
          },
          {
            "href": "/reports/fresher-jobs-list-india-2026",
            "label": "Fresher Jobs List India 2026"
          },
          {
            "href": "/reports/internship-stipend-india-2026",
            "label": "Internship Stipend in India 2026"
          },
          {
            "href": "/reports/pay-transparency-fresher-jobs-india-2026",
            "label": "Fresher Jobs That Show Salary in India 2026"
          },
          {
            "href": "/reports/work-from-office-vs-hybrid-fresher-jobs-2026",
            "label": "Work From Office vs Hybrid Jobs 2026"
          },
          {
            "href": "/reports/night-shift-jobs-for-freshers-india-2026",
            "label": "Night Shift Jobs for Freshers 2026"
          },
          {
            "href": "/reports/immediate-joiner-jobs-for-freshers-2026",
            "label": "Immediate Joiner Jobs for Freshers 2026"
          },
          {
            "href": "/reports/internships-with-ppo-india-2026",
            "label": "Internship With PPO in India 2026"
          },
          {
            "href": "/reports/best-day-to-apply-for-jobs-india-2026",
            "label": "Best Day to Apply for Jobs India 2026"
          },
          {
            "href": "/reports/english-and-hindi-job-requirements-india-2026",
            "label": "English and Hindi Jobs for Freshers 2026"
          },
          {
            "href": "/reports/sales-jobs-with-incentives-freshers-2026",
            "label": "Sales Jobs With Incentives 2026"
          },
          {
            "href": "/reports/fresher-jobs-with-pf-and-health-insurance-2026",
            "label": "Jobs With PF and Insurance for Freshers"
          }
        ]
      },
      {
        "heading": "Jobs for freshers, by role",
        "links": [
          {
            "href": "/reports/data-analyst-jobs-for-freshers-india-2026",
            "label": "Data Analyst Jobs for Freshers 2026"
          },
          {
            "href": "/reports/software-developer-jobs-for-freshers-india-2026",
            "label": "Software Developer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/digital-marketing-jobs-for-freshers-india-2026",
            "label": "Digital Marketing Jobs for Freshers 2026"
          },
          {
            "href": "/reports/hr-jobs-for-freshers-india-2026",
            "label": "HR Jobs for Freshers 2026"
          },
          {
            "href": "/reports/accountant-jobs-for-freshers-india-2026",
            "label": "Accountant Jobs for Freshers 2026"
          },
          {
            "href": "/reports/business-development-jobs-for-freshers-india-2026",
            "label": "Business Development Jobs for Freshers 2026"
          },
          {
            "href": "/reports/customer-service-jobs-for-freshers-india-2026",
            "label": "Customer Service Jobs for Freshers 2026"
          },
          {
            "href": "/reports/graphic-designer-jobs-for-freshers-india-2026",
            "label": "Graphic Designer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/content-writer-jobs-for-freshers-india-2026",
            "label": "Content Writer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/business-analyst-jobs-for-freshers-india-2026",
            "label": "Business Analyst Jobs for Freshers 2026"
          },
          {
            "href": "/reports/financial-analyst-jobs-for-freshers-india-2026",
            "label": "Finance Jobs for Freshers 2026"
          },
          {
            "href": "/reports/operations-executive-jobs-for-freshers-india-2026",
            "label": "Operations Executive Jobs 2026"
          },
          {
            "href": "/reports/supply-chain-jobs-for-freshers-india-2026",
            "label": "Supply Chain Jobs for Freshers 2026"
          },
          {
            "href": "/reports/ui-ux-designer-jobs-for-freshers-india-2026",
            "label": "UI/UX Designer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/social-media-jobs-for-freshers-india-2026",
            "label": "Social Media Jobs for Freshers 2026"
          },
          {
            "href": "/reports/seo-jobs-for-freshers-india-2026",
            "label": "SEO Jobs for Freshers 2026"
          },
          {
            "href": "/reports/telecaller-jobs-for-freshers-india-2026",
            "label": "Telecaller Jobs for Freshers 2026"
          },
          {
            "href": "/reports/relationship-manager-jobs-for-freshers-india-2026",
            "label": "Relationship Manager Jobs 2026"
          },
          {
            "href": "/reports/qa-tester-jobs-for-freshers-india-2026",
            "label": "QA and Testing Jobs for Freshers 2026"
          },
          {
            "href": "/reports/devops-cloud-jobs-for-freshers-india-2026",
            "label": "DevOps and Cloud Jobs for Freshers 2026"
          },
          {
            "href": "/reports/java-developer-jobs-for-freshers-india-2026",
            "label": "Java Developer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/python-developer-jobs-for-freshers-india-2026",
            "label": "Python Developer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/frontend-developer-jobs-for-freshers-india-2026",
            "label": "Front-End Developer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/full-stack-developer-jobs-for-freshers-india-2026",
            "label": "Full Stack Developer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/sap-jobs-for-freshers-india-2026",
            "label": "SAP Jobs for Freshers 2026"
          },
          {
            "href": "/reports/audit-jobs-for-freshers-india-2026",
            "label": "Audit Jobs for Freshers 2026"
          },
          {
            "href": "/reports/process-associate-jobs-for-freshers-india-2026",
            "label": "Process Associate Jobs for Freshers 2026"
          },
          {
            "href": "/reports/video-editor-jobs-for-freshers-india-2026",
            "label": "Video Editor Jobs for Freshers 2026"
          },
          {
            "href": "/reports/interior-designer-jobs-for-freshers-india-2026",
            "label": "Interior Designer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/mechanical-engineer-jobs-for-freshers-india-2026",
            "label": "Mechanical Engineer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/civil-engineer-jobs-for-freshers-india-2026",
            "label": "Civil Engineer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/electrical-engineer-jobs-for-freshers-india-2026",
            "label": "Electrical Engineer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/academic-counsellor-jobs-for-freshers-india-2026",
            "label": "Academic Counsellor Jobs for Freshers 2026"
          },
          {
            "href": "/reports/hotel-hospitality-jobs-for-freshers-india-2026",
            "label": "Hotel and Hospitality Jobs for Freshers 2026"
          },
          {
            "href": "/reports/legal-jobs-for-freshers-india-2026",
            "label": "Legal Jobs for Freshers in India 2026"
          },
          {
            "href": "/reports/machine-learning-jobs-for-freshers-india-2026",
            "label": "AI and ML Jobs for Freshers 2026"
          },
          {
            "href": "/reports/data-scientist-jobs-for-freshers-india-2026",
            "label": "Data Scientist Jobs for Freshers 2026"
          },
          {
            "href": "/reports/data-engineer-jobs-for-freshers-india-2026",
            "label": "Data Engineer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/mobile-developer-jobs-for-freshers-india-2026",
            "label": "Mobile App Developer Jobs for Freshers 2026"
          },
          {
            "href": "/reports/technical-support-jobs-for-freshers-india-2026",
            "label": "Technical Support Jobs for Freshers 2026"
          },
          {
            "href": "/reports/field-sales-jobs-for-freshers-india-2026",
            "label": "Field Sales Jobs for Freshers 2026"
          },
          {
            "href": "/reports/retail-sales-jobs-for-freshers-india-2026",
            "label": "Retail Sales Jobs for Freshers 2026"
          },
          {
            "href": "/reports/teacher-jobs-for-freshers-india-2026",
            "label": "Teaching Jobs for Freshers 2026"
          },
          {
            "href": "/reports/pharmacist-jobs-for-freshers-india-2026",
            "label": "Pharmacist Jobs for Freshers 2026"
          },
          {
            "href": "/reports/lab-chemist-jobs-for-freshers-india-2026",
            "label": "Lab and QC Jobs for Freshers 2026"
          },
          {
            "href": "/reports/content-moderator-jobs-for-freshers-india-2026",
            "label": "Trust and Safety Jobs for Freshers 2026"
          },
          {
            "href": "/reports/management-trainee-jobs-india-2026",
            "label": "Management Trainee Jobs for Freshers 2026"
          },
          {
            "href": "/reports/graduate-engineer-trainee-jobs-india-2026",
            "label": "Graduate Engineer Trainee Jobs 2026"
          },
          {
            "href": "/reports/product-manager-jobs-for-freshers-india-2026",
            "label": "Associate Product Manager Jobs 2026"
          }
        ]
      },
      {
        "heading": "Jobs for freshers, by city",
        "links": [
          {
            "href": "/reports/jobs-for-freshers-in-mumbai-2026",
            "label": "Jobs for Freshers in Mumbai 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-chennai-2026",
            "label": "Jobs for Freshers in Chennai 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-hyderabad-2026",
            "label": "Jobs for Freshers in Hyderabad 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-delhi-2026",
            "label": "Jobs for Freshers in Delhi 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-gurgaon-2026",
            "label": "Jobs for Freshers in Gurgaon 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-ahmedabad-2026",
            "label": "Jobs for Freshers in Ahmedabad 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-noida-2026",
            "label": "Jobs for Freshers in Noida 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-kolkata-2026",
            "label": "Jobs for Freshers in Kolkata 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-jaipur-2026",
            "label": "Jobs for Freshers in Jaipur 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-chandigarh-2026",
            "label": "Jobs for Freshers in Chandigarh 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-coimbatore-2026",
            "label": "Jobs for Freshers in Coimbatore 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-vadodara-2026",
            "label": "Jobs for Freshers in Vadodara 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-indore-2026",
            "label": "Jobs for Freshers in Indore 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-kochi-2026",
            "label": "Jobs for Freshers in Kochi 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-surat-2026",
            "label": "Jobs for Freshers in Surat 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-lucknow-2026",
            "label": "Jobs for Freshers in Lucknow 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-nagpur-2026",
            "label": "Jobs for Freshers in Nagpur 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-bhubaneswar-2026",
            "label": "Jobs for Freshers in Bhubaneswar 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-bhopal-2026",
            "label": "Jobs for Freshers in Bhopal 2026"
          },
          {
            "href": "/reports/jobs-for-freshers-in-visakhapatnam-2026",
            "label": "Jobs for Freshers in Visakhapatnam 2026"
          }
        ]
      },
      {
        "heading": "Internships, by city",
        "links": [
          {
            "href": "/reports/internships-mumbai-2026",
            "label": "Internships in Mumbai 2026"
          },
          {
            "href": "/reports/internships-delhi-ncr-2026",
            "label": "Internships in Delhi NCR 2026"
          },
          {
            "href": "/reports/internships-chennai-2026",
            "label": "Internships in Chennai 2026"
          },
          {
            "href": "/reports/internships-ahmedabad-2026",
            "label": "Internships in Ahmedabad 2026"
          },
          {
            "href": "/reports/internships-jaipur-2026",
            "label": "Internships in Jaipur 2026"
          },
          {
            "href": "/reports/internships-kolkata-2026",
            "label": "Internships in Kolkata 2026"
          }
        ]
      },
      {
        "heading": "A role in a city",
        "links": [
          {
            "href": "/reports/customer-service-jobs-in-bangalore-for-freshers-2026",
            "label": "Customer Service Jobs in Bangalore 2026"
          },
          {
            "href": "/reports/customer-service-jobs-in-hyderabad-for-freshers-2026",
            "label": "Customer Service Jobs in Hyderabad 2026"
          },
          {
            "href": "/reports/hr-jobs-in-bangalore-for-freshers-2026",
            "label": "HR Jobs in Bangalore for Freshers 2026"
          },
          {
            "href": "/reports/hr-jobs-in-mumbai-for-freshers-2026",
            "label": "HR Jobs in Mumbai for Freshers 2026"
          },
          {
            "href": "/reports/business-development-jobs-in-bangalore-for-freshers-2026",
            "label": "Business Development Jobs in Bangalore 2026"
          },
          {
            "href": "/reports/hotel-hospitality-jobs-in-mumbai-for-freshers-2026",
            "label": "Hotel Jobs in Mumbai for Freshers 2026"
          },
          {
            "href": "/reports/field-sales-jobs-in-mumbai-for-freshers-2026",
            "label": "Field Sales Jobs in Mumbai for Freshers 2026"
          },
          {
            "href": "/reports/accountant-jobs-in-mumbai-for-freshers-2026",
            "label": "Accountant Jobs in Mumbai for Freshers 2026"
          }
        ]
      },
      {
        "heading": "By degree",
        "links": [
          {
            "href": "/reports/jobs-for-btech-freshers-2026",
            "label": "Jobs for BTech Freshers 2026"
          },
          {
            "href": "/reports/jobs-for-mba-freshers-2026",
            "label": "Jobs for MBA Freshers 2026"
          },
          {
            "href": "/reports/jobs-for-any-graduate-freshers-2026",
            "label": "Jobs for Any Graduate Freshers 2026"
          },
          {
            "href": "/reports/jobs-for-12th-pass-2026",
            "label": "Jobs for 12th Pass 2026"
          }
        ]
      },
      {
        "heading": "Guides: emails and messages",
        "links": [
          {
            "href": "/blog/how-to-accept-a-job-offer-email",
            "label": "How to Accept Job Offer via Email: 3 Samples You Can Copy"
          },
          {
            "href": "/blog/how-to-reject-a-job-offer-politely",
            "label": "How to Reject a Job Offer Politely (Email Samples Included)"
          },
          {
            "href": "/blog/how-to-reply-to-interview-invitation-email",
            "label": "How to Reply to Interview Invitation Email: 3 Samples to Copy"
          },
          {
            "href": "/blog/how-to-email-recruiter-for-update-after-interview",
            "label": "How to Email Recruiter for Update After Interview (3 Samples)"
          },
          {
            "href": "/blog/how-to-email-recruiter-after-rejection",
            "label": "How to Email Recruiter After Rejection: Reply Samples That Work"
          },
          {
            "href": "/blog/how-to-ask-for-interview-feedback-email",
            "label": "How to Write Email for Interview Feedback (With Samples)"
          },
          {
            "href": "/blog/how-to-ask-for-offer-letter-status",
            "label": "How to Ask for Offer Letter Status Politely (3 Email Samples)"
          },
          {
            "href": "/blog/how-to-ask-for-joining-date-extension",
            "label": "How to Ask for Joining Date Extension by Email (3 Samples)"
          },
          {
            "href": "/blog/how-to-withdraw-job-application",
            "label": "How to Withdraw Job Application: Email and Portal Steps, 3 Samples"
          },
          {
            "href": "/blog/salary-negotiation-email-after-job-offer",
            "label": "Salary Negotiation Email After Job Offer: Fresher Samples (India)"
          },
          {
            "href": "/blog/cold-email-for-data-analyst-job",
            "label": "Cold Email for Data Analyst Job: 4 Samples That Work"
          },
          {
            "href": "/blog/cold-email-for-marketing-job",
            "label": "Cold Email for Marketing Job: 4 Samples for Freshers"
          },
          {
            "href": "/blog/cold-email-for-hr-job",
            "label": "Cold Email to HR for Job: 4 Samples for HR Roles"
          },
          {
            "href": "/blog/cold-email-for-finance-job",
            "label": "Cold Email for Finance Job: 4 Samples with a Model Attached"
          },
          {
            "href": "/blog/cold-email-for-graphic-designer-job",
            "label": "Cold Email for Graphic Design Job: 4 Samples with Portfolio"
          },
          {
            "href": "/blog/cold-email-for-content-writer-job",
            "label": "Cold Email for Content Writer Job: 4 Samples with Pitch"
          },
          {
            "href": "/blog/cold-email-for-business-analyst-job",
            "label": "Cold Email for Business Analyst Job: 4 Samples for Freshers"
          },
          {
            "href": "/blog/cold-email-for-sales-job",
            "label": "Cold Email for Sales Job: 4 Samples for BDE and Sales Roles"
          },
          {
            "href": "/blog/cold-email-for-ui-ux-designer-job",
            "label": "Cold Email for UI UX Designer Job: 4 Samples with Case Study"
          },
          {
            "href": "/blog/cold-email-for-accountant-job",
            "label": "Cold Email for Accountant Job: 4 Samples for Tally and GST Roles"
          },
          {
            "href": "/blog/cold-email-for-product-manager-job",
            "label": "Cold Email for Product Manager Job: 3 Samples That Work"
          },
          {
            "href": "/blog/cold-email-for-consulting-job",
            "label": "Cold Email for Consulting Job: Template and 3 Samples"
          },
          {
            "href": "/blog/cold-email-for-operations-job",
            "label": "Cold Email for Operations Job: Samples for Freshers"
          },
          {
            "href": "/blog/cold-email-to-startup-founder-for-job",
            "label": "Cold Email to Startup Founder for Job: What to Send"
          },
          {
            "href": "/blog/message-to-hiring-manager-for-internship",
            "label": "Message to Hiring Manager for Internship: 4 Samples"
          },
          {
            "href": "/blog/linkedin-message-to-recruiter-after-applying",
            "label": "LinkedIn Message to Recruiter After Applying: 4 Samples"
          },
          {
            "href": "/blog/linkedin-connection-request-note-for-job",
            "label": "LinkedIn Connection Request Message for Job: 6 Samples"
          },
          {
            "href": "/blog/how-to-ask-for-job-vacancy-email",
            "label": "How to Ask for Job Vacancy by Email: 4 Samples"
          },
          {
            "href": "/blog/email-to-alumni-for-referral",
            "label": "Email to Alumni for Referral: How to Ask, With 4 Samples"
          },
          {
            "href": "/blog/how-to-ask-about-salary-in-interview",
            "label": "How to Ask About Salary in an Interview: What to Say"
          }
        ]
      },
      {
        "heading": "Guides: interviews",
        "links": [
          {
            "href": "/blog/tell-me-about-yourself-for-freshers",
            "label": "Tell Me About Yourself for Freshers: Structure and Samples"
          },
          {
            "href": "/blog/why-should-we-hire-you-fresher-answer",
            "label": "Why Should We Hire You Answer for Fresher: Samples That Work"
          },
          {
            "href": "/blog/salary-expectation-answer-for-fresher",
            "label": "Salary Expectation Answer for Fresher: Scripts and Ranges"
          },
          {
            "href": "/blog/strengths-and-weaknesses-for-freshers",
            "label": "Strengths and Weaknesses for Freshers: Real Answers and Samples"
          },
          {
            "href": "/blog/why-do-you-want-to-join-our-company-answer",
            "label": "Why Do You Want to Join Our Company: Answer and Samples"
          },
          {
            "href": "/blog/where-do-you-see-yourself-in-5-years-answer",
            "label": "Where Do You See Yourself in 5 Years: Fresher Answer Samples"
          },
          {
            "href": "/blog/do-you-have-any-questions-for-us-answer",
            "label": "Do You Have Any Questions for Us? 8 Questions Freshers Can Ask"
          },
          {
            "href": "/blog/how-to-explain-gap-in-interview",
            "label": "How to Explain a Gap in an Interview: Scripts That Work"
          },
          {
            "href": "/blog/group-discussion-tips-for-placement",
            "label": "Group Discussion Tips for Placement: How to Enter, Speak, Close"
          },
          {
            "href": "/blog/how-to-prepare-for-interview-using-ai",
            "label": "How to Prepare for Interview Using AI: ChatGPT and Claude"
          }
        ]
      },
      {
        "heading": "Guides: getting hired in a role",
        "links": [
          {
            "href": "/blog/how-to-get-data-analyst-job-as-a-fresher",
            "label": "How to Get a Data Analyst Job as a Fresher in India (2026)"
          },
          {
            "href": "/blog/how-to-get-business-analyst-job-as-a-fresher",
            "label": "How to Get a Business Analyst Job as a Fresher (India, 2026)"
          },
          {
            "href": "/blog/how-to-get-a-data-scientist-job-as-a-fresher",
            "label": "How to Get a Data Scientist Job as a Fresher (India, 2026)"
          },
          {
            "href": "/blog/how-to-get-a-software-engineering-job-with-no-experience",
            "label": "How to Get a Software Engineering Job With No Experience (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-it-company-without-coding",
            "label": "How to Get a Job in an IT Company Without Coding (India, 2026)"
          },
          {
            "href": "/blog/how-to-become-a-ui-ux-designer-with-no-experience",
            "label": "How to Become a UI UX Designer With No Experience (India, 2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-as-a-graphic-designer-with-no-experience",
            "label": "How to Get a Job as a Graphic Designer With No Experience (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-as-a-content-writer",
            "label": "How to Get a Job as a Content Writer With No Experience (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-as-a-video-editor",
            "label": "How to Get a Job as a Video Editor With No Experience (2026)"
          },
          {
            "href": "/blog/how-to-get-a-qa-tester-job-as-a-fresher",
            "label": "How to Get a QA Tester Job as a Fresher in India (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-digital-marketing-as-a-fresher",
            "label": "How to Get a Job in Digital Marketing as a Fresher (India, 2026)"
          },
          {
            "href": "/blog/how-to-get-hr-job-as-a-fresher",
            "label": "How to Get an HR Job as a Fresher in India (2026 Data)"
          },
          {
            "href": "/blog/how-to-become-a-recruiter-with-no-experience",
            "label": "How to Become a Recruiter With No Experience (India, 2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-as-an-accountant-with-no-experience",
            "label": "How to Get a Job as an Accountant With No Experience (India)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-finance-as-a-fresher",
            "label": "How to Get a Job in Finance as a Fresher (India, 2026)"
          },
          {
            "href": "/blog/how-to-become-a-financial-analyst-after-bcom",
            "label": "How to Become a Financial Analyst After BCom (India, 2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-sales-with-no-experience",
            "label": "How to Get a Job in Sales With No Experience (India, 2026)"
          },
          {
            "href": "/blog/how-to-become-a-relationship-manager-in-bank",
            "label": "How to Become a Relationship Manager in a Bank (Freshers, 2026)"
          },
          {
            "href": "/blog/how-to-get-job-in-private-bank-without-exam",
            "label": "How to Get a Job in a Bank Without an Exam: Private Banks (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-customer-service-with-no-experience",
            "label": "How to Get a Job in Customer Service With No Experience (India)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-operations-as-a-fresher",
            "label": "How to Get a Job in Operations as a Fresher (2026 Guide)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-supply-chain-with-no-experience",
            "label": "How to Get a Job in Supply Chain With No Experience (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-consulting-with-no-experience",
            "label": "How to Get a Job in Consulting With No Experience (India 2026)"
          },
          {
            "href": "/blog/how-to-switch-career-from-non-it-to-it",
            "label": "How to Switch Career From Non IT to IT Without Experience"
          },
          {
            "href": "/blog/how-to-switch-career-from-bpo-to-it",
            "label": "How to Switch Career From BPO to IT: Paths, Proof, Emails"
          },
          {
            "href": "/blog/how-to-get-a-job-in-hotel-management-as-a-fresher",
            "label": "Hotel Management Jobs for Freshers: Roles, Pay, How to Apply"
          },
          {
            "href": "/blog/how-to-get-a-mechanical-engineering-job-as-a-fresher",
            "label": "Mechanical Engineering Jobs for Freshers: Core Routes and Pay"
          },
          {
            "href": "/blog/how-to-get-a-civil-engineering-job-as-a-fresher",
            "label": "Civil Engineering Jobs for Freshers: Site, Design and QS"
          },
          {
            "href": "/blog/how-to-get-an-seo-job-as-a-fresher",
            "label": "How to Get an SEO Job as a Fresher: Skills, Pay, Proof"
          },
          {
            "href": "/blog/how-to-get-a-legal-job-as-a-fresher",
            "label": "Legal Jobs for Freshers: Firms, In-House and Compliance Routes"
          }
        ]
      },
      {
        "heading": "Guides: degrees, offers and first jobs",
        "links": [
          {
            "href": "/blog/how-to-get-a-job-after-btech-cse",
            "label": "How to Get a Job After BTech CSE Off Campus (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-after-bca",
            "label": "How to Get a Job After BCA: 4 Routes and a Sample Email"
          },
          {
            "href": "/blog/how-to-get-a-job-after-mca",
            "label": "How to Get a Job After MCA: Positioning, Projects and Outreach"
          },
          {
            "href": "/blog/how-to-get-a-job-after-mba-with-no-experience",
            "label": "How to Get a Job After MBA With No Experience: 2026 Guide"
          },
          {
            "href": "/blog/how-to-get-it-job-after-mechanical-engineering",
            "label": "How to Get a Job in an IT Company After Mechanical Engineering"
          },
          {
            "href": "/blog/how-to-get-a-job-after-career-break",
            "label": "How to Get a Job After a Career Break: Explain It, Refresh, Email"
          },
          {
            "href": "/blog/how-to-get-a-job-with-backlogs",
            "label": "How to Get a Job With Backlogs: Who Filters and How to Answer"
          },
          {
            "href": "/blog/how-to-get-a-job-after-12th",
            "label": "How to Get a Job After 12th: Real Options, Pay and Scams"
          },
          {
            "href": "/blog/jobs-without-degree-in-india",
            "label": "Jobs Without Degree in India: Roles, Pay and How to Get In"
          },
          {
            "href": "/blog/campus-placement-vs-off-campus",
            "label": "Campus Placement vs Off Campus Placement: Which Is Better?"
          },
          {
            "href": "/blog/offer-letter-vs-appointment-letter",
            "label": "Offer Letter and Appointment Letter Difference: What Each Says"
          },
          {
            "href": "/blog/how-to-check-if-offer-letter-is-fake",
            "label": "Fake Offer Letter Check: 10 Minute Steps to Verify a Job Offer"
          },
          {
            "href": "/blog/probation-period-meaning-for-freshers",
            "label": "Probation Period Meaning in a Job: Salary, Notice and Rules"
          },
          {
            "href": "/blog/stipend-vs-salary",
            "label": "Stipend vs Salary: What Each Means and What to Check in an Offer"
          },
          {
            "href": "/blog/what-is-ppo-in-internship",
            "label": "PPO in Internship: Meaning, Full Form and How to Get One"
          },
          {
            "href": "/blog/first-job-salary-expectations-india",
            "label": "First Job Salary Expectations in India: What Listings Really Pay"
          },
          {
            "href": "/blog/jobs-without-interview-for-freshers",
            "label": "Jobs Without Interview for Freshers: What Direct Joining Means"
          },
          {
            "href": "/blog/work-from-home-jobs-for-freshers-without-investment",
            "label": "Work From Home Jobs for Freshers Without Investment: Real vs Scam"
          },
          {
            "href": "/blog/how-to-get-a-remote-job-as-a-fresher",
            "label": "How to Get a Remote Job as a Fresher in India: A Practical Plan"
          },
          {
            "href": "/blog/night-shift-jobs-for-freshers-what-to-know",
            "label": "Night Shift Jobs for Freshers: Pay, Cab, Allowance and Health"
          }
        ]
      },
      {
        "heading": "Guides: jobs abroad",
        "links": [
          {
            "href": "/blog/how-to-get-a-job-in-germany-from-india",
            "label": "How to Get a Job in Germany From India as a Fresher (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-canada-from-india",
            "label": "How to Get a Job in Canada From India as a Fresher (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-usa-from-india",
            "label": "How to Get a Job in the USA From India as a Fresher (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-uk-from-india",
            "label": "How to Get a Job in the UK From India as a Fresher (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-australia-from-india",
            "label": "How to Get a Job in Australia From India as a Fresher (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-japan-from-india",
            "label": "How to Get a Job in Japan From India: Visa, JLPT and Tech Roles"
          },
          {
            "href": "/blog/how-to-get-a-job-in-netherlands-from-india",
            "label": "How to Get a Job in the Netherlands From India (2026)"
          },
          {
            "href": "/blog/how-to-get-a-remote-job-in-europe-from-india",
            "label": "How to Get a Remote Job in Europe From India (Contractor or EOR)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-dubai-as-a-fresher",
            "label": "Jobs in Dubai for Freshers: How to Get Hired From India (2026)"
          },
          {
            "href": "/blog/how-to-get-a-job-in-singapore-as-a-fresher",
            "label": "Jobs in Singapore for Indian Freshers: EP and COMPASS (2026)"
          }
        ]
      }
    ]
  }
};

export function meta() {
  return dataReportMeta(R);
}

export default function Report() {
  return (
    <DataReport r={R}>
      <StuCta via="report-studojo-jobs-index-october-2026" place="report-end" size="card" title={"Want the jobs in this index that fit you?"} line={"Tell Stu the role, the city and the pay you want in one short call. Stu finds jobs that fit you and the person hiring, and writes the email for you to send from your own inbox."} />
    </DataReport>
  );
}
