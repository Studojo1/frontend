import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "hr-internship-india-2026",
  "title": "HR Internship in India: 877 Listings, Stipends and What They Ask 2026",
  "short": "HR Internship in India 2026",
  "description": "HR internship in India: 877 listings in the Studojo Jobs Index, only 51 state a stipend, with a median top of range of ₹12,500 a month.",
  "keywords": "hr internship in india, hr internship stipend, hr internship for freshers, human resources internship in india",
  "h1": "HR Internship in India:",
  "h1em": "877 Listings, Few With Pay",
  "sub": "The Studojo Jobs Index has 877 HR internship listings posted in the first half of November 2026. Only 51 (5.8%) state a stipend, with a median top of range of ₹12,500 a month, and 11.9% of described listings say unpaid.",
  "published": "2026-11-18",
  "scope": "India · HR internship",
  "findings": [
    "**An HR internship in India** has 877 listings in the Studojo Jobs Index, from 689 employers, and Bengaluru leads the cities with 122.",
    "**Pay is stated on 51 listings** (5.8%), so 94.2% make you ask. The median top of range among the 51 is ₹12,500 a month, and 11.9% of described listings say unpaid.",
    "**Excel is the tool to know**: 44.6% of described listings mention it, against 14.1% across the whole index, and communication skills lead at 77.9%.",
    "**MBA or PGDM is named in 22.7%** of described listings, but 27.7% welcome freshers and 3.4% say any graduate, so read the degree line before you rule yourself out.",
    "**The move that works** is a short email to the HR head or talent acquisition lead with a small screening sample. Stu finds that person and sends from your own inbox once you start a campaign."
  ],
  "stats": [
    {
      "num": "877",
      "label": "HR internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "₹12,500",
      "label": "Median stated stipend a month, from the 51 internships that state one",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "44.6%",
      "label": "Of listings with a full description ask for Excel",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What are HR internships called?",
      "sub": "Titles as employers wrote them.",
      "paras": [
        "HR internships in India use four spellings of one idea. Human Resources (Hr) Internship leads with 141 listings and Human Resources Intern has 136. Hr Intern adds 67 and Human Resource Intern 52, so a search on one spelling misses most of the field.",
        "The next group is recruiting. Talent Acquisition Intern has 36 listings, Talent Acquisition Internship 25, Recruitment Internship 15 and Hr Recruiter Intern 10. If you like speaking to candidates, these are the titles that say so; the plain HR titles often mix in onboarding and records.",
        "877 listings come from 689 employers, and the top ten hold 7.8% of them. Hidden employers are 0.5%. That is a spread of small teams, many of which have no recruiter to find you, so you have to find them."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Human Resources (Hr) Internship",
            "141"
          ],
          [
            "Human Resources Intern",
            "136"
          ],
          [
            "Hr Intern",
            "67"
          ],
          [
            "Human Resource Intern",
            "52"
          ],
          [
            "Talent Acquisition Intern",
            "36"
          ],
          [
            "Talent Acquisition Internship",
            "25"
          ],
          [
            "Hr Internship",
            "19"
          ],
          [
            "Recruitment Internship",
            "15"
          ],
          [
            "Intern - Talent Acquisition",
            "13"
          ],
          [
            "Hr Recruiter Intern",
            "10"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 689 different employers posted these listings, and 0.5% of listings do not name the employer."
      }
    },
    {
      "title": "Where are HR internships in India?",
      "sub": "Top cities, and how many are remote.",
      "paras": [
        "Bengaluru has the most HR internship listings with 122 (13.9%), then Mumbai with 107 (12.2%) and Delhi with 86 (9.8%). Noida has 81, Hyderabad 55, Gurugram 41 and Chennai 34. The top four cities are close, so you do not have to move to Bengaluru to find a seat.",
        "145 listings (16.5%) are marked remote, against 6.5% across the whole index, and 162 name no city. Work from home is named in 11.3% of described listings and work from office in 9.2%. Night or rotational shifts are rare at 2.9%.",
        "Friday is the busiest posting day at 22.3%, and Sunday the quietest at 4.7%. LinkedIn carries 37.5%, Internshala 22.9%, Naukri 18.8% and company career sites 14.6%, so check more than one place before you decide nothing is open."
      ],
      "chart": {
        "id": "rhii243Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=877)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Delhi",
          "Noida",
          "Hyderabad",
          "Gurugram",
          "Chennai",
          "Pune",
          "Kolkata",
          "Jaipur"
        ],
        "values": [
          122,
          107,
          86,
          81,
          55,
          41,
          34,
          32,
          19,
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
            "Bengaluru",
            "122",
            "13.9%"
          ],
          [
            "Mumbai",
            "107",
            "12.2%"
          ],
          [
            "Delhi",
            "86",
            "9.8%"
          ],
          [
            "Noida",
            "81",
            "9.2%"
          ],
          [
            "Hyderabad",
            "55",
            "6.3%"
          ],
          [
            "Gurugram",
            "41",
            "4.7%"
          ],
          [
            "Chennai",
            "34",
            "3.9%"
          ],
          [
            "Pune",
            "32",
            "3.6%"
          ],
          [
            "Kolkata",
            "19",
            "2.2%"
          ],
          [
            "Jaipur",
            "15",
            "1.7%"
          ]
        ],
        "note": "A listing can name more than one city. 145 listings are marked remote and 162 name no city."
      }
    },
    {
      "title": "How much does an HR internship pay in India?",
      "sub": "Stated stipend, top of range, on 51 internships.",
      "paras": [
        "Only 51 of 877 HR internships state a stipend in rupees, which is 5.8%. That still leaves 94.2% without a number. The median top of range among the 51 is ₹12,500 a month.",
        "The bands are spread. ₹10,000 to 20,000 has 17 listings (33.3%), ₹20,000 to 40,000 has 16 (31.4%) and ₹5,000 to 10,000 has 13 (25.5%). 4 are under ₹5,000 and 1 reaches ₹40,000 or more. HR pays in the middle, not at the top.",
        "Unpaid is mentioned in 11.9% of described listings. Ask whether the stipend starts from day one, and whether a pre-placement offer (PPO, named in 5.1%) depends on a review. Two listings (0.2%) mention a fee. Never pay to be hired."
      ],
      "chart": {
        "id": "rhii243Stipend",
        "kind": "bar",
        "label": "Stated stipend, top of range, per month (51 internships that state pay in rupees)",
        "labels": [
          "under ₹5,000",
          "₹5,000 to 10,000",
          "₹10,000 to 20,000",
          "₹20,000 to 40,000",
          "₹40,000 or more"
        ],
        "values": [
          4,
          13,
          17,
          16,
          1
        ],
        "unit": "listings"
      },
      "callout": "**Lead:** only 51 of 877 HR internships state a stipend, and 11.9% of described listings say unpaid."
    },
    {
      "title": "What skills and degrees do HR internships want?",
      "sub": "Keyword share across 859 described listings.",
      "paras": [
        "Communication skills lead with 77.9% of the 859 described listings. Excel follows at 44.6%, then English at 28.1%. Excel at 44.6% is the standout: it is what you use for candidate trackers, attendance sheets and offer pipelines, and an HR team will check it quickly.",
        "Social media appears in 14.2%, calling or telecalling in 5.7% and negotiation in 4.2%. Hindi is named in 3.8% and CRM tools in 1.6%. Few ask for software skills. They ask for someone who can talk to candidates and keep a sheet tidy.",
        "On degrees, MBA or PGDM is named in 22.7%, BBA in 11.6% and BCom in 4.2%. Freshers are welcomed in 27.7%, any graduate in 3.4% and a certificate is mentioned in 37.8%. If you are in a first or second year of an MBA, the first group is aimed at you."
      ],
      "chart": {
        "id": "rhii243Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (859 listings with a full description)",
        "labels": [
          "communication skills",
          "Excel",
          "English",
          "social media",
          "calling or telecalling",
          "negotiation",
          "Hindi",
          "cloud (AWS, Azure, GCP)",
          "ChatGPT or AI tools",
          "CRM tools (Salesforce, HubSpot or similar)"
        ],
        "values": [
          77.9,
          44.6,
          28.1,
          14.2,
          5.7,
          4.2,
          3.8,
          3.1,
          2.6,
          1.6
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get an HR internship in India?",
      "sub": "Write to the HR head with a small screening sample.",
      "paras": [
        "Write to the HR head, or the talent acquisition lead where the company has one. At a startup with no HR team, write to the founder or the operations lead, who decides who joins. Not the careers inbox: only 8.1% of descriptions carry an email address, so you will often have to find the person yourself.",
        "Send one small proof: a one-page screening sample for a role they have open. List five questions, what a strong answer sounds like and how you would score it. Or build a clean Excel tracker for ten sample candidates with a filter and a pivot. Either shows the skills the listings ask for.",
        "Keep the email to three lines: who you are, what you attached and the one thing you ask. Follow up once. Stu does the slow parts: it finds who hires, verifies the work email and sends from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **877 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a HR internship when its job title matches that kind of role (the most common titles here: \"Human Resources (Hr) Internship\", \"Human Resources Intern\", \"Hr Intern\").",
    "Pay: 51 of 877 internships (5.8%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 859 listings (97.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Internshala, Naukri, Shine) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many HR internships are there in India?",
      "a": "The Studojo Jobs Index has 877 HR internship listings posted 1 to 15 November 2026, from 689 employers. Listings are not hires."
    },
    {
      "q": "What is the stipend for an HR internship in India?",
      "a": "Only 51 listings (5.8%) state a stipend. Among them the median top of range is ₹12,500 a month, with 17 in the ₹10,000 to 20,000 band."
    },
    {
      "q": "Is there an HR internship for freshers?",
      "a": "Yes. Freshers are welcomed in 27.7% of described listings and any graduate in 3.4%. MBA or PGDM is named in 22.7%, so read each listing's line."
    },
    {
      "q": "Which human resources internship in India is easiest to find?",
      "a": "Titles with HR or Human Resources in the name are the most common: Human Resources (Hr) Internship has 141 listings and Human Resources Intern has 136. Talent Acquisition Intern adds 36."
    },
    {
      "q": "Do HR internships ask for Excel?",
      "a": "Often. Excel is mentioned in 44.6% of described listings, against 14.1% across the whole index. Communication skills are higher at 77.9%."
    },
    {
      "q": "Can I do an HR internship from home?",
      "a": "Yes. 145 listings (16.5%) are marked remote and 11.3% of described listings mention work from home."
    }
  ],
  "takeaway": {
    "sub": "Five points for an HR internship search.",
    "items": [
      [
        "Search all four spellings",
        "HR, Human Resources, Human Resource and Talent Acquisition are the same field."
      ],
      [
        "Ask about pay",
        "51 of 877 state a stipend, and 11.9% of descriptions say unpaid."
      ],
      [
        "Learn a tracker",
        "44.6% of described listings mention Excel."
      ],
      [
        "Check degree lines",
        "MBA or PGDM appears in 22.7%, freshers in 27.7%."
      ],
      [
        "Email the HR head",
        "Attach a one-page screening sample for one open role."
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: HR Internship in India 2026",
    "description": "877 active entry-level and internship listings for India posted 1 to 15 November 2026 (HR internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-hr-internship-india-2026" place="report-end" size="card" title={"Want to email an HR head directly?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies the work email and writes a short note from your real work. Nothing goes out until you start a campaign."} />
    </DataReport>
  );
}
