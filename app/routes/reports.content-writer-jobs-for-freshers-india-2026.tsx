import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "content-writer-jobs-for-freshers-india-2026",
  "title": "Content Writer Jobs for Freshers in India: 1,743 Listings 2026",
  "short": "Content Writer Jobs for Freshers 2026",
  "description": "Content writer jobs for freshers: 1,743 October listings in the Studojo Jobs Index, 484 of them internships. See titles, stated pay, skills and cities.",
  "keywords": "content writer jobs for freshers, content writer fresher salary, content writer jobs in india 2026, how to get a content writer job as a fresher, content writer internship",
  "h1": "Content Writer Jobs for Freshers in India:",
  "h1em": "What 1,743 Listings Show",
  "sub": "We track 1,743 content writer jobs for freshers posted in October 2026, and 484 are internships. SEO appears in 30.0% of full descriptions. Only 135 jobs state a salary, with a median top of range of ₹3.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · content writer · freshers and interns",
  "findings": [
    "The Studojo Jobs Index has **1,743 content writer jobs for freshers** for October 2026: 1,259 jobs and 484 internships (27.8%).",
    "**Writing is only part of the ask.** Social media appears in 55.8% of descriptions and content writing or copywriting in 55.0%, while SEO appears in 30.0%.",
    "**Many titles say Creator.** Content Creator has 92 listings and Social Media Content Creator has 40, next to 184 for Content Writer.",
    "**Pay is the least stated of our role reports.** Only 135 of 1,259 jobs (10.7%) state a salary, the median top of range is ₹3.5 lakh a year, and just 8 internships state a stipend.",
    "**Email the content head with three clips.** 218 listings (13.2%) include an email address, the highest share of our role reports, so send samples to the editor or content lead."
  ],
  "stats": [
    {
      "num": "1,743",
      "label": "Content writer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 135 jobs that state it (10.7%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "55.8%",
      "label": "Of listings with a full description ask for social media",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are content writer jobs for freshers called?",
      "sub": "Writer, creator and copywriter are three different jobs.",
      "paras": [
        "Content Writer has 184 listings (10.6%). Content Creator has 92 (5.3%), Content Writing Internship has 76 (4.4%) and Content Writer Intern has 55 (3.2%). Copywriter has 47 and Social Media Content Creator has 40.",
        "The difference matters. A Content Writer usually writes articles and web pages. A Content Creator often also shoots, edits and posts, and the Social Media Content Creator is closer to a social team. A Copywriter writes shorter, sharper copy for ads and pages. Resume Writer has 22 listings and is a service business, so read it as a different path.",
        "The 1,743 listings come from 1,164 different employers, and the top 10 hold 11.1%. A further 67 listings (3.8%) do not name the employer, so check where you would be writing before you send samples."
      ],
      "chart": {
        "id": "rcwjffi8Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=1,743)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          1259,
          484
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
            "Content Writer",
            "184"
          ],
          [
            "Content Creator",
            "92"
          ],
          [
            "Content Writing Internship",
            "76"
          ],
          [
            "Content Writer Intern",
            "55"
          ],
          [
            "Copywriter",
            "47"
          ],
          [
            "Social Media Content Creator",
            "40"
          ],
          [
            "Content Creator Intern",
            "27"
          ],
          [
            "Resume Writer",
            "22"
          ],
          [
            "Content Creator Internship",
            "20"
          ],
          [
            "Content Writing Intern",
            "17"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 1,164 different employers posted these listings, and 3.8% of listings do not name the employer."
      }
    },
    {
      "title": "Where are content writer jobs in India for freshers?",
      "sub": "Mumbai leads, and more than one listing in ten is remote.",
      "paras": [
        "Mumbai has 244 listings (14.0%), Bengaluru has 213 (12.2%) and Delhi has 176 (10.1%). Noida has 116, Hyderabad 111 and Chennai 105. Gurugram has 99, Pune 80, Ahmedabad 53 and Kolkata 47. A listing can name more than one city.",
        "Writing travels well. 198 listings are marked remote (11.4%), and 227 name no city. Another 8.1% of full descriptions mention work from home. That is a higher remote share than most roles we track, so you can look past your own city.",
        "Remote does not mean easy. A remote content writer is judged on samples and deadlines. Check how many pieces a week the role expects and whether the pay is per piece or monthly."
      ],
      "chart": {
        "id": "rcwjffi8Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=1,743)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Delhi",
          "Noida",
          "Hyderabad",
          "Chennai",
          "Gurugram",
          "Pune",
          "Ahmedabad",
          "Kolkata"
        ],
        "values": [
          244,
          213,
          176,
          116,
          111,
          105,
          99,
          80,
          53,
          47
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
            "244",
            "14.0%"
          ],
          [
            "Bengaluru",
            "213",
            "12.2%"
          ],
          [
            "Delhi",
            "176",
            "10.1%"
          ],
          [
            "Noida",
            "116",
            "6.7%"
          ],
          [
            "Hyderabad",
            "111",
            "6.4%"
          ],
          [
            "Chennai",
            "105",
            "6.0%"
          ],
          [
            "Gurugram",
            "99",
            "5.7%"
          ],
          [
            "Pune",
            "80",
            "4.6%"
          ],
          [
            "Ahmedabad",
            "53",
            "3.0%"
          ],
          [
            "Kolkata",
            "47",
            "2.7%"
          ]
        ],
        "note": "A listing can name more than one city. 198 listings are marked remote and 227 name no city."
      }
    },
    {
      "title": "What is a content writer fresher salary in India?",
      "sub": "Stated pay is thin, so ask early.",
      "paras": [
        "Only 135 of the 1,259 jobs state a salary in rupees, which is 10.7%. The median top of range is ₹3.5 lakh a year, and the middle half sits between ₹3 lakh and ₹4.8 lakh.",
        "The ₹3 to 5 lakh band has 72 listings (53.3%). Another 23 state ₹5 to 8 lakh, 22 state ₹2 to 3 lakh and 10 are under ₹2 lakh. At the top, 7 reach ₹8 to 12 lakh and 1 reaches ₹12 to 20 lakh. These are top-of-range figures from a small group.",
        "Internships are quiet: 8 of 484 state a stipend (1.7%), with a median top of range of ₹15,000 a month. Four sit in the ₹10,000 to 20,000 band. Another 3.2% of descriptions say the role is unpaid, so ask whether samples are paid or free."
      ],
      "chart": {
        "id": "rcwjffi8Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (135 jobs that state pay in rupees)",
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
          22,
          72,
          23,
          7,
          1,
          0
        ],
        "unit": "listings"
      },
      "callout": "**Free samples:** a short test piece is fair. Publishing your test piece without pay is not."
    },
    {
      "title": "Which skills do content writer jobs ask freshers for?",
      "sub": "Words, English, social and some search.",
      "paras": [
        "Of the 1,651 listings with a full description, communication skills appear in 57.1%. Social media is in 55.8%, content writing or copywriting in 55.0% and English in 52.9%. SEO is in 30.0% and Canva in 13.7%.",
        "ChatGPT or AI tools are named in 11.1%. Employers are open to drafting with them, but a portfolio of your own sentences still matters more. Adobe tools show in 8.8% and Hindi in 8.7%.",
        "On conditions, a portfolio is named in 25.5%, freshers in 17.6% and targets in 14.8%. A certificate shows in 12.5%, BTech, BE or computer science in 5.4%. That low degree share suggests that clips matter more than your major."
      ],
      "chart": {
        "id": "rcwjffi8Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,651 listings with a full description)",
        "labels": [
          "communication skills",
          "social media",
          "content writing or copywriting",
          "English",
          "SEO",
          "Canva",
          "ChatGPT or AI tools",
          "Adobe tools (Photoshop, Illustrator)",
          "Hindi",
          "paid ads (Google, Meta, PPC)"
        ],
        "values": [
          57.1,
          55.8,
          55.0,
          52.9,
          30.0,
          13.7,
          11.1,
          8.8,
          8.7,
          5.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a content writer fresher?",
      "sub": "Send three clips, one of them rewritten from the team's own page.",
      "paras": [
        "Applying online puts you in a pile. An average opening draws about 242 applications (Business Insider data, cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). 218 of our 1,743 listings include an email address, so you can write straight to someone.",
        "Write to the content head, the managing editor or the marketing manager. At a small company, write to the founder. Send three clips in a single document: one article, one short piece of copy, one rewrite of a section from their own blog with a line on what you improved. Pick topics close to what they publish.",
        "Three lines in the email: who you are, what you attached, and one idea for a piece they have not written. Follow up once. Stu, the AI career agent from Studojo, finds who is hiring, verifies their work email and drafts the note, and sends from your own inbox when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **1,743 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as content writer when its job title matches that role (the most common titles here: \"Content Writer\", \"Content Creator\", \"Content Writing Internship\").",
    "Pay: 135 of 1,259 entry-level listings (10.7%) state a salary in rupees and 8 of 484 internships (1.7%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,651 listings (94.7%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Internshala, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many content writer jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index has 1,743 content writer listings for freshers posted in October 2026: 1,259 jobs and 484 internships. They are listings we track, not hires."
    },
    {
      "q": "What is the content writer fresher salary in India?",
      "a": "Of 1,259 jobs, 135 state a salary in rupees. The median top of range is ₹3.5 lakh a year and the middle half is ₹3 lakh to ₹4.8 lakh. About 89% do not state pay."
    },
    {
      "q": "Do content writers need SEO skills?",
      "a": "It helps. SEO appears in 30.0% of full descriptions. Writing itself is named in 55.0% and social media in 55.8%, so learn the basics of search alongside strong clips."
    },
    {
      "q": "Are there content writing internships for freshers?",
      "a": "Yes. 484 of the 1,743 listings are internships (27.8%). Content Writing Internship has 76 and Content Writer Intern has 55. Only 8 state a stipend, with a median top of range of ₹15,000 a month."
    },
    {
      "q": "Can you be a content writer from home in India?",
      "a": "Often. 198 listings (11.4%) are marked remote, and 8.1% of full descriptions mention work from home. Check the expected output and how you are paid."
    },
    {
      "q": "Do you need a portfolio for a content writer job?",
      "a": "It helps a lot. 25.5% of full descriptions mention a portfolio, against 12.5% that mention a certificate. Three clips that match the company's topics are enough."
    }
  ],
  "takeaway": {
    "sub": "What the 1,743 October listings say about content writing.",
    "items": [
      [
        "Know your title",
        "Writer, Creator and Copywriter are different jobs with different samples."
      ],
      [
        "Learn SEO basics",
        "SEO is in 30.0% of descriptions, behind writing at 55.0%."
      ],
      [
        "Look at remote roles",
        "198 listings are marked remote."
      ],
      [
        "Ask about pay and samples",
        "Only 8 internships state a stipend, and 3.2% of descriptions say unpaid."
      ],
      [
        "Email three clips",
        "Samples sent to the content head show your voice, and 218 listings give an email."
      ]
    ]
  },
  "related": [
    {
      "slug": "digital-marketing-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Digital Marketing Jobs for Freshers 2026"
    },
    {
      "slug": "social-media-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Social Media Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Content Writer Jobs for Freshers 2026",
    "description": "1,743 active entry-level and internship listings for India posted in October 2026 (content writer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-content-writer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the content head directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds the person who hires, verifies their work email, and nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
