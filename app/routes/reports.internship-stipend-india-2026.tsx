import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internship-stipend-india-2026",
  "title": "Internship Stipend in India 2026: What 385 Listings Actually Pay",
  "short": "Internship Stipend in India 2026",
  "description": "Internship stipend in India: the median stated top of range is ₹15,000 a month, but only 385 of 18,458 October internship listings state a stipend.",
  "keywords": "internship stipend in india, average internship stipend, stipend per month internship, paid internship stipend india",
  "h1": "Internship Stipend in India:",
  "h1em": "What 385 Listings Show",
  "sub": "The median internship stipend in India is ₹15,000 a month, going by the top of the stated range in the Studojo Jobs Index for October 2026. But only 385 of 18,458 internship listings (2.1%) state a stipend in rupees, so most do not tell you.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "**The internship stipend in India** has a median top of range of ₹15,000 a month across the 385 listings that state one, out of 18,458 internship listings in the Studojo Jobs Index.",
    "**Almost nobody says**: only 2.1% of internship listings state a stipend in rupees, so you will usually have to ask.",
    "**The middle of the range is ₹10,000 to ₹20,000**: 180 listings (46.8%) sit there, 98 (25.5%) reach ₹20,000 to ₹40,000 and only 21 (5.5%) reach ₹40,000 or more.",
    "**Roles pay differently**: stated HR internships have a median of ₹14,583 a month, digital marketing ₹16,667 and social media ₹12,000, and 5.6% of described listings say unpaid.",
    "**The move that works** is to email the team lead you would work under and ask about the stipend directly. Stu finds that person and writes the email for you."
  ],
  "stats": [
    {
      "num": "18,458",
      "label": "Entry-level and internship listings in India, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹15,000",
      "label": "Median stated stipend a month, from the 385 internships that state one",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "24.1%",
      "label": "Of listings with a full description ask for social media",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What is the average internship stipend in India?",
      "sub": "Stipend by role, top of the stated range, per month.",
      "paras": [
        "The typical internship stipend in India is about ₹15,000 a month, as the median of the top of each stated range across 385 listings. We use the median because a few very high stipends would pull an average up, and it is the fairer picture of what a middle internship offers.",
        "By role, the table shows how small the differences are. Marketing executive and digital marketing both have a median of ₹16,667, business development ₹15,000, HR ₹14,583, and social media and SEO ₹12,000. HR has the largest sample, with 84 listings stating a stipend.",
        "These are stated figures only. Small groups, under ten listings, are left out of the table. Treat every number as the top of a range, so what you are offered may be lower, and the role you choose moves it by a few thousand rupees, not a multiple."
      ],
      "chart": {
        "id": "risi288Stipend",
        "kind": "bar",
        "label": "Stated stipend, top of range, per month (385 internships that state pay in rupees)",
        "labels": [
          "under ₹5,000",
          "₹5,000 to 10,000",
          "₹10,000 to 20,000",
          "₹20,000 to 40,000",
          "₹40,000 or more"
        ],
        "values": [
          16,
          70,
          180,
          98,
          21
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "Role group",
          "Internships stating a stipend",
          "Median, per month"
        ],
        "rows": [
          [
            "HR",
            "84",
            "₹14,583"
          ],
          [
            "marketing (general)",
            "26",
            "₹16,667"
          ],
          [
            "digital marketing",
            "19",
            "₹16,667"
          ],
          [
            "social media",
            "19",
            "₹12,000"
          ],
          [
            "business development",
            "16",
            "₹15,000"
          ],
          [
            "SEO",
            "11",
            "₹12,000"
          ]
        ],
        "note": "Top of each stated stipend range, per month, rupees only. Small groups (under 10) left out."
      },
      "callout": "**Lead:** 46.8% of stated stipends top out between ₹10,000 and ₹20,000 a month."
    },
    {
      "title": "How many internships state a stipend, and which roles are they?",
      "sub": "Role groups and the titles employers write.",
      "paras": [
        "Of 18,458 internship listings, 385 state a stipend in rupees, which is 2.1%. The other 97.9% do not state one in rupees. That is the biggest finding in this report: silence is the norm.",
        "The largest role groups tell you where the volume is. Marketing executive has 2,103 listings (11.4%), HR 1,594 (8.6%), business development 1,294 (7.0%) and social media 1,165 (6.3%). Digital marketing has 710, content writer 484 and video editor 427.",
        "Titles are specific. Business Development (Sales) Internship has 596 listings, Human Resources (HR) Internship 296 and Digital Marketing Internship 262. Content And Social Media Marketing Internship has 251. Loan Advisor Trainee has 168, which is a sales role under an internship-style name."
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
            "2,103",
            "11.4%"
          ],
          [
            "HR",
            "1,594",
            "8.6%"
          ],
          [
            "business development",
            "1,294",
            "7.0%"
          ],
          [
            "social media",
            "1,165",
            "6.3%"
          ],
          [
            "digital marketing",
            "710",
            "3.8%"
          ],
          [
            "content writer",
            "484",
            "2.6%"
          ],
          [
            "video editor",
            "427",
            "2.3%"
          ],
          [
            "graphic designer",
            "412",
            "2.2%"
          ],
          [
            "operations executive",
            "410",
            "2.2%"
          ],
          [
            "data analyst",
            "369",
            "2.0%"
          ],
          [
            "full stack developer",
            "307",
            "1.7%"
          ],
          [
            "front-end developer",
            "283",
            "1.5%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "Where are paid internships in India, and can you do one from home?",
      "sub": "Top cities for internship listings.",
      "paras": [
        "Mumbai has 2,122 internship listings (11.5%) and Bengaluru 2,090 (11.3%), the two biggest cities. Delhi has 1,393 (7.5%), Noida 1,031, Pune 966, Gurugram 942, Hyderabad 933 and Chennai 658. The top two are close, and then the field drops.",
        "4,208 internship listings (22.8%) are marked remote, and 4,774 name no city at all. A listing can also name more than one city, so the city counts do not add up to the total.",
        "For you, that means a strong case for remote searches. If you live in a smaller city, a remote internship from a Mumbai or Bengaluru team is possible. Still, the stipend is rarely stated, so ask whether remote interns are paid the same as those on site."
      ],
      "chart": {
        "id": "risi288Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=18,458)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Delhi",
          "Noida",
          "Pune",
          "Gurugram",
          "Hyderabad",
          "Chennai",
          "Ahmedabad",
          "Jaipur"
        ],
        "values": [
          2122,
          2090,
          1393,
          1031,
          966,
          942,
          933,
          658,
          421,
          344
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
            "2,122",
            "11.5%"
          ],
          [
            "Bengaluru",
            "2,090",
            "11.3%"
          ],
          [
            "Delhi",
            "1,393",
            "7.5%"
          ],
          [
            "Noida",
            "1,031",
            "5.6%"
          ],
          [
            "Pune",
            "966",
            "5.2%"
          ],
          [
            "Gurugram",
            "942",
            "5.1%"
          ],
          [
            "Hyderabad",
            "933",
            "5.1%"
          ],
          [
            "Chennai",
            "658",
            "3.6%"
          ],
          [
            "Ahmedabad",
            "421",
            "2.3%"
          ],
          [
            "Jaipur",
            "344",
            "1.9%"
          ]
        ],
        "note": "A listing can name more than one city. 4,208 listings are marked remote and 4,774 name no city."
      }
    },
    {
      "title": "Are internships in India unpaid, and what do they ask for?",
      "sub": "Terms and skills named in 17,573 listings with a full description.",
      "paras": [
        "Unpaid is named in 5.6% of described listings, so most do not use the word. But a certificate is named in 41.3%, far above any other term, which tells you many internships offer a certificate as the headline reward. Freshers are welcome in 23.4%.",
        "Work from home appears in 15.1%, incentives in 11.9%, a portfolio in 11.9% and targets in 11.1%. 19.3% mention women candidates, and 15.3% mention BTech or computer science. A pre-placement offer is named in 2.6%, so a job after the internship is the exception.",
        "On skills, communication leads at 57.1%, then social media at 24.1%, English at 23.5% and Excel at 23.0%. Python is 8.9%, Canva 8.2%, SEO 7.5% and ChatGPT or AI tools 6.8%. Pick two of these, build one small thing, and link it in your email."
      ],
      "chart": {
        "id": "risi288Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (17,573 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "work from home",
          "incentives",
          "a portfolio",
          "targets",
          "unpaid",
          "GitHub",
          "work from office",
          "hybrid"
        ],
        "values": [
          41.3,
          23.4,
          15.1,
          11.9,
          11.9,
          11.1,
          5.6,
          4.0,
          4.0,
          3.5
        ],
        "unit": "%"
      },
      "callout": "**Read the fine print:** 41.3% mention a certificate, and 5.6% say unpaid."
    },
    {
      "title": "How do you get a paid internship in India?",
      "sub": "Ask the team lead, and ask about the stipend.",
      "paras": [
        "LinkedIn carries 34.3% of internship listings and Internshala 32.2%, so the crowd is large. An average opening draws about 242 applications (Business Insider data cited by The Interview Guys, April 2026). Email the team lead, the marketing head, or the founder at a startup. They can say yes and name a stipend.",
        "Send one small piece of work that fits the role: a content calendar, a cleaned spreadsheet, a short landing page copy. Your email says who you are, what you attached, how many hours you can give, and asks what the stipend is. Follow up once, then try the next company.",
        "Only 6.7% of descriptions print an email address. Stu finds the person who hires, verifies their work email, writes a short note from your real work, and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **18,458 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. Only internships are counted.",
    "Pay: 385 of 18,458 internships (2.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 17,573 listings (95.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What is the average internship stipend in India?",
      "a": "The median stated stipend is ₹15,000 a month, measured as the top of the stated range across 385 listings in the Studojo Jobs Index for October 2026. Only 2.1% of internship listings state one, so treat it as a guide."
    },
    {
      "q": "What is the stipend per month for an internship in India?",
      "a": "Most stated stipends sit between ₹10,000 and ₹20,000 a month, which is 46.8% of the 385. Another 25.5% reach ₹20,000 to ₹40,000, and 5.5% reach ₹40,000 or more."
    },
    {
      "q": "How many internships in India are paid?",
      "a": "We cannot say that from listings. Only 385 of 18,458 internship listings (2.1%) state a stipend in rupees, and 5.6% of described listings say unpaid. Many others simply do not mention pay."
    },
    {
      "q": "Which internship role has the highest stipend?",
      "a": "Among roles with enough stated stipends, marketing executive and digital marketing both have a median of ₹16,667 a month. Business development is ₹15,000, HR ₹14,583, and social media and SEO ₹12,000."
    },
    {
      "q": "Is a paid internship stipend in India different by city?",
      "a": "We did not break stipend down by city, because the samples are small. Mumbai (2,122) and Bengaluru (2,090) have the most internship listings, and 22.8% of all listings are marked remote."
    },
    {
      "q": "Should I take an unpaid internship in India?",
      "a": "That is your call, but ask first. 5.6% of described listings say unpaid, and 41.3% mention a certificate. Ask about the stipend, hours and whether there is a pre-placement offer (named in 2.6%) before you say yes."
    }
  ],
  "takeaway": {
    "sub": "Five points before you accept an internship.",
    "items": [
      [
        "Expect about ₹15,000",
        "That is the median stated top of range, per month."
      ],
      [
        "Always ask",
        "97.9% of internship listings do not state a stipend in rupees."
      ],
      [
        "Role changes it a little",
        "Stated medians run from ₹12,000 for social media to ₹16,667 for digital marketing."
      ],
      [
        "Watch for the certificate",
        "41.3% mention one, and 5.6% say unpaid."
      ],
      [
        "Email the team lead",
        "Send a small piece of work and ask about the stipend."
      ]
    ]
  },
  "related": [
    {
      "slug": "pay-transparency-fresher-jobs-india-2026",
      "kicker": "Data",
      "title": "Fresher Jobs That Show Salary in India 2026"
    },
    {
      "slug": "fresher-jobs-list-india-2026",
      "kicker": "Data",
      "title": "Fresher Jobs List India 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Internship Stipend in India 2026",
    "description": "18,458 active entry-level and internship listings for India posted in October 2026 (internship stipends in India), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-internship-stipend-india-2026" place="report-end" size="card" title={"Want to ask the team lead about the stipend?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email, and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
