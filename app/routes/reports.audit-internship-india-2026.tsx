import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "audit-internship-india-2026",
  "title": "Audit Internship in India: 62 Listings, Not One States a Stipend",
  "short": "Audit Internships in India 2026",
  "description": "Audit internship in India: 62 listings in the Studojo Jobs Index, Mumbai leads with 19, Excel is named in 33.9%, and not one states a stipend.",
  "keywords": "audit internship in india, audit intern, internal audit internship, audit assistant internship",
  "h1": "Audit Internship in India:",
  "h1em": "Articleship, Assurance, Internal Audit",
  "sub": "The Studojo Jobs Index has 62 audit internships in India posted in the first half of November 2026, from 49 employers. Several are CA articleship seats. Mumbai has 19 and Bengaluru 16, and not one of the 62 states a stipend.",
  "published": "2026-11-27",
  "scope": "India · audit internship",
  "findings": [
    "**An audit internship in India** has 62 listings in the Studojo Jobs Index, and three of the ten most common titles are CA articleship seats, with 11 listings between them.",
    "**Mumbai and Bengaluru hold more than half**: 19 listings (30.6%) and 16 (25.8%), against 10.8% and 12.8% of the whole index.",
    "**Excel is named in 33.9%** of descriptions, against 14.1% across the index, and GST in 24.2%. Tally appears in 11.3%.",
    "**Not one of the 62 states a stipend**, while 2.1% of internships across the index do, so you have to ask the amount before you accept.",
    "**The move that works** is a short email to the partner who takes articled assistants, or the internal audit head at a company, with one sample working paper. Stu tracks down that person and writes the note from your real work."
  ],
  "stats": [
    {
      "num": "62",
      "label": "Audit internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "0.0%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "33.9%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Is a CA articleship the same as an audit internship?",
      "sub": "Some titles are training seats, some are short internships.",
      "paras": [
        "An audit internship in India comes in two kinds, and the titles tell them apart. Audit Intern is the most common title, with 5 of the 62 listings (8.1%). Ca Articleship Internship also has 5, Ca Articleship 4 and Chartered Accountant Articleship Trainee 2, spelled as posted. Those three are CA articleship seats: the practical training a chartered accountancy student completes under a practising CA, not a summer stint.",
        "That difference matters before you apply. An articleship is a formal training contract that runs far longer than an internship, so check the term the firm offers and whether you are registered for it yet. If you are a BCom or BBA student who wants a few months of audit exposure, the Audit Intern, Finance Audit Intern and Auditing & Accounting Internship titles are the ones written for you.",
        "Some employers post in a long, coded style. Two titles for an intern in assurance and audit services, one for Mumbai and one for Kolkata, hold 3 listings each. Internal Auditor Intern has 2, and an internal audit summer analyst title for 2027 has 2 more, so internal audit is a lane of its own. 49 employers posted the 62 listings, and the top ten post 37.1%, against 13.0% across the index."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Audit Intern",
            "5"
          ],
          [
            "Ca Articleship Internship",
            "5"
          ],
          [
            "Ca Articleship",
            "4"
          ],
          [
            "Intern 1 - Assurance - Chs - Asu - Audit - Audit Services - Mumbai",
            "3"
          ],
          [
            "Intern 1 - Assurance - Chs - Asu - Audit - Audit Services - Kolkata",
            "3"
          ],
          [
            "Auditing & Accounting Internship",
            "2"
          ],
          [
            "Finance Audit Intern",
            "2"
          ],
          [
            "Chartered Accountant Articleship Trainee",
            "2"
          ],
          [
            "Internal Auditor Intern",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 49 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "Are audit internships only in Mumbai?",
      "sub": "Not only, but two cities hold more than half.",
      "paras": [
        "Mumbai has the most audit internships with 19 listings (30.6%), and Bengaluru follows with 16 (25.8%). Together they hold more than half of the field. Across the whole index, Mumbai holds 10.8% and Bengaluru 12.8%, so audit seats are far more packed into these two cities than entry-level work in general. Pune is a distant third with 4.",
        "After that the counts are small. Kolkata has 3, and Noida, Kottayam, Delhi, Gurugram and Lucknow have 2 each, with Indore at 1. Kottayam is the outlier: it is not in the whole index's top ten cities, yet it ties with Delhi here. If you live outside the two big cities, a local CA firm is a likelier first seat than waiting for a listing to appear near you.",
        "This is office work. Only 1 listing (1.6%) carries the remote flag, and none of the described listings mentions work from home or hybrid. Just 2 name no city. Audit means visiting client offices, counting stock and sitting with the client's accounts team, so plan to be there in person and ask how much travel to client sites the seat involves."
      ],
      "chart": {
        "id": "raii2132Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=62)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Pune",
          "Kolkata",
          "Noida",
          "Kottayam",
          "Delhi",
          "Gurugram",
          "Lucknow",
          "Indore"
        ],
        "values": [
          19,
          16,
          4,
          3,
          2,
          2,
          2,
          2,
          2,
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
            "Mumbai",
            "19",
            "30.6%"
          ],
          [
            "Bengaluru",
            "16",
            "25.8%"
          ],
          [
            "Pune",
            "4",
            "6.5%"
          ],
          [
            "Kolkata",
            "3",
            "4.8%"
          ],
          [
            "Noida",
            "2",
            "3.2%"
          ],
          [
            "Kottayam",
            "2",
            "3.2%"
          ],
          [
            "Delhi",
            "2",
            "3.2%"
          ],
          [
            "Gurugram",
            "2",
            "3.2%"
          ],
          [
            "Lucknow",
            "2",
            "3.2%"
          ],
          [
            "Indore",
            "1",
            "1.6%"
          ]
        ],
        "note": "A listing can name more than one city. 1 listings are marked remote and 2 name no city."
      }
    },
    {
      "title": "What skills does an audit intern need: Excel, GST or Tally?",
      "sub": "Excel and GST lead the technical asks.",
      "paras": [
        "Communication skills top the list at 54.8% of descriptions, close to the 57.2% index rate. The technical asks are where audit stands apart. Excel is named in 33.9%, against 14.1% across the index, and GST in 24.2%. Tally comes in at 11.3%. Every one of the 62 listings carries a description, so these shares cover the whole field, not a sample of it.",
        "Negotiation shows up in 14.5%, above the 8.2% index rate, so expect some seats to put you in front of clients as well as ledgers. English is named in 6.5%, Python and cloud tools in 4.8% each, and SQL and AI tools in 3.2% each. Those last few point to data-led internal audit work, but they are a small slice of what is on offer.",
        "What to learn before you apply is plain from the chart. Get quick with Excel lookups and pivot tables, learn how GST input credit and returns work, and practise enough Tally to post a voucher and trace it back. A course certificate is named in 12.9% of descriptions, but a sample of your own work says more than one."
      ],
      "chart": {
        "id": "raii2132Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (62 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "GST",
          "negotiation",
          "Tally"
        ],
        "values": [
          54.8,
          33.9,
          24.2,
          14.5,
          11.3
        ],
        "unit": "%"
      }
    },
    {
      "title": "Is an audit internship paid, and when do firms post?",
      "sub": "No stated stipends, and a late-week peak.",
      "paras": [
        "None of the 62 audit internships states a stipend in rupees. Across the whole index, 2.1% of internships state one, so audit sits at the silent end of a field that is already quiet about pay. That does not mean these seats are unpaid: no described listing uses the word unpaid and none asks for a fee. It means you have to ask the amount, in writing, before you accept.",
        "For articleship seats, the Institute of Chartered Accountants of India sets a minimum stipend for articled assistants. Check the current figure on the institute's own site and ask the firm what it pays against it. For a short audit internship, ask the same question just as plainly, and ask whether travel to client sites is paid.",
        "Thursday brought 18 listings (29.0%) and Friday 16 (25.8%), so 34 of the 62 (54.8%) went up late in the week. Monday had only 4 and Sunday 2. LinkedIn carries 28 listings (45.2%), against 22.9% across the index, then company career sites with 11 and Internshala with 10. A Friday check of LinkedIn catches most of each week's new seats."
      ],
      "chart": {
        "id": "raii2132Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, 1 to 15 Nov 2026, n=62)",
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
          4,
          6,
          10,
          18,
          16,
          6,
          2
        ],
        "unit": "listings"
      },
      "callout": "**Ask in writing:** none of the 62 audit internships states a stipend, and for articleship, check the institute's current minimum."
    },
    {
      "title": "How do you get an audit internship as a BCom or CA student?",
      "sub": "Write to the person who signs off the file.",
      "paras": [
        "Write to the person who would review your work. At a CA firm, that is the partner, the principal you would be articled to. At a company, it is the head of internal audit or the financial controller. At a large firm's assurance practice, it is the audit senior or manager on the engagement team. Only 5 described listings (8.1%) carry an email address, so the name is usually yours to find.",
        "Your proof is one working paper. Make up ten purchase invoices, vouch them against a ledger in Excel, and add columns for what you checked: date, amount, GST rate and approval. End with a short list of exceptions, such as a missing signature or a tax rate that does not match. An auditor reads that and sees someone who already thinks in ticks and tie-outs.",
        "The email is three lines: your course and level, the working paper attached, and when you can start, with your articleship dates if that is what you want. If a week goes by with no answer, send one follow-up and leave it there. Recruiters spend about 6 to 7 seconds on a first resume scan (Ladders eye-tracking study, 2018), so put the proof in the email itself. Stu does the slow part: it finds the partner or audit head, verifies the work email and drafts the note."
      ]
    }
  ],
  "method": [
    "This report counts **62 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a audit internship when its job title matches that kind of role (the most common titles here: \"Audit Intern\", \"Ca Articleship Internship\", \"Ca Articleship\").",
    "Pay: 0 of 62 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 62 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many audit internships are there in India?",
      "a": "62 audit internships were posted in India from 1 to 15 November 2026, by the Studojo Jobs Index count. 49 employers posted them, and the top ten account for 37.1%. A listing is an open seat, not a hire."
    },
    {
      "q": "Is CA articleship counted as an audit internship?",
      "a": "Some listings are articleship seats under an internship label. Ca Articleship Internship has 5 listings, Ca Articleship 4 and Chartered Accountant Articleship Trainee 2. They are CA training seats with a longer, formal term, so read the description before you apply."
    },
    {
      "q": "What is an audit assistant internship?",
      "a": "It is mostly checking work. You vouch invoices against the books, match bank statements, help count stock and prepare working papers for the senior. The skills the listings name fit that work: Excel in 33.9% of descriptions, GST in 24.2% and Tally in 11.3%."
    },
    {
      "q": "Is there an internal audit internship for freshers?",
      "a": "Yes, a few. Internal Auditor Intern has 2 listings, and an internal audit summer analyst title for 2027 has 2. Freshers are named in 9.7% of descriptions, so most listings do not say either way: ask."
    },
    {
      "q": "Do audit internships pay a stipend?",
      "a": "None of the 62 listings states one. No description says unpaid, and none asks for a fee. Ask the monthly amount in writing before you accept, and for articleship, check it against the institute's current minimum."
    },
    {
      "q": "Which city has the most audit internships?",
      "a": "Mumbai, with 19 listings (30.6%), then Bengaluru with 16 (25.8%). Pune has 4 and Kolkata 3. Only 1 of the 62 is flagged remote, so plan to work from the firm's office or the client's."
    }
  ],
  "takeaway": {
    "sub": "Five checks before you take an audit seat.",
    "items": [
      [
        "Know which seat it is",
        "Articleship titles are CA training seats; Audit Intern titles are short internships."
      ],
      [
        "Look in Mumbai and Bengaluru first",
        "They hold 19 and 16 of the 62 listings."
      ],
      [
        "Learn Excel and GST",
        "They are named in 33.9% and 24.2% of descriptions."
      ],
      [
        "Ask the stipend",
        "None of the 62 listings states one."
      ],
      [
        "Send a working paper",
        "Ten vouched invoices with exceptions say more than a certificate."
      ]
    ]
  },
  "related": [
    {
      "slug": "audit-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Audit Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Audit Internships in India 2026",
    "description": "62 active entry-level and internship listings for India posted 1 to 15 November 2026 (audit internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-audit-internship-india-2026" place="report-end" size="card" title={"Want to reach the partner who takes articled assistants?"} line={"Tell Stu the audit seat and city you want, by voice or text. It finds firms that fit, the partner or audit head behind each and a verified work email, then writes a short note sent from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
