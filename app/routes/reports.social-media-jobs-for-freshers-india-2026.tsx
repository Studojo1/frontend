import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "social-media-jobs-for-freshers-india-2026",
  "title": "Social Media Jobs for Freshers in India 2026: 2,225 Listings",
  "short": "Social Media Jobs for Freshers 2026",
  "description": "Social media jobs for freshers in India: 2,225 October listings, 52.4% internships, Canva in 37.9% of descriptions, median intern stipend ₹12,000 a month.",
  "keywords": "social media jobs for freshers, social media fresher salary, social media jobs in india 2026, how to get a social media job as a fresher, social media internship",
  "h1": "Social Media Jobs for Freshers in India:",
  "h1em": "What 2,225 Listings Show",
  "sub": "Social media jobs for freshers are over half internships: 2,225 October listings in the Studojo Jobs Index, 1,165 internships and 1,060 jobs. Only 18.2% of jobs state pay, and the median stated stipend is ₹12,000 a month.",
  "published": "2026-11-11",
  "scope": "India · social media · freshers and interns",
  "findings": [
    "**Social media jobs for freshers are an internship market first**: 1,165 of 2,225 October listings (52.4%) are internships, against 10.8% across the whole index.",
    "**The supply is scattered**: 1,779 different employers posted them and the ten busiest hold only 3.6% of listings, so no single company sets the terms.",
    "**Canva is the tool, not Photoshop**: 37.9% of descriptions mention Canva against 13.4% for Adobe tools, and 19.6% mention writing or copywriting.",
    "**Stated pay is modest**: 193 jobs (18.2%) give a figure with a median top of range of ₹3.5 lakh a year, and 19 internships (1.6%) state a stipend, median ₹12,000 a month.",
    "**Email the marketing head with one real content sample**: a small brand has a person who owns the calendar. We built Stu to find that person and send your email from your own inbox."
  ],
  "stats": [
    {
      "num": "2,225",
      "label": "Social media listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 193 jobs that state it (18.2%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "92.7%",
      "label": "Of listings with a full description ask for social media",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are social media jobs for freshers called, and who posts them?",
      "sub": "Internship titles dominate, and employers are spread thin.",
      "paras": [
        "Social media jobs for freshers are named like marketing internships. Content And Social Media Marketing Internship has 251 listings and Social Media Marketing Internship has 241. Social Media Executive follows with 140, Social Media Marketing Intern with 130, Social Media Intern with 73 and Social Media Manager with 70.",
        "Influencer Marketing Internship (56) and Social Media Content Creator (40) show where the niches are. A job called Manager at the fresher level usually means you are the whole team, which is a lot of learning and a lot of risk.",
        "1,779 employers posted these listings, the top ten account for just 3.6%, and 4.3% of listings hide the employer. That spread is rare. It means thousands of small teams are each hiring one person, and each has one owner of the content."
      ],
      "chart": {
        "id": "rsmjffi14Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=2,225)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          1060,
          1165
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
            "Content And Social Media Marketing Internship",
            "251"
          ],
          [
            "Social Media Marketing Internship",
            "241"
          ],
          [
            "Social Media Executive",
            "140"
          ],
          [
            "Social Media Marketing Intern",
            "130"
          ],
          [
            "Social Media Intern",
            "73"
          ],
          [
            "Social Media Manager",
            "70"
          ],
          [
            "Influencer Marketing Internship",
            "56"
          ],
          [
            "Social Media Process Fresher Daydream",
            "52"
          ],
          [
            "Social Media Content Creator",
            "40"
          ],
          [
            "Junior Social Media Marketing Executive",
            "33"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 1,779 different employers posted these listings, and 4.3% of listings do not name the employer."
      }
    },
    {
      "title": "Where are social media jobs in India, and how many are remote?",
      "sub": "Mumbai is well ahead, and Delhi NCR is a combined powerhouse.",
      "paras": [
        "Mumbai has 385 listings (17.3%), ahead of Delhi with 254 (11.4%) and Bengaluru with 231 (10.4%). Gurugram has 171 (7.7%) and Noida 162 (7.3%), so Delhi NCR taken together outweighs Mumbai.",
        "Pune has 86, Ahmedabad 84, Jaipur 80, Hyderabad 73 and Chennai 56. Jaipur at 80 listings (3.6%) is a notable mid-size city for this field.",
        "254 listings (11.4%) are marked remote and 272 name no city. Remote suits content work, but a remote internship at a business you cannot picture is also where unpaid or vague roles hide, so ask who the manager is."
      ],
      "chart": {
        "id": "rsmjffi14Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=2,225)",
        "labels": [
          "Mumbai",
          "Delhi",
          "Bengaluru",
          "Gurugram",
          "Noida",
          "Pune",
          "Ahmedabad",
          "Jaipur",
          "Hyderabad",
          "Chennai"
        ],
        "values": [
          385,
          254,
          231,
          171,
          162,
          86,
          84,
          80,
          73,
          56
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
            "385",
            "17.3%"
          ],
          [
            "Delhi",
            "254",
            "11.4%"
          ],
          [
            "Bengaluru",
            "231",
            "10.4%"
          ],
          [
            "Gurugram",
            "171",
            "7.7%"
          ],
          [
            "Noida",
            "162",
            "7.3%"
          ],
          [
            "Pune",
            "86",
            "3.9%"
          ],
          [
            "Ahmedabad",
            "84",
            "3.8%"
          ],
          [
            "Jaipur",
            "80",
            "3.6%"
          ],
          [
            "Hyderabad",
            "73",
            "3.3%"
          ],
          [
            "Chennai",
            "56",
            "2.5%"
          ]
        ],
        "note": "A listing can name more than one city. 254 listings are marked remote and 272 name no city."
      }
    },
    {
      "title": "What is a social media fresher salary or stipend in India?",
      "sub": "A ₹3.5 lakh median for jobs, ₹12,000 a month for stipends, both thinly stated.",
      "paras": [
        "193 of 1,060 jobs state pay in rupees. The median top of range is ₹3.5 lakh a year, with the middle half between ₹3 lakh and ₹4.2 lakh. 111 jobs (57.5%) sit in the ₹3 to 5 lakh band, 33 (17.1%) in ₹2 to 3 lakh, 32 (16.6%) in ₹5 to 8 lakh and 14 (7.3%) under ₹2 lakh.",
        "For internships, 19 of 1,165 (1.6%) state a stipend. The median top of range is ₹12,000 a month. 12 of the 19 sit between ₹10,000 and ₹20,000, 5 between ₹5,000 and ₹10,000 and 2 between ₹20,000 and ₹40,000.",
        "So 98.4% of internships do not say. 2.5% of descriptions use the word unpaid. Ask about the stipend before you accept any calendar of daily posts."
      ],
      "chart": {
        "id": "rsmjffi14Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (193 jobs that state pay in rupees)",
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
          14,
          33,
          111,
          32,
          2,
          1,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do social media fresher jobs ask for?",
      "sub": "Social media itself, communication and Canva.",
      "paras": [
        "Of 2,120 listings with a full description, 92.7% mention social media, 63.7% communication skills and 37.9% Canva. English is in 25.0%, content writing or copywriting in 19.6%, SEO in 14.8% and Adobe tools in 13.4%. Paid ads (Google, Meta, PPC) are in 12.0% and AI tools in 8.7%.",
        "That tells you where to spend learning time: Canva and clear writing before video suites. Paid ads at 12.0% is the next upgrade if you want to move from posting to performance.",
        "On terms, 30.7% ask for a certificate, 20.7% say freshers and 18.6% ask for a portfolio. Women candidates are named in 17.7%, which is high, and work from home in 10.2%. 9.8% mention targets and 8.1% mention incentives, so some roles are really sales in disguise."
      ],
      "chart": {
        "id": "rsmjffi14Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (2,120 listings with a full description)",
        "labels": [
          "social media",
          "communication skills",
          "Canva",
          "English",
          "content writing or copywriting",
          "SEO",
          "Adobe tools (Photoshop, Illustrator)",
          "paid ads (Google, Meta, PPC)",
          "ChatGPT or AI tools",
          "negotiation"
        ],
        "values": [
          92.7,
          63.7,
          37.9,
          25.0,
          19.6,
          14.8,
          13.4,
          12.0,
          8.7,
          7.1
        ],
        "unit": "%"
      },
      "callout": "**Portfolio idea:** 18.6% ask for one. A public page with a month of posts you planned is enough to start."
    },
    {
      "title": "How do you get hired as a social media fresher?",
      "sub": "Send a one-week content plan to the person who owns the brand.",
      "paras": [
        "Social media listings attract huge applicant piles because anyone can apply. The Interview Guys (April 2026), citing Business Insider data, put the average opening at about 242 applications. With so many small teams hiring, a direct email lets you skip the pile entirely.",
        "Email the founder of a small brand, or the marketing head or brand manager at a larger one. Send one proof: a one-week content plan for their brand, with seven post ideas, captions and a Canva mockup of two of them, plus what you would measure. Pick a brand you would genuinely use so the ideas are specific.",
        "Keep the email to three lines: who you are, the plan you made for them, and a request for a short chat. Follow up once. Stu handles the slow parts: it finds the person with a verified work email, writes the note from your real work and sends it from your own inbox after you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **2,225 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as social media when its job title matches that role (the most common titles here: \"Content And Social Media Marketing Internship\", \"Social Media Marketing Internship\", \"Social Media Executive\").",
    "Pay: 193 of 1,060 entry-level listings (18.2%) state a salary in rupees and 19 of 1,165 internships (1.6%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 2,120 listings (95.3%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Internshala, LinkedIn, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many social media jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 2,225 October 2026 listings: 1,060 jobs and 1,165 internships, from 1,779 employers. That counts listings we track, not hires."
    },
    {
      "q": "What is the social media fresher salary in India?",
      "a": "Among the 193 jobs that state pay, the median top of range is ₹3.5 lakh a year, with the middle half between ₹3 lakh and ₹4.2 lakh. Only 18.2% of jobs state pay."
    },
    {
      "q": "How much does a social media internship pay in India?",
      "a": "Only 19 internships (1.6%) state a stipend. Their median top of range is ₹12,000 a month. Most listings do not say, so ask early."
    },
    {
      "q": "Do I need a degree for social media jobs?",
      "a": "Rarely stated. Only 2.2% of descriptions mention BTech or BE and 1.5% mention BBA. 30.7% ask for a certificate and 18.6% a portfolio, so proof counts more."
    },
    {
      "q": "Which skills do social media jobs need in India 2026?",
      "a": "Social media knowledge (92.7%), communication (63.7%) and Canva (37.9%). Content writing is in 19.6%, SEO in 14.8% and paid ads in 12.0%."
    },
    {
      "q": "Can I do a social media internship from home?",
      "a": "Yes. 254 listings (11.4%) are marked remote, and 10.2% of descriptions mention work from home. Check who your manager is before accepting."
    }
  ],
  "takeaway": {
    "sub": "Five moves for your social media search.",
    "items": [
      [
        "Learn Canva properly",
        "37.9% of descriptions name it."
      ],
      [
        "Write every day",
        "Writing or copywriting is in 19.6% of listings and sets you apart."
      ],
      [
        "Ask about the stipend",
        "98.4% of internships state no stipend."
      ],
      [
        "Watch for sales in disguise",
        "9.8% mention targets and 8.1% mention incentives."
      ],
      [
        "Email the brand owner",
        "One week of content ideas, three lines, one follow-up."
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
      "slug": "content-writer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Content Writer Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Social Media Jobs for Freshers 2026",
    "description": "2,225 active entry-level and internship listings for India posted in October 2026 (social media), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-social-media-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want to reach the brand owner, not the inbox?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring with a verified work email and writes a short personal email from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
