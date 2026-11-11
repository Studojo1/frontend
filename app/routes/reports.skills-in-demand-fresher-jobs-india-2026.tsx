import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "skills-in-demand-fresher-jobs-india-2026",
  "title": "Skills in Demand for Freshers in India 2026: What 147,916 Ads Ask",
  "short": "Skills in Demand for Freshers 2026",
  "description": "Skills in demand for freshers, counted from 147,916 October 2026 listings: communication leads at 60.2%, then English, Excel and calling. See skills by role.",
  "keywords": "skills in demand for freshers, skills required for freshers, most in demand skills india 2026, skills employers want freshers",
  "h1": "Skills in Demand for Freshers in India:",
  "h1em": "What Listings Actually Ask",
  "sub": "The skills in demand for freshers are communication (60.2% of listings), English (21.8%) and Excel (13.7%). We checked 147,916 October listings in the Studojo Jobs Index that carry a full description, then split the skills by role group.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "The **skills in demand for freshers** start with communication: 89,073 of 147,916 listings with a description (60.2%) mention it, nearly three times the share for English (21.8%).",
    "**Excel is the most common tool skill at 13.7%**, and it leads the asks for accountants (49.5%), operations executives (41.2%) and HR (27.7%).",
    "**Coding skills are a thin slice of the whole**: Python appears in 3.1% of listings, SQL in 2.5% and machine learning or generative AI in 2.3%, because sales and service jobs dominate the list.",
    "**Each role has its own skill**: CRM tools lead for business development (48.1%), negotiation for field sales (35.4%), social media for digital marketing (72.7%) and calling for telecallers (74.0%).",
    "**Proof of one skill beats a long skills list.** An average opening draws about 242 applications (Business Insider data via The Interview Guys, April 2026), so email the hiring manager one small piece of work. Stu can find that person and write the email."
  ],
  "stats": [
    {
      "num": "170,927",
      "label": "Entry-level and internship listings in India, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 43,254 jobs that state it (28.4%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "13.7%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Which skills are in demand for freshers in India?",
      "sub": "Ranked by the share of listings that mention each skill.",
      "paras": [
        "Communication skills are the most requested skill by a wide margin. They appear in 60.2% of the 147,916 October listings that carry a full description. English follows at 21.8%, Excel at 13.7%, calling or telecalling at 10.4% and CRM tools such as Salesforce or HubSpot at 9.0%. Negotiation and social media tie at 7.2%. Hindi shows up in 5.4%, cloud (AWS, Azure, GCP) in 3.3%, Python in 3.1%, Adobe tools in 2.7%, SQL in 2.5%, machine learning or generative AI in 2.3% and SEO in 2.2%. These are keyword matches, so a mention is a signal, not a hard requirement.",
        "The table shows how the picture changes by role group. The right skill depends on the job family, which is the main thing to take away from this report."
      ],
      "chart": {
        "id": "rsidfji91Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (147,916 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "social media",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "Python"
        ],
        "values": [
          60.2,
          21.8,
          13.7,
          10.4,
          9.0,
          7.2,
          7.2,
          5.4,
          3.3,
          3.1
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Role group",
          "Listings with a description",
          "Most asked",
          "Second",
          "Third"
        ],
        "rows": [
          [
            "customer service",
            "15,488",
            "calling or telecalling (22.2%)",
            "CRM tools (Salesforce, HubSpot or similar) (10.9%)",
            "Excel (4.3%)"
          ],
          [
            "business development",
            "6,654",
            "CRM tools (Salesforce, HubSpot or similar) (48.1%)",
            "negotiation (25.8%)",
            "calling or telecalling (25.6%)"
          ],
          [
            "HR",
            "6,269",
            "Excel (27.7%)",
            "negotiation (15.5%)",
            "social media (14.3%)"
          ],
          [
            "field sales",
            "4,985",
            "negotiation (35.4%)",
            "CRM tools (Salesforce, HubSpot or similar) (26.4%)",
            "calling or telecalling (18.8%)"
          ],
          [
            "relationship manager",
            "4,092",
            "CRM tools (Salesforce, HubSpot or similar) (13.5%)",
            "negotiation (12.7%)",
            "calling or telecalling (9.2%)"
          ],
          [
            "marketing (general)",
            "3,344",
            "social media (67.3%)",
            "SEO (27.4%)",
            "Canva (23.6%)"
          ],
          [
            "telecaller",
            "3,243",
            "calling or telecalling (74.0%)",
            "CRM tools (Salesforce, HubSpot or similar) (26.8%)",
            "Excel (17.8%)"
          ],
          [
            "process associate",
            "2,938",
            "SAP (10.9%)",
            "Excel (9.6%)",
            "calling or telecalling (8.7%)"
          ],
          [
            "hotel and hospitality",
            "2,805",
            "Excel (4.7%)",
            "CRM tools (Salesforce, HubSpot or similar) (1.7%)",
            "negotiation (1.7%)"
          ],
          [
            "accountant",
            "2,541",
            "Excel (49.5%)",
            "GST (45.8%)",
            "Tally (45.5%)"
          ],
          [
            "retail sales",
            "2,433",
            "negotiation (10.5%)",
            "CRM tools (Salesforce, HubSpot or similar) (9.8%)",
            "calling or telecalling (8.1%)"
          ],
          [
            "operations executive",
            "2,348",
            "Excel (41.2%)",
            "CRM tools (Salesforce, HubSpot or similar) (8.2%)",
            "negotiation (5.5%)"
          ],
          [
            "social media",
            "2,120",
            "social media (92.7%)",
            "Canva (37.9%)",
            "content writing or copywriting (19.6%)"
          ],
          [
            "content writer",
            "1,651",
            "social media (55.8%)",
            "content writing or copywriting (55.0%)",
            "SEO (30.0%)"
          ],
          [
            "digital marketing",
            "1,554",
            "social media (72.7%)",
            "SEO (53.7%)",
            "paid ads (Google, Meta, PPC) (49.7%)"
          ],
          [
            "technical support",
            "1,542",
            "cloud (AWS, Azure, GCP) (11.9%)",
            "CRM tools (Salesforce, HubSpot or similar) (6.9%)",
            "Excel (4.4%)"
          ]
        ],
        "note": "Keyword match on the job description; communication and language mentions are left out of this table."
      },
      "callout": "**Method:** a skill counts when the description mentions it. Communication and language mentions are left out of the role table so the rest can show."
    },
    {
      "title": "What skills are required for freshers beyond the job description?",
      "sub": "Terms about the job itself that listings repeat.",
      "paras": [
        "Besides skills, listings state conditions. The word freshers appears in 21.8% of descriptions, targets in 20.5% and night, rotational, US or UK shifts in 11.0%. Incentives are mentioned in 8.9%, work from office in 7.2%, a portfolio in 7.1% and a certificate in 6.2%. A portfolio matters more than the number suggests for creative and technical roles, because it is proof you can show. GitHub appears in 0.9% of listings, so it is a niche signal, not a general one.",
        "Degree words are also present: BTech, BE or computer science in 7.2%, MBA or PGDM in 3.2% and BCom in 2.7%. Any graduate is written in 4.2% and 12th pass in 4.1%, so many openings do not tie you to a degree."
      ],
      "chart": {
        "id": "rsidfji91Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (147,916 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "night, rotational, US or UK shifts",
          "incentives",
          "work from office",
          "a portfolio",
          "a certificate",
          "PF, ESI or health insurance",
          "immediate joining",
          "work from home"
        ],
        "values": [
          21.8,
          20.5,
          11.0,
          8.9,
          7.2,
          7.1,
          6.2,
          6.2,
          5.0,
          4.1
        ],
        "unit": "%"
      }
    },
    {
      "title": "Which roles ask for which skills?",
      "sub": "Role groups with the most listings, and where they sit.",
      "paras": [
        "Customer service has the most listings (20,127, or 11.8%), followed by HR (7,267) and business development (6,891). Hotel and hospitality has 6,414, relationship manager 5,839 and field sales 5,137. If your skills fit one of these, there is simply more volume to look at. Skills split by role. Accountants are asked for Excel (49.5%), GST (45.8%) and Tally (45.5%). Content writer listings mention social media (55.8%) and content writing or copywriting (55.0%).",
        "Mumbai (21,016 listings) and Bengaluru (20,817) lead the city count, with Chennai and Hyderabad near 11,800 each."
      ],
      "chart": {
        "id": "rsidfji91Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=170,927)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Chennai",
          "Hyderabad",
          "Delhi",
          "Pune",
          "Gurugram",
          "Ahmedabad",
          "Noida",
          "Kolkata"
        ],
        "values": [
          21016,
          20817,
          11860,
          11719,
          10249,
          9664,
          9378,
          8448,
          8043,
          3953
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
            "20,127",
            "11.8%"
          ],
          [
            "HR",
            "7,267",
            "4.3%"
          ],
          [
            "business development",
            "6,891",
            "4.0%"
          ],
          [
            "hotel and hospitality",
            "6,414",
            "3.8%"
          ],
          [
            "relationship manager",
            "5,839",
            "3.4%"
          ],
          [
            "field sales",
            "5,137",
            "3.0%"
          ],
          [
            "process associate",
            "3,779",
            "2.2%"
          ],
          [
            "marketing (general)",
            "3,441",
            "2.0%"
          ],
          [
            "telecaller",
            "3,420",
            "2.0%"
          ],
          [
            "accountant",
            "2,738",
            "1.6%"
          ],
          [
            "operations executive",
            "2,663",
            "1.6%"
          ],
          [
            "retail sales",
            "2,633",
            "1.5%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "Should a fresher learn Python or SQL first?",
      "sub": "Technical skills against the size of the whole list.",
      "paras": [
        "Learn the skill that your target role group asks for, not the one with the most hype. Python appears in 4,573 listings (3.1%). SQL is in 3,708 (2.5%) and machine learning or generative AI in 3,392 (2.3%). Those counts are small next to communication (89,073) but they sit in roles that need them. If you want data or software work, Python and SQL are the proof points. If you want sales, CRM tools and negotiation matter more, with 13,347 listings (9.0%) naming CRM and 10,609 (7.2%) naming negotiation.",
        "A good test: open ten listings for your role, tally which skills repeat, and build one small project or sample that uses the top two."
      ]
    },
    {
      "title": "How do you get hired using the skills employers ask for?",
      "sub": "Show one skill as work, then send it to the person who hires.",
      "paras": [
        "Pick the one skill your role asks for most and make a small piece of work with it. A business development fresher can write a short plan with CRM-style lead tracking. An accountant can send a clean Tally or GST worksheet. A digital marketing fresher can send a one-page social calendar with a sample post.",
        "Email the person who runs that team: the sales head for business development, the finance manager for accounts, the marketing lead for social media. Keep it to three lines: who you are, what you made, and a request for ten minutes. Attach the work as a single file. Follow up once after a few days.",
        "A bundle of keywords in a CV is the same as everyone else's. Recruiters give a first resume scan about 6 to 7 seconds (Ladders eye-tracking study, 2018), so real work gets seen faster. Stu does the slow parts: it finds the hiring person, verifies the work email and drafts your note, and sends it from your inbox when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **170,927 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. It covers every listing in the index for that month.",
    "Pay: 43,254 of 152,469 entry-level listings (28.4%) state a salary in rupees and 385 of 18,458 internships (2.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 147,916 listings (86.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What skills are in demand for freshers in India?",
      "a": "Communication leads, mentioned in 60.2% of October listings with a description. English (21.8%), Excel (13.7%), calling (10.4%) and CRM tools (9.0%) follow. The mix changes by role."
    },
    {
      "q": "What skills are required for freshers in sales?",
      "a": "Negotiation leads for field sales (35.4%) and CRM tools lead for business development (48.1%). Calling or telecalling is named in 25.6% of business development listings and 18.8% of field sales listings."
    },
    {
      "q": "What are the most in demand skills in India in 2026 for tech freshers?",
      "a": "Tech skills are a small share of the entry-level list: cloud 3.3%, Python 3.1%, SQL 2.5% and machine learning or generative AI 2.3%. They matter for the specific roles that ask for them."
    },
    {
      "q": "What skills do employers want from freshers besides technical ones?",
      "a": "Communication at 60.2% and English at 21.8%. Targets are mentioned in 20.5% of listings and a portfolio in 7.1%, which shows employers also look for proof and drive."
    },
    {
      "q": "Do accountant freshers need Excel and Tally?",
      "a": "Yes, they are the most asked skills. Among accountant listings with a description, Excel appears in 49.5%, GST in 45.8% and Tally in 45.5%."
    },
    {
      "q": "Do I need Hindi for entry level jobs?",
      "a": "Hindi appears in 5.4% of listings with a description, against English in 21.8%. It matters most in calling and sales roles, so check the listing for your city."
    }
  ],
  "takeaway": {
    "sub": "How to use this list.",
    "items": [
      [
        "Lead with communication",
        "It is in 60.2% of descriptions, so show it in how you write to employers."
      ],
      [
        "Match skill to role",
        "Excel for accounts and HR, CRM for business development, social media for marketing."
      ],
      [
        "Do not over-learn code",
        "Python, SQL and AI each appear in 3.1% of listings or fewer, so learn them only for roles that ask."
      ],
      [
        "Turn skill into proof",
        "One small sample of work does more than a list of keywords."
      ],
      [
        "Send it to a person",
        "Email the team lead instead of joining about 242 other applicants."
      ]
    ]
  },
  "related": [
    {
      "slug": "work-from-office-vs-hybrid-fresher-jobs-2026",
      "kicker": "Data",
      "title": "Work From Office vs Hybrid Jobs 2026"
    },
    {
      "slug": "night-shift-jobs-for-freshers-india-2026",
      "kicker": "Data",
      "title": "Night Shift Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Skills in Demand for Freshers 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (skills fresher jobs ask for), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-skills-in-demand-fresher-jobs-india-2026" place="report-end" size="card" title={"Which skill should you show first?"} line={"Tell Stu the role, the city and the pay you want. Stu finds jobs that fit you and the person who is hiring, with a verified work email. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
