import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "legal-jobs-for-freshers-india-2026",
  "title": "Legal Jobs for Freshers in India: 620 Listings and Pay, 2026",
  "short": "Legal Jobs for Freshers in India 2026",
  "description": "Legal jobs for freshers in India: 620 October listings, 136 internships, and a median stated salary of ₹3.5 lakh a year. See roles, cities and skills.",
  "keywords": "legal jobs for freshers, legal fresher salary, legal jobs in india 2026, how to get a legal job as a fresher, legal internship",
  "h1": "Legal Jobs for Freshers in India:",
  "h1em": "What 620 Listings Show",
  "sub": "We tracked 620 legal jobs for freshers posted in October 2026, and 136 of them (21.9%) are internships. Compliance roles sit beside advocate and associate roles. 114 state pay, with a median of ₹3.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · legal · freshers and interns",
  "findings": [
    "There are **620 legal jobs for freshers** in the Studojo Jobs Index for October 2026: 484 jobs and 136 internships (21.9%), a high internship share compared with most roles.",
    "**Compliance is a real part of legal hiring.** Regulatory Compliance Associate has 21 listings and Compliance Associate 11, next to Legal Associate at 32 and Junior Advocate at 14.",
    "**Pay is stated in 114 jobs (23.6%).** The median stated salary is ₹3.5 lakh a year, and 64 listings sit in the ₹3 to 5 lakh band.",
    "**Legal internships do state stipends more often.** 5 internships state one, with a median of ₹14,583 a month, and 13 listings (2.2%) say unpaid.",
    "**Email the legal head or partner with a short case note.** One page, one issue, and a single follow-up. Stu finds the person and drafts the email from your real work."
  ],
  "stats": [
    {
      "num": "620",
      "label": "Legal listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹3.5 lakh",
      "label": "Median stated pay a year, from the 114 jobs that state it (23.6%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "16.5%",
      "label": "Of listings with a full description ask for negotiation",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are legal fresher jobs called, and who posts them?",
      "sub": "Intern titles lead, followed by associate, executive and compliance roles.",
      "paras": [
        "Legal Intern is the top title with 37 of 620 listings. Law or Legal Internship has 36. Legal Associate has 32 and Legal Executive 22. Regulatory Compliance Associate has 21, Junior Advocate 14, Compliance Associate 11, Legal Officer 11 and Compliance Analyst 8.",
        "The role group is matched on the title, so compliance and regulatory work counts as legal here. If you studied law but do not want to litigate, compliance titles are a clear second lane and often sit in banks, fintech and in-house teams.",
        "442 different employers posted these listings, and the top ten account for 16.5%. About 2.9% hide the employer. Law firms, in-house teams and compliance outsourcers all post here, so your first contact is rarely a single obvious gatekeeper."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Legal Intern",
            "37"
          ],
          [
            "Law/Legal Internship",
            "36"
          ],
          [
            "Legal Associate",
            "32"
          ],
          [
            "Legal Executive",
            "22"
          ],
          [
            "Regulatory Compliance Associate",
            "21"
          ],
          [
            "Junior Advocate",
            "14"
          ],
          [
            "Compliance Associate",
            "11"
          ],
          [
            "Legal Officer",
            "11"
          ],
          [
            "Associate - Legal",
            "8"
          ],
          [
            "Compliance Analyst",
            "8"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 442 different employers posted these listings, and 2.9% of listings do not name the employer."
      }
    },
    {
      "title": "Where are legal jobs for freshers in India?",
      "sub": "Mumbai leads, with Bengaluru and Delhi close behind.",
      "paras": [
        "Mumbai has 105 legal listings (16.9%), Bengaluru 86 (13.9%) and Delhi 54 (8.7%). Hyderabad has 39, and Chennai and Gurugram each have 34. This follows where large law firms, courts and company headquarters are.",
        "Ahmedabad has 31, Pune 29, Noida 26 and Vadodara 25. Vadodara appearing at all is a useful signal for Gujarat graduates. A listing can name more than one city, and 37 name no city.",
        "26 listings (4.2%) are marked remote. That is a small slice, but higher than in most engineering roles. Legal and compliance review work can be done from a desk, so remote and hybrid options exist. 15 mention hybrid and 18 mention work from home."
      ],
      "chart": {
        "id": "rljffi234Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=620)",
        "labels": [
          "Mumbai",
          "Bengaluru",
          "Delhi",
          "Hyderabad",
          "Chennai",
          "Gurugram",
          "Ahmedabad",
          "Pune",
          "Noida",
          "Vadodara"
        ],
        "values": [
          105,
          86,
          54,
          39,
          34,
          34,
          31,
          29,
          26,
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
            "Mumbai",
            "105",
            "16.9%"
          ],
          [
            "Bengaluru",
            "86",
            "13.9%"
          ],
          [
            "Delhi",
            "54",
            "8.7%"
          ],
          [
            "Hyderabad",
            "39",
            "6.3%"
          ],
          [
            "Chennai",
            "34",
            "5.5%"
          ],
          [
            "Gurugram",
            "34",
            "5.5%"
          ],
          [
            "Ahmedabad",
            "31",
            "5.0%"
          ],
          [
            "Pune",
            "29",
            "4.7%"
          ],
          [
            "Noida",
            "26",
            "4.2%"
          ],
          [
            "Vadodara",
            "25",
            "4.0%"
          ]
        ],
        "note": "A listing can name more than one city. 26 listings are marked remote and 37 name no city."
      }
    },
    {
      "title": "What is a legal fresher salary in India?",
      "sub": "Stated pay clusters between ₹3 and ₹5 lakh a year, and three in four listings do not state it.",
      "paras": [
        "Of 484 jobs, 114 (23.6%) state pay in rupees. The median stated salary, using the top of each range, is ₹3.5 lakh a year. The middle half runs from ₹3 lakh to ₹5 lakh. That is a modest base of data, so use it as a rough guide.",
        "The ₹3 to 5 lakh band has 64 listings (56.1%), ₹5 to 8 lakh has 21 (18.4%) and ₹2 to 3 lakh has 13 (11.4%). 7 reach ₹8 to 12 lakh and 8 are under ₹2 lakh. Pay above ₹8 lakh is rare for freshers in these listings.",
        "Internships are more transparent: 5 of 136 state a stipend, a median of ₹14,583 a month. Two sit at ₹5,000 to 10,000 and two at ₹20,000 to 40,000. 13 listings say unpaid. Ask about the stipend before you accept, and treat unpaid roles with caution."
      ],
      "chart": {
        "id": "rljffi234Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (114 jobs that state pay in rupees)",
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
          13,
          64,
          21,
          7,
          1,
          0
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do legal fresher listings ask for?",
      "sub": "Plain English and negotiation beat technical tools, with a few new tech terms.",
      "paras": [
        "Of 587 listings with a full description, 308 (52.5%) mention communication skills and 154 (26.2%) mention English. Negotiation appears in 97 (16.5%), which fits contract and commercial roles. Excel appears in 82 (14.0%) and Hindi in 19 (3.2%).",
        "Technology terms show up more than you might expect. Cloud appears in 36 listings (6.1%), machine learning or generative AI in 31 (5.3%) and ChatGPT or AI tools in 15 (2.6%). GST appears in 21 (3.6%), which points to tax and compliance roles.",
        "Conditions: 71 listings (12.1%) say freshers and 69 (11.8%) mention a certificate. 54 (9.2%) mention night, rotational or US or UK shifts, likely for outsourced legal work. 22 (3.7%) mention a bond or service agreement, so read the terms before you sign."
      ],
      "chart": {
        "id": "rljffi234Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (587 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "negotiation",
          "Excel",
          "machine learning or generative AI",
          "GST",
          "Hindi",
          "CRM tools (Salesforce, HubSpot or similar)",
          "ChatGPT or AI tools",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          52.5,
          26.2,
          16.5,
          14.0,
          5.3,
          3.6,
          3.2,
          2.6,
          2.6,
          1.9
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a legal fresher?",
      "sub": "Show a lawyer how you read a document, before the interview.",
      "paras": [
        "A typical opening draws about 242 applications (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). 49 of the 620 listings (8.3%) put an email in the description, so use those first. For the rest, write to the head of legal, the compliance manager or the partner who runs the practice.",
        "Send one short piece of real work. A one-page note on a recent judgement, a clause-by-clause review of a public contract template, or a summary of a moot problem all work. Pick one issue. Say what you would flag and why.",
        "Keep the email to three lines: your degree and college, the note, and a question about whether the team takes interns or a junior associate. Follow up once. Wednesday is the busiest posting day, at 21.8% of listings. Stu finds the right lead, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **620 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as legal when its job title matches that role (the most common titles here: \"Legal Intern\", \"Law/Legal Internship\", \"Legal Associate\").",
    "Pay: 114 of 484 entry-level listings (23.6%) state a salary in rupees and 5 of 136 internships (3.7%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 587 listings (94.7%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, LinkedIn, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What are the best legal jobs for freshers in India?",
      "a": "Legal Associate (32 listings), Legal Executive (22) and Regulatory Compliance Associate (21) are the main full-time titles. Junior Advocate has 14. Many freshers start with an internship, since 136 of 620 listings are internships."
    },
    {
      "q": "What is a legal fresher salary in India?",
      "a": "Among 114 jobs that state pay, the median is ₹3.5 lakh a year, and 56.1% fall in the ₹3 to 5 lakh band. About three in four listings do not state pay."
    },
    {
      "q": "Which cities have the most legal jobs for freshers?",
      "a": "Mumbai has 105 listings, Bengaluru 86 and Delhi 54. Hyderabad has 39, and Chennai and Gurugram have 34 each. 26 listings are marked remote."
    },
    {
      "q": "Is there a legal internship with a stipend?",
      "a": "Yes, but few state it. 5 of 136 internships state a stipend, with a median of ₹14,583 a month. 13 listings say unpaid, so ask before you accept."
    },
    {
      "q": "Can I get a legal job without litigation?",
      "a": "Yes. Compliance titles such as Regulatory Compliance Associate (21 listings) and Compliance Analyst (8) sit alongside advocate roles. Some listings also mention GST, in 21 of 587 described listings."
    },
    {
      "q": "How do I get a legal job as a fresher?",
      "a": "Email the head of legal, compliance manager or partner with one short case note or contract review. Keep it to three lines and follow up once. That is a stronger move than another application among about 242 per opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 620 October listings.",
    "items": [
      [
        "Internships are common",
        "136 listings, 21.9% of the total, are internships."
      ],
      [
        "Look at compliance",
        "Compliance titles sit beside legal associate and advocate titles."
      ],
      [
        "Ask about the stipend",
        "Only 5 internships state one, and 13 say unpaid."
      ],
      [
        "Read the bond terms",
        "22 listings mention a bond or service agreement."
      ],
      [
        "Use the listed emails",
        "49 listings, 8.3%, include an email address."
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
      "slug": "teacher-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Teaching Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Legal Jobs for Freshers in India 2026",
    "description": "620 active entry-level and internship listings for India posted in October 2026 (legal), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-legal-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Who in legal should you write to first?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
