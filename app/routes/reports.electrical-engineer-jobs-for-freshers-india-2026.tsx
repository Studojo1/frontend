import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "electrical-engineer-jobs-for-freshers-india-2026",
  "title": "Electrical and Electronics Engineer Jobs for Freshers in India 2026",
  "short": "Electrical Engineer Jobs for Freshers 2026",
  "description": "Electrical and electronics engineer jobs for freshers in India: 906 October listings, 109 internships, and a median stated salary of ₹3.5 lakh a year.",
  "keywords": "electrical and electronics engineer jobs for freshers, electrical and electronics engineer fresher salary, electrical and electronics engineer jobs in india 2026, how to get a electrical and electronics engineer job as a fresher, electrical and electronics engineer internship",
  "h1": "Electrical and Electronics Engineer Jobs for Freshers in India:",
  "h1em": "What 906 Listings Show",
  "sub": "We tracked 906 electrical and electronics engineer jobs for freshers posted in October 2026. 797 are jobs and 109 are internships. Only 214 state pay, and the median stated salary is ₹3.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · electrical and electronics engineer · freshers and interns",
  "findings": [
    "There are **906 electrical and electronics engineer jobs for freshers** in the Studojo Jobs Index for October 2026: 797 jobs and 109 internships (12.0%).",
    "**Technician and maintenance titles sit beside engineer titles.** Electrical Engineer leads with 97 listings (10.7%), then Electrical Technician (30), Electrical Design Engineer (29) and Electronics Mechanic (11).",
    "**Only 214 listings (26.9%) state pay.** The median stated salary is ₹3.5 lakh a year, and the middle half runs from ₹3 lakh to ₹5 lakh.",
    "**Python is the one coding skill that stands out.** It appears in 65 of the 860 listings with a full description (7.6%), more than cloud at 3.3% or SAP at 1.9%.",
    "**Email the plant or design lead with one drawing.** Send a single-line diagram or a panel schedule you made, and follow up once. Stu finds that person and writes the first draft."
  ],
  "stats": [
    {
      "num": "906",
      "label": "Electrical and electronics engineer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 214 jobs that state it (26.9%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "8.0%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are electrical and electronics engineer fresher jobs called?",
      "sub": "Engineer, technician, design and instrumentation titles all appear in the same search.",
      "paras": [
        "Electrical Engineer is the top title with 97 of 906 listings (10.7%). Electrical Technician follows with 30 and Electrical Design Engineer with 29. Electrical Maintenance Technician has 12, Electronics Mechanic 11, Electronics Engineer 10 and Instrumentation Engineer 9.",
        "That mix matters. The role group is matched on the title, so it includes hands-on technician work next to engineering roles. If you hold a BTech, read the description before applying to a technician post, because the pay and the career path differ.",
        "Internship titles are small but present: Electronics Engineering Internship has 12 listings and Electrical Engineering Internship has 7. Employers are spread across 650 distinct names, and the ten biggest account for 11.9% of listings. About 2.6% hide the employer, so there is no single gatekeeper to chase."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Electrical Engineer",
            "97"
          ],
          [
            "Electrical Technician",
            "30"
          ],
          [
            "Electrical Design Engineer",
            "29"
          ],
          [
            "Electronics Engineering Internship",
            "12"
          ],
          [
            "Electrical Maintenance Technician",
            "12"
          ],
          [
            "Electronics Mechanic",
            "11"
          ],
          [
            "Electronics Engineer",
            "10"
          ],
          [
            "Instrumentation Engineer",
            "9"
          ],
          [
            "Junior Electrical Engineer",
            "8"
          ],
          [
            "Electrical Engineering Internship",
            "7"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 650 different employers posted these listings, and 2.6% of listings do not name the employer."
      }
    },
    {
      "title": "Where are electrical and electronics engineer jobs in India?",
      "sub": "Bengaluru leads, and the industrial belts of Gujarat and Tamil Nadu show up clearly.",
      "paras": [
        "Bengaluru has 140 listings (15.5%), Chennai 100 (11.0%), Pune 88 (9.7%) and Mumbai 76 (8.4%). Hyderabad has 50. Pune and Chennai rank above Mumbai and Hyderabad here, which fits the plants, panel builders and automation firms around them.",
        "The second tier is worth a look: Ahmedabad (36), Vadodara (33), Noida (32) and Coimbatore (28). Coimbatore has more listings than Delhi at 25. If you studied in Tamil Nadu or Gujarat, you may find openings without relocating.",
        "Only 17 listings (1.9%) are marked remote and 66 name no city. Electrical work is tied to a plant, a site or a lab, so expect to be on location. A listing can name more than one city, so the shares add to more than the total."
      ],
      "chart": {
        "id": "reejffi31Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=906)",
        "labels": [
          "Bengaluru",
          "Chennai",
          "Pune",
          "Mumbai",
          "Hyderabad",
          "Ahmedabad",
          "Vadodara",
          "Noida",
          "Coimbatore",
          "Delhi"
        ],
        "values": [
          140,
          100,
          88,
          76,
          50,
          36,
          33,
          32,
          28,
          25
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
            "140",
            "15.5%"
          ],
          [
            "Chennai",
            "100",
            "11.0%"
          ],
          [
            "Pune",
            "88",
            "9.7%"
          ],
          [
            "Mumbai",
            "76",
            "8.4%"
          ],
          [
            "Hyderabad",
            "50",
            "5.5%"
          ],
          [
            "Ahmedabad",
            "36",
            "4.0%"
          ],
          [
            "Vadodara",
            "33",
            "3.6%"
          ],
          [
            "Noida",
            "32",
            "3.5%"
          ],
          [
            "Coimbatore",
            "28",
            "3.1%"
          ],
          [
            "Delhi",
            "25",
            "2.8%"
          ]
        ],
        "note": "A listing can name more than one city. 17 listings are marked remote and 66 name no city."
      }
    },
    {
      "title": "What is an electrical and electronics engineer fresher salary?",
      "sub": "Most stated pay falls between ₹3 and ₹5 lakh a year, and about three in four listings do not state it.",
      "paras": [
        "Of 797 jobs, 214 state pay in rupees (26.9%). The median stated salary, using the top of each range, is ₹3.5 lakh a year, with a middle range of ₹3 lakh to ₹5 lakh. Treat it as a floor for the better-described listings, not as the whole market.",
        "The ₹3 to 5 lakh band holds 98 listings (45.8%), and ₹5 to 8 lakh holds 55 (25.7%), a larger upper band than civil roles show. 48 sit at ₹2 to 3 lakh, 8 reach ₹8 to 12 lakh and 4 are under ₹2 lakh.",
        "Only one internship states a stipend, ₹20,000 a month, out of 109 internships. That is too few to judge. Ask the person you email what the stipend is before you accept, because the listing almost never says."
      ],
      "chart": {
        "id": "reejffi31Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (214 jobs that state pay in rupees)",
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
          4,
          48,
          98,
          55,
          8,
          1,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do electrical engineer fresher listings ask for?",
      "sub": "Communication tops the list, and Python is the technical skill that appears most.",
      "paras": [
        "Of 860 listings with a full description, 379 (44.1%) mention communication skills and 98 (11.4%) mention English. Excel appears in 69 (8.0%) and Python in 65 (7.6%). Cloud is named in 28 (3.3%), Hindi in 18 (2.1%) and SAP in 16 (1.9%).",
        "Our keyword list does not include AutoCAD, MATLAB, PLC or SCADA, so those are not counted here. What the numbers do show is that Python is the coding skill employers write down, likely for embedded, test and automation work. Machine learning appears in only 9 listings.",
        "On conditions, 174 listings (20.2%) ask for a BTech or BE and 169 (19.7%) say freshers. A certificate is named in 63 (7.3%), PF, ESI or health insurance in 59 (6.9%), and 20 listings (2.3%) mention a bond or service agreement. Read bond terms closely before you sign."
      ],
      "chart": {
        "id": "reejffi31Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (860 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "Excel",
          "Python",
          "cloud (AWS, Azure, GCP)",
          "Hindi",
          "SAP",
          "negotiation",
          "machine learning or generative AI",
          "ChatGPT or AI tools"
        ],
        "values": [
          44.1,
          11.4,
          8.0,
          7.6,
          3.3,
          2.1,
          1.9,
          1.3,
          1.0,
          1.0
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as an electrical engineer fresher?",
      "sub": "Write to the person who owns the panels, the plant or the design.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). 43 of the 906 listings (5.0%) put an email in the description, so start there. For the rest, find the maintenance head, the plant engineer or the electrical design lead.",
        "Send one piece of real work. A single-line diagram for a small building, a panel schedule with load calculations, a cable sizing sheet, or a short video of a circuit you built all work. Attach one file and say in a sentence what you checked.",
        "Write three lines: your degree and where you built the work, the file, and a question about whether the team needs a junior engineer or an intern. Follow up once. Monday to Friday posting is almost even, so there is no bad day to write. Stu finds the right lead, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **906 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as electrical and electronics engineer when its job title matches that role (the most common titles here: \"Electrical Engineer\", \"Electrical Technician\", \"Electrical Design Engineer\").",
    "Pay: 214 of 797 entry-level listings (26.9%) state a salary in rupees and 1 of 109 internships (0.9%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 860 listings (94.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best electrical and electronics engineer jobs for freshers?",
      "a": "Electrical Engineer is the most common title with 97 of 906 October listings. Electrical Design Engineer (29), Instrumentation Engineer (9) and Electronics Engineer (10) are smaller. Choose the one that matches a project you can show."
    },
    {
      "q": "What is an electrical and electronics engineer fresher salary in India?",
      "a": "Among the 214 listings that state pay, the median is ₹3.5 lakh a year. 45.8% fall in the ₹3 to 5 lakh band. About three in four listings do not state pay, so ask during the conversation."
    },
    {
      "q": "Which cities hire the most electrical and electronics engineers?",
      "a": "Bengaluru has 140 listings, Chennai 100, Pune 88 and Mumbai 76. Hyderabad has 50. Coimbatore (28), Vadodara (33) and Noida (32) are strong second-tier options."
    },
    {
      "q": "Is there an electrical and electronics engineer internship for freshers?",
      "a": "There are 109 internships in the October listings, 12.0% of the total. Only one states a stipend, at ₹20,000 a month. Most interns are found by writing to the team directly."
    },
    {
      "q": "Do I need Python for an electrical engineer fresher job?",
      "a": "Not for every role, but Python is the most common technical skill, named in 65 of 860 listings (7.6%). It helps for test, automation and embedded work. Communication skills are named far more, in 44.1% of listings."
    },
    {
      "q": "How do I get an electrical and electronics engineer job as a fresher?",
      "a": "Email the maintenance head, plant engineer or design lead with one drawing or calculation you made. Keep the message to three lines and follow up once. That works better than adding to the queue of about 242 applications per opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 906 October listings.",
    "items": [
      [
        "Read the title closely",
        "Engineer, technician and mechanic roles share the same search."
      ],
      [
        "Chennai and Pune matter",
        "They have 100 and 88 listings, ahead of Mumbai at 76."
      ],
      [
        "Pay is stated in 214 listings",
        "The median is ₹3.5 lakh a year, so ask about pay early."
      ],
      [
        "Python is worth showing",
        "It is named in 7.6% of full descriptions."
      ],
      [
        "Check bond terms",
        "20 listings mention a bond or service agreement."
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
    "name": "Studojo Jobs Index, October 2026: Electrical Engineer Jobs for Freshers 2026",
    "description": "906 active entry-level and internship listings for India posted in October 2026 (electrical and electronics engineer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-electrical-engineer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Who runs the electrical team you want to join?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the person who hires, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
