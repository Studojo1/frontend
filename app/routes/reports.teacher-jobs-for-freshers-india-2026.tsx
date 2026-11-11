import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "teacher-jobs-for-freshers-india-2026",
  "title": "Teaching Jobs for Freshers in India 2026: Pay, Cities, Online Roles",
  "short": "Teaching Jobs for Freshers 2026",
  "description": "Teaching jobs for freshers: 1,399 October listings in the Studojo Jobs Index, 10.7% remote, median stated pay ₹3.5 lakh a year, and who to email at a school.",
  "keywords": "teaching jobs for freshers, teaching fresher salary, teaching jobs in india 2026, how to get a teaching job as a fresher, teaching internship",
  "h1": "Teaching Jobs for Freshers in India:",
  "h1em": "What 1,399 Listings Show",
  "sub": "The Studojo Jobs Index holds 1,399 October listings for teaching freshers. 10.7% are marked remote, about double the 5.3% across the index, and the median stated pay is ₹3.5 lakh a year. Only 27.5% of listings state pay.",
  "published": "2026-11-11",
  "scope": "India · teaching · freshers and interns",
  "findings": [
    "**1,399 teaching listings** for freshers and interns were posted in October 2026 by 702 employers. Only 29 are internships.",
    "**Remote work is real here.** 149 listings (10.7%) carry a remote flag and 7.4% of descriptions mention work from home, driven by online tutoring and language classes.",
    "**Pay is stated in 27.5% of listings.** The median among the 377 that state it is ₹3.5 lakh a year, and 47.5% sit between ₹3 and 5 lakh.",
    "**Titles are scattered.** The most common, plain Teacher, is only 2.6% of listings, so you have to search by subject: French, English, computer, chemistry, maths.",
    "**The move that works is a short email to the principal or academic coordinator** with a sample lesson. Stu can find the person and write the note from your real work, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "1,399",
      "label": "Teaching listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 377 jobs that state it (27.5%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "2.1%",
      "label": "Of these listings are internships",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are teaching jobs for freshers called, and who posts them?",
      "sub": "Teaching titles are split by subject and level.",
      "paras": [
        "Teaching jobs for freshers do not share one common title. The top title, Teacher, appears in just 36 of 1,399 listings (2.6%). Next come French Teacher for online classes (22), English Teacher (17), Home Tutors (17), Online Tutor (15), Pre Primary Teacher (15) and Computer Teacher (14). Chemistry Teacher and Mathematics Teacher have 11 each.",
        "That spread is the main thing a fresher has to plan around. A search for teacher misses tutor, trainer, faculty and subject titles. Searching by subject and level, such as pre primary or computer, will surface much more than the generic word.",
        "The posters are many and varied. 702 different employers posted these listings, the ten biggest hold 20.6%, and 3.3% do not name the employer. Teaching also shows an unusual weekday pattern: 283 listings (20.2%) went up on Monday, against 131 on Saturday and 32 on Sunday."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Teacher",
            "36"
          ],
          [
            "French Teacher - Online Classes",
            "22"
          ],
          [
            "English Teacher",
            "17"
          ],
          [
            "Home Tutors",
            "17"
          ],
          [
            "Online Tutor",
            "15"
          ],
          [
            "Pre Primary Teacher",
            "15"
          ],
          [
            "Computer Teacher",
            "14"
          ],
          [
            "French Teacher Online Classes Gips Consultancy Services",
            "13"
          ],
          [
            "Chemistry Teacher",
            "11"
          ],
          [
            "Mathematics Teacher",
            "11"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 702 different employers posted these listings, and 3.3% of listings do not name the employer."
      }
    },
    {
      "title": "Where are teaching jobs in India?",
      "sub": "Bengaluru leads, and a tenth of listings are remote.",
      "paras": [
        "Bengaluru has the most teaching listings with 185 (13.2%), followed by Mumbai with 121 (8.6%) and Delhi with 102 (7.3%). Hyderabad has 86 and Pune 67. Gurugram and Chennai each have 49, Noida has 46, and Coimbatore stands out with 30, ahead of Ahmedabad at 24.",
        "Remote listings change the picture. 149 listings (10.7%) are marked remote, about double the 5.3% across all listings, and 211 name no city at all. Many of those belong to online tutoring and language classes, where your city matters less than your timing and your subject.",
        "Coimbatore's place in the top ten is worth noting if you are outside the metros. A listing can name more than one city, so read these as relative counts. If you want a classroom job, pick the one or two areas you can reach. If you want online work, widen your search beyond your city."
      ],
      "chart": {
        "id": "rtjffi242Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=1,399)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Delhi",
          "Hyderabad",
          "Pune",
          "Gurugram",
          "Chennai",
          "Noida",
          "Coimbatore",
          "Ahmedabad"
        ],
        "values": [
          185,
          121,
          102,
          86,
          67,
          49,
          49,
          46,
          30,
          24
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
            "185",
            "13.2%"
          ],
          [
            "Mumbai",
            "121",
            "8.6%"
          ],
          [
            "Delhi",
            "102",
            "7.3%"
          ],
          [
            "Hyderabad",
            "86",
            "6.1%"
          ],
          [
            "Pune",
            "67",
            "4.8%"
          ],
          [
            "Gurugram",
            "49",
            "3.5%"
          ],
          [
            "Chennai",
            "49",
            "3.5%"
          ],
          [
            "Noida",
            "46",
            "3.3%"
          ],
          [
            "Coimbatore",
            "30",
            "2.1%"
          ],
          [
            "Ahmedabad",
            "24",
            "1.7%"
          ]
        ],
        "note": "A listing can name more than one city. 149 listings are marked remote and 211 name no city."
      }
    },
    {
      "title": "What is the teaching fresher salary in India?",
      "sub": "Only 27.5% of listings state pay, so the figures cover a minority.",
      "paras": [
        "The teaching fresher salary stated in listings has a median of ₹3.5 lakh a year, using the top of each range. The middle half runs from ₹2.5 lakh to ₹5 lakh. These figures come from 377 listings, which is 27.5% of the jobs, so about three in four say nothing.",
        "Most stated pay sits in the middle. 179 listings (47.5%) fall in ₹3 to 5 lakh and 69 (18.3%) in ₹2 to 3 lakh. At the lower end, 34 (9.0%) are under ₹2 lakh. Higher up, 68 (18.0%) reach ₹5 to 8 lakh, 14 (3.7%) go to ₹8 to 12 lakh and 9 (2.4%) to ₹12 to 20 lakh.",
        "The high bands usually point to senior subject roles or ed-tech teams, not first jobs. No internship listing states a stipend, and with only 29 internships the sample is small anyway. Ask about hours, since online tutoring is often paid by the class and a monthly figure may hide fewer hours."
      ],
      "chart": {
        "id": "rtjffi242Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (377 jobs that state pay in rupees)",
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
          34,
          69,
          179,
          68,
          14,
          9,
          4
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills and conditions do teaching listings ask for?",
      "sub": "Share of the 1,335 listings with a full description that mention each term.",
      "paras": [
        "Communication skills appear in 70.9% of descriptions and English in 34.5%. Hindi follows at 7.0% and Excel at 6.1%. Technical terms are small but real: Python appears in 3.6%, Java in 1.9% and machine learning or generative AI in 1.9%, which points to coding and data-science tutoring alongside school roles.",
        "On conditions, 15.1% of descriptions mention freshers, which is lower than in sales, and 8.2% mention BTech, BE or computer science. That is a sign that technical tutoring is a visible slice of the category. Another 4.3% mention a certificate and 3.9% mention PF, ESI or health insurance.",
        "Work from home is named in 7.4% and work from office in 2.7%. Women candidates are named in 4.4%. Targets and incentives barely feature, at 1.4% and 1.1%, so most teaching listings read like an education job, not a sales job. The skill that matters most is explaining clearly."
      ],
      "chart": {
        "id": "rtjffi242Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,335 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Hindi",
          "Excel",
          "Python",
          "Java",
          "machine learning or generative AI",
          "cloud (AWS, Azure, GCP)",
          "statistics",
          "Tally"
        ],
        "values": [
          70.9,
          34.5,
          7.0,
          6.1,
          3.6,
          1.9,
          1.9,
          1.6,
          1.0,
          1.0
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a teaching fresher?",
      "sub": "A sample lesson beats a stack of applications.",
      "paras": [
        "A short email to the right person beats a long list of applications. The Interview Guys (April 2026) put the typical success rate of an online application at roughly 0.1% to 2% and cite Business Insider data of about 242 applications per opening. At a school, write to the principal, the vice principal or the academic coordinator. At an online academy, write to the academic head or the subject lead.",
        "Send one piece of real work: a ten-minute sample lesson, recorded on your phone or written as a one-page plan. Pick one topic from the subject you want to teach, say what a student should know by the end, and show how you would check it. Add a line on any tutoring you have done, even for a younger cousin.",
        "The email can be three lines: who you are, the subject and level you want, the sample you attached. Ask for a short call, then follow up once. Stu does the slow parts: it finds the principal or academic lead, verifies the work email, writes the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **1,399 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as teaching when its job title matches that role (the most common titles here: \"Teacher\", \"French Teacher - Online Classes\", \"English Teacher\").",
    "Pay: 377 of 1,370 entry-level listings (27.5%) state a salary in rupees and 0 of 29 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,335 listings (95.4%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are teaching jobs for freshers in India?",
      "a": "They are entry-level roles such as teacher, tutor, trainer and subject faculty at schools, coaching centres and online academies. The Studojo Jobs Index tracked 1,399 such listings posted in October 2026."
    },
    {
      "q": "What is the teaching fresher salary?",
      "a": "The median stated pay is ₹3.5 lakh a year, taking the top of each range. It comes from 377 listings, only 27.5% of the total. The middle half runs from ₹2.5 lakh to ₹5 lakh."
    },
    {
      "q": "Are there remote teaching jobs for freshers?",
      "a": "Yes. 149 of the 1,399 listings (10.7%) are marked remote, and 7.4% of descriptions mention work from home. Online French, English and tutor roles make up much of it."
    },
    {
      "q": "Which cities have the most teaching jobs in India?",
      "a": "Bengaluru has 185 listings, Mumbai 121 and Delhi 102. Hyderabad has 86 and Pune 67. Coimbatore appears in the top ten with 30."
    },
    {
      "q": "Is there a teaching internship for freshers?",
      "a": "Yes, but very few. Only 29 of the 1,399 listings (2.1%) are internships, and none of them states a stipend. Ask what the role pays and what it leads to."
    },
    {
      "q": "How do you get a teaching job as a fresher?",
      "a": "Email the principal, the academic coordinator or the subject lead with a ten-minute sample lesson. Keep it to three lines and follow up once. Stu can find the person and draft the email, and you send it from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a teaching fresher.",
    "items": [
      [
        "Search by subject",
        "The top title is only 2.6% of listings. Try French, English, computer, chemistry or maths."
      ],
      [
        "Consider online work",
        "10.7% of listings are remote, about double the 5.3% across the index."
      ],
      [
        "Check the hours",
        "Only 27.5% state pay, and the median is ₹3.5 lakh a year."
      ],
      [
        "Lead with how you explain",
        "Communication skills appear in 70.9% of descriptions."
      ],
      [
        "Send a sample lesson",
        "Email the principal or academic lead with a ten-minute lesson, then follow up once."
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
      "slug": "legal-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Legal Jobs for Freshers in India 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Teaching Jobs for Freshers 2026",
    "description": "1,399 active entry-level and internship listings for India posted in October 2026 (teaching), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-teacher-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the principal instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
