import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "web-development-internship-india-2026",
  "title": "Web Development Internship in India: 516 Listings, Stipends, Skills 2026",
  "short": "Web Development Internship India 2026",
  "description": "Web development internship in India: 516 listings in the Studojo Jobs Index, 95.3% ask for JavaScript, React or Node, and only 2 state a stipend.",
  "keywords": "web development internship in india, web developer internship, frontend developer internship, full stack developer internship",
  "h1": "Web Development Internship in India:",
  "h1em": "What 516 Listings Show",
  "sub": "The Studojo Jobs Index has 516 web development internships in India posted in the first half of November 2026, covering frontend and full stack titles. Only 2 of them state a stipend, and 95.3% of the described listings mention JavaScript, React or Node.",
  "published": "2026-11-18",
  "scope": "India · web development internship",
  "findings": [
    "**A web development internship in India** is mostly a frontend or full stack role: 516 listings in the Studojo Jobs Index, from 157 employers, led by Frontend Developer Intern with 65.",
    "**Stipends are almost never stated**: 2 of 516 listings give one, so ask about pay before you accept any task.",
    "**Your code is the CV**: 74.7% of described listings mention GitHub and 29.4% a portfolio, against 1.3% and 8.1% across the whole index.",
    "**Hiring is concentrated**: the top ten employers hold 64.5% of these listings, against 13.0% in the whole index, and 80.4% carry the remote flag.",
    "**The move that works** is a short email to the engineering lead or the founder with one small deployed project. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "516",
      "label": "Web development internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "0.4%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "95.3%",
      "label": "Of listings with a full description ask for JavaScript, React or Node",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What are web development internships called in India?",
      "sub": "Frontend and full stack titles, as employers wrote them.",
      "paras": [
        "A web development internship in India is mostly a frontend or full stack role. The Studojo Jobs Index has 516 of them posted in the first half of November 2026, and every one is an internship. Frontend Developer Intern is the top title with 65 listings, then Fullstack Web Development Intern with 45 and Frontend Development Intern with 44.",
        "Full stack wording is spread across many spellings. Full Stack Web Developer has 37, Full Stack Web Developer Intern 37, Full Stack Developer Intern 34 and Full Stack Development Internship 28. React Js Development Intern has 16 and Mern Stack Development Intern 13. Search every spelling, because one keyword hides most of them.",
        "157 employers posted these listings, and the top ten hold 64.5% of them. In the whole index the top ten hold 13.0%. A few teams post in bulk, so the same names repeat. Only 0.4% of listings hide the employer. Pick one role per team, and look past the biggest posters to the smaller teams."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Frontend Developer Intern",
            "65"
          ],
          [
            "Fullstack Web Development Intern",
            "45"
          ],
          [
            "Frontend Development Intern",
            "44"
          ],
          [
            "Frontend Developer",
            "37"
          ],
          [
            "Full Stack Web Developer",
            "37"
          ],
          [
            "Full Stack Web Developer Intern",
            "37"
          ],
          [
            "Full Stack Developer Intern",
            "34"
          ],
          [
            "Full Stack Development Internship",
            "28"
          ],
          [
            "React Js Development Intern",
            "16"
          ],
          [
            "Mern Stack Development Intern",
            "13"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 157 different employers posted these listings, and 0.4% of listings do not name the employer."
      }
    },
    {
      "title": "Where are web development internships in India?",
      "sub": "Most are remote or leave the city blank.",
      "paras": [
        "The first thing the chart shows is how little of it there is. 415 of the 516 listings (80.4%) carry the remote flag, against 6.5% across the index. 419 name no city at all. For this field, location is rarely the filter, so you can apply from any town.",
        "Where a city is named, Hyderabad leads with 18 listings (3.5%), then Bengaluru with 11, Mumbai with 9, and Noida and Delhi with 8 each. Ghaziabad, Kochi and Ahmedabad have 5 each, and Chennai and Pune 4. These counts are small, so do not read a ranking into them.",
        "Because the city is often blank, say yours in the first line of your email, along with your time zone and whether you can come to an office. Most of these listings were found on LinkedIn (73.3%), then Internshala (10.1%), Shine (9.7%) and company career pages (5.6%)."
      ],
      "chart": {
        "id": "rwdii247Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=516)",
        "labels": [
          "Hyderabad",
          "Bengaluru",
          "Mumbai",
          "Noida",
          "Delhi",
          "Ghaziabad",
          "Kochi",
          "Ahmedabad",
          "Chennai",
          "Pune"
        ],
        "values": [
          18,
          11,
          9,
          8,
          8,
          5,
          5,
          5,
          4,
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
            "Hyderabad",
            "18",
            "3.5%"
          ],
          [
            "Bengaluru",
            "11",
            "2.1%"
          ],
          [
            "Mumbai",
            "9",
            "1.7%"
          ],
          [
            "Noida",
            "8",
            "1.6%"
          ],
          [
            "Delhi",
            "8",
            "1.6%"
          ],
          [
            "Ghaziabad",
            "5",
            "1.0%"
          ],
          [
            "Kochi",
            "5",
            "1.0%"
          ],
          [
            "Ahmedabad",
            "5",
            "1.0%"
          ],
          [
            "Chennai",
            "4",
            "0.8%"
          ],
          [
            "Pune",
            "4",
            "0.8%"
          ]
        ],
        "note": "A listing can name more than one city. 415 listings are marked remote and 419 name no city."
      }
    },
    {
      "title": "Do web development internships pay a stipend?",
      "sub": "Two of 516 say. Here is what else the listings say.",
      "paras": [
        "Almost none state a stipend. 2 of the 516 listings (0.4%) give one, with a median top of range of ₹23,583 a month. One sits in the ₹10,000 to 20,000 band and one in ₹20,000 to 40,000. Two listings are not a market rate. Across the index, 246 of 11,528 internships state a stipend, with a median of ₹12,500.",
        "Among the 514 listings with a full description, 7.8% say unpaid, 41.2% mention a certificate (6.9% across the index) and 1.0% mention a pre-placement offer, which is 5 listings. None mention a registration, training or deposit fee. A certificate at the end is not pay, so ask what you get besides one.",
        "The bar is clear too. BTech, BE or computer science appears in 81.9%, against 7.8% across the index. Freshers are named in 39.7% and work from home in 38.3%. Before you start, ask four things: is it paid, how much a month, how long, and is there a route to a full-time role."
      ],
      "chart": {
        "id": "rwdii247Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (514 listings with a full description)",
        "labels": [
          "GitHub",
          "a certificate",
          "freshers",
          "work from home",
          "a portfolio",
          "unpaid",
          "hybrid",
          "incentives",
          "work from office",
          "a pre-placement offer (PPO)"
        ],
        "values": [
          74.7,
          41.2,
          39.7,
          38.3,
          29.4,
          7.8,
          2.5,
          1.9,
          1.0,
          1.0
        ],
        "unit": "%"
      },
      "callout": "**Ask early:** only 2 of 516 listings state a stipend, so put the pay question in your first reply."
    },
    {
      "title": "Which skills do web development internships ask for?",
      "sub": "JavaScript, React or Node dominate.",
      "paras": [
        "JavaScript, React or Node appears in 95.3% of the 514 described listings. That is the entry ticket. Python follows at 28.0% and Java at 24.3%, so a second language helps, but it is not what most listings lead with. Communication skills are named in 42.0%.",
        "The rest is a short tail. SQL and machine learning or generative AI each appear in 6.4%, Figma and ChatGPT or AI tools in 5.6% each, cloud (AWS, Azure, GCP) in 5.4% and SEO in 3.7%. If you know React well, learning one more tool matters less than showing what you built.",
        "That is why GitHub (74.7%) and a portfolio (29.4%) matter. Employers want to see a repository with a clean history and a live link. A repo with a readable README and a few honest commits tells them more than a list of courses."
      ],
      "chart": {
        "id": "rwdii247Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (514 listings with a full description)",
        "labels": [
          "JavaScript, React or Node",
          "communication skills",
          "Python",
          "Java",
          "SQL",
          "machine learning or generative AI",
          "Figma",
          "ChatGPT or AI tools",
          "cloud (AWS, Azure, GCP)",
          "SEO"
        ],
        "values": [
          95.3,
          42.0,
          28.0,
          24.3,
          6.4,
          6.4,
          5.6,
          5.6,
          5.4,
          3.7
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get a web development internship?",
      "sub": "Write to the person who reviews code, with a live link.",
      "paras": [
        "Write to the founder if the company is a startup, or to the engineering manager or the frontend lead if it has a team. Those people decide who joins, and they read code. A general HR inbox is slower for this field. Name the person in the first line.",
        "Send one small project that is deployed, not a folder of tutorials. A working page that fixes one real annoyance, a live link, a repo and a short README that says what you chose and why. Better still, build a small piece in the stack the listing names, whether that is React or MERN.",
        "Keep the email to three lines: who you are, the link, and the role you want. Follow up once, a few days later. Only 2.3% of descriptions carry an email address, so finding the person is the slow part. Stu does that part: it finds who hires, verifies the work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **516 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a web development internship when its job title matches that kind of role (the most common titles here: \"Frontend Developer Intern\", \"Fullstack Web Development Intern\", \"Frontend Development Intern\").",
    "Pay: 2 of 516 internships (0.4%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 514 listings (99.6%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many web development internships are there in India?",
      "a": "The Studojo Jobs Index has 516 web development internships in India posted 1 to 15 November 2026, from 157 employers. That counts frontend and full stack titles together. Listings are not hires."
    },
    {
      "q": "What is a frontend developer internship?",
      "a": "It is an internship building what users see in the browser. Frontend Developer Intern is the most common title here with 65 listings, and 95.3% of described listings mention JavaScript, React or Node."
    },
    {
      "q": "What does a full stack developer internship ask for?",
      "a": "Both sides of a web app, usually in a named stack. Full stack titles are spread across many spellings (Full Stack Web Developer 37, Full Stack Developer Intern 34, Mern Stack Development Intern 13). Python appears in 28.0% and Java in 24.3% of described listings."
    },
    {
      "q": "Do web development internships pay a stipend?",
      "a": "Few state one. Only 2 of 516 listings give a stipend, with a median top of range of ₹23,583 a month. Another 7.8% of described listings say unpaid, so ask before you start."
    },
    {
      "q": "Do I need a BTech for a web development internship?",
      "a": "Many listings name it. BTech, BE or computer science appears in 81.9% of described listings, but a deployed project and a GitHub profile (named in 74.7%) carry real weight too."
    },
    {
      "q": "Can I do a web development internship from home?",
      "a": "Often, yes. 415 of the 516 listings (80.4%) carry the remote flag, and 38.3% of described listings mention work from home. 419 listings name no city."
    }
  ],
  "takeaway": {
    "sub": "Five points for anyone looking for a web development internship.",
    "items": [
      [
        "Search every title spelling",
        "Frontend, full stack, React and MERN titles are all in the 516 listings."
      ],
      [
        "Ask about the stipend",
        "Only 2 of 516 listings state one, and 7.8% of described listings say unpaid."
      ],
      [
        "Show your code",
        "GitHub appears in 74.7% of described listings and a portfolio in 29.4%."
      ],
      [
        "Know your core language",
        "JavaScript, React or Node appears in 95.3% of described listings."
      ],
      [
        "Email the engineering lead",
        "Attach one deployed project with a live link and a short README."
      ]
    ]
  },
  "related": [
    {
      "slug": "frontend-developer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Front-End Developer Jobs for Freshers 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Web Development Internship India 2026",
    "description": "516 active entry-level and internship listings for India posted 1 to 15 November 2026 (web development internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-web-development-internship-india-2026" place="report-end" size="card" title={"Want to email the engineering lead at a startup?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes each note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
