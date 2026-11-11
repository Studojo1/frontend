import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "graduate-engineer-trainee-jobs-india-2026",
  "title": "Graduate Engineer Trainee Jobs for Freshers in India 2026: Pay, Cities",
  "short": "Graduate Engineer Trainee Jobs 2026",
  "description": "Graduate engineer trainee jobs for freshers: 479 October listings in the Studojo Jobs Index, 21.7% in Bengaluru, and a median stated pay of ₹3 lakh a year.",
  "keywords": "graduate engineer trainee jobs for freshers, graduate engineer trainee fresher salary, graduate engineer trainee jobs in india 2026, how to get a graduate engineer trainee job as a fresher, graduate engineer trainee internship",
  "h1": "Graduate Engineer Trainee Jobs for Freshers in India:",
  "h1em": "What 479 Listings Show",
  "sub": "The Studojo Jobs Index holds 479 October listings for graduate engineer trainees and similar trainee engineer roles. 31.8% state pay, with a median of ₹3 lakh a year. 38.7% of descriptions mention BTech, BE or computer science.",
  "published": "2026-11-11",
  "scope": "India · graduate engineer trainee · freshers and interns",
  "findings": [
    "**479 graduate engineer trainee listings** were posted in October 2026 by 310 employers. 67 of them are internships (14.0%), and 62 use the exact title Graduate Engineer Trainee.",
    "**Pay is stated in 31.8% of listings.** The median among the 131 that state it is ₹3 lakh a year, and 52.7% fall between ₹3 and 5 lakh.",
    "**Bengaluru has 104 listings (21.7%)**, well ahead of Chennai's 60, with Pune third at 45. Remote work is almost absent at 6 listings.",
    "**The degree line is explicit.** 38.7% of descriptions mention BTech, BE or computer science, and 28.8% say freshers are welcome, so this is a graduate-entry path, not a skills test.",
    "**The move that works is a short email to the plant head, engineering manager or HR head** with a one-page problem note. Stu can find that person and write the email, sent from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "479",
      "label": "Graduate engineer trainee listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3 lakh",
      "label": "Median stated pay a year, from the 131 jobs that state it (31.8%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "18.1%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are graduate engineer trainee jobs called, and who posts them?",
      "sub": "A handful of near-identical titles, plus noisy walk-in ads.",
      "paras": [
        "Graduate engineer trainee jobs for freshers share a short list of titles. Graduate Engineer Trainee leads with 62 of 479 listings (12.9%), followed by Trainee Engineer (26), Engineer Trainee (25), Graduate Apprentice Trainee (17) and Diploma Engineer Trainee (16). Design Engineer Trainee, Production Trainee Engineer and Software Engineer Trainee have 4 each.",
        "Two things to notice. Diploma Engineer Trainee shows that some programmes open to diploma holders, not only to BTech and BE graduates. And a set of titles read like walk-in drive ads, with a city and a hiring message written into the title, which signals batch recruiting and not a named team.",
        "The posters are fairly broad. 310 different employers posted these listings, the ten biggest hold 19.4%, and 3.1% hide the employer name. Thursday is the busiest posting day with 122 listings (25.5%). Search for all four main title variants, since Trainee Engineer and Engineer Trainee are the same job written two ways."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Graduate Engineer Trainee",
            "62"
          ],
          [
            "Trainee Engineer",
            "26"
          ],
          [
            "Engineer Trainee",
            "25"
          ],
          [
            "Graduate Apprentice Trainee",
            "17"
          ],
          [
            "Diploma Engineer Trainee",
            "16"
          ],
          [
            "GET Mechanical Engineer",
            "5"
          ],
          [
            "Design Engineer Trainee",
            "4"
          ],
          [
            "Production Trainee Engineer",
            "4"
          ],
          [
            "Software Engineer Trainee",
            "4"
          ],
          [
            "Mechanical Engineer Trainee",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 310 different employers posted these listings, and 3.1% of listings do not name the employer."
      }
    },
    {
      "title": "Where are graduate engineer trainee jobs in India?",
      "sub": "Bengaluru leads clearly, with Chennai and Pune next.",
      "paras": [
        "Bengaluru has the most graduate engineer trainee listings with 104 (21.7%), well ahead of Chennai with 60 (12.5%) and Pune with 45 (9.4%). Mumbai has 26, Noida 25, Hyderabad 23 and Delhi 21. Gurugram and Vadodara each have 18, and Kolkata has 16.",
        "This is a different map from sales. Mumbai is only fourth here, while Pune and Chennai sit higher, which fits an engineering and manufacturing base. Vadodara placing in the top ten, level with Gurugram, shows plants outside the big metros hire trainees too.",
        "Remote is a rarity at 6 listings (1.3%), and 36 name no city. Engineering trainee work happens on a shop floor, in a design office or at a site. A listing can name more than one city, so read the counts as a comparison. If you can move to a manufacturing hub, you reach more of the market."
      ],
      "chart": {
        "id": "rgetji247Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=479)",
        "labels": [
          "Bengaluru",
          "Chennai",
          "Pune",
          "Mumbai",
          "Noida",
          "Hyderabad",
          "Delhi",
          "Gurugram",
          "Vadodara",
          "Kolkata"
        ],
        "values": [
          104,
          60,
          45,
          26,
          25,
          23,
          21,
          18,
          18,
          16
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
            "104",
            "21.7%"
          ],
          [
            "Chennai",
            "60",
            "12.5%"
          ],
          [
            "Pune",
            "45",
            "9.4%"
          ],
          [
            "Mumbai",
            "26",
            "5.4%"
          ],
          [
            "Noida",
            "25",
            "5.2%"
          ],
          [
            "Hyderabad",
            "23",
            "4.8%"
          ],
          [
            "Delhi",
            "21",
            "4.4%"
          ],
          [
            "Gurugram",
            "18",
            "3.8%"
          ],
          [
            "Vadodara",
            "18",
            "3.8%"
          ],
          [
            "Kolkata",
            "16",
            "3.3%"
          ]
        ],
        "note": "A listing can name more than one city. 6 listings are marked remote and 36 name no city."
      }
    },
    {
      "title": "What is the graduate engineer trainee fresher salary?",
      "sub": "31.8% of listings state pay in rupees.",
      "paras": [
        "The graduate engineer trainee fresher salary stated in listings has a median of ₹3 lakh a year, taking the top of each range. The middle half runs from ₹2.5 lakh to ₹3.8 lakh. That comes from 131 listings, which is 31.8% of the jobs, so about two in three give no figure.",
        "Most of the stated pay sits in one band. 69 listings (52.7%) fall in ₹3 to 5 lakh and 34 (26.0%) in ₹2 to 3 lakh. 12 (9.2%) are under ₹2 lakh. Above that, 14 listings (10.7%) reach ₹5 to 8 lakh and 2 (1.5%) go to ₹8 to 12 lakh. None go higher.",
        "Trainee pay is often a training stipend that rises after confirmation, so ask about both numbers. Internships are mostly silent on money: of 67 internship listings, 1 states a stipend, at ₹18,750 a month. Ask what happens at the end of the training period, and whether the role converts to a permanent grade."
      ],
      "chart": {
        "id": "rgetji247Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (131 jobs that state pay in rupees)",
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
          12,
          34,
          69,
          14,
          2,
          0,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What do graduate engineer trainee listings ask for?",
      "sub": "Share of the 437 listings with a full description that mention each term.",
      "paras": [
        "The degree is the first filter. BTech, BE or computer science appears in 38.7% of descriptions, with freshers welcome in 28.8%. BCom (3.0%) and BBA (3.0%) show up too, so some trainee postings are open beyond engineering degrees. A certificate is named in 3.7% and immediate joining in 2.5%, so some employers need a start date soon.",
        "On skills, communication leads at 53.5%, followed by Excel at 18.1%. Technical terms are modest: cloud is 7.8%, Python 6.9%, SQL 4.6%, Java 3.9% and JavaScript, React or Node 3.7%. Power BI appears in 3.4% and machine learning or generative AI in 3.4%. GitHub is named in 6 listings (1.4%).",
        "Working conditions are shift-aware. Targets are mentioned in 9.4%, night, rotational, US or UK shifts in 4.6%, PF, ESI or health insurance in 5.0% and cab or transport in 1.6%. Work from office is stated in 1.8%. A trainee role is a bundle of terms, so read the shifts and the training period closely before you accept."
      ],
      "chart": {
        "id": "rgetji247Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (437 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "cloud (AWS, Azure, GCP)",
          "Python",
          "SQL",
          "Java",
          "JavaScript, React or Node",
          "Power BI",
          "machine learning or generative AI"
        ],
        "values": [
          53.5,
          18.1,
          8.9,
          7.8,
          6.9,
          4.6,
          3.9,
          3.7,
          3.4,
          3.4
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a graduate engineer trainee?",
      "sub": "Show the engineering head one small piece of real work.",
      "paras": [
        "Most trainee drives draw a crowd. The Interview Guys (April 2026) cite a typical success rate of roughly 0.1% to 2% per online application and about 242 applications per opening (citing Business Insider data). For an engineering trainee role, the people who decide are the plant head, the engineering or production manager, the design lead or the HR head who runs the trainee intake. Write to one of them by name.",
        "Send one piece of real work from your project or lab: a one-page note on a problem you worked on. State the problem, your approach, one number you measured or calculated, and what you would change. Mechanical students can show a drawing or a simple analysis, electrical students a circuit fault they traced, software students a small repository with a clear README.",
        "Keep the email to three lines: who you are, the one-page note, and a request for a short call or a plant visit. Follow up once. Stu does the slow parts: it finds the engineering or HR lead, verifies the work email, writes the note from your real work, and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **479 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as graduate engineer trainee when its job title matches that role (the most common titles here: \"Graduate Engineer Trainee\", \"Trainee Engineer\", \"Engineer Trainee\").",
    "Pay: 131 of 412 entry-level listings (31.8%) state a salary in rupees and 1 of 67 internships (1.5%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 437 listings (91.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are graduate engineer trainee jobs for freshers?",
      "a": "They are entry-level engineering roles with a training period before a regular post. The Studojo Jobs Index tracked 479 such listings posted in October 2026, and 62 use the exact title Graduate Engineer Trainee."
    },
    {
      "q": "What is the graduate engineer trainee fresher salary?",
      "a": "The median stated pay is ₹3 lakh a year, taking the top of each range. It comes from 131 listings, 31.8% of the total. The middle half runs from ₹2.5 lakh to ₹3.8 lakh."
    },
    {
      "q": "Which cities have the most graduate engineer trainee jobs?",
      "a": "Bengaluru has 104 listings, Chennai 60 and Pune 45. Mumbai has 26 and Noida 25. Only 6 listings are marked remote."
    },
    {
      "q": "Do graduate engineer trainee jobs need a BTech?",
      "a": "Often. 38.7% of descriptions mention BTech, BE or computer science. Diploma Engineer Trainee is a title in 16 listings, so some programmes accept diploma holders."
    },
    {
      "q": "Is there a graduate engineer trainee internship?",
      "a": "Yes. 67 of the 479 listings (14.0%) are internships. Only 1 states a stipend, at ₹18,750 a month, so ask what it pays and whether it converts."
    },
    {
      "q": "How do you get a graduate engineer trainee job as a fresher?",
      "a": "Email the plant head, engineering manager or HR head with a one-page note on one project problem. Keep it to three lines and follow up once. Stu can find the person and draft the email, and you send it from your own inbox."
    }
  ],
  "takeaway": {
    "sub": "What the October 2026 listings say to a graduate engineer trainee.",
    "items": [
      [
        "Search all four titles",
        "Graduate Engineer Trainee, Trainee Engineer, Engineer Trainee and Apprentice Trainee."
      ],
      [
        "Look at manufacturing hubs",
        "Pune, Chennai and Vadodara all rank in the top ten."
      ],
      [
        "Ask two pay questions",
        "Stated median is ₹3 lakh a year, but ask what pay becomes after training."
      ],
      [
        "Know your degree line",
        "38.7% mention BTech, BE or computer science, and 28.8% welcome freshers."
      ],
      [
        "Email the engineering head",
        "Send a one-page project note, then follow up once."
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
    "name": "Studojo Jobs Index, October 2026: Graduate Engineer Trainee Jobs 2026",
    "description": "479 active entry-level and internship listings for India posted in October 2026 (graduate engineer trainee), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-graduate-engineer-trainee-jobs-india-2026" place="report-end" size="card" title={"Want to email the engineering head instead of applying?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, writes a short email from your real work, and sends only after you start a campaign."} />
    </DataReport>
  );
}
