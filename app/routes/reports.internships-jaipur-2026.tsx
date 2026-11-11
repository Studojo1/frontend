import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internships-jaipur-2026",
  "title": "Internships in Jaipur 2026: 344 Listings, 9 State a Stipend",
  "short": "Internships in Jaipur 2026",
  "description": "Internships in Jaipur: 344 October listings, only 9 state a stipend (median ₹18,750 a month). Roles, skills and how to judge an unpaid or unstated offer.",
  "keywords": "internships in jaipur, paid internship in jaipur, internship in jaipur for students, stipend in jaipur, how to get an internship in jaipur",
  "h1": "Internships in Jaipur:",
  "h1em": "344 Listings, 9 State Pay",
  "sub": "We tracked 344 Jaipur internship listings posted in October 2026. Only 9 state a stipend in rupees, so any average is a thin one: the median of those is ₹18,750 a month. For every other listing, ask for the figure.",
  "published": "2026-11-11",
  "scope": "Jaipur · internships",
  "findings": [
    "Internships in Jaipur come to **344 October listings** in the Studojo Jobs Index, from 264 different employers.",
    "**Only 9 listings (2.6%) state a stipend in rupees.** The median of the top of those ranges is ₹18,750 a month, but with nine data points it is a hint and not a benchmark.",
    "**Jaipur leans on digital work.** Marketing-executive has 59 listings (17.2%), social media 41 (11.9%) and SEO shows up in 18.0% of listings with a full description.",
    "**Half of the listings mention a certificate.** 169 of 339 (49.9%) do, compared with 7 (2.1%) that say unpaid, so ask what else you get.",
    "**The move that works is a short email to the person who runs the team.** Stu finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "344",
      "label": "Internships listed in Jaipur, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "2.6%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "34.8%",
      "label": "Of listings with a full description ask for social media",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What internships are there in Jaipur?",
      "sub": "Role groups across 344 listings",
      "paras": [
        "Internships in Jaipur are marketing first. Marketing-executive has 59 listings, which is 17.2% of the city, a bigger share than in Mumbai, Delhi NCR or Chennai. HR and social media tie at 41 listings each (11.9%), and business development has 30 (8.7%).",
        "Digital marketing adds 18 (5.2%), video editor 13 (3.8%) and graphic designer 10 (2.9%). SEO has 9 listings (2.6%), accountant 9, operations executive 11, field sales 7 and content writer 6. If you want a finance or engineering internship, Jaipur is a thin market, and you may need to look at remote roles or a bigger city.",
        "Role groups come from title matching. A title can land in two groups, and plain titles such as associate or trainee land in none. With 344 listings in total, treat the shares as a sketch of where the volume sits rather than exact counts."
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
            "59",
            "17.2%"
          ],
          [
            "HR",
            "41",
            "11.9%"
          ],
          [
            "social media",
            "41",
            "11.9%"
          ],
          [
            "business development",
            "30",
            "8.7%"
          ],
          [
            "digital marketing",
            "18",
            "5.2%"
          ],
          [
            "video editor",
            "13",
            "3.8%"
          ],
          [
            "operations executive",
            "11",
            "3.2%"
          ],
          [
            "graphic designer",
            "10",
            "2.9%"
          ],
          [
            "accountant",
            "9",
            "2.6%"
          ],
          [
            "SEO",
            "9",
            "2.6%"
          ],
          [
            "field sales",
            "7",
            "2.0%"
          ],
          [
            "content writer",
            "6",
            "1.7%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Lead:** Marketing-executive covers 17.2% of Jaipur listings. If you can write, design or post, you are applying where most of the openings are."
    },
    {
      "title": "What are Jaipur internships called, and when do they go up?",
      "sub": "Top titles and posting days",
      "paras": [
        "Human Resources (HR) Internship is the most common title with 19 listings, ahead of Business Development (Sales) Internship with 13. Social Media Marketing Internship has 10 and Social Media Marketing Intern 8. Search Engine Optimization (SEO) Internship and Digital Marketing Internship have 6 each.",
        "The list continues with Graphic Design Internship, Video Editing/Making Internship and Sales Intern at 5 each. 264 different employers posted these 344 listings, the ten biggest hold 15.4%, and only 1.5% do not name the employer, which is among the most open we see.",
        "Wednesday leads with 68 listings (19.8%), then Thursday with 64 (18.6%) and Tuesday with 58 (16.9%). Saturday has 37 (10.8%) and Sunday 10 (2.9%). Internshala carried half of Jaipur's listings, 173 (50.3%), with LinkedIn at 93 (27.0%), company sites at 39 and Naukri at 25."
      ],
      "chart": {
        "id": "rij273Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=344)",
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
          53,
          58,
          68,
          64,
          54,
          37,
          10
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
            "Human Resources (HR) Internship",
            "19"
          ],
          [
            "Business Development (Sales) Internship",
            "13"
          ],
          [
            "Social Media Marketing Internship",
            "10"
          ],
          [
            "Social Media Marketing Intern",
            "8"
          ],
          [
            "Search Engine Optimization (SEO) Internship",
            "6"
          ],
          [
            "Digital Marketing Internship",
            "6"
          ],
          [
            "Graphic Design Internship",
            "5"
          ],
          [
            "Video Editing/Making Internship",
            "5"
          ],
          [
            "Sales Intern",
            "5"
          ],
          [
            "Centre Digital Marketing Intern - Jaipur",
            "5"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 264 different employers posted these listings, and 1.5% of listings do not name the employer."
      }
    },
    {
      "title": "Is there a paid internship in Jaipur? What does a stipend look like?",
      "sub": "9 of 344 listings state pay",
      "paras": [
        "Jaipur has the fewest stated stipends in this series. 9 of 344 listings state one in rupees (2.6%), and the median of the top of those ranges is ₹18,750 a month. Five of the nine fall between ₹10,000 and 20,000, three between ₹20,000 and 40,000, and one between ₹5,000 and 10,000.",
        "That number is higher than in several bigger cities, but with nine listings one or two employers can move it. Use it as a ceiling in your head for what a well-run, paying internship offers, not as what an average Jaipur intern earns.",
        "The chart shows what listings say about the job. 169 mention a certificate (49.9%), 18 a pre-placement offer (5.3%) and 7 say unpaid (2.1%). None mentions a bond or a fee. To judge an unpaid or unstated offer, ask for the monthly amount, hours and manager, then ask what you will make that you can show next time. A certificate is not pay."
      ],
      "chart": {
        "id": "rij273Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (339 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "incentives",
          "targets",
          "a portfolio",
          "a pre-placement offer (PPO)",
          "work from office",
          "hybrid",
          "work from home",
          "unpaid"
        ],
        "values": [
          49.9,
          25.7,
          15.0,
          10.0,
          9.4,
          5.3,
          3.8,
          3.2,
          2.4,
          2.1
        ],
        "unit": "%"
      },
      "callout": "**Lead:** 18 Jaipur listings mention a pre-placement offer. If one matters to you, ask for the conditions in writing before you start."
    },
    {
      "title": "What skills do Jaipur internship listings ask for?",
      "sub": "Share of 339 listings with a full description",
      "paras": [
        "Communication skills lead at 59.0% of the 339 Jaipur listings with a full description. Social media is next at 34.8%, English at 29.2% and Excel at 26.0%. Social media is higher here than in most cities.",
        "SEO stands out at 18.0%, Canva at 13.3%, ChatGPT or AI tools at 9.4%, CRM tools at 9.1%, Adobe tools at 8.6% and paid ads at 8.6%. That is a digital marketing stack, and it matches the role table.",
        "Terms show who is wanted: freshers in 25.7%, women candidates in 23.6%, incentives in 15.0% and a portfolio in 9.4%. MBA or PGDM is mentioned in 8.3% and BTech, BE or computer science in 7.1%. If you are applying for a marketing role, one SEO or Canva sample will say more than a skills list."
      ],
      "chart": {
        "id": "rij273Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (339 listings with a full description)",
        "labels": [
          "communication skills",
          "social media",
          "English",
          "Excel",
          "SEO",
          "Canva",
          "ChatGPT or AI tools",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Adobe tools (Photoshop, Illustrator)",
          "paid ads (Google, Meta, PPC)"
        ],
        "values": [
          59.0,
          34.8,
          29.2,
          26.0,
          18.0,
          13.3,
          9.4,
          9.1,
          8.6,
          8.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get an internship in Jaipur?",
      "sub": "Who to email and what to send",
      "paras": [
        "Write to the person who runs the team. For marketing, that is the marketing head or the founder at a small agency. For HR, the HR head. For sales, the sales lead. Only 23 Jaipur listings (6.8%) put an email in the description, so most of the time you need to find the person.",
        "Attach one small thing made for that business: five SEO title ideas for their site, a three-post calendar, a one-page screening checklist or a short reel concept. Then write three lines: who you are, what you made and one question. Small firms in Jaipur often decide fast, so the founder is a good target.",
        "Follow up once, then stop. Studojo built Stu for the slow parts: it finds who hires, verifies their work email, writes a personal note from your real work and sends it from your own inbox once you start a campaign. Stu does not mass apply and does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **344 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. Only internships are counted, and a listing counts for Jaipur when it names Jaipur as a location.",
    "Pay: 9 of 344 internships (2.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 339 listings (98.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Internshala, LinkedIn, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many internships are there in Jaipur?",
      "a": "We tracked 344 internship listings in Jaipur posted in October 2026, from 264 different employers. This counts listings, not hires."
    },
    {
      "q": "Is there a paid internship in Jaipur?",
      "a": "Yes, but only 9 of 344 listings state a stipend in rupees, with a median of ₹18,750 a month. 7 say unpaid and the rest do not say, so ask."
    },
    {
      "q": "What is the stipend in Jaipur for interns?",
      "a": "Among the 9 listings that state one, 5 top out at ₹10,000 to 20,000 a month and 3 at ₹20,000 to 40,000. The median is ₹18,750. Nine is a small sample, so confirm the figure."
    },
    {
      "q": "Which internships in Jaipur are best for students?",
      "a": "Marketing-executive leads with 59 listings, then HR and social media with 41 each. Digital marketing has 18 and SEO 9. Pick the group where you can show one real sample."
    },
    {
      "q": "Where are Jaipur internships listed?",
      "a": "Internshala carried 173 (50.3%), LinkedIn 93 (27.0%), company career sites and ATS pages 39 (11.3%), Naukri 25 (7.3%) and Shine 14 (4.1%). Portals overlap."
    },
    {
      "q": "How do you judge an unpaid internship in Jaipur?",
      "a": "Ask for the monthly amount, hours, your manager and what you will make. 169 listings mention a certificate, but that is not pay. Look for a written pre-placement offer if that is what you want."
    }
  ],
  "takeaway": {
    "sub": "What to remember about Jaipur internships",
    "items": [
      [
        "Pay is almost never stated",
        "9 of 344 listings give a stipend. The ₹18,750 median is a hint at best."
      ],
      [
        "Marketing dominates",
        "Marketing-executive has 59 listings and social media 41."
      ],
      [
        "SEO matters here",
        "18.0% of descriptions mention SEO, higher than most cities."
      ],
      [
        "Certificates are everywhere",
        "Half of listings mention one. Ask what else you get."
      ],
      [
        "Email the team lead or founder",
        "Send one small piece of work and follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-jaipur-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Jaipur 2026"
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
    "name": "Studojo Jobs Index, October 2026: Internships in Jaipur 2026",
    "description": "344 active entry-level and internship listings for India posted in October 2026 (Jaipur), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-internships-jaipur-2026" place="report-end" size="card" title={"Want to email who hires in Jaipur?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
