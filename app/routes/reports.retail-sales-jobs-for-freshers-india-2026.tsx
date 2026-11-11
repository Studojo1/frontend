import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "retail-sales-jobs-for-freshers-india-2026",
  "title": "Retail Sales Jobs for Freshers in India 2026: Pay, Cities, Terms",
  "short": "Retail Sales Jobs for Freshers 2026",
  "description": "Retail sales jobs for freshers: 2,633 October listings in the Studojo Jobs Index, a median stated pay of ₹3 lakh a year, and who to email in store.",
  "keywords": "retail sales jobs for freshers, retail sales fresher salary, retail sales jobs in india 2026, how to get a retail sales job as a fresher, retail sales internship",
  "h1": "Retail Sales Jobs for Freshers in India:",
  "h1em": "What 2,633 Listings Show",
  "sub": "We track 2,633 October listings for retail sales freshers. Only 26.2% state pay, and the median among them is ₹3 lakh a year. The biggest titles are Sales Associate and Showroom Sales Staff, and 12th pass is accepted in 11.3% of descriptions.",
  "published": "2026-11-11",
  "scope": "India · retail sales · freshers and interns",
  "findings": [
    "**2,633 retail sales listings** were posted in October 2026, including 236 internships (9.0%). The single title Sales Associate accounts for 494 of them.",
    "**Pay is stated in only 26.2% of listings.** The median among the 628 that state it is ₹3 lakh a year, and 37.6% sit in the ₹2 to 3 lakh band.",
    "**A few big employers dominate.** The ten biggest posters hold 39.7% of listings, so one hiring cycle can move the whole category.",
    "**The bar is low on paper.** 11.3% accept 12th pass and 7.7% ask for any graduate, but 50.6% want communication skills and 45.3% mention targets.",
    "**Email the store manager or the regional retail head** with one piece of proof. Stu finds that person and writes the note from your real work, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "2,633",
      "label": "Retail sales listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 628 jobs that state it (26.2%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "10.5%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are retail sales jobs for freshers called, and when are they posted?",
      "sub": "Titles as employers wrote them, and the day of the week listings went up.",
      "paras": [
        "Retail sales jobs for freshers are most often called Sales Associate. That title appears in 494 of the 2,633 listings (18.8%). Showroom Sales Staff follows with 208 (7.9%), then Retail Sales Executive (72), Cashier (60) and Retail Sales Associate (53). Store Executive adds another 50.",
        "Some titles cross into other work. Field Sales Associate shows up 52 times, and one bank-linked internship title appears 52 times too. Retail banking and showroom jobs share the shop-floor name but not the day: one is a branch desk, the other is a car or appliance floor.",
        "Posting is lumpy. Friday carries 910 listings (34.6%), against 263 on Monday (10.0%) and 96 on Sunday. That fits a category where a few employers post in batches: 1,094 employers posted these listings, and the top ten alone hold 39.7%. Only 1.8% hide the employer name."
      ],
      "chart": {
        "id": "rrsjffi41Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=2,633)",
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
          263,
          266,
          333,
          379,
          910,
          386,
          96
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
            "Sales Associate",
            "494"
          ],
          [
            "Showroom Sales Staff",
            "208"
          ],
          [
            "Retail Sales Executive",
            "72"
          ],
          [
            "Cashier",
            "60"
          ],
          [
            "Retail Sales Associate",
            "53"
          ],
          [
            "Field Sales Associate",
            "52"
          ],
          [
            "Retail Bank Sales Executive Bl Internship",
            "52"
          ],
          [
            "Store Executive",
            "50"
          ],
          [
            "Corporate Sales Associate",
            "42"
          ],
          [
            "Relationship Manager - Retail Sales",
            "40"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 1,094 different employers posted these listings, and 1.8% of listings do not name the employer."
      }
    },
    {
      "title": "Where are retail sales jobs in India?",
      "sub": "Bengaluru and Mumbai lead, with Delhi third.",
      "paras": [
        "Bengaluru has the most retail sales listings with 263 (10.0%), just ahead of Mumbai with 234 (8.9%). Delhi has 169 (6.4%), Hyderabad 140 (5.3%), then Chennai (104), Pune (103), Ahmedabad (97), Gurugram (93) and Noida (88). Kolkata closes the top ten with 55.",
        "That order differs from field sales, where Mumbai leads, and it makes sense for shop floors: malls, showrooms and branches follow where people spend. A listing can name more than one city, so use the counts to compare places, not to add up a national total.",
        "Remote is not part of this job. 48 listings (1.8%) carry a remote flag and 147 name no city. Pick a city where you can reach the store, since many employers hire for a specific outlet and the store manager often hears about candidates before any central team does."
      ],
      "chart": {
        "id": "rrsjffi41Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=2,633)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Delhi",
          "Hyderabad",
          "Chennai",
          "Pune",
          "Ahmedabad",
          "Gurugram",
          "Noida",
          "Kolkata"
        ],
        "values": [
          263,
          234,
          169,
          140,
          104,
          103,
          97,
          93,
          88,
          55
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
            "263",
            "10.0%"
          ],
          [
            "Mumbai",
            "234",
            "8.9%"
          ],
          [
            "Delhi",
            "169",
            "6.4%"
          ],
          [
            "Hyderabad",
            "140",
            "5.3%"
          ],
          [
            "Chennai",
            "104",
            "3.9%"
          ],
          [
            "Pune",
            "103",
            "3.9%"
          ],
          [
            "Ahmedabad",
            "97",
            "3.7%"
          ],
          [
            "Gurugram",
            "93",
            "3.5%"
          ],
          [
            "Noida",
            "88",
            "3.3%"
          ],
          [
            "Kolkata",
            "55",
            "2.1%"
          ]
        ],
        "note": "A listing can name more than one city. 48 listings are marked remote and 147 name no city."
      }
    },
    {
      "title": "What is the retail sales fresher salary in India?",
      "sub": "Only 26.2% of listings state pay in rupees.",
      "paras": [
        "The retail sales fresher salary the listings state has a median of ₹3 lakh a year, taking the top of each range. The middle half runs from ₹2.5 lakh to ₹4 lakh. We can read this from 628 listings, which is 26.2% of the jobs. About three in four say nothing about pay.",
        "The bands are close together. 236 listings (37.6%) fall in ₹2 to 3 lakh and 230 (36.6%) in ₹3 to 5 lakh. Another 59 (9.4%) are under ₹2 lakh, 77 (12.3%) reach ₹5 to 8 lakh and 19 (3.0%) go up to ₹8 to 12 lakh. The jump above ₹5 lakh is rare and usually comes with sales targets.",
        "Internships are even less open. Of 236 internship listings, only 1 states a stipend, at ₹20,000 a month. If a retail internship does not say what it pays, ask before your first day, and ask whether it leads to a full-time role."
      ],
      "chart": {
        "id": "rrsjffi41Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (628 jobs that state pay in rupees)",
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
          59,
          236,
          230,
          77,
          19,
          4,
          3
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do retail sales listings ask for from freshers?",
      "sub": "Share of the 2,433 listings with a full description that mention each term.",
      "paras": [
        "Communication skills appear in 50.6% of descriptions, far ahead of everything else. English follows at 14.5%, negotiation at 10.5%, CRM tools at 9.8% and calling at 8.1%. Excel is mentioned in 6.2%, Hindi in 5.4% and Tally in 1.3%. This is a talk-to-people job, not a software one.",
        "Conditions show the shape of the work. Targets appear in 45.3% of descriptions, incentives in 11.9% and work from office in 4.5%. Night, rotational, US or UK shifts show up in 2.9%, so some listings are really service desks that happen to say sales.",
        "The entry bar is welcoming. 23.2% mention freshers, 11.3% accept 12th pass, 7.7% ask for any graduate and 6.5% mention a portfolio. Only 2.2% want an MBA or PGDM. A two-wheeler or driving licence is named in 1.4%, which makes retail the lower-travel cousin of field sales."
      ],
      "chart": {
        "id": "rrsjffi41Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (2,433 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "negotiation",
          "CRM tools (Salesforce, HubSpot or similar)",
          "calling or telecalling",
          "Excel",
          "Hindi",
          "social media",
          "Tally",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          50.6,
          14.5,
          10.5,
          9.8,
          8.1,
          6.2,
          5.4,
          1.5,
          1.3,
          0.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a retail sales fresher?",
      "sub": "Reach the person who runs the floor, not the portal.",
      "paras": [
        "Applying through portals is a long shot. An April 2026 Interview Guys article cites a typical success rate of roughly 0.1% to 2% per online application, and an average of about 242 applications per opening (citing Business Insider data). For a store, the person who chooses is the store manager, the area manager or the regional retail head. Write to them.",
        "Your proof should be small and local. Visit the store, note three things you saw: what customers asked, one product that sat unnoticed, one way the display could help a sale. Put that in five lines. If you have sold before, even at a family shop or a college stall, add what you sold and to whom.",
        "The email can be three lines: who you are, the five-line store note, and a request for ten minutes. Follow up once. Since the ten biggest employers hold 39.7% of listings, check whether a chain has a regional head for your city, and write to that person as well. Stu finds the right person, verifies the work email and sends your note from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **2,633 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as retail sales when its job title matches that role (the most common titles here: \"Sales Associate\", \"Showroom Sales Staff\", \"Retail Sales Executive\").",
    "Pay: 628 of 2,397 entry-level listings (26.2%) state a salary in rupees and 1 of 236 internships (0.4%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 2,433 listings (92.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are retail sales jobs for freshers?",
      "a": "They are entry-level jobs selling in a store, showroom or branch. The Studojo Jobs Index tracked 2,633 such listings posted in October 2026. Sales Associate is the most common title, with 494 listings."
    },
    {
      "q": "What is the retail sales fresher salary?",
      "a": "The median stated pay is ₹3 lakh a year, taking the top of each range. It comes from 628 listings, only 26.2% of the total, so many employers do not say. The middle half runs from ₹2.5 lakh to ₹4 lakh."
    },
    {
      "q": "Can a 12th pass student get a retail sales job?",
      "a": "Yes, in many cases. 11.3% of descriptions accept 12th pass and 23.2% mention freshers. Another 7.7% ask for any graduate. Check each description, because the bar changes by employer."
    },
    {
      "q": "Which city has the most retail sales jobs in India?",
      "a": "Bengaluru has the most with 263 listings (10.0%), then Mumbai with 234 and Delhi with 169. Only 48 listings are marked remote, so plan around a city you can reach daily."
    },
    {
      "q": "Is there a retail sales internship for freshers?",
      "a": "Yes. 236 of the 2,633 listings (9.0%) are internships. Only 1 states a stipend, so ask what it pays and whether it can become a full-time role."
    },
    {
      "q": "How do you get a retail sales job as a fresher?",
      "a": "Write to the store manager, area manager or regional retail head with a short note about what you saw in their store. Keep it to three lines and follow up once. Stu can find the person and draft the email from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a retail sales fresher.",
    "items": [
      [
        "Start with Sales Associate",
        "It is 18.8% of listings. Add Showroom Sales Staff and Store Executive to your search."
      ],
      [
        "Pick a city you can reach",
        "Only 1.8% are remote. Bengaluru and Mumbai lead the counts."
      ],
      [
        "Ask about pay early",
        "Only 26.2% state it, and the median is ₹3 lakh a year."
      ],
      [
        "Be ready for targets",
        "45.3% mention them, so have a short answer about handling a slow week."
      ],
      [
        "Write to the store manager",
        "Bring a five-line note from a store visit, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "business-development-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Business Development Jobs for Freshers 2026"
    },
    {
      "slug": "telecaller-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Telecaller Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Retail Sales Jobs for Freshers 2026",
    "description": "2,633 active entry-level and internship listings for India posted in October 2026 (retail sales), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-retail-sales-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the store manager instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
