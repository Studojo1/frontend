import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "fresher-jobs-list-india-2026",
  "title": "Fresher Jobs List India 2026: The 30 Titles Employers Post Most",
  "short": "Fresher Jobs List India 2026",
  "description": "A fresher jobs list built from 170,927 October 2026 listings: the 30 most posted titles, the biggest role groups, pay and what each job asks for.",
  "keywords": "fresher jobs list, types of jobs for freshers, most common entry level jobs india, what jobs can a fresher get",
  "h1": "The Fresher Jobs List for India:",
  "h1em": "What 170,927 Listings Show",
  "sub": "The fresher jobs list is led by customer service (20,127 listings), then HR, business development and hospitality. We counted 170,927 October listings in the Studojo Jobs Index, 152,469 jobs and 18,458 internships, and listed the titles and role groups that repeat most.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "The **fresher jobs list** starts with customer service: 20,127 of 170,927 October listings (11.8%) match that role group, nearly three times the next one, HR at 7,267.",
    "**Most fresher listings are jobs, not internships**: 152,469 are entry-level jobs and 18,458 (10.8%) are internships.",
    "**Only 28.4% of jobs state pay in rupees**, and where they do the median top of range is about ₹4 lakh a year. Just 385 internships state a stipend, a median of ₹15,000 a month.",
    "**Communication skills appear in 60.2% of descriptions**, far ahead of English (21.8%) and Excel (13.7%). Targets show up in 20.5% and night or rotational shifts in 11.0%.",
    "**The move that works is a short email to the person who runs the team.** An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), so a named, specific email stands apart. Stu finds that person for you."
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
      "title": "What jobs can a fresher get in India?",
      "sub": "The 30 job titles employers posted most in October 2026.",
      "paras": [
        "A fresher can get far more than the usual corporate roles. The most posted title in the listings we track is Associate Housekeeping, with 2,811 listings. Business Development Associate follows with 1,348, then Customer Support Executive with 1,199 and Sales Executive with 1,071. The table lists the 30 most posted titles exactly as employers wrote them. Sales, support and operations fill most of it. Business Development (Sales) Internship is the only internship title high enough to make the list, with 596 listings, all of them internships. Odd entries such as Radiologist (455) and Optometrist (354) are a reminder that entry level also covers clinical and technical work.",
        "The same job is worded many ways, so a count by title understates the big families. Read this table as a feel for the language you will meet on job boards, then use the role groups in the next section for real volume."
      ],
      "chart": {
        "id": "rfjli290Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=170,927)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          152469,
          18458
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings",
          "Internships among them"
        ],
        "rows": [
          [
            "Associate Housekeeping",
            "2,811",
            "0"
          ],
          [
            "Business Development Associate",
            "1,348",
            "8"
          ],
          [
            "Customer Support Executive",
            "1,199",
            "0"
          ],
          [
            "Sales Executive",
            "1,071",
            "4"
          ],
          [
            "Business Development Executive",
            "923",
            "7"
          ],
          [
            "Customer Service Executive",
            "854",
            "0"
          ],
          [
            "Business Development (Sales) Internship",
            "596",
            "596"
          ],
          [
            "Record To Report Ops Associate",
            "570",
            "0"
          ],
          [
            "Field Sales Executive",
            "566",
            "0"
          ],
          [
            "Steward",
            "549",
            "0"
          ],
          [
            "Order To Cash Operations Associate",
            "511",
            "0"
          ],
          [
            "Customer Care Executive",
            "507",
            "3"
          ],
          [
            "Graphic Designer",
            "502",
            "2"
          ],
          [
            "Relationship Manager",
            "494",
            "0"
          ],
          [
            "Sales Associate",
            "494",
            "1"
          ],
          [
            "Accountant",
            "474",
            "5"
          ],
          [
            "Inbound Sales Representative Associate - Voice",
            "473",
            "0"
          ],
          [
            "Procure To Pay Operations Associate",
            "460",
            "0"
          ],
          [
            "Radiologist",
            "455",
            "0"
          ],
          [
            "Executive - Debt Management Services - Rural",
            "447",
            "0"
          ],
          [
            "Telecaller",
            "425",
            "0"
          ],
          [
            "HR Himanshu Atain Mega BPO Hiring Atain",
            "402",
            "0"
          ],
          [
            "Health Operations New Associate",
            "386",
            "0"
          ],
          [
            "Business Development Officer",
            "380",
            "0"
          ],
          [
            "Opt Recruiter",
            "378",
            "0"
          ],
          [
            "Trust & Safety New Associate",
            "374",
            "0"
          ],
          [
            "Optometrist",
            "354",
            "0"
          ],
          [
            "Interior Designer",
            "351",
            "3"
          ],
          [
            "Telesales Executive",
            "341",
            "0"
          ],
          [
            "Video Editor",
            "335",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them; the same job can be worded many ways, so role groups (table below) are the better guide to volume."
      },
      "callout": "**Search tip:** if you only search one title, you miss the others. Business Development Associate, Executive and Officer are three different titles for similar work."
    },
    {
      "title": "What are the most common entry level jobs in India?",
      "sub": "Role groups matched on the job title, and where the listings sit.",
      "paras": [
        "Customer service is the most common entry level job group in our October listings, with 20,127 listings or 11.8% of the total. HR is second with 7,267 (4.3%), business development third with 6,891 (4.0%), then hotel and hospitality with 6,414 (3.8%) and relationship manager with 5,839 (3.4%). Below the top five come field sales (5,137), process associate (3,779), marketing executive (3,441) and telecaller (3,420). Creative and digital roles are smaller: content writer has 1,743 listings, digital marketing 1,592 and graphic designer 1,447. These groups are matched on the title, so many generic titles such as associate or trainee fall outside all of them.",
        "Mumbai (21,016 listings) and Bengaluru (20,817) lead on location, each about 12% of the total. Chennai and Hyderabad follow at roughly 11,800 each. Another 11,816 listings name no city and 8,995 are marked remote."
      ],
      "chart": {
        "id": "rfjli290Cities",
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
          ],
          [
            "social media",
            "2,225",
            "1.3%"
          ],
          [
            "technical support",
            "1,946",
            "1.1%"
          ],
          [
            "content writer",
            "1,743",
            "1.0%"
          ],
          [
            "digital marketing",
            "1,592",
            "0.9%"
          ],
          [
            "supply chain and logistics",
            "1,503",
            "0.9%"
          ],
          [
            "graphic designer",
            "1,447",
            "0.8%"
          ],
          [
            "teaching",
            "1,399",
            "0.8%"
          ],
          [
            "video editor",
            "1,248",
            "0.7%"
          ]
        ]
      },
      "callout": "**Where:** two cities, Mumbai and Bengaluru, hold about a quarter of the listings that name a city."
    },
    {
      "title": "How much do entry level jobs and internships pay?",
      "sub": "Only the listings that state pay in rupees, and there are not many.",
      "paras": [
        "Most listings do not say what they pay. Of 152,469 jobs, 43,254 (28.4%) state pay in rupees. Of those, 20,876 (48.3%) put the top of the range between ₹3 lakh and ₹5 lakh a year, and the median is about ₹4 lakh a year. A further 9,544 (22.1%) sit at ₹5 to 8 lakh. Only 719 (1.7%) reach ₹20 lakh or more, which tells you those are not typical fresher roles. At the low end 2,283 (5.3%) top out below ₹2 lakh. These figures are the top of each stated range, so treat them as a ceiling.",
        "Internship pay is thinner still. Only 385 of 18,458 internships (2.1%) state a stipend. Of those, 180 (46.8%) fall in ₹10,000 to 20,000 a month and the median is ₹15,000. The remaining 98% do not say, so ask before you accept."
      ],
      "chart": {
        "id": "rfjli290Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (43,254 jobs that state pay in rupees)",
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
          2283,
          7490,
          20876,
          9544,
          1733,
          609,
          719
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do fresher job listings ask for?",
      "sub": "Skills and conditions, from 147,916 listings with a full description.",
      "paras": [
        "Communication skills are the one requirement almost everyone shares. They appear in 60.2% of the 147,916 listings with a full description. English comes next at 21.8%, Excel at 13.7%, and calling or telecalling at 10.4%. CRM tools appear in 9.0%. Technical skills are a smaller slice of the whole list: Python in 3.1%, SQL in 2.5% and SEO in 2.2%. That does not make them less valuable, it means the fresher list is dominated by sales, service and operations.",
        "Conditions matter as much as skills. About one in five descriptions (20.5%) mention targets and 11.0% mention night, rotational, US or UK shifts. Incentives appear in 8.9%, work from office in 7.2%, a portfolio in 7.1% and PF, ESI or health insurance in 6.2%. Read these as terms to check before you apply."
      ],
      "chart": {
        "id": "rfjli290Skills",
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
      "callout": "**Reality check:** 'freshers' is written in 21.8% of descriptions, so the word itself is a useful search term."
    },
    {
      "title": "How do you get hired from a fresher jobs list?",
      "sub": "Pick one role group, then email the person who runs it.",
      "paras": [
        "Pick one role group from the list, not ten. If you chose customer service, the person to email is the support or operations manager. For business development, email the sales head or team lead. For HR, write to the HR head or talent acquisition lead. For hospitality, write to the general manager or front office manager.",
        "Send one small piece of proof that fits the role. For customer service that could be a sample reply to an angry customer. For sales, a one-page plan for how you would find ten leads in a week. For HR, a short screening checklist for a role you saw in the listings.",
        "Keep the email to three lines: who you are, the one thing you made, and a simple ask for a short call. Follow up once after a few days. Stu does the slow parts: it finds the hiring person with a verified work email, drafts the email from your real work, and sends it from your own inbox once you start a campaign."
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
      "q": "What is on a fresher jobs list in India?",
      "a": "The most common fresher listings are customer service, HR, business development, hospitality and relationship manager roles. In October 2026 customer service alone had 20,127 of 170,927 listings in the Studojo Jobs Index (11.8%)."
    },
    {
      "q": "What are the most common entry level jobs in India?",
      "a": "Customer service (20,127 listings), HR (7,267) and business development (6,891) lead the role groups. Hospitality has 6,414 and relationship manager 5,839. These come from title matches across the listings we track."
    },
    {
      "q": "What types of jobs are there for freshers?",
      "a": "Freshers will find sales and business development, customer support, HR, hospitality, accounting, marketing, content and design, plus operations roles like process associate (3,779 listings). Technical support has 1,946 listings and teaching has 1,399."
    },
    {
      "q": "What jobs can a fresher get without experience?",
      "a": "Many. The word freshers appears in 21.8% of descriptions, any graduate in 4.2% and 12th pass in 4.1%. Customer service, telecaller (3,420 listings), field sales (5,137) and retail sales (2,633) are common starting points."
    },
    {
      "q": "How much do fresher jobs pay in India?",
      "a": "Only 28.4% of entry-level jobs state pay in rupees. Among those, the median top of range is about ₹4 lakh a year and 48.3% fall between ₹3 and 5 lakh. Internships that state a stipend have a median of ₹15,000 a month."
    },
    {
      "q": "Are there more fresher jobs or internships?",
      "a": "Jobs by a wide margin. Of 170,927 October listings, 152,469 are entry-level jobs and 18,458 (10.8%) are internships. Internship pay is rarely stated: only 385 listings give a stipend."
    }
  ],
  "takeaway": {
    "sub": "What the list tells you before you apply.",
    "items": [
      [
        "Start with volume",
        "Customer service, HR and business development are the three biggest role groups, so there are simply more openings to find."
      ],
      [
        "Read the pay gap",
        "Only 28.4% of jobs state pay. Ask about pay early when a listing is silent."
      ],
      [
        "Check the conditions",
        "Targets (20.5%), shifts (11.0%) and incentives (8.9%) change what a job is really like."
      ],
      [
        "Mind the title",
        "One job has many names, so search the role group, not one title."
      ],
      [
        "Write to one person",
        "Email the manager who runs the team instead of adding to a pile of about 242 applications."
      ]
    ]
  },
  "related": [
    {
      "slug": "skills-in-demand-fresher-jobs-india-2026",
      "kicker": "Data",
      "title": "Skills in Demand for Freshers 2026"
    },
    {
      "slug": "work-from-office-vs-hybrid-fresher-jobs-2026",
      "kicker": "Data",
      "title": "Work From Office vs Hybrid Jobs 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Fresher Jobs List India 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (the fresher jobs list), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-fresher-jobs-list-india-2026" place="report-end" size="card" title={"Want the person behind a listing?"} line={"Tell Stu the role, the city and the pay you want. Stu finds jobs that fit you and who is hiring, with a verified work email. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
