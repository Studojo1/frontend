import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-any-graduate-freshers-2026",
  "title": "Jobs for Any Graduate Freshers 2026: 6,150 Listings Reviewed",
  "short": "Jobs for Any Graduate Freshers 2026",
  "description": "Jobs for any graduate freshers: 6,150 October listings say any graduate, and 2,651 state pay with a median of 3.5 lakh a year. Roles, cities and skills.",
  "keywords": "jobs for any graduate freshers, jobs for any graduate freshers 2026, best jobs for any graduate, salary for any graduate",
  "h1": "Jobs for Any Graduate Freshers:",
  "h1em": "What 6,150 Listings Say",
  "sub": "We tracked 6,150 listings in October 2026 that say any graduate in the description. 2,651 state pay in rupees, with a median of 3.5 lakh a year, and the middle half runs from 3 lakh to 4.5 lakh. Most are customer service and sales roles.",
  "published": "2026-11-11",
  "scope": "India · any graduate",
  "findings": [
    "Jobs for any graduate freshers appear in **6,150 October listings** in the Studojo Jobs Index, from 2,720 different employers.",
    "**Customer service is the biggest role group by far.** It has 1,295 listings (21.1%), then HR with 418 (6.8%), business development with 388 (6.3%) and relationship manager with 337 (5.5%).",
    "**Almost half state their pay.** 2,651 jobs (45.0%) give a rupee figure, a far higher share than the 28.4% across the whole index, and the median is 3.5 lakh a year.",
    "**Freshers and targets go together.** 2,869 listings (46.7%) mention freshers, while 2,291 (37.3%) mention targets and 1,012 (16.5%) mention night, rotational, US or UK shifts.",
    "**The move that works is to email the person who runs the team.** Stu finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "6,150",
      "label": "October listings that mention any graduate",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 2,651 jobs that state it (45.0%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "24.2%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What jobs can any graduate freshers apply for?",
      "sub": "Titles and the terms listings use",
      "paras": [
        "The slice is every listing whose description says any graduate. Of the 6,150, 5,897 are entry-level jobs and only 253 are internships (4.1%), so this is a full-time pool. The most common title is Customer Support Executive with 117 listings, then Customer Service Executive with 89, Sales Executive with 56 and Business Development Executive with 53.",
        "Banking titles show up too: Associate Manager-Acquisition (Current Account) has 53 listings and Relationship Manager has 45. Senior Business Development Officer has 43, Field Sales Executive 37, Customer Service Assistant 31 and Sales Officer 30. The ten biggest employers hold 18.6% of listings, which is more concentrated than most reports, though 2,720 different employers still posted.",
        "Read the terms before you apply. 46.7% of listings mention freshers, 37.3% mention targets, 18.2% incentives and 16.5% night, rotational, US or UK shifts. Work from office is in 13.3%, immediate joining in 12.1% and PF, ESI or health insurance in 9.2%."
      ],
      "chart": {
        "id": "rjfagf285Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (6,150 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "incentives",
          "night, rotational, US or UK shifts",
          "work from office",
          "immediate joining",
          "PF, ESI or health insurance",
          "a portfolio",
          "cab or transport",
          "a two-wheeler or driving licence"
        ],
        "values": [
          46.7,
          37.3,
          18.2,
          16.5,
          13.3,
          12.1,
          9.2,
          5.7,
          5.6,
          4.6
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Customer Support Executive",
            "117"
          ],
          [
            "Customer Service Executive",
            "89"
          ],
          [
            "Sales Executive",
            "56"
          ],
          [
            "Associate Manager-Acquisition (Current Account)",
            "53"
          ],
          [
            "Business Development Executive",
            "53"
          ],
          [
            "Relationship Manager",
            "45"
          ],
          [
            "Senior Business Development Officer",
            "43"
          ],
          [
            "Field Sales Executive",
            "37"
          ],
          [
            "Customer Service Assistant",
            "31"
          ],
          [
            "Sales Officer",
            "30"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 2,720 different employers posted these listings, and 0.0% of listings do not name the employer."
      },
      "callout": "**Lead:** Any graduate usually means any degree is acceptable, not that the job is easy. Check targets and shifts before you accept."
    },
    {
      "title": "Which role groups hire any graduate?",
      "sub": "Role groups and what they ask for",
      "paras": [
        "Customer service dominates with 1,295 listings (21.1%). HR follows with 418 (6.8%), business development with 388 (6.3%), relationship manager with 337 (5.5%), field sales with 336 (5.5%) and telecaller with 326 (5.3%). Retail sales has 187 (3.0%).",
        "Smaller groups are process associate (111), operations executive (100), marketing-executive (93), supply chain and logistics (81) and technical support (68). If you want an analytics or engineering job, this slice is the wrong pool, because employers who open the door to any degree mostly want people for talking and selling.",
        "The skills match. Communication skills appear in 75.3% of listings and English in 36.6%. Excel is in 24.2%, calling or telecalling in 21.5%, CRM tools in 13.9%, negotiation in 13.6% and Hindi in 13.0%. Social media is only in 4.5% and cloud in 1.7%. Spoken clarity and a working Excel sheet cover most of it."
      ],
      "chart": {
        "id": "rjfagf285Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (6,150 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "Hindi",
          "social media",
          "cloud (AWS, Azure, GCP)",
          "SAP"
        ],
        "values": [
          75.3,
          36.6,
          24.2,
          21.5,
          13.9,
          13.6,
          13.0,
          4.5,
          1.7,
          1.6
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "customer service",
            "1,295",
            "21.1%"
          ],
          [
            "HR",
            "418",
            "6.8%"
          ],
          [
            "business development",
            "388",
            "6.3%"
          ],
          [
            "relationship manager",
            "337",
            "5.5%"
          ],
          [
            "field sales",
            "336",
            "5.5%"
          ],
          [
            "telecaller",
            "326",
            "5.3%"
          ],
          [
            "retail sales",
            "187",
            "3.0%"
          ],
          [
            "process associate",
            "111",
            "1.8%"
          ],
          [
            "operations executive",
            "100",
            "1.6%"
          ],
          [
            "marketing (general)",
            "93",
            "1.5%"
          ],
          [
            "supply chain and logistics",
            "81",
            "1.3%"
          ],
          [
            "technical support",
            "68",
            "1.1%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "Where are the jobs for any graduate in India?",
      "sub": "Top cities in the slice",
      "paras": [
        "Bengaluru leads with 830 listings (13.5%), followed by Chennai with 674 (11.0%) and Mumbai with 672 (10.9%). Hyderabad has 553 (9.0%), Pune 467 (7.6%), Gurugram 319, Delhi 300 and Noida 291. Ahmedabad has 257 (4.2%) and Coimbatore 130 (2.1%).",
        "Chennai ranks second here, ahead of Mumbai, while across the whole index Mumbai and Bengaluru are first and second. Coimbatore makes the top ten, which is a sign that any graduate roles are spread beyond the metros. A listing can name more than one city: 122 listings (2.0%) are marked remote and 312 name no city.",
        "Listings were found on Naukri (54.0%), company career sites and ATS pages (20.3%), LinkedIn (13.9%), Shine (8.7%) and Internshala (3.1%). That describes where we found them, not which portal is better. Most of these are not on internship sites, so search by role title."
      ],
      "chart": {
        "id": "rjfagf285Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=6,150)",
        "labels": [
          "Bengaluru",
          "Chennai",
          "Mumbai",
          "Hyderabad",
          "Pune",
          "Gurugram",
          "Delhi",
          "Noida",
          "Ahmedabad",
          "Coimbatore"
        ],
        "values": [
          830,
          674,
          672,
          553,
          467,
          319,
          300,
          291,
          257,
          130
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
            "830",
            "13.5%"
          ],
          [
            "Chennai",
            "674",
            "11.0%"
          ],
          [
            "Mumbai",
            "672",
            "10.9%"
          ],
          [
            "Hyderabad",
            "553",
            "9.0%"
          ],
          [
            "Pune",
            "467",
            "7.6%"
          ],
          [
            "Gurugram",
            "319",
            "5.2%"
          ],
          [
            "Delhi",
            "300",
            "4.9%"
          ],
          [
            "Noida",
            "291",
            "4.7%"
          ],
          [
            "Ahmedabad",
            "257",
            "4.2%"
          ],
          [
            "Coimbatore",
            "130",
            "2.1%"
          ]
        ],
        "note": "A listing can name more than one city. 122 listings are marked remote and 312 name no city."
      }
    },
    {
      "title": "What is the salary for any graduate freshers?",
      "sub": "2,651 listings state pay in rupees",
      "paras": [
        "The median stated salary is 3.5 lakh a year, with the middle half between 3 lakh and 4.5 lakh. That is the top of each stated range, annualised, for the 2,651 jobs that state pay in rupees. It is below the 4 lakh median across the whole index, which fits the customer service and sales mix.",
        "More than half of the listings, 1,480 (55.8%), sit in the ₹3 to 5 lakh band. ₹2 to 3 lakh has 548 (20.7%) and ₹5 to 8 lakh has 386 (14.6%). ₹8 to 12 lakh has 78, ₹12 to 20 lakh has 63, under ₹2 lakh has 94 and ₹20 lakh or more has 2.",
        "Internships here are few: 253 in total, and 19 state a stipend with a median of ₹18,000 a month. Pay is stated more often than in other reports, but the figure is the top of a range and often includes incentives. Ask for the fixed monthly pay, the variable part and the shift pattern before you compare offers."
      ],
      "chart": {
        "id": "rjfagf285Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (2,651 jobs that state pay in rupees)",
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
          94,
          548,
          1480,
          386,
          78,
          63,
          2
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** A 3.5 lakh median is a guide. A listing with a high range and heavy targets may pay the lower end in practice."
    },
    {
      "title": "How do you get hired as an any graduate fresher?",
      "sub": "Who to email and what to send",
      "paras": [
        "Email the person who runs the team. For customer service, that is the operations head or the process manager. For sales, the sales manager or branch head. For banking roles, the branch manager or cluster head. 715 listings (11.6%) put an email in the description, so many employers are easy to reach.",
        "Send one piece of proof. A customer service candidate can send a short recording of a mock call or a written reply to a common complaint. A sales candidate can send a list of ten local prospects with a first line for each. A back-office candidate can send a clean Excel sheet. Keep the email to three lines: who you are, what you made and one question.",
        "Follow up once and stop. Studojo built Stu to do the slow parts: it finds who hires, verifies their work email, writes a personal note and sends it from your own inbox once you start a campaign. It does not mass apply and does not promise replies."
      ]
    }
  ],
  "method": [
    "This report counts **6,150 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts when its description (200 or more characters) mentions any graduate.",
    "Pay: 2,651 of 5,897 entry-level listings (45.0%) state a salary in rupees and 19 of 253 internships (7.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 6,150 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What jobs can any graduate freshers apply for?",
      "a": "Customer service has the most listings (1,295), then HR (418), business development (388), relationship manager (337) and field sales (336). Most are sales and support roles."
    },
    {
      "q": "What is the salary for any graduate freshers?",
      "a": "Among 2,651 listings that state pay, the median is 3.5 lakh a year and the middle half is 3 lakh to 4.5 lakh. That is the top of the stated range, so confirm the fixed part."
    },
    {
      "q": "How many jobs for any graduate are there in 2026?",
      "a": "We tracked 6,150 October listings that say any graduate: 5,897 jobs and 253 internships. This counts listings, not hires."
    },
    {
      "q": "Which city has the most jobs for any graduate?",
      "a": "Bengaluru has 830 listings, Chennai 674 and Mumbai 672. Hyderabad has 553 and Pune 467. 122 listings are marked remote."
    },
    {
      "q": "Do any graduate jobs involve night shifts or targets?",
      "a": "Often. 2,291 listings (37.3%) mention targets and 1,012 (16.5%) mention night, rotational, US or UK shifts. Read the description before you apply."
    },
    {
      "q": "What are the best jobs for any graduate?",
      "a": "That depends on you, but the strongest pools are customer service, business development and relationship manager. Those roles value communication skills, which appear in 75.3% of listings."
    }
  ],
  "takeaway": {
    "sub": "What to remember about any graduate jobs",
    "items": [
      [
        "Customer service leads",
        "1,295 listings, 21.1% of the slice."
      ],
      [
        "Pay is stated more often",
        "2,651 jobs (45.0%) give a figure, and the median is 3.5 lakh a year."
      ],
      [
        "Check targets and shifts",
        "Targets appear in 37.3% and night or rotational shifts in 16.5%."
      ],
      [
        "Chennai ranks second",
        "674 listings, ahead of Mumbai with 672."
      ],
      [
        "Email the team lead",
        "Send one piece of proof and follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "fresher-salary-india-2026",
      "kicker": "Data",
      "title": "Fresher Salary in India 2026"
    },
    {
      "slug": "skills-in-demand-fresher-jobs-india-2026",
      "kicker": "Data",
      "title": "Skills in Demand for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Jobs for Any Graduate Freshers 2026",
    "description": "6,150 active entry-level and internship listings for India posted in October 2026 (any graduate), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-any-graduate-freshers-2026" place="report-end" size="card" title={"Want to email who hires any graduate?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
