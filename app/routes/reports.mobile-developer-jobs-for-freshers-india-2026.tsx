import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "mobile-developer-jobs-for-freshers-india-2026",
  "title": "Mobile App Developer Jobs for Freshers in India: 288 Listings 2026",
  "short": "Mobile App Developer Jobs for Freshers 2026",
  "description": "Mobile app developer jobs for freshers in India: 288 October listings, 28.8% internships, Flutter the top title, and GitHub named in 19.5% of descriptions.",
  "keywords": "mobile app developer jobs for freshers, mobile app developer fresher salary, mobile app developer jobs in india 2026, how to get a mobile app developer job as a fresher, mobile app developer internship",
  "h1": "Mobile App Developer Jobs for Freshers in India:",
  "h1em": "What 288 Listings Show",
  "sub": "We tracked 288 mobile app developer jobs for freshers posted in October 2026. Flutter is the top title, 83 listings (28.8%) are internships, and GitHub is named in 19.5% of descriptions. Only 19 jobs state pay.",
  "published": "2026-11-11",
  "scope": "India · mobile app developer · freshers and interns",
  "findings": [
    "There are **288 mobile app developer jobs for freshers** in the Studojo Jobs Index for October 2026: 205 jobs and 83 internships (28.8%).",
    "**Flutter leads the titles.** Flutter Developer has 23 listings (8.0%), React Native Developer 19 (6.6%), Android Developer 18 (6.2%) and iOS Developer 16 (5.6%).",
    "**Your GitHub is part of the application.** GitHub is named in 53 of the 272 described listings (19.5%).",
    "**Stated pay is rare and uneven.** Only 19 jobs (9.3%) state pay, with a median of ₹4 lakh a year, but the middle half runs from ₹3 lakh to ₹12 lakh.",
    "**Email the engineering lead with one working app.** Send a short screen recording and a repo link, and follow up once. Stu finds the person and drafts the email."
  ],
  "stats": [
    {
      "num": "288",
      "label": "Mobile app developer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "9.3%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "34.2%",
      "label": "Of listings with a full description ask for JavaScript, React or Node",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are mobile app developer fresher jobs called?",
      "sub": "Cross-platform titles now outnumber the native ones.",
      "paras": [
        "Flutter Developer is the top title with 23 of 288 listings (8.0%). React Native Developer has 19 (6.6%), Android Developer 18 (6.2%) and iOS Developer 16 (5.6%). Flutter and React Native together outnumber Android and iOS, so a cross-platform framework is a safe first thing to learn.",
        "Internship titles are close behind. Mobile App Development Internship and Flutter Development Internship have 9 listings each, and Ios App Development Internship has 4. Titles like Software Engineer iOS have 5 and 4 listings under two spellings. Search both spellings.",
        "227 different employers posted these listings, and the top ten account for only 10.4%, so hiring is widely spread. About 4.5% hide the employer. Many small product teams and agencies hire one developer at a time, so the person who decides is often the engineering lead or the founder."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Flutter Developer",
            "23"
          ],
          [
            "React Native Developer",
            "19"
          ],
          [
            "Android Developer",
            "18"
          ],
          [
            "Ios Developer",
            "16"
          ],
          [
            "Mobile App Development Internship",
            "9"
          ],
          [
            "Flutter Development Internship",
            "9"
          ],
          [
            "Software Engineer - Ios",
            "5"
          ],
          [
            "Software Engineer-Ios",
            "4"
          ],
          [
            "Software Engineering-Android",
            "4"
          ],
          [
            "Ios App Development Internship",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 227 different employers posted these listings, and 4.5% of listings do not name the employer."
      }
    },
    {
      "title": "Where are mobile app developer jobs in India?",
      "sub": "Bengaluru leads, and a sixth of listings are remote.",
      "paras": [
        "Bengaluru has 48 listings (16.7%), Mumbai 26 (9.0%), Pune and Hyderabad 17 each, Gurugram 16 and Chennai 15. Delhi has 14, Ahmedabad 13, Noida 12 and Chandigarh 9. Chandigarh making the top ten is a useful signal for freshers in the north who do not want to relocate far.",
        "44 listings (15.3%) are marked remote and 46 name no city. A listing can name more than one city. Remote is far more common than in civil or electrical work, but less than in data science. If you live outside a metro, search remote first.",
        "Work from home is named in 26 listings (9.6%) and hybrid in 10 (3.7%). Smaller teams often prefer a developer in the same time zone, so remote still means India hours. Ask about working hours when you write."
      ],
      "chart": {
        "id": "rmdjffi38Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=288)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Pune",
          "Hyderabad",
          "Gurugram",
          "Chennai",
          "Delhi",
          "Ahmedabad",
          "Noida",
          "Chandigarh"
        ],
        "values": [
          48,
          26,
          17,
          17,
          16,
          15,
          14,
          13,
          12,
          9
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
            "48",
            "16.7%"
          ],
          [
            "Mumbai",
            "26",
            "9.0%"
          ],
          [
            "Pune",
            "17",
            "5.9%"
          ],
          [
            "Hyderabad",
            "17",
            "5.9%"
          ],
          [
            "Gurugram",
            "16",
            "5.6%"
          ],
          [
            "Chennai",
            "15",
            "5.2%"
          ],
          [
            "Delhi",
            "14",
            "4.9%"
          ],
          [
            "Ahmedabad",
            "13",
            "4.5%"
          ],
          [
            "Noida",
            "12",
            "4.2%"
          ],
          [
            "Chandigarh",
            "9",
            "3.1%"
          ]
        ],
        "note": "A listing can name more than one city. 44 listings are marked remote and 46 name no city."
      }
    },
    {
      "title": "Are mobile app developer jobs mostly internships, and what do they pay?",
      "sub": "Nearly three in ten are internships, and pay is rarely stated.",
      "paras": [
        "Of 288 listings, 205 are jobs and 83 are internships (28.8%). Across the whole index, internships are 10.8% of listings, so mobile development leans towards internships. 10 listings (3.7%) say unpaid, so check before you commit time.",
        "Only 19 of 205 jobs (9.3%) state pay in rupees. The median stated salary, using the top of each range, is ₹4 lakh a year. The middle half runs from ₹3 lakh to ₹12 lakh, a wide spread. 8 sit at ₹3 to 5 lakh, 3 at ₹8 to 12 lakh, 4 at ₹12 to 20 lakh and 2 at ₹20 lakh or more.",
        "No internship states a stipend. With so little stated, ask the engineering lead for the range early. The spread tells you something useful though: a fresher who can ship a polished app can move well above the middle, while a first job at a small agency may sit near ₹3 lakh."
      ],
      "chart": {
        "id": "rmdjffi38Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=288)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          205,
          83
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do mobile app developer fresher listings ask for?",
      "sub": "JavaScript and Java lead, and GitHub shows up often.",
      "paras": [
        "Of 272 listings with a full description, 95 (34.9%) mention communication skills and 93 (34.2%) mention JavaScript, React or Node. Java appears in 70 (25.7%), cloud in 40 (14.7%), English in 37 (13.6%) and SQL in 16 (5.9%). Python and Figma each appear in 10.",
        "JavaScript at 34.2% is the React Native signal, and Java at 25.7% is mostly Android. Our keyword list does not separately track Flutter, Dart, Swift or Kotlin in descriptions, so low counts for them would not mean low demand.",
        "On conditions, 128 listings (47.1%) mention a BTech, BE or computer science degree and 47 (17.3%) say freshers. GitHub appears in 53 (19.5%), a certificate in 43 (15.8%) and a portfolio in 20 (7.4%). Employers want to open your app, not read your marksheet."
      ],
      "chart": {
        "id": "rmdjffi38Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (272 listings with a full description)",
        "labels": [
          "communication skills",
          "JavaScript, React or Node",
          "Java",
          "cloud (AWS, Azure, GCP)",
          "English",
          "SQL",
          "machine learning or generative AI",
          "social media",
          "Python",
          "Figma"
        ],
        "values": [
          34.9,
          34.2,
          25.7,
          14.7,
          13.6,
          5.9,
          5.1,
          4.0,
          3.7,
          3.7
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a mobile app developer fresher?",
      "sub": "Ship a small app and let the lead open it.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). 15 listings (5.5%) put an email in the description. For the rest, find the engineering lead, the CTO at a small product company or the mobile team lead.",
        "Send one app. A small Flutter or Android app that does one thing well, with a 30-second screen recording and a repo link with a clear readme, is enough. If it is on a store or a test build, say so. Do not send a list of tutorial projects.",
        "Keep the email to three lines: who you are, the app and the link, and a question about whether the team needs a junior mobile developer or intern. Follow up once. Saturday carries 17.4% of postings here, the same as Friday, so weekend writing is fine. Stu finds the right lead, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **288 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as mobile app developer when its job title matches that role (the most common titles here: \"Flutter Developer\", \"React Native Developer\", \"Android Developer\").",
    "Pay: 19 of 205 entry-level listings (9.3%) state a salary in rupees and 0 of 83 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 272 listings (94.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, Shine, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best mobile app developer jobs for freshers?",
      "a": "Flutter Developer (23 listings), React Native Developer (19), Android Developer (18) and iOS Developer (16) are the largest titles in the October listings. Pick the framework in which you can show a working app."
    },
    {
      "q": "What is a mobile app developer fresher salary in India?",
      "a": "Among 19 jobs that state pay, the median is ₹4 lakh a year, with a middle range from ₹3 lakh to ₹12 lakh. Only 9.3% of jobs state pay, so the range is a rough guide."
    },
    {
      "q": "Should a fresher learn Flutter or React Native?",
      "a": "Both appear: Flutter Developer has 23 listings and React Native Developer 19. JavaScript, React or Node appears in 34.2% of described listings. Choose the one you will build a complete app in."
    },
    {
      "q": "Is there a mobile app developer internship for freshers?",
      "a": "Yes. 83 of 288 listings (28.8%) are internships, and none states a stipend. 10 listings say unpaid, so ask before you accept."
    },
    {
      "q": "Do mobile app developer jobs allow remote work?",
      "a": "Some do. 44 of 288 listings (15.3%) are marked remote and 26 mention work from home. Expect India working hours."
    },
    {
      "q": "How do I get a mobile app developer job as a fresher?",
      "a": "Email the engineering lead with one small working app, a short screen recording and a repo link. Three lines, one follow-up. That beats joining about 242 applications for each opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 288 October listings.",
    "items": [
      [
        "Pick one framework",
        "Flutter and React Native titles outnumber Android and iOS."
      ],
      [
        "Keep your repo tidy",
        "GitHub appears in 19.5% of described listings."
      ],
      [
        "Ask about pay",
        "Only 19 jobs state it, from ₹3 lakh to above ₹20 lakh."
      ],
      [
        "Check for unpaid roles",
        "10 listings say unpaid."
      ],
      [
        "Send an app, not a CV",
        "A screen recording and a link do the work."
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
    "name": "Studojo Jobs Index, October 2026: Mobile App Developer Jobs for Freshers 2026",
    "description": "288 active entry-level and internship listings for India posted in October 2026 (mobile app developer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-mobile-developer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Who leads engineering at the team you want to join?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
