import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "fresher-salary-india-2026",
  "title": "Fresher Salary in India 2026: Pay by Role and City, 43,254 Listings",
  "short": "Fresher Salary in India 2026",
  "description": "Fresher salary in India 2026: median stated pay is 4 lakh a year across 43,254 listings, from 2.8 lakh in hospitality to 4.5 lakh in tech support.",
  "keywords": "fresher salary in india 2026, average fresher salary india, fresher salary per month, entry level salary india",
  "h1": "Fresher Salary in India:",
  "h1em": "What 43,254 Listings State",
  "sub": "Across October 2026 listings in the Studojo Jobs Index, 43,254 entry-level jobs state pay in rupees. The median is 4 lakh a year, and the middle half runs from 3 lakh to 5 lakh. Role and city move it more than anything else.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "Fresher salary in India has a clear centre: **a median of 4 lakh a year** across the 43,254 jobs (28.4% of 152,469) that state pay in rupees.",
    "**Pay by role runs from 2.8 lakh to 4.5 lakh.** Hotel and hospitality has the lowest median at 2.8 lakh, while technical support and academic counsellor are highest at 4.5 lakh.",
    "**Pay by city is closer than you would expect.** Noida has the highest median at 4.5 lakh and Gurugram follows at 4.3 lakh, while Mumbai, Pune and Kolkata sit at 3.8 lakh.",
    "**Internship stipends are rarely stated.** 385 of 18,458 internships (2.1%) give a stipend, and the median is ₹15,000 a month.",
    "**The move that works is to email the person who runs the team.** Stu finds who hires, verifies their work email and sends your note from your own inbox once you start a campaign."
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
      "title": "What is the average fresher salary in India by role?",
      "sub": "Median stated pay for the 16 biggest role groups",
      "paras": [
        "The median stated fresher salary is 4 lakh a year, and the middle half runs from 3 lakh to 5 lakh. The table breaks it down by role group. Customer service is the biggest, with 8,122 jobs stating pay and a median of 4 lakh, and a middle half of 3.2 lakh to 4.8 lakh.",
        "The top of the table is academic counsellor and technical support, both at a median of 4.5 lakh. Relationship manager is at 4.2 lakh and business development at 4.1 lakh, though business development has a wide middle half of 3 lakh to 5.4 lakh. Process associate sits at 4 lakh.",
        "At the bottom, hotel and hospitality has a median of 2.8 lakh, and accountant and retail sales are at 3 lakh. HR and telecaller are both at 3.2 lakh, supply chain at 3.2 lakh, field sales at 3.6 lakh, and marketing-executive, operations executive and teaching at 3.5 lakh. Every figure is the top of a stated range, annualised, so the first offer may sit lower."
      ],
      "chart": {
        "id": "rfsi287Pay",
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
      "table": {
        "head": [
          "Role group",
          "Jobs stating pay",
          "Median, per year",
          "Middle half"
        ],
        "rows": [
          [
            "customer service",
            "8,122",
            "4 lakh",
            "3.2 lakh to 4.8 lakh"
          ],
          [
            "field sales",
            "2,195",
            "3.6 lakh",
            "3 lakh to 4.8 lakh"
          ],
          [
            "HR",
            "1,785",
            "3.2 lakh",
            "2.5 lakh to 4.2 lakh"
          ],
          [
            "telecaller",
            "1,733",
            "3.2 lakh",
            "2.4 lakh to 3.8 lakh"
          ],
          [
            "relationship manager",
            "1,468",
            "4.2 lakh",
            "3.5 lakh to 5.5 lakh"
          ],
          [
            "accountant",
            "980",
            "3 lakh",
            "2.4 lakh to 4 lakh"
          ],
          [
            "business development",
            "817",
            "4.1 lakh",
            "3 lakh to 5.4 lakh"
          ],
          [
            "operations executive",
            "691",
            "3.5 lakh",
            "2.5 lakh to 4.8 lakh"
          ],
          [
            "retail sales",
            "628",
            "3 lakh",
            "2.5 lakh to 4 lakh"
          ],
          [
            "process associate",
            "622",
            "4 lakh",
            "3 lakh to 4.8 lakh"
          ],
          [
            "hotel and hospitality",
            "593",
            "2.8 lakh",
            "2.1 lakh to 3.8 lakh"
          ],
          [
            "technical support",
            "423",
            "4.5 lakh",
            "3 lakh to 5.5 lakh"
          ],
          [
            "marketing (general)",
            "409",
            "3.5 lakh",
            "2.8 lakh to 4.7 lakh"
          ],
          [
            "teaching",
            "377",
            "3.5 lakh",
            "2.5 lakh to 5 lakh"
          ],
          [
            "academic counsellor",
            "356",
            "4.5 lakh",
            "3.5 lakh to 6 lakh"
          ],
          [
            "supply chain and logistics",
            "332",
            "3.2 lakh",
            "2.6 lakh to 4 lakh"
          ]
        ],
        "note": "Top of each stated salary range, annualised, rupees only. Middle half = 25th to 75th percentile."
      },
      "callout": "**Lead:** The middle half matters more than the median. A role with a wide band, such as business development (3 lakh to 5.4 lakh), rewards you for negotiating."
    },
    {
      "title": "What is the fresher salary in India by city?",
      "sub": "Median stated pay in the ten biggest cities",
      "paras": [
        "Fresher salary varies by city, but less than by role. Noida has the highest median at 4.5 lakh a year (2,497 jobs stating pay). Gurugram is at 4.3 lakh (2,517), and Bengaluru, Hyderabad and Ahmedabad are all at 4.2 lakh. Chennai and Delhi are at 4 lakh.",
        "Mumbai, Pune and Kolkata come in at 3.8 lakh. Mumbai has 5,239 jobs stating pay, the second most after Bengaluru's 5,311, so its number is not a small-sample effect. Ahmedabad is a surprise: it has 3,604 jobs stating pay and a median of 4.2 lakh, above Mumbai.",
        "Remember that each city's median reflects its job mix. A city with many customer service listings and few tech roles will show a lower figure, and the figure says nothing about living costs. Mumbai (21,016 listings) and Bengaluru (20,817) lead on volume, and 8,995 listings overall are marked remote."
      ],
      "chart": {
        "id": "rfsi287Cities",
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
          "Jobs stating pay",
          "Median, per year"
        ],
        "rows": [
          [
            "Mumbai",
            "5,239",
            "3.8 lakh"
          ],
          [
            "Bengaluru",
            "5,311",
            "4.2 lakh"
          ],
          [
            "Chennai",
            "3,638",
            "4 lakh"
          ],
          [
            "Hyderabad",
            "3,118",
            "4.2 lakh"
          ],
          [
            "Delhi",
            "3,366",
            "4 lakh"
          ],
          [
            "Pune",
            "2,774",
            "3.8 lakh"
          ],
          [
            "Gurugram",
            "2,517",
            "4.3 lakh"
          ],
          [
            "Ahmedabad",
            "3,604",
            "4.2 lakh"
          ],
          [
            "Noida",
            "2,497",
            "4.5 lakh"
          ],
          [
            "Kolkata",
            "1,386",
            "3.8 lakh"
          ]
        ]
      }
    },
    {
      "title": "How much do internships pay in India?",
      "sub": "385 of 18,458 internships state a stipend",
      "paras": [
        "Most internship listings do not say what they pay. Of 18,458 internships, 385 state a stipend in rupees, which is 2.1%. The median of the top of those ranges is ₹15,000 a month, so ask before you accept.",
        "The chart shows 180 stipends at ₹10,000 to 20,000 a month (46.8%), 98 at ₹20,000 to 40,000 (25.5%), 70 at ₹5,000 to 10,000 (18.2%), 21 at ₹40,000 or more (5.5%) and 16 under ₹5,000 (4.2%). Only a thin slice of the market says what it pays, so the sample is the employers who chose to show it.",
        "Do not read a stipend as a salary guide: it pays for a few months of learning, not a full-time role. Use ₹15,000 as a reference when an offer states nothing, and ask what the internship can turn into, including a pre-placement offer, before you decide."
      ],
      "chart": {
        "id": "rfsi287Stipend",
        "kind": "bar",
        "label": "Stated stipend, top of range, per month (385 internships that state pay in rupees)",
        "labels": [
          "under ₹5,000",
          "₹5,000 to 10,000",
          "₹10,000 to 20,000",
          "₹20,000 to 40,000",
          "₹40,000 or more"
        ],
        "values": [
          16,
          70,
          180,
          98,
          21
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** Ask any internship for the monthly figure, the hours and the manager in writing. If they will not say, you have your answer."
    },
    {
      "title": "What do employers ask for at the fresher salary level?",
      "sub": "Role groups by volume and the skills in the descriptions",
      "paras": [
        "Volume and pay are not the same thing. Customer service has 20,127 listings (11.8% of everything we track), then HR with 7,267 (4.3%), business development with 6,891 (4.0%), hotel and hospitality with 6,414 (3.8%) and relationship manager with 5,839 (3.4%). Field sales has 5,137 (3.0%).",
        "Communication skills appear in 60.2% of the 147,916 listings with a full description. English is in 21.8%, Excel in 13.7%, calling or telecalling in 10.4% and CRM tools in 9.0%. Negotiation and social media are at 7.2% each, Hindi at 5.4%, cloud at 3.3% and Python at 3.1%.",
        "The terms tell you how the pay is made. Freshers are mentioned in 21.8% of listings, targets in 20.5%, shifts in 11.0% and incentives in 8.9%. If a role mentions targets and incentives, part of the stated range is variable. Ask for the fixed amount."
      ],
      "chart": {
        "id": "rfsi287Skills",
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
      "title": "How do you get a better fresher salary in India?",
      "sub": "Who to email and what to send",
      "paras": [
        "Email the person who runs the team, and do it before the listing is filled. For customer service, that is the process manager or operations head. For sales, the sales or branch head. For tech support, the support lead. 10,399 listings (7.0%) include an email in the description, so check there first and then find the manager.",
        "Send one piece of real work that shows you can do the job at the higher end of the band: a clean Excel sheet, a sample support reply, a prospect list or a short plan. Write three short lines: who you are, what you attached and one question. Then ask about the fixed pay, the variable part and the review date, not only the headline range.",
        "Follow up once and stop. Studojo built Stu to do the slow parts: it finds who hires, verifies their work email, writes a personal note and sends it from your own inbox once you start a campaign. You tell Stu the role, the city and the pay you want. It does not mass apply and does not promise replies."
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
      "q": "What is the average fresher salary in India?",
      "a": "Among 43,254 jobs that state pay in rupees, the median is 4 lakh a year and the middle half runs from 3 lakh to 5 lakh. These are the top of stated ranges, annualised, and only 28.4% of jobs state pay."
    },
    {
      "q": "What is the fresher salary per month in India?",
      "a": "Divide the yearly figure by twelve. The median stated pay is 4 lakh a year, and the middle half is 3 lakh to 5 lakh a year. For internships, the median stated stipend is ₹15,000 a month."
    },
    {
      "q": "Which fresher jobs pay the most?",
      "a": "By median stated pay, academic counsellor and technical support lead at 4.5 lakh a year. Relationship manager is at 4.2 lakh and business development at 4.1 lakh. Hotel and hospitality is lowest at 2.8 lakh."
    },
    {
      "q": "Which city pays freshers the most?",
      "a": "Noida has the highest median stated pay at 4.5 lakh a year, then Gurugram at 4.3 lakh. Mumbai, Pune and Kolkata are at 3.8 lakh. A city's figure reflects its mix of jobs."
    },
    {
      "q": "What is the entry level salary in India for internships?",
      "a": "Only 385 of 18,458 internships state a stipend, and the median is ₹15,000 a month. 180 of them top out at ₹10,000 to 20,000."
    },
    {
      "q": "How many fresher jobs state their salary?",
      "a": "43,254 of 152,469 entry-level jobs state pay in rupees, which is 28.4%. The other listings give no figure, so ask before you accept."
    }
  ],
  "takeaway": {
    "sub": "What to remember about fresher salary in India",
    "items": [
      [
        "The median is 4 lakh",
        "43,254 jobs state pay, and the middle half is 3 lakh to 5 lakh a year."
      ],
      [
        "Role beats city",
        "Roles range from 2.8 lakh to 4.5 lakh. Cities range from 3.8 lakh to 4.5 lakh."
      ],
      [
        "Noida and Gurugram lead",
        "4.5 lakh and 4.3 lakh, against 3.8 lakh in Mumbai."
      ],
      [
        "Stipends are rarely stated",
        "385 of 18,458 internships give one, with a median of ₹15,000 a month."
      ],
      [
        "Ask for the fixed pay",
        "Targets and incentives are in many listings, so separate fixed from variable."
      ]
    ]
  },
  "related": [
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "pay-transparency-fresher-jobs-india-2026",
      "kicker": "Data",
      "title": "Fresher Jobs That Show Salary in India 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Fresher Salary in India 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (fresher salary in India), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-fresher-salary-india-2026" place="report-end" size="card" title={"Want to email who hires at the pay you want?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a personal note. Nothing is sent until you start a campaign."} />
    </DataReport>
  );
}
