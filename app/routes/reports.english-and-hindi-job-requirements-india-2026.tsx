import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "english-and-hindi-job-requirements-india-2026",
  "title": "English Speaking Jobs for Freshers in India 2026: English and Hindi",
  "short": "English and Hindi Jobs for Freshers 2026",
  "description": "English speaking jobs for freshers: 21.8% of 147,916 October 2026 listings name English and 5.4% name Hindi, while 60.2% ask for communication skills.",
  "keywords": "english speaking jobs for freshers, hindi speaking jobs, jobs that need good english, communication skills jobs freshers",
  "h1": "English Speaking Jobs for Freshers in India:",
  "h1em": "English and Hindi in Listings",
  "sub": "English is named in 21.8% of fresher listings and Hindi in 5.4%, while communication skills appear in 60.2%. We read 147,916 October listings in the Studojo Jobs Index with a full description and split the language terms by role group and city.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "**English speaking jobs for freshers** are mostly sales and service: English is named in 53.3% of business development, 52.9% of content writer and 47.8% of customer service descriptions, against 21.8% across all listings.",
    "**Hindi is named in only 5.4% of listings overall**, but 33.4% of telecaller descriptions mention it, far above customer service (11.3%) and field sales (9.0%).",
    "**Communication skills matter more than either language**: 89,073 of 147,916 descriptions (60.2%) mention them, so most listings assume a language and ask for the skill.",
    "**The city changes the ask**: Ahmedabad names English in 38.3% of its descriptions but Hindi in 3.2%, while Bengaluru is at 26.0% English and 8.7% Hindi, and Delhi at 23.9% and 8.0%.",
    "**Write the email in the language the team works in.** An average opening draws about 242 applications (Business Insider data via The Interview Guys, April 2026). A short personal note to the hiring manager stands out, and Stu finds that person for you."
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
      "title": "Which jobs need good English?",
      "sub": "Share of descriptions that mention English or Hindi, by role group.",
      "paras": [
        "Jobs that need good English are concentrated in customer-facing and writing roles. Among descriptions for business development 53.3% mention English, for content writer 52.9% and for customer service 47.8%. Telecaller is at 44.5%, operations executive 31.4% and general marketing 28.4%. At the other end, relationship manager listings name English in only 10.6%, hospitality in 14.3%, retail sales in 14.5% and accountant in 15.2%. These roles still need to talk to people, but the listing does not spell out the language.",
        "Hindi shows a sharper pattern. Telecaller listings mention it in 33.4%, customer service in 11.3%, field sales in 9.0% and business development in 8.8%. HR is at 3.0% and process associate at 1.6%. Across all roles the figure is 5.4%, so Hindi is a specific ask rather than a general one."
      ],
      "chart": {
        "id": "reahjri97Skills",
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
          "Mention English",
          "Mention Hindi"
        ],
        "rows": [
          [
            "customer service",
            "15,488",
            "47.8%",
            "11.3%"
          ],
          [
            "business development",
            "6,654",
            "53.3%",
            "8.8%"
          ],
          [
            "HR",
            "6,269",
            "21.0%",
            "3.0%"
          ],
          [
            "field sales",
            "4,985",
            "19.1%",
            "9.0%"
          ],
          [
            "relationship manager",
            "4,092",
            "10.6%",
            "4.5%"
          ],
          [
            "marketing (general)",
            "3,344",
            "28.4%",
            "8.3%"
          ],
          [
            "telecaller",
            "3,243",
            "44.5%",
            "33.4%"
          ],
          [
            "process associate",
            "2,938",
            "23.3%",
            "1.6%"
          ],
          [
            "hotel and hospitality",
            "2,805",
            "14.3%",
            "3.5%"
          ],
          [
            "accountant",
            "2,541",
            "15.2%",
            "2.8%"
          ],
          [
            "retail sales",
            "2,433",
            "14.5%",
            "5.4%"
          ],
          [
            "operations executive",
            "2,348",
            "31.4%",
            "5.4%"
          ],
          [
            "social media",
            "2,120",
            "25.0%",
            "7.0%"
          ],
          [
            "content writer",
            "1,651",
            "52.9%",
            "8.7%"
          ],
          [
            "digital marketing",
            "1,554",
            "24.5%",
            "5.9%"
          ],
          [
            "technical support",
            "1,542",
            "21.6%",
            "3.6%"
          ]
        ]
      },
      "callout": "**Method:** a mention is a keyword match on the description. A listing that says nothing may still expect you to speak the local language."
    },
    {
      "title": "Where are the Hindi speaking jobs?",
      "sub": "Language mentions by city, across 12 cities.",
      "paras": [
        "Hindi speaking jobs are not where you might expect. Bengaluru names Hindi in 8.7% of its descriptions, the highest of the twelve cities, with Delhi at 8.0%, Kolkata at 7.6% and Pune at 7.5%. Hyderabad is 6.5% and Noida 6.4%. Ahmedabad (3.2%), Chennai (3.6%) and Chandigarh (4.1%) are lowest. Mumbai is at 4.9%. Large pools in Delhi and the north may simply not mention Hindi because it is assumed, so read these as what employers choose to write.",
        "English follows its own map. Ahmedabad leads at 38.3%, then Jaipur 26.4%, Bengaluru 26.0%, Kolkata 25.4% and Chandigarh 24.8%. Chennai is lowest at 17.8% and Mumbai 19.6%. Mumbai (21,016 listings) and Bengaluru (20,817) are still the biggest pools overall."
      ],
      "chart": {
        "id": "reahjri97Cities",
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
          "City",
          "Listings with a description",
          "Mention English",
          "Mention Hindi"
        ],
        "rows": [
          [
            "Mumbai",
            "17,204",
            "19.6%",
            "4.9%"
          ],
          [
            "Bengaluru",
            "18,501",
            "26.0%",
            "8.7%"
          ],
          [
            "Chennai",
            "9,968",
            "17.8%",
            "3.6%"
          ],
          [
            "Hyderabad",
            "9,695",
            "24.4%",
            "6.5%"
          ],
          [
            "Delhi",
            "9,391",
            "23.9%",
            "8.0%"
          ],
          [
            "Pune",
            "8,297",
            "20.5%",
            "7.5%"
          ],
          [
            "Gurugram",
            "8,100",
            "22.8%",
            "5.5%"
          ],
          [
            "Ahmedabad",
            "7,005",
            "38.3%",
            "3.2%"
          ],
          [
            "Noida",
            "6,993",
            "24.5%",
            "6.4%"
          ],
          [
            "Kolkata",
            "3,562",
            "25.4%",
            "7.6%"
          ],
          [
            "Jaipur",
            "2,920",
            "26.4%",
            "6.1%"
          ],
          [
            "Chandigarh",
            "2,429",
            "24.8%",
            "4.1%"
          ]
        ]
      }
    },
    {
      "title": "Which communication skills jobs are open to freshers?",
      "sub": "The biggest role groups, and the terms that come with them.",
      "paras": [
        "Communication skills appear in 60.2% of descriptions, which makes it the most common ask in the whole index. The biggest role groups are also the most talk-heavy: customer service has 20,127 listings, HR 7,267, business development 6,891, hospitality 6,414 and relationship manager 5,839. Communication comes with terms to check. Targets appear in 20.5% of descriptions, night, rotational, US or UK shifts in 11.0% and incentives in 8.9%. Freshers is written in 21.8% and any graduate in 4.2%, so many of these roles accept new graduates.",
        "If you are strong in one language, aim at the roles that name it. If you are comfortable in two, you open more of the list. Telecaller (3,420 listings) and customer service together are where language is most clearly part of the job."
      ],
      "chart": {
        "id": "reahjri97Terms",
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
      "title": "Do jobs that need good English pay more?",
      "sub": "What stated pay shows, and what it cannot show.",
      "paras": [
        "We cannot say. Our pay figures are not split by language mention, and only 28.4% of jobs (43,254 of 152,469) state pay in rupees at all. Any claim that English pays more would be a guess. What we can show is the overall level. Of the jobs that state pay, 48.3% top out between ₹3 lakh and ₹5 lakh a year and 22.1% between ₹5 and 8 lakh. The median top of range is about ₹4 lakh. Only 719 listings (1.7%) reach ₹20 lakh or more.",
        "So treat language as a way into a role, not as a pay lever. Ask about pay at the first call, since the listing probably does not say."
      ],
      "chart": {
        "id": "reahjri97Pay",
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
      "title": "How do you get hired in an English or Hindi speaking job?",
      "sub": "Prove the language in your first message.",
      "paras": [
        "Write to the person who runs the team: the support manager for customer service, the sales head for business development, the HR head for HR. Write the email in the language the team uses. For a voice role, that is itself the proof. Attach one piece of work that shows your language. For customer service, a sample reply to an unhappy customer. For telecalling, a short call script you wrote. For content, a 150-word sample. Keep the email to three lines: who you are, what you made and a request for ten minutes. Follow up once.",
        "Stu does the slow parts: it finds the person who hires with a verified work email, writes a short personal email from your real work and sends it from your own inbox once you start a campaign."
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
      "q": "What are English speaking jobs for freshers?",
      "a": "They are roles where the listing names English, mainly business development (53.3% of descriptions), content writer (52.9%) and customer service (47.8%). Across all listings English is named in 21.8%."
    },
    {
      "q": "Which Hindi speaking jobs can a fresher get?",
      "a": "Telecaller roles lead, with 33.4% of descriptions naming Hindi. Customer service (11.3%), field sales (9.0%) and business development (8.8%) follow. Overall Hindi is named in 5.4% of listings."
    },
    {
      "q": "Which jobs need good English?",
      "a": "Business development, content writing, customer service and telecalling. Operations executive (31.4%) and general marketing (28.4%) come next. Relationship manager and hospitality listings mention English far less."
    },
    {
      "q": "Are there communication skills jobs for freshers?",
      "a": "Yes, they are the majority. Communication skills appear in 60.2% of the 147,916 listings with a description, and customer service alone has 20,127 listings."
    },
    {
      "q": "Do I need Hindi to work in Bengaluru or Chennai?",
      "a": "Often no. Hindi is named in 8.7% of Bengaluru and 3.6% of Chennai descriptions. English is named in 26.0% and 17.8%. Check the listing, since many do not state a language."
    },
    {
      "q": "Can I get a job with weak English?",
      "a": "Yes, in some roles. English is named in only 10.6% of relationship manager and 14.3% of hospitality descriptions. 12th pass is named in 4.1% of listings and any graduate in 4.2%."
    }
  ],
  "takeaway": {
    "sub": "How to read the language asks.",
    "items": [
      [
        "Skill over language",
        "Communication skills (60.2%) beat English (21.8%) and Hindi (5.4%) as an ask."
      ],
      [
        "Match role to language",
        "Hindi is a telecaller ask (33.4%), English a business development ask (53.3%)."
      ],
      [
        "Read the city",
        "Ahmedabad names English most (38.3%), Bengaluru Hindi most (8.7%)."
      ],
      [
        "Do not assume",
        "A listing that is silent may still expect a local language."
      ],
      [
        "Prove it in the email",
        "A well-written note to the manager is the best language test."
      ]
    ]
  },
  "related": [
    {
      "slug": "sales-jobs-with-incentives-freshers-2026",
      "kicker": "Data",
      "title": "Sales Jobs With Incentives 2026"
    },
    {
      "slug": "fresher-jobs-with-pf-and-health-insurance-2026",
      "kicker": "Data",
      "title": "Jobs With PF and Insurance for Freshers"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: English and Hindi Jobs for Freshers 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (English and Hindi in job listings), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-english-and-hindi-job-requirements-india-2026" place="report-end" size="card" title={"Want to write to the person who hires?"} line={"Tell Stu the role, the city and the pay you want. Stu finds jobs that fit you and who is hiring, with a verified work email. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
