import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internships-chennai-2026",
  "title": "Internships in Chennai 2026: 658 Listings, 19 With a Stipend",
  "short": "Internships in Chennai 2026",
  "description": "Internships in Chennai: 658 October listings, and only 19 state a stipend (median ₹14,583 a month). See the roles, skills and how to judge an offer.",
  "keywords": "internships in chennai, paid internship in chennai, internship in chennai for students, stipend in chennai, how to get an internship in chennai",
  "h1": "Internships in Chennai:",
  "h1em": "658 Listings, 19 State Pay",
  "sub": "We tracked 658 Chennai internship listings posted in October 2026. Only 19 state a stipend in rupees, with a median of ₹14,583 a month. For the rest you need to ask what the role pays before you commit.",
  "published": "2026-11-11",
  "scope": "Chennai · internships",
  "findings": [
    "Internships in Chennai come to **658 October listings** in the Studojo Jobs Index, from 396 different employers.",
    "**Just 19 listings (2.9%) state a stipend in rupees.** The median of the top of those ranges is ₹14,583 a month, and 10 of the 19 fall between ₹10,000 and 20,000.",
    "**Chennai has a technical streak.** 14.3% of listings with a full description mention BTech, BE or computer science, and Python (7.3%) and cloud (7.2%) both show up.",
    "**A certificate appears in 173 listings (29.5%), unpaid in 8 (1.4%).** Treat a certificate as a bonus, never as a substitute for a stated stipend.",
    "**The move that works is emailing the person who runs the team.** Stu finds that person, verifies their work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "658",
      "label": "Internships listed in Chennai, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "2.9%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "19.4%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Which internships in Chennai are on offer?",
      "sub": "Role groups across 658 listings",
      "paras": [
        "The biggest group of Chennai internships is marketing-executive with 57 listings (8.7%), narrowly ahead of HR with 55 (8.4%). Business development has 39 (5.9%), social media 25 (3.8%) and digital marketing 22 (3.3%).",
        "Chennai looks different from the other big cities because tech roles break into the top twelve. Full stack developer has 16 listings (2.4%) and software developer 13 (2.0%). Process associate also has 16, with operations executive at 18, customer service at 14, finance at 13 and supply chain and logistics at 13.",
        "The spread is flatter than in Mumbai or Delhi, so a student with a coding project has a real chance here, and so does one with an ops or finance bent. Remember that role groups come from title matching and many titles match none, so the table is a guide, not a full count."
      ],
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "marketing (general)",
            "57",
            "8.7%"
          ],
          [
            "HR",
            "55",
            "8.4%"
          ],
          [
            "business development",
            "39",
            "5.9%"
          ],
          [
            "social media",
            "25",
            "3.8%"
          ],
          [
            "digital marketing",
            "22",
            "3.3%"
          ],
          [
            "operations executive",
            "18",
            "2.7%"
          ],
          [
            "full stack developer",
            "16",
            "2.4%"
          ],
          [
            "process associate",
            "16",
            "2.4%"
          ],
          [
            "customer service",
            "14",
            "2.1%"
          ],
          [
            "software developer",
            "13",
            "2.0%"
          ],
          [
            "finance",
            "13",
            "2.0%"
          ],
          [
            "supply chain and logistics",
            "13",
            "2.0%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Lead:** If you code, search by the stack you know, not just the word intern. Chennai has more developer listings than most cities of its size."
    },
    {
      "title": "What are Chennai internships titled, and when are they posted?",
      "sub": "Top titles and posting days",
      "paras": [
        "The most common title is simply Intern, with 17 listings, which tells you nothing about the work. Business Development Intern has 16, then a specialist title ending in Mgf Ncs Specialist with 13. Digital Marketing Internship has 10, Human Resource Intern 9 and Human Resources Intern 7. When the title is generic, read the description before you apply.",
        "A few employers post many roles: the ten biggest hold 15.3% of listings, which is higher than in the larger cities. Even so, 396 different employers posted these 658 listings, and 5.0% do not name the employer.",
        "Thursday is the peak posting day with 148 listings (22.5%), then Wednesday with 122 (18.5%) and Tuesday with 106 (16.1%). Chennai posts more on weekends than other cities: Saturday has 60 (9.1%) and Sunday 33 (5.0%). LinkedIn carried 225 listings, Internshala 143, Naukri 104 and company sites 134."
      ],
      "chart": {
        "id": "ric271Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=658)",
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
          89,
          106,
          122,
          148,
          100,
          60,
          33
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
            "Intern",
            "17"
          ],
          [
            "Business Development Intern",
            "16"
          ],
          [
            "Intern - Mgf Ncs Specialist",
            "13"
          ],
          [
            "Digital Marketing Internship",
            "10"
          ],
          [
            "Human Resource Intern",
            "9"
          ],
          [
            "Human Resources Intern",
            "7"
          ],
          [
            "Sales And Marketing Intern",
            "7"
          ],
          [
            "Sales Intern",
            "6"
          ],
          [
            "Business Development (Sales) Internship",
            "6"
          ],
          [
            "Digital Marketing Intern",
            "5"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 396 different employers posted these listings, and 5.0% of listings do not name the employer."
      }
    },
    {
      "title": "Is there a paid internship in Chennai? What is the stipend?",
      "sub": "19 listings state pay; here is how to judge the rest",
      "paras": [
        "Only 19 of 658 Chennai listings state a stipend in rupees, which is 2.9%. The median of the top of those ranges is ₹14,583 a month. With a sample this small, treat the number as a reference point and not a rule.",
        "Of the 19, 10 top out at ₹10,000 to 20,000 a month, 4 at ₹5,000 to 10,000, 3 at ₹20,000 to 40,000 and 2 under ₹5,000. None reaches ₹40,000. The chart below shows what the listings say about the job itself. A certificate is in 173 listings (29.5%), a pre-placement offer in 10 (1.7%) and unpaid in 8 (1.4%).",
        "To judge an unpaid or unstated offer, ask for the monthly figure, the weekly hours and who you will report to. Ask what you will make that you can show later. Two listings mention a registration, training or deposit fee, and one a bond. Read those carefully, and we think you should not pay to be an intern."
      ],
      "chart": {
        "id": "ric271Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (587 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "targets",
          "a portfolio",
          "incentives",
          "hybrid",
          "GitHub",
          "PF, ESI or health insurance",
          "work from office",
          "immediate joining"
        ],
        "values": [
          29.5,
          18.1,
          14.5,
          11.6,
          10.6,
          4.8,
          3.4,
          2.0,
          1.9,
          1.7
        ],
        "unit": "%"
      },
      "callout": "**Lead:** Compare any offer with ₹14,583. If the offer is lower and the hours are long, ask whether the role leads to a pre-placement offer in writing."
    },
    {
      "title": "What skills do Chennai internship listings ask for?",
      "sub": "Share of 587 listings with a full description",
      "paras": [
        "Communication skills lead with 60.6% of the 587 Chennai listings that carry a full description. English is next at 21.0%, Excel at 19.4% and social media at 18.1%. CRM tools are in 10.2%.",
        "The technical end is what sets Chennai apart. Python appears in 7.3% of listings, cloud (AWS, Azure, GCP) in 7.2%, JavaScript, React or Node in 6.8% and machine learning or generative AI in 6.6%. ChatGPT or AI tools are in 6.8%. GitHub is mentioned in 3.4%, and BTech, BE or computer science in 14.3%.",
        "Targets show up in 14.5% and incentives in 10.6%, so some of these are sales-heavy roles. A portfolio is mentioned in 11.6%. If you are in tech, link one project on GitHub in your email. If you are in business, send one sheet or one plan."
      ],
      "chart": {
        "id": "ric271Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (587 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "social media",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Python",
          "cloud (AWS, Azure, GCP)",
          "JavaScript, React or Node",
          "ChatGPT or AI tools",
          "machine learning or generative AI"
        ],
        "values": [
          60.6,
          21.0,
          19.4,
          18.1,
          10.2,
          7.3,
          7.2,
          6.8,
          6.8,
          6.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get an internship in Chennai?",
      "sub": "Who to email and what to send",
      "paras": [
        "Write to the person who runs the team. For a developer internship, that is the engineering manager or the tech lead. For marketing, the marketing head. For HR, the HR head. 48 Chennai listings (8.2%) put an email address in the description, so use it when it is there and also try the manager.",
        "Send one piece of work that fits the role. A coder can send a small repo with a short readme. A marketing student can send a one-page plan for a launch. An HR student can send a screening checklist for one role. Keep the email to three lines: who you are, what you made, one question.",
        "Follow up once after about a week. Studojo built Stu to handle the slow part: it finds the person who hires, verifies the work email, writes a personal note from your real work and sends it from your own inbox once you start a campaign. Stu does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **658 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. Only internships are counted, and a listing counts for Chennai when it names Chennai as a location.",
    "Pay: 19 of 658 internships (2.9%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 587 listings (89.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many internships are there in Chennai?",
      "a": "We tracked 658 internship listings in Chennai posted in October 2026, from 396 different employers. That counts listings in the Studojo Jobs Index, not hires."
    },
    {
      "q": "Is there a paid internship in Chennai?",
      "a": "Yes, but few listings state it. 19 of 658 state a stipend in rupees, with a median of ₹14,583 a month. 8 say unpaid, and the rest say nothing, so ask."
    },
    {
      "q": "What is the stipend in Chennai for interns?",
      "a": "Among the 19 that state one, 10 top out at ₹10,000 to 20,000 a month and 3 at ₹20,000 to 40,000. The median is ₹14,583 a month. The sample is small, so use it only as a guide."
    },
    {
      "q": "What internships in Chennai are there for students who code?",
      "a": "Full stack developer has 16 listings and software developer 13. Python is mentioned in 7.3% of listings and cloud in 7.2%. Link one project in your email."
    },
    {
      "q": "Where are Chennai internships listed?",
      "a": "LinkedIn had 225 (34.2%), Internshala 143 (21.7%), company career sites and ATS pages 134 (20.4%), Naukri 104 (15.8%) and Shine 52 (7.9%). Portals overlap."
    },
    {
      "q": "How do you decide if an unpaid internship in Chennai is worth it?",
      "a": "Ask for the stipend, hours and your reporting manager, and what you will make. Compare with the ₹14,583 median. Be careful with the 2 listings that mention a fee, and look for a written pre-placement offer."
    }
  ],
  "takeaway": {
    "sub": "What to remember about Chennai internships",
    "items": [
      [
        "Pay is rare",
        "19 of 658 listings state a stipend. Ask before you accept."
      ],
      [
        "Reference figure",
        "₹14,583 a month is the median among the ones that do state it."
      ],
      [
        "Tech has a place",
        "Full stack (16) and software developer (13) roles sit in the top twelve groups."
      ],
      [
        "Generic titles",
        "Intern (17 listings) says nothing, so read the description first."
      ],
      [
        "Email the team lead",
        "Send one piece of work to the person who runs the team, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-chennai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Chennai 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Internships in Chennai 2026",
    "description": "658 active entry-level and internship listings for India posted in October 2026 (Chennai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-internships-chennai-2026" place="report-end" size="card" title={"Want to email who hires in Chennai?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
