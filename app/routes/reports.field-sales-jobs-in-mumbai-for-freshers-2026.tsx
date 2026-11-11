import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "field-sales-jobs-in-mumbai-for-freshers-2026",
  "title": "Field Sales Jobs in Mumbai for Freshers: 629 Listings and Pay in 2026",
  "short": "Field Sales Jobs in Mumbai for Freshers 2026",
  "description": "Field sales jobs in Mumbai for freshers: 629 October listings, 66.3% mention targets, and the median stated top of range is 3.5 lakh a year.",
  "keywords": "field sales jobs in mumbai for freshers, fresher field sales jobs mumbai, field sales salary in mumbai for freshers, field sales internship in mumbai",
  "h1": "Field Sales Jobs in Mumbai for Freshers:",
  "h1em": "What 629 Listings Show",
  "sub": "We found 629 field sales listings in Mumbai in the Studojo Jobs Index for October 2026. 37.8% of the jobs state pay, with a median top of range of 3.5 lakh a year, and 66.3% of described listings mention targets.",
  "published": "2026-11-11",
  "scope": "field sales in Mumbai · freshers",
  "findings": [
    "**Field sales jobs in Mumbai for freshers** make up 629 October listings in the Studojo Jobs Index, from 424 different employers.",
    "**Pay is stated on 231 jobs** (37.8%), with a median top of range of 3.5 lakh a year, and 146 of them (63.2%) fall in the 3 to 5 lakh band.",
    "**Targets define the job**: 66.3% of listings with a full description mention targets, 14.5% mention incentives, and 5.4% ask for a two-wheeler or driving licence.",
    "**Plain Sales Executive leads**: 123 listings use that title, ahead of Field Sales Executive at 47, and many specialise in insurance, real estate or loans.",
    "**The move that works** is to email the area sales manager or the regional sales head with a small territory plan. Stu finds that person and writes the email."
  ],
  "stats": [
    {
      "num": "629",
      "label": "Field sales in Mumbai listings, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 231 jobs that state it (37.8%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "36.4%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What field sales jobs are open to freshers in Mumbai?",
      "sub": "A general title, then product-specific ones.",
      "paras": [
        "Field sales jobs in Mumbai for freshers are mostly listed as plain Sales Executive, with 123 listings. Field Sales Executive follows with 47 and Corporate Sales Executive with 25. Search the generic title as well, because many field roles never use the word field.",
        "Product-specific titles fill the next rows. Insurance Sales Executive has 22 listings, Real Estate Sales Executive 13 and Home Loan Sales Executive 11. Sales Officer has 16, Customer Service / Sales Executive 12, and the internship titles Field Sales Internship and Field Sales Associate have 9 each.",
        "The 629 listings come from 424 employers, and the top ten hold just 18.3%, so no one employer dominates. Only 0.8% hide the employer. Of the total, 611 are jobs and 18 are internships, so entry-level jobs are the main route."
      ],
      "chart": {
        "id": "rfsjimf81Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=629)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          611,
          18
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
            "Sales Executive",
            "123"
          ],
          [
            "Field Sales Executive",
            "47"
          ],
          [
            "Corporate Sales Executive",
            "25"
          ],
          [
            "Insurance Sales Executive",
            "22"
          ],
          [
            "Sales Officer",
            "16"
          ],
          [
            "Real Estate Sales Executive",
            "13"
          ],
          [
            "Customer Service / Sales Executive",
            "12"
          ],
          [
            "Home Loan Sales Executive",
            "11"
          ],
          [
            "Field Sales Internship",
            "9"
          ],
          [
            "Field Sales Associate",
            "9"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 424 different employers posted these listings, and 0.8% of listings do not name the employer."
      }
    },
    {
      "title": "What is the field sales salary in Mumbai for freshers?",
      "sub": "Stated pay, top of range, per year.",
      "paras": [
        "The median top of range for a Mumbai field sales job is 3.5 lakh a year, from the 231 jobs that state pay. The lower quarter is 3 lakh and the upper quarter 4.8 lakh, which makes a fairly tight spread.",
        "The 3 to 5 lakh band holds 146 listings (63.2%). Then 5 to 8 lakh has 46 (19.9%), 2 to 3 lakh has 23 (10.0%) and 8 to 12 lakh has 9 (3.9%). Only 7 sit under 2 lakh. For most freshers, the realistic zone is 3 to 5 lakh.",
        "Remember the caveats. 62.2% of jobs state no pay, and field sales pay is usually part fixed, part incentive. We count the top of each range, so base pay can be lower. No internship in this slice states a stipend in rupees."
      ],
      "chart": {
        "id": "rfsjimf81Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (231 jobs that state pay in rupees)",
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
          23,
          146,
          46,
          9,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** nearly two in three stated salaries (63.2%) are in the 3 to 5 lakh band."
    },
    {
      "title": "What skills do Mumbai field sales jobs ask for?",
      "sub": "Skills named in 612 listings with a full description.",
      "paras": [
        "Communication skills lead at 73.5% of the 612 described listings, and negotiation follows at 36.4%. In field sales you meet people in person, so the way you open a conversation and handle a no counts more than a certificate.",
        "CRM tools appear in 28.8% and calling or telecalling in 24.7%, because field reps also book visits by phone. English is named in 20.1%, Excel in 11.3% and Hindi in 9.3%. Excel is useful for tracking your own visits and conversions.",
        "That suggests a practical preparation plan. Practise a two-minute pitch for a product you know, learn one CRM basics tutorial, and keep a simple visit log in a spreadsheet. You can show those three things in an email, which most applicants cannot."
      ],
      "chart": {
        "id": "rfsjimf81Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (612 listings with a full description)",
        "labels": [
          "communication skills",
          "negotiation",
          "CRM tools (Salesforce, HubSpot or similar)",
          "calling or telecalling",
          "English",
          "Excel",
          "Hindi",
          "social media",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          73.5,
          36.4,
          28.8,
          24.7,
          20.1,
          11.3,
          9.3,
          2.3,
          1.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Mumbai field sales jobs need a two-wheeler, and what are the targets?",
      "sub": "What the descriptions say about conditions.",
      "paras": [
        "Targets are named in 66.3% of described listings and incentives in 14.5%. A two-wheeler or driving licence is named in 5.4%, which matters in a city where territory can mean long distances. Ask whether travel costs are reimbursed.",
        "Entry bars are modest. 28.9% say freshers are welcome, 10.9% accept 12th pass, 7.2% say any graduate and 3.1% name an MBA or PGDM. Work from office appears in 9.8%, PF, ESI or health insurance in 7.0%, and 3.6% mention women candidates.",
        "Field sales listings are spread across the week, with Friday at 19.4%, Saturday at 16.7% and Sunday at 1.9%. Shine carries 37.7% of the slice, Naukri 22.9%, company career sites 17.0% and Internshala 14.1%, so look beyond one site."
      ],
      "chart": {
        "id": "rfsjimf81Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (612 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "work from office",
          "PF, ESI or health insurance",
          "a two-wheeler or driving licence",
          "a portfolio",
          "immediate joining",
          "a certificate",
          "work from home"
        ],
        "values": [
          66.3,
          28.9,
          14.5,
          9.8,
          7.0,
          5.4,
          3.3,
          2.5,
          2.3,
          2.1
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** 66.3% mention targets. Ask for the first-quarter target and how travel is paid."
    },
    {
      "title": "How do you get hired in field sales as a fresher in Mumbai?",
      "sub": "Show a territory plan to the person who owns the number.",
      "paras": [
        "Email the area sales manager, the regional sales head or the branch manager. They own the targets and feel every empty territory. At a smaller firm, write to the sales head or the owner. Pick the product you could actually sell, such as loans, insurance or property.",
        "Proof is a one-page territory plan: three areas you would cover, the kind of customer in each, and how many visits a day you could manage. Keep it plain. Your email says who you are, the product, and the plan attached. Follow up once, a few days later.",
        "Only 6.2% of descriptions include an email address, so the hiring manager is usually unnamed. Stu finds the person who hires, verifies their work email, writes a short note from your real work, and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **629 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as field sales when its job title matches that role (the most common titles here: \"Sales Executive\", \"Field Sales Executive\", \"Corporate Sales Executive\"). It counts for the city when it names Mumbai as a location.",
    "Pay: 231 of 611 entry-level listings (37.8%) state a salary in rupees and 0 of 18 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 612 listings (97.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Shine, Naukri, Internshala, LinkedIn) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many field sales jobs for freshers are there in Mumbai?",
      "a": "The Studojo Jobs Index has 629 field sales listings in Mumbai posted in October 2026. Of those, 611 are entry-level jobs and 18 are internships. Listings are not hires."
    },
    {
      "q": "What is the field sales salary in Mumbai for freshers?",
      "a": "Among the 231 jobs that state pay, the median top of range is 3.5 lakh a year, with a middle band of 3 to 4.8 lakh. Incentives are common, so ask how much of the pay is fixed."
    },
    {
      "q": "Is there a field sales internship in Mumbai?",
      "a": "A few. 18 of the 629 listings (2.9%) are internships, including Field Sales Internship with 9 listings. None state a stipend in rupees, so ask before you start."
    },
    {
      "q": "Do field sales jobs in Mumbai need a bike or licence?",
      "a": "Some do. 5.4% of described listings name a two-wheeler or driving licence. Ask whether travel is reimbursed and how large the territory is."
    },
    {
      "q": "Can a 12th pass candidate get a field sales job in Mumbai?",
      "a": "Yes, in some listings. 10.9% of described listings accept 12th pass and 7.2% say any graduate. Communication and negotiation (36.4%) matter more than the degree."
    },
    {
      "q": "Where are Mumbai field sales jobs listed?",
      "a": "Shine carries 37.7% of them, Naukri 22.9%, company career sites and ATS pages 17.0%, Internshala 14.1% and LinkedIn 8.3%. This only shows where the listings were found."
    }
  ],
  "takeaway": {
    "sub": "Five points for field sales freshers in Mumbai.",
    "items": [
      [
        "Search the generic title",
        "Sales Executive has 123 listings, more than Field Sales Executive at 47."
      ],
      [
        "Expect 3 to 5 lakh",
        "63.2% of stated pay falls in that band, but 62.2% of jobs state no pay."
      ],
      [
        "Plan for targets",
        "66.3% of described listings mention targets."
      ],
      [
        "Practise the pitch",
        "Communication is named in 73.5% and negotiation in 36.4%."
      ],
      [
        "Email the area manager",
        "Attach a one-page territory plan."
      ]
    ]
  },
  "related": [
    {
      "slug": "field-sales-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Field Sales Jobs for Freshers 2026"
    },
    {
      "slug": "jobs-for-freshers-in-mumbai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Mumbai 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Field Sales Jobs in Mumbai for Freshers 2026",
    "description": "629 active entry-level and internship listings for India posted in October 2026 (field sales in Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-field-sales-jobs-in-mumbai-for-freshers-2026" place="report-end" size="card" title={"Want to email the sales manager who is hiring?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who hires, verifies their work email, and writes a short personal note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
