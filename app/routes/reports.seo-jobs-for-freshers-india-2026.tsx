import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "seo-jobs-for-freshers-india-2026",
  "title": "SEO Jobs for Freshers in India 2026: 580 Listings, Pay and Skills",
  "short": "SEO Jobs for Freshers 2026",
  "description": "SEO jobs for freshers in India: 580 October listings, 35.9% internships, median stated pay ₹2.4 lakh a year, and 10.9% of descriptions carry an email address.",
  "keywords": "SEO jobs for freshers, SEO fresher salary, SEO jobs in india 2026, how to get a SEO job as a fresher, SEO internship",
  "h1": "SEO Jobs for Freshers in India:",
  "h1em": "What 580 Listings Show",
  "sub": "SEO jobs for freshers are mostly SEO Executive and internship roles: 580 October listings in the Studojo Jobs Index, 372 jobs and 208 internships. The median stated salary is ₹2.4 lakh a year, lower than most marketing roles.",
  "published": "2026-11-11",
  "scope": "India · SEO · freshers and interns",
  "findings": [
    "**SEO jobs for freshers are priced low and posted often**: 580 October listings and a median top of range of ₹2.4 lakh a year among the 67 jobs (18.0%) that state pay.",
    "**One title does most of the work**: SEO Executive has 109 listings (18.8%) and the SEO internship title has 65 (11.2%).",
    "**Content and social sit next to SEO**: 30.2% of descriptions mention social media and 21.0% mention writing or copywriting, so SEO is rarely a pure specialism at entry level.",
    "**Employers are spread thin**: 485 employers, and the ten busiest hold 9.7% of listings, while 10.9% of descriptions include a contact email.",
    "**Email the head of SEO or content with a one-page audit**: it is the best proof you can send. We built Stu to find that person and send from your own inbox."
  ],
  "stats": [
    {
      "num": "580",
      "label": "SEO listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹2.4 lakh",
      "label": "Median stated pay a year, from the 67 jobs that state it (18.0%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "99.1%",
      "label": "Of listings with a full description ask for SEO",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are SEO jobs for freshers called, and who posts them?",
      "sub": "SEO Executive leads, and the internship is second.",
      "paras": [
        "SEO jobs for freshers are named simply. SEO Executive has 109 listings (18.8%), the Search Engine Optimization (SEO) Internship title has 65 (11.2%) and SEO Intern has 27. SEO Specialist (20) and the spelled-out Search Engine Optimization Executive (17) and Specialist (16) are the same family.",
        "Search both spellings. A listing that spells out Search Engine Optimization will not always match a search on SEO, so run both. SEO Content Writer (6) is a small side door for people who write better than they analyse.",
        "485 different employers posted the 580 listings, with 2.8% hiding the employer, and the top ten hold only 9.7%. 372 are jobs and 208 are internships, an internship share of 35.9%."
      ],
      "chart": {
        "id": "rsjffi215Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=580)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          372,
          208
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
            "SEO Executive",
            "109"
          ],
          [
            "Search Engine Optimization (SEO) Internship",
            "65"
          ],
          [
            "SEO Intern",
            "27"
          ],
          [
            "SEO Specialist",
            "20"
          ],
          [
            "Search Engine Optimization Executive",
            "17"
          ],
          [
            "Search Engine Optimization Specialist",
            "16"
          ],
          [
            "SEO Professional",
            "9"
          ],
          [
            "Search Engine Optimization Intern",
            "9"
          ],
          [
            "SEO Content Writer",
            "6"
          ],
          [
            "Search Engine Optimization (SEO) Associate",
            "6"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 485 different employers posted these listings, and 2.8% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have the most SEO jobs for freshers?",
      "sub": "Mumbai leads. Delhi NCR and Gujarat show up strongly.",
      "paras": [
        "Mumbai has 63 listings (10.9%), Delhi 55 (9.5%) and Noida 53 (9.1%). Delhi NCR (Delhi, Noida, Gurugram) together outnumber Mumbai. Bengaluru has only 34 (5.9%), the same as Ahmedabad.",
        "That is the surprise: Bengaluru is not first for SEO, unlike most role reports. Pune has 30, Hyderabad 29, Gurugram 26, Jaipur 22 and Chandigarh 18.",
        "69 listings (11.9%) are marked remote and 75 name no city. SEO work is largely screen-based, so remote is workable, but check the pay line first."
      ],
      "chart": {
        "id": "rsjffi215Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=580)",
        "labels": [
          "Mumbai",
          "Delhi",
          "Noida",
          "Ahmedabad",
          "Bengaluru",
          "Pune",
          "Hyderabad",
          "Gurugram",
          "Jaipur",
          "Chandigarh"
        ],
        "values": [
          63,
          55,
          53,
          34,
          34,
          30,
          29,
          26,
          22,
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
            "Mumbai",
            "63",
            "10.9%"
          ],
          [
            "Delhi",
            "55",
            "9.5%"
          ],
          [
            "Noida",
            "53",
            "9.1%"
          ],
          [
            "Ahmedabad",
            "34",
            "5.9%"
          ],
          [
            "Bengaluru",
            "34",
            "5.9%"
          ],
          [
            "Pune",
            "30",
            "5.2%"
          ],
          [
            "Hyderabad",
            "29",
            "5.0%"
          ],
          [
            "Gurugram",
            "26",
            "4.5%"
          ],
          [
            "Jaipur",
            "22",
            "3.8%"
          ],
          [
            "Chandigarh",
            "18",
            "3.1%"
          ]
        ],
        "note": "A listing can name more than one city. 69 listings are marked remote and 75 name no city."
      }
    },
    {
      "title": "What is an SEO fresher salary in India?",
      "sub": "A ₹2.4 lakh median for jobs and ₹12,000 a month for interns.",
      "paras": [
        "67 of 372 jobs state pay in rupees. The median top of range is ₹2.4 lakh a year, and the middle half runs from ₹2.2 lakh to ₹3.5 lakh. 29 jobs (43.3%) sit in ₹2 to 3 lakh, 23 (34.3%) in ₹3 to 5 lakh, 10 (14.9%) under ₹2 lakh and 5 (7.5%) in ₹5 to 8 lakh.",
        "Internships are slightly better documented: 11 of 208 (5.3%) state a stipend. The median top of range is ₹12,000 a month. Six sit between ₹10,000 and ₹20,000, 4 between ₹5,000 and ₹10,000 and 1 at ₹40,000 or more.",
        "Those are tops of ranges and the samples are small. 82.0% of jobs state no pay. SEO is a skill you can grow into a higher paid role, so judge a first job on what you will learn as well as the figure."
      ],
      "chart": {
        "id": "rsjffi215Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (67 jobs that state pay in rupees)",
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
          10,
          29,
          23,
          5,
          0,
          0,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do SEO fresher jobs ask for?",
      "sub": "SEO, communication, social media, and writing.",
      "paras": [
        "Among the 562 listings with a full description, 99.1% mention SEO, which is the keyword, and 64.8% mention communication skills. Social media is in 30.2%, English in 27.4% and content writing or copywriting in 21.0%. Paid ads are in 16.5%, AI tools in 15.3% and Excel in 9.4%.",
        "AI tools at 15.3% is notable. Employers expect you to use them for drafts, but your edge is judgment: which keywords, which page, what to fix first.",
        "Terms: 18.1% say freshers and 18.0% ask for a certificate. 14.9% mention targets, 7.8% a portfolio, and 6.0% BTech or BE. 3.4% say any graduate. 7.1% say work from office and 6.4% work from home."
      ],
      "chart": {
        "id": "rsjffi215Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (562 listings with a full description)",
        "labels": [
          "SEO",
          "communication skills",
          "social media",
          "English",
          "content writing or copywriting",
          "paid ads (Google, Meta, PPC)",
          "ChatGPT or AI tools",
          "Excel",
          "Canva",
          "CRM tools (Salesforce, HubSpot or similar)"
        ],
        "values": [
          99.1,
          64.8,
          30.2,
          27.4,
          21.0,
          16.5,
          15.3,
          9.4,
          6.0,
          4.8
        ],
        "unit": "%"
      },
      "callout": "**Notice:** 10.9% of descriptions include an email address. That is a direct line to someone on the team."
    },
    {
      "title": "How do you get hired as an SEO fresher?",
      "sub": "Send a one-page site audit to the head of SEO or content.",
      "paras": [
        "SEO listings are a crowded form-fill. The Interview Guys (April 2026) cite roughly 0.1% to 2% as the typical online success rate per application. A short, specific email to the person who owns organic traffic beats that by being the only thing in their inbox that is already useful to them.",
        "Email the SEO lead, the head of content, or the marketing head at a small company. Attach one proof: a one-page audit of their own site, with three specific fixes (a title tag, a slow page, a missing internal link) and the reason for each, written so a non-expert can follow it. Use free tools to gather evidence, but write the conclusions yourself.",
        "Three lines: your name, the audit you did, and a request for a short call. Follow up once. Stu does the slow parts: it finds the person with a verified work email, writes the email from your real work and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **580 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as SEO when its job title matches that role (the most common titles here: \"SEO Executive\", \"Search Engine Optimization (SEO) Internship\", \"SEO Intern\").",
    "Pay: 67 of 372 entry-level listings (18.0%) state a salary in rupees and 11 of 208 internships (5.3%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 562 listings (96.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Internshala, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many SEO jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 580 October 2026 listings for SEO roles at entry level or internship: 372 jobs and 208 internships. That counts the listings we track, not hires."
    },
    {
      "q": "What is the SEO fresher salary in India?",
      "a": "Among 67 jobs that state pay, the median top of range is ₹2.4 lakh a year, with the middle half between ₹2.2 lakh and ₹3.5 lakh. 18.0% of jobs state pay."
    },
    {
      "q": "How much does an SEO internship pay?",
      "a": "11 of 208 internships (5.3%) state a stipend, with a median top of range of ₹12,000 a month. Most do not state one, so ask."
    },
    {
      "q": "What skills do I need for SEO jobs in India 2026?",
      "a": "SEO knowledge itself, then communication (64.8%), social media (30.2%), English (27.4%) and writing (21.0%). AI tools are in 15.3% and Excel in 9.4%."
    },
    {
      "q": "Is a certificate required for SEO jobs?",
      "a": "Often asked, rarely required. 18.0% of descriptions mention a certificate, 18.1% say freshers and 3.4% say any graduate."
    },
    {
      "q": "Can I find a remote SEO job as a fresher?",
      "a": "Some. 69 listings (11.9%) are marked remote, and 6.4% of descriptions mention work from home."
    }
  ],
  "takeaway": {
    "sub": "Five things for an SEO fresher this month.",
    "items": [
      [
        "Search both spellings",
        "SEO and Search Engine Optimization are posted separately."
      ],
      [
        "Do one real audit",
        "Pick a small site and write a three-fix page. It is your proof."
      ],
      [
        "Add writing",
        "21.0% of descriptions mention content writing."
      ],
      [
        "Look at Delhi NCR and Gujarat",
        "Delhi, Noida and Ahmedabad all have more listings than Bengaluru, or the same."
      ],
      [
        "Use the email in the listing",
        "10.9% of descriptions include a contact email."
      ]
    ]
  },
  "related": [
    {
      "slug": "digital-marketing-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Digital Marketing Jobs for Freshers 2026"
    },
    {
      "slug": "content-writer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Content Writer Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: SEO Jobs for Freshers 2026",
    "description": "580 active entry-level and internship listings for India posted in October 2026 (SEO), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-seo-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want your SEO audit read by the head of SEO?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring with a verified work email, writes a short note from your real work, and sends it from your inbox after you start a campaign."} />
    </DataReport>
  );
}
