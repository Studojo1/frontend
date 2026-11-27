import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "retail-sales-jobs-in-mumbai-for-freshers-2026",
  "title": "Retail Sales Jobs in Mumbai for Freshers 2026: Titles, Pay and Terms",
  "short": "Retail Sales Jobs in Mumbai for Freshers",
  "description": "Retail sales jobs in Mumbai for freshers: 113 listings from 101 employers in early November, and only 28 of the 110 jobs state any pay at all.",
  "keywords": "retail sales jobs in mumbai for freshers, fresher retail sales jobs mumbai, retail sales salary in mumbai for freshers, retail sales internship in mumbai",
  "h1": "Retail Sales Jobs in Mumbai for Freshers:",
  "h1em": "101 Employers, Few Pay Lines",
  "sub": "We count 113 retail sales listings in Mumbai in the Studojo Jobs Index, posted 1 to 15 November 2026 by 101 employers. Only 28 of the 110 jobs state pay, and their median top of range is ₹3.2 lakh a year. Sales Associate leads the titles with 14.",
  "published": "2026-11-27",
  "scope": "retail sales in Mumbai · freshers",
  "findings": [
    "**Retail sales jobs in Mumbai for freshers** number 113 in the first half of November, and 110 of them are jobs, not internships. They come from 101 employers, so almost every listing is from a different employer.",
    "**Pay is the hardest thing to find**: only 28 of 110 jobs state it (25.5%), against 36.2% across the whole index. The 28 that do give a figure have a median top of range of ₹3.2 lakh a year.",
    "**Sales Associate leads with 14 listings**, but counter, store and cashier titles add up quickly: Counter Sales Executive, Store Executive and Cashier have 4 each.",
    "**Work from office is spelled out in 15.5% of described listings**, against 9.0% across the index, and 10.0% accept 12th pass. The job is on the floor, and the degree bar is low.",
    "**The move that works**: email the store manager a written sales script for one product they stock. Stu can find that manager and write the note from your real work."
  ],
  "stats": [
    {
      "num": "113",
      "label": "Retail sales in Mumbai listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "25.5%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "14.5%",
      "label": "Of listings with a full description ask for CRM tools (Salesforce, HubSpot or similar)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which retail titles do Mumbai stores post for freshers?",
      "sub": "Ten titles as written, plus the job and internship split.",
      "paras": [
        "Retail sales jobs in Mumbai for freshers rarely say retail in the title. Sales Associate is the most common, with 14 of the 113 listings (12.4%), while Retail Sales Executive has 5. Counter Sales Executive, Store Executive and Cashier each have 4, and Store Associate and Retail Assistant each have 2. Search every one of these, not just the word retail.",
        "Two titles need a second look. Corporate Sales Associate, with 3 listings, sells to companies, not to walk-in shoppers. A Quality Executive title tagged retail, with 2, reads like a back-office check rather than a counter. In finance, retail can also mean a branch or a loan desk, so read the first paragraph of each listing before you apply.",
        "Mumbai's postings are scattered. 101 employers placed the 113 listings, the top ten hold 19.5%, and no listing hides the employer. No single chain controls the way in. Only 3 listings are internships, so most of what you will find is a full-time first job on a store floor, with a salary rather than a stipend."
      ],
      "chart": {
        "id": "rrsjimf88Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, 1 to 15 Nov 2026, n=113)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          110,
          3
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
            "Sales Associate",
            "14"
          ],
          [
            "Retail Sales Executive",
            "5"
          ],
          [
            "Counter Sales Executive",
            "4"
          ],
          [
            "Store Executive",
            "4"
          ],
          [
            "Cashier",
            "4"
          ],
          [
            "Retail Sales Associate",
            "3"
          ],
          [
            "Corporate Sales Associate",
            "3"
          ],
          [
            "Quality Executive - Retail Mfb",
            "2"
          ],
          [
            "Store Associate",
            "2"
          ],
          [
            "Retail Assistant",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 101 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "How much do Mumbai retail sales jobs pay freshers?",
      "sub": "Only 28 jobs state pay, so read this with care.",
      "paras": [
        "Among the 28 jobs that state pay in rupees, the median top of range is ₹3.2 lakh a year, or ₹3,24,500. The lower quarter is ₹2.5 lakh and the upper quarter ₹4.5 lakh. For context, the whole-index median is ₹3.8 lakh. But 28 is a small base: it is 25.5% of the 110 jobs, so most Mumbai listings simply leave pay out.",
        "Half of the stated salaries, 14 listings, fall between ₹3 and ₹5 lakh. Nine sit between ₹2 and ₹3 lakh (32.1%), four between ₹5 and ₹8 lakh (14.3%), and one under ₹2 lakh. None states more than ₹8 lakh. Mumbai rent and daily travel take a real bite out of that, so work out your take-home before you accept.",
        "Because so few listings state pay, ask early and ask plainly. What is the fixed monthly amount? Is there an incentive, and how many people on the floor earned it last month? Only 12.7% of described listings mention incentives, so do not assume one exists. The 3 internships state no stipend at all, which is one more question to raise."
      ],
      "callout": "**Lead:** 74.5% of Mumbai retail jobs here give no pay figure, so ask for the fixed amount before the second round."
    },
    {
      "title": "What do Mumbai retail listings want you to be good at?",
      "sub": "The skills 110 full Mumbai descriptions mention.",
      "paras": [
        "Talking to people tops the list: communication skills appear in 56.4% of described listings, close to the 57.2% across the whole index. English follows at 25.5%. Hindi is named in only 5.5%, below the 6.4% index share, perhaps because employers take it for granted in this city. Marathi is not a skill this data tracks, so check each listing.",
        "Then come the counter skills. CRM tools and negotiation are each named in 14.5%. Phone work, meaning calling or telecalling, shows in 12.7%, with Excel close behind at 11.8%. Tally shows in 2.7%, a sign that some counter jobs include billing. In a busy Mumbai store, the same person often greets, sells, bills and calls back the customer who walked out without buying.",
        "So prepare for a floor that moves quickly. Know how to greet a shopper in English, Hindi and Marathi if you can. Practise on a billing screen or a simple Excel sheet. And be ready to explain one product in under a minute, since a customer at a Dadar or Linking Road store will not wait much longer than that."
      ],
      "chart": {
        "id": "rrsjimf88Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (110 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "calling or telecalling",
          "Excel",
          "Hindi"
        ],
        "values": [
          56.4,
          25.5,
          14.5,
          14.5,
          12.7,
          11.8,
          5.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "Do Mumbai retail jobs set targets, and who can apply?",
      "sub": "Targets, entry bars and floor terms across 110 descriptions.",
      "paras": [
        "About one in three Mumbai retail descriptions, 34.5%, names a sales target; the index average is 20.9%. Incentives appear in 12.7%. That fits a mix of store and cashier titles, where the work is service first and selling second, but ask about any target before you sign. A number you cannot reach in your first month is better known on day one than discovered on payday.",
        "Freshers are welcome in 31.8% of descriptions. 12th pass is accepted in 10.0%, over twice the 4.5% index share, while 6.4% say any graduate. Women candidates are named in 4.5%. In short, a degree is not the gate here; turning up on time and staying sharp on your feet through a long day is.",
        "Work from office is spelled out in 15.5%, against 9.0% in the whole index, which for retail means the store floor. Shifts show in 7.3%, PF, ESI or health insurance in 7.3%, and cab or transport in 2.7%. Ask about the closing time and how you get home, especially if the store is far from your local station."
      ],
      "chart": {
        "id": "rrsjimf88Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (110 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "work from office",
          "incentives",
          "night, rotational, US or UK shifts",
          "PF, ESI or health insurance"
        ],
        "values": [
          34.5,
          31.8,
          15.5,
          12.7,
          7.3,
          7.3
        ],
        "unit": "%"
      },
      "callout": "**Check:** only 7.3% name PF, ESI or health insurance, so ask whether you will be on the company payroll or an agency's."
    },
    {
      "title": "How does a fresher get hired in Mumbai retail sales?",
      "sub": "Pick one store, learn its shelf, and write to the person who runs it.",
      "paras": [
        "Write to the store manager. At a chain, also try the area manager who covers a cluster of stores, say the western suburbs from Bandra to Andheri. Only 9 of the 110 described listings (8.2%) include an email address, so you usually have to find this person yourself rather than wait for the listing to name them.",
        "Proof beats a cover letter. Pick one product the store sells and write a short sales script: the opening line, three questions you would ask the shopper, and how you would close or suggest an add-on. Keep it to one page. The email has three lines: who you are, which store and product you chose, and the script attached. Follow up once.",
        "Time it well. Listings here went up midweek: Thursday carried 26 and Friday 25, while Saturday had only 3. Email early in the week, before the weekend rush, when a manager has a moment to read. Stu can do the slow part: it finds the manager, checks the work email, drafts a personal note on why you fit, and sends it from your own inbox only after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **113 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as retail sales when its job title matches that role (the most common titles here: \"Sales Associate\", \"Retail Sales Executive\", \"Counter Sales Executive\"). It counts for the city when it names Mumbai as a location.",
    "Pay: 28 of 110 entry-level listings (25.5%) state a salary in rupees and 0 of 3 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 110 listings (97.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Shine, Naukri, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many fresher retail sales jobs are there in Mumbai?",
      "a": "We found 113 retail sales listings in Mumbai in the Studojo Jobs Index, posted 1 to 15 November 2026. 110 are entry-level jobs and 3 are internships, posted by 101 employers. Listings are not hires, and this is the set we follow, not the whole city."
    },
    {
      "q": "What is the retail sales salary in Mumbai for freshers when pay is listed?",
      "a": "In the 28 jobs that state pay, the median top of range is ₹3.2 lakh a year, and half fall between ₹3 and ₹5 lakh. That is a thin sample, since 74.5% of jobs give no figure. Ask for the fixed monthly pay before you agree to a trial day."
    },
    {
      "q": "Can I find a retail sales internship in Mumbai?",
      "a": "Rarely. Mumbai has 3 internships among its 113 listings, and none of the three mentions a stipend amount. Most stores hire freshers straight into full-time roles such as Sales Associate, Store Executive or Cashier."
    },
    {
      "q": "Do I need a degree for a store job in Mumbai?",
      "a": "Often not. 10.0% of described listings accept 12th pass and 6.4% say any graduate, while 31.8% welcome freshers. Communication, named in 56.4%, is what most listings ask for first."
    },
    {
      "q": "Where are Mumbai retail sales jobs listed?",
      "a": "In this data, Shine carried 33.6% of the listings, Naukri 26.5%, LinkedIn 17.7%, company career sites and ATS pages 15.9% and Internshala 6.2%. That only shows where we found them, not which is better. Use them to spot openings, then email the store manager."
    },
    {
      "q": "Is a cashier job a good start in Mumbai retail?",
      "a": "It can be. Cashier has 4 listings here, the same as Counter Sales Executive and Store Executive, and billing skills such as Excel (11.8%) and Tally (2.7%) show up in descriptions. Ask whether the role moves to the sales floor after a few months."
    }
  ],
  "takeaway": {
    "sub": "What to remember before you walk into a Mumbai store.",
    "items": [
      [
        "Search five titles, not one",
        "Sales Associate has 14 listings; Counter Sales Executive, Store Executive and Cashier have 4 each."
      ],
      [
        "Ask for the pay figure",
        "Only 28 of 110 jobs state pay, with a median top of range of ₹3.2 lakh a year."
      ],
      [
        "A degree is often optional",
        "10.0% accept 12th pass, more than double the index share of 4.5%."
      ],
      [
        "Check payroll and benefits",
        "Benefits such as PF or ESI appear in just 7.3% of Mumbai descriptions."
      ],
      [
        "Send a sales script",
        "Email the store manager a one-page script for a product they stock."
      ]
    ]
  },
  "related": [
    {
      "slug": "retail-sales-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Retail Sales Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Retail Sales Jobs in Mumbai for Freshers",
    "description": "113 active entry-level and internship listings for India posted 1 to 15 November 2026 (retail sales in Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-retail-sales-jobs-in-mumbai-for-freshers-2026" place="report-end" size="card" title={"Want the Mumbai store manager to see your sales script?"} line={"Talking to Stu is free: say the store role and pay you want in Mumbai. Stu finds who is hiring, checks their work email and drafts a short note. Stu sends nothing until you start a campaign."} />
    </DataReport>
  );
}
