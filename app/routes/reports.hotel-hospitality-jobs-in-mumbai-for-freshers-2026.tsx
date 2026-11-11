import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hotel-hospitality-jobs-in-mumbai-for-freshers-2026",
  "title": "Hotel and Hospitality Jobs in Mumbai for Freshers: 1,834 Listings 2026",
  "short": "Hotel Jobs in Mumbai for Freshers 2026",
  "description": "Hotel and hospitality jobs in Mumbai for freshers: 1,834 October listings, but only 5.4% state pay, with a median top of range of 3 lakh a year.",
  "keywords": "hotel and hospitality jobs in mumbai for freshers, fresher hotel and hospitality jobs mumbai, hotel and hospitality salary in mumbai for freshers, hotel and hospitality internship in mumbai",
  "h1": "Hotel and Hospitality Jobs in Mumbai for Freshers:",
  "h1em": "What 1,834 Listings Show",
  "sub": "The Studojo Jobs Index has 1,834 hotel and hospitality listings in Mumbai for October 2026, and 1,272 of them carry one title: Associate Housekeeping. Only 5.4% state pay, with a median top of range of 3 lakh a year.",
  "published": "2026-11-11",
  "scope": "hotel and hospitality in Mumbai · freshers",
  "findings": [
    "**Hotel and hospitality jobs in Mumbai for freshers** number 1,834 October listings in the Studojo Jobs Index, and 1,824 of them are jobs rather than internships.",
    "**One title and a few employers dominate**: Associate Housekeeping has 1,272 listings, and the top ten employers account for 90.0% of the slice.",
    "**Pay is almost never shown**: only 99 jobs (5.4%) state a salary, with a median top of range of 3 lakh a year and a middle band of 2.4 to 4 lakh.",
    "**Most descriptions are short**: only 330 listings have a full description, and 35.5% of those mention communication skills while 14.5% say freshers are welcome.",
    "**The move that works** is to email the hotel's HR manager or the department head, such as the front office manager. Stu finds that person and writes the email."
  ],
  "stats": [
    {
      "num": "1,834",
      "label": "Hotel and hospitality in Mumbai listings, October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 99 jobs that state it (5.4%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "0.5%",
      "label": "Of these listings are internships",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "Which hotel and hospitality jobs can a fresher get in Mumbai?",
      "sub": "Housekeeping is the front door.",
      "paras": [
        "Hotel and hospitality jobs in Mumbai for freshers are mostly housekeeping. Associate Housekeeping has 1,272 listings out of 1,834, and Associate Housekeeping Services adds 122. These are the entry grades that hotels and service providers hire in volume.",
        "Beyond housekeeping, Steward has 51 listings and Executive Steward 49. Front Office Executive has 24, Guest Relation Executive 11 and Commis 11. If you want guest-facing work or the kitchen, your pool is much smaller, so every one of those listings counts.",
        "This is a concentrated slice. Only 153 employers posted, the top ten account for 90.0%, and just 0.3% hide the employer. A large share of what you see is repeat or bulk hiring by a handful of names, not 1,834 separate hotels."
      ],
      "chart": {
        "id": "rhhjimf80Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=1,834)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          1824,
          10
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
            "Associate Housekeeping",
            "1,272"
          ],
          [
            "Associate Housekeeping Services",
            "122"
          ],
          [
            "Steward",
            "51"
          ],
          [
            "Executive Steward",
            "49"
          ],
          [
            "Front Office Executive",
            "24"
          ],
          [
            "Associate - Housekeeping",
            "14"
          ],
          [
            "Guest Relation Executive",
            "11"
          ],
          [
            "Commis",
            "11"
          ],
          [
            "Housekeeping Associate",
            "9"
          ],
          [
            "Housekeeping Staff",
            "9"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 153 different employers posted these listings, and 0.3% of listings do not name the employer."
      }
    },
    {
      "title": "What is the hotel and hospitality salary in Mumbai for freshers?",
      "sub": "Stated pay, top of range, per year.",
      "paras": [
        "Among the 99 hotel and hospitality jobs in Mumbai that state pay, the median top of range is 3 lakh a year. The lower quarter is 2.4 lakh and the upper quarter 4 lakh. It is a narrow, modest band for entry grades.",
        "The 2 to 3 lakh band holds 41 listings (41.4%) and 3 to 5 lakh holds 35 (35.4%). Another 14 reach 5 to 8 lakh, 8 sit under 2 lakh, and 1 reaches 8 to 12 lakh. Higher pay shows up in front office and kitchen roles rather than housekeeping.",
        "The key point is how rarely pay is shown: 94.6% of listings leave it out, and no internship states a stipend. Hotels often include meals, uniform and accommodation, none of which the stated figure counts. Ask what is included before you compare offers."
      ],
      "chart": {
        "id": "rhhjimf80Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (99 jobs that state pay in rupees)",
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
          8,
          41,
          35,
          14,
          1,
          0,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** 5.4% of Mumbai hospitality listings state pay. Ask about meals, uniform and stay."
    },
    {
      "title": "What skills do Mumbai hospitality jobs ask for?",
      "sub": "Skills named in 330 listings with a full description.",
      "paras": [
        "Only 330 of the 1,834 listings have a full description, so read this section as a small sample. Of those, 35.5% mention communication skills and 17.6% mention English. Those are the clear leaders by a wide margin.",
        "Technical skills are close to absent. Excel is named in 4.5%, Hindi in 3.3%, and calling or telecalling in 1.5%. CRM tools appear in 1.2%. Hotels hire for attitude, grooming and how you speak to a guest, and the listings rarely list software.",
        "That gives you a way to stand out. Many descriptions say little, so a clear email that names the department you want, the shifts you can work and the languages you speak tells the hiring manager what the listing did not. Specific beats generic here."
      ],
      "chart": {
        "id": "rhhjimf80Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (330 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "Hindi",
          "calling or telecalling"
        ],
        "values": [
          35.5,
          17.6,
          4.5,
          3.3,
          1.5
        ],
        "unit": "%"
      }
    },
    {
      "title": "What are the shifts, entry rules and posting patterns?",
      "sub": "What the descriptions say, and when listings appear.",
      "paras": [
        "Among the 330 described listings, 14.5% say freshers are welcome, 7.3% mention night, rotational, US or UK shifts, 5.5% mention PF, ESI or health insurance and 3.9% accept 12th pass. A portfolio is named in 7.9%, which suggests some creative or chef roles.",
        "Targets appear in 5.8% and incentives in 3.3%. BTech or computer science shows in 3.3% and any graduate in 2.7%. A hotel management diploma is the more common credential, but it does not show up as a counted term here, so ask directly.",
        "The timing is striking: 78.2% of listings were posted on a Thursday, and Naukri carries 92.8% of the slice. That points to a few large weekly batch postings. If you see a new batch, reply quickly, and also email the hotel, because the batch listing has many readers."
      ],
      "chart": {
        "id": "rhhjimf80Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (330 listings with a full description)",
        "labels": [
          "freshers",
          "a portfolio",
          "night, rotational, US or UK shifts",
          "targets",
          "PF, ESI or health insurance",
          "incentives",
          "a certificate",
          "immediate joining"
        ],
        "values": [
          14.5,
          7.9,
          7.3,
          5.8,
          5.5,
          3.3,
          2.4,
          1.5
        ],
        "unit": "%"
      },
      "callout": "**Pattern:** 78.2% of Mumbai hospitality listings were posted on a Thursday."
    },
    {
      "title": "How do you get hired in a hotel as a fresher in Mumbai?",
      "sub": "Write to the manager who runs the department.",
      "paras": [
        "Large hotels have an HR manager and a department head for each area. For front office or guest relations, email the front office manager. For food and beverage, the F and B manager. For housekeeping, the executive housekeeper. These are the people who actually need staff.",
        "Proof is simple. Send a short note with your diploma or degree, the shifts you can do, languages you speak, and any internship at a hotel or event. Add one line on why that hotel. Your email says who you are, the department, and your availability. Follow up once.",
        "Only 3.3% of described listings print an email address, so you need to find the contact yourself. Stu finds the person who hires, verifies their work email, writes a short note from your real work, and sends it from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **1,834 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as hotel and hospitality when its job title matches that role (the most common titles here: \"Associate Housekeeping\", \"Associate Housekeeping Services\", \"Steward\"). It counts for the city when it names Mumbai as a location.",
    "Pay: 99 of 1,824 entry-level listings (5.4%) state a salary in rupees and 0 of 10 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 330 listings (18.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many hotel and hospitality jobs for freshers are there in Mumbai?",
      "a": "The Studojo Jobs Index has 1,834 hotel and hospitality listings in Mumbai posted in October 2026. Of those, 1,824 are jobs and 10 are internships. Listings are not hires, and bulk postings inflate the count."
    },
    {
      "q": "What is the hotel and hospitality salary in Mumbai for freshers?",
      "a": "Among the 99 jobs that state pay, the median top of range is 3 lakh a year, with a middle band of 2.4 to 4 lakh. Only 5.4% of listings state pay, so ask what is included."
    },
    {
      "q": "Is there a hotel and hospitality internship in Mumbai?",
      "a": "Very few are listed. Only 10 of the 1,834 listings are internships, and none state a stipend in rupees. Emailing a hotel's HR manager directly is often the faster route."
    },
    {
      "q": "Why are so many Mumbai hospitality listings for housekeeping?",
      "a": "Associate Housekeeping has 1,272 of the 1,834 listings, and the top ten employers account for 90.0% of the slice. A few large employers post in volume, which is why one title dominates."
    },
    {
      "q": "Do hospitality jobs in Mumbai need a hotel management degree?",
      "a": "The descriptions rarely say. Among 330 described listings, 14.5% say freshers are welcome and 3.9% accept 12th pass. Ask the hiring manager which qualification the specific role needs."
    },
    {
      "q": "Where are Mumbai hotel jobs listed?",
      "a": "Naukri carries 92.8% of them, company career sites and ATS pages 4.6%, LinkedIn 1.4% and Shine 1.1%. This only shows where the listings were found."
    }
  ],
  "takeaway": {
    "sub": "Five points for hotel and hospitality freshers in Mumbai.",
    "items": [
      [
        "Look past housekeeping",
        "Steward has 51 listings and Front Office Executive 24, in a pool dominated by 1,272 housekeeping listings."
      ],
      [
        "Ask what pay includes",
        "Only 5.4% state pay, and the median top of range is 3 lakh a year."
      ],
      [
        "Reply to batches fast",
        "78.2% of listings were posted on a Thursday."
      ],
      [
        "Be specific",
        "Name the department, shifts and languages, since descriptions say little."
      ],
      [
        "Email the department head",
        "Write to the front office, F and B or housekeeping lead directly."
      ]
    ]
  },
  "related": [
    {
      "slug": "hotel-hospitality-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Hotel and Hospitality Jobs for Freshers 2026"
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
    "name": "Studojo Jobs Index, October 2026: Hotel Jobs in Mumbai for Freshers 2026",
    "description": "1,834 active entry-level and internship listings for India posted in October 2026 (hotel and hospitality in Mumbai), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hotel-hospitality-jobs-in-mumbai-for-freshers-2026" place="report-end" size="card" title={"Want to email the hotel manager who hires?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short personal note. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
