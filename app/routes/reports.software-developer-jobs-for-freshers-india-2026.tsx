import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "software-developer-jobs-for-freshers-india-2026",
  "title": "Software Developer Jobs for Freshers in India: 904 Listings 2026",
  "short": "Software Developer Jobs for Freshers 2026",
  "description": "Software developer jobs for freshers: 904 October listings in the Studojo Jobs Index, 24.1% in Bengaluru. See titles, stated pay, skills and how to get hired.",
  "keywords": "software developer jobs for freshers, software developer fresher salary, software developer jobs in india 2026, how to get a software developer job as a fresher, software developer internship",
  "h1": "Software Developer Jobs for Freshers in India:",
  "h1em": "What 904 Listings Show",
  "sub": "We track 904 software developer jobs for freshers posted in October 2026: 718 jobs and 186 internships. Bengaluru has 218 of them. Only 35 jobs state a salary, with a median top of range of ₹6 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · software developer · freshers and interns",
  "findings": [
    "The Studojo Jobs Index has **904 software developer jobs for freshers** for October 2026, and 718 of them are full-time entry-level jobs, not internships.",
    "**Bengaluru is far ahead.** It has 218 listings (24.1%), more than double Hyderabad at 92 and Pune at 81.",
    "**Java, Python and JavaScript are close.** JavaScript, React or Node appears in 44.5% of descriptions, Java in 43.0% and Python in 42.0%, so no single language wins the fresher market.",
    "**Pay is mostly unstated.** Only 35 of 718 jobs (4.9%) state a salary in rupees, the median top of range is ₹6 lakh a year, and just 1 internship states a stipend.",
    "**Show your code to an engineering manager.** 19.3% of listings mention GitHub and 47 include an email address, so send a link to one real repository to the person who runs the team."
  ],
  "stats": [
    {
      "num": "904",
      "label": "Software developer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹6 lakh",
      "label": "Median stated pay a year, from the 35 jobs that state it (4.9%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "44.5%",
      "label": "Of listings with a full description ask for JavaScript, React or Node",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are software developer jobs for freshers called?",
      "sub": "Software Engineer beats Software Developer on the listings.",
      "paras": [
        "Software Engineer is the most common title with 77 listings (8.5%). Associate Software Engineer follows with 58 (6.4%), then Software Developer with 36 (4.0%) and Software Engineer Intern with 31 (3.4%). If you only search for Developer, you miss a good part of the field.",
        "Some titles are narrower than they look. Application Developer Intern has 26 listings and PLC Programmer has 10, which is industrial automation work rather than web or app development. Junior Software Engineer and Junior Software Developer have 7 each.",
        "The 904 listings come from 572 different employers, and the top 10 hold only 13.4% of them. That is a wide spread, so no single hiring team dominates. A further 28 listings (3.1%) do not name the employer."
      ],
      "chart": {
        "id": "rsdjffi1Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=904)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          718,
          186
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
            "Software Engineer",
            "77"
          ],
          [
            "Associate Software Engineer",
            "58"
          ],
          [
            "Software Developer",
            "36"
          ],
          [
            "Software Engineer Intern",
            "31"
          ],
          [
            "Application Developer Intern",
            "26"
          ],
          [
            "Software Developer Intern",
            "14"
          ],
          [
            "Software Engineer I",
            "13"
          ],
          [
            "PLC Programmer",
            "10"
          ],
          [
            "Junior Software Engineer",
            "7"
          ],
          [
            "Junior Software Developer",
            "7"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 572 different employers posted these listings, and 3.1% of listings do not name the employer."
      }
    },
    {
      "title": "Where are software developer jobs in India for freshers?",
      "sub": "Bengaluru, then a long gap.",
      "paras": [
        "Bengaluru has 218 listings, which is 24.1% of the total. Hyderabad has 92 (10.2%), Pune 81 (9.0%), Chennai 75 (8.3%) and Mumbai 46 (5.1%). Delhi has 34 and Gurugram 33. A listing can name more than one city.",
        "Morena appears with 23 listings (2.5%), which is not a city most people expect on a tech list. Read those listings closely and check the work location and the type of role before you apply.",
        "Remote is rare compared with other fields: 89 listings are marked remote (9.8%) and 157 name no city. If you want a software developer job in India as a fresher, plan to be in or near a hub, or to move for a trial period."
      ],
      "chart": {
        "id": "rsdjffi1Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=904)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Pune",
          "Chennai",
          "Mumbai",
          "Delhi",
          "Gurugram",
          "Morena",
          "Noida",
          "Ahmedabad"
        ],
        "values": [
          218,
          92,
          81,
          75,
          46,
          34,
          33,
          23,
          19,
          18
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
            "218",
            "24.1%"
          ],
          [
            "Hyderabad",
            "92",
            "10.2%"
          ],
          [
            "Pune",
            "81",
            "9.0%"
          ],
          [
            "Chennai",
            "75",
            "8.3%"
          ],
          [
            "Mumbai",
            "46",
            "5.1%"
          ],
          [
            "Delhi",
            "34",
            "3.8%"
          ],
          [
            "Gurugram",
            "33",
            "3.7%"
          ],
          [
            "Morena",
            "23",
            "2.5%"
          ],
          [
            "Noida",
            "19",
            "2.1%"
          ],
          [
            "Ahmedabad",
            "18",
            "2.0%"
          ]
        ],
        "note": "A listing can name more than one city. 89 listings are marked remote and 157 name no city."
      }
    },
    {
      "title": "What is a software developer fresher salary in India?",
      "sub": "Very few listings say, and the ones that do spread wide.",
      "paras": [
        "Only 35 of the 718 jobs state a salary in rupees, which is 4.9%. For those 35, the median top of range is ₹6 lakh a year, and the middle half runs from ₹4.2 lakh to ₹9 lakh.",
        "The most common band is ₹3 to 5 lakh with 13 listings, then ₹5 to 8 lakh with 9. At the upper end, 6 listings state ₹12 to 20 lakh and 2 state ₹20 lakh or more. With so few listings, one or two high-paying employers can pull the picture upward.",
        "Internships barely state anything. Just 1 of 186 gives a stipend, and it is in the ₹20,000 to 40,000 a month band. Ask for the range in your first message, because the listing will not tell you."
      ],
      "chart": {
        "id": "rsdjffi1Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (35 jobs that state pay in rupees)",
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
          0,
          1,
          13,
          9,
          4,
          6,
          2
        ],
        "unit": "listings"
      }
    },
    {
      "title": "Which skills do software developer jobs ask freshers for?",
      "sub": "Three languages at about the same level, plus cloud.",
      "paras": [
        "Across the 862 listings with a full description, communication skills lead at 49.2%. Then come JavaScript, React or Node (44.5%), Java (43.0%) and Python (42.0%). Cloud (AWS, Azure, GCP) is mentioned in 40.1% and SQL in 30.5%.",
        "Machine learning or generative AI is named in 20.1%. ChatGPT or AI tools appear in 7.4%. Those are real signals, but they sit behind the basics.",
        "Look at what the listings say about the person. 57.8% mention BTech, BE or computer science, 19.6% say freshers and 19.3% mention GitHub. A portfolio is named in 9.7%. A public repository is therefore one of the few things on this list you can build and show before anyone interviews you."
      ],
      "chart": {
        "id": "rsdjffi1Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (862 listings with a full description)",
        "labels": [
          "communication skills",
          "JavaScript, React or Node",
          "Java",
          "Python",
          "cloud (AWS, Azure, GCP)",
          "SQL",
          "machine learning or generative AI",
          "ChatGPT or AI tools",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)"
        ],
        "values": [
          49.2,
          44.5,
          43.0,
          42.0,
          40.1,
          30.5,
          20.1,
          7.4,
          6.8,
          5.7
        ],
        "unit": "%"
      },
      "callout": "**Build once, show twice:** one clean repository with a readable README answers the GitHub and portfolio asks at the same time."
    },
    {
      "title": "How do you get hired as a software developer fresher?",
      "sub": "Send working code to the person who owns the team's backlog.",
      "paras": [
        "A portal application is a long shot. An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Only 47 of our 904 listings put an email address in the text.",
        "Write to the engineering manager or the tech lead of the team you want to join. At a small company, write to the CTO. Send a link to one repository that does something small and real: a script that fixes a boring task, a small API with tests, or a fix you contributed to an open project. Say in one line what it does.",
        "Three lines is enough: who you are, what you built and which part you are proud of, and a question about the team's stack. Follow up once. Stu, the AI career agent from Studojo, finds the person who hires, verifies their work email and drafts the note, which goes out from your own inbox only when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **904 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as software developer when its job title matches that role (the most common titles here: \"Software Engineer\", \"Associate Software Engineer\", \"Software Developer\").",
    "Pay: 35 of 718 entry-level listings (4.9%) state a salary in rupees and 1 of 186 internships (0.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 862 listings (95.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Naukri, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many software developer jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 904 software developer listings for freshers posted in October 2026: 718 jobs and 186 internships. They are listings we track, not hires, from one month of data."
    },
    {
      "q": "What is the software developer fresher salary in India?",
      "a": "Only 35 of 718 jobs state a salary in rupees. For those, the median top of range is ₹6 lakh a year and the middle half is ₹4.2 lakh to ₹9 lakh. Treat it as a small sample."
    },
    {
      "q": "Which programming language should a fresher learn first?",
      "a": "The listings do not pick one winner. JavaScript, React or Node appears in 44.5% of descriptions, Java in 43.0% and Python in 42.0%. Pick one, build a real project, then add a second."
    },
    {
      "q": "Are there software developer internships for freshers?",
      "a": "Yes, 186 of the 904 listings are internships (20.6%). Software Engineer Intern has 31 listings and Application Developer Intern has 26. Only 1 internship states a stipend, so ask before you start."
    },
    {
      "q": "Do you need a BTech to become a software developer?",
      "a": "Not always, but it is the common ask. 57.8% of full descriptions mention BTech, BE or computer science. About 1.3% say any graduate. A strong GitHub profile helps if you have a different degree."
    },
    {
      "q": "Which cities have the most software developer jobs for freshers?",
      "a": "Bengaluru leads with 218 listings (24.1%), then Hyderabad with 92, Pune with 81, Chennai with 75 and Mumbai with 46. Another 157 listings name no city."
    }
  ],
  "takeaway": {
    "sub": "What the 904 October listings say about getting in.",
    "items": [
      [
        "Search Software Engineer, not only Developer",
        "Software Engineer has 77 listings and Associate Software Engineer has 58."
      ],
      [
        "Plan around Bengaluru",
        "It holds 24.1% of listings, with Hyderabad and Pune next."
      ],
      [
        "Know one language well",
        "JavaScript, Java and Python are each in about 42% to 45% of descriptions."
      ],
      [
        "Ask about pay early",
        "Only 35 jobs and 1 internship state it."
      ],
      [
        "Email a repository, not a resume",
        "One real project sent to the engineering manager is worth more than another portal form."
      ]
    ]
  },
  "related": [
    {
      "slug": "qa-tester-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "QA and Testing Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, October 2026: Software Developer Jobs for Freshers 2026",
    "description": "904 active entry-level and internship listings for India posted in October 2026 (software developer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-software-developer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the engineering manager?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the hiring manager or team lead, verifies their work email and writes the note from your real work."} />
    </DataReport>
  );
}
