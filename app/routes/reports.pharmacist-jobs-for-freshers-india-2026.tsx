import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "pharmacist-jobs-for-freshers-india-2026",
  "title": "Pharmacist Jobs for Freshers in India 2026: Pay, Cities, Titles",
  "short": "Pharmacist Jobs for Freshers 2026",
  "description": "Pharmacist jobs for freshers: 305 October listings in the Studojo Jobs Index, 42.6% titled plain Pharmacist, a median stated pay of ₹3 lakh a year.",
  "keywords": "pharmacist jobs for freshers, pharmacist fresher salary, pharmacist jobs in india 2026, how to get a pharmacist job as a fresher, pharmacist internship",
  "h1": "Pharmacist Jobs for Freshers in India:",
  "h1em": "What 305 Listings Show",
  "sub": "The Studojo Jobs Index holds 305 October listings for pharmacist freshers, from 213 employers. 36.9% state pay, with a median of ₹3 lakh a year. Bengaluru has the most listings, followed by Hyderabad and Chennai.",
  "published": "2026-11-11",
  "scope": "India · pharmacist · freshers and interns",
  "findings": [
    "**305 pharmacist listings** for freshers and interns were posted in October 2026, from 213 employers. 130 of them use the plain title Pharmacist.",
    "**Pay is stated in 36.9% of listings.** The median among the 109 that state it is ₹3 lakh a year, and 51.4% fall between ₹3 and 5 lakh.",
    "**Bengaluru leads with 44 listings (14.4%)**, then Hyderabad with 31 and Chennai with 25. Kochi appears in the top ten with 10.",
    "**The bar is practical, not technical.** 27.7% mention freshers, 43.2% want communication skills, and sales-style terms like targets are rare at 2.6%.",
    "**The move that works is a short email to the pharmacy head or store manager** with your registration status and one small piece of work. Stu can find that person and write the note, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "305",
      "label": "Pharmacist listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 109 jobs that state it (36.9%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "3.3%",
      "label": "Of these listings are internships",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are pharmacist jobs for freshers called, and who posts them?",
      "sub": "One title dominates, with hospital and retail variants behind it.",
      "paras": [
        "Pharmacist jobs for freshers mostly use the plain title Pharmacist. It appears in 130 of the 305 listings (42.6%), which is a much more concentrated naming pattern than in sales or teaching. Pharmacy Assistant comes next with 18 (5.9%), then Hospital Pharmacist (12), Retail Pharmacist (10) and Clinical Pharmacist (9).",
        "The smaller titles tell you where the work is. Registered Pharmacist and Junior Pharmacist each have 5 listings, and Pharmacy Sales Associate has 4. Hospital and clinical titles point to wards and dispensing, while retail titles point to counters and chains. A few listings are remote pharmacy operations internships.",
        "Posting is spread across 213 employers. The ten biggest hold 19.0% of listings, and 4.6% hide the employer name. The count is small, so a handful of postings can shift the percentages, but the pattern is clear: this is mostly a local, hospital and chain hiring market."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Pharmacist",
            "130"
          ],
          [
            "Pharmacy Assistant",
            "18"
          ],
          [
            "Hospital Pharmacist",
            "12"
          ],
          [
            "Retail Pharmacist",
            "10"
          ],
          [
            "Clinical Pharmacist",
            "9"
          ],
          [
            "Registered Pharmacist",
            "5"
          ],
          [
            "Junior Pharmacist",
            "5"
          ],
          [
            "Pharmacy Sales Associate",
            "4"
          ],
          [
            "Pharmacy Assistant Intern (Pharmacy Operations, Medication Management, Inventory, Healthcare) / Remote",
            "4"
          ],
          [
            "Pharmacist Narayana Health",
            "3"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 213 different employers posted these listings, and 4.6% of listings do not name the employer."
      }
    },
    {
      "title": "Where are pharmacist jobs in India?",
      "sub": "South India fills most of the top five.",
      "paras": [
        "Bengaluru has the most pharmacist listings with 44 (14.4%). Hyderabad follows with 31 (10.2%), Chennai with 25 (8.2%), Delhi with 22 (7.2%) and Mumbai with 21 (6.9%). Pune has 12. Three southern cities in the top three is the pattern that stands out.",
        "Kochi is the surprise in the top ten with 10 listings (3.3%), ahead of Ahmedabad (9), Gurugram (7) and Chandigarh (5). A city that size showing up means hospital and pharmacy chains are hiring beyond the metros, so a smaller city may be worth a look.",
        "Remote is not a feature of this job. 11 listings (3.6%) are marked remote and 24 name no city. A listing can name more than one city, and the numbers are small, so use them to compare places, not to rank them to the last listing. Choose a city where you can show up in person."
      ],
      "chart": {
        "id": "rpjffi243Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=305)",
        "labels": [
          "Bengaluru",
          "Hyderabad",
          "Chennai",
          "Delhi",
          "Mumbai",
          "Pune",
          "Kochi",
          "Ahmedabad",
          "Gurugram",
          "Chandigarh"
        ],
        "values": [
          44,
          31,
          25,
          22,
          21,
          12,
          10,
          9,
          7,
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
            "Bengaluru",
            "44",
            "14.4%"
          ],
          [
            "Hyderabad",
            "31",
            "10.2%"
          ],
          [
            "Chennai",
            "25",
            "8.2%"
          ],
          [
            "Delhi",
            "22",
            "7.2%"
          ],
          [
            "Mumbai",
            "21",
            "6.9%"
          ],
          [
            "Pune",
            "12",
            "3.9%"
          ],
          [
            "Kochi",
            "10",
            "3.3%"
          ],
          [
            "Ahmedabad",
            "9",
            "3.0%"
          ],
          [
            "Gurugram",
            "7",
            "2.3%"
          ],
          [
            "Chandigarh",
            "5",
            "1.6%"
          ]
        ],
        "note": "A listing can name more than one city. 11 listings are marked remote and 24 name no city."
      }
    },
    {
      "title": "What is the pharmacist fresher salary in India?",
      "sub": "36.9% of listings state pay, a better rate than in many roles.",
      "paras": [
        "The pharmacist fresher salary stated in listings has a median of ₹3 lakh a year, taking the top of each range. The middle half runs from ₹2.4 lakh to ₹3.5 lakh. That comes from 109 listings, which is 36.9% of the jobs, so roughly two in three do not say.",
        "The bands are tight. 56 listings (51.4%) fall in ₹3 to 5 lakh and 36 (33.0%) in ₹2 to 3 lakh. 10 (9.2%) are under ₹2 lakh. Above ₹5 lakh, the field thins fast: 4 listings (3.7%) reach ₹5 to 8 lakh and 3 (2.8%) go to ₹8 to 12 lakh. None go higher.",
        "Internships are few and rarely priced. Of 10 internship listings, 1 states a stipend, at ₹14,000 a month. The narrow spread means your pay depends less on negotiating and more on which employer and city you pick, so compare hospital and retail offers on hours and shifts, not only the figure."
      ],
      "chart": {
        "id": "rpjffi243Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (109 jobs that state pay in rupees)",
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
          10,
          36,
          56,
          4,
          3,
          0,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What conditions do pharmacist listings state?",
      "sub": "Share of the 271 listings with a full description that mention each term.",
      "paras": [
        "Freshers are welcome in 27.7% of descriptions, which is the largest condition after skills. Communication skills appear in 43.2% and English in 10.7%. Excel appears in 4.4% and Hindi in 3.7%. Counter and ward jobs depend on speaking clearly to patients, and the listings reflect that.",
        "Some terms matter for daily life. Work from office is stated in 6.3% and PF, ESI or health insurance in 6.6%. Night, rotational, US or UK shifts appear in 4.8%, which points to hospitals and 24-hour chains. Incentives are named in 6.6% and targets in 2.6%, so this is not a sales-first job.",
        "A certificate is mentioned in 6.6% of descriptions, while any graduate appears in 3.7% and 12th pass in 3.0%. Only 1.1% mention BTech, BE or computer science. Technical software terms are almost absent. What these listings reward is dependable, careful work with medicines and customers."
      ],
      "chart": {
        "id": "rpjffi243Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (271 listings with a full description)",
        "labels": [
          "freshers",
          "PF, ESI or health insurance",
          "incentives",
          "a certificate",
          "work from office",
          "night, rotational, US or UK shifts",
          "work from home",
          "targets",
          "immediate joining"
        ],
        "values": [
          27.7,
          6.6,
          6.6,
          6.6,
          6.3,
          4.8,
          2.6,
          2.6,
          2.2
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a pharmacist fresher?",
      "sub": "Write to the person who runs the pharmacy.",
      "paras": [
        "Online applications are crowded. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% per online application, with an average of about 242 applications per opening (citing Business Insider data). In pharmacy, the person who decides is the chief pharmacist, the pharmacy in-charge at a hospital, or the store or area manager at a chain. Write to them directly.",
        "Send one small piece of real work. A one-page note works well: how you would check expiry dates and stock on a shelf, or how you would explain a prescription to a patient in plain words. State your registration status clearly in the first line, since employers will look for it. If you have interned at a pharmacy, say what you handled.",
        "Keep the email to three lines: who you are, your registration status and the one-page note, and a request for a short visit or call. Follow up once. Stu does the slow parts: it finds the pharmacy head, verifies the work email, writes the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **305 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as pharmacist when its job title matches that role (the most common titles here: \"Pharmacist\", \"Pharmacy Assistant\", \"Hospital Pharmacist\").",
    "Pay: 109 of 295 entry-level listings (36.9%) state a salary in rupees and 1 of 10 internships (10.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 271 listings (88.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are pharmacist jobs for freshers?",
      "a": "They are entry-level roles dispensing and advising at hospitals, retail pharmacies and chains. The Studojo Jobs Index tracked 305 such listings posted in October 2026, and 130 are titled plain Pharmacist."
    },
    {
      "q": "What is the pharmacist fresher salary in India?",
      "a": "The median stated pay is ₹3 lakh a year, taking the top of each range. It comes from 109 listings, 36.9% of the total. The middle half runs from ₹2.4 lakh to ₹3.5 lakh."
    },
    {
      "q": "Which cities have the most pharmacist jobs?",
      "a": "Bengaluru has 44 listings, Hyderabad 31 and Chennai 25. Delhi has 22 and Mumbai 21. Kochi also reaches the top ten with 10."
    },
    {
      "q": "Is there a pharmacist internship?",
      "a": "Yes, but few. 10 of the 305 listings (3.3%) are internships, and only 1 states a stipend, at ₹14,000 a month. Ask about the pay and whether it can lead to a full-time role."
    },
    {
      "q": "Do pharmacist jobs for freshers accept any graduate?",
      "a": "Rarely. Only 3.7% of descriptions say any graduate and 3.0% accept 12th pass. 27.7% welcome freshers, but pharmacist roles normally expect your pharmacy qualification and registration. Check the description for each role."
    },
    {
      "q": "How do you get a pharmacist job as a fresher?",
      "a": "Email the chief pharmacist, pharmacy in-charge or store manager with your registration status and a one-page note. Keep it to three lines and follow up once. Stu can find the person and draft the email from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a pharmacist fresher.",
    "items": [
      [
        "Search the plain title",
        "Pharmacist is 42.6% of listings. Add Pharmacy Assistant and Hospital Pharmacist."
      ],
      [
        "Look south first",
        "Bengaluru, Hyderabad and Chennai lead, and Kochi is in the top ten."
      ],
      [
        "Compare on hours",
        "Pay ranges are tight, with a median of ₹3 lakh a year, so shifts matter."
      ],
      [
        "Expect some night shifts",
        "4.8% of descriptions mention night or rotational shifts."
      ],
      [
        "Email the pharmacy head",
        "Lead with your registration status and a one-page note."
      ]
    ]
  },
  "related": [
    {
      "slug": "mechanical-engineer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Mechanical Engineer Jobs for Freshers 2026"
    },
    {
      "slug": "civil-engineer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Civil Engineer Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Pharmacist Jobs for Freshers 2026",
    "description": "305 active entry-level and internship listings for India posted in October 2026 (pharmacist), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-pharmacist-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the pharmacy head instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
