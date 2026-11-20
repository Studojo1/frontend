import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "law-internship-india-2026",
  "title": "Law Internship in India: 91 Listings, Delhi First, Few Stipends 2026",
  "short": "Law Internship in India 2026",
  "description": "Law internship in India: 91 listings in the Studojo Jobs Index, Delhi leads with 21, only 5 state a stipend and 11.1% of described listings say unpaid.",
  "keywords": "law internship in india, legal internship, legal intern, law internship for students",
  "h1": "Law Internship in India:",
  "h1em": "91 Listings, 5 Stipends",
  "sub": "The Studojo Jobs Index has 91 law internships in India posted in the first half of November 2026, from 84 employers. Delhi has 21 and Mumbai 16. Only 5 state a stipend, with a median top of range of ₹12,000 a month, and 36.7% of described listings mention a certificate.",
  "published": "2026-11-20",
  "scope": "India · law internship",
  "findings": [
    "**A law internship in India** has 91 listings in the Studojo Jobs Index from 84 employers, so nearly every listing is a different firm, chamber or company.",
    "**Delhi leads with 21 listings** (23.1%), far above its 6.5% share of the whole index, and Mumbai follows with 16 (17.6%).",
    "**Only 5 of 91 state a stipend**, with a median top of range of ₹12,000 a month, while 11.1% of described listings say unpaid.",
    "**English is asked for in 32.2%** of described listings, well above the 22.3% index figure, with communication skills at 44.4%: a legal internship is still mostly writing.",
    "**Your best opening** is a one-page note on a recent judgment in the firm's practice area, sent to the partner or the head of legal. Stu can track down that person and draft the email from your own work."
  ],
  "stats": [
    {
      "num": "91",
      "label": "Law internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "5.5%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "10.0%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What is the difference between a legal intern and a law intern?",
      "sub": "Two titles cover most of the field.",
      "paras": [
        "In practice, nothing: employers use both names for a law internship in India. Legal Intern leads with 34 of the 91 listings (37.4%) and Law/Legal Internship follows with 23 (25.3%). Between them they cover close to two thirds of the field. Legal Internship, Law Interns and Law Student Intern each appear once, so search every spelling.",
        "The rest point at a specialism. Legal, Risk & Compliance Intern appears twice, which is a corporate compliance desk rather than a courtroom. There is one IPR paralegal role in Delhi and one intern post marked litigation. Read the title and the first line of the description together: they tell you whether you will draft contracts or sit in court.",
        "84 employers posted the 91 listings, none with a hidden name, and the ten biggest posters account for 18.7%. With so many employers for so few listings, nearly every listing is its own firm, chamber or company, and each one decides alone. That favours a careful, wide search over waiting for one big name to post."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Legal Intern",
            "34"
          ],
          [
            "Law/Legal Internship",
            "23"
          ],
          [
            "Legal, Risk & Compliance Intern",
            "2"
          ],
          [
            "Intern - Legal",
            "2"
          ],
          [
            "Legal Internship",
            "1"
          ],
          [
            "Law Interns",
            "1"
          ],
          [
            "Law Student Intern",
            "1"
          ],
          [
            "Ipr Paralegal Executive (Delhi)",
            "1"
          ],
          [
            "Legal Intern (Litigation)",
            "1"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 84 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities have the most legal internships?",
      "sub": "Delhi first, then Mumbai and Bengaluru.",
      "paras": [
        "Delhi has the most legal internships with 21 listings (23.1%), then Mumbai with 16 (17.6%) and Bengaluru with 9 (9.9%). Noida has 6, Gurugram 5 and Faridabad 2, so the capital region as a whole leads clearly. Hyderabad, Pune, Chennai and Jaipur have 3 each. The chart splits Delhi, Noida, Gurugram and Faridabad, but if you live anywhere in that region, treat them as one search.",
        "Delhi's share is the striking part. Across the whole index, Delhi holds 6.5% of listings; in law it holds 23.1%. That fits a city that hosts the Supreme Court and the Delhi High Court, with chambers and firms built around them. If you can spend a vacation in Delhi, your options widen a lot.",
        "Law stays in the office or the court. Only 9 listings (9.9%) carry the remote flag and 9 give no city. Work from home appears in 10.0% of described listings, work from office and hybrid in 6.7% each. Remote legal internships exist, but most of these listings want you in the room, where you can watch how the work is actually done."
      ],
      "chart": {
        "id": "rlii275Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=91)",
        "labels": [
          "Delhi",
          "Mumbai",
          "Bengaluru",
          "Noida",
          "Gurugram",
          "Hyderabad",
          "Pune",
          "Chennai",
          "Jaipur",
          "Faridabad"
        ],
        "values": [
          21,
          16,
          9,
          6,
          5,
          3,
          3,
          3,
          3,
          2
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
            "Delhi",
            "21",
            "23.1%"
          ],
          [
            "Mumbai",
            "16",
            "17.6%"
          ],
          [
            "Bengaluru",
            "9",
            "9.9%"
          ],
          [
            "Noida",
            "6",
            "6.6%"
          ],
          [
            "Gurugram",
            "5",
            "5.5%"
          ],
          [
            "Hyderabad",
            "3",
            "3.3%"
          ],
          [
            "Pune",
            "3",
            "3.3%"
          ],
          [
            "Chennai",
            "3",
            "3.3%"
          ],
          [
            "Jaipur",
            "3",
            "3.3%"
          ],
          [
            "Faridabad",
            "2",
            "2.2%"
          ]
        ],
        "note": "A listing can name more than one city. 9 listings are marked remote and 9 name no city."
      }
    },
    {
      "title": "Are law internships paid in India?",
      "sub": "Five stated stipends out of 91.",
      "paras": [
        "A few are, and most do not say. Only 5 of the 91 listings state a stipend in rupees (5.5%). Their median top of range is ₹12,000 a month: four top out between ₹10,000 and 20,000, and one between ₹20,000 and 40,000. That leaves 94.5% of listings where you have to ask the question yourself.",
        "The terms chart is candid about the trade. A certificate is mentioned in 36.7% of described listings, against 6.9% across the index, and unpaid in 11.1% (10 listings). A bond or service agreement appears in 4.4%, which is odd for an internship: ask what it binds you to before you sign. No listing asks for a fee.",
        "Women candidates are named in 16.7% of described listings. Freshers appear in 8.9% and incentives in 8.9%. A pre-placement offer is mentioned once. If the internship is a short vacation stint, the stipend matters less than who you work under, what you get to draft, and whether a senior will read it and mark it up."
      ],
      "chart": {
        "id": "rlii275Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (90 listings with a full description)",
        "labels": [
          "a certificate",
          "unpaid",
          "work from home",
          "freshers",
          "incentives",
          "work from office",
          "hybrid"
        ],
        "values": [
          36.7,
          11.1,
          10.0,
          8.9,
          8.9,
          6.7,
          6.7
        ],
        "unit": "%"
      },
      "callout": "**Ask early:** 5 of 91 law internships state a stipend, and 4.4% of described listings mention a bond."
    },
    {
      "title": "What skills do law firms ask interns for?",
      "sub": "Writing in English, mostly.",
      "paras": [
        "Writing and speaking, above all. Communication skills top the list at 44.4% of the 90 described listings, and English follows at 32.2%, against 22.3% across the whole index. Law firms and legal teams want people who can write a clean note and explain it to a client without jargon. That is the skill to show first.",
        "After that the list thins out fast. Excel appears in 10.0% of described listings and negotiation in 7.8%. Social media shows in 4.4% and Hindi in 2.2%. Our keyword list does not track legal research databases, so judge those from each description itself rather than from this chart. If a listing names a research tool, mention any hands-on use of it in your email.",
        "On degrees, BBA appears in 6.7%, which fits the BBA LLB route, and BCom in 2.2%. Our degree keywords do not track LLB itself, so read each listing for the year of study it wants. Some will say final year, some will say any year, and that one line decides whether you should apply."
      ],
      "chart": {
        "id": "rlii275Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (90 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "negotiation"
        ],
        "values": [
          44.4,
          32.2,
          10.0,
          7.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get a law internship as a student?",
      "sub": "Write to the partner with a case note.",
      "paras": [
        "Write to the lawyer you would work under. At a law firm, that is the partner or senior associate who runs the practice group you want. At a chamber, write to the advocate. At a company, write to the head of legal or the company secretary. 7 descriptions (7.8%) include an email address; the rest leave the finding to you.",
        "Your proof is a one-page case note on a recent judgment in their practice area: the facts in three lines, the holding, and what it changes for their clients. For a corporate team, mark up a simple non-disclosure agreement instead and explain two changes. Either one shows research and writing on a single page.",
        "The email is three lines: your year and college, the attached note, and the weeks you are free. Bar Council of India rules make internships part of an LLB, so say which term you need it for. Follow up once. Friday is the busiest posting day, with 23 listings (25.3%). Stu can do the finding for you: it locates the partner or legal head, verifies the work email and, once you start a campaign, sends a short personal note from your own inbox."
      ]
    }
  ],
  "method": [
    "This report counts **91 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a law internship when its job title matches that kind of role (the most common titles here: \"Legal Intern\", \"Law/Legal Internship\", \"Legal, Risk & Compliance Intern\").",
    "Pay: 5 of 91 internships (5.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 90 listings (98.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many law internships are there in India?",
      "a": "91 law internships were listed in the Studojo Jobs Index between 1 and 15 November 2026, by 84 employers. Delhi has 21 and Mumbai 16. Those are listings; none of them is a confirmed hire."
    },
    {
      "q": "Is a legal internship paid?",
      "a": "Rarely, as far as the listings say. Only 5 of 91 state a stipend, with a median top of range of ₹12,000 a month, and 11.1% of described listings say unpaid."
    },
    {
      "q": "What does a legal intern need to show?",
      "a": "Writing. Communication skills appear in 44.4% of described listings and English in 32.2%. A short case note or a marked-up contract shows both at once."
    },
    {
      "q": "Which city has the most law internships in India?",
      "a": "Delhi, with 21 listings (23.1%). Mumbai has 16 and Bengaluru 9. Noida and Gurugram add 6 and 5, which makes the capital region the biggest cluster."
    },
    {
      "q": "Is a law internship for students or for graduates?",
      "a": "All 91 listings are internships, and some titles, such as Law Student Intern, ask for students by name. Freshers are named in 8.9% of described listings, so recent graduates can apply too."
    },
    {
      "q": "Can I do a law internship online?",
      "a": "Sometimes. 9 listings (9.9%) are flagged remote and 10.0% of described listings mention work from home. The rest want you at the office or in court."
    }
  ],
  "takeaway": {
    "sub": "Five steps for a law internship search.",
    "items": [
      [
        "Search legal and law",
        "Legal Intern and Law/Legal Internship are the same field under two names."
      ],
      [
        "Look at Delhi first",
        "It has 21 of the 91 listings, 23.1%."
      ],
      [
        "Ask about stipend and bond",
        "5 listings state pay; 4.4% of described listings mention a bond."
      ],
      [
        "Write well",
        "English is named in 32.2% of described listings."
      ],
      [
        "Send a case note",
        "One page on a recent judgment in their practice area."
      ]
    ]
  },
  "related": [
    {
      "slug": "legal-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Legal Jobs for Freshers in India 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Law Internship in India 2026",
    "description": "91 active entry-level and internship listings for India posted 1 to 15 November 2026 (law internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-law-internship-india-2026" place="report-end" size="card" title={"Want to send your case note to the right partner?"} line={"Tell Stu, by voice or text, the kind of legal work and the city you want. Stu finds who is hiring, usually the partner or legal head, and drafts a personal email on why you fit. It sends nothing until you start a campaign."} />
    </DataReport>
  );
}
