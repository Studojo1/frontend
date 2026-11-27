import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "software-development-internship-india-2026",
  "title": "Software Development Internship in India 2026: What 105 Listings Ask",
  "short": "Software Development Internship 2026",
  "description": "Software development internship in India: 105 listings in the Studojo Jobs Index, 79.0% name JavaScript, React or Node, and none state a stipend.",
  "keywords": "software development internship in india, software engineering internship, software developer internship, sde internship",
  "h1": "Software Development Internship in India:",
  "h1em": "105 Listings, Zero Stated Stipends",
  "sub": "The Studojo Jobs Index holds 105 software development internships in India posted 1 to 15 November 2026, from 60 employers. Not one states a stipend. JavaScript, React or Node shows up in 79.0% of descriptions and Java in 66.7%.",
  "published": "2026-11-27",
  "scope": "India · software development internship",
  "findings": [
    "**A software development internship in India** most often goes by Application Developer Intern: that title alone covers 34 of the 105 listings (32.4%) in the Studojo Jobs Index, well ahead of Software Engineer Intern at 16.",
    "**Ten employers post more than half of them**: 60 employers posted all 105 listings, and the ten busiest hold 52.4%, against 13.0% across the whole index.",
    "**JavaScript and Java lead the stack**: 79.0% of descriptions name JavaScript, React or Node and 66.7% name Java, while Python sits at 40.0% and SQL at 26.7%.",
    "**No listing states a stipend**, yet 9.5% of descriptions mention a pre-placement offer (PPO), against 0.5% across the index. Ask for the monthly amount, and whether the PPO is written down, before you accept.",
    "**The move that works** is a three-line email to the engineering manager or tech lead with one small, tested piece of code. Stu finds that person, checks the work email and drafts the note."
  ],
  "stats": [
    {
      "num": "105",
      "label": "Software development internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "0.0%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "79.0%",
      "label": "Of listings with a full description ask for JavaScript, React or Node",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What is an SDE internship called in Indian listings?",
      "sub": "The ten most common titles, exactly as employers posted them.",
      "paras": [
        "A software development internship in India rarely says 'software development' in its title. The Studojo Jobs Index has 105 of these internships posted in the first half of November 2026, and the biggest single title is Application Developer Intern, with 34 listings (32.4%). Software Engineer Intern follows with 16 (15.2%), then Software Engineer Internship with 4.",
        "Some titles read like a syllabus. Software Developer Intern (Core Programming, Data Structures, Debugging, Git) has 4 listings, and a shorter version naming Data Structures, Debugging and Git has 2. Software Engineer (Backend) Intern has 2, and so does Flutter Application Developer Intern (Mobile & Desktop). Search for application developer, software engineer and SDE, not one phrase.",
        "The pool leans on a few names. 60 employers posted the 105 listings, and the ten busiest account for 52.4% of them. For comparison, the ten busiest employers in the whole index hold just 13.0%. When one title appears 34 times, it can be a single employer filling a batch of seats rather than 34 separate teams. Every listing here names its employer, so check you are not applying to the same company twice."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Application Developer Intern",
            "34"
          ],
          [
            "Software Engineer Intern",
            "16"
          ],
          [
            "Software Engineer Internship",
            "4"
          ],
          [
            "Software Developer Intern (Core Programming, Data Structures, Debugging, Git)",
            "4"
          ],
          [
            "Software Engineer (Backend) Intern",
            "2"
          ],
          [
            "Software Developer Intern (Data Structures, Debugging, Git)",
            "2"
          ],
          [
            "Software Engineering Intern - Client (Mobile)",
            "2"
          ],
          [
            "Software Engineering Intern",
            "2"
          ],
          [
            "Flutter Application Developer Intern (Mobile & Desktop)",
            "2"
          ],
          [
            "Ai With Software Developer Internship",
            "1"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 60 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "Which languages does a software developer internship ask for?",
      "sub": "Share of the 105 descriptions that name each skill.",
      "paras": [
        "JavaScript, React or Node is named in 79.0% of the 105 descriptions, and Java in 66.7%. Plenty of listings name both, which fits full stack and backend work. Across the whole index, JavaScript, React or Node shows up in only 2.5% of descriptions, so this is a field where the stack is spelled out for you. Match it.",
        "Python is third at 40.0%, then SQL at 26.7%. Cloud (AWS, Azure, GCP) is named in 16.2%, machine learning or generative AI in 10.5%, and ChatGPT or AI tools in 6.7%. Communication skills appear in 47.6%, under the 57.2% across the whole index, but you will still explain your code in reviews and stand-ups, so do not skip it.",
        "Choose one main language and get properly good at it instead of listing five. If you know Java, build something in it with tests that pass. If you know JavaScript, ship a small React or Node app that runs. Put the language the listing names in the first line of your CV and your email, because that is the first thing a reviewer checks."
      ],
      "chart": {
        "id": "rsdii2127Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (105 listings with a full description)",
        "labels": [
          "JavaScript, React or Node",
          "Java",
          "communication skills",
          "Python",
          "SQL",
          "cloud (AWS, Azure, GCP)",
          "machine learning or generative AI",
          "English",
          "ChatGPT or AI tools"
        ],
        "values": [
          79.0,
          66.7,
          47.6,
          40.0,
          26.7,
          16.2,
          10.5,
          7.6,
          6.7
        ],
        "unit": "%"
      }
    },
    {
      "title": "Where are software engineering internships based?",
      "sub": "Bengaluru leads the named cities, but many listings name none.",
      "paras": [
        "Bengaluru has the most, with 22 listings (21.0%). Chennai is second with 10 (9.5%), then Pune with 6, Gurugram with 5, Hyderabad with 4 and Mumbai with 3. Coimbatore and Noida have 2 each, and Meerut and Nagpur 1 each. One listing can name several cities and these counts are small, so treat the order as a rough guide, not a ranking.",
        "Remote work is common in this field. Close to half the pool, 48 of 105 listings (45.7%), is flagged remote, which is far above the 6.5% index rate; 49 listings give no city. Hybrid is written into 11.4% of descriptions and work from home into 5.7%. If you live outside the big tech cities, the remote half of this list is still open to you.",
        "LinkedIn carries 55.2% of these listings, company career sites and ATS pages 21.0% and Shine 20.0%. Internshala has 2.9% and Naukri 1.0%. A fifth of the pool sits on company career pages, so open the careers page of any company you would like to work for. Monday and Tuesday were the busiest posting days, with 21 listings each (20.0%)."
      ],
      "chart": {
        "id": "rsdii2127Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=105)",
        "labels": [
          "Bengaluru",
          "Chennai",
          "Pune",
          "Gurugram",
          "Hyderabad",
          "Mumbai",
          "Coimbatore",
          "Noida",
          "Meerut",
          "Nagpur"
        ],
        "values": [
          22,
          10,
          6,
          5,
          4,
          3,
          2,
          2,
          1,
          1
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
            "22",
            "21.0%"
          ],
          [
            "Chennai",
            "10",
            "9.5%"
          ],
          [
            "Pune",
            "6",
            "5.7%"
          ],
          [
            "Gurugram",
            "5",
            "4.8%"
          ],
          [
            "Hyderabad",
            "4",
            "3.8%"
          ],
          [
            "Mumbai",
            "3",
            "2.9%"
          ],
          [
            "Coimbatore",
            "2",
            "1.9%"
          ],
          [
            "Noida",
            "2",
            "1.9%"
          ],
          [
            "Meerut",
            "1",
            "1.0%"
          ],
          [
            "Nagpur",
            "1",
            "1.0%"
          ]
        ],
        "note": "A listing can name more than one city. 48 listings are marked remote and 49 name no city."
      }
    },
    {
      "title": "Do software development internships pay, and do they lead to a job?",
      "sub": "What the 105 descriptions say about pay, offers and degrees.",
      "paras": [
        "None of the 105 listings states a stipend in rupees. Across all internships in the index, 2.1% state one, with a median of ₹12,500 a month, so silence on pay is normal here, but it is not an answer. Six descriptions, 5.7%, use the word unpaid. Ask the monthly amount, the length and the start date before you accept anything.",
        "The upside is a route to a job. A pre-placement offer (PPO) is mentioned in 9.5% of descriptions, 10 listings, against 0.5% across the index. A certificate appears in 11.4%, not far above the index rate of 6.9%. Not one description asks for a registration, training or deposit fee. Where a PPO is mentioned, ask what it depends on and how many interns received one last cycle.",
        "On who can apply, BTech, BE or computer science appears in 50.5% of descriptions and freshers in 48.6%. GitHub is named in 26.7%, against 1.3% across the index, and a portfolio in 9.5%. About half the descriptions, 49.5%, do not mention BTech, BE or computer science, so a student from another stream with real code to show is not shut out by the text."
      ],
      "chart": {
        "id": "rsdii2127Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (105 listings with a full description)",
        "labels": [
          "freshers",
          "GitHub",
          "hybrid",
          "a certificate",
          "a pre-placement offer (PPO)",
          "a portfolio",
          "work from home",
          "unpaid"
        ],
        "values": [
          48.6,
          26.7,
          11.4,
          11.4,
          9.5,
          9.5,
          5.7,
          5.7
        ],
        "unit": "%"
      },
      "callout": "**Get it in writing:** none of the 105 listings states a stipend, so ask for the monthly figure before your first task."
    },
    {
      "title": "How do you get a software development internship?",
      "sub": "Send working code to the person who reviews pull requests.",
      "paras": [
        "Write to the engineering manager or tech lead who would review your code. At a small startup, that is often the CTO or a founder. Recruiters handle volume, but the person who owns the codebase decides whether an intern is worth their time. Only 10 of the 105 descriptions (9.5%) include an email address, so you will usually have to find the right name yourself.",
        "Your proof is one small, finished thing in the listing's language: a bug fix merged into an open-source project, a command-line tool with tests and a README, or a tiny API with one working endpoint. Keep it small enough to read in five minutes. A green test run and a tidy commit history say more than a list of online courses.",
        "The email is three lines. Line one: who you are and the role. Line two: the link, and one sentence on the hardest bug you fixed in it. Line three: ask for a short call or a test task. If a week passes with no reply, follow up once with one new detail. An average opening draws about 242 applications (The Interview Guys, April 2026, citing Business Insider data), which is why a direct note stands out. Stu takes on the slow part, finding the tech lead, checking the work email and sending from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **105 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a software development internship when its job title matches that kind of role (the most common titles here: \"Application Developer Intern\", \"Software Engineer Intern\", \"Software Engineer Internship\").",
    "Pay: 0 of 105 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 105 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Internshala, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many software development internships are there in India?",
      "a": "The Studojo Jobs Index has 105 software development internships in India posted 1 to 15 November 2026, from 60 employers. A listing is an opening, not a hire, and the index covers the sources we read, not every internship in the country."
    },
    {
      "q": "What is an SDE internship?",
      "a": "It is an internship writing and fixing code on a product team. In these listings it is most often called Application Developer Intern (34 listings) or Software Engineer Intern (16), and 79.0% of descriptions name JavaScript, React or Node."
    },
    {
      "q": "Is a software engineering internship paid in India?",
      "a": "The listings do not say. Not one of the 105 gives a stipend figure, and 5.7% of descriptions use the word unpaid. Ask for the monthly amount in writing before you accept."
    },
    {
      "q": "Which language should I learn for a software developer internship?",
      "a": "Start with JavaScript or Java. JavaScript, React or Node is named in 79.0% of descriptions, Java in 66.7%, Python in 40.0% and SQL in 26.7%. Depth in one language beats a long list."
    },
    {
      "q": "Do software development internships come with a PPO?",
      "a": "Some mention one. A pre-placement offer appears in 9.5% of descriptions, 10 listings, against 0.5% across the whole index. Ask what the offer depends on before you join."
    },
    {
      "q": "Can I get a software development internship without a CS degree?",
      "a": "The text leaves room. BTech, BE or computer science is named in 50.5% of descriptions, so about half do not mention it. GitHub is named in 26.7%, which makes working code your best substitute for the degree line."
    }
  ],
  "takeaway": {
    "sub": "Five things to do before you apply for an SDE internship.",
    "items": [
      [
        "Search three titles",
        "Application developer, software engineer and SDE titles all lead to the same kind of work."
      ],
      [
        "Match the stack",
        "79.0% of descriptions name JavaScript, React or Node and 66.7% name Java."
      ],
      [
        "Ask about pay first",
        "None of the 105 listings states a stipend."
      ],
      [
        "Ask how the PPO works",
        "9.5% mention a pre-placement offer, so find out what it depends on."
      ],
      [
        "Email the tech lead",
        "Send one small, tested project and a three-line note."
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Software Development Internship 2026",
    "description": "105 active entry-level and internship listings for India posted 1 to 15 November 2026 (software development internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-software-development-internship-india-2026" place="report-end" size="card" title={"Want your code in front of the engineering manager?"} line={"Tell Stu you want a software development internship and where. Stu finds who leads the engineering team, verifies their work email and drafts a note on why you fit. No email goes out before you start a campaign."} />
    </DataReport>
  );
}
