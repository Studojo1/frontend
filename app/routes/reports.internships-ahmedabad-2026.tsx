import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internships-ahmedabad-2026",
  "title": "Internships in Ahmedabad 2026: 421 Listings and What They Pay",
  "short": "Internships in Ahmedabad 2026",
  "description": "Internships in Ahmedabad: 421 October listings, but only 19 state a stipend (median ₹12,500 a month). Roles, skills and how to judge an unpaid offer.",
  "keywords": "internships in ahmedabad, paid internship in ahmedabad, internship in ahmedabad for students, stipend in ahmedabad, how to get an internship in ahmedabad",
  "h1": "Internships in Ahmedabad:",
  "h1em": "421 Listings, 19 State Pay",
  "sub": "We tracked 421 Ahmedabad internship listings posted in October 2026. Only 19 state a stipend in rupees, and the median of those is ₹12,500 a month. If a listing gives no figure, ask for one before you say yes.",
  "published": "2026-11-11",
  "scope": "Ahmedabad · internships",
  "findings": [
    "Internships in Ahmedabad come to **421 October listings** in the Studojo Jobs Index, from 289 different employers.",
    "**Only 19 listings (4.5%) state a stipend in rupees.** The median of the top of those ranges is ₹12,500 a month, lower than in Mumbai or Delhi NCR, and 11 of the 19 sit at ₹10,000 to 20,000.",
    "**Marketing, sales and HR are close to level.** Marketing-executive has 50 listings (11.9%), business development 48 (11.4%) and HR 47 (11.2%).",
    "**Ahmedabad is a freshers-friendly city on paper.** 107 listings with a full description (26.8%) say freshers, and BBA (6.3%), BCom (4.3%) and MBA (7.8%) all appear.",
    "**The move that works is a short email to the person who runs the team.** Stu finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "421",
      "label": "Internships listed in Ahmedabad, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "4.5%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "23.3%",
      "label": "Of listings with a full description ask for social media",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What internships in Ahmedabad can you apply for?",
      "sub": "Role groups across 421 listings",
      "paras": [
        "Internships in Ahmedabad split almost evenly between three groups. Marketing-executive has 50 listings, which is 11.9% of the city, business development has 48 (11.4%) and HR has 47 (11.2%). Social media follows with 35 (8.3%).",
        "After that the numbers are small. Graphic designer has 12 listings (2.9%), content writer 10 (2.4%) and QA and software testing 10 (2.4%). Digital marketing has 9, SEO 8, full stack developer 8, accountant 7 and video editor 7.",
        "The roles are mostly the ones that need a laptop and a phone: pitch, post, screen, test. Role groups come from matching titles, so a title can sit in two groups and many titles match none. With only 421 listings in total, one or two big postings can move a share by a point."
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
            "50",
            "11.9%"
          ],
          [
            "business development",
            "48",
            "11.4%"
          ],
          [
            "HR",
            "47",
            "11.2%"
          ],
          [
            "social media",
            "35",
            "8.3%"
          ],
          [
            "graphic designer",
            "12",
            "2.9%"
          ],
          [
            "content writer",
            "10",
            "2.4%"
          ],
          [
            "QA and software testing",
            "10",
            "2.4%"
          ],
          [
            "digital marketing",
            "9",
            "2.1%"
          ],
          [
            "SEO",
            "8",
            "1.9%"
          ],
          [
            "full stack developer",
            "8",
            "1.9%"
          ],
          [
            "accountant",
            "7",
            "1.7%"
          ],
          [
            "video editor",
            "7",
            "1.7%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Lead:** Business development and HR are the two groups where Ahmedabad is closest to Mumbai in share. If you want sales or recruiting, you are not short of choice."
    },
    {
      "title": "What are the job titles, and when do Ahmedabad listings appear?",
      "sub": "Top titles and posting days",
      "paras": [
        "Business Development (Sales) Internship is the top title with 20 listings, then Business Development Intern with 8 and Human Resources (HR) Internship with 8. Social Media Marketing Internship and Social Media Intern have 7 each. Field Sales Internship has 5, so sales runs deeper here than the role table alone suggests.",
        "The employers are varied but a little more concentrated than in the big cities. 289 different employers posted the 421 listings, the ten biggest hold 15.7%, and 3.8% do not name the employer.",
        "Thursday leads with 81 listings (19.2%), then Wednesday with 73 (17.3%) and Saturday with 72 (17.1%). Saturday is unusually active here compared with other cities, and Sunday has 12 (2.9%). LinkedIn carried 130 listings, Internshala 120, company sites 70 and Naukri 64."
      ],
      "chart": {
        "id": "ria272Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=421)",
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
          57,
          64,
          73,
          81,
          62,
          72,
          12
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
            "Business Development (Sales) Internship",
            "20"
          ],
          [
            "Business Development Intern",
            "8"
          ],
          [
            "Human Resources (HR) Internship",
            "8"
          ],
          [
            "Social Media Marketing Internship",
            "7"
          ],
          [
            "Social Media Intern",
            "7"
          ],
          [
            "Human Resource Intern",
            "6"
          ],
          [
            "Social Media Marketing Intern",
            "6"
          ],
          [
            "Field Sales Internship",
            "5"
          ],
          [
            "Content And Social Media Marketing Internship",
            "5"
          ],
          [
            "HR Intern",
            "5"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 289 different employers posted these listings, and 3.8% of listings do not name the employer."
      }
    },
    {
      "title": "Is there a paid internship in Ahmedabad, and what is the stipend?",
      "sub": "19 of 421 listings state pay",
      "paras": [
        "A paid internship in Ahmedabad exists, but the listing rarely says so. 19 of 421 state a stipend in rupees (4.5%), and the median of the top of those ranges is ₹12,500 a month. That is a small sample, so use it as a rough reference.",
        "Among the 19, 11 top out at ₹10,000 to 20,000 a month, 3 at ₹5,000 to 10,000, 2 at ₹20,000 to 40,000, 2 under ₹5,000 and 1 at ₹40,000 or more. The chart shows what the listings say about the job instead. A certificate appears in 121 (30.3%), a pre-placement offer in 11 (2.8%), unpaid in 9 (2.3%) and a bond in 3 (0.8%).",
        "Judge an unstated offer on four points: the monthly figure, the weekly hours, who you report to and what you will make. If the answer is a certificate only, decide whether the experience is worth your time. A bond or service agreement on an internship is a reason to read the paper twice before you sign."
      ],
      "chart": {
        "id": "ria272Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (399 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "incentives",
          "targets",
          "a portfolio",
          "work from office",
          "a pre-placement offer (PPO)",
          "unpaid",
          "hybrid",
          "PF, ESI or health insurance"
        ],
        "values": [
          30.3,
          26.8,
          14.3,
          13.5,
          8.3,
          3.8,
          2.8,
          2.3,
          2.0,
          1.5
        ],
        "unit": "%"
      },
      "callout": "**Lead:** The median stated stipend in Ahmedabad is ₹12,500. Use it to sense-check an offer, then ask what the role leads to."
    },
    {
      "title": "What skills do Ahmedabad internship listings ask for?",
      "sub": "Share of 399 listings with a full description",
      "paras": [
        "Communication skills appear in 57.6% of the 399 Ahmedabad listings with a full description. English follows at 24.1%, social media at 23.3% and Excel at 22.1%. CRM tools are in 10.0%.",
        "Further down, Adobe tools, SEO and negotiation sit at 5.8% each. Calling or telecalling is in 5.5% and Hindi in 4.8%. Incentives are mentioned in 14.3% and targets in 13.5%, so a fair share of the city's listings are sales roles with a variable component.",
        "Degree mentions show who is expected: MBA or PGDM in 7.8%, BBA in 6.3% and BCom in 4.3%. A portfolio is mentioned in 8.3%. Whatever your degree, the quickest way to look credible is one small thing you made: a pitch list, a post calendar or a clean Excel summary."
      ],
      "chart": {
        "id": "ria272Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (399 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "social media",
          "Excel",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Adobe tools (Photoshop, Illustrator)",
          "SEO",
          "negotiation",
          "calling or telecalling",
          "Hindi"
        ],
        "values": [
          57.6,
          24.1,
          23.3,
          22.1,
          10.0,
          5.8,
          5.8,
          5.8,
          5.5,
          4.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get an internship in Ahmedabad?",
      "sub": "Who to email and what to send",
      "paras": [
        "Aim at the person who runs the team. For sales, that is the sales head or branch manager. For marketing, the marketing head. For HR, the HR head or talent lead. 39 Ahmedabad listings (9.8%) include an email in the description, which is the highest share among these city reports, so check the text first.",
        "Send one piece of work made for that firm. A sales intern can send a list of ten prospects with a one-line reason each. A social media intern can send a week of posts. An HR intern can send a screening question sheet. Write three lines: who you are, what you attached, one question.",
        "Follow up once and stop. Studojo built Stu to take over the slow parts: it finds who hires, verifies their work email, writes a personal note and sends it from your own inbox once you start a campaign. It does not mass apply and does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **421 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. Only internships are counted, and a listing counts for Ahmedabad when it names Ahmedabad as a location.",
    "Pay: 19 of 421 internships (4.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 399 listings (94.8%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many internships are there in Ahmedabad?",
      "a": "We tracked 421 internship listings in Ahmedabad posted in October 2026, from 289 different employers. This counts listings, not hires."
    },
    {
      "q": "Is there a paid internship in Ahmedabad?",
      "a": "Yes, but few listings say so. 19 of 421 state a stipend in rupees, with a median of ₹12,500 a month. 9 say unpaid and the rest are silent, so ask."
    },
    {
      "q": "What is the stipend in Ahmedabad for interns?",
      "a": "Among the 19 that state one, 11 top out at ₹10,000 to 20,000 a month. The median is ₹12,500. The sample is small, so confirm the exact figure with the employer."
    },
    {
      "q": "What internships in Ahmedabad are there for students?",
      "a": "Marketing-executive (50 listings), business development (48) and HR (47) lead. Social media has 35 and graphic designer 12. Pick one group and tailor one piece of work to it."
    },
    {
      "q": "Where are Ahmedabad internships listed?",
      "a": "LinkedIn had 130 (30.9%), Internshala 120 (28.5%), company career sites and ATS pages 70 (16.6%), Naukri 64 (15.2%) and Shine 37 (8.8%). The same role can appear on more than one."
    },
    {
      "q": "Should you take an unpaid internship in Ahmedabad?",
      "a": "Only if the hours are fair and the work builds something you can show. 9 listings say unpaid and 11 mention a pre-placement offer. Ask what you will make and compare any figure with the ₹12,500 median."
    }
  ],
  "takeaway": {
    "sub": "What to remember about Ahmedabad internships",
    "items": [
      [
        "Pay is thin",
        "19 of 421 listings state a stipend, so ask for the number."
      ],
      [
        "Median is ₹12,500",
        "That is the middle of stated stipends, below the figure in the bigger cities."
      ],
      [
        "Three groups lead",
        "Marketing (50), business development (48) and HR (47) are almost level."
      ],
      [
        "Check the text for an email",
        "39 listings put one in the description, so read before you apply."
      ],
      [
        "Send one piece of work",
        "Email the team lead with something small you made, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-ahmedabad-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Ahmedabad 2026"
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
    "name": "Studojo Jobs Index, October 2026: Internships in Ahmedabad 2026",
    "description": "421 active entry-level and internship listings for India posted in October 2026 (Ahmedabad), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-internships-ahmedabad-2026" place="report-end" size="card" title={"Want to email who hires in Ahmedabad?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing is sent until you start a campaign."} />
    </DataReport>
  );
}
