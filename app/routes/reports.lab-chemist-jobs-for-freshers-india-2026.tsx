import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "lab-chemist-jobs-for-freshers-india-2026",
  "title": "Lab and Quality Control Jobs for Freshers in India 2026: Pay, Cities",
  "short": "Lab and QC Jobs for Freshers 2026",
  "description": "Lab and quality control jobs for freshers: 780 October listings in the Studojo Jobs Index, a median stated pay of ₹3.6 lakh a year, and the cities hiring.",
  "keywords": "lab and quality control jobs for freshers, lab and quality control fresher salary, lab and quality control jobs in india 2026, how to get a lab and quality control job as a fresher, lab and quality control internship",
  "h1": "Lab and Quality Control Jobs for Freshers in India:",
  "h1em": "What 780 Listings Show",
  "sub": "The Studojo Jobs Index holds 780 October listings for lab, chemist and quality control freshers. 34.3% state pay, with a median of ₹3.6 lakh a year. Mumbai, Bengaluru and Chennai lead, and Ahmedabad is close behind.",
  "published": "2026-11-11",
  "scope": "India · lab and quality control · freshers and interns",
  "findings": [
    "**780 lab and quality control listings** for freshers and interns were posted in October 2026, from 522 employers. 54 of them are internships (6.9%).",
    "**Pay is stated in 34.3% of listings.** The median among the 249 that state it is ₹3.6 lakh a year, and 56.2% fall between ₹3 and 5 lakh.",
    "**Gujarat shows up strongly.** Ahmedabad has 53 listings, Vadodara 19 and Bharuch 17, so industrial belts matter as much as the big metros.",
    "**The ask is about training and discipline.** 18.3% mention freshers and 6.4% mention BTech, BE or computer science, while communication skills appear in 30.0%, lower than in sales or teaching listings.",
    "**The move that works is a short email to the QC head, lab in-charge or plant head** with a one-page lab note. Stu can find that person and write the email, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "780",
      "label": "Lab and quality control listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.6 lakh",
      "label": "Median stated pay a year, from the 249 jobs that state it (34.3%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "6.9%",
      "label": "Of these listings are internships",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are lab and quality control jobs for freshers called?",
      "sub": "Titles exactly as employers wrote them in October 2026.",
      "paras": [
        "Lab and quality control jobs for freshers go by many names. The most common title is Lab Technician with 35 of 780 listings (4.5%). Quality Control Engineer follows with 29 (3.7%), then Quality Control Executive and Production Chemist with 23 each (2.9%), Chemist with 18 and Junior Chemist with 9. QC Executive, written short, adds another 9.",
        "Some titles are written for the person, not the job. A listing titled MSc Chemistry Fresher appears 20 times, which means employers describe the degree they want in place of a role name. A search for chemist alone would skip those, and so would a search for quality control alone.",
        "The employer base is wide. 522 different employers posted these listings, the ten biggest hold 16.4%, and 3.5% do not name the employer. Chemistry Teacher (11) and Chemist Internship (11) also appear, a reminder that the same degree opens doors in classrooms and plants."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Lab Technician",
            "35"
          ],
          [
            "Quality Control Engineer",
            "29"
          ],
          [
            "Quality Control Executive",
            "23"
          ],
          [
            "Production Chemist",
            "23"
          ],
          [
            "M.Sc. Chemistry ( Fresher)",
            "20"
          ],
          [
            "Chemist",
            "18"
          ],
          [
            "Chemistry Teacher",
            "11"
          ],
          [
            "Chemist Internship",
            "11"
          ],
          [
            "QC Executive",
            "9"
          ],
          [
            "Junior Chemist",
            "9"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 522 different employers posted these listings, and 3.5% of listings do not name the employer."
      }
    },
    {
      "title": "Where are lab and quality control jobs in India?",
      "sub": "Metros lead, and Gujarat's industrial towns sit in the top ten.",
      "paras": [
        "Mumbai has the most listings with 69 (8.8%), followed by Bengaluru with 64 (8.2%) and Chennai with 63 (8.1%). Hyderabad has 54 (6.9%), Ahmedabad 53 (6.8%) and Pune 44 (5.6%). No one city dominates.",
        "The second half of the top ten is unusual. Delhi has only 24 (3.1%), while Vadodara (19) and Bharuch (17) both rank. These are plant and industrial towns rather than office cities, which fits a job done in labs next to production. Coimbatore closes the list with 15.",
        "Only 15 listings (1.9%) are marked remote, and 54 do not name a city. Lab work needs a bench, so your search should be geographic. If you can relocate to an industrial town, you reach listings that metro-only searches miss. A listing can name more than one city, so read the counts as a comparison."
      ],
      "chart": {
        "id": "rlcjffi44Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=780)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Chennai",
          "Hyderabad",
          "Ahmedabad",
          "Pune",
          "Delhi",
          "Vadodara",
          "Bharuch",
          "Coimbatore"
        ],
        "values": [
          69,
          64,
          63,
          54,
          53,
          44,
          24,
          19,
          17,
          15
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
            "69",
            "8.8%"
          ],
          [
            "Bengaluru",
            "64",
            "8.2%"
          ],
          [
            "Chennai",
            "63",
            "8.1%"
          ],
          [
            "Hyderabad",
            "54",
            "6.9%"
          ],
          [
            "Ahmedabad",
            "53",
            "6.8%"
          ],
          [
            "Pune",
            "44",
            "5.6%"
          ],
          [
            "Delhi",
            "24",
            "3.1%"
          ],
          [
            "Vadodara",
            "19",
            "2.4%"
          ],
          [
            "Bharuch",
            "17",
            "2.2%"
          ],
          [
            "Coimbatore",
            "15",
            "1.9%"
          ]
        ],
        "note": "A listing can name more than one city. 15 listings are marked remote and 54 name no city."
      }
    },
    {
      "title": "What is the lab and quality control fresher salary?",
      "sub": "34.3% of listings state pay in rupees.",
      "paras": [
        "The lab and quality control fresher salary stated in listings has a median of ₹3.6 lakh a year, taking the top of each range. The middle half runs from ₹3 lakh to ₹4.8 lakh. That is based on 249 listings, which is 34.3% of the jobs. About two in three give no figure.",
        "The mass sits in the middle. 140 listings (56.2%) are in ₹3 to 5 lakh and 53 (21.3%) in ₹2 to 3 lakh. Another 33 (13.3%) reach ₹5 to 8 lakh and 9 (3.6%) fall under ₹2 lakh. At the very top, 8 listings (3.2%) state ₹20 lakh or more, which is almost certainly senior roles caught by the title match.",
        "None of the 54 internships states a stipend. That is common in lab work, where the first role is often a trainee post with a clear learning period. Ask about the stipend or salary during the first call, and ask which tests or instruments you would handle in the first months."
      ],
      "chart": {
        "id": "rlcjffi44Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (249 jobs that state pay in rupees)",
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
          9,
          53,
          140,
          33,
          4,
          2,
          8
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do lab and quality control listings ask for?",
      "sub": "Share of the 734 listings with a full description that mention each skill.",
      "paras": [
        "Communication skills appear in 30.0% of descriptions, low for a role that works with a team. English is next at 7.6%, then Excel at 6.5%. Python (1.5%), statistics (1.4%), SAP (1.0%) and Hindi (0.8%) are small. Keyword matching only sees what the description writes down, and many lab descriptions list instruments and tests rather than soft skills.",
        "Excel stands out among the named tools. A lab fresher who can keep tidy results tables, plot a simple trend and spot an out-of-range reading is showing a skill that quality teams use daily. SAP is rare at 1.0%, but it points to larger plants where batch records live in an ERP system.",
        "On conditions, 18.3% mention freshers, 6.4% mention BTech, BE or computer science, 4.2% mention PF, ESI or health insurance and 3.7% mention a certificate. Night, rotational, US or UK shifts appear in 2.3%, and targets in 2.6%. These are structured, shift-based jobs, so shift terms are worth reading closely."
      ],
      "chart": {
        "id": "rlcjffi44Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (734 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "Python",
          "statistics",
          "SAP",
          "Hindi"
        ],
        "values": [
          30.0,
          7.6,
          6.5,
          1.5,
          1.4,
          1.0,
          0.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a lab and quality control fresher?",
      "sub": "Show the head of the lab one careful page of real lab work.",
      "paras": [
        "Online applications are a thin path. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% per online application and about 242 applications per opening (citing Business Insider data). In a lab, hiring is decided by the QC head, the lab in-charge, the quality manager or the plant head. Email that person, not the general inbox.",
        "Send one piece of real work: a single page from your practical record. Pick one test you ran, such as a titration, a pH or moisture check, or an instrument run. Show the method, your readings, the calculation and one line on what you would flag if a result looked wrong. Clean records tell a quality manager how you work.",
        "The email can be three lines: who you are, the one-page lab note, and a request for a short call or a plant visit. Follow up once. Stu does the slow parts: it finds the head of the team, verifies the work email, writes the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **780 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as lab and quality control when its job title matches that role (the most common titles here: \"Lab Technician\", \"Quality Control Engineer\", \"Quality Control Executive\").",
    "Pay: 249 of 726 entry-level listings (34.3%) state a salary in rupees and 0 of 54 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 734 listings (94.1%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are lab and quality control jobs for freshers?",
      "a": "They are entry-level roles testing materials and products in a lab or plant, such as lab technician, chemist and quality control executive. The Studojo Jobs Index tracked 780 such listings posted in October 2026."
    },
    {
      "q": "What is the lab and quality control fresher salary?",
      "a": "The median stated pay is ₹3.6 lakh a year, taking the top of each range. It comes from 249 listings, 34.3% of the total. The middle half runs from ₹3 lakh to ₹4.8 lakh."
    },
    {
      "q": "Which cities have the most lab and quality control jobs?",
      "a": "Mumbai has 69 listings, Bengaluru 64 and Chennai 63. Hyderabad has 54 and Ahmedabad 53. Vadodara and Bharuch also appear in the top ten."
    },
    {
      "q": "Is there a lab and quality control internship?",
      "a": "Yes. 54 of the 780 listings (6.9%) are internships, and Chemist Internship is a title in 11. None of the 54 states a stipend, so ask what it pays."
    },
    {
      "q": "Do lab jobs for freshers need a BTech?",
      "a": "Not usually. Only 6.4% of descriptions mention BTech, BE or computer science. Many titles ask for a chemistry degree instead, and 18.3% say freshers are welcome."
    },
    {
      "q": "How do you get a lab and quality control job as a fresher?",
      "a": "Email the QC head, lab in-charge or plant head with one page of your lab work. Keep it to three lines and follow up once. Stu can find the person and draft the email, and you send it from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a lab and quality control fresher.",
    "items": [
      [
        "Search several titles",
        "Lab Technician, Chemist, QC Executive and Production Chemist all count."
      ],
      [
        "Look at industrial towns",
        "Vadodara and Bharuch rank in the top ten, ahead of Coimbatore."
      ],
      [
        "Ask about the stipend",
        "None of the 54 internships states one, and median stated pay is ₹3.6 lakh a year."
      ],
      [
        "Know your Excel",
        "It is the most named tool at 6.5% of descriptions."
      ],
      [
        "Send one lab page",
        "Email the QC head with a clean record of one test, then follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Lab and QC Jobs for Freshers 2026",
    "description": "780 active entry-level and internship listings for India posted in October 2026 (lab and quality control), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-lab-chemist-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to email the QC head instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
