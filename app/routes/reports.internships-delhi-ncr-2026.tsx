import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "internships-delhi-ncr-2026",
  "title": "Internships in Delhi NCR 2026: Pay, Roles and 3,208 Listings",
  "short": "Internships in Delhi NCR 2026",
  "description": "Internships in Delhi NCR: 3,208 October listings, only 102 state a stipend (median ₹15,000 a month). See roles, skills and how to judge an unpaid offer.",
  "keywords": "internships in delhi ncr, paid internship in delhi ncr, internship in delhi ncr for students, stipend in delhi ncr, how to get an internship in delhi ncr",
  "h1": "Internships in Delhi NCR:",
  "h1em": "3,208 Listings, Few With Pay",
  "sub": "We tracked 3,208 internship listings across Delhi, Noida, Gurugram, Ghaziabad and Faridabad, posted in October 2026. Only 102 state a stipend in rupees, with a median of ₹15,000 a month. For everything else, ask before you accept.",
  "published": "2026-11-11",
  "scope": "Delhi NCR · internships",
  "findings": [
    "Internships in Delhi NCR run to **3,208 October listings** in the Studojo Jobs Index, from 2,181 different employers.",
    "**Only 102 listings (3.2%) state a stipend in rupees.** The median of the top of those ranges is ₹15,000 a month, and 57 of the 102 sit between ₹10,000 and 20,000.",
    "**Delhi, Noida and Gurugram carry the volume.** Delhi names 1,393 listings, Noida 1,031 and Gurugram 942, and a listing can name more than one city.",
    "**124 listings (4.1%) say unpaid, and 1,276 (41.8%) mention a certificate.** That is a lot of listings offering a certificate and little else on pay.",
    "**The move that works is a short email to the person who runs the team.** Stu finds that person, verifies the work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "3,208",
      "label": "Internships listed in Delhi NCR, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹15,000",
      "label": "Median stated stipend a month, from the 102 internships that state one",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "31.0%",
      "label": "Of listings with a full description ask for social media",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What internships are there in Delhi NCR?",
      "sub": "Role groups across the region",
      "paras": [
        "Internships in Delhi NCR are mostly marketing, HR and sales. Marketing-executive is the biggest group at 461 listings (14.4% of the region). HR follows with 329 (10.3%), social media with 289 (9.0%) and business development with 262 (8.2%).",
        "Below that sits a creative and content layer: digital marketing has 139 listings, content writer 121, graphic designer 107 and video editor 88. Customer service has 82, operations executive 81, SEO 56 and accountant 44. If you want a commerce or analytics internship, the table shows it is a thinner pool than marketing.",
        "These groups come from matching the job title, so a title can count twice and plain titles like associate or trainee count nowhere. Use the table to see where the weight is, and remember that the NCR figure bundles five cities: Delhi, Noida, Gurugram, Ghaziabad and Faridabad. Delhi names 1,393 listings, Noida 1,031 and Gurugram 942."
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
            "461",
            "14.4%"
          ],
          [
            "HR",
            "329",
            "10.3%"
          ],
          [
            "social media",
            "289",
            "9.0%"
          ],
          [
            "business development",
            "262",
            "8.2%"
          ],
          [
            "digital marketing",
            "139",
            "4.3%"
          ],
          [
            "content writer",
            "121",
            "3.8%"
          ],
          [
            "graphic designer",
            "107",
            "3.3%"
          ],
          [
            "video editor",
            "88",
            "2.7%"
          ],
          [
            "customer service",
            "82",
            "2.6%"
          ],
          [
            "operations executive",
            "81",
            "2.5%"
          ],
          [
            "SEO",
            "56",
            "1.7%"
          ],
          [
            "accountant",
            "44",
            "1.4%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Lead:** Gurugram and Noida listings are close to Delhi in volume. Search all three before you decide the commute rules anything out."
    },
    {
      "title": "What are the job titles and when do listings go up?",
      "sub": "Top titles and posting days",
      "paras": [
        "Business Development (Sales) Internship is the top title with 117 listings, nearly double the next. Human Resources (HR) Internship has 63, Digital Marketing Internship 61 and Content And Social Media Marketing Internship 61. Business Development Intern has 61 and Human Resources Intern 60, which shows how the same job gets two spellings.",
        "Ownership is spread out: 2,181 different employers posted these listings, the ten biggest employers hold 4.9% of them, and 3.1% do not name the employer. That is a wide field, so no single company's hiring defines internships in Delhi NCR.",
        "Thursday is the busiest posting day with 658 listings (20.5%), then Wednesday with 642 (20.0%) and Monday with 539 (16.8%). Saturday has 302 (9.4%) and Sunday 64 (2.0%). Listings were found on LinkedIn (1,162), Internshala (1,129), Naukri (340) and company career sites and ATS pages (355)."
      ],
      "chart": {
        "id": "ridn270Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=3,208)",
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
          539,
          479,
          642,
          658,
          524,
          302,
          64
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
            "117"
          ],
          [
            "Human Resources (HR) Internship",
            "63"
          ],
          [
            "Digital Marketing Internship",
            "61"
          ],
          [
            "Content And Social Media Marketing Internship",
            "61"
          ],
          [
            "Business Development Intern",
            "61"
          ],
          [
            "Human Resources Intern",
            "60"
          ],
          [
            "Social Media Marketing Internship",
            "51"
          ],
          [
            "Graphic Design Internship",
            "43"
          ],
          [
            "Social Media Marketing Intern",
            "41"
          ],
          [
            "Digital Marketing Intern",
            "40"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 2,181 different employers posted these listings, and 3.1% of listings do not name the employer."
      }
    },
    {
      "title": "Is there a paid internship in Delhi NCR?",
      "sub": "102 of 3,208 listings state a stipend",
      "paras": [
        "Yes, there are paid ones, but few say so. Of 3,208 listings, 102 state a stipend in rupees, which is 3.2%. The median of the top of those ranges is ₹15,000 a month. Everything else gives you no number, so a blank is not the same as unpaid.",
        "The spread among the 102 is tight. 57 top out at ₹10,000 to 20,000 a month, 24 at ₹20,000 to 40,000, 17 at ₹5,000 to 10,000 and 4 at ₹40,000 or more. None is under ₹5,000. If an offer in Delhi NCR is well below the middle band and has long hours, that is worth a question.",
        "Compare that with the wording of the listings. 124 use the word unpaid (4.1%) and 122 mention a pre-placement offer (4.0%). Three mention a registration, training or deposit fee, and four a bond. Read those listings carefully: we think you should not pay to get an internship."
      ],
      "chart": {
        "id": "ridn270Stipend",
        "kind": "bar",
        "label": "Stated stipend, top of range, per month (102 internships that state pay in rupees)",
        "labels": [
          "under ₹5,000",
          "₹5,000 to 10,000",
          "₹10,000 to 20,000",
          "₹20,000 to 40,000",
          "₹40,000 or more"
        ],
        "values": [
          0,
          17,
          57,
          24,
          4
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** Ask three things in writing: the monthly stipend, the hours per week, and what happens at the end. Compare the answer with the ₹15,000 median."
    },
    {
      "title": "What skills do Delhi NCR internship listings ask for?",
      "sub": "Share of 3,054 listings with a full description",
      "paras": [
        "Communication skills lead at 65.6% of the 3,054 Delhi NCR listings that carry a full description. Social media is next at 31.0%, Excel at 26.1% and English at 25.9%. These four cover most of what a first internship asks of you.",
        "The tool-level mentions are small: CRM tools 10.9%, Canva 10.7%, Adobe tools 9.6% and SEO 9.3%. Calling or telecalling is in 7.1% and negotiation in 7.0%. Notice that a portfolio is asked for in 11.7% of listings, so proof of work matters more than a long tool list.",
        "Terms matter too. 653 listings (21.4%) say freshers are welcome and 602 (19.7%) say women candidates. Targets are in 431 (14.1%) and incentives in 331 (10.8%). Work from office appears in 190 listings (6.2%), hybrid in 159 (5.2%) and work from home in 152 (5.0%)."
      ],
      "chart": {
        "id": "ridn270Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (3,054 listings with a full description)",
        "labels": [
          "communication skills",
          "social media",
          "Excel",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Canva",
          "Adobe tools (Photoshop, Illustrator)",
          "SEO",
          "calling or telecalling",
          "negotiation"
        ],
        "values": [
          65.6,
          31.0,
          26.1,
          25.9,
          10.9,
          10.7,
          9.6,
          9.3,
          7.1,
          7.0
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get an internship in Delhi NCR?",
      "sub": "Who to email and what to send",
      "paras": [
        "Email the head of the team, not the careers inbox. For marketing, write to the marketing head or the brand lead. For HR, the HR head. For sales, the regional or branch sales manager. 269 Delhi NCR listings (8.8%) put an email in the description, and when they do, use it, but also write to the manager.",
        "Attach one small piece of work made for that company: a three-post content plan, a short sourcing sheet for one role, a redesigned banner, or a cold-call script for a product you looked at. Then write three short lines: who you are, what you made, and one question. Send it in the morning, since Wednesday to Friday are when most listings go up.",
        "Follow up once and then leave it. Studojo built Stu to do the slow parts: it finds who hires, verifies their work email, writes a note on why you fit from your own work and sends it from your inbox when you start a campaign. It does not mass apply and does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **3,208 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. Only internships are counted, and a listing counts for Delhi NCR when it names Delhi or Noida or Gurugram or Ghaziabad or Faridabad as a location.",
    "Pay: 102 of 3,208 internships (3.2%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 3,054 listings (95.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many internships are there in Delhi NCR?",
      "a": "We tracked 3,208 internship listings in Delhi, Noida, Gurugram, Ghaziabad and Faridabad posted in October 2026. They come from 2,181 different employers. This counts listings, not hires."
    },
    {
      "q": "Is there a paid internship in Delhi NCR?",
      "a": "Yes. 102 of the 3,208 listings state a stipend in rupees, with a median of ₹15,000 a month. 124 listings say unpaid, and the rest do not say, so ask for the figure."
    },
    {
      "q": "What is the stipend in Delhi NCR for interns?",
      "a": "Of the 102 listings that state one, 57 top out at ₹10,000 to 20,000 a month and 24 at ₹20,000 to 40,000. The median is ₹15,000 a month. Figures are the top of a range."
    },
    {
      "q": "What internships in Delhi NCR are good for students?",
      "a": "Marketing-executive (461 listings), HR (329) and social media (289) are the biggest groups. Business development has 262 and digital marketing 139. Pick the group where you can show one piece of real work."
    },
    {
      "q": "Which part of Delhi NCR has the most internships?",
      "a": "Delhi names 1,393 listings, Noida 1,031 and Gurugram 942. Ghaziabad has 120 and Faridabad 61. A listing can name more than one city, so the figures overlap."
    },
    {
      "q": "How do you judge an unpaid internship offer?",
      "a": "Ask for the monthly figure, weekly hours, your manager and a written outcome such as a pre-placement offer. 122 listings mention one, and 124 say unpaid. Compare with the ₹15,000 median and walk away from anything asking you to pay a fee."
    }
  ],
  "takeaway": {
    "sub": "What to remember about Delhi NCR internships",
    "items": [
      [
        "Pay is not stated",
        "102 of 3,208 listings give a stipend. Ask for the figure."
      ],
      [
        "Know the median",
        "₹15,000 a month is the median among listings that state pay."
      ],
      [
        "Certificates are common",
        "1,276 listings mention a certificate, but a certificate is not a stipend."
      ],
      [
        "Search three cities",
        "Delhi (1,393), Noida (1,031) and Gurugram (942) all carry real volume."
      ],
      [
        "Email the team lead",
        "Send one piece of work to the person who runs the team, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-delhi-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Delhi 2026"
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
    "name": "Studojo Jobs Index, October 2026: Internships in Delhi NCR 2026",
    "description": "3,208 active entry-level and internship listings for India posted in October 2026 (Delhi NCR), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-internships-delhi-ncr-2026" place="report-end" size="card" title={"Want to email who hires in Delhi NCR?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and drafts a personal note. Nothing is sent until you start a campaign."} />
    </DataReport>
  );
}
