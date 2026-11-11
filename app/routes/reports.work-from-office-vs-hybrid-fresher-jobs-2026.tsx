import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "work-from-office-vs-hybrid-fresher-jobs-2026",
  "title": "Work From Office vs Hybrid Jobs for Freshers: What 2026 Listings Say",
  "short": "Work From Office vs Hybrid Jobs 2026",
  "description": "Work from office vs hybrid jobs: in 147,916 October 2026 listings, 7.2% say work from office, 4.1% work from home and 1.9% hybrid. See it by role.",
  "keywords": "work from office vs hybrid jobs, work from home jobs for freshers, hybrid jobs for freshers, wfo jobs freshers",
  "h1": "Work From Office vs Hybrid Jobs for Freshers:",
  "h1em": "What Listings Say",
  "sub": "Work from office is named in 7.2% of fresher listings with a description, work from home in 4.1% and hybrid in just 1.9%. We read 147,916 October listings in the Studojo Jobs Index and split the terms by role group. Most listings say nothing either way.",
  "published": "2026-11-11",
  "scope": "India · freshers and interns",
  "findings": [
    "In **work from office vs hybrid jobs**, office wins on mentions: 10,578 listings (7.2%) say work from office against 2,743 (1.9%) that say hybrid, nearly four times as many.",
    "**Work from home is named in 6,024 listings (4.1%)** and 8,995 of all 170,927 listings (5.3%) are marked remote, so remote is rarer than the office default.",
    "**Customer service and telecalling are the most office-bound**: 13.8% of customer service and 13.0% of telecaller listings say work from office, while only 0.5% of telecaller listings say hybrid.",
    "**Content and marketing roles are the most flexible**: 10.2% of social media, 10.0% of marketing executive and 8.1% of content writer listings mention work from home, and 13.1% of marketing executive listings are marked remote.",
    "**Flexible listings draw more applicants, so a direct email counts.** An average opening draws about 242 applications (Business Insider data via The Interview Guys, April 2026). Stu finds the hiring manager and writes the email for you."
  ],
  "stats": [
    {
      "num": "170,927",
      "label": "Entry-level and internship listings in India, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4 lakh",
      "label": "Median stated pay a year, from the 43,254 jobs that state it (28.4%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "13.7%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Are most fresher jobs work from office or hybrid?",
      "sub": "Share of listings that name each way of working, by role group.",
      "paras": [
        "Work from office is the more common explicit term, but most listings do not state a mode at all. Among the 147,916 October listings that carry a full description, 7.2% name work from office, 4.1% name work from home and 1.9% name hybrid. The rest are silent, which usually means on-site by default.",
        "The table shows how different roles behave. Customer service says work from office in 13.8% of listings and telecaller in 13.0%. Operations executive is at 10.1% and HR at 8.9%. At the other end, relationship manager listings say it in only 2.0% and hospitality in 2.3%, because those jobs are on-site without needing to say so. Hybrid stays small everywhere. The highest shares are technical support at 4.6%, social media at 4.5% and content writer at 3.7%."
      ],
      "chart": {
        "id": "rwfovhf92Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (147,916 listings with a full description)",
        "labels": [
          "freshers",
          "targets",
          "night, rotational, US or UK shifts",
          "incentives",
          "work from office",
          "a portfolio",
          "a certificate",
          "PF, ESI or health insurance",
          "immediate joining",
          "work from home"
        ],
        "values": [
          21.8,
          20.5,
          11.0,
          8.9,
          7.2,
          7.1,
          6.2,
          6.2,
          5.0,
          4.1
        ],
        "unit": "%"
      },
      "table": {
        "head": [
          "Role group",
          "Listings with a description",
          "Say work from office",
          "Say hybrid",
          "Say work from home",
          "Marked remote"
        ],
        "rows": [
          [
            "customer service",
            "15,488",
            "13.8%",
            "1.1%",
            "2.1%",
            "2.5%"
          ],
          [
            "business development",
            "6,654",
            "5.6%",
            "1.8%",
            "6.7%",
            "8.6%"
          ],
          [
            "HR",
            "6,269",
            "8.9%",
            "1.7%",
            "9.1%",
            "8.9%"
          ],
          [
            "field sales",
            "4,985",
            "8.2%",
            "0.7%",
            "1.4%",
            "2.3%"
          ],
          [
            "relationship manager",
            "4,092",
            "2.0%",
            "0.2%",
            "0.2%",
            "0.3%"
          ],
          [
            "marketing (general)",
            "3,344",
            "6.2%",
            "2.8%",
            "10.0%",
            "13.1%"
          ],
          [
            "telecaller",
            "3,243",
            "13.0%",
            "0.5%",
            "3.8%",
            "4.9%"
          ],
          [
            "process associate",
            "2,938",
            "7.1%",
            "0.7%",
            "0.5%",
            "0.7%"
          ],
          [
            "hotel and hospitality",
            "2,805",
            "2.3%",
            "0.4%",
            "0.8%",
            "0.7%"
          ],
          [
            "accountant",
            "2,541",
            "6.5%",
            "1.5%",
            "1.2%",
            "2.0%"
          ],
          [
            "retail sales",
            "2,433",
            "4.5%",
            "0.9%",
            "1.2%",
            "1.8%"
          ],
          [
            "operations executive",
            "2,348",
            "10.1%",
            "2.5%",
            "4.6%",
            "5.9%"
          ],
          [
            "social media",
            "2,120",
            "5.9%",
            "4.5%",
            "10.2%",
            "11.4%"
          ],
          [
            "content writer",
            "1,651",
            "5.9%",
            "3.7%",
            "8.1%",
            "11.4%"
          ],
          [
            "digital marketing",
            "1,554",
            "7.0%",
            "1.5%",
            "7.6%",
            "12.8%"
          ],
          [
            "technical support",
            "1,542",
            "7.8%",
            "4.6%",
            "1.7%",
            "0.9%"
          ]
        ]
      },
      "callout": "**Read it right:** a listing that says nothing is not remote. Ask the recruiter early where you will sit."
    },
    {
      "title": "Where are the work from home jobs for freshers?",
      "sub": "Remote roles cluster in content, marketing and HR.",
      "paras": [
        "Work from home jobs for freshers are concentrated in creative and digital roles. Social media listings mention it in 10.2%, marketing executive in 10.0%, HR in 9.1%, content writer in 8.1% and digital marketing in 7.6%. Business development comes in at 6.7%. The remote flag tells a similar story. 13.1% of marketing executive listings and 12.8% of digital marketing listings are marked remote, against 2.5% of customer service and 2.3% of field sales. Overall 8,995 listings (5.3%) are remote.",
        "Remote roles are not tied to one city. 11,816 listings name no city, and Mumbai (21,016) and Bengaluru (20,817) lead the rest, so if you want an office job near home, check the city count before you apply."
      ],
      "chart": {
        "id": "rwfovhf92Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=170,927)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Chennai",
          "Hyderabad",
          "Delhi",
          "Pune",
          "Gurugram",
          "Ahmedabad",
          "Noida",
          "Kolkata"
        ],
        "values": [
          21016,
          20817,
          11860,
          11719,
          10249,
          9664,
          9378,
          8448,
          8043,
          3953
        ],
        "unit": "listings"
      },
      "callout": "**Pattern:** the more a job is about screens and content, the more likely it mentions home or remote."
    },
    {
      "title": "Which roles ask you into the office most?",
      "sub": "Role groups with the most listings, and what that means for your commute.",
      "paras": [
        "The biggest role groups are mostly on-site. Customer service has 20,127 listings, HR 7,267, business development 6,891, hospitality 6,414 and relationship manager 5,839. Field sales has 5,137 and by nature is out and about. If you want hybrid, look at technical support, operations and the creative roles in the first table. Operations executive listings mention hybrid in 2.5% and work from home in 4.6%, which is more than most other large groups. Accountant listings mention hybrid in 1.5%.",
        "Count what you will need to give up. A role with 13.8% office mentions often comes with targets or shifts, which show up in 20.5% and 11.0% of all descriptions."
      ],
      "table": {
        "head": [
          "Role group",
          "Listings",
          "Share"
        ],
        "rows": [
          [
            "customer service",
            "20,127",
            "11.8%"
          ],
          [
            "HR",
            "7,267",
            "4.3%"
          ],
          [
            "business development",
            "6,891",
            "4.0%"
          ],
          [
            "hotel and hospitality",
            "6,414",
            "3.8%"
          ],
          [
            "relationship manager",
            "5,839",
            "3.4%"
          ],
          [
            "field sales",
            "5,137",
            "3.0%"
          ],
          [
            "process associate",
            "3,779",
            "2.2%"
          ],
          [
            "marketing (general)",
            "3,441",
            "2.0%"
          ],
          [
            "telecaller",
            "3,420",
            "2.0%"
          ],
          [
            "accountant",
            "2,738",
            "1.6%"
          ],
          [
            "operations executive",
            "2,663",
            "1.6%"
          ],
          [
            "retail sales",
            "2,633",
            "1.5%"
          ]
        ],
        "note": "Role groups are matched on the job title; a title can match more than one group, and many titles (associate, executive, trainee) match none."
      }
    },
    {
      "title": "Does work from office pay more than hybrid?",
      "sub": "What the stated pay shows, and what it cannot show.",
      "paras": [
        "We cannot say. Pay is stated in only 28.4% of jobs (43,254 listings), and our data does not split that pay by working mode, so any claim that office pays more or less would be a guess. What the data does show is the pay level overall. Of the listings that state pay, 48.3% put the top of the range between ₹3 lakh and ₹5 lakh a year and the median is about ₹4 lakh. Another 22.1% sit at ₹5 to 8 lakh.",
        "So weigh commute and flexibility as part of the offer. A role at ₹4 lakh with a daily commute is not the same as one at the same pay from home. Ask for the stated pay and the working mode in the first call."
      ],
      "chart": {
        "id": "rwfovhf92Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (43,254 jobs that state pay in rupees)",
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
          2283,
          7490,
          20876,
          9544,
          1733,
          609,
          719
        ],
        "unit": "listings"
      }
    },
    {
      "title": "How do you get hired in a hybrid or remote fresher role?",
      "sub": "Show you can work without a manager standing over you.",
      "paras": [
        "Email the person who runs the team: the marketing lead for content and social roles, the HR head for HR roles, the support manager for technical support. Flexible roles attract a big pool, so the email has to be specific to that team. Send one piece of work that proves you can deliver alone. A content writer can send two short posts for the company's channels. A technical support fresher can write a clear help article. A marketing fresher can send a small campaign idea. Say in three lines who you are, what you made and what you would like to talk about.",
        "Follow up once. Stu does the slow parts: it finds the person who hires, verifies their work email, drafts a personal note from your real work and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **170,927 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. It covers every listing in the index for that month.",
    "Pay: 43,254 of 152,469 entry-level listings (28.4%) state a salary in rupees and 385 of 18,458 internships (2.1%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 147,916 listings (86.5%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What is the difference between work from office and hybrid jobs?",
      "a": "Work from office means you work on-site every day. Hybrid splits time between office and home. In October 2026 listings, 7.2% say work from office and 1.9% say hybrid."
    },
    {
      "q": "Are there work from home jobs for freshers?",
      "a": "Yes, but they are a minority. Work from home is named in 4.1% of listings with a description and 8,995 listings (5.3%) are marked remote. They cluster in content, marketing and HR roles."
    },
    {
      "q": "Are there hybrid jobs for freshers?",
      "a": "A few. Hybrid appears in 2,743 listings (1.9%). The highest shares are in technical support (4.6%), social media (4.5%) and content writer (3.7%) listings."
    },
    {
      "q": "Which fresher jobs are work from office only?",
      "a": "Customer service (13.8% say work from office), telecaller (13.0%) and operations executive (10.1%) lean the most office-bound. Hospitality and relationship manager roles are on-site too but rarely say so."
    },
    {
      "q": "Do WFO jobs for freshers pay more?",
      "a": "We cannot tell from the data. Only 28.4% of jobs state pay and we do not split pay by working mode. Among those that do, the median top of range is about ₹4 lakh a year."
    },
    {
      "q": "How do I find out if a job is hybrid or remote?",
      "a": "Check for the words in the description, then ask the recruiter. Most listings say nothing: only 12.8% of descriptions name hybrid, home or office combined at most, so assume on-site until told otherwise."
    }
  ],
  "takeaway": {
    "sub": "What to do with the office, hybrid and remote split.",
    "items": [
      [
        "Assume office",
        "Work from office is named 7.2% of the time and hybrid 1.9%, with most listings silent."
      ],
      [
        "Go where flexibility lives",
        "Social media, marketing and content listings mention home most often."
      ],
      [
        "Ask early",
        "Put the working mode and pay in your first call, since pay is stated in only 28.4% of jobs."
      ],
      [
        "Show solo work",
        "For remote roles, send a sample you made on your own."
      ],
      [
        "Email the lead",
        "Write to the team head instead of adding to the average 242 applications."
      ]
    ]
  },
  "related": [
    {
      "slug": "night-shift-jobs-for-freshers-india-2026",
      "kicker": "Data",
      "title": "Night Shift Jobs for Freshers 2026"
    },
    {
      "slug": "immediate-joiner-jobs-for-freshers-2026",
      "kicker": "Data",
      "title": "Immediate Joiner Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Work From Office vs Hybrid Jobs 2026",
    "description": "170,927 active entry-level and internship listings for India posted in October 2026 (work from office vs hybrid), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-work-from-office-vs-hybrid-fresher-jobs-2026" place="report-end" size="card" title={"Want a role that fits how you work?"} line={"Tell Stu the role, the city and the pay you want. Stu finds jobs that fit you and who is hiring, with a verified work email. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
