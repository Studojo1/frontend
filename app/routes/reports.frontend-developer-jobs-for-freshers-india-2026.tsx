import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "frontend-developer-jobs-for-freshers-india-2026",
  "title": "Front-End Developer Jobs for Freshers in India: 661 Listings 2026",
  "short": "Front-End Developer Jobs for Freshers 2026",
  "description": "Front-end developer jobs for freshers in India: 661 October 2026 listings, 42.8% internships, with React demand, remote share and the little pay stated.",
  "keywords": "front-end developer jobs for freshers, front-end developer fresher salary, front-end developer jobs in india 2026, how to get a front-end developer job as a fresher, front-end developer internship",
  "h1": "Front-End Developer Jobs for Freshers in India:",
  "h1em": "What 661 Listings Show",
  "sub": "The Studojo Jobs Index has 661 entry-level and internship front-end listings for October 2026, and 283 of them (42.8%) are internships. 88.1% of full descriptions mention JavaScript, React or Node, and 244 listings are marked remote.",
  "published": "2026-11-11",
  "scope": "India · front-end developer · freshers and interns",
  "findings": [
    "**Front-end developer jobs for freshers number 661 in October listings,** 378 jobs and 283 internships (42.8%), from 389 different employers.",
    "**JavaScript, React or Node is in 88.1% of descriptions,** while Figma appears in 7.7% and SEO in 6.9%. This is a code-first list, not a design one.",
    "**Remote is common.** 244 listings (36.9%) are marked remote and 262 name no city, so Bengaluru (64) and Mumbai (60) are the only big city counts.",
    "**Pay is stated rarely:** 29 of 378 jobs (7.7%) state a figure, with a median of ₹4 lakh a year, and only 3 of 283 internships state a stipend.",
    "**A portfolio is the proof.** It appears in 20.7% of descriptions and GitHub in 36.8%, so email the design or engineering lead a live link. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "661",
      "label": "Front-end developer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "7.7%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "88.1%",
      "label": "Of listings with a full description ask for JavaScript, React or Node",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are front-end developer jobs for freshers called?",
      "sub": "Titles as posted, and the job and internship split.",
      "paras": [
        "Front-end developer jobs for freshers show up under several names. \"Frontend Development Intern\" is the biggest title with 44 of 661 listings (6.7%). \"Frontend Developer\" has 36, \"Frontend Developer Intern\" 35 and \"Web Developer\" 29. \"Front End Developer\" has 18 and \"Front End Development Internship\" has 19, the same job in a different spelling.",
        "Two titles reach beyond a plain front end. \"Full Stack Web Developer Intern\" appears 38 times and \"React Native Developer\" 19 times, which is mobile work. \"React Js Developer\" has 12 and \"Web Developer Associate\" 15. If you only search \"front-end developer\", you miss the web developer, React and mobile titles that ask for the same skills.",
        "Of the 661 listings, 378 are jobs and 283 are internships, so 42.8% are internships. 389 different employers posted them, and the top 10 account for 27.5%. Only 0.9% of listings do not name the employer, which is a low share. That makes research easy: you can usually tell what the company does before you write."
      ],
      "chart": {
        "id": "rfdjffi22Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=661)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          378,
          283
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
            "Frontend Development Intern",
            "44"
          ],
          [
            "Full Stack Web Developer Intern",
            "38"
          ],
          [
            "Frontend Developer",
            "36"
          ],
          [
            "Frontend Developer Intern",
            "35"
          ],
          [
            "Web Developer",
            "29"
          ],
          [
            "React Native Developer",
            "19"
          ],
          [
            "Front End Development Internship",
            "19"
          ],
          [
            "Front End Developer",
            "18"
          ],
          [
            "Web Developer Associate",
            "15"
          ],
          [
            "React Js Developer",
            "12"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 389 different employers posted these listings, and 0.9% of listings do not name the employer."
      }
    },
    {
      "title": "Where are front-end developer jobs in India for freshers?",
      "sub": "Top cities, and how many listings are remote.",
      "paras": [
        "Bengaluru has 64 front-end listings (9.7%) and Mumbai has 60 (9.1%), the two largest city counts by a clear margin. Then there is a gap to Delhi with 31, Hyderabad with 30, Noida with 27 and Chandigarh with 26. Pune has 25, Chennai 24, Gurugram 23 and Ahmedabad 21, so after the top two the counts are close together and the choice of city matters little.",
        "Chandigarh at 26 is a good result for a smaller city and ahead of Chennai, Gurugram and Ahmedabad. If you live in the north, it is worth searching it by name next to Delhi and Noida. A listing can name more than one city, so these counts overlap a little.",
        "Remote matters more than any single city. 244 listings (36.9%) are marked remote and 262 name no city. In the 639 descriptions we could read, work from home appears in 16.6%, work from office in 4.5% and hybrid in 3.4%. For a remote role, your time zone, portfolio and written English carry more weight than your address."
      ],
      "chart": {
        "id": "rfdjffi22Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=661)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Delhi",
          "Hyderabad",
          "Noida",
          "Chandigarh",
          "Pune",
          "Chennai",
          "Gurugram",
          "Ahmedabad"
        ],
        "values": [
          64,
          60,
          31,
          30,
          27,
          26,
          25,
          24,
          23,
          21
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
            "64",
            "9.7%"
          ],
          [
            "Mumbai",
            "60",
            "9.1%"
          ],
          [
            "Delhi",
            "31",
            "4.7%"
          ],
          [
            "Hyderabad",
            "30",
            "4.5%"
          ],
          [
            "Noida",
            "27",
            "4.1%"
          ],
          [
            "Chandigarh",
            "26",
            "3.9%"
          ],
          [
            "Pune",
            "25",
            "3.8%"
          ],
          [
            "Chennai",
            "24",
            "3.6%"
          ],
          [
            "Gurugram",
            "23",
            "3.5%"
          ],
          [
            "Ahmedabad",
            "21",
            "3.2%"
          ]
        ],
        "note": "A listing can name more than one city. 244 listings are marked remote and 262 name no city."
      }
    },
    {
      "title": "What is a front-end developer fresher salary in India?",
      "sub": "The pay listings state, and how few do.",
      "paras": [
        "Front-end developer fresher salary is stated by only 29 of 378 jobs (7.7%). Their median is ₹4 lakh a year, with the middle half from ₹2.5 lakh to ₹7 lakh. It is the top of each stated range, so treat it as a ceiling, not an offer, and ask what a fresher is actually paid.",
        "11 of the 29 (37.9%) state ₹3 to 5 lakh, and 8 state ₹2 to 3 lakh. 4 listings reach ₹12 to 20 lakh, which is unusual for a fresher list, and one is ₹20 lakh or more. One is under ₹2 lakh. 3 sit at ₹5 to 8 lakh and one at ₹8 to 12 lakh. Pay here depends a great deal on the employer.",
        "For a front-end developer internship, 3 of 283 internships state a stipend. The median is ₹16,667 a month, with two between ₹10,000 and ₹20,000 and one between ₹20,000 and ₹40,000. 22 descriptions (3.4%) call the role unpaid. Ask for the stipend, the length and any conversion into a job in your first email."
      ]
    },
    {
      "title": "What skills do front-end developer listings ask for?",
      "sub": "Share of 639 full descriptions that mention each skill.",
      "paras": [
        "JavaScript, React or Node appears in 88.1% of the 639 descriptions, so it is the single skill to be sharp on. Communication skills are next at 41.3%. After that, the share drops fast, and these are second-language skills: Java is at 14.6%, Python at 12.8%, SQL at 12.4% and cloud at 10.5%. Learn them only after your front-end basics are solid.",
        "Design skills are smaller than you might think. Figma is mentioned in 7.7% of descriptions and Adobe tools in 1.9%. SEO is in 6.9%, and ChatGPT or AI tools in 5.5%. A listing for a front-end developer mostly wants working code, and a minority asks you to also care about design handoff.",
        "On requirements, 54.0% mention a BTech, BE or computer science degree and 27.5% say freshers outright. 21.1% mention a certificate. The two proof signals are higher: GitHub is in 36.8% and a portfolio in 20.7%. That is the part you can change this week: publish one project, write a short README, and link it from your resume and your email."
      ],
      "chart": {
        "id": "rfdjffi22Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (639 listings with a full description)",
        "labels": [
          "JavaScript, React or Node",
          "communication skills",
          "Java",
          "Python",
          "SQL",
          "cloud (AWS, Azure, GCP)",
          "Figma",
          "SEO",
          "ChatGPT or AI tools",
          "English"
        ],
        "values": [
          88.1,
          41.3,
          14.6,
          12.8,
          12.4,
          10.5,
          7.7,
          6.9,
          5.5,
          5.2
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a front-end developer fresher?",
      "sub": "Who to email, what to send, what to say.",
      "paras": [
        "Email the engineering manager, or the head of design if the company is small and the front end is the product. Online applications succeed roughly 0.1% to 2% of the time (The Interview Guys, April 2026), and an average opening draws about 242 applications (The Interview Guys, citing Business Insider data, 2026). A direct note avoids that queue.",
        "Send a live link: one small site or app you built, deployed on a free host, with the repository next to it. Pick a real problem, such as a form that validates well, a dashboard that handles empty states, or a clean mobile layout. A hiring manager opens a live page quickly and can see right away whether you can build.",
        "Keep the email to three lines: the role and who you are, the link and the one thing worth looking at, and a question about the product. Follow up once. Only 14 listings (2.2%) show an email in the description, so you will have to find the person. Stu does that and sends from your own inbox once you start a campaign."
      ],
      "chart": {
        "id": "rfdjffi22Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (639 listings with a full description)",
        "labels": [
          "GitHub",
          "freshers",
          "a certificate",
          "a portfolio",
          "work from home",
          "work from office",
          "hybrid",
          "unpaid",
          "immediate joining",
          "night, rotational, US or UK shifts"
        ],
        "values": [
          36.8,
          27.5,
          21.1,
          20.7,
          16.6,
          4.5,
          3.4,
          3.4,
          2.8,
          2.7
        ],
        "unit": "%"
      },
      "callout": "**Live link first:** the hiring manager should see your work before they read your resume."
    }
  ],
  "method": [
    "This report counts **661 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as front-end developer when its job title matches that role (the most common titles here: \"Frontend Development Intern\", \"Full Stack Web Developer Intern\", \"Frontend Developer\").",
    "Pay: 29 of 378 entry-level listings (7.7%) state a salary in rupees and 3 of 283 internships (1.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 639 listings (96.7%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Naukri, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many front-end developer jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 661 entry-level and internship front-end listings posted in October 2026: 378 jobs and 283 internships. These are listings, not hires, and cover one month."
    },
    {
      "q": "What is the front-end developer fresher salary in India?",
      "a": "29 of 378 jobs (7.7%) state pay in rupees. The median is ₹4 lakh a year, with the middle half from ₹2.5 lakh to ₹7 lakh. Most listings do not state pay."
    },
    {
      "q": "Is there a front-end developer internship with a stipend?",
      "a": "There are 283 front-end internships, but only 3 state a stipend, with a median of ₹16,667 a month. 22 descriptions say the role is unpaid, so ask before you start."
    },
    {
      "q": "Which cities have front-end developer jobs in India 2026?",
      "a": "Bengaluru has 64 listings and Mumbai 60, then Delhi 31, Hyderabad 30 and Noida 27. 244 listings are marked remote and 262 name no city."
    },
    {
      "q": "Do I need React to get a front-end developer job as a fresher?",
      "a": "Very likely. JavaScript, React or Node appears in 88.1% of full descriptions. Python is at 12.8% and SQL at 12.4%, so they are extras, not the main ask."
    },
    {
      "q": "Does a front-end developer need a portfolio?",
      "a": "A portfolio appears in 20.7% of descriptions and GitHub in 36.8%. Many listings do not ask, but a live project link is the easiest way to show you can build."
    }
  ],
  "takeaway": {
    "sub": "What to do with 661 front-end listings.",
    "items": [
      [
        "Search more than one title",
        "Web Developer, React Js and Full Stack titles ask for the same skills."
      ],
      [
        "Be sharp on JavaScript and React",
        "88.1% of full descriptions mention them."
      ],
      [
        "Use the remote share",
        "244 listings are marked remote, so your city matters less."
      ],
      [
        "Ask about stipend",
        "Only 3 of 283 internships state one."
      ],
      [
        "Email a lead with a live link",
        "Send one deployed project in three lines. Follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Front-End Developer Jobs for Freshers 2026",
    "description": "661 active entry-level and internship listings for India posted in October 2026 (front-end developer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-frontend-developer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the hiring lead, not apply blind?"} line={"Tell Stu the front-end role, the city and the pay you want. Stu finds who is hiring, writes a short personal email from your real work, and sends it from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
