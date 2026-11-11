import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "pay-transparency-fresher-jobs-india-2026",
  "title": "Jobs That Show Salary in India: Only 28.4% of Fresher Jobs Do, 2026",
  "short": "Fresher Jobs That Show Salary in India 2026",
  "description": "Jobs that show salary in India: only 28.4% of 152,469 October fresher jobs state pay in rupees. See which roles and cities are most open about it.",
  "keywords": "jobs that show salary, salary not mentioned in job description, pay transparency india, should i apply if salary not mentioned",
  "h1": "Jobs That Show Salary in India:",
  "h1em": "Who States Pay, and Who Does Not",
  "sub": "Only 28.4% of the 152,469 entry-level jobs in the Studojo Jobs Index for October 2026 state a salary in rupees. Among internships it is 2.1%. Academic counsellor and telecaller jobs state pay most often, and Ahmedabad leads the cities.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "**Jobs that show salary** are the minority: 43,254 of 152,469 entry-level jobs (28.4%) state pay in rupees in the Studojo Jobs Index, so about seven in ten say nothing.",
    "**Roles differ a lot**: 54.3% of academic counsellor jobs and 52.4% of telecaller jobs state pay, against 31.5% for HR and 26.6% for data analyst.",
    "**Cities differ too**: 44.9% of Ahmedabad jobs state pay, compared with 28.4% in Bengaluru and 27.7% in Mumbai, the two biggest cities.",
    "**When pay is shown, the median top of range is 4 lakh a year**, and 48.3% of stated salaries fall in the 3 to 5 lakh band. For internships, only 2.1% state a stipend, with a median of ₹15,000 a month.",
    "**The move that works** is to email the hiring manager and ask for the range before you invest time. Stu finds that person and writes the email for you."
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
      "title": "Which fresher jobs show the salary in India?",
      "sub": "Share of entry-level jobs that state pay, by role group.",
      "paras": [
        "The jobs that show salary most often are sales-style and counselling roles. 54.3% of academic counsellor jobs state pay, 52.4% of telecaller jobs, 43.8% of field sales and 40.8% of customer service. These are volume hirers, and a stated figure helps them fill seats.",
        "Mid-table roles include accountant at 38.9%, pharmacist at 36.9%, civil engineer at 35.5%, and lab and quality control at 34.3%. Management trainee is 33.9% and graduate engineer trainee 31.8%. HR and mechanical engineer are both 31.5%.",
        "The quietest are the ones you might expect to pay well. Operations executive is 30.7%, marketing 30.6%, interior designer 27.5%, teaching 27.5%, electrical and electronics engineer 26.9% and data analyst 26.6%. In none of these roles do more than a third of the listings say what the job pays. Roles with fewer than 200 jobs are left out."
      ],
      "table": {
        "head": [
          "Role group",
          "Entry-level jobs",
          "Share that state pay"
        ],
        "rows": [
          [
            "academic counsellor",
            "656",
            "54.3%"
          ],
          [
            "telecaller",
            "3,310",
            "52.4%"
          ],
          [
            "field sales",
            "5,007",
            "43.8%"
          ],
          [
            "customer service",
            "19,892",
            "40.8%"
          ],
          [
            "accountant",
            "2,521",
            "38.9%"
          ],
          [
            "pharmacist",
            "295",
            "36.9%"
          ],
          [
            "civil engineer",
            "583",
            "35.5%"
          ],
          [
            "lab and quality control",
            "726",
            "34.3%"
          ],
          [
            "management trainee",
            "507",
            "33.9%"
          ],
          [
            "graduate engineer trainee",
            "412",
            "31.8%"
          ],
          [
            "HR",
            "5,673",
            "31.5%"
          ],
          [
            "mechanical engineer",
            "917",
            "31.5%"
          ],
          [
            "operations executive",
            "2,253",
            "30.7%"
          ],
          [
            "marketing (general)",
            "1,338",
            "30.6%"
          ],
          [
            "interior designer",
            "512",
            "27.5%"
          ],
          [
            "teaching",
            "1,370",
            "27.5%"
          ],
          [
            "electrical and electronics engineer",
            "797",
            "26.9%"
          ],
          [
            "data analyst",
            "462",
            "26.6%"
          ]
        ],
        "note": "Rupee salaries only. Roles with fewer than 200 entry-level jobs left out."
      }
    },
    {
      "title": "Which cities are most open about pay?",
      "sub": "Share of entry-level jobs that state pay, by city.",
      "paras": [
        "Ahmedabad is the most open of the ten biggest cities: 44.9% of its 8,027 entry-level jobs state pay. Delhi follows at 38.0%, Kolkata at 37.4% and Noida at 35.6%. Chennai is 32.5% and Pune 31.9%.",
        "The two biggest markets are near the bottom. Bengaluru has 18,727 entry-level jobs and 28.4% state pay. Mumbai has 18,894 and 27.7%. Hyderabad is 28.9% and Gurugram 29.8%. So the cities with the most jobs say the least about what they pay.",
        "Use this to set expectations, not to pick a city. A listing with no pay in Mumbai is normal, not a warning sign. Also, a listing can name more than one city, 8,995 listings are marked remote and 11,816 name no city, so the counts are approximate."
      ],
      "chart": {
        "id": "rptfji289Cities",
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
          "Entry-level jobs",
          "Share that state pay"
        ],
        "rows": [
          [
            "Mumbai",
            "18,894",
            "27.7%"
          ],
          [
            "Bengaluru",
            "18,727",
            "28.4%"
          ],
          [
            "Chennai",
            "11,202",
            "32.5%"
          ],
          [
            "Hyderabad",
            "10,786",
            "28.9%"
          ],
          [
            "Delhi",
            "8,856",
            "38.0%"
          ],
          [
            "Pune",
            "8,698",
            "31.9%"
          ],
          [
            "Gurugram",
            "8,436",
            "29.8%"
          ],
          [
            "Ahmedabad",
            "8,027",
            "44.9%"
          ],
          [
            "Noida",
            "7,012",
            "35.6%"
          ],
          [
            "Kolkata",
            "3,704",
            "37.4%"
          ]
        ]
      }
    },
    {
      "title": "What do the salaries look like when jobs do state pay?",
      "sub": "Stated pay, top of range, in rupees.",
      "paras": [
        "When a job does state pay, the median top of range is 4 lakh a year. The lower quarter is 3 lakh and the upper quarter 5 lakh. Of the 43,254 jobs, 20,876 (48.3%) are in the 3 to 5 lakh band and 9,544 (22.1%) in 5 to 8 lakh.",
        "Below that, 7,490 (17.3%) are in 2 to 3 lakh and 2,283 (5.3%) under 2 lakh. Above, 1,733 (4.0%) reach 8 to 12 lakh, 609 (1.4%) reach 12 to 20 lakh and 719 (1.7%) are 20 lakh or more. Those top bands are a small tail.",
        "Internships are different. Only 385 of 18,458 internship listings (2.1%) state a stipend, and the median top of range is ₹15,000 a month. 180 of them (46.8%) sit between ₹10,000 and ₹20,000. If you are looking for a stipend, almost every listing will make you ask."
      ],
      "chart": {
        "id": "rptfji289Pay",
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
      },
      "callout": "**Lead:** 71.6% of entry-level jobs do not state pay. If it is missing, ask early."
    },
    {
      "title": "Should I apply if the salary is not mentioned?",
      "sub": "What listings with no stated pay usually say about the job.",
      "paras": [
        "Yes, you can apply, because most listings leave it out. With 71.6% of entry-level jobs silent, skipping them would rule out most of what exists. The better question is what the job says about how you are paid. Targets are named in 20.5% of described listings and incentives in 8.9%.",
        "Other terms add context. Freshers are welcome in 21.8%, night, rotational, US or UK shifts appear in 11.0%, work from office in 7.2%, PF, ESI or health insurance in 6.2% and immediate joining in 5.0%. Work from home is 4.1%. These tell you more about the job than a missing number does.",
        "Our rule: apply, but ask for the fixed pay and any variable part in your first message. Where listings were found matters little here. Naukri carries 53.7% of the index, LinkedIn 16.5%, company career sites 16.1%, Shine 7.8% and Internshala 5.9%. Of the 170,927 listings, 5.8% also hide the employer."
      ],
      "chart": {
        "id": "rptfji289Terms",
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
      "title": "How do you find out the pay before you apply?",
      "sub": "Ask the person who hires.",
      "paras": [
        "The person who can tell you the range is the hiring manager, the team lead or the HR head, not the portal. An average opening draws about 242 applications (Business Insider data cited by The Interview Guys, April 2026), so asking one specific question in a short email also sets you apart.",
        "Keep the email short. Say who you are, which role, one piece of real work you can show for it, and ask: what is the pay range for this role? Mention the city and your joining date. Follow up once after a few days. If the answer is a clear figure, you can decide with real numbers.",
        "Only 7.0% of descriptions print an email address, so the person is hard to reach by chance. Stu finds who hires, verifies their work email, writes a short personal note from your real work, and sends it from your own inbox once you start a campaign."
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
      "q": "What share of fresher jobs in India show the salary?",
      "a": "28.4% of entry-level jobs in the Studojo Jobs Index for October 2026 state pay in rupees: 43,254 of 152,469. For internships, only 2.1% state a stipend. Listings are not hires, and this is one month of data."
    },
    {
      "q": "Which fresher jobs most often show salary?",
      "a": "Academic counsellor (54.3%) and telecaller (52.4%) jobs state pay most often, then field sales (43.8%) and customer service (40.8%). Data analyst jobs (26.6%) are among the least open."
    },
    {
      "q": "Should I apply if the salary is not mentioned in the job description?",
      "a": "Yes, but ask for the range early. 71.6% of entry-level jobs do not state pay, so skipping them would cut out most listings. Ask the hiring manager for the fixed and variable parts."
    },
    {
      "q": "Which city has the most pay transparency for freshers?",
      "a": "Among the ten biggest cities, Ahmedabad: 44.9% of its entry-level jobs state pay. Delhi is 38.0% and Kolkata 37.4%. Mumbai is lowest at 27.7%, with Bengaluru at 28.4%."
    },
    {
      "q": "What is pay transparency in India, and is it required for job listings?",
      "a": "Pay transparency means a listing states the salary range. We only measure how often listings do so, not any rule. If you need to know whether a legal requirement applies, check official government sources."
    },
    {
      "q": "What is a typical stated salary for a fresher job in India?",
      "a": "Among jobs that state pay, the median top of range is 4 lakh a year, with the middle half between 3 and 5 lakh. 48.3% fall in the 3 to 5 lakh band. These are top-of-range figures, so offers can be lower."
    }
  ],
  "takeaway": {
    "sub": "Five points on pay in fresher listings.",
    "items": [
      [
        "Silence is normal",
        "71.6% of entry-level jobs state no pay, and 97.9% of internships state no stipend."
      ],
      [
        "Role matters",
        "Academic counsellor (54.3%) and telecaller (52.4%) state pay most, data analyst (26.6%) least."
      ],
      [
        "City matters too",
        "Ahmedabad (44.9%) leads and Mumbai (27.7%) trails among the ten biggest."
      ],
      [
        "Know the benchmark",
        "Median stated top of range is 4 lakh a year, or ₹15,000 a month for internships."
      ],
      [
        "Ask the hiring manager",
        "A short email asking for the range beats guessing."
      ]
    ]
  },
  "related": [
    {
      "slug": "fresher-jobs-list-india-2026",
      "kicker": "Data",
      "title": "Fresher Jobs List India 2026"
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
    "name": "Studojo Jobs Index, October 2026: Fresher Jobs That Show Salary in India 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (which fresher jobs state the salary), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-pay-transparency-fresher-jobs-india-2026" place="report-end" size="card" title={"Want to ask the hiring manager about pay?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email, and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
