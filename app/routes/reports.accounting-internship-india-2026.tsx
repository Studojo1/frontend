import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "accounting-internship-india-2026",
  "title": "Accounting Internship in India: 133 Listings, Tally, GST, Pay 2026",
  "short": "Accounting Internship in India 2026",
  "description": "Accounting internship in India: 133 listings in the Studojo Jobs Index, 43.9% mention GST, 35.6% Tally, and just 5 state a stipend.",
  "keywords": "accounting internship in india, accounts internship, accounting and taxation internship, tally internship",
  "h1": "Accounting Internship in India:",
  "h1em": "133 Listings, 5 With Pay",
  "sub": "The Studojo Jobs Index has 133 accounting internships in India posted in the first half of November 2026, from 113 employers. Only 5 state a stipend. The work leans on books and tax: 62.9% of described listings mention Excel, 43.9% GST and 35.6% Tally.",
  "published": "2026-11-20",
  "scope": "India · accounting internship",
  "findings": [
    "**An accounting internship in India** draws 133 listings in the Studojo Jobs Index from 113 employers, and Mumbai has the most with 25.",
    "**Tax work is built in**: GST appears in 43.9% of described listings and Tally in 35.6%, while Excel leads at 62.9%, against 14.1% across the whole index.",
    "**Only 5 of 133 state a stipend** (3.8%). Their median top of range is ₹16,667 a month, but five listings are too few to call a going rate, so ask before you accept.",
    "**BCom is the degree they name**: 23.5% of described listings mention it, against 2.5% across the index, and 34.1% mention a certificate.",
    "**What gets you seen** is a short email to the audit manager at a CA firm, or the accounts head at a company, with a small reconciliation you built yourself. Stu finds that person and writes the note from your real work."
  ],
  "stats": [
    {
      "num": "133",
      "label": "Accounting internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "3.8%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "62.9%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which job titles cover an accounting internship in India?",
      "sub": "Tax, books and Tally show up in the title itself.",
      "paras": [
        "An accounting internship in India is posted under many near-identical names, and the word after the ampersand tells you the work. Accounting & Taxation Internship is the most common title, with 13 of the 133 listings (9.8%). Finance & Accounting Internship has 10, Accounting & Bookkeeping Internship 6 and Accounting & Tally Internship 5.",
        "The plain versions are split across spellings. Accounting Internship has 8 listings, Accounting Intern 7, Accounts Internship 4, Accounts Intern 3 and Accountant Internship 3. Five listings just say Accountant, with no intern in the title at all. Search accounts as well as accounting, or you will miss a slice of the field without knowing it.",
        "113 employers posted these 133 listings, and the top ten hold 20.3% of them, so most employers post once. Only 1 listing (0.8%) hides the employer. That spread looks like small practices and businesses with a single accounts desk, the kind that rarely runs a campus drive and rarely advertises the same seat twice."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Accounting & Taxation Internship",
            "13"
          ],
          [
            "Finance & Accounting Internship",
            "10"
          ],
          [
            "Accounting Internship",
            "8"
          ],
          [
            "Accounting Intern",
            "7"
          ],
          [
            "Accounting & Bookkeeping Internship",
            "6"
          ],
          [
            "Accounting & Tally Internship",
            "5"
          ],
          [
            "Accountant",
            "5"
          ],
          [
            "Accounts Internship",
            "4"
          ],
          [
            "Accounts Intern",
            "3"
          ],
          [
            "Accountant Internship",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 113 different employers posted these listings, and 0.8% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have the most accounts internships?",
      "sub": "Mumbai first, Delhi second, and very little remote.",
      "paras": [
        "Mumbai has the most accounting internship listings with 25 (18.8%), then Delhi with 16 (12.0%) and Bengaluru with 10 (7.5%). Hyderabad has 9 and Ahmedabad 7. Chennai, Jaipur, Gurugram, Pune and Noida have 5 each. Mumbai's lead is wider here than across the whole index, where it holds 10.8% of listings.",
        "Ahmedabad and Jaipur both make the top ten. If you study in Gujarat or Rajasthan, you do not need to move to a metro to start: the listings exist in your own city. Search locally first, whether that is around Ahmedabad's SG Highway or Jaipur's Malviya Nagar, and widen the net only when the local list runs dry.",
        "This is desk work with files. Just 9 listings (6.8%) carry the remote flag, close to the index's 6.5%, and work from home is named in 2.3% of described listings. 14 listings name no city. Plan to sit in an office, because ledgers, vouchers and client files usually stay there, and so does the person who checks your entries."
      ],
      "chart": {
        "id": "raii272Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=133)",
        "labels": [
          "Mumbai",
          "Delhi",
          "Bengaluru",
          "Hyderabad",
          "Ahmedabad",
          "Chennai",
          "Jaipur",
          "Gurugram",
          "Pune",
          "Noida"
        ],
        "values": [
          25,
          16,
          10,
          9,
          7,
          5,
          5,
          5,
          5,
          5
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
            "25",
            "18.8%"
          ],
          [
            "Delhi",
            "16",
            "12.0%"
          ],
          [
            "Bengaluru",
            "10",
            "7.5%"
          ],
          [
            "Hyderabad",
            "9",
            "6.8%"
          ],
          [
            "Ahmedabad",
            "7",
            "5.3%"
          ],
          [
            "Chennai",
            "5",
            "3.8%"
          ],
          [
            "Jaipur",
            "5",
            "3.8%"
          ],
          [
            "Gurugram",
            "5",
            "3.8%"
          ],
          [
            "Pune",
            "5",
            "3.8%"
          ],
          [
            "Noida",
            "5",
            "3.8%"
          ]
        ],
        "note": "A listing can name more than one city. 9 listings are marked remote and 14 name no city."
      }
    },
    {
      "title": "Do you need Tally and GST for an accounting internship?",
      "sub": "Excel first, then GST, then Tally.",
      "paras": [
        "For most of these listings, yes. Excel is named in 62.9% of the 132 described listings, GST in 43.9% and Tally in 35.6%. Across the whole index Excel sits at 14.1%, so an accounts desk names it at more than four times the index rate. Communication skills come in at 43.2%, close behind GST.",
        "GST at 43.9% is the telling bar. It suggests many of these internships include invoice checks and return work, not only data entry. If you have only met GST in a textbook, prepare a mock monthly return for a made-up shop before you apply. It gives you something concrete to talk about when someone asks what you know.",
        "Software beyond Tally is rare. SAP appears in 2 listings (1.5%), ChatGPT or AI tools in 6.8%, and English is named in only 3.8%. So Tally plus Excel is the pair to show. A clean voucher entry and a ledger you can explain line by line will beat a long list of tools on your CV."
      ],
      "chart": {
        "id": "raii272Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (132 listings with a full description)",
        "labels": [
          "Excel",
          "GST",
          "communication skills",
          "Tally",
          "ChatGPT or AI tools",
          "machine learning or generative AI",
          "English"
        ],
        "values": [
          62.9,
          43.9,
          43.2,
          35.6,
          6.8,
          5.3,
          3.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "What does an accounting internship pay, and who can apply?",
      "sub": "Five stated stipends, and a clear degree signal.",
      "paras": [
        "Only 5 of the 133 listings state a stipend in rupees (3.8%), so 96.2% leave you to ask. The median top of range among those five is ₹16,667 a month. Three fall in the ₹10,000 to 20,000 range, one in ₹20,000 to 40,000 and one at ₹40,000 or more. Five figures are too few to treat as the going rate.",
        "The terms chart shows what employers write instead of pay. A certificate is mentioned in 34.1% of described listings, against 6.9% across the index. Unpaid appears in 4.5% (6 listings) and a pre-placement offer in 3.0% (4 listings). Incentives show up in 6.8%. Not one described listing asks for a registration or training fee; if anyone asks you to pay to intern, decline.",
        "On who can apply, BCom is named in 23.5% of described listings, against 2.5% across the index. MBA or PGDM appears in 9.1%, BBA in 6.8% and freshers in 12.9%. Women candidates are named in 18.9%. If you are preparing for CA, an internship listing is not articleship, so check ICAI's rules before you count these months toward anything."
      ],
      "chart": {
        "id": "raii272Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (132 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "incentives",
          "a portfolio",
          "hybrid",
          "unpaid"
        ],
        "values": [
          34.1,
          12.9,
          6.8,
          6.1,
          4.5,
          4.5
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** 5 of 133 accounting internships state a stipend, so ask the amount and the start date before you say yes."
    },
    {
      "title": "How do you get an accounting internship?",
      "sub": "Send a reconciliation, not just a CV.",
      "paras": [
        "Your email goes to whoever approves the entries. At a CA firm, that is the partner or the audit manager. At a trading or manufacturing company, it is the accounts head or the finance manager. At a startup, it is often the founder. Only 6 descriptions (4.5%) print an email address, which leaves the search for a name to you.",
        "Your proof is one small piece of real accounting. Take a made-up month for a small shop: twenty sales, ten purchases and a bank statement. Post it in Tally or Excel, reconcile the bank, and put the GST summary on one sheet. It takes an evening and covers the three skills these listings ask for most.",
        "Keep the email to three lines: your course, what the attached sheet shows, and one question, such as whether they take interns this quarter. Send one follow-up after seven days. Friday is the busiest posting day here, with 37 listings (27.8%). Finding a partner's verified email is the slow part, and we built Stu for it: Stu finds the person, checks the address and sends from your own inbox, but only after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **133 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a accounting internship when its job title matches that kind of role (the most common titles here: \"Accounting & Taxation Internship\", \"Finance & Accounting Internship\", \"Accounting Internship\").",
    "Pay: 5 of 133 internships (3.8%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 132 listings (99.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Internshala, LinkedIn, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many accounting internships are listed in India?",
      "a": "133, posted in the first half of November 2026 by 113 different employers, by the Studojo Jobs Index count. That counts listings, not hires. Mumbai leads with 25 and Delhi has 16."
    },
    {
      "q": "What is an accounting and taxation internship?",
      "a": "It is the most common title in this set, with 13 of 133 listings. The tax part is real: GST appears in 43.9% of described listings, so expect GST work alongside bookkeeping."
    },
    {
      "q": "Is a Tally internship different from an accounting internship?",
      "a": "Mostly in emphasis. Accounting & Tally Internship has 5 listings of its own, and Tally is named in 35.6% of all described accounting listings, so most accounts roles expect it anyway. Excel is named even more often, in 62.9%."
    },
    {
      "q": "Is an accounting internship paid in India?",
      "a": "Sometimes, but few say how much. Only 5 of 133 listings state a stipend, with a median top of range of ₹16,667 a month, and 4.5% of described listings say unpaid. Ask before you accept."
    },
    {
      "q": "Can a BCom student get an accounts internship?",
      "a": "Yes, it is the degree these listings name most. BCom appears in 23.5% of described listings, against 2.5% across the whole index. Freshers are named in 12.9%."
    },
    {
      "q": "Does an accounting internship count as CA articleship?",
      "a": "Not on its own. Articleship is separate training registered with ICAI, and an internship listing is not that. If you are a CA student, check ICAI's current rules on what you may take up alongside articleship."
    }
  ],
  "takeaway": {
    "sub": "Five things to do before your next accounting application.",
    "items": [
      [
        "Search accounts and accounting",
        "Accounting & Taxation, Finance & Accounting and Accounts Intern all lead to the same books."
      ],
      [
        "Practise GST, not just theory",
        "43.9% of described listings mention GST."
      ],
      [
        "Show Tally and Excel together",
        "Excel is in 62.9% of described listings and Tally in 35.6%."
      ],
      [
        "Ask about the stipend",
        "Only 5 of 133 listings state one."
      ],
      [
        "Write to the audit manager",
        "Attach a one-sheet reconciliation for a made-up month."
      ]
    ]
  },
  "related": [
    {
      "slug": "accountant-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Accountant Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Accounting Internship in India 2026",
    "description": "133 active entry-level and internship listings for India posted 1 to 15 November 2026 (accounting internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-accounting-internship-india-2026" place="report-end" size="card" title={"Want to email the audit manager at a CA firm?"} line={"Start with one short call with Stu, talk or type. Stu finds internships that fit you and who is hiring for them, checks that the work email is real and drafts a personal note on why you fit. You decide when a campaign starts."} />
    </DataReport>
  );
}
