import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-freshers-in-indore-2026",
  "title": "Jobs for Freshers in Indore 2026: What 2,308 Listings Show",
  "short": "Jobs for Freshers in Indore 2026",
  "description": "Jobs for freshers in Indore: 2,308 October listings, 9.2% internships and a stated median of ₹4.5 lakh a year. See the roles, pay and how to get hired.",
  "keywords": "jobs for freshers in indore, how to get a job in indore, indore fresher jobs 2026, fresher salary in indore, internships in indore",
  "h1": "Jobs for Freshers in Indore:",
  "h1em": "What 2,308 Listings Show",
  "sub": "Indore had 2,308 entry-level and internship listings in October 2026. Customer service leads at 20.4%, but HR, field sales and business development are all above 4%, and the stated median pay is ₹4.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "Indore · freshers and interns",
  "findings": [
    "**Jobs for freshers in Indore** are broader than in most smaller cities: customer service is 20.4% of the 2,308 listings, but HR (5.6%), field sales (5.2%) and business development (4.5%) each have over 100 listings.",
    "Indore is a good city for **internships**: 212 of 2,308 listings, 9.2%, close to the 10.8% index-wide share.",
    "The stated median is **₹4.5 lakh a year**, above the ₹4 lakh index median, though only 34.9% of listings state pay.",
    "**Marketing work is visible**: marketing executive has 62 listings and digital marketing 49, so a portfolio is worth building.",
    "Do not rely on the portal alone. **Email the team lead** with one piece of real work, and let Stu find the right person and verify the address."
  ],
  "stats": [
    {
      "num": "2,308",
      "label": "Entry-level jobs and internships listed in Indore, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4.5 lakh",
      "label": "Median stated pay a year, from the 731 jobs that state it (34.9%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "13.1%",
      "label": "Of listings with a full description ask for calling or telecalling",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What jobs for freshers are there in Indore?",
      "sub": "Role groups across 2,308 October listings, matched on the job title.",
      "paras": [
        "Jobs for freshers in Indore start with customer service, which has 470 listings, 20.4% of the city. Relationship manager follows with 137 (5.9%), then HR with 129 (5.6%), field sales with 121 (5.2%) and business development with 105 (4.5%). Five groups carry the bulk of the volume.",
        "What stands out against the index is the marketing line. Marketing executive has 62 listings (2.7%) and digital marketing 49 (2.1%), and hotel and hospitality has 60. A fresher with a content or ads project has a real target here, which is not true of every city in this set.",
        "Role groups are matched on titles. A title can match more than one group, and generic titles such as executive or associate match none, so these shares understate the true spread. Use the table to decide which teams to approach first, not to rank the jobs."
      ],
      "chart": {
        "id": "rjffii261Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=2,308)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          2096,
          212
        ],
        "unit": "listings"
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
            "470",
            "20.4%"
          ],
          [
            "relationship manager",
            "137",
            "5.9%"
          ],
          [
            "HR",
            "129",
            "5.6%"
          ],
          [
            "field sales",
            "121",
            "5.2%"
          ],
          [
            "business development",
            "105",
            "4.5%"
          ],
          [
            "marketing (general)",
            "62",
            "2.7%"
          ],
          [
            "hotel and hospitality",
            "60",
            "2.6%"
          ],
          [
            "digital marketing",
            "49",
            "2.1%"
          ],
          [
            "accountant",
            "47",
            "2.0%"
          ],
          [
            "telecaller",
            "47",
            "2.0%"
          ],
          [
            "technical support",
            "38",
            "1.6%"
          ],
          [
            "social media",
            "35",
            "1.5%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Mix:** 2,096 jobs and 212 internships, so about one listing in eleven is an internship."
    },
    {
      "title": "What are fresher job titles in Indore really called?",
      "sub": "Titles as employers wrote them.",
      "paras": [
        "The top title is Customer Support Executive with 27 listings, then Sales Executive with 21. Behind them sit several titles with exactly 20 listings each: Associate Housekeeping, Opt Recruiter, and two relationship titles posted for a top bank through a consultancy. Equal counts like these usually point to a single batch posting.",
        "Do not read repeated titles as repeated demand. A consultancy can post the same role in many cities at once, and the same hiring drive then appears in Indore, Lucknow, Nagpur and elsewhere. The 876 distinct employers behind the city's listings, with the top 10 holding 25.6%, show a less concentrated market than Vadodara or Nagpur.",
        "The descriptions add the real conditions. In listings with a full description, 28.0% say freshers, 23.3% mention targets, 13.6% mention incentives and 12.4% say work from office. Night, rotational, US or UK shifts appear in 10.9%. A title never tells you that, so read the full text."
      ],
      "chart": {
        "id": "rjffii261Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (1,948 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "incentives",
          "work from office",
          "night, rotational, US or UK shifts",
          "PF, ESI or health insurance",
          "immediate joining",
          "a certificate",
          "cab or transport",
          "a portfolio"
        ],
        "values": [
          28.0,
          23.3,
          13.6,
          12.4,
          10.9,
          10.3,
          6.3,
          5.6,
          5.4,
          5.0
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
            "27"
          ],
          [
            "Sales Executive",
            "21"
          ],
          [
            "Relationship Officer Top Bank Gips Consultancy Services",
            "20"
          ],
          [
            "Relationship Manager Accounts Top Bank Gips Consultancy Services",
            "20"
          ],
          [
            "Associate Housekeeping",
            "20"
          ],
          [
            "Opt Recruiter",
            "20"
          ],
          [
            "Business Development Executive",
            "19"
          ],
          [
            "Customer Care Executive",
            "18"
          ],
          [
            "Field Sales Executive",
            "16"
          ],
          [
            "Sales Exec Direct Sales Professional Grihum",
            "16"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 876 different employers posted these listings, and 10.8% of listings do not name the employer."
      }
    },
    {
      "title": "What is the fresher salary in Indore?",
      "sub": "Stated pay only: 731 listings, top of the range, per year.",
      "paras": [
        "The fresher salary in Indore has a stated median of ₹4.5 lakh a year, with the middle half between ₹3 lakh and ₹5.5 lakh. That sits above the index median of ₹4 lakh. Only 34.9% of Indore listings state pay in rupees, so the figure comes from about a third of the city.",
        "The largest band is ₹3 to 5 lakh at 46.9%, then ₹5 to 8 lakh at 33.0%. Only 6.0% sit under ₹2 lakh, and 10.3% fall between ₹2 and 3 lakh. At the top, 2.1% reach ₹8 to 12 lakh and 1.2% reach ₹12 to 20 lakh.",
        "Internship pay is the weak spot. Of 212 internships only 9 state a stipend, a median of ₹14,583 a month. Nine listings is too few to call a rate, so ask for the stipend in your first message. For full-time offers, treat ₹4.5 lakh as a ceiling of the stated range, not a promise."
      ],
      "chart": {
        "id": "rjffii261Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (731 jobs that state pay in rupees)",
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
          44,
          75,
          343,
          241,
          15,
          9,
          4
        ],
        "unit": "listings"
      },
      "callout": "**Reality check:** pay is the top of the stated range, so expect your offer to land at or below it."
    },
    {
      "title": "What skills do Indore employers ask freshers for?",
      "sub": "Share of descriptions that mention each skill.",
      "paras": [
        "Communication skills appear in 65.2% of Indore descriptions against 60.2% index-wide. English follows at 22.8%, calling or telecalling at 13.1% and Excel at 11.4%. Negotiation sits at 9.1% and CRM tools at 8.9%, a little above the index on both.",
        "The mix matches the role table: sales and service skills dominate. If you want the marketing or HR listings, add proof of the specific tool, such as a spreadsheet tracker for HR or a small campaign report for digital marketing. Employers who name Excel and CRM tools are screening for people who have touched them.",
        "Internshala carries 6.9% of Indore listings, above its 5.9% index share, which fits the higher internship rate. LinkedIn carries 12.8% and Naukri 60.4%. Those are only where the listings were found, and they say nothing about which site is better for you."
      ],
      "chart": {
        "id": "rjffii261Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,948 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "calling or telecalling",
          "Excel",
          "negotiation",
          "CRM tools (Salesforce, HubSpot or similar)",
          "social media",
          "Hindi",
          "SEO",
          "Tally"
        ],
        "values": [
          65.2,
          22.8,
          13.1,
          11.4,
          9.1,
          8.9,
          8.4,
          5.2,
          3.7,
          2.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a fresher in Indore?",
      "sub": "Who to email, what to send, what to say.",
      "paras": [
        "Match the person to the group. For customer support and sales, email the team leader or the sales manager. For HR listings, write to the HR head or the talent acquisition lead. For digital marketing, write to the marketing manager or the founder of a small firm, since 876 employers is a long tail of small teams. For internships, write to whoever manages the interns.",
        "Send one piece of real work. For marketing, a one-page audit of a local brand's Instagram with three fixes. For HR, a one-page screening checklist for a role you pick. For sales, a short list of ten prospects and your opening line. A cold application lands among about 242 others per opening (Business Insider data via The Interview Guys, April 2026).",
        "Three lines: who you are, what you attached, what role you want. Follow up once. About 8.8% of Indore descriptions include an email address, so look for it before you guess. Stu handles the slow parts: it finds who is hiring, verifies the work email and drafts a note from your real work, and you send it when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **2,308 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts for Indore when it names Indore as a location; a listing can name more than one city.",
    "Pay: 731 of 2,096 entry-level listings (34.9%) state a salary in rupees and 9 of 212 internships (4.2%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,948 listings (84.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How do I get a job in Indore as a fresher?",
      "a": "Choose a role group with volume, such as customer service (470 listings) or field sales (121), and email the team lead directly with one piece of real work. The Interview Guys (April 2026) cite 0.1% to 2% success per online application."
    },
    {
      "q": "What is the fresher salary in Indore?",
      "a": "The stated median is ₹4.5 lakh a year, from 731 listings that state pay. The middle half runs from ₹3 lakh to ₹5.5 lakh."
    },
    {
      "q": "Are there internships in Indore?",
      "a": "Yes. We found 212 internships out of 2,308 listings, 9.2%. Only 9 state a stipend, with a median of ₹14,583 a month."
    },
    {
      "q": "Are there marketing jobs for freshers in Indore?",
      "a": "Some. Marketing executive has 62 listings and digital marketing 49, together about 5% of the city's listings. Bring a small portfolio."
    },
    {
      "q": "Can I get an HR job as a fresher in Indore?",
      "a": "HR has 129 listings, 5.6% of the city, and Opt Recruiter alone has 20. Email the HR head or recruiting lead with a short screening checklist."
    },
    {
      "q": "Do Indore listings allow remote work?",
      "a": "Rarely. 1.9% carry a remote flag and 12.4% of descriptions say work from office."
    }
  ],
  "takeaway": {
    "sub": "What 2,308 October listings say about Indore.",
    "items": [
      [
        "Five groups carry the city",
        "Customer service, relationship manager, HR, field sales and business development."
      ],
      [
        "Internships exist",
        "212 listings, 9.2%, close to the index share."
      ],
      [
        "Pay is higher than the index",
        "Stated median ₹4.5 lakh, though only 34.9% state pay."
      ],
      [
        "Marketing has a door",
        "62 marketing executive and 49 digital marketing listings."
      ],
      [
        "Email with proof",
        "Send the team lead one piece of real work and follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-kochi-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Kochi 2026"
    },
    {
      "slug": "jobs-for-freshers-in-surat-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Surat 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Jobs for Freshers in Indore 2026",
    "description": "2,308 active entry-level and internship listings for India posted in October 2026 (Indore), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-freshers-in-indore-2026" place="report-end" size="card" title={"Want to reach the Indore team that hires?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
