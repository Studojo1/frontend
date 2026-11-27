import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "business-analyst-internship-india-2026",
  "title": "Business Analyst Internship in India 2026: 67 Listings, 15 Employers",
  "short": "Business Analyst Internship 2026",
  "description": "Business analyst internship in India: 67 listings in the Studojo Jobs Index from just 15 employers. 97.0% name Excel and SQL, and none state a stipend.",
  "keywords": "business analyst internship in india, business analysis internship, business analyst intern, ba internship",
  "h1": "Business Analyst Internship in India:",
  "h1em": "Few Employers, Same Five Skills",
  "sub": "The Studojo Jobs Index has 67 business analyst internships in India posted 1 to 15 November 2026, and just 15 employers posted them. None states a stipend, 82.1% are marked remote, and Excel and SQL each appear in 97.0% of descriptions.",
  "published": "2026-11-27",
  "scope": "India · business analyst internship",
  "findings": [
    "**A business analyst internship in India** is posted as Business Analyst Intern 41 times out of 67 listings (61.2%) in the Studojo Jobs Index, and as plain Business Analyst another 15.",
    "**A handful of employers post most of these**: only 15 employers posted all 67, and the ten busiest hold 92.5%, against 13.0% across the whole index.",
    "**The skill list barely changes**: Excel and SQL each appear in 97.0% of descriptions, communication skills in 92.5%, Power BI in 86.6% and Tableau in 79.1%.",
    "**No listing states a stipend**: none of the 67 does, while 17.9% of descriptions mention a certificate and 6.0% say unpaid. Ask for the monthly amount before you accept.",
    "**The move that works** is a short email to the product, operations or strategy lead with one process map you drew for a real workflow. Stu finds the person who owns that process and verifies the work email."
  ],
  "stats": [
    {
      "num": "67",
      "label": "Business analyst internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "0.0%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "97.0%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Who posts business analyst internships, and what are they called?",
      "sub": "The ten most common titles across 67 listings, as posted.",
      "paras": [
        "A business analyst internship in India is posted under one plain title most of the time. Of 67 listings in the first half of November 2026, Business Analyst Intern covers 41 (61.2%) and Business Analyst covers 15 (22.4%). The next title, with 4 listings, spells out the job in brackets: requirement gathering, Excel, process mapping and documentation.",
        "The rest are one-offs, and they show the range. One is a growth intern in business analysis and strategy. One mixes business analysis with data management, one leans on IT and SQL, and one sits in finance and operations. Another is posted as an internship with employment as a BA trainee, the clearest promise of a job anywhere in this set.",
        "The pool is very concentrated. Only 15 employers posted the 67 listings, and the ten busiest hold 92.5% of them. Set that against the index as a whole, where the ten biggest posters hold 13.0%. A handful of employers post most of these, so the same company can turn up again and again under slightly different titles. Before you apply, check you are not sending one company your CV five times."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Business Analyst Intern",
            "41"
          ],
          [
            "Business Analyst",
            "15"
          ],
          [
            "Business Analyst Intern (Requirement Gathering, Excel, Process Mapping, Documentation)",
            "4"
          ],
          [
            "Growth Intern Business Analysis & Strategy Greater Noida",
            "1"
          ],
          [
            "We Are Hiring Business Analyst Intern / Freshers Welcome (India)",
            "1"
          ],
          [
            "Business Analyst Internship With Employment As Ba Trainee",
            "1"
          ],
          [
            "Business Analyst Intern (Requirements, Process Mapping, Excel)",
            "1"
          ],
          [
            "Business Analyst Cum Data Managing Internship",
            "1"
          ],
          [
            "Business Analyst - It & Sql",
            "1"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 15 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "What skills does a business analyst intern need?",
      "sub": "Keyword share across all 67 business analyst descriptions.",
      "paras": [
        "Excel and SQL, at 97.0% each. Communication skills follow at 92.5%, Power BI at 86.6% and Tableau at 79.1%. Across the whole index, SQL appears in 2.5% of descriptions and Excel in 14.1%, so these listings ask for far more tooling than a typical entry-level post. Python appears in 37.3%, which makes it useful but not the entry ticket.",
        "When almost every description lists the same five skills, a few employers are probably reusing one template. That has two effects. The skill list tells you little about the actual job, and every applicant will claim the same five tools. Your edge is the part a template cannot show: that you can turn a messy business question into a clear, testable requirement.",
        "The rest of the chart is thin. English and CRM tools appear in 7.5% each. Pick one dashboard tool, Power BI or Tableau, and get good enough to build one clean report, then learn the SQL that feeds it. Business analysis is mostly asking the right question, so also practise writing user stories and acceptance criteria for a feature you use every day."
      ],
      "chart": {
        "id": "rbaii2130Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (67 listings with a full description)",
        "labels": [
          "Excel",
          "SQL",
          "communication skills",
          "Power BI",
          "Tableau",
          "Python",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)"
        ],
        "values": [
          97.0,
          97.0,
          92.5,
          86.6,
          79.1,
          37.3,
          7.5,
          7.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "Is a business analyst internship remote?",
      "sub": "Most are, and the named towns are few.",
      "paras": [
        "Mostly, yes. Four in five carry the remote flag: 55 of 67, or 82.1%, next to 6.5% in the index overall. Another way to see it: 57 listings give no city. That leaves only a handful of named places: Noida, Perintalmanna, Bengaluru and Kochi with 2 each, and Ahmedabad and Malappuram with 1 each. Read the chart as a short list, not a map of where business analysis happens.",
        "Three of those six places are in Kerala: Kochi, Perintalmanna and Malappuram. With so few employers behind the pool, one company in one region can put a town on the chart with a single post. Hybrid is written into 6.0% of descriptions, and none mention work from home or work from office in those words.",
        "Four out of five of these internships (80.6%) were found on LinkedIn. Shine and company career sites and ATS pages have 9.0% each, and Internshala 1.5%. Because most are remote and sit on one site, everyone in India who searches the same phrase sees the same few dozen seats. That is the strongest reason to skip the crowded apply button and write to a person instead."
      ],
      "chart": {
        "id": "rbaii2130Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=67)",
        "labels": [
          "Noida",
          "Perintalmanna",
          "Bengaluru",
          "Kochi",
          "Ahmedabad",
          "Malappuram"
        ],
        "values": [
          2,
          2,
          2,
          2,
          1,
          1
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
            "Noida",
            "2",
            "3.0%"
          ],
          [
            "Perintalmanna",
            "2",
            "3.0%"
          ],
          [
            "Bengaluru",
            "2",
            "3.0%"
          ],
          [
            "Kochi",
            "2",
            "3.0%"
          ],
          [
            "Ahmedabad",
            "1",
            "1.5%"
          ],
          [
            "Malappuram",
            "1",
            "1.5%"
          ]
        ],
        "note": "A listing can name more than one city. 55 listings are marked remote and 57 name no city."
      }
    },
    {
      "title": "Does a business analysis internship pay, and who can apply?",
      "sub": "Pay, degrees and posting days across 67 listings.",
      "paras": [
        "No listing says. We found no stipend figure in rupees in any of the 67. Unpaid is written into 6.0% of descriptions and a certificate into 17.9%, against 6.9% across the index. A pre-placement offer (PPO) appears in 1.5%, which is one listing. For context, the index's 11,528 internships include 246 with a stated stipend, and their median is ₹12,500 a month. Ask for your number before you accept.",
        "The degree net is wide. MBA or PGDM is named in 53.7% of descriptions, BBA in 52.2%, BTech, BE or computer science in 50.7% and BCom in 49.3%. Freshers are named in 43.3%. With each degree near half, these listings are written for commerce, management and engineering graduates alike, so a BCom or BBA student is as much in the frame as an engineer.",
        "The chart shows when they go up. Saturday is the busiest day, with 15 listings (22.4%), against 9.2% across the whole index. Monday and Sunday have 12 each (17.9%), and Thursday is the quietest with 5. A weekend check, followed by an email early in the week, puts you in front of the few teams behind this pool before most applicants arrive."
      ],
      "chart": {
        "id": "rbaii2130Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, 1 to 15 Nov 2026, n=67)",
        "labels": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "values": [
          12,
          6,
          9,
          5,
          8,
          15,
          12
        ],
        "unit": "listings"
      },
      "callout": "**Ask first:** none of the 67 listings states a stipend. Get the monthly amount and the end date in writing."
    },
    {
      "title": "How do you get a business analyst internship?",
      "sub": "Show you can turn a messy process into a clear requirement.",
      "paras": [
        "Write to the person whose process you would map: the product manager, the operations head or the head of strategy. At a small startup, that is the founder. HR screens the volume, but the person who owns the problem decides whether an analyst intern is worth the time. Only 2 of 67 descriptions (3.0%) carry an email address, so you will need to find the name yourself.",
        "Your proof is a one-page piece of business analysis on a real workflow. Pick something you know well, such as a college fee payment or a food order refund. Draw the current process, mark where it breaks, and write three user stories that fix it. Add one small Excel or SQL table that sizes the problem, and send it all as a single PDF.",
        "The email is three lines: who you are, the one finding from your process map, and a request to intern with their team. Nudge once after a week. A recruiter's first resume scan lasts about 6 to 7 seconds (Ladders eye-tracking study, 2018), which is why one page of real thinking does more than a long CV. Stu finds the person behind the process, verifies the work email and sends from your own inbox when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **67 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a business analyst internship when its job title matches that kind of role (the most common titles here: \"Business Analyst Intern\", \"Business Analyst\", \"Business Analyst Intern (Requirement Gathering, Excel, Process Mapping, Documentation)\").",
    "Pay: 0 of 67 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 67 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many business analyst internships are there in India?",
      "a": "The Studojo Jobs Index has 67 business analyst internships in India posted 1 to 15 November 2026. Only 15 employers posted them, and the ten busiest hold 92.5%. Each listing is an opening we track, not a hire."
    },
    {
      "q": "What does a business analyst intern do?",
      "a": "Turns business questions into clear requirements and numbers. The titles mention requirement gathering, process mapping and documentation, and the descriptions name Excel and SQL in 97.0% and Power BI in 86.6%."
    },
    {
      "q": "Is a BA internship paid?",
      "a": "The listings do not say. Not a single one of the 67 gives a figure, and 6.0% of descriptions say the seat is unpaid. Ask for the monthly amount before you accept."
    },
    {
      "q": "Can I get a business analysis internship with a BCom or BBA?",
      "a": "Yes, the listings are written for it. BCom is named in 49.3% of descriptions and BBA in 52.2%, next to MBA or PGDM at 53.7% and BTech, BE or computer science at 50.7%."
    },
    {
      "q": "Is a business analyst internship remote?",
      "a": "Mostly. 55 of the 67 (82.1%) are flagged remote, and 57 leave the city blank. Hybrid appears in 6.0% of descriptions."
    },
    {
      "q": "Do I need Power BI or Tableau for a business analyst internship?",
      "a": "One of them helps. Power BI is named in 86.6% of descriptions and Tableau in 79.1%. Learn one well, alongside Excel and SQL, which each appear in 97.0%."
    }
  ],
  "takeaway": {
    "sub": "Five points for anyone after a BA internship.",
    "items": [
      [
        "Expect the same names",
        "15 employers posted all 67 listings, and ten of them hold 92.5%."
      ],
      [
        "Know the five tools",
        "Excel, SQL, communication, Power BI and Tableau top the descriptions."
      ],
      [
        "Ask the stipend",
        "Not one of the 67 listings gives a figure."
      ],
      [
        "Check on weekends",
        "Saturday carries 22.4% of postings, the busiest day."
      ],
      [
        "Show a process map",
        "Send one page on a real workflow to the person who owns it."
      ]
    ]
  },
  "related": [
    {
      "slug": "business-analyst-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Business Analyst Jobs for Freshers 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Business Analyst Internship 2026",
    "description": "67 active entry-level and internship listings for India posted 1 to 15 November 2026 (business analyst internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-business-analyst-internship-india-2026" place="report-end" size="card" title={"Want your process map in front of an operations head?"} line={"Tell Stu you want a business analyst internship. Stu finds the product or operations lead, verifies their work email and writes a short note from your work. Start a campaign, and only then does it send from your own inbox."} />
    </DataReport>
  );
}
