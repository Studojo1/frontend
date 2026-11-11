import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "full-stack-developer-jobs-for-freshers-india-2026",
  "title": "Full Stack Developer Jobs for Freshers in India: 612 Listings 2026",
  "short": "Full Stack Developer Jobs for Freshers 2026",
  "description": "Full stack developer jobs for freshers in India: 612 October 2026 listings, half of them internships, and stated pay with a median of ₹4.5 lakh.",
  "keywords": "full stack developer jobs for freshers, full stack developer fresher salary, full stack developer jobs in india 2026, how to get a full stack developer job as a fresher, full stack developer internship",
  "h1": "Full Stack Developer Jobs for Freshers in India:",
  "h1em": "What 612 Listings Show",
  "sub": "The Studojo Jobs Index has 612 entry-level and internship full stack listings for October 2026, and 307 of them (50.2%) are internships. 91.3% of full descriptions mention JavaScript, React or Node, and 36 of 305 jobs state pay.",
  "published": "2026-11-11",
  "scope": "India · full stack developer · freshers and interns",
  "findings": [
    "**Full stack developer jobs for freshers are half internships:** 307 of 612 October listings (50.2%) are internships and 305 are jobs, from 433 different employers.",
    "**JavaScript, React or Node is close to a must.** It appears in 91.3% of full descriptions, with Python next at 37.0%, then cloud at 29.0%, Java at 27.3% and SQL at 27.1%.",
    "**Bengaluru leads with 73 listings,** then Mumbai with 43 and Hyderabad with 42. 216 listings (35.3%) are marked remote and 232 name no city.",
    "**Stated pay is limited:** 36 of 305 jobs (11.8%) state pay, with a median of ₹4.5 lakh a year, and only 2 of 307 internships state a stipend.",
    "**GitHub appears in 43.6% of descriptions,** so the move that works is to email the engineering lead with one deployed project. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "612",
      "label": "Full stack developer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4.5 lakh",
      "label": "Median stated pay a year, from the 36 jobs that state it (11.8%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "91.3%",
      "label": "Of listings with a full description ask for JavaScript, React or Node",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are full stack developer jobs for freshers called?",
      "sub": "Titles as employers wrote them, and the job and internship split.",
      "paras": [
        "Full stack developer jobs for freshers are named in many spellings, and the biggest title is an internship. \"Full Stack Development Internship\" has 55 of 612 listings (9.0%), \"Full Stack Web Developer Intern\" has 38 and \"Fullstack Web Development Intern\" has 31. The plain \"Full Stack Developer\" has 36 and \"Full Stack Engineer\" has 30.",
        "Spelling splits the list. \"Full Stack\" and \"Fullstack\" are counted as different titles by most job boards, so a search with one spelling hides listings under the other. \"MERN Stack Developer\" and \"MERN Stack Development Intern\" each appear 10 times. Search all three spellings and the stack name, such as MERN, before you decide how many roles are open.",
        "The split is 305 jobs and 307 internships, almost exactly half and half. 433 employers posted these listings, and the top 10 account for only 18.1%, so no single employer dominates. Just 1.3% of listings hide the employer. That is a wide, fragmented list, which means the same skills can open doors in many small teams."
      ],
      "chart": {
        "id": "rfsdjff23Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=612)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          305,
          307
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
            "Full Stack Development Internship",
            "55"
          ],
          [
            "Full Stack Web Developer Intern",
            "38"
          ],
          [
            "Full Stack Developer",
            "36"
          ],
          [
            "Fullstack Web Development Intern",
            "31"
          ],
          [
            "Full Stack Engineer",
            "30"
          ],
          [
            "Full Stack Developer Intern",
            "26"
          ],
          [
            "Fullstack Developer",
            "17"
          ],
          [
            "Full Stack Developer Internship",
            "11"
          ],
          [
            "MERN Stack Developer",
            "10"
          ],
          [
            "MERN Stack Development Intern",
            "10"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 433 different employers posted these listings, and 1.3% of listings do not name the employer."
      }
    },
    {
      "title": "Where are full stack developer jobs in India for freshers?",
      "sub": "Top cities, plus the remote and no-city listings.",
      "paras": [
        "Bengaluru leads full stack developer jobs in India with 73 listings (11.9%). Mumbai has 43 (7.0%), Hyderabad 42 (6.9%), Chennai 38 and Pune 34. Ahmedabad is sixth with 27, ahead of Noida with 21, Delhi with 20 and Gurugram with 18. Chandigarh has 14. If your city is not on this list, it still may have a few listings, so search it by name.",
        "The list is flatter than for most developer roles. No city has even 12% of listings, because 216 are marked remote and 232 name no city. Together that is more listings than the top city gets by a wide margin, so city is a weaker filter here than you might expect.",
        "In the descriptions, work from home appears in 15.2% of the 597 we could read, hybrid in 4.5% and work from office in 4.2%. If you live outside the metros, you can apply from where you are. Say so in your first line, with your time zone, and mention that you can start without relocating."
      ],
      "chart": {
        "id": "rfsdjff23Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=612)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Hyderabad",
          "Chennai",
          "Pune",
          "Ahmedabad",
          "Noida",
          "Delhi",
          "Gurugram",
          "Chandigarh"
        ],
        "values": [
          73,
          43,
          42,
          38,
          34,
          27,
          21,
          20,
          18,
          14
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
            "73",
            "11.9%"
          ],
          [
            "Mumbai",
            "43",
            "7.0%"
          ],
          [
            "Hyderabad",
            "42",
            "6.9%"
          ],
          [
            "Chennai",
            "38",
            "6.2%"
          ],
          [
            "Pune",
            "34",
            "5.6%"
          ],
          [
            "Ahmedabad",
            "27",
            "4.4%"
          ],
          [
            "Noida",
            "21",
            "3.4%"
          ],
          [
            "Delhi",
            "20",
            "3.3%"
          ],
          [
            "Gurugram",
            "18",
            "2.9%"
          ],
          [
            "Chandigarh",
            "14",
            "2.3%"
          ]
        ],
        "note": "A listing can name more than one city. 216 listings are marked remote and 232 name no city."
      }
    },
    {
      "title": "What is a full stack developer fresher salary in India?",
      "sub": "Stated pay, and how rarely it is stated.",
      "paras": [
        "Full stack developer fresher salary is stated by only 36 of the 305 jobs (11.8%). The median of those is ₹4.5 lakh a year, with the middle half between ₹3.5 lakh and ₹6.5 lakh. It is the top of each stated range, so the real starting figure may be lower.",
        "13 of the 36 (36.1%) sit in the ₹3 to 5 lakh band, and 9 are at ₹5 to 8 lakh. Another 6 state ₹2 to 3 lakh and 2 are under ₹2 lakh. 5 reach ₹8 to 12 lakh, and one is ₹20 lakh or more. The width tells you pay depends heavily on the employer and what it expects you to build.",
        "For a full stack developer internship the data is nearly empty: only 2 of 307 internships state a stipend, one under ₹5,000 and one between ₹10,000 and ₹20,000 a month. 28 descriptions (4.7%) say the role is unpaid. With 305 more internships saying nothing, ask about stipend, duration and what happens at the end."
      ],
      "chart": {
        "id": "rfsdjff23Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (36 jobs that state pay in rupees)",
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
          2,
          6,
          13,
          9,
          5,
          0,
          1
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do full stack developer listings ask for?",
      "sub": "Share of 597 full descriptions that mention each skill.",
      "paras": [
        "JavaScript, React or Node is in 91.3% of the 597 descriptions, so it is the one thing to get right. Communication skills follow at 41.5%, then Python at 37.0%, cloud at 29.0%, Java at 27.3% and SQL at 27.1%. A full stack role is a Node or React job first, with a second language and a database behind it.",
        "AI shows up as well. Machine learning or generative AI appears in 17.6% of descriptions and ChatGPT or AI tools in 9.9%. That is a minority, but it is large enough that a project using an AI API is worth building. Design and marketing tools barely appear: Figma sits at 2.0% and SEO at 2.3%.",
        "The conditions are lighter than the skills. 56.4% mention a BTech, BE or computer science degree, 21.8% say freshers, 25.8% mention a certificate and 16.9% a portfolio. Compare that with the 43.6% who mention GitHub: the listings lean towards asking to see what you have published, not only what you have studied, and that is the part you control."
      ],
      "chart": {
        "id": "rfsdjff23Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (597 listings with a full description)",
        "labels": [
          "JavaScript, React or Node",
          "communication skills",
          "Python",
          "cloud (AWS, Azure, GCP)",
          "Java",
          "SQL",
          "machine learning or generative AI",
          "ChatGPT or AI tools",
          "English",
          "calling or telecalling"
        ],
        "values": [
          91.3,
          41.5,
          37.0,
          29.0,
          27.3,
          27.1,
          17.6,
          9.9,
          5.4,
          3.7
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a full stack developer fresher?",
      "sub": "Who to email, what to send, what to write.",
      "paras": [
        "Email the engineering manager, or the CTO if the team is small, not a general careers inbox. Online applications succeed roughly 0.1% to 2% of the time (The Interview Guys, April 2026), and an average opening draws about 242 applications (The Interview Guys, citing Business Insider data, 2026). One direct, specific email to the person who runs the team gets you out of that pile, and it costs you a few minutes instead of another long application form.",
        "Send a deployed project, not a screenshot. Build one small app with a React front end, a Node or Python API and a database, put it on a free host, and link the repository and the live page. With GitHub in 43.6% of descriptions and a portfolio in 16.9%, that single link answers most of the checklist.",
        "Write three lines: the role you saw, the project and the one feature you are proud of, and a question about what the team is building. Follow up once. Only 26 listings (4.4%) put an email in the description, so you will usually have to find the lead yourself. Stu does that and the sending, from your own inbox, once you start a campaign."
      ],
      "chart": {
        "id": "rfsdjff23Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (597 listings with a full description)",
        "labels": [
          "GitHub",
          "a certificate",
          "freshers",
          "a portfolio",
          "work from home",
          "unpaid",
          "hybrid",
          "work from office",
          "PF, ESI or health insurance",
          "incentives"
        ],
        "values": [
          43.6,
          25.8,
          21.8,
          16.9,
          15.2,
          4.7,
          4.5,
          4.2,
          2.8,
          2.5
        ],
        "unit": "%"
      },
      "callout": "**Live beats listed:** a deployed app with a repository link is the proof these listings ask for."
    }
  ],
  "method": [
    "This report counts **612 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as full stack developer when its job title matches that role (the most common titles here: \"Full Stack Development Internship\", \"Full Stack Web Developer Intern\", \"Full Stack Developer\").",
    "Pay: 36 of 305 entry-level listings (11.8%) state a salary in rupees and 2 of 307 internships (0.7%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 597 listings (97.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Internshala, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many full stack developer jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 612 entry-level and internship full stack listings posted in October 2026: 305 jobs and 307 internships. These are listings, not hires, and cover one month."
    },
    {
      "q": "What is the full stack developer fresher salary in India?",
      "a": "36 of 305 jobs (11.8%) state pay in rupees. The median is ₹4.5 lakh a year, with the middle half from ₹3.5 lakh to ₹6.5 lakh. Most listings state nothing."
    },
    {
      "q": "Is there a full stack developer internship with a stipend?",
      "a": "Yes, there are 307 internships, but only 2 state a stipend: one under ₹5,000 and one between ₹10,000 and ₹20,000 a month. 28 descriptions across all listings say the role is unpaid."
    },
    {
      "q": "Which cities have full stack developer jobs in India 2026?",
      "a": "Bengaluru has 73 listings, Mumbai 43, Hyderabad 42, Chennai 38 and Pune 34. 216 are marked remote and 232 name no city, so many roles do not depend on a metro."
    },
    {
      "q": "What stack should I learn for a full stack developer job as a fresher?",
      "a": "Start with JavaScript, React or Node, which 91.3% of descriptions mention. Add Python (37.0%) or Java (27.3%) for the back end, and SQL (27.1%) for the database."
    },
    {
      "q": "Do I need a computer science degree for full stack developer jobs?",
      "a": "Not always. 56.4% of full descriptions mention a BTech, BE or computer science degree, so 43.6% do not. GitHub is mentioned in 43.6%, which suggests that visible work matters."
    }
  ],
  "takeaway": {
    "sub": "What to do with 612 full stack listings.",
    "items": [
      [
        "Search every spelling",
        "Full Stack, Fullstack and MERN are separate titles on most boards."
      ],
      [
        "Learn JavaScript, React or Node first",
        "It is in 91.3% of full descriptions."
      ],
      [
        "Do not rely on one city",
        "216 listings are remote and 232 name no city."
      ],
      [
        "Ask about stipend",
        "Only 2 of 307 internships state one."
      ],
      [
        "Email the engineering lead with a live app",
        "Link the repository and the deployed page. Follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Full Stack Developer Jobs for Freshers 2026",
    "description": "612 active entry-level and internship listings for India posted in October 2026 (full stack developer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-full-stack-developer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the engineering lead, not apply blind?"} line={"Tell Stu the full stack role, the city and the pay you want. Stu finds who is hiring, writes a short personal email from your real work, and sends it from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
