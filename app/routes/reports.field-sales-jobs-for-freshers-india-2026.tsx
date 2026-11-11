import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "field-sales-jobs-for-freshers-india-2026",
  "title": "Field Sales Jobs for Freshers in India 2026: Pay, Skills, Cities",
  "short": "Field Sales Jobs for Freshers 2026",
  "description": "Field sales jobs for freshers: 5,137 October listings in the Studojo Jobs Index, with stated pay, targets, cities and how to reach the sales head.",
  "keywords": "field sales jobs for freshers, field sales fresher salary, field sales jobs in india 2026, how to get a field sales job as a fresher, field sales internship",
  "h1": "Field Sales Jobs for Freshers in India:",
  "h1em": "What 5,137 Listings Show",
  "sub": "The Studojo Jobs Index holds 5,137 October listings for field sales freshers. Of the 2,195 that state pay, the median is ₹3.6 lakh a year, and 68.2% of descriptions mention targets. Most listings sit in Mumbai, Bengaluru and Delhi.",
  "published": "2026-11-11",
  "scope": "India · field sales · freshers and interns",
  "findings": [
    "**5,137 field sales listings** for freshers and interns were posted in October 2026, from 2,872 different employers. Only 130 of them are internships.",
    "**Pay is stated in 43.8% of listings.** Among the 2,195 that do, the median top-of-range figure is ₹3.6 lakh a year, and 56.7% fall between ₹3 and 5 lakh.",
    "**Targets are the defining term.** 68.2% of full descriptions mention targets and 23.2% mention incentives, so expect part of your income to move with sales.",
    "**Communication skills appear in 71.9% of listings**, negotiation in 35.4% and CRM tools in 26.4%. A two-wheeler or driving licence shows up in 11.0%.",
    "**The move that works is a short email to the sales head or area manager**, with one piece of proof. Stu can find that person and write the email, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "5,137",
      "label": "Field sales listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.6 lakh",
      "label": "Median stated pay a year, from the 2,195 jobs that state it (43.8%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "35.4%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are field sales jobs for freshers called, and who posts them?",
      "sub": "Titles exactly as employers wrote them in October 2026.",
      "paras": [
        "Field sales jobs for freshers are mostly called plain \"Sales Executive\". That title alone covers 1,071 of the 5,137 listings (20.8%), and \"Field Sales Executive\" adds another 566 (11.0%). The word field is often missing, so a search for field sales alone misses a large part of the work.",
        "Below the top two sit \"Sales Officer\" (211), \"Real Estate Sales Executive\" (106), \"Corporate Sales Executive\" (104), \"Insurance Sales Executive\" (92) and \"Presales Executive\" (71). Each hides a different job. Real estate means site visits, insurance means policy leads, presales means calls before a field visit.",
        "Employers are spread out. 2,872 different employers posted these listings, the ten biggest posters hold only 10.7% of them, and 0.9% hide the employer name. That is a wide base, which suits cold emailing: there is rarely one gatekeeper for the whole segment."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Sales Executive",
            "1,071"
          ],
          [
            "Field Sales Executive",
            "566"
          ],
          [
            "Sales Officer",
            "211"
          ],
          [
            "Real Estate Sales Executive",
            "106"
          ],
          [
            "Corporate Sales Executive",
            "104"
          ],
          [
            "Insurance Sales Executive",
            "92"
          ],
          [
            "Presales Executive",
            "71"
          ],
          [
            "Field Sales Internship",
            "54"
          ],
          [
            "Field Sales Officer",
            "54"
          ],
          [
            "Field Sales Associate",
            "52"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 2,872 different employers posted these listings, and 0.9% of listings do not name the employer."
      },
      "callout": "**Search tip:** try Sales Executive, Sales Officer and Field Sales Associate together. Searching only the exact phrase field sales hides most of the 5,137 listings."
    },
    {
      "title": "Where are field sales jobs in India?",
      "sub": "Mumbai leads, but the top ten cities are close together.",
      "paras": [
        "Mumbai has the most field sales listings with 629 (12.2%), followed by Bengaluru with 519 (10.1%) and Delhi with 431 (8.4%). Chennai (331), Hyderabad (315), Noida (313), Pune (299) and Gurugram (292) form a tight second group. Kolkata closes the top ten with 132.",
        "Delhi, Noida and Gurugram sit in one commuting region, so together they offer more than the Delhi line suggests. If you can travel across them, your real pool is larger than any single city count. A listing can name more than one city, so treat these as counts, not shares that add up to a whole.",
        "Remote field sales is rare, as you would expect for a job done on the ground. Only 117 listings (2.3%) carry a remote flag, and 193 do not name a city at all. The job is local: plan around the place you can actually travel in every day."
      ],
      "chart": {
        "id": "rfsjffi40Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=5,137)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Delhi",
          "Chennai",
          "Hyderabad",
          "Noida",
          "Pune",
          "Gurugram",
          "Ahmedabad",
          "Kolkata"
        ],
        "values": [
          629,
          519,
          431,
          331,
          315,
          313,
          299,
          292,
          227,
          132
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
            "629",
            "12.2%"
          ],
          [
            "Bengaluru",
            "519",
            "10.1%"
          ],
          [
            "Delhi",
            "431",
            "8.4%"
          ],
          [
            "Chennai",
            "331",
            "6.4%"
          ],
          [
            "Hyderabad",
            "315",
            "6.1%"
          ],
          [
            "Noida",
            "313",
            "6.1%"
          ],
          [
            "Pune",
            "299",
            "5.8%"
          ],
          [
            "Gurugram",
            "292",
            "5.7%"
          ],
          [
            "Ahmedabad",
            "227",
            "4.4%"
          ],
          [
            "Kolkata",
            "132",
            "2.6%"
          ]
        ],
        "note": "A listing can name more than one city. 117 listings are marked remote and 193 name no city."
      }
    },
    {
      "title": "What is the field sales fresher salary in India?",
      "sub": "Only 43.8% of listings state pay, so read these figures as a guide.",
      "paras": [
        "The field sales fresher salary the listings state is a median of ₹3.6 lakh a year, measured at the top of each stated range. The middle half runs from ₹3 lakh to ₹4.8 lakh. That is the figure from 2,195 listings that state pay in rupees, which is 43.8% of the jobs. The rest say nothing.",
        "The biggest band is ₹3 to 5 lakh with 1,244 listings (56.7%). Another 346 (15.8%) sit at ₹2 to 3 lakh, and 84 (3.8%) are under ₹2 lakh. At the top, 418 listings (19.0%) reach ₹5 to 8 lakh, and 79 (3.6%) go to ₹8 to 12 lakh.",
        "Because we use the top of each range, the number tells you the ceiling an employer writes down, not your take-home. Many ranges include incentives. Ask in your first conversation what the fixed part is and what depends on targets. Internship stipends are almost never stated: only 2 of 130 internships give a figure."
      ],
      "chart": {
        "id": "rfsjffi40Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (2,195 jobs that state pay in rupees)",
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
          84,
          346,
          1244,
          418,
          79,
          22,
          2
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills and conditions do field sales listings ask for?",
      "sub": "Share of the 4,985 listings with a full description that mention each term.",
      "paras": [
        "Communication skills lead the skills list at 71.9% of descriptions. Negotiation follows at 35.4%, CRM tools such as Salesforce or HubSpot at 26.4%, English at 19.1% and calling or telecalling at 18.8%. Excel appears in 9.4% and Hindi in 9.0%. Technical skills barely register: cloud is 1.2% and SEO is 0.7%.",
        "Conditions matter more than skills here. Targets appear in 68.2% of descriptions and incentives in 23.2%. A two-wheeler or driving licence is named in 11.0%, which is about one listing in nine. Work from office is stated in 8.2%, and PF, ESI or health insurance in 7.7%.",
        "On entry bar, 29.2% say freshers are welcome and 9.1% accept 12th pass. Another 6.7% ask for any graduate, while only 3.5% want an MBA or PGDM. For most of these roles, how you speak and how you handle a no counts for more than your degree."
      ],
      "chart": {
        "id": "rfsjffi40Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (4,985 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "incentives",
          "a two-wheeler or driving licence",
          "work from office",
          "PF, ESI or health insurance",
          "a portfolio",
          "immediate joining",
          "a certificate",
          "work from home"
        ],
        "values": [
          68.2,
          29.2,
          23.2,
          11.0,
          8.2,
          7.7,
          3.8,
          2.8,
          1.8,
          1.4
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a field sales fresher?",
      "sub": "Skip the pile of applications. Reach the person who owns the territory.",
      "paras": [
        "Online applications are a weak bet. One April 2026 Interview Guys article puts the typical success rate at roughly 0.1% to 2% per application and cites Business Insider data that an average opening draws about 242 applications. Field sales teams hire to fill territories, so the person who owns that territory decides. Email the sales head, area sales manager or branch manager for your city.",
        "Send one small piece of real work. A one-page plan for the first 30 days in their territory works: five areas you would visit, the type of customer in each, and how you would open the conversation. If you have sold anything before, even college fest sponsorships or tuition, add one line with the result.",
        "Keep the email to three lines: who you are, the one plan you attached, and a request for a short call. Follow up once after a few days. Stu does the slow parts: it finds the person who hires, verifies the work email, drafts the note from your real work, and sends it from your own inbox only after you start a campaign. Stu does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **5,137 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as field sales when its job title matches that role (the most common titles here: \"Sales Executive\", \"Field Sales Executive\", \"Sales Officer\").",
    "Pay: 2,195 of 5,007 entry-level listings (43.8%) state a salary in rupees and 2 of 130 internships (1.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 4,985 listings (97.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Shine, Naukri, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are field sales jobs for freshers?",
      "a": "They are entry-level sales roles where you meet customers, dealers or leads outside the office. In October 2026 the Studojo Jobs Index tracked 5,137 such listings. Most are titled Sales Executive (1,071) or Field Sales Executive (566)."
    },
    {
      "q": "What is the field sales fresher salary in India?",
      "a": "Among 2,195 listings that state pay, the median top-of-range figure is ₹3.6 lakh a year. The middle half runs from ₹3 lakh to ₹4.8 lakh. Only 43.8% of listings state pay, and incentives may form part of it."
    },
    {
      "q": "Do field sales jobs for freshers need a degree?",
      "a": "Often not a specific one. 29.2% of descriptions welcome freshers, 9.1% accept 12th pass and 6.7% ask for any graduate. Only 3.5% require an MBA or PGDM, and 3.4% ask for BTech, BE or computer science."
    },
    {
      "q": "Which cities have the most field sales jobs in India?",
      "a": "Mumbai has 629 listings, Bengaluru 519 and Delhi 431. Chennai, Hyderabad, Noida, Pune and Gurugram each have roughly 290 to 330. Only 117 listings are marked remote."
    },
    {
      "q": "Is there a field sales internship?",
      "a": "Yes, but few. 130 of the 5,137 listings (2.5%) are internships, and \"Field Sales Internship\" is a title in 54 of them. Only 2 internships state a stipend, so ask before you accept."
    },
    {
      "q": "How do you get a field sales job as a fresher without applying online?",
      "a": "Email the sales head or area manager for your city with a one-page 30-day territory plan. Keep it to three lines and follow up once. Stu finds the person and drafts the email, and you send it from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a field sales fresher.",
    "items": [
      [
        "Search every title",
        "Sales Executive alone is 20.8% of listings. Do not search only for field sales."
      ],
      [
        "Know the pay shape",
        "Median stated pay is ₹3.6 lakh a year, but only 43.8% state it. Ask about the fixed part."
      ],
      [
        "Expect targets",
        "68.2% of descriptions mention them, so prepare an answer about handling a missed month."
      ],
      [
        "Check the travel",
        "11.0% ask for a two-wheeler or driving licence. Know your daily range."
      ],
      [
        "Email the territory owner",
        "Send the sales head a 30-day plan, then follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Field Sales Jobs for Freshers 2026",
    "description": "5,137 active entry-level and internship listings for India posted in October 2026 (field sales), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-field-sales-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the sales head instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
