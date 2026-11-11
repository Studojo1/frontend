import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-jobs-in-mumbai-for-freshers-2026",
  "title": "HR Jobs in Mumbai for Freshers: 914 October Listings and Pay in 2026",
  "short": "HR Jobs in Mumbai for Freshers 2026",
  "description": "HR jobs in Mumbai for freshers: 914 October listings, 35.6% of jobs state pay, and the median stated top of range is 3.5 lakh a year.",
  "keywords": "hr jobs in mumbai for freshers, fresher hr jobs mumbai, hr salary in mumbai for freshers, hr internship in mumbai",
  "h1": "HR Jobs in Mumbai for Freshers:",
  "h1em": "What 914 Listings Show",
  "sub": "We found 914 HR listings in Mumbai in the Studojo Jobs Index for October 2026, with 190 of them internships. 35.6% of the jobs state pay, and the median top of range is 3.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "HR in Mumbai · freshers",
  "findings": [
    "**HR jobs in Mumbai for freshers** account for 914 October listings in the Studojo Jobs Index: 724 jobs and 190 internships (20.8%).",
    "**The employer pool is wide**: 555 different employers posted these listings, and the top ten account for only 18.7%.",
    "**Pay shows up on 258 jobs** (35.6%), with a median top of range of 3.5 lakh a year and 134 of them (51.9%) in the 3 to 5 lakh band.",
    "**Excel matters more than HR tools**: 33.9% of described listings mention Excel, 72.8% mention communication skills, and 7.1% of the listings are marked remote.",
    "**The move that works** is to email the HR head or recruitment lead with a short sample of work. Stu finds the person and drafts the email for you."
  ],
  "stats": [
    {
      "num": "914",
      "label": "HR in Mumbai listings, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 258 jobs that state it (35.6%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "33.9%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Which HR roles are Mumbai employers hiring freshers for?",
      "sub": "Internships and recruiter titles share the top.",
      "paras": [
        "HR jobs in Mumbai for freshers start with an internship: Human Resources (HR) Internship has 60 listings, the most of any single title. HR Recruiter and Talent Acquisition Specialist follow with 41 each, so recruitment is the other main way in.",
        "Service delivery titles are also visible. HR Service Delivery Associate has 39 listings and the New Associate version 33. Human Resource Recruiter has 33, HR Executive 29, Recruiter 25, Opt Recruiter 19 and Human Resource Intern 16.",
        "Of the 914, 724 are jobs and 190 are internships. The pool is unusually spread: 555 employers, with 3.4% hiding their name. When the top ten employers hold only 18.7%, no single company sets the terms, which is good for you."
      ],
      "chart": {
        "id": "rhjimff78Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=914)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          724,
          190
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
            "Human Resources (HR) Internship",
            "60"
          ],
          [
            "HR Recruiter",
            "41"
          ],
          [
            "Talent Acquisition Specialist",
            "41"
          ],
          [
            "HR Service Delivery Associate",
            "39"
          ],
          [
            "HR Service Delivery New Associate",
            "33"
          ],
          [
            "Human Resource Recruiter",
            "33"
          ],
          [
            "HR Executive",
            "29"
          ],
          [
            "Recruiter",
            "25"
          ],
          [
            "Opt Recruiter",
            "19"
          ],
          [
            "Human Resource Intern",
            "16"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 555 different employers posted these listings, and 3.4% of listings do not name the employer."
      }
    },
    {
      "title": "What is the HR salary in Mumbai for freshers?",
      "sub": "Stated pay, top of range, per year.",
      "paras": [
        "The median top of range for a Mumbai HR job is 3.5 lakh a year across the 258 jobs that state pay. The lower quarter sits at 2.5 lakh and the upper quarter at 4.2 lakh, a tight spread with few outliers.",
        "The 3 to 5 lakh band has 134 listings (51.9%), 2 to 3 lakh has 57 (22.1%) and 5 to 8 lakh has 40 (15.5%). At the top, 10 listings reach 8 to 12 lakh and 1 reaches 20 lakh or more. At the bottom, 16 sit under 2 lakh.",
        "64.4% of jobs state no pay, and only 3 internships (1.6%) state a stipend, with a median of ₹18,750 a month. That is too small to rely on. Treat every range as a guide, and ask for the real figure early."
      ],
      "chart": {
        "id": "rhjimff78Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (258 jobs that state pay in rupees)",
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
          16,
          57,
          134,
          40,
          10,
          0,
          1
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** the middle quarter of stated HR pay in Mumbai runs from 2.5 to 4.2 lakh a year."
    },
    {
      "title": "What skills do fresher HR jobs in Mumbai ask for?",
      "sub": "Skills named in 823 listings with a full description.",
      "paras": [
        "Communication skills are named in 72.8% of the 823 described listings, and Excel in 33.9%. That makes Excel the one concrete tool to practise. Pivot tables and a clean tracker are what most junior HR teams use every day.",
        "English appears in 18.8%, social media in 15.1% and negotiation in 14.7%. Negotiation is a reminder that recruiters close offers, not only screen CVs. Calling or telecalling is named in 4.0%, which is low for a role that involves a lot of phone work.",
        "Software keywords are rare. Cloud tools show up in 8.1%, mostly in tech recruiting descriptions. So a fresher who can show a clear spreadsheet and speak well on a call is ahead of most listings in what they ask for."
      ],
      "chart": {
        "id": "rhjimff78Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (823 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "social media",
          "negotiation",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "SAP"
        ],
        "values": [
          72.8,
          33.9,
          18.8,
          15.1,
          14.7,
          4.0,
          2.6,
          2.4,
          2.3,
          1.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Mumbai HR jobs need an MBA, targets or a certificate?",
      "sub": "What the descriptions say about conditions.",
      "paras": [
        "An MBA or PGDM is named in 10.6% of described listings, a certificate in 10.4% and any graduate in 8.0%. 20.2% say freshers are welcome. So a fresh degree is enough for most, and a short HR course helps for the rest.",
        "Targets appear in 15.6% and incentives in 8.1%, which usually means recruitment-linked pay. Work from office is stated in 7.4%, and work from home in 5.8%. PF, ESI or health insurance appears in 7.0%, and 5.5% mention women candidates.",
        "Wednesday is the busiest posting day at 21.1% of listings, then Thursday at 19.9%. Sunday has 1.6%. Naukri carries 50.8% of the slice, Shine 14.6%, Internshala 14.0% and LinkedIn 12.3%, so check more than one place."
      ],
      "chart": {
        "id": "rhjimff78Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (823 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "a certificate",
          "incentives",
          "work from office",
          "PF, ESI or health insurance",
          "work from home",
          "immediate joining",
          "night, rotational, US or UK shifts",
          "hybrid"
        ],
        "values": [
          20.2,
          15.6,
          10.4,
          8.1,
          7.4,
          7.0,
          5.8,
          5.7,
          5.7,
          1.5
        ],
        "unit": "%"
      },
      "callout": "**Worth knowing:** 7.1% of the Mumbai HR listings are marked remote, and 65 listings carry that flag."
    },
    {
      "title": "How do you get hired in HR as a fresher in Mumbai?",
      "sub": "Email the person who runs hiring.",
      "paras": [
        "With 555 employers posting, there are plenty of doors. Pick ten companies you would genuinely work for and email the head of HR or the talent acquisition lead at each. For internships, the recruitment manager is often the person who decides, so write to them by name.",
        "Proof beats a CV line. Draft a short job description for a role the company has open, or a screening scorecard with five questions. Attach it. Your email says who you are, what you are sending, and the type of role you want. Follow up once, then move on.",
        "Only 9.5% of descriptions include an email address, so most contacts must be found. Stu finds the person who hires, verifies their work email, writes a short note from your own work, and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **914 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as HR when its job title matches that role (the most common titles here: \"Human Resources (HR) Internship\", \"HR Recruiter\", \"Talent Acquisition Specialist\"). It counts for the city when it names Mumbai as a location.",
    "Pay: 258 of 724 entry-level listings (35.6%) state a salary in rupees and 3 of 190 internships (1.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 823 listings (90.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, Shine, Internshala, LinkedIn) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR jobs for freshers are there in Mumbai?",
      "a": "The Studojo Jobs Index has 914 HR listings in Mumbai posted in October 2026. Of those, 724 are entry-level jobs and 190 are internships. Listings are not hires."
    },
    {
      "q": "What is the HR salary in Mumbai for freshers?",
      "a": "Among the 258 jobs that state pay, the median top of range is 3.5 lakh a year, with a middle band of 2.5 to 4.2 lakh. Pay is the top of each range, so real offers can be lower."
    },
    {
      "q": "Is there an HR internship in Mumbai?",
      "a": "Yes. 190 of the 914 listings (20.8%) are internships, and Human Resources (HR) Internship is the single most common title with 60 listings. Only 3 state a stipend, with a median of ₹18,750 a month."
    },
    {
      "q": "Do I need an MBA for an HR job in Mumbai?",
      "a": "Not for most. 10.6% of described listings mention an MBA or PGDM, while 8.0% say any graduate and 20.2% say freshers are welcome."
    },
    {
      "q": "What skills should an HR fresher in Mumbai have?",
      "a": "Communication skills (72.8% of described listings) and Excel (33.9%) matter most. Negotiation appears in 14.7%, and social media in 15.1%."
    },
    {
      "q": "Are there remote HR jobs in Mumbai?",
      "a": "A few. 65 listings, or 7.1%, are marked remote, and 5.8% of described listings mention work from home. Most HR jobs for freshers still ask you to come in."
    }
  ],
  "takeaway": {
    "sub": "Five points for HR freshers in Mumbai.",
    "items": [
      [
        "Try internships",
        "Human Resources (HR) Internship is the top title with 60 listings."
      ],
      [
        "Know the range",
        "The median stated top of range is 3.5 lakh a year, and 64.4% of jobs state no pay."
      ],
      [
        "Learn Excel",
        "33.9% of described listings mention it."
      ],
      [
        "Spread your search",
        "555 employers posted, and the top ten hold only 18.7%."
      ],
      [
        "Email the HR head",
        "Attach a short screening scorecard or sample job description."
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
      "slug": "jobs-for-freshers-in-mumbai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Mumbai 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: HR Jobs in Mumbai for Freshers 2026",
    "description": "914 active entry-level and internship listings for India posted in October 2026 (HR in Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-jobs-in-mumbai-for-freshers-2026" place="report-end" size="card" title={"Want to email the person who hires HR freshers?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the hiring contact, verifies a work email, and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
