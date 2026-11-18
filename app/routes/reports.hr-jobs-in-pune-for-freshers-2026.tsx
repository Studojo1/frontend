import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-in-pune-for-freshers-2026",
  "title": "HR Jobs in Pune for Freshers: 154 Listings and Stated Pay in 2026",
  "short": "HR Jobs in Pune for Freshers 2026",
  "description": "HR jobs in Pune for freshers: 154 listings in the Studojo Jobs Index posted 1 to 15 November, and a median stated top of range of ₹3.5 lakh a year.",
  "keywords": "hr jobs in pune for freshers, fresher hr jobs pune, hr salary in pune for freshers, hr internship in pune",
  "h1": "HR Jobs in Pune for Freshers:",
  "h1em": "154 Listings and What They Say",
  "sub": "The Studojo Jobs Index has 154 HR listings in Pune, posted 1 to 15 November 2026. Of the 46 jobs that state pay, the median top of range is ₹3.5 lakh a year, and 26.8% of described listings welcome freshers.",
  "published": "2026-11-18",
  "scope": "HR in Pune · freshers",
  "findings": [
    "**HR jobs in Pune for freshers** come to 154 listings from 112 employers: 122 jobs and 32 internships (20.8%).",
    "**Recruiter titles dominate**: Hr Recruiter, Human Resource Recruiter and Field Recruiter have 5 listings each, and Recruiter has 4, next to It Recruitment Intern at 3.",
    "**Pay is stated on 46 jobs** (37.7%), with a median top of range of ₹3.5 lakh a year, and 24 of them (52.2%) sit in the ₹3 to ₹5 lakh band.",
    "**Pune is friendlier to freshers than the index**: 26.8% of described listings welcome freshers, against 25.1% across the whole index, and 8 listings (5.2%) are marked remote.",
    "**The move that works** is to email the HR manager or the delivery head of a tech team with a short sourcing plan. Stu finds that person and sends from your own inbox after you start a campaign."
  ],
  "stats": [
    {
      "num": "154",
      "label": "HR in Pune listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 46 jobs that state it (37.7%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "26.2%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which HR and recruiter titles are common in Pune?",
      "sub": "Recruiter and executive titles, with a few IT and field flavours.",
      "paras": [
        "HR jobs in Pune for freshers show no single dominant title. Hr Recruiter, Human Resource Recruiter, Field Recruiter, Human Resource Intern and Hr Executive each have 5 listings. Recruiter has 4, Hr Intern has 4 and Human Resources (Hr) Internship has 4. The spread means you should search by function, not one exact phrase.",
        "Two titles hint at the daily work. Field Recruiter has 5 listings and usually means visiting colleges, camps or sites to bring in candidates. It Recruitment Intern has 3 and points at tech hiring, which suits a city with large technology campuses around Hinjewadi and Kharadi.",
        "Of 154 listings, 122 are jobs and 32 are internships. 112 employers posted, the top ten hold 28.6%, and 2.6% of listings hide the employer. A concentrated top ten means a few firms post many seats, so a second look at the table is worth it."
      ],
      "chart": {
        "id": "rhjipff33Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=154)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          122,
          32
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
            "Field Recruiter",
            "5"
          ],
          [
            "Hr Recruiter",
            "5"
          ],
          [
            "Human Resource Intern",
            "5"
          ],
          [
            "Human Resource Recruiter",
            "5"
          ],
          [
            "Hr Executive",
            "5"
          ],
          [
            "Hr Intern",
            "4"
          ],
          [
            "Recruiter",
            "4"
          ],
          [
            "Human Resources (Hr) Internship",
            "4"
          ],
          [
            "Human Resource Executive",
            "3"
          ],
          [
            "It Recruitment Intern",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 112 different employers posted these listings, and 2.6% of listings do not name the employer."
      }
    },
    {
      "title": "How much do Pune HR jobs pay freshers?",
      "sub": "Top of the stated range, per year, on 46 jobs.",
      "paras": [
        "46 of the 122 Pune HR jobs state pay in rupees (37.7%), close to the index-wide 36.2%. The median top of range is ₹3.5 lakh a year, below the index median of ₹3.8 lakh. The lower quarter is ₹3 lakh and the upper quarter ₹5 lakh.",
        "The ₹3 to ₹5 lakh band holds 24 jobs (52.2%). ₹5 to ₹8 lakh has 10 (21.7%) and ₹2 to ₹3 lakh has 9 (19.6%). 2 reach ₹8 to ₹12 lakh and 1 is under ₹2 lakh. Nothing here reaches ₹12 lakh, so a fresher figure above ₹8 lakh is unusual.",
        "None of the 32 internships states a stipend in rupees. Because the number is missing, ask directly and ask early. A role with a travel part, like the field recruiter titles, should also tell you who pays for the trips."
      ],
      "chart": {
        "id": "rhjipff33Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (46 jobs that state pay in rupees)",
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
          1,
          9,
          24,
          10,
          2,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 52.2% of Pune HR jobs that state pay sit in the ₹3 to ₹5 lakh a year band, and 0 of 32 internships state a stipend."
    },
    {
      "title": "Is calling part of an HR job in Pune?",
      "sub": "Keyword share across 149 described listings.",
      "paras": [
        "Communication skills lead at 75.8% of the 149 described listings. Excel follows at 26.2%, English at 15.4%, social media at 14.8% and negotiation at 14.8%. The list is short, which makes preparation simple: be clear in speech and neat in a sheet.",
        "Calling or telecalling is named in 12.1%, a touch above the index-wide 11.7%. That matches the recruiter titles, because a lot of Pune recruiting begins with phone screens. Hindi appears in 2.7% and CRM tools in 2.0%, so most listings take both for granted.",
        "Tech words show up too. Cloud appears in 4.7%, Java in 2.0%, and SQL, JavaScript and AI tools each in about one listing in a hundred or less. Those come from IT recruiter roles. If you apply there, learn what a developer role needs, so your screening questions sound informed."
      ],
      "chart": {
        "id": "rhjipff33Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (149 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "social media",
          "negotiation",
          "calling or telecalling",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          75.8,
          26.2,
          15.4,
          14.8,
          14.8,
          12.1,
          4.7
        ],
        "unit": "%"
      }
    },
    {
      "title": "What do Pune HR listings say about targets and joining?",
      "sub": "Terms in the descriptions.",
      "paras": [
        "Freshers are welcomed in 26.8% of described listings, the top term on the chart. Targets appear in 20.8%, work from office in 13.4% and incentives in 13.4%. That is a notable share for HR, and it reflects recruiter roles that are paid partly on closed hires.",
        "On qualifications, MBA or PGDM is named in 12.1%, BBA in 7.4% and any graduate in 7.4%. BTech or computer science is at 3.4% and BCom at 2.0%. PF, ESI or health insurance is named in 6.7%, a certificate in 6.7% and immediate joining in 8.1%.",
        "Work from home appears in 5.4% and hybrid in 3.4%, with night, rotational, US or UK shifts in 4.7%. Wednesday is the busiest posting day at 20.1%, and Sunday has 5.8%. Naukri carries 51.9%, LinkedIn 19.5% and Shine 12.3%. That only shows where we found them."
      ],
      "chart": {
        "id": "rhjipff33Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (149 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "work from office",
          "incentives",
          "immediate joining",
          "PF, ESI or health insurance",
          "a certificate",
          "work from home",
          "night, rotational, US or UK shifts",
          "hybrid"
        ],
        "values": [
          26.8,
          20.8,
          13.4,
          13.4,
          8.1,
          6.7,
          6.7,
          5.4,
          4.7,
          3.4
        ],
        "unit": "%"
      },
      "callout": "**Ask first:** 20.8% mention targets and 13.4% mention incentives. Ask how a recruiter seat is paid."
    },
    {
      "title": "How do you get hired as an HR fresher in Pune?",
      "sub": "Send a sourcing plan for one tech or field role.",
      "paras": [
        "Email the HR manager at a company with an office near Hinjewadi, Kharadi or Hadapsar. For It Recruitment roles, also write to the delivery head or engineering manager, since that person owns the open seats. At a small firm, write to the founder. Say which role you want to help fill.",
        "Your proof is a one-page sourcing plan for one role: the job in a line, where you would find candidates, the first message you would send them, and how you would track replies in a sheet. It speaks to the calling and Excel skills many listings ask for. Keep it short and real.",
        "The email has three lines: who you are, what you attached, the role. Follow up once and stop. Only 9.4% of descriptions carry an email address, so the person is usually unnamed. Stu finds who hires, verifies the work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **154 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Field Recruiter\", \"Hr Recruiter\", \"Human Resource Intern\"). It counts for the city when it names Pune as a location.",
    "Pay: 46 of 122 entry-level listings (37.7%) state a salary in rupees and 0 of 32 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 149 listings (96.8%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in Pune?",
      "a": "The Studojo Jobs Index has 154 HR listings in Pune posted 1 to 15 November 2026. 122 are jobs and 32 are internships. Listings are not hires."
    },
    {
      "q": "What is the fresher HR salary in Pune?",
      "a": "Among 46 jobs that state pay, the median top of range is ₹3.5 lakh a year, and the middle half runs from ₹3 to ₹5 lakh. 62.3% of jobs do not state pay."
    },
    {
      "q": "Is there an HR internship in Pune?",
      "a": "Yes. 32 of 154 listings (20.8%) are internships, with Human Resource Intern at 5 listings. None states a stipend in rupees, so ask before you accept."
    },
    {
      "q": "Do Pune companies hire freshers as IT recruiters?",
      "a": "Some do. It Recruitment Intern has 3 listings and Recruiter has 4. Cloud appears in 4.7% of described listings, so learn the basics of the tech stack."
    },
    {
      "q": "Which skills should an HR fresher in Pune learn first?",
      "a": "Communication skills (75.8% of described listings) and Excel (26.2%). Calling (12.1%) and negotiation (14.8%) come next."
    },
    {
      "q": "Can I do an HR job in Pune from home?",
      "a": "Sometimes. Work from home appears in 5.4% of described listings, hybrid in 3.4%, and 8 listings (5.2%) are marked remote. Work from office is named in 13.4%."
    }
  ],
  "takeaway": {
    "sub": "Five points for HR freshers in Pune.",
    "items": [
      [
        "Search by function",
        "No title has more than 5 listings, so try recruiter, intern and executive."
      ],
      [
        "Know the pay",
        "The median stated top of range is ₹3.5 lakh a year, on 46 jobs."
      ],
      [
        "Be ready to call",
        "Calling is named in 12.1% of described listings."
      ],
      [
        "Check how you are paid",
        "Targets appear in 20.8% and incentives in 13.4%."
      ],
      [
        "Email the hiring side",
        "Send a sourcing plan for one role to the HR manager."
      ]
    ]
  },
  "related": [
    {
      "slug": "hr-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "HR Jobs for Freshers 2026"
    },
    {
      "slug": "pune-jobs-2026",
      "kicker": "Report",
      "title": "Pune's Job Market in 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: HR Jobs in Pune for Freshers 2026",
    "description": "154 active entry-level and internship listings for India posted 1 to 15 November 2026 (HR in Pune), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-in-pune-for-freshers-2026" place="report-end" size="card" title={"Want to email HR managers hiring in Pune?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short personal note for each. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
