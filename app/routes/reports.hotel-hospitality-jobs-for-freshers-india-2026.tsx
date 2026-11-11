import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hotel-hospitality-jobs-for-freshers-india-2026",
  "title": "Hotel and Hospitality Jobs for Freshers in India: 6,414 Listings, 2026",
  "short": "Hotel and Hospitality Jobs for Freshers 2026",
  "description": "Hotel and hospitality jobs for freshers in India: 6,414 October listings, 28.6% in Mumbai, and a median stated salary of ₹2.8 lakh a year.",
  "keywords": "hotel and hospitality jobs for freshers, hotel and hospitality fresher salary, hotel and hospitality jobs in india 2026, how to get a hotel and hospitality job as a fresher, hotel and hospitality internship",
  "h1": "Hotel and Hospitality Jobs for Freshers in India:",
  "h1em": "What 6,414 Listings Show",
  "sub": "We tracked 6,414 hotel and hospitality jobs for freshers posted in October 2026. Housekeeping titles make up 43.8% under one title alone, and the ten biggest posters hold 76.1% of listings. Only 593 state pay, with a median of ₹2.8 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · hotel and hospitality · freshers and interns",
  "findings": [
    "There are **6,414 hotel and hospitality jobs for freshers** in the Studojo Jobs Index for October 2026, and only 55 of them are internships (0.9%).",
    "**One title dominates.** Associate Housekeeping appears in 2,811 listings (43.8%), followed by Steward at 549 (8.6%) and Front Office Executive at 198 (3.1%).",
    "**Hiring is concentrated.** The ten biggest employers post 76.1% of these listings, so the count overstates how many different openings exist. 962 employers posted in all.",
    "**Pay is stated in only 593 listings (9.3%).** The median stated salary is ₹2.8 lakh a year, and 206 listings sit in the ₹2 to 3 lakh band.",
    "**Email the hotel's HR or front office manager.** Send a short guest-handling note and follow up once. Stu finds the right person and writes the first draft."
  ],
  "stats": [
    {
      "num": "6,414",
      "label": "Hotel and hospitality listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹2.8 lakh",
      "label": "Median stated pay a year, from the 593 jobs that state it (9.3%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "0.9%",
      "label": "Of these listings are internships",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are hotel and hospitality fresher jobs called, and who posts them?",
      "sub": "Housekeeping dominates the count, and a few large posters drive it.",
      "paras": [
        "Associate Housekeeping is the top title with 2,811 of 6,414 listings (43.8%). Variants add more: the hyphenated Associate Housekeeping spelling has 195, Associate Housekeeping Services 144 and Housekeeping Associate 94. Steward has 549 (8.6%).",
        "The guest-facing titles are much smaller. Front Office Executive has 198 listings, Guest Service Associate 132, Front Office Associate 106 and Guest Relation Executive 72. Commis, the entry kitchen title, has 79. If you want front office or kitchen, you are competing for a much smaller pool.",
        "Be careful with the totals. 962 employers posted these listings, but the top ten account for 76.1% of them, and 1.1% hide the employer. Large hotel groups post the same role many times for different properties, so 6,414 listings does not mean 6,414 separate vacancies."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Associate Housekeeping",
            "2,811"
          ],
          [
            "Steward",
            "549"
          ],
          [
            "Front Office Executive",
            "198"
          ],
          [
            "Associate - Housekeeping",
            "195"
          ],
          [
            "Associate Housekeeping Services",
            "144"
          ],
          [
            "Guest Service Associate",
            "132"
          ],
          [
            "Front Office Associate",
            "106"
          ],
          [
            "Housekeeping Associate",
            "94"
          ],
          [
            "Commis",
            "79"
          ],
          [
            "Guest Relation Executive",
            "72"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 962 different employers posted these listings, and 1.1% of listings do not name the employer."
      },
      "callout": "**Read it this way:** 2,811 housekeeping listings are mostly repeat posts by a handful of employers."
    },
    {
      "title": "Where are hotel and hospitality jobs in India?",
      "sub": "Mumbai holds more than a quarter of the listings.",
      "paras": [
        "Mumbai has 1,834 listings, 28.6% of the total and nearly three times Bengaluru at 630 (9.8%). Hyderabad has 489 (7.6%), Chennai 361 (5.6%) and Pune 298 (4.6%). Delhi has 209 and Ahmedabad 186.",
        "Hubli appears at 313 listings (4.9%), which is unusual and likely reflects a few large postings for one employer rather than a hospitality hub. Goa has 123 (1.9%) and Gurugram 159 (2.5%). If you want a resort in Goa, the supply is real but small.",
        "Only 42 listings (0.7%) are marked remote and 278 name no city. A listing can name more than one city. Hospitality is local work, so choose a city first and look at the hotels in it."
      ],
      "chart": {
        "id": "rhhjffi33Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=6,414)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Hyderabad",
          "Chennai",
          "Hubli",
          "Pune",
          "Delhi",
          "Ahmedabad",
          "Gurugram",
          "Goa"
        ],
        "values": [
          1834,
          630,
          489,
          361,
          313,
          298,
          209,
          186,
          159,
          123
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
            "Mumbai",
            "1,834",
            "28.6%"
          ],
          [
            "Bengaluru",
            "630",
            "9.8%"
          ],
          [
            "Hyderabad",
            "489",
            "7.6%"
          ],
          [
            "Chennai",
            "361",
            "5.6%"
          ],
          [
            "Hubli",
            "313",
            "4.9%"
          ],
          [
            "Pune",
            "298",
            "4.6%"
          ],
          [
            "Delhi",
            "209",
            "3.3%"
          ],
          [
            "Ahmedabad",
            "186",
            "2.9%"
          ],
          [
            "Gurugram",
            "159",
            "2.5%"
          ],
          [
            "Goa",
            "123",
            "1.9%"
          ]
        ],
        "note": "A listing can name more than one city. 42 listings are marked remote and 278 name no city."
      }
    },
    {
      "title": "What is a hotel and hospitality fresher salary in India?",
      "sub": "Most stated pay is under ₹5 lakh a year, and nine in ten listings do not state it.",
      "paras": [
        "Of 6,359 jobs, 593 (9.3%) state pay in rupees. The median stated salary, using the top of each range, is ₹2.8 lakh a year. The middle half runs from ₹2.1 lakh to ₹3.8 lakh. Because pay is stated so rarely, this is a thin guide.",
        "The ₹2 to 3 lakh band holds 206 listings (34.7%) and ₹3 to 5 lakh holds 205 (34.6%). 104 listings (17.5%) are under ₹2 lakh. 62 reach ₹5 to 8 lakh, 12 reach ₹8 to 12 lakh and 4 reach ₹12 to 20 lakh.",
        "Two internships state a stipend, with a median of ₹33,333 a month. Two numbers do not make a pattern, so ask. Housing and meals can be part of the package in hotels, and the listing may not say."
      ],
      "chart": {
        "id": "rhhjffi33Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (593 jobs that state pay in rupees)",
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
          104,
          206,
          205,
          62,
          12,
          4,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do hotel and hospitality listings ask for?",
      "sub": "Communication and English, with a 12th pass accepted in some roles.",
      "paras": [
        "Of 2,805 listings with a full description, 1,198 (42.7%) mention communication skills and 402 (14.3%) mention English. Excel appears in 133 (4.7%) and Hindi in 97 (3.5%). CRM tools appear in 49 (1.7%). Hospitality asks for how you speak, not what software you know.",
        "On conditions, 314 listings (11.2%) say freshers and 115 (4.1%) accept a 12th pass, which is higher than in most roles here. 91 mention night, rotational or US or UK shifts. 120 mention PF, ESI or health insurance, which is worth checking in the offer.",
        "The word portfolio appears in 399 listings (14.2%), and a keyword match may catch hotel or room portfolios as well as personal ones, so do not read it as a demand for one. Targets appear in 246 (8.8%) and incentives in 72 (2.6%), mostly in sales and front office roles."
      ],
      "chart": {
        "id": "rhhjffi33Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (2,805 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "Hindi",
          "CRM tools (Salesforce, HubSpot or similar)",
          "negotiation",
          "calling or telecalling",
          "Java",
          "social media",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          42.7,
          14.3,
          4.7,
          3.5,
          1.7,
          1.7,
          1.2,
          1.0,
          0.5,
          0.4
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a hotel and hospitality fresher?",
      "sub": "Hotels hire property by property, so write to the property.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). With 79.1% of listings on Naukri, the queue there is long. Write instead to the hotel's HR manager, the front office manager or the executive housekeeper, depending on your role.",
        "Send proof you can handle guests. A short written note on how you would handle a late check-in complaint, your hotel management certificate, or a photo of a banquet or event you worked at as a volunteer all work. Pick one. Attach it, and mention the languages you speak.",
        "Keep the email to three lines: who you are, the proof, and whether the property is adding a trainee or associate. Follow up once. Thursday carries 51.8% of postings, so write on Friday or Monday when managers are catching up. Stu finds the manager, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **6,414 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as hotel and hospitality when its job title matches that role (the most common titles here: \"Associate Housekeeping\", \"Steward\", \"Front Office Executive\").",
    "Pay: 593 of 6,359 entry-level listings (9.3%) state a salary in rupees and 2 of 55 internships (3.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 2,805 listings (43.7%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best hotel and hospitality jobs for freshers in India?",
      "a": "Housekeeping associate roles are the most common, at 2,811 of 6,414 October listings. Steward (549) and Front Office Executive (198) are the next largest. Front office and guest relation roles are smaller but closer to guests."
    },
    {
      "q": "What is a hotel and hospitality fresher salary in India?",
      "a": "Among 593 listings that state pay, the median is ₹2.8 lakh a year. 34.7% are in the ₹2 to 3 lakh band, 34.6% in ₹3 to 5 lakh and 17.5% under ₹2 lakh. Only 9.3% of listings state pay."
    },
    {
      "q": "Which city has the most hotel and hospitality jobs?",
      "a": "Mumbai has 1,834 listings, 28.6% of the total. Bengaluru follows with 630, Hyderabad with 489 and Chennai with 361. A few large employers post many of these, so check the specific property."
    },
    {
      "q": "Can a 12th pass student get a hotel job as a fresher?",
      "a": "Some roles accept it. 115 of 2,805 described listings (4.1%) mention a 12th pass. A hotel management diploma or degree widens the options, especially for front office and kitchen roles."
    },
    {
      "q": "Is there a hotel and hospitality internship?",
      "a": "There are 55 internships among 6,414 listings, 0.9%. Two state a stipend, with a median of ₹33,333 a month. Most freshers start in a trainee or associate job instead."
    },
    {
      "q": "How do I get a hotel and hospitality job as a fresher?",
      "a": "Email the HR manager or the department head at the property, with one proof of guest handling such as a written scenario or a certificate. Three lines, one follow-up. That is more direct than joining the queue on a portal."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 6,414 October listings.",
    "items": [
      [
        "Count with care",
        "The top ten employers post 76.1% of listings, so many are repeat posts."
      ],
      [
        "Mumbai is the centre",
        "It has 1,834 listings, 28.6% of the total."
      ],
      [
        "Pay is rarely stated",
        "Only 593 listings state it, with a median of ₹2.8 lakh a year."
      ],
      [
        "Check the extras",
        "120 listings mention PF, ESI or health insurance, and 91 mention shifts."
      ],
      [
        "Write to the property",
        "The HR or front office manager decides faster than a portal."
      ]
    ]
  },
  "related": [
    {
      "slug": "customer-service-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Customer Service Jobs for Freshers 2026"
    },
    {
      "slug": "technical-support-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Technical Support Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Hotel and Hospitality Jobs for Freshers 2026",
    "description": "6,414 active entry-level and internship listings for India posted in October 2026 (hotel and hospitality), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hotel-hospitality-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the hotel's HR manager directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
