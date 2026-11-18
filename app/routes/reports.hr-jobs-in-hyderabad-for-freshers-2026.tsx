import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-in-hyderabad-for-freshers-2026",
  "title": "HR Jobs in Hyderabad for Freshers: 324 Listings, Pay and Skills 2026",
  "short": "HR Jobs in Hyderabad for Freshers 2026",
  "description": "HR jobs in Hyderabad for freshers: 324 listings in the Studojo Jobs Index, and the median stated top of range is ₹3.6 lakh a year. See titles and skills.",
  "keywords": "hr jobs in hyderabad for freshers, fresher hr jobs hyderabad, hr salary in hyderabad for freshers, hr internship in hyderabad",
  "h1": "HR Jobs in Hyderabad for Freshers:",
  "h1em": "What 324 Listings Show",
  "sub": "We found 324 HR listings in Hyderabad in the Studojo Jobs Index, posted in the first half of November 2026. Recruiter titles dominate, including US IT recruiter and bench sales roles. Of the 117 jobs that state pay, the median top of range is ₹3.6 lakh a year.",
  "published": "2026-11-17",
  "scope": "HR in Hyderabad · freshers",
  "findings": [
    "**HR jobs in Hyderabad for freshers** make up 324 listings posted 1 to 15 November 2026: 269 jobs and 55 internships (17.0%).",
    "**Recruiting is the front door**: the top titles are HR Recruiter (16), US IT Recruiter (15), Bench Sales Recruiter (11) and IT Recruiter (10). Plain HR internships are rare here, at 5 listings.",
    "**Pay is stated on 117 jobs** (43.5%), with a median top of range of ₹3.6 lakh a year. Only 3 internships (5.5%) state a stipend.",
    "**The job comes with strings**: 28.5% of described listings mention incentives, 24.1% targets and 22.5% night, rotational, US or UK shifts.",
    "**The move that works** is to email the talent acquisition lead with a sourcing plan for one open role. Stu finds that person and writes the email from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "324",
      "label": "HR in Hyderabad listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3.6 lakh",
      "label": "Median stated pay a year, from the 117 jobs that state it (43.5%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "21.5%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What are fresher HR jobs in Hyderabad actually called?",
      "sub": "Recruiter titles lead, and many are US IT hiring desks.",
      "paras": [
        "HR jobs in Hyderabad for freshers are mostly recruiting jobs. HR Recruiter has 16 listings, US IT Recruiter 15, Bench Sales Recruiter 11, IT Recruiter 10 and Field Recruiter 9. HR Executive has 8, Human Resource Recruiter 7 and Us Recruiter 5.",
        "That mix reflects the city. Many HITEC City and Gachibowli employers hire for tech and for US staffing desks, so you will see bench sales and US IT recruiter roles that the same search in a smaller city would not show. A bench sales role is closer to sales than to classic HR, so read the description.",
        "Of the 324 listings, 269 are jobs and 55 are internships (17.0%), against 13.7% across the whole index. 200 different employers posted, the top ten account for 29.0% of listings, and 1.9% hide the employer name."
      ],
      "chart": {
        "id": "rhjihff6Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=324)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          269,
          55
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
            "Hr Recruiter",
            "16"
          ],
          [
            "Us It Recruiter",
            "15"
          ],
          [
            "Bench Sales Recruiter",
            "11"
          ],
          [
            "It Recruiter",
            "10"
          ],
          [
            "Field Recruiter",
            "9"
          ],
          [
            "Hr Executive",
            "8"
          ],
          [
            "Human Resource Recruiter",
            "7"
          ],
          [
            "Us Recruiter",
            "5"
          ],
          [
            "Human Resources (Hr) Internship",
            "5"
          ],
          [
            "Us It Recruiters - Freshers",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 200 different employers posted these listings, and 1.9% of listings do not name the employer."
      }
    },
    {
      "title": "What is the HR salary in Hyderabad for freshers?",
      "sub": "The top of the stated range, per year, on 117 jobs.",
      "paras": [
        "Among the 117 jobs that state pay in rupees, the median top of range is ₹3.6 lakh a year. The lower quarter sits at ₹3 lakh and the upper quarter at ₹5 lakh. That is 43.5% of the 269 jobs, so more than half say nothing about money.",
        "The ₹3 to ₹5 lakh band holds 56 listings (47.9%). 29 listings (24.8%) reach ₹5 to ₹8 lakh and 27 (23.1%) sit at ₹2 to ₹3 lakh. Only 2 are under ₹2 lakh, 2 reach ₹8 to ₹12 lakh and 1 reaches ₹12 to ₹20 lakh.",
        "For internships, only 3 of the 55 state a stipend (5.5%). Their median top of range is ₹20,000 a month, but three listings is too few to plan around. Pay is the top of each range, so ask what the fixed part is and what depends on hitting a number."
      ],
      "chart": {
        "id": "rhjihff6Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (117 jobs that state pay in rupees)",
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
          2,
          27,
          56,
          29,
          2,
          1,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** the middle half of stated HR pay in Hyderabad runs from ₹3 to ₹5 lakh a year."
    },
    {
      "title": "Which skills do Hyderabad HR listings ask for?",
      "sub": "Keyword share across 316 listings with a full description.",
      "paras": [
        "Communication skills appear in 79.1% of the 316 described listings, the highest of any skill. English comes next at 22.2%, Excel at 21.5% and negotiation at 19.0%. Negotiation is high because recruiters spend their day closing candidates on offers.",
        "Social media shows up in 16.8% and calling or telecalling in 9.8%, which matches the sourcing work: posting roles, then phoning people. CRM tools appear in 5.1%, cloud in 4.7%, Java in 2.8% and Python in 2.2%.",
        "The tech words are not requirements for you. They mostly describe what the candidates should know, in IT recruiter listings. What they tell you is that you should be able to read a technical job description and explain it in plain words."
      ],
      "chart": {
        "id": "rhjihff6Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (316 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "negotiation",
          "social media",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "cloud (AWS, Azure, GCP)",
          "Java",
          "SAP"
        ],
        "values": [
          79.1,
          22.2,
          21.5,
          19.0,
          16.8,
          9.8,
          5.1,
          4.7,
          2.8,
          2.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do these jobs mean targets, shifts and incentives?",
      "sub": "What the descriptions say about the working terms.",
      "paras": [
        "Often, yes. Of the 316 described listings, 30.4% welcome freshers, 28.5% mention incentives, 24.1% targets and 22.5% night, rotational, US or UK shifts. Work from office is named in 20.3% and immediate joining in 14.2%.",
        "Qualification asks are mixed. MBA or PGDM appears in 18.7%, any graduate in 14.2%, BTech or computer science in 10.8% and BBA in 9.8%. Women candidates are named in 14.2%. PF, ESI or health insurance appears in only 5.1%, so check benefits before you accept.",
        "Remote is uncommon: 10 listings (3.1%) carry the remote flag, against 6.5% across the whole index. Friday (26.9%) and Wednesday (24.7%) are the busiest posting days, and Sunday has 3.1%. Naukri carries 56.2% of the slice."
      ],
      "chart": {
        "id": "rhjihff6Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (316 listings with a full description)",
        "labels": [
          "freshers",
          "incentives",
          "targets",
          "night, rotational, US or UK shifts",
          "work from office",
          "immediate joining",
          "PF, ESI or health insurance",
          "work from home",
          "a certificate",
          "cab or transport"
        ],
        "values": [
          30.4,
          28.5,
          24.1,
          22.5,
          20.3,
          14.2,
          5.1,
          4.1,
          3.8,
          2.8
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 22.5% of described listings mention night, rotational, US or UK shifts. Ask about timings before you say yes."
    },
    {
      "title": "How do you get hired in HR as a fresher in Hyderabad?",
      "sub": "Write to the person who runs recruiting.",
      "paras": [
        "Pick the team, not the job board. For a recruiter role, write to the talent acquisition lead or the head of HR. For a US IT desk, write to the delivery or recruitment manager. Spread across several of the 200 employers, because no single company dominates.",
        "Send one small piece of real work: a sourcing plan for one open role. Name the role, list five places you would look, and write a three-line outreach message you would send a candidate. Keep it to one page. It shows you can do the first week of the job.",
        "The email itself is three lines: who you are, what you attached, and the role you want. Follow up once after a few days. Only 13.6% of descriptions include an email address, so most contacts must be found. Stu finds the hiring person and verifies the work email, and sends from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **324 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Hr Recruiter\", \"Us It Recruiter\", \"Bench Sales Recruiter\"). It counts for the city when it names Hyderabad as a location.",
    "Pay: 117 of 269 entry-level listings (43.5%) state a salary in rupees and 3 of 55 internships (5.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 316 listings (97.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in Hyderabad?",
      "a": "The Studojo Jobs Index has 324 HR listings in Hyderabad posted 1 to 15 November 2026. That is 269 entry-level jobs and 55 internships. Listings are not hires, and we track only the sources the index reads."
    },
    {
      "q": "What is the fresher HR salary in Hyderabad?",
      "a": "Among 117 jobs that state pay, the median top of range is ₹3.6 lakh a year, and the middle half runs from ₹3 to ₹5 lakh. The other 56.5% of jobs do not state pay."
    },
    {
      "q": "Is there an HR internship in Hyderabad?",
      "a": "Yes, 55 of the 324 listings (17.0%) are internships. Human Resources (Hr) Internship appears 5 times. Only 3 internships state a stipend, with a median top of range of ₹20,000 a month."
    },
    {
      "q": "Are US IT recruiter jobs good for HR freshers?",
      "a": "They are plentiful: US IT Recruiter has 15 listings and Bench Sales Recruiter 11. Expect targets and shifts, since 22.5% of described listings mention night, rotational, US or UK shifts. Read the description to see if it is recruiting or sales."
    },
    {
      "q": "Do I need an MBA for an HR job in Hyderabad?",
      "a": "Not always. MBA or PGDM is named in 18.7% of described listings, while 14.2% say any graduate and 30.4% welcome freshers. A degree in any stream gets you into many of these."
    },
    {
      "q": "Can I get a remote HR job in Hyderabad?",
      "a": "A few. 10 listings (3.1%) are marked remote and 4.1% of described listings mention work from home. Most recruiter roles in the city expect you in the office."
    }
  ],
  "takeaway": {
    "sub": "Five points for HR freshers in Hyderabad.",
    "items": [
      [
        "Read the title",
        "Bench sales and US IT recruiter roles are not the same job as an HR executive."
      ],
      [
        "Know the range",
        "The median stated top of range is ₹3.6 lakh a year, on 117 jobs."
      ],
      [
        "Practise talking",
        "79.1% of described listings ask for communication skills."
      ],
      [
        "Ask about shifts",
        "22.5% mention night, rotational, US or UK shifts."
      ],
      [
        "Email the TA lead",
        "Attach a sourcing plan for one open role."
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
      "slug": "jobs-for-freshers-in-hyderabad-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Hyderabad 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: HR Jobs in Hyderabad for Freshers 2026",
    "description": "324 active entry-level and internship listings for India posted 1 to 15 November 2026 (HR in Hyderabad), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-in-hyderabad-for-freshers-2026" place="report-end" size="card" title={"Want to reach Hyderabad's talent acquisition leads?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies a work email and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
