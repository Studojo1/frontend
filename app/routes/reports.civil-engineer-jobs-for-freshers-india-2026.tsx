import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "civil-engineer-jobs-for-freshers-india-2026",
  "title": "Civil Engineer Jobs for Freshers in India: 611 Listings, 2026",
  "short": "Civil Engineer Jobs for Freshers 2026",
  "description": "Civil engineer jobs for freshers in India: 611 October listings, 207 with stated pay, a median of ₹3.6 lakh a year, and who to email to get hired.",
  "keywords": "civil engineer jobs for freshers, civil engineer fresher salary, civil engineer jobs in india 2026, how to get a civil engineer job as a fresher, civil engineer internship",
  "h1": "Civil Engineer Jobs for Freshers in India:",
  "h1em": "What 611 Listings Show",
  "sub": "We tracked 611 civil engineer jobs for freshers posted in October 2026. Most are site roles, 207 state pay, and the median stated salary is ₹3.6 lakh a year. Only 28 are internships, so a full-time site job is the main way in.",
  "published": "2026-11-11",
  "scope": "India · civil engineer · freshers and interns",
  "findings": [
    "There are **611 civil engineer jobs for freshers** in the Studojo Jobs Index for October 2026, and 583 of them are full-time entry-level jobs rather than internships.",
    "**Site engineer is as common as civil engineer.** Civil Engineer is the top title at 112 listings (18.3%), and Site Engineer is right behind at 98 (16.0%).",
    "**Only 207 listings (35.5%) state pay.** Among those, the median stated salary is ₹3.6 lakh a year, and 127 of them sit in the ₹3 to 5 lakh band.",
    "**Chennai is a real second market.** Bengaluru has 92 listings (15.1%) and Chennai has 80 (13.1%), ahead of Pune with 46 and Hyderabad with 45.",
    "**Email the project manager, not the portal.** Send one small piece of site work to the person who runs the project, and follow up once. Stu finds that person and drafts the email for you."
  ],
  "stats": [
    {
      "num": "611",
      "label": "Civil engineer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.6 lakh",
      "label": "Median stated pay a year, from the 207 jobs that state it (35.5%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "14.5%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are civil engineer fresher jobs called, and who posts them?",
      "sub": "The titles show that most of this work is on site, not in a design office.",
      "paras": [
        "Civil engineer jobs for freshers mostly carry two titles. Civil Engineer appears in 112 of the 611 listings (18.3%) and Site Engineer in 98 (16.0%). Add Civil Site Engineer (33), Site Civil Engineer (20) and Junior Site Engineer (10), and the site-facing titles clearly outnumber the pure design ones.",
        "Structural Engineer shows up 7 times and Quantity Surveyor 6 times, so estimating and structures are small side doors. Titles are written exactly as employers posted them, so search for several spellings of the same job. A Site Civil Engineer and a Civil Site Engineer are the same thing to a hiring manager.",
        "Employers are spread out. 483 different employers posted these listings, and the ten biggest posters account for only 12.3% of them. About 3.3% of listings hide the employer. That means no single contractor decides your odds, which is good news if you are applying cold."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Civil Engineer",
            "112"
          ],
          [
            "Site Engineer",
            "98"
          ],
          [
            "Civil Site Engineer",
            "33"
          ],
          [
            "Site Civil Engineer",
            "20"
          ],
          [
            "Junior Civil Engineer",
            "14"
          ],
          [
            "Junior Site Engineer",
            "10"
          ],
          [
            "Electrical Site Engineer",
            "7"
          ],
          [
            "Structural Engineer",
            "7"
          ],
          [
            "Site Engineering (Civil) Internship",
            "6"
          ],
          [
            "Quantity Surveyor",
            "6"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 483 different employers posted these listings, and 3.3% of listings do not name the employer."
      },
      "callout": "**Search tip:** use Site Engineer and Civil Engineer together. Together they cover about a third of all listings."
    },
    {
      "title": "Where are civil engineer jobs for freshers in India?",
      "sub": "Bengaluru leads, but Chennai is close and the second tier is wide.",
      "paras": [
        "Bengaluru has 92 civil engineer listings (15.1%) and Chennai has 80 (13.1%). Pune (46), Hyderabad (45) and Mumbai (42) follow. Mumbai being only fifth is a small surprise: across the whole index it is the top city, but for civil roles it trails the south.",
        "Ahmedabad has 34 listings, Delhi 18, Vadodara 15, Kochi 14 and Surat 13. If you are from Gujarat or Kerala, you do not need to move to a metro to find openings. A listing can name more than one city, and 33 listings name no city at all.",
        "Only 11 listings (1.8%) are marked remote. Civil work happens where the building is, so plan to be at a site. The practical move is to pick two cities, look at the project pipeline there, and write to the people running those projects."
      ],
      "chart": {
        "id": "rcejffi30Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=611)",
        "labels": [
          "Bengaluru",
          "Chennai",
          "Pune",
          "Hyderabad",
          "Mumbai",
          "Ahmedabad",
          "Delhi",
          "Vadodara",
          "Kochi",
          "Surat"
        ],
        "values": [
          92,
          80,
          46,
          45,
          42,
          34,
          18,
          15,
          14,
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
            "Bengaluru",
            "92",
            "15.1%"
          ],
          [
            "Chennai",
            "80",
            "13.1%"
          ],
          [
            "Pune",
            "46",
            "7.5%"
          ],
          [
            "Hyderabad",
            "45",
            "7.4%"
          ],
          [
            "Mumbai",
            "42",
            "6.9%"
          ],
          [
            "Ahmedabad",
            "34",
            "5.6%"
          ],
          [
            "Delhi",
            "18",
            "2.9%"
          ],
          [
            "Vadodara",
            "15",
            "2.5%"
          ],
          [
            "Kochi",
            "14",
            "2.3%"
          ],
          [
            "Surat",
            "13",
            "2.1%"
          ]
        ],
        "note": "A listing can name more than one city. 11 listings are marked remote and 33 name no city."
      }
    },
    {
      "title": "What is a civil engineer fresher salary in India?",
      "sub": "Most stated pay sits between ₹3 and ₹5 lakh a year, and most listings do not state it.",
      "paras": [
        "Only 207 of the 583 jobs (35.5%) state pay in rupees, so read this as a partial picture. The median stated salary, using the top of each range, is ₹3.6 lakh a year. The middle half runs from ₹3 lakh to ₹4.8 lakh.",
        "The ₹3 to 5 lakh band holds 127 listings (61.4%). Another 30 sit at ₹2 to 3 lakh and 35 at ₹5 to 8 lakh. Only 8 stated salaries reach ₹8 lakh or more. At the bottom, 7 are under ₹2 lakh. Pay in the listing is the top of the range, so expect an offer nearer the middle.",
        "Internships barely state pay. Of 28 internships (4.6% of listings), just one states a stipend, at ₹15,000 a month. One number is not a pattern. If you are choosing between an internship and a junior site job, the jobs give you far more pay information to compare."
      ],
      "chart": {
        "id": "rcejffi30Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (207 jobs that state pay in rupees)",
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
          7,
          30,
          127,
          35,
          5,
          1,
          2
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do civil engineer fresher listings ask for?",
      "sub": "Communication shows up far more than any software we track.",
      "paras": [
        "Of the 579 listings with a full description, 271 (46.8%) mention communication skills. Excel appears in 84 (14.5%), English in 51 (8.8%) and Hindi in 31 (5.4%). Negotiation, which matters for vendor and subcontractor work, is named in 16 (2.8%).",
        "Our keyword list does not track AutoCAD, STAAD, Revit or Primavera, so a low count here says nothing about whether you need them. It does say that employers write about talking to people, vendors and labour crews more than any tool we can measure.",
        "On conditions, 134 listings (23.1%) ask for a BTech or BE, 101 (17.4%) say freshers, and 42 (7.3%) want immediate joining. A two-wheeler or driving licence is named in 21 (3.6%) and a certificate in 21 (3.6%). Expect to travel between sites, so a licence is a quiet filter."
      ],
      "chart": {
        "id": "rcejffi30Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (579 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "Hindi",
          "negotiation",
          "cloud (AWS, Azure, GCP)",
          "SAP",
          "CRM tools (Salesforce, HubSpot or similar)",
          "machine learning or generative AI"
        ],
        "values": [
          46.8,
          14.5,
          8.8,
          5.4,
          2.8,
          1.7,
          1.2,
          1.2,
          1.2
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a civil engineer fresher?",
      "sub": "Skip the portal queue and write to the person who runs the site.",
      "paras": [
        "An average opening draws about 242 applications (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Of the 611 listings, 37 (6.4%) put an email address in the description. Use those, and for the rest find the project manager, the construction head or the planning lead for that project.",
        "Send one piece of real work. A quantity take-off for a small building from a public drawing, a bar bending schedule you prepared, or a site diary from your internship all work. Pick one, attach it as a single file, and say what you checked.",
        "The email is three lines: who you are and your degree, the one thing you attached, and a question about whether the team needs a junior site engineer. Follow up once after a few days. Thursday is the busiest posting day, with 25.4% of listings, so write early in the week. Stu finds the project manager, verifies the email, and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **611 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as civil engineer when its job title matches that role (the most common titles here: \"Civil Engineer\", \"Site Engineer\", \"Civil Site Engineer\").",
    "Pay: 207 of 583 entry-level listings (35.5%) state a salary in rupees and 1 of 28 internships (3.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 579 listings (94.8%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best civil engineer jobs for freshers in India?",
      "a": "Site Engineer and Civil Engineer are the most common, at 98 and 112 of 611 October listings. Junior Site Engineer, Structural Engineer and Quantity Surveyor roles are smaller but real. Pick the one where your project or internship work gives you something to show."
    },
    {
      "q": "What is the civil engineer fresher salary in India?",
      "a": "Among the 207 listings that state pay, the median is ₹3.6 lakh a year, and 61.4% fall in the ₹3 to 5 lakh band. Most listings do not state pay, so treat this as a guide, not a promise."
    },
    {
      "q": "Which cities have the most civil engineer jobs in India?",
      "a": "Bengaluru leads with 92 listings and Chennai follows with 80. Pune has 46, Hyderabad 45 and Mumbai 42. Ahmedabad, Vadodara, Kochi and Surat each have between 13 and 34."
    },
    {
      "q": "Is there a civil engineer internship I can start with?",
      "a": "There are 28 civil engineer internships in October listings, 4.6% of the total. Only one states a stipend, at ₹15,000 a month. Most fresher entry is through full-time junior site roles instead."
    },
    {
      "q": "How do you get a civil engineer job as a fresher?",
      "a": "Email the project manager or construction head with one piece of real work, such as a quantity take-off or a site diary. Keep it to three lines and follow up once. Applying alone through a portal is the slowest route."
    },
    {
      "q": "Do civil engineer jobs for freshers need a BTech?",
      "a": "Of 579 listings with a full description, 134 (23.1%) name a BTech, BE or similar degree, and 101 (17.4%) say freshers are welcome. Many listings simply do not state the degree, so apply if your work fits."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 611 October civil engineer listings.",
    "items": [
      [
        "Search two titles",
        "Civil Engineer and Site Engineer together cover about a third of the listings."
      ],
      [
        "Look south too",
        "Chennai has 80 listings, close behind Bengaluru with 92."
      ],
      [
        "Pay is thin data",
        "Only 207 listings state pay, with a median of ₹3.6 lakh a year."
      ],
      [
        "Prepare to travel",
        "21 listings mention a two-wheeler or licence, and only 11 are remote."
      ],
      [
        "Write to the project manager",
        "One attached piece of site work beats another portal application."
      ]
    ]
  },
  "related": [
    {
      "slug": "mechanical-engineer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Mechanical Engineer Jobs for Freshers 2026"
    },
    {
      "slug": "electrical-engineer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Electrical Engineer Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Civil Engineer Jobs for Freshers 2026",
    "description": "611 active entry-level and internship listings for India posted in October 2026 (civil engineer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-civil-engineer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want the project manager's email, not another portal form?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and drafts a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
