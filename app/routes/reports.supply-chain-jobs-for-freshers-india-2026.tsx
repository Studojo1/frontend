import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "supply-chain-jobs-for-freshers-india-2026",
  "title": "Supply Chain and Logistics Jobs for Freshers in India 2026: Data",
  "short": "Supply Chain Jobs for Freshers 2026",
  "description": "Supply chain and logistics jobs for freshers in India: 1,503 October listings, negotiation in 33.5% of descriptions, median stated pay ₹3.2 lakh a year.",
  "keywords": "supply chain and logistics jobs for freshers, supply chain and logistics fresher salary, supply chain and logistics jobs in india 2026, how to get a supply chain and logistics job as a fresher, supply chain and logistics internship",
  "h1": "Supply Chain and Logistics Jobs for Freshers:",
  "h1em": "What 1,503 Listings Show",
  "sub": "Supply chain and logistics jobs for freshers are mostly purchase, procurement, inventory and warehouse roles: 1,503 October listings in the Studojo Jobs Index, 1,385 jobs and 118 internships. Negotiation is in 33.5% of descriptions.",
  "published": "2026-11-11",
  "scope": "India · supply chain and logistics · freshers and interns",
  "findings": [
    "**Supply chain and logistics jobs for freshers start with buying**: Purchase Executive (94) and Procurement Operations Associate (77) top 1,503 October listings.",
    "**Negotiation is a headline skill**: 33.5% of descriptions mention it, against 5.5% in operations listings, and SAP appears in 14.2%.",
    "**Internships are rare**: only 118 of 1,503 listings (7.9%) are internships, so this is a first-job field, and just 3 internships state a stipend.",
    "**Pay is stated for 24.0% of jobs**: 332 jobs, with a median top of range of ₹3.2 lakh a year and 52.1% in the ₹3 to 5 lakh band.",
    "**Email the procurement or warehouse head**: show one small piece of supplier or stock analysis. We built Stu to find that person and write the email from your own inbox."
  ],
  "stats": [
    {
      "num": "1,503",
      "label": "Supply chain and logistics listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.2 lakh",
      "label": "Median stated pay a year, from the 332 jobs that state it (24.0%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "36.2%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are supply chain and logistics jobs called, and who posts them?",
      "sub": "Procurement and purchase lead. Warehouse and logistics follow.",
      "paras": [
        "Supply chain and logistics jobs for freshers mostly start on the buying side. Purchase Executive has 94 listings, Procurement Operations Associate 77, Procurement Practice Associate 45 and Procurement Operations New Associate 29. Inventory Executive has 45, Warehouse Executive 35 and Logistics Executive 33.",
        "The title literally called Supply Chain Executive has only 25 listings and Supply Chain Operations Associate 27. If you search only on the phrase supply chain, you will miss most of the supply. Search purchase, procurement, inventory, warehouse and logistics too.",
        "877 different employers posted these listings, the top ten hold 23.7% of them, and 1.8% of listings do not name the employer. 1,385 are jobs and 118 are internships, which is an internship share of 7.9%."
      ],
      "chart": {
        "id": "rscjffi12Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=1,503)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          1385,
          118
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
            "Purchase Executive",
            "94"
          ],
          [
            "Procurement Operations Associate",
            "77"
          ],
          [
            "Procurement Practice Associate",
            "45"
          ],
          [
            "Inventory Executive",
            "45"
          ],
          [
            "Warehouse Executive",
            "35"
          ],
          [
            "Logistics Executive",
            "33"
          ],
          [
            "Procurement Operations New Associate",
            "29"
          ],
          [
            "Supply Chain Operations Associate",
            "27"
          ],
          [
            "Supply Chain Executive",
            "25"
          ],
          [
            "Procurement Practice New Associate",
            "22"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 877 different employers posted these listings, and 1.8% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have supply chain jobs for freshers?",
      "sub": "Bengaluru, Mumbai and Chennai lead, and Gurugram is fourth.",
      "paras": [
        "Bengaluru has 242 listings (16.1%) and Mumbai has 209 (13.9%). Chennai follows with 137 (9.1%), and Gurugram has 121 (8.1%), a higher share than in most role reports, which fits its warehouse and distribution corridor.",
        "Delhi has 89, Noida 86, Pune 77, Hyderabad 69 and Ahmedabad 51. Coimbatore makes the top ten with 32 (2.1%), which is notable for a mid-size city.",
        "Remote work barely exists here: 21 listings (1.4%) are marked remote, and 55 name no city. Stock, trucks and vendors sit in physical places, so plan to be where the work is."
      ],
      "chart": {
        "id": "rscjffi12Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=1,503)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Chennai",
          "Gurugram",
          "Delhi",
          "Noida",
          "Pune",
          "Hyderabad",
          "Ahmedabad",
          "Coimbatore"
        ],
        "values": [
          242,
          209,
          137,
          121,
          89,
          86,
          77,
          69,
          51,
          32
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
            "242",
            "16.1%"
          ],
          [
            "Mumbai",
            "209",
            "13.9%"
          ],
          [
            "Chennai",
            "137",
            "9.1%"
          ],
          [
            "Gurugram",
            "121",
            "8.1%"
          ],
          [
            "Delhi",
            "89",
            "5.9%"
          ],
          [
            "Noida",
            "86",
            "5.7%"
          ],
          [
            "Pune",
            "77",
            "5.1%"
          ],
          [
            "Hyderabad",
            "69",
            "4.6%"
          ],
          [
            "Ahmedabad",
            "51",
            "3.4%"
          ],
          [
            "Coimbatore",
            "32",
            "2.1%"
          ]
        ],
        "note": "A listing can name more than one city. 21 listings are marked remote and 55 name no city."
      }
    },
    {
      "title": "What is a supply chain fresher salary in India?",
      "sub": "Median stated top of range is ₹3.2 lakh a year, and 24.0% of jobs say.",
      "paras": [
        "332 of 1,385 jobs state pay in rupees. The median top of range is ₹3.2 lakh a year, with the middle half between ₹2.6 lakh and ₹4 lakh. The ₹3 to 5 lakh band has 173 jobs (52.1%), ₹2 to 3 lakh has 95 (28.6%) and under ₹2 lakh has 20 (6.0%).",
        "A thin tail goes higher: 31 jobs (9.3%) reach ₹5 to 8 lakh, 11 reach ₹12 to 20 lakh and 2 reach ₹20 lakh or more. Those few are probably not fresher roles in practice, so do not plan around them. 76.0% of jobs state no pay.",
        "Only 3 internships state a stipend, at a median of ₹15,000 a month. With so few figures, ask about it directly."
      ],
      "chart": {
        "id": "rscjffi12Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (332 jobs that state pay in rupees)",
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
          20,
          95,
          173,
          31,
          0,
          11,
          2
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do supply chain fresher jobs need?",
      "sub": "Communication, Excel, negotiation and SAP.",
      "paras": [
        "Of the 1,392 listings with a full description, 47.2% mention communication skills and 36.2% mention Excel. Negotiation is third at 33.5%, which is unusual and tells you the job is about dealing with suppliers. SAP comes next at 14.2%, then English at 12.4%, with cloud tools at only 2.4%.",
        "Smaller mentions still help you stand out: Tally in 3.8%, SQL in 2.9% and GST in 2.6%. SAP is the one to learn the basics of, because it is the system many procurement and inventory teams run on.",
        "On conditions, 15.0% mention night, rotational, US or UK shifts and 13.4% say freshers. 5.8% say any graduate, 4.6% name BTech or BE and 4.5% name BCom, so your degree matters less than it does in tech or finance."
      ],
      "chart": {
        "id": "rscjffi12Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,392 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "negotiation",
          "SAP",
          "English",
          "Hindi",
          "Tally",
          "SQL",
          "CRM tools (Salesforce, HubSpot or similar)",
          "GST"
        ],
        "values": [
          47.2,
          36.2,
          33.5,
          14.2,
          12.4,
          4.5,
          3.8,
          2.9,
          2.7,
          2.6
        ],
        "unit": "%"
      },
      "callout": "**Why it matters:** negotiation shows up in a third of descriptions. Bring an example of a price or deadline you negotiated."
    },
    {
      "title": "How do you get hired as a supply chain fresher?",
      "sub": "Show one real supplier or stock problem solved, to the person who owns it.",
      "paras": [
        "Applications are the crowded door. The Interview Guys (April 2026), citing Business Insider data, put the average opening at about 242 applications, so a polished form entry can sit unseen. A direct note to the person who needs the help is a smaller room.",
        "Email the procurement manager, the warehouse or inventory head, or the logistics manager for the team you want. Send one proof: a supplier comparison sheet in Excel for items you can price from public catalogues, or a simple reorder-point calculation for a made-up SKU list, with the logic shown. Real, small and specific beats a long CV.",
        "Three lines is plenty: your name and course, the one analysis you built, and a request for a short call. Follow up once and stop. Stu does the slow work: it finds the hiring manager with a verified work email, drafts the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **1,503 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as supply chain and logistics when its job title matches that role (the most common titles here: \"Purchase Executive\", \"Procurement Operations Associate\", \"Procurement Practice Associate\").",
    "Pay: 332 of 1,385 entry-level listings (24.0%) state a salary in rupees and 3 of 118 internships (2.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,392 listings (92.6%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many supply chain and logistics jobs for freshers are there?",
      "a": "The Studojo Jobs Index holds 1,503 October 2026 listings: 1,385 jobs and 118 internships, from 877 employers. That is the set of listings we track, and listings are not hires."
    },
    {
      "q": "What is the supply chain fresher salary in India?",
      "a": "Among 332 jobs that state pay, the median top of range is ₹3.2 lakh a year, with the middle half between ₹2.6 lakh and ₹4 lakh. 24.0% of jobs state pay."
    },
    {
      "q": "Is there a supply chain and logistics internship for freshers?",
      "a": "A few. 118 listings (7.9%) are internships, and only 3 state a stipend, at a median of ₹15,000 a month. Most of the field is full-time entry-level jobs."
    },
    {
      "q": "Which skills matter for supply chain jobs in India 2026?",
      "a": "Communication (47.2%), Excel (36.2%) and negotiation (33.5%) lead. SAP is in 14.2% of descriptions and cloud tools in 2.4%."
    },
    {
      "q": "Do I need a degree in supply chain to get hired?",
      "a": "Not always. 5.8% of descriptions say any graduate, while 4.6% name BTech or BE, 4.5% BCom and 3.2% MBA or PGDM."
    },
    {
      "q": "Where are supply chain jobs for freshers located?",
      "a": "Bengaluru has 242 listings (16.1%), Mumbai 209 (13.9%), Chennai 137 (9.1%) and Gurugram 121 (8.1%). Only 21 listings are marked remote."
    }
  ],
  "takeaway": {
    "sub": "What to do with this data.",
    "items": [
      [
        "Search more than one title",
        "Purchase, procurement, inventory and warehouse titles outnumber the phrase supply chain."
      ],
      [
        "Practise negotiation stories",
        "33.5% of descriptions mention negotiation, so have one real example ready."
      ],
      [
        "Learn SAP basics",
        "14.2% of descriptions name SAP."
      ],
      [
        "Plan to be on site",
        "Only 1.4% of listings are marked remote."
      ],
      [
        "Email the procurement lead",
        "One short note with one analysis, and one follow-up."
      ]
    ]
  },
  "related": [
    {
      "slug": "operations-executive-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Operations Executive Jobs 2026"
    },
    {
      "slug": "process-associate-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Process Associate Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Supply Chain Jobs for Freshers 2026",
    "description": "1,503 active entry-level and internship listings for India posted in October 2026 (supply chain and logistics), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-supply-chain-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the procurement head directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the person who is hiring, with a verified work email, and nothing is sent until you start a campaign."} />
    </DataReport>
  );
}
