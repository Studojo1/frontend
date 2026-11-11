import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "operations-executive-jobs-for-freshers-india-2026",
  "title": "Operations Executive Jobs for Freshers in India: 2,663 Listings, 2026",
  "short": "Operations Executive Jobs 2026",
  "description": "Operations executive jobs for freshers in India: 2,663 October listings, 29.0% say freshers, median stated pay ₹3.5 lakh a year. Cities, skills, how to get hired.",
  "keywords": "operations executive jobs for freshers, operations executive fresher salary, operations executive jobs in india 2026, how to get a operations executive job as a fresher, operations executive internship",
  "h1": "Operations Executive Jobs for Freshers in India:",
  "h1em": "What 2,663 Listings Show",
  "sub": "Operations executive jobs for freshers number 2,663 October listings in the Studojo Jobs Index, 2,253 jobs and 410 internships. 30.7% of the jobs state pay, with a median top of range of ₹3.5 lakh a year, and 21.6% of descriptions mention shifts.",
  "published": "2026-11-11",
  "scope": "India · operations executive · freshers and interns",
  "findings": [
    "**Operations executive jobs for freshers are a high-volume field**: 2,663 October listings from 1,330 different employers, with Operations Executive (174) and Back Office Executive (164) the top two titles.",
    "**Pay is stated more often here than in most roles**: 691 jobs (30.7%) give a figure, with a median top of range of ₹3.5 lakh a year and 49.1% sitting in the ₹3 to 5 lakh band.",
    "**Shifts are a real condition**: 21.6% of listings with a full description mention night, rotational, US or UK shifts, so read the description before you apply.",
    "**Communication beats software**: 64.6% mention communication skills and 41.2% mention Excel, while 29.0% say freshers are welcome.",
    "**The way in is the operations manager, not the portal**: one email to the person who runs the team, with one process you improved. Stu finds that person and writes that email from your own inbox."
  ],
  "stats": [
    {
      "num": "2,663",
      "label": "Operations executive listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 691 jobs that state it (30.7%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "41.2%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are operations executive jobs called, and who posts them?",
      "sub": "One label covers back office, banking, sales and procurement work.",
      "paras": [
        "Operations executive jobs for freshers hide under many titles. Operations Executive has 174 listings and Back Office Executive has 164. After that the titles split by function: Banking Operations Associate 90, Sales Operations Associate 87, Procurement Operations Associate 77 and Learning Operations Associate 57.",
        "Read the function, not the label. A Back Office Executive in a logistics firm and a Capital Markets Operations Associate (42 listings) share a word and almost nothing else. Pick the function you can explain in one sentence, and search that title.",
        "On the employer side, 1,330 different employers posted these listings. The top ten account for 28.5% of the set, higher than in most roles, and 6.7% of listings do not name the employer. 2,253 are jobs and 410 are internships, so internships are 15.4% of the field."
      ],
      "chart": {
        "id": "roejffi11Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=2,663)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          2253,
          410
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
            "Operations Executive",
            "174"
          ],
          [
            "Back Office Executive",
            "164"
          ],
          [
            "Operations Internship",
            "91"
          ],
          [
            "Banking Operations Associate",
            "90"
          ],
          [
            "Sales Operations Associate",
            "87"
          ],
          [
            "Procurement Operations Associate",
            "77"
          ],
          [
            "Operations Intern",
            "62"
          ],
          [
            "Learning Operations Associate",
            "57"
          ],
          [
            "Operations Associate",
            "55"
          ],
          [
            "Capital Markets Operations Associate",
            "42"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 1,330 different employers posted these listings, and 6.7% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have the most operations executive jobs?",
      "sub": "Bengaluru and Mumbai lead, but Gujarat punches above its size.",
      "paras": [
        "Bengaluru has 435 listings (16.3%) and Mumbai has 386 (14.5%). The surprise is third place: Vadodara with 198 listings (7.4%), just ahead of Chennai with 195 (7.3%). Ahmedabad adds 167 (6.3%), so two Gujarat cities sit in the top five.",
        "Gurugram has 154, Hyderabad 148, Delhi 139, Noida 132 and Pune 105. If you are in Gujarat, you do not need to relocate to find operations work, and the same logic holds for the Delhi NCR belt.",
        "Remote is rare: 157 listings (5.9%) are marked remote, and 149 name no city. A listing can name more than one city, so the table counts overlap."
      ],
      "chart": {
        "id": "roejffi11Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=2,663)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Vadodara",
          "Chennai",
          "Ahmedabad",
          "Gurugram",
          "Hyderabad",
          "Delhi",
          "Noida",
          "Pune"
        ],
        "values": [
          435,
          386,
          198,
          195,
          167,
          154,
          148,
          139,
          132,
          105
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
            "435",
            "16.3%"
          ],
          [
            "Mumbai",
            "386",
            "14.5%"
          ],
          [
            "Vadodara",
            "198",
            "7.4%"
          ],
          [
            "Chennai",
            "195",
            "7.3%"
          ],
          [
            "Ahmedabad",
            "167",
            "6.3%"
          ],
          [
            "Gurugram",
            "154",
            "5.8%"
          ],
          [
            "Hyderabad",
            "148",
            "5.6%"
          ],
          [
            "Delhi",
            "139",
            "5.2%"
          ],
          [
            "Noida",
            "132",
            "5.0%"
          ],
          [
            "Pune",
            "105",
            "3.9%"
          ]
        ],
        "note": "A listing can name more than one city. 157 listings are marked remote and 149 name no city."
      }
    },
    {
      "title": "What is the operations executive fresher salary in India?",
      "sub": "30.7% of jobs state it, and most cluster between ₹2 and 5 lakh.",
      "paras": [
        "691 of 2,253 jobs state pay in rupees. The median top of range is ₹3.5 lakh a year and the middle half runs from ₹2.5 lakh to ₹4.8 lakh. The ₹3 to 5 lakh band holds 339 jobs (49.1%), the ₹2 to 3 lakh band holds 202 (29.2%), and 49 (7.1%) sit under ₹2 lakh.",
        "Above that, 78 jobs (11.3%) reach ₹5 to 8 lakh, 22 reach ₹8 to 12 lakh and 1 reaches ₹12 to 20 lakh. These are tops of ranges, so your starting figure may be lower. 69.3% of jobs state nothing.",
        "Internship pay is nearly silent: 9 of 410 internships state a stipend (2.2%), with a median of ₹15,000 a month. Seven of the nine sit between ₹10,000 and ₹20,000."
      ],
      "chart": {
        "id": "roejffi11Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (691 jobs that state pay in rupees)",
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
          49,
          202,
          339,
          78,
          22,
          1,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do operations executive listings ask for?",
      "sub": "Communication, Excel and English, plus a lot of shift work.",
      "paras": [
        "Among the 2,348 listings with a full description, communication skills appear in 64.6%, Excel in 41.2% and English in 31.4%. CRM tools show up in 8.2% and cloud tools (AWS, Azure, GCP) in only 1.4%. Negotiation is in 5.5% and Hindi in 5.4%.",
        "The terms chart is the one to study. 29.0% say freshers and 21.6% mention night, rotational, US or UK shifts. 10.1% say work from office, 8.8% mention targets and 8.1% mention incentives. 4.9% mention cab or transport, which is worth checking if you are travelling far.",
        "On qualifications, 8.8% mention BCom, 4.8% BTech or BE and 4.7% BBA. 5.5% say 12th pass, so some roles do not need a degree. A certificate is mentioned in 8.2%."
      ],
      "chart": {
        "id": "roejffi11Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (2,348 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "Hindi",
          "calling or telecalling",
          "ChatGPT or AI tools",
          "social media",
          "SAP"
        ],
        "values": [
          64.6,
          41.2,
          31.4,
          8.2,
          5.5,
          5.4,
          4.2,
          3.2,
          3.1,
          2.2
        ],
        "unit": "%"
      },
      "callout": "**Check the shift line:** one in five descriptions mentions rotational or international shifts, so confirm hours before you accept."
    },
    {
      "title": "How do you get hired as an operations executive fresher?",
      "sub": "Show a process you made smoother, to the person who owns it.",
      "paras": [
        "Online applications for operations roles go into a large queue. The Interview Guys (April 2026) cite roughly 0.1% to 2% as the typical success rate of an online application, so a plan that is only applications is a long shot. A short email to the right manager changes who reads you.",
        "Email the operations manager, the head of back office, or the team lead for the process you want, not the general HR address. Attach one proof: a one-page flowchart of how a task (say, order processing) runs and where it stalls, or an Excel tracker you built that cuts a manual step. Real work on a small process says more than a list of skills.",
        "Write three lines: your name and course, the one process you mapped and the fix you would try, and a request for a short call. Follow up once after a week. Stu handles the slow parts: it finds the manager with a verified work email, writes the note from your real work, and sends from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **2,663 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as operations executive when its job title matches that role (the most common titles here: \"Operations Executive\", \"Back Office Executive\", \"Operations Internship\").",
    "Pay: 691 of 2,253 entry-level listings (30.7%) state a salary in rupees and 9 of 410 internships (2.2%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 2,348 listings (88.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many operations executive jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 2,663 October 2026 listings for operations executive roles at entry level or internship: 2,253 jobs and 410 internships. That counts listings we track, not hires or the whole market."
    },
    {
      "q": "What is the operations executive fresher salary?",
      "a": "Of the 691 jobs that state pay, the median top of range is ₹3.5 lakh a year, with the middle half between ₹2.5 lakh and ₹4.8 lakh. 30.7% of jobs state pay, so many offers are not visible."
    },
    {
      "q": "Do operations executive jobs involve night shifts?",
      "a": "Some do. 21.6% of listings with a full description mention night, rotational, US or UK shifts, and 4.9% mention cab or transport. Always read the shift line before applying."
    },
    {
      "q": "Can a 12th pass candidate get an operations job?",
      "a": "Some listings allow it: 5.5% of descriptions mention 12th pass. More ask for a degree, with 8.8% naming BCom and 4.7% naming BBA."
    },
    {
      "q": "Is there an operations executive internship for freshers?",
      "a": "Yes. 410 of the 2,663 listings are internships (15.4%), such as Operations Internship (91) and Operations Intern (62). Only 9 state a stipend, with a median of ₹15,000 a month."
    },
    {
      "q": "Which city has the most operations executive jobs in India 2026?",
      "a": "Bengaluru has the most with 435 listings (16.3%), then Mumbai with 386 (14.5%) and Vadodara with 198 (7.4%)."
    }
  ],
  "takeaway": {
    "sub": "Five moves for your operations search.",
    "items": [
      [
        "Pick a function",
        "Banking, sales, procurement or back office: pick one so your pitch is specific."
      ],
      [
        "Get good at Excel",
        "41.2% of descriptions mention it, and it is the easiest proof to attach."
      ],
      [
        "Check shifts and targets",
        "21.6% mention shifts and 8.8% mention targets, so read the full listing."
      ],
      [
        "Look in Gujarat too",
        "Vadodara (198) and Ahmedabad (167) rank in the top five cities."
      ],
      [
        "Email the manager",
        "Send one process map to the operations lead, then follow up once."
      ]
    ]
  },
  "related": [
    {
      "slug": "supply-chain-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Supply Chain Jobs for Freshers 2026"
    },
    {
      "slug": "process-associate-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Process Associate Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Operations Executive Jobs 2026",
    "description": "2,663 active entry-level and internship listings for India posted in October 2026 (operations executive), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-operations-executive-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the operations manager directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring with a verified work email, writes a short personal note, and sends it from your inbox once you start a campaign."} />
    </DataReport>
  );
}
