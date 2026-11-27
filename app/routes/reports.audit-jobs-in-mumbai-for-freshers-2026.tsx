import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "audit-jobs-in-mumbai-for-freshers-2026",
  "title": "Audit Jobs in Mumbai for Freshers 2026: Articleship to IT Audit",
  "short": "Audit Jobs in Mumbai for Freshers 2026",
  "description": "Audit jobs in Mumbai for freshers: 93 listings in the first half of November 2026, 19 of them internships, and only 14 of the 74 jobs state pay.",
  "keywords": "audit jobs in mumbai for freshers, fresher audit jobs mumbai, audit salary in mumbai for freshers, audit internship in mumbai",
  "h1": "Audit Jobs in Mumbai for Freshers:",
  "h1em": "Articleship, Internal and IT Audit",
  "sub": "Mumbai produced 93 audit listings in the Studojo Jobs Index during the first half of November 2026, 74 jobs and 19 internships. Article Assistant, a CA training seat, is the most common title. Only 14 jobs give a pay figure, and the internships give none.",
  "published": "2026-11-27",
  "scope": "audit in Mumbai · freshers",
  "findings": [
    "**Audit jobs in Mumbai for freshers** add up to 93 listings in the Studojo Jobs Index, 74 jobs and 19 internships, posted by 68 different employers.",
    "**Article Assistant leads the titles** with 7 listings. That is a CA articleship, a training seat for CA students, not a regular audit job; Internal Auditor follows with 5 and IT Audit Analyst with 4.",
    "**Pay is mostly hidden**: only 14 of the 74 jobs (18.9%) state a figure, and 7 of those 14 sit in the ₹8 to ₹12 lakh band, which likely reflects qualified roles. The 19 internships are silent on money.",
    "**Communication and Excel lead the asks**: 48.9% of described listings mention communication skills and 32.6% Excel, while GST is at 16.3% and Tally at just 7.6%.",
    "**The move that works** is a short email to the audit partner or internal audit head, with one small piece of audit work attached. Stu can track that person down, check the work email and send from your own inbox when you start a campaign."
  ],
  "stats": [
    {
      "num": "93",
      "label": "Audit in Mumbai listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "18.9%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "32.6%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which audit titles do Mumbai employers post for freshers?",
      "sub": "Four kinds of seat sit under one word.",
      "paras": [
        "Audit jobs in Mumbai for freshers come in four kinds, and the title tells you which one you are looking at. Article Assistant is the top title with 7 of the 93 listings (7.5%). Internal Auditor has 5, IT Audit Analyst 4 and Quality Auditing Associate 3. Audit Associate, Audit Assistant and an Audit Staff title for Mumbai have 2 each.",
        "Article Assistant is a CA articleship: the practical training a CA student does under a practising chartered accountant. If you are not registered as a CA student, it is not your seat. A long coded title for an assurance and audit internship has 3 listings; it reads like a code copied from an internal system, and it is the closest thing here to an external audit internship for graduates.",
        "The other kinds sit inside companies. Internal Auditor titles test a firm's own processes, and one of them asks for a mutual fund background, which fits Mumbai's finance base. IT Audit Analyst checks systems and access controls. Quality Auditing Associate likely means checking process work, not books, so read the description. Titles with Assistant Manager in them usually want a qualified candidate."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Article Assistant",
            "7"
          ],
          [
            "Internal Auditor",
            "5"
          ],
          [
            "It Audit Analyst",
            "4"
          ],
          [
            "Quality Auditing Associate",
            "3"
          ],
          [
            "Intern 1 - Assurance - Chs - Asu - Audit - Audit Services - Mumbai",
            "3"
          ],
          [
            "Audit Associate",
            "2"
          ],
          [
            "Audit Assistant",
            "2"
          ],
          [
            "Audit Staff - Mumbai",
            "2"
          ],
          [
            "Internal Auditor - Specialist/ Associate - Mutual Fund Background",
            "2"
          ],
          [
            "Consultant / Assistant Manager _ Internal Audit",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 68 different employers posted these listings, and 1.1% of listings do not name the employer."
      }
    },
    {
      "title": "What is the audit salary in Mumbai for freshers?",
      "sub": "14 jobs state pay; the internships say nothing.",
      "paras": [
        "Most Mumbai audit listings do not say what they pay. A rupee figure appears on just 14 of the 74 jobs (18.9%); across the whole index the share is 36.2%. With so few figures, read the numbers below as a sketch of the employers who chose to share, not as a going rate for a first audit job.",
        "Of those 14, half sit in the ₹8 to ₹12 lakh band and 2 more in ₹12 to ₹20 lakh. Their median top of range is ₹9 lakh a year, far above the ₹3.8 lakh whole-index median, but those figures probably belong to qualified CA or assistant manager seats. At the other end, 2 jobs top out in ₹2 to ₹3 lakh and 2 in ₹3 to ₹5 lakh, which is closer to a BCom fresher's starting point.",
        "The chart shows the split: 74 entry-level jobs and 19 internships, so internships make up 20.4% of the slice, above the 13.7% share across the index. Every one of those 19 leaves the stipend blank. For an articleship, ask the firm what it pays each month before you sign. For any other audit internship, ask the same question and get the answer in writing."
      ],
      "chart": {
        "id": "rajimff100Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=93)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          74,
          19
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 81.1% of Mumbai audit jobs give no pay figure, so ask at the first call."
    },
    {
      "title": "Do Mumbai audit jobs ask for Tally, GST or Excel?",
      "sub": "Skill mentions across 92 full descriptions.",
      "paras": [
        "Excel, far more than accounting software. Of the 92 described listings, 48.9% ask for communication skills and 32.6% for Excel. GST follows at 16.3%, Tally at 7.6% and SAP at 4.3%. Across the whole index Excel sits at 14.1%, so a Mumbai audit listing names it more than twice as often as the average fresher listing does.",
        "Tally at 7.6% surprises anyone coming from an accounts course, but it makes sense. Audit is testing someone else's books: you pick a sample of entries, tie each one to a document and write down what you found, mostly in a spreadsheet. English is named in only 2.2% of listings, against 22.3% across the index, probably because a Mumbai audit team takes it as given.",
        "SQL and Power BI appear in 2.2% each and Python in 1.1%, and those most likely come from the IT audit titles. If you aim at IT Audit Analyst, basic SQL is worth an evening a week. For every other seat, be quick in Excel: lookups, pivot tables, a tidy sampling sheet, and enough GST to read a return and spot what does not add up."
      ],
      "chart": {
        "id": "rajimff100Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (92 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "GST",
          "Tally"
        ],
        "values": [
          48.9,
          32.6,
          16.3,
          7.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "Fresher audit jobs in Mumbai: who can apply, and on what terms?",
      "sub": "Degrees, terms and timing from the descriptions.",
      "paras": [
        "Freshers are named in 20.7% of the 92 described listings, a little under the 25.1% across the whole index. BCom is named in 7.6%, MBA or PGDM in 4.3%, and BTech, BE or computer science in 2.2%. Most listings name no degree at all, so the title and the duties decide who fits, not a line in the requirements.",
        "A portfolio shows up in 8.7%, a word that usually belongs to design jobs and likely comes from mixed listings. Work from office is written into 5.4%, and night, rotational, US or UK shifts into another 5.4%, which points at teams that audit for foreign clients. Hybrid is at 2.2%, work from home at zero, and no listing carries the remote flag.",
        "The usual red flags are absent: no described listing mentions a registration or training fee, a bond, or unpaid work. Friday was the busiest posting day with 30 listings (32.3%), against 18.3% across the index, and Sunday the quietest with 3. Naukri carried 35.5% of the slice, LinkedIn 25.8% and Shine 24.7%, with 11.8% on company career pages."
      ],
      "chart": {
        "id": "rajimff100Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (92 listings with a full description)",
        "labels": [
          "freshers",
          "a portfolio",
          "work from office",
          "night, rotational, US or UK shifts"
        ],
        "values": [
          20.7,
          8.7,
          5.4,
          5.4
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as an audit fresher in Mumbai?",
      "sub": "Show one tested sample to the person who signs off the audit.",
      "paras": [
        "Write to the person who runs the work, not to a careers inbox. At a CA firm, that is the audit partner or the manager who looks after article assistants. At a company, it is the internal audit head. For IT audit, write to the IT audit or risk manager. Firms around Fort, Nariman Point, BKC and Andheri all belong on your list, and with 68 employers in this slice, keep the list long.",
        "Send one small proof: a vouching sample on made-up data. Take 15 dummy purchase entries, tie each to an invoice, flag three that do not match, and write a one-line finding for each. Fit it on one page. For an IT audit seat, do the same with a user access list: who should not have access, and why it matters.",
        "The email has three lines: your status (BCom graduate, CA Inter, or CA student looking for articleship), what the sample shows, and the seat you want. Send a single follow-up after a week or so. An email address appears in just 6.5% of descriptions, under the 8.1% seen across the index. Stu does the finding: the partner or audit head, a verified work email, and a send from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **93 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as audit when its job title matches that role (the most common titles here: \"Article Assistant\", \"Internal Auditor\", \"It Audit Analyst\"). It counts for the city when it names Mumbai as a location.",
    "Pay: 14 of 74 entry-level listings (18.9%) state a salary in rupees and 0 of 19 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 92 listings (98.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many fresher audit openings did Mumbai have?",
      "a": "93, counting listings posted from 1 to 15 November 2026 in the Studojo Jobs Index: 74 jobs and 19 internships from 68 employers. Listings are not hires, and one employer can post more than once."
    },
    {
      "q": "How much does an audit fresher earn in Mumbai?",
      "a": "There is no reliable fresher figure, because only 14 of the 74 jobs state pay. Those 14 have a median top of range of ₹9 lakh a year, pulled up by 7 listings in the ₹8 to ₹12 lakh band that are likely for qualified candidates. 2 top out at ₹2 to ₹3 lakh."
    },
    {
      "q": "Is there an audit internship in Mumbai?",
      "a": "Yes. 19 of the 93 listings (20.4%) are internships, more than the 13.7% share across the index. No stipend appears in any of them; ask the amount before accepting. Article Assistant, the CA articleship seat, has 7 listings on its own."
    },
    {
      "q": "Is an article assistant the same as an audit associate?",
      "a": "No. An article assistant is a CA student doing articleship, the practical training the CA course requires, under a practising chartered accountant. The work is real audit work, but you must be registered as a CA student to take the seat. Audit Associate is a regular job title, with 2 Mumbai listings here."
    },
    {
      "q": "Do I need Tally for an audit job in Mumbai?",
      "a": "Rarely, going by the listings. Tally is named in 7.6% of described listings, while Excel is named in 32.6% and GST in 16.3%. Get fast in Excel first."
    },
    {
      "q": "What does an IT audit analyst do?",
      "a": "An IT audit analyst checks a company's systems: who has access, whether changes were approved and whether controls work as written. IT Audit Analyst has 4 Mumbai listings in this slice. SQL is named in 2.2% of described listings, so a little SQL helps."
    }
  ],
  "takeaway": {
    "sub": "What a Mumbai audit fresher should do next.",
    "items": [
      [
        "Read the title first",
        "Article Assistant means CA articleship; Internal Auditor and IT Audit Analyst are company seats."
      ],
      [
        "Do not trust one pay figure",
        "Only 14 of 74 jobs state pay, and the high ones are likely for qualified roles."
      ],
      [
        "Learn Excel before Tally",
        "Excel shows up in 32.6% of descriptions, Tally in only 7.6%."
      ],
      [
        "Ask about the stipend",
        "None of the 19 internships states one, so get it in writing."
      ],
      [
        "Email the audit partner",
        "Send a one-page vouching sample on made-up data, then follow up once."
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
      "slug": "jobs-for-freshers-in-mumbai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Mumbai 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Audit Jobs in Mumbai for Freshers 2026",
    "description": "93 active entry-level and internship listings for India posted 1 to 15 November 2026 (audit in Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-audit-jobs-in-mumbai-for-freshers-2026" place="report-end" size="card" title={"Want a Mumbai audit partner to see your vouching sample?"} line={"Tell Stu you want an audit seat in Mumbai and the pay you need. Stu tracks down the partner or audit head, verifies their work email and drafts a note from your own work; your inbox sends nothing until you start a campaign."} />
    </DataReport>
  );
}
