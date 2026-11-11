import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "accountant-jobs-for-freshers-india-2026",
  "title": "Accountant Jobs for Freshers in India: 2,738 Listings Analysed 2026",
  "short": "Accountant Jobs for Freshers 2026",
  "description": "Accountant jobs for freshers: 2,738 October listings in the Studojo Jobs Index, 2,521 of them full-time. See titles, stated pay, Tally, GST and Excel demand.",
  "keywords": "accountant jobs for freshers, accountant fresher salary, accountant jobs in india 2026, how to get a accountant job as a fresher, accountant internship",
  "h1": "Accountant Jobs for Freshers in India:",
  "h1em": "What 2,738 Listings Show",
  "sub": "We track 2,738 accountant jobs for freshers posted in October 2026, and 2,521 are full-time. Excel, GST and Tally each appear in about 46% to 50% of descriptions. 980 jobs state a salary, with a median of ₹3 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · accountant · freshers and interns",
  "findings": [
    "The Studojo Jobs Index has **2,738 accountant jobs for freshers** for October 2026, and only 217 are internships (7.9%), so this is mostly a full-time field.",
    "**Excel, GST and Tally are the trio.** Excel appears in 49.5% of descriptions, GST in 45.8% and Tally in 45.5%, while SAP is named in only 5.1%.",
    "**More listings state pay than in most fields.** 980 of 2,521 jobs (38.9%) state a salary, the median top of range is ₹3 lakh a year, and 409 sit in the ₹3 to 5 lakh band.",
    "**BCom is the degree to have.** 22.0% of descriptions mention BCom, against 1.5% for BTech, and 13.7% say freshers.",
    "**Email the finance head with a clean reconciliation.** 255 listings (10.0%) include an email address, so send proof of Tally and GST work to the accounts manager or finance controller."
  ],
  "stats": [
    {
      "num": "2,738",
      "label": "Accountant listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 980 jobs that state it (38.9%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "49.5%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are accountant jobs for freshers called?",
      "sub": "Plain Accountant is by far the biggest title.",
      "paras": [
        "Accountant has 474 listings (17.3%). Accounts Executive has 194 (7.1%), Junior Accountant has 157 (5.7%) and Chartered Accountant has 96 (3.5%). Accounts Assistant has 33 and Senior Accountant has 36.",
        "Read the lower rungs carefully. Accounting Services Associate I has 53 listings and Accountant Cum Office Assistant has 37, which means bookkeeping with front-office duties. Chartered Accountant listings expect the qualification, so they suit CA freshers, not everyone with a degree.",
        "The 2,738 listings come from 1,959 employers, and the top 10 hold 10.5%, so this is a very open field. Another 98 listings (3.6%) do not name the employer."
      ],
      "chart": {
        "id": "rajffi24Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=2,738)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          2521,
          217
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
            "Accountant",
            "474"
          ],
          [
            "Accounts Executive",
            "194"
          ],
          [
            "Junior Accountant",
            "157"
          ],
          [
            "Chartered Accountant",
            "96"
          ],
          [
            "Accounting Services Associate I",
            "53"
          ],
          [
            "Accountant Cum Office Assistant",
            "37"
          ],
          [
            "Senior Accountant",
            "36"
          ],
          [
            "Accountant/ Accounts Executive",
            "35"
          ],
          [
            "Accounts Assistant",
            "33"
          ],
          [
            "Accounting Services Associate Iii",
            "29"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 1,959 different employers posted these listings, and 3.6% of listings do not name the employer."
      }
    },
    {
      "title": "Where are accountant jobs in India for freshers?",
      "sub": "Mumbai leads, and Ahmedabad and Kochi punch above their size.",
      "paras": [
        "Mumbai has 387 listings (14.1%), Bengaluru has 300 (11.0%), Delhi has 214 (7.8%) and Ahmedabad has 208 (7.6%). Chennai and Hyderabad have 160 and 158, and Pune has 152. A listing can name more than one city.",
        "Ahmedabad ahead of Chennai, Hyderabad and Pune is worth noting. Kochi has 85 listings (3.1%) and makes the top 10, which is rare for a southern city outside the big four.",
        "Remote accounting is almost absent. Only 56 listings are marked remote (2.0%) and 113 name no city. You will need to be near an office, so check the location in the first line of each listing."
      ],
      "chart": {
        "id": "rajffi24Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=2,738)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Delhi",
          "Ahmedabad",
          "Chennai",
          "Hyderabad",
          "Pune",
          "Gurugram",
          "Noida",
          "Kochi"
        ],
        "values": [
          387,
          300,
          214,
          208,
          160,
          158,
          152,
          111,
          108,
          85
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
            "387",
            "14.1%"
          ],
          [
            "Bengaluru",
            "300",
            "11.0%"
          ],
          [
            "Delhi",
            "214",
            "7.8%"
          ],
          [
            "Ahmedabad",
            "208",
            "7.6%"
          ],
          [
            "Chennai",
            "160",
            "5.8%"
          ],
          [
            "Hyderabad",
            "158",
            "5.8%"
          ],
          [
            "Pune",
            "152",
            "5.6%"
          ],
          [
            "Gurugram",
            "111",
            "4.1%"
          ],
          [
            "Noida",
            "108",
            "3.9%"
          ],
          [
            "Kochi",
            "85",
            "3.1%"
          ]
        ],
        "note": "A listing can name more than one city. 56 listings are marked remote and 113 name no city."
      }
    },
    {
      "title": "What is an accountant fresher salary in India?",
      "sub": "The best-stated pay data of the roles we track, but still modest.",
      "paras": [
        "980 of the 2,521 jobs state a salary in rupees, which is 38.9%. The median top of range is ₹3 lakh a year, with the middle half between ₹2.4 lakh and ₹4 lakh.",
        "The ₹3 to 5 lakh band has 409 listings, ₹2 to 3 lakh has 279 and under ₹2 lakh has 122. Higher up, 85 state ₹5 to 8 lakh, 54 state ₹8 to 12 lakh and 31 state ₹12 to 20 lakh. Those top bands are most likely senior or CA-qualified roles.",
        "Internship pay is nearly invisible. Only 8 of 217 internships state a stipend (3.7%), and 6 of those are ₹10,000 to 20,000 a month. If an accounting internship does not tell you the stipend, ask."
      ],
      "chart": {
        "id": "rajffi24Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (980 jobs that state pay in rupees)",
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
          122,
          279,
          409,
          85,
          54,
          31,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "Which skills do accountant jobs ask freshers for?",
      "sub": "Excel, GST and Tally, and not much else.",
      "paras": [
        "Of the 2,541 listings with a full description, Excel appears in 49.5%, GST in 45.8% and Tally in 45.5%. Communication skills follow at 40.3%. SAP is named in 5.1% and Hindi in 2.8%.",
        "The gap between those three and everything else is sharp. Power BI is named in 0.7% and SQL in 0.6%. If you can close a month in Tally and prepare a GST return, you meet more of what the listings ask for than someone with a data certificate.",
        "On conditions, BCom appears in 22.0%, freshers in 13.7% and MBA or PGDM in 6.6%. Work from office is named in 6.5% and PF, ESI or health insurance in 6.5%. A certificate is mentioned in 4.8%, so hands-on software skill matters more than another course."
      ],
      "chart": {
        "id": "rajffi24Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (2,541 listings with a full description)",
        "labels": [
          "Excel",
          "GST",
          "Tally",
          "communication skills",
          "English",
          "SAP",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "ChatGPT or AI tools",
          "negotiation"
        ],
        "values": [
          49.5,
          45.8,
          45.5,
          40.3,
          15.2,
          5.1,
          2.8,
          1.3,
          1.2,
          1.1
        ],
        "unit": "%"
      },
      "callout": "**Learn in this order:** Tally and Excel first, GST second, SAP only if a team you want uses it."
    },
    {
      "title": "How do you get hired as an accountant fresher?",
      "sub": "Send one clean reconciliation to the person who signs off the books.",
      "paras": [
        "Portals are crowded. An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). But 255 of our 2,738 listings put an email address in the text, one of the highest shares we see.",
        "Write to the accounts manager, finance controller or finance head. At a small firm, write to the owner or the practising CA. Send a one-page sample: a bank reconciliation, a Tally trial balance or a GST summary, built on dummy data and labelled clearly as practice. Neatness is the proof.",
        "Keep the email to three lines: who you are, what the sample shows, and one question about their month-end. Follow up once. Stu, the AI career agent from Studojo, finds who is hiring, verifies their work email and drafts the note, which goes from your own inbox only when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **2,738 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as accountant when its job title matches that role (the most common titles here: \"Accountant\", \"Accounts Executive\", \"Junior Accountant\").",
    "Pay: 980 of 2,521 entry-level listings (38.9%) state a salary in rupees and 8 of 217 internships (3.7%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 2,541 listings (92.8%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many accountant jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 2,738 accountant listings for freshers posted in October 2026: 2,521 jobs and 217 internships. They are listings we track, not hires."
    },
    {
      "q": "What is the accountant fresher salary in India?",
      "a": "Of 2,521 jobs, 980 state a salary in rupees. The median top of range is ₹3 lakh a year and the middle half is ₹2.4 lakh to ₹4 lakh. About 61% do not state pay."
    },
    {
      "q": "Which software should an accountant fresher learn?",
      "a": "Excel (49.5% of full descriptions), GST knowledge (45.8%) and Tally (45.5%). SAP appears in 5.1%. Learn Tally and Excel first, since they cover most of the demand."
    },
    {
      "q": "Do you need a BCom to get an accountant job?",
      "a": "It helps. 22.0% of full descriptions mention BCom, 3.8% mention BBA and 6.6% mention MBA or PGDM. Only 0.7% say any graduate, so the degree matters more here than in sales."
    },
    {
      "q": "Are there accountant internships for freshers?",
      "a": "Few. Only 217 of the 2,738 listings are internships (7.9%), and 8 state a stipend. The median top of range among them is ₹14,792 a month."
    },
    {
      "q": "Which cities have the most accountant jobs for freshers?",
      "a": "Mumbai leads with 387 listings (14.1%), then Bengaluru with 300, Delhi with 214 and Ahmedabad with 208. Remote roles are rare: 56 listings carry the flag."
    }
  ],
  "takeaway": {
    "sub": "What the 2,738 October listings say about accounting.",
    "items": [
      [
        "Be strong in Tally, GST and Excel",
        "They appear in 45.5%, 45.8% and 49.5% of descriptions."
      ],
      [
        "Search Accounts Executive too",
        "It is the second biggest title, with 194 listings."
      ],
      [
        "Expect an office",
        "Only 56 listings are marked remote."
      ],
      [
        "Use the stated pay",
        "980 jobs state a salary, and the median top of range is ₹3 lakh a year."
      ],
      [
        "Email a clean sample",
        "A tidy reconciliation sent to the finance head is easy to judge in a minute."
      ]
    ]
  },
  "related": [
    {
      "slug": "financial-analyst-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Finance Jobs for Freshers 2026"
    },
    {
      "slug": "audit-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Audit Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Accountant Jobs for Freshers 2026",
    "description": "2,738 active entry-level and internship listings for India posted in October 2026 (accountant), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-accountant-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the finance head directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the person who hires, verifies their work email, and nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
