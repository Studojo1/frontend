import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "electrical-engineering-internship-india-2026",
  "title": "Electrical Engineering Internship in India: 148 Listings, ITI to BTech",
  "short": "Electrical Engineering Internship 2026",
  "description": "Electrical engineering internship in India: 148 listings in the Studojo Jobs Index, 15 for diploma holders, Bengaluru leads with 20, only 8 state a stipend.",
  "keywords": "electrical engineering internship in india, electrical internship, diploma electrical internship, electronics engineering internship",
  "h1": "Electrical Engineering Internship in India:",
  "h1em": "Graduate, Diploma or ITI",
  "sub": "The Studojo Jobs Index has 148 electrical engineering internships in India posted in the first half of November 2026. The titles split by qualification: graduate, diploma and ITI. Only 8 state a stipend, and ten employers post 56.8% of all the listings.",
  "published": "2026-11-20",
  "scope": "India · electrical engineering internship",
  "findings": [
    "**An electrical engineering internship in India** has 148 listings in the Studojo Jobs Index, but only 66 employers behind them, and the top ten post 56.8%.",
    "**Titles name the qualification**: Graduate Electrical Internship has 20 listings, Diploma Electrical Internship 15 and an ITI electronics title 3, so diploma and ITI holders have a lane of their own.",
    "**Company career sites carry 62.8%** of these listings, against 21.4% across the index, and Monday alone brought 47 of them (31.8%).",
    "**Only 8 of 148 state a stipend**, with a median top of range of ₹12,500 a month. BTech, BE or computer science is named in 16.6% of described listings.",
    "**What works** is a short email to the electrical or maintenance head, with a photo of a project you actually built. Stu can locate that engineer and, once you start a campaign, send the email from your own inbox."
  ],
  "stats": [
    {
      "num": "148",
      "label": "Electrical engineering internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "5.4%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "9.7%",
      "label": "Of listings with a full description ask for Python",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "Is there a diploma electrical internship, or only for BTech?",
      "sub": "The titles split by qualification.",
      "paras": [
        "An electrical engineering internship in India is labelled by who it is for. Graduate Electrical Internship leads with 20 of the 148 listings (13.5%) and Graduate Electrical Engineer Internship adds 13 (8.8%). Diploma Electrical Internship has 15 (10.1%). Iti Fitter Electronical Electronics Intern, spelled as posted, has 3. Diploma and ITI holders are named in the title itself, so you know at a glance which seats are yours.",
        "Embedded work is the second thread. Intern Bachelors Embedded Eng has 16 listings (10.8%) and Embedded Systems Internship 3. Electronics Engineering Internship adds 3. If you study electronics and communication, these are your titles. An electronics engineering internship search on its own finds only a few, so add embedded to every search you run.",
        "Plain titles are rare: Electrical Engineering Internship has 5, Electrical Engineering Intern 4 and Electrical Internship 2. 66 employers posted the 148 listings, and the top ten hold 56.8%; for the whole index that figure is 13.0%. Most of this field comes from a small group of employers, probably posting in batches under one title each."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Graduate Electrical Internship",
            "20"
          ],
          [
            "Intern Bachelors Embedded Eng",
            "16"
          ],
          [
            "Diploma Electrical Internship",
            "15"
          ],
          [
            "Graduate Electrical Engineer Internship",
            "13"
          ],
          [
            "Electrical Engineering Internship",
            "5"
          ],
          [
            "Electrical Engineering Intern",
            "4"
          ],
          [
            "Iti Fitter Electronical Electronics Intern",
            "3"
          ],
          [
            "Electronics Engineering Internship",
            "3"
          ],
          [
            "Embedded Systems Internship",
            "3"
          ],
          [
            "Electrical Internship",
            "2"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 66 different employers posted these listings, and 0.7% of listings do not name the employer."
      }
    },
    {
      "title": "Where are electrical internships in India?",
      "sub": "Bengaluru first, then a run of industrial towns.",
      "paras": [
        "Bengaluru has the most electrical internships with 20 listings (13.5%), then Chennai with 9 (6.1%). Mumbai and Pune have 7 each. Bhopal and Huzur, in Bhopal district, have 6 each. Madurai, Hyderabad, Ahmedabad and Nagpur have 5 each. Delhi and Gurugram, both in the whole index's top ten, are missing here.",
        "This list looks different from the whole index. Bhopal, Madurai and Nagpur are not among the index's top ten cities, and here all three are. Electrical internships follow plants, substations, workshops and factories, so look at where manufacturing sits near you, not only at the metros where office jobs cluster.",
        "This is hands-on work. Only 5 listings (3.4%) are flagged remote, about half the 6.5% index rate, and work from home is named in 3.4% of described listings. 11 listings name no city. Plan to be on site every day, and ask about travel or a hostel if the plant sits outside town."
      ],
      "chart": {
        "id": "reeii276Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=148)",
        "labels": [
          "Bengaluru",
          "Chennai",
          "Mumbai",
          "Pune",
          "Bhopal",
          "Huzur",
          "Madurai",
          "Hyderabad",
          "Ahmedabad",
          "Nagpur"
        ],
        "values": [
          20,
          9,
          7,
          7,
          6,
          6,
          5,
          5,
          5,
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
            "20",
            "13.5%"
          ],
          [
            "Chennai",
            "9",
            "6.1%"
          ],
          [
            "Mumbai",
            "7",
            "4.7%"
          ],
          [
            "Pune",
            "7",
            "4.7%"
          ],
          [
            "Bhopal",
            "6",
            "4.1%"
          ],
          [
            "Huzur",
            "6",
            "4.1%"
          ],
          [
            "Madurai",
            "5",
            "3.4%"
          ],
          [
            "Hyderabad",
            "5",
            "3.4%"
          ],
          [
            "Ahmedabad",
            "5",
            "3.4%"
          ],
          [
            "Nagpur",
            "5",
            "3.4%"
          ]
        ],
        "note": "A listing can name more than one city. 5 listings are marked remote and 11 name no city."
      }
    },
    {
      "title": "Who posts electrical engineering internships, and when?",
      "sub": "Company sites, often in Monday batches.",
      "paras": [
        "Most come straight from employers' own sites. Company career sites and applicant tracking pages carry 93 of the 148 listings (62.8%), against 21.4% across the whole index. LinkedIn has 27 (18.2%), Internshala 18 (12.2%), Shine 6 and Naukri 4. If you only search job portals, you see a little over a third of this field.",
        "Monday is the big day. 47 listings (31.8%) were posted on a Monday, against 11.6% across the index. Friday is next with 25, and Saturday is the quietest with 7. With ten employers posting 56.8% of the field, one Monday batch from a single company can fill your whole feed. Check company career pages early in the week.",
        "A batch from one employer means one application form shared by everyone who sees it. Fill it in, and also write to the engineer who runs the team, so your name reaches a person as well as a database. The form puts you in the queue; the email gives someone a reason to look for you in it."
      ],
      "chart": {
        "id": "reeii276Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, 1 to 15 Nov 2026, n=148)",
        "labels": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "values": [
          47,
          17,
          17,
          19,
          25,
          7,
          16
        ],
        "unit": "listings"
      }
    },
    {
      "title": "Do electrical internships pay, and what do they ask for?",
      "sub": "Eight stated stipends, and few listed skills.",
      "paras": [
        "Only 8 of the 148 listings state a stipend in rupees (5.4%). Their median top of range is ₹12,500 a month, the same as the index median for internships. Two are in the ₹5,000 to 10,000 band, five in ₹10,000 to 20,000 and one in ₹20,000 to 40,000. No described listing uses the word unpaid, and none asks for a fee.",
        "BTech, BE or computer science is named in 16.6% of described listings, against 7.8% across the index. A certificate is mentioned in 11.0%, freshers in 6.9% and women candidates in 6.9%. Incentives appear in 4.1%, a portfolio in 3.4% and GitHub in 1.4%. A bond or service agreement shows up in just 1 listing.",
        "Our skill keywords find little here. Communication skills appear in 22.1% of described listings and Python in 9.7%; Excel, English and Hindi each in 2.8%. That does not mean nothing is asked. It means the asks are written in the description's own technical words, which a keyword list does not catch, so read each one line by line."
      ],
      "chart": {
        "id": "reeii276Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (145 listings with a full description)",
        "labels": [
          "a certificate",
          "freshers",
          "incentives",
          "work from home",
          "a portfolio"
        ],
        "values": [
          11.0,
          6.9,
          4.1,
          3.4,
          3.4
        ],
        "unit": "%"
      },
      "callout": "**Ask the stipend:** 8 of 148 electrical internships state one, and the median top of range is ₹12,500 a month."
    },
    {
      "title": "How do you get an electrical internship as a fresher or diploma holder?",
      "sub": "Write to the engineer who runs the floor.",
      "paras": [
        "Write to the engineer who would supervise you. At a plant, that is the electrical maintenance head or the plant engineer. At a power or EPC contractor, it is the project engineer or the site in-charge. At an embedded product company, it is the hardware or firmware lead. Only 4 descriptions (2.8%) include any email address, so the name is yours to find.",
        "Your proof is one project, shown simply. A photo of a panel or circuit you wired in the lab, a one-page load calculation for a small house, or a short video of a microcontroller project working. Add two lines on what you measured and what went wrong. Engineers trust what they can see running.",
        "The email is three lines: your course and year (diploma, ITI or BTech), the project with its photo, and the weeks you can join. If a week passes in silence, follow up one time. Stu takes the slow part off you: it finds the engineering head behind an internship that fits, verifies the work email and writes the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **148 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a electrical engineering internship when its job title matches that kind of role (the most common titles here: \"Graduate Electrical Internship\", \"Intern Bachelors Embedded Eng\", \"Diploma Electrical Internship\").",
    "Pay: 8 of 148 internships (5.4%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 145 listings (98.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Shine, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many electrical engineering internships are there in India?",
      "a": "148 listings were posted 1 to 15 November 2026, by the Studojo Jobs Index count. They come from 66 employers, and the top ten post 56.8% of them. Listings are not hires."
    },
    {
      "q": "Is there a diploma electrical internship in India?",
      "a": "Yes. Diploma Electrical Internship is its own title, with 15 listings (10.1%), and an ITI electronics intern title has 3 more. Graduate titles lead with 20 and 13 listings."
    },
    {
      "q": "Do electrical internships pay a stipend?",
      "a": "Some do, but only 8 of 148 say so. Their median top of range is ₹12,500 a month, and no described listing says unpaid. Ask the amount before you accept."
    },
    {
      "q": "Does this include electronics engineering internships?",
      "a": "Yes, a few. Electronics Engineering Internship has 3 listings and Embedded Systems Internship 3, while Intern Bachelors Embedded Eng has 16, so search embedded as well as electronics."
    },
    {
      "q": "Which city has the most electrical internships?",
      "a": "Bengaluru, with 20 listings (13.5%). Chennai has 9, Mumbai and Pune 7 each, and Bhopal 6. Madurai and Nagpur also make the top ten."
    },
    {
      "q": "Can I do an electrical internship from home?",
      "a": "Rarely. Only 5 of 148 listings (3.4%) carry the remote flag. Electrical work happens on site, so plan to travel to the plant or workshop."
    }
  ],
  "takeaway": {
    "sub": "Five things to remember for an electrical internship search.",
    "items": [
      [
        "Search by qualification",
        "Graduate, diploma and ITI titles are listed separately."
      ],
      [
        "Check company career pages",
        "They carry 62.8% of these listings."
      ],
      [
        "Look early in the week",
        "47 of 148 listings were posted on a Monday."
      ],
      [
        "Ask the stipend",
        "Only 8 state one; the median top of range is ₹12,500 a month."
      ],
      [
        "Show one working project",
        "A photo or short video beats a list of courses."
      ]
    ]
  },
  "related": [
    {
      "slug": "electrical-engineer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Electrical Engineer Jobs for Freshers 2026"
    },
    {
      "slug": "internship-stipend-india-2026",
      "kicker": "Data",
      "title": "Internship Stipend in India 2026"
    },
    {
      "slug": "studojo-jobs-index-november-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, November 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Electrical Engineering Internship 2026",
    "description": "148 active entry-level and internship listings for India posted 1 to 15 November 2026 (electrical engineering internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-electrical-engineering-internship-india-2026" place="report-end" size="card" title={"Want to reach the engineer who runs the plant?"} line={"Tell Stu, by voice or text, the electrical role and city you want. Stu finds internships that fit, who can hire you and their verified work email, then drafts the message. Nothing is sent before you start a campaign."} />
    </DataReport>
  );
}
