import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "retail-sales-jobs-in-chennai-for-freshers-2026",
  "title": "Retail Sales Jobs in Chennai for Freshers 2026: Pay, PF and Titles",
  "short": "Retail Sales Jobs in Chennai for Freshers",
  "description": "Retail sales jobs in Chennai for freshers: 82 listings in early November, all of them jobs, with ₹3 lakh median stated pay and PF or ESI named in 21.2%.",
  "keywords": "retail sales jobs in chennai for freshers, fresher retail sales jobs chennai, retail sales salary in chennai for freshers, retail sales internship in chennai",
  "h1": "Retail Sales Jobs in Chennai for Freshers:",
  "h1em": "82 Jobs, No Internships",
  "sub": "Chennai has 82 retail sales listings in the Studojo Jobs Index for 1 to 15 November 2026, and every one is a job. The 33 that give a salary put the median top of range at ₹3 lakh a year. 21.2% of described listings name PF, ESI or health insurance, almost three times the index share.",
  "published": "2026-11-27",
  "scope": "retail sales in Chennai · freshers",
  "findings": [
    "**Retail sales jobs in Chennai for freshers** total 82 listings posted 1 to 15 November by 70 employers, and none is an internship. You start in a full job, not a trial seat.",
    "**Stated pay is tightly bunched**: of the 33 jobs that give a figure, the central half spans ₹2.6 lakh to ₹3.5 lakh a year around a ₹3 lakh median, and none is under ₹2 lakh.",
    "**Benefits get named more often here**: 21.2% of described listings mention PF, ESI or health insurance, against 7.4% across the whole index.",
    "**12th pass is welcome in 13.8% of described listings**, three times the 4.5% index share, while only 3.8% ask for an MBA or PGDM.",
    "**The move that works** is to email the showroom or store manager with a short note on what you saw on their floor. Stu finds that manager and writes the email."
  ],
  "stats": [
    {
      "num": "82",
      "label": "Retail sales in Chennai listings, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 33 jobs that state it (40.2%)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "12.5%",
      "label": "Of listings with a full description ask for CRM tools (Salesforce, HubSpot or similar)",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Which store titles should a Chennai fresher search?",
      "sub": "The top ten titles, word for word.",
      "paras": [
        "Retail sales jobs in Chennai for freshers show up under store titles more than retail ones. Sales Associate leads with 10 of 82 listings (12.2%), then Store Executive with 7, Cashier with 6 and Store Associate with 4. Retail Sales Associate, Retail Sales Executive, Showroom Sales Executive and Counter Sales Executive have 3 each.",
        "Showroom Sales Executive is a clue to how Chennai sells. Large showrooms for sarees, gold, electronics and furniture, many of them around T. Nagar, hire people who can stay with one family through a long purchase. Counter titles are quicker and more transactional. Decide which pace suits you, because the daily work is very different.",
        "Two titles are not store work. A Quality Executive title tagged retail has 3 listings, and a Relationship Officer title for merchant services has 2; both read like finance or back-office roles. Behind the 82 listings are 70 employers; the ten biggest account for 25.6%, and one listing hides its employer (1.2%). All 82 are jobs, with no internships at all."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Sales Associate",
            "10"
          ],
          [
            "Store Executive",
            "7"
          ],
          [
            "Cashier",
            "6"
          ],
          [
            "Store Associate",
            "4"
          ],
          [
            "Quality Executive - Retail Mfb",
            "3"
          ],
          [
            "Retail Sales Associate",
            "3"
          ],
          [
            "Showroom Sales Executive",
            "3"
          ],
          [
            "Retail Sales Executive",
            "3"
          ],
          [
            "Counter Sales Executive",
            "3"
          ],
          [
            "Me Relationship Officer-Retail Ro-Merchant Services",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 70 different employers posted these listings, and 1.2% of listings do not name the employer."
      }
    },
    {
      "title": "How much does a Chennai store job pay at the start?",
      "sub": "Yearly pay ceilings in the 33 Chennai jobs that give a figure.",
      "paras": [
        "The median top of range is ₹3 lakh a year (₹3,00,000) across the 33 Chennai jobs that state pay. Those 33 make up 40.2% of the 82 jobs, a better disclosure rate than the 36.2% for the whole index. The middle half runs from ₹2.6 lakh to ₹3.5 lakh, a narrow spread that makes two offers easy to compare side by side.",
        "Twenty listings (60.6%) top out in the ₹3 to ₹5 lakh band, and 12 (36.4%) in ₹2 to ₹3 lakh. Just one reaches ₹5 to ₹8 lakh, and none sits under ₹2 lakh or above ₹8 lakh. So a Chennai store offer whose top of range is below ₹2.6 lakh is in the bottom quarter of the pay stated here.",
        "The median sits under the ₹3.8 lakh median of the whole index, which is what you would expect from counter, cashier and showroom roles. Incentives show in 11.2% of described listings, so most of your pay will be the fixed part. Get that monthly figure in writing, along with the date your first salary is paid."
      ],
      "chart": {
        "id": "rrsjicf118Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (33 jobs that state pay in rupees)",
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
          0,
          12,
          20,
          1,
          0,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 60.6% of stated salaries fall in the ₹3 to ₹5 lakh band, and none is under ₹2 lakh."
    },
    {
      "title": "Do Chennai retail jobs offer PF, ESI and steady terms?",
      "sub": "Benefits, targets and entry bars in 80 full descriptions.",
      "paras": [
        "One in five described Chennai listings (21.2%) names PF, ESI or health insurance, while the whole index manages 7.4%. That matters in retail, where some floor staff are hired through agencies. If a listing names these benefits, confirm that the store itself employs you; if it does not name them, raise the question anyway before you accept.",
        "Targets appear in 37.5%, against 20.9% in the index, and incentives in 11.2%. On eligibility, 28.8% say freshers can apply, 13.8% take candidates with 12th pass, 8.8% accept any graduate, and a mere 3.8% want an MBA or PGDM. The door is open to school leavers and new graduates alike, as long as you can handle a sales number.",
        "Shifts show in 8.8% and work from office in 7.5%. Immediate joining appears in 3.8% and a two-wheeler or driving licence in 2.5%. Listings arrived mostly midweek, with Wednesday at 19 and Thursday at 18, and only 3 on Sunday, so an email sent on Monday or Tuesday reaches a manager before the next batch goes up."
      ],
      "chart": {
        "id": "rrsjicf118Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (80 listings with a full description)",
        "labels": [
          "targets",
          "freshers",
          "PF, ESI or health insurance",
          "incentives",
          "night, rotational, US or UK shifts",
          "work from office",
          "a portfolio"
        ],
        "values": [
          37.5,
          28.8,
          21.2,
          11.2,
          8.8,
          7.5,
          6.2
        ],
        "unit": "%"
      },
      "callout": "**Ask:** PF and ESI are named in 21.2% of listings here, so raise them in every interview."
    },
    {
      "title": "Do you need Hindi for retail sales in Chennai?",
      "sub": "Language and skill mentions in 80 Chennai descriptions.",
      "paras": [
        "Rarely. Hindi is named in only 3.8% of described listings, below the 6.4% index share. English appears in 25.0%. This data has no Tamil tag, yet on a Pondy Bazaar or Anna Nagar shop floor it is the language most customers walk in with, so say clearly that you speak it if you do.",
        "Communication skills top the chart at 57.5%, level with the 57.2% across the index. CRM tools and negotiation follow at 12.5% each, and Excel at 7.5%. Calling or telecalling shows in just 3.8%, which tells you these are face-to-face jobs on a floor or at a counter, not phone sales from a desk.",
        "So prepare for the floor. Practise greeting a family that walks in together and finding out who decides. Learn to talk about price without giving a discount at the first push. If the store is a showroom, learn one product range deeply, because a customer comparing two models will ask far more than the price tag says."
      ],
      "chart": {
        "id": "rrsjicf118Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (80 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "Excel"
        ],
        "values": [
          57.5,
          25.0,
          12.5,
          12.5,
          7.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get a Chennai showroom or store to hire you as a fresher?",
      "sub": "Write to the showroom or store manager with a note about their customers.",
      "paras": [
        "Email the showroom manager or store manager. At a chain, the area manager who runs a group of stores, say along OMR or in Velachery, hires for several outlets at once. Contact details are scarce: just 4 descriptions out of 80 (5.0%) print an email address, so plan on tracking down the manager instead of waiting for a portal reply.",
        "Send one small piece of proof. Spend half an hour in their showroom as a shopper, then write a short note: who walked in, what they asked, where a sale slipped, and the line you would have used, in English and Tamil if you speak it. Write the email in three short lines: who you are, what you noticed, the note attached. Follow up once, after a few days.",
        "Employer career sites held 36.6% of these listings and Naukri 26.8%, so keep applying there. But a manager will read a note about their own floor. Stu handles the legwork: it finds who is hiring for the showroom, gets a verified work email, writes the email on why you fit, then mails it from your own inbox when your campaign starts."
      ]
    }
  ],
  "method": [
    "This report counts **82 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. A listing counts as retail sales when its job title matches that role (the most common titles here: \"Sales Associate\", \"Store Executive\", \"Cashier\"). It counts for the city when it names Chennai as a location.",
    "Pay: 33 of 82 entry-level listings (40.2%) state a salary in rupees. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 80 listings (97.6%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many Chennai retail sales openings are there for freshers?",
      "a": "We track 82 Chennai retail sales listings dated 1 to 15 November 2026, all entry-level jobs, from 70 employers. This is the Studojo Jobs Index slice, not every vacancy in the city, and a listing does not mean a hire."
    },
    {
      "q": "What is a typical retail sales salary in Chennai for freshers?",
      "a": "Among the 33 jobs that state pay, the median top of range is ₹3 lakh a year, and the middle half is ₹2.6 lakh to ₹3.5 lakh. None states under ₹2 lakh. Most pay is fixed, as only 11.2% of described listings mention incentives."
    },
    {
      "q": "Can I start with a retail sales internship in Chennai?",
      "a": "Not in this data. All 82 Chennai retail sales listings are jobs, and none is an internship. A fresher usually starts directly as a Sales Associate, Store Executive or Cashier."
    },
    {
      "q": "Is 12th pass enough for a fresher retail sales job in Chennai?",
      "a": "For a fair number of roles, yes. School leavers with 12th pass are accepted in 13.8% of descriptions, freshers are welcome in 28.8%, and an MBA or PGDM is asked for in only 3.8%. Clear speech with customers helps more than a degree on the floor."
    },
    {
      "q": "Do Chennai retail jobs give PF and ESI?",
      "a": "More often than most jobs we track: PF, ESI or health insurance shows in 21.2% of Chennai descriptions, nearly three times the index rate of 7.4%. Before joining, find out who actually employs you: the store itself or a staffing agency."
    },
    {
      "q": "Is a cashier job counted as retail sales in Chennai?",
      "a": "In this data, yes. Cashier has 6 listings, the third most common title after Sales Associate and Store Executive. It is a fair way into a store, and you can ask how soon cashiers move onto the sales floor."
    }
  ],
  "takeaway": {
    "sub": "Five points for Chennai retail freshers.",
    "items": [
      [
        "Search store titles",
        "Sales Associate has 10 listings, Store Executive 7 and Cashier 6."
      ],
      [
        "Expect ₹2.6 to ₹3.5 lakh",
        "Half of the 33 stated salaries sit inside this band, with ₹3 lakh at the centre."
      ],
      [
        "Raise PF and ESI early",
        "21.2% of described listings name them, almost three times the index share."
      ],
      [
        "Say which languages you sell in",
        "Hindi appears in only 3.8% of listings and Tamil is not tracked, so state what you speak."
      ],
      [
        "Email the showroom manager",
        "Send a short note on what you saw on their floor."
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
      "slug": "jobs-for-freshers-in-chennai-2026",
      "kicker": "City",
      "title": "Jobs for Freshers in Chennai 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Retail Sales Jobs in Chennai for Freshers",
    "description": "82 active entry-level and internship listings for India posted 1 to 15 November 2026 (retail sales in Chennai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-retail-sales-jobs-in-chennai-for-freshers-2026" place="report-end" size="card" title={"Want the Chennai showroom manager to read your note?"} line={"Tell Stu you want a showroom or store job in Chennai and the pay you expect. Stu finds the manager, verifies the work email and writes a short email on why you fit. It leaves your own inbox only after your campaign begins."} />
    </DataReport>
  );
}
