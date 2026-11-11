import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "jobs-for-freshers-in-mumbai-2026",
  "title": "Jobs for Freshers in Mumbai 2026: 21,016 October Listings Reviewed",
  "short": "Jobs for Freshers in Mumbai 2026",
  "description": "Jobs for freshers in Mumbai: 21,016 entry-level and internship listings from October 2026, what they pay, what they ask for and how to get hired.",
  "keywords": "jobs for freshers in mumbai, how to get a job in mumbai, mumbai fresher jobs 2026, fresher salary in mumbai, internships in mumbai",
  "h1": "Jobs for Freshers in Mumbai:",
  "h1em": "What 21,016 Listings Show",
  "sub": "Jobs for freshers in Mumbai are mostly customer service and hospitality: 21,016 October listings in the Studojo Jobs Index, 2,117 of them customer service. Where pay is stated, the median top of range is ₹3.8 lakh a year.",
  "published": "2026-11-11",
  "scope": "Mumbai · freshers and interns",
  "findings": [
    "The Studojo Jobs Index holds **21,016 jobs for freshers in Mumbai** posted in October 2026, 18,894 jobs and 2,122 internships.",
    "**Customer service is the biggest group at 10.1%**, and hotel and hospitality comes next at 8.7%, far above what you would guess from the national mix.",
    "Only 27.7% of Mumbai listings state pay in rupees, and the **median top of range is ₹3.8 lakh a year**, with 57.0% of stated pay between ₹3 and 5 lakh.",
    "Mumbai asks for **Excel in 16.8% of descriptions**, above the whole-index figure of 13.7%, while cloud skills appear in only 2.6%.",
    "The move that works is a short email to the person who runs the team you want, with one small piece of work attached. Stu finds that person and writes the first draft for you."
  ],
  "stats": [
    {
      "num": "21,016",
      "label": "Entry-level jobs and internships listed in Mumbai, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.8 lakh",
      "label": "Median stated pay a year, from the 5,239 jobs that state it (27.7%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "16.8%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What jobs for freshers are there in Mumbai?",
      "sub": "Role groups in the 21,016 listings we track for the city",
      "paras": [
        "Customer service is the largest role group among jobs for freshers in Mumbai, with 2,117 listings or 10.1% of the city's 21,016. Hotel and hospitality is second with 1,834 listings (8.7%), and HR is third with 914 (4.3%). Field sales, business development and telecaller roles follow, each between 2% and 3%.",
        "Hospitality stands out. Across the whole index, housekeeping titles are a small slice of listings, but in Mumbai a single title, Associate Housekeeping, accounts for 6.1% of the city. If you want an office role, the groups to watch are HR, marketing executive (461), accountant (387) and social media (385).",
        "Of the 21,016 Mumbai listings, 2,122 are internships, or 10.1%, a touch under the 10.8% across the whole index. Only 306 listings, 1.5%, are flagged remote, against 5.3% overall. Mumbai fresher jobs are mostly on-site."
      ],
      "chart": {
        "id": "rjffim249Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=21,016)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          18894,
          2122
        ],
        "unit": "listings"
      },
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "customer service",
            "2,117",
            "10.1%"
          ],
          [
            "hotel and hospitality",
            "1,834",
            "8.7%"
          ],
          [
            "HR",
            "914",
            "4.3%"
          ],
          [
            "field sales",
            "629",
            "3.0%"
          ],
          [
            "business development",
            "553",
            "2.6%"
          ],
          [
            "telecaller",
            "483",
            "2.3%"
          ],
          [
            "marketing (general)",
            "461",
            "2.2%"
          ],
          [
            "relationship manager",
            "459",
            "2.2%"
          ],
          [
            "accountant",
            "387",
            "1.8%"
          ],
          [
            "operations executive",
            "386",
            "1.8%"
          ],
          [
            "social media",
            "385",
            "1.8%"
          ],
          [
            "process associate",
            "364",
            "1.7%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      },
      "callout": "**Read it like this:** a title can match more than one role group, and many titles (associate, executive, trainee) match none."
    },
    {
      "title": "What are Mumbai fresher jobs called?",
      "sub": "The ten most repeated titles, exactly as employers wrote them",
      "paras": [
        "The most repeated title is Associate Housekeeping with 1,272 listings, followed by Associate Pantry (257) and Inbound Sales Representative Associate-Voice (242). Health Admin Services roles appear twice in the top five, with 199 and 187 listings. The list tells you volume hiring is what fills the city.",
        "Search for the plain titles too: Customer Service Executive has 172 listings and Sales Executive has 123. Note the repeats. Inbound Sales Representative Associate shows up under two spellings, with 242 and 175 listings, so the same job is split in the table.",
        "Behind these listings are 7,093 different employers, and 4.9% of listings do not name the employer. The ten biggest posters account for 25.8% of Mumbai listings, so a few large teams hire in bulk while thousands of smaller employers post one or two roles each."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Associate Housekeeping",
            "1,272"
          ],
          [
            "Associate Pantry",
            "257"
          ],
          [
            "Inbound Sales Representative Associate-Voice",
            "242"
          ],
          [
            "Health Admin Services New Associate",
            "199"
          ],
          [
            "Health Admin Services Associate",
            "187"
          ],
          [
            "Inbound Sales Representative Associate - Voice",
            "175"
          ],
          [
            "Customer Service Executive",
            "172"
          ],
          [
            "Pantry Associate",
            "156"
          ],
          [
            "Sales Executive",
            "123"
          ],
          [
            "Associate Housekeeping Services",
            "122"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 7,093 different employers posted these listings, and 4.9% of listings do not name the employer."
      }
    },
    {
      "title": "What is the fresher salary in Mumbai?",
      "sub": "Stated pay, top of range, for the listings that give a rupee figure",
      "paras": [
        "Fresher salary in Mumbai, where a listing states it, has a median top of range of ₹3,75,000 a year, about ₹3.8 lakh. The middle half runs from ₹3 lakh to ₹4.8 lakh. Of the 5,239 jobs that state pay in rupees, 2,987 sit in the ₹3 to 5 lakh band, which is 57.0%.",
        "Few listings go high. Only 226 jobs top out at ₹8 to 12 lakh (4.3%), 73 at ₹12 to 20 lakh and 25 at ₹20 lakh or more. At the bottom, 199 jobs state under ₹2 lakh. Treat the top of the range as the ceiling, not the offer.",
        "Pay is stated by 27.7% of Mumbai jobs, so most do not tell you. For internships it is rarer: just 45 of 2,122 state a stipend, 2.1%, with a median top of range of ₹14,583 a month. Ask for the band in your first email."
      ],
      "chart": {
        "id": "rjffim249Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (5,239 jobs that state pay in rupees)",
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
          199,
          767,
          2987,
          962,
          226,
          73,
          25
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do Mumbai fresher listings ask for?",
      "sub": "Share of the 17,204 listings with a full description that mention each skill",
      "paras": [
        "Communication skills appear in 59.6% of Mumbai descriptions, English in 19.6% and Excel in 16.8%. Calling or telecalling is named in 12.5%. These are the basics, and most fresher jobs here are about talking to people.",
        "Excel runs above the whole index: 16.8% in Mumbai against 13.7% overall. Cloud (AWS, Azure, GCP) is only 2.6%. CRM tools come in at 8.7% and social media at 8.2%. Adobe tools are 3.4% and SQL is 2.3%, so a portfolio matters in a few listings, not most.",
        "On terms, 21.5% say freshers, 16.4% mention targets and 13.5% mention night, rotational, US or UK shifts. The shift figure is higher than the 11.0% across the index. Only 5.9% ask for a certificate and 6.5% ask for a portfolio, so a certificate is rarely the gate."
      ],
      "chart": {
        "id": "rjffim249Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (17,204 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "calling or telecalling",
          "CRM tools (Salesforce, HubSpot or similar)",
          "social media",
          "negotiation",
          "Hindi",
          "Adobe tools (Photoshop, Illustrator)",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          59.6,
          19.6,
          16.8,
          12.5,
          8.7,
          8.2,
          7.2,
          4.9,
          3.4,
          2.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired in Mumbai as a fresher?",
      "sub": "Email the person who runs the team, with proof",
      "paras": [
        "Posting your details on a portal is where most people stop, and that is the crowded door. The Interview Guys (April 2026) cite Business Insider data of about 242 applications for an average opening, and put the odds of one online application at roughly 0.1% to 2%. Mumbai is no different, so go around the queue.",
        "In Mumbai, email the customer operations manager or the service delivery head for service roles, the HR head for people roles, and the branch or area manager for sales. Send one small piece of real work: a one-page sheet on how you would handle five common customer complaints, or a short sample of a cold call you recorded. Keep it to what that team does.",
        "The email says three things: who you are in one line, the proof attached, and one question about the role. Follow up once, a few days later. Stu does the slow parts: it finds the person, verifies the work email and drafts the message, and nothing goes out until you start a campaign."
      ],
      "callout": "**Where to look:** 7.1% of Mumbai descriptions, 1,224 listings, include an email address. Use it, and still write to the team lead."
    }
  ],
  "method": [
    "This report counts **21,016 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts for Mumbai when it names Mumbai as a location; a listing can name more than one city.",
    "Pay: 5,239 of 18,894 entry-level listings (27.7%) state a salary in rupees and 45 of 2,122 internships (2.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 17,204 listings (81.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best jobs for freshers in Mumbai?",
      "a": "By volume, customer service leads with 2,117 of 21,016 October listings, then hotel and hospitality with 1,834 and HR with 914. Best depends on your degree and goals. These are the groups with the most openings in the listings we track."
    },
    {
      "q": "What is the fresher salary in Mumbai?",
      "a": "Where a listing states pay, the median top of range is about ₹3.8 lakh a year. Only 27.7% of Mumbai jobs state pay in rupees, so most give no figure. Ask for the band early."
    },
    {
      "q": "How do you get a job in Mumbai as a fresher?",
      "a": "Email the person who runs the team, not only the portal. Attach one small piece of work and ask one question. Follow up once. Online applications are cited at roughly 0.1% to 2% success each (The Interview Guys, April 2026)."
    },
    {
      "q": "Are there internships in Mumbai for freshers?",
      "a": "Yes. We track 2,122 internships in Mumbai from October 2026, 10.1% of the city's listings. Only 45 state a stipend, with a median top of range of ₹14,583 a month."
    },
    {
      "q": "Can freshers in Mumbai work from home?",
      "a": "Rarely. Only 306 Mumbai listings, 1.5%, are flagged remote, and 2.0% of descriptions mention work from home. The whole index is at 5.3% remote."
    },
    {
      "q": "Do Mumbai fresher jobs ask for night shifts?",
      "a": "Some do. 13.5% of Mumbai descriptions mention night, rotational, US or UK shifts, against 11.0% across the index. Check the shift line before you apply."
    }
  ],
  "takeaway": {
    "sub": "What to remember about fresher jobs in Mumbai",
    "items": [
      [
        "Volume is service and hospitality",
        "Customer service (10.1%) and hotel and hospitality (8.7%) fill the most listings."
      ],
      [
        "Pay is stated by few",
        "27.7% of jobs state pay, with a median top of range near ₹3.8 lakh a year."
      ],
      [
        "Excel runs high",
        "16.8% of descriptions ask for Excel, above the 13.7% across the index."
      ],
      [
        "On-site is the norm",
        "Only 1.5% of listings are flagged remote."
      ],
      [
        "Go to the team lead",
        "Send one piece of proof to the person who runs the team."
      ]
    ]
  },
  "related": [
    {
      "slug": "jobs-for-freshers-in-chennai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Chennai 2026"
    },
    {
      "slug": "jobs-for-freshers-in-hyderabad-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Hyderabad 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Jobs for Freshers in Mumbai 2026",
    "description": "21,016 active entry-level and internship listings for India posted in October 2026 (Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-jobs-for-freshers-in-mumbai-2026" place="report-end" size="card" title={"Want the Mumbai hiring manager, not another portal?"} line={"Tell Stu the role, the city and the pay you want. Stu finds jobs that fit and the person hiring, with a verified work email. Talking to Stu is free."} />
    </DataReport>
  );
}
