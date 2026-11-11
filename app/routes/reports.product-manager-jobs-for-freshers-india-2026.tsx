import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "product-manager-jobs-for-freshers-india-2026",
  "title": "Associate Product Manager Jobs for Freshers in India 2026: Pay, Skills",
  "short": "Associate Product Manager Jobs 2026",
  "description": "Associate product manager jobs for freshers: 227 October listings in the Studojo Jobs Index, 26.4% internships, and only 7.2% of jobs stating pay.",
  "keywords": "associate product manager jobs for freshers, associate product manager fresher salary, associate product manager jobs in india 2026, how to get a associate product manager job as a fresher, associate product manager internship",
  "h1": "Associate Product Manager Jobs for Freshers in India:",
  "h1em": "What 227 Listings Show",
  "sub": "The Studojo Jobs Index holds 227 October listings for associate product manager and product analyst freshers. 60 are internships (26.4%), and only 12 of the 167 jobs state pay. 34.6% of descriptions mention SQL.",
  "published": "2026-11-11",
  "scope": "India · associate product manager · freshers and interns",
  "findings": [
    "**227 product listings** for freshers were posted in October 2026 by 154 employers. 64 use the exact title Associate Product Manager, and 60 listings are internships (26.4%).",
    "**Pay is rarely stated.** Only 12 of 167 jobs (7.2%) give a figure, with a median of ₹6 lakh a year, and only 1 of 60 internships states a stipend. Ask early, because the listing will not tell you.",
    "**Bengaluru has 57 listings (25.1%)** and Gurugram has 37 (16.3%). Gurugram ranks second here, but eighth for field sales.",
    "**SQL is the standout skill at 34.6%**, followed by Excel at 30.8%. 22.4% mention machine learning or generative AI, and 30.8% mention BTech, BE or computer science.",
    "**The move that works is a short email to the head of product or the product lead** with a one-page teardown. Stu can find that person and write the email, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "227",
      "label": "Associate product manager listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "7.2%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "34.6%",
      "label": "Of listings with a full description ask for SQL",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are associate product manager jobs for freshers called?",
      "sub": "Titles as employers wrote them, and how many are internships.",
      "paras": [
        "Associate product manager jobs for freshers are dominated by one title. Associate Product Manager appears in 64 of 227 listings (28.2%). Product Management Intern has 19 (8.4%), Product Analyst 15 (6.6%), Product Management Internship 9, Product Associate 9 and Product Analyst Intern 5. Product Manager, without associate, has only 4.",
        "Internships are a large part of the picture. 60 of the 227 listings (26.4%) are internships, against 167 jobs. That is a much higher internship share than the 10.8% across the whole index. For a fresher, a product internship is often the realistic first step, and many employers treat it as a hiring route.",
        "The titles near the top tell you where the work sits. Product Analyst is a data-heavy route into product, and an APM title for supply chain software, listed 4 times, shows that product roles sit in logistics as well as apps. 154 employers posted these listings, the ten biggest hold 19.8%, and 1.3% hide the employer name."
      ],
      "chart": {
        "id": "rpmjffi48Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=227)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          167,
          60
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
            "Associate Product Manager",
            "64"
          ],
          [
            "Product Management Intern",
            "19"
          ],
          [
            "Product Analyst",
            "15"
          ],
          [
            "Product Management Internship",
            "9"
          ],
          [
            "Product Associate",
            "9"
          ],
          [
            "Product Analyst Intern",
            "5"
          ],
          [
            "Product Manager",
            "4"
          ],
          [
            "Associate Product Manager - Supply Chain (Wms)",
            "4"
          ],
          [
            "Product Manager Intern",
            "3"
          ],
          [
            "Product Owner",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 154 different employers posted these listings, and 1.3% of listings do not name the employer."
      }
    },
    {
      "title": "Where are associate product manager jobs in India?",
      "sub": "Bengaluru leads, and Gurugram is a strong second.",
      "paras": [
        "Bengaluru has the most associate product manager listings with 57 (25.1%). Gurugram is second with 37 (16.3%), then Mumbai with 31 (13.7%) and Pune with 21 (9.3%). Delhi, Noida and Hyderabad have 14 each (6.2%). Chennai has 5 listings and Chandigarh 2.",
        "Product jobs follow the places where software companies and funded startups sit. Delhi, Noida and Gurugram together form a second hub next to Bengaluru, so anyone who can commute across the region has a wider pool than the Delhi count alone suggests. The sample is small, so a few postings move a city's rank.",
        "Remote is a little more visible here than across the index (5.3%). 16 listings (7.0%) are marked remote and 32 name no city. Hybrid is mentioned in 6.5% of descriptions and work from home in 4.7%, while work from office is stated in 2.8%. Product teams tend to offer more flexibility, which helps if you live outside the main hubs."
      ],
      "chart": {
        "id": "rpmjffi48Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=227)",
        "labels": [
          "Bengaluru",
          "Gurugram",
          "Mumbai",
          "Pune",
          "Delhi",
          "Noida",
          "Hyderabad",
          "Chennai",
          "Chandigarh",
          "Turbhe"
        ],
        "values": [
          57,
          37,
          31,
          21,
          14,
          14,
          14,
          5,
          2,
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
            "57",
            "25.1%"
          ],
          [
            "Gurugram",
            "37",
            "16.3%"
          ],
          [
            "Mumbai",
            "31",
            "13.7%"
          ],
          [
            "Pune",
            "21",
            "9.3%"
          ],
          [
            "Delhi",
            "14",
            "6.2%"
          ],
          [
            "Noida",
            "14",
            "6.2%"
          ],
          [
            "Hyderabad",
            "14",
            "6.2%"
          ],
          [
            "Chennai",
            "5",
            "2.2%"
          ],
          [
            "Chandigarh",
            "2",
            "0.9%"
          ],
          [
            "Turbhe",
            "1",
            "0.4%"
          ]
        ],
        "note": "A listing can name more than one city. 16 listings are marked remote and 32 name no city."
      }
    },
    {
      "title": "What is the associate product manager fresher salary in India?",
      "sub": "Only 12 jobs state pay, so treat every figure as a hint.",
      "paras": [
        "The associate product manager fresher salary is hard to read from listings, because only 12 of the 167 jobs (7.2%) state a figure in rupees. Among those 12, the median top-of-range figure is ₹6 lakh a year, and the middle half runs from ₹5 lakh to ₹11 lakh. A sample of 12 is small, so use it as a rough guide.",
        "The spread is wide. 7 listings fall in ₹5 to 8 lakh (58.3%), 1 in ₹3 to 5 lakh, 2 in ₹8 to 12 lakh and 2 at ₹20 lakh or more. Those top two are almost certainly experienced product roles caught by the title match, not fresher roles.",
        "For internships the data is thinner. Of 60 internship listings, 1 states a stipend, at ₹12,500 a month. 5 descriptions (2.3%) say unpaid. Since the listing will not tell you, ask in your first message what the role pays and whether the internship leads to a full-time offer. A role without an answer is a role to weigh carefully."
      ]
    },
    {
      "title": "What skills do associate product manager listings ask for?",
      "sub": "Share of the 214 listings with a full description that mention each term.",
      "paras": [
        "Communication skills lead at 62.1%, but the next tier is technical. SQL appears in 34.6% of descriptions and Excel in 30.8%. Machine learning or generative AI is named in 22.4%, and ChatGPT or AI tools in 19.2%. CRM tools appear in 10.3%, cloud in 7.9% and both Tableau and Figma in 7.5%.",
        "That mix describes a product role well: talk to people, read data, work with design and engineering. SQL is the clearest single skill to add, since it appears more than Excel and far more than Figma. A fresher who can pull a number from a table and explain what it means stands out from a pile of applicants.",
        "On conditions, 30.8% mention BTech, BE or computer science and 15.0% mention an MBA or PGDM. Freshers are welcome in 9.3%, and a portfolio in 7.0%, which is higher than in sales or teaching. Targets appear in only 3.3%. A portfolio line is a hint that employers want to see your work, not just a degree."
      ],
      "chart": {
        "id": "rpmjffi48Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (214 listings with a full description)",
        "labels": [
          "communication skills",
          "SQL",
          "Excel",
          "machine learning or generative AI",
          "ChatGPT or AI tools",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)",
          "cloud (AWS, Azure, GCP)",
          "Tableau",
          "Figma"
        ],
        "values": [
          62.1,
          34.6,
          30.8,
          22.4,
          19.2,
          12.1,
          10.3,
          7.9,
          7.5,
          7.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as an associate product manager fresher?",
      "sub": "A one-page teardown, sent to the person who owns the product.",
      "paras": [
        "Online applications are a weak route into product. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% per online application and about 242 applications per opening (citing Business Insider data). Email the head of product, the group product manager or the product lead for the team you want. At a small startup, write to the founder.",
        "Send one piece of real work: a one-page teardown of a product you use. Pick one flow, such as signing up or checking out. Name the metric you think matters, say where users probably drop off, and propose one change with a way to test it. If you can, add a small SQL query or a Figma sketch. That shows the skills the listings ask for.",
        "The email can be three lines: who you are, the one-page teardown, and a request for a short chat. Follow up once. Stu does the slow parts: it finds the product lead, verifies the work email, writes the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **227 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as associate product manager when its job title matches that role (the most common titles here: \"Associate Product Manager\", \"Product Management Intern\", \"Product Analyst\").",
    "Pay: 12 of 167 entry-level listings (7.2%) state a salary in rupees and 1 of 60 internships (1.7%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 214 listings (94.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are associate product manager jobs for freshers?",
      "a": "They are entry-level product roles where you help decide what a team builds, using data and talking to users. The Studojo Jobs Index tracked 227 such listings posted in October 2026, and 64 use the exact title Associate Product Manager."
    },
    {
      "q": "What is the associate product manager fresher salary?",
      "a": "Only 12 of 167 jobs (7.2%) state pay, with a median of ₹6 lakh a year, taking the top of each range. That is a small sample, so ask the employer directly."
    },
    {
      "q": "Is there an associate product manager internship?",
      "a": "Yes, many. 60 of the 227 listings (26.4%) are internships, and Product Management Intern is a title in 19. Only 1 states a stipend, at ₹12,500 a month."
    },
    {
      "q": "Which cities have the most associate product manager jobs?",
      "a": "Bengaluru has 57 listings, Gurugram 37 and Mumbai 31. Pune has 21. 16 listings are marked remote."
    },
    {
      "q": "Do you need a BTech to become an associate product manager?",
      "a": "Often it helps. 30.8% of descriptions mention BTech, BE or computer science and 15.0% mention an MBA or PGDM. SQL (34.6%) and Excel (30.8%) are the skills that appear most."
    },
    {
      "q": "How do you get an associate product manager job as a fresher?",
      "a": "Email the head of product or the product lead with a one-page teardown of a product you use. Keep it to three lines and follow up once. Stu can find the person and draft the email, and you send it from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to an associate product manager fresher.",
    "items": [
      [
        "Consider the internship route",
        "26.4% of listings are internships, a higher share than the whole index."
      ],
      [
        "Learn SQL first",
        "It appears in 34.6% of descriptions, ahead of Excel at 30.8%."
      ],
      [
        "Ask about pay",
        "Only 12 jobs state it, and the median is ₹6 lakh a year."
      ],
      [
        "Look at Gurugram",
        "It has 37 listings, second to Bengaluru's 57."
      ],
      [
        "Email the head of product",
        "Send a one-page teardown, then follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Associate Product Manager Jobs 2026",
    "description": "227 active entry-level and internship listings for India posted in October 2026 (associate product manager), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-product-manager-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the head of product instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
