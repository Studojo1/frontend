import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "technical-support-jobs-for-freshers-india-2026",
  "title": "Technical Support Jobs for Freshers in India: 1,946 Listings 2026",
  "short": "Technical Support Jobs for Freshers 2026",
  "description": "Technical support jobs for freshers in India: 1,946 October listings, 19.8% mention shifts, and a median stated salary of ₹4.5 lakh a year.",
  "keywords": "technical support jobs for freshers, technical support fresher salary, technical support jobs in india 2026, how to get a technical support job as a fresher, technical support internship",
  "h1": "Technical Support Jobs for Freshers in India:",
  "h1em": "What 1,946 Listings Show",
  "sub": "We tracked 1,946 technical support jobs for freshers posted in October 2026. 19.8% of described listings mention night, rotational or US or UK shifts, and 77.5% ask for communication skills. 423 state pay, with a median of ₹4.5 lakh a year.",
  "published": "2026-11-11",
  "scope": "India · technical support · freshers and interns",
  "findings": [
    "There are **1,946 technical support jobs for freshers** in the Studojo Jobs Index for October 2026, and 1,912 are full-time jobs. Only 34 are internships (1.7%).",
    "**Voice and desk roles both appear.** Technical Support Executive has 97 listings, Technical Support Engineer 81 and Desktop Support Engineer 78, next to voice process titles that run to 113 and 52 listings.",
    "**Shifts are part of the deal.** Of 1,542 described listings, 306 (19.8%) mention night, rotational or US or UK shifts, and 34 mention cab or transport.",
    "**Pay is stated more often than in tech roles.** 423 jobs (22.1%) state it, with a median of ₹4.5 lakh a year, and 166 listings each sit in the ₹3 to 5 lakh and ₹5 to 8 lakh bands.",
    "**Email the support operations manager.** Send a short troubleshooting note and follow up once. Stu finds the person and drafts the email from your real work."
  ],
  "stats": [
    {
      "num": "1,946",
      "label": "Technical support listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "₹4.5 lakh",
      "label": "Median stated pay a year, from the 423 jobs that state it (22.1%)",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "11.9%",
      "label": "Of listings with a full description ask for cloud (AWS, Azure, GCP)",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are technical support fresher jobs called, and who posts them?",
      "sub": "Voice process, executive, engineer and desktop titles all sit in one search.",
      "paras": [
        "Technical Support Executive has 97 of 1,946 listings (5.0%), Technical Support Engineer 81 (4.2%), Desktop Support Engineer 78 (4.0%), Technical Support Specialist 67 and Technical Support Associate 55. Tech Support Professional has 39, Infra Tech Support Practitioner 33 and IT Support Engineer 33.",
        "The single biggest title is a voice process role, with 113 listings (5.8%), followed by an international voice process version with 52. Voice work means you solve problems on calls, often for customers abroad. Desk and infrastructure roles are more hands-on, so choose by how you want to spend the day.",
        "657 different employers posted these listings, and the top ten account for 31.1%. 14.6% do not name the employer. Many support jobs are posted by staffing and outsourcing firms, so ask who the end client is before you accept."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Technical Support Voice Process Professional Daydream",
            "113"
          ],
          [
            "Technical Support Executive",
            "97"
          ],
          [
            "Technical Support Engineer",
            "81"
          ],
          [
            "Desktop Support Engineer",
            "78"
          ],
          [
            "Technical Support Specialist",
            "67"
          ],
          [
            "Technical Support Associate",
            "55"
          ],
          [
            "Technical Support International Voice Process Professional Daydream",
            "52"
          ],
          [
            "Tech Support Professional",
            "39"
          ],
          [
            "Infra Tech Support Practitioner",
            "33"
          ],
          [
            "IT Support Engineer",
            "33"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 657 different employers posted these listings, and 14.6% of listings do not name the employer."
      }
    },
    {
      "title": "Where are technical support jobs in India?",
      "sub": "Bengaluru has a fifth, and the metros share most of the rest.",
      "paras": [
        "Bengaluru has 392 listings (20.1%). Pune has 201 (10.3%), Mumbai 197 (10.1%), Chennai 180 (9.2%) and Hyderabad 166 (8.5%). Noida has 127, Gurugram 121, Delhi 87 and Kolkata 81. Pune ranks just above Mumbai, which leads the whole index.",
        "Kolkata and Ahmedabad (53) appear in the top ten, which matters if you want a support job without moving to a southern metro. A listing can name more than one city, and 49 name no city at all.",
        "Only 17 listings (0.9%) are marked remote, though 71 mention hybrid. Support work is largely done from an office, often on shifts. Plan for a commute, and check whether a cab is provided: 34 listings mention cab or transport."
      ],
      "chart": {
        "id": "rtsjffi39Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=1,946)",
        "labels": [
          "Bengaluru",
          "Pune",
          "Mumbai",
          "Chennai",
          "Hyderabad",
          "Noida",
          "Gurugram",
          "Delhi",
          "Kolkata",
          "Ahmedabad"
        ],
        "values": [
          392,
          201,
          197,
          180,
          166,
          127,
          121,
          87,
          81,
          53
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
            "392",
            "20.1%"
          ],
          [
            "Pune",
            "201",
            "10.3%"
          ],
          [
            "Mumbai",
            "197",
            "10.1%"
          ],
          [
            "Chennai",
            "180",
            "9.2%"
          ],
          [
            "Hyderabad",
            "166",
            "8.5%"
          ],
          [
            "Noida",
            "127",
            "6.5%"
          ],
          [
            "Gurugram",
            "121",
            "6.2%"
          ],
          [
            "Delhi",
            "87",
            "4.5%"
          ],
          [
            "Kolkata",
            "81",
            "4.2%"
          ],
          [
            "Ahmedabad",
            "53",
            "2.7%"
          ]
        ],
        "note": "A listing can name more than one city. 17 listings are marked remote and 49 name no city."
      }
    },
    {
      "title": "What is a technical support fresher salary in India?",
      "sub": "Stated pay is mostly ₹3 to 8 lakh a year, and about four in five listings do not state it.",
      "paras": [
        "Of 1,912 jobs, 423 (22.1%) state pay in rupees. The median stated salary, using the top of each range, is ₹4.5 lakh a year, and the middle half runs from ₹3 lakh to ₹5.5 lakh. The top of a range often includes shift allowance, so ask about the fixed part.",
        "The ₹3 to 5 lakh band holds 166 listings (39.2%) and ₹5 to 8 lakh holds another 166 (39.2%). 54 sit at ₹2 to 3 lakh and 19 are under ₹2 lakh. 15 reach ₹8 to 12 lakh. The ceiling for a fresher is limited, and most offers will sit well below the top of a stated range.",
        "No internship states a stipend, and only 34 internships exist, so this is a full-time-first role. Immediate joining appears in 142 described listings (9.2%). That is a hint that employers want to fill seats quickly, which helps you if you can start soon."
      ],
      "chart": {
        "id": "rtsjffi39Pay",
        "kind": "bar",
        "label": "Stated salary, top of range, per year (423 jobs that state pay in rupees)",
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
          19,
          54,
          166,
          166,
          15,
          2,
          1
        ],
        "unit": "listings"
      }
    },
    {
      "title": "What skills do technical support fresher listings ask for?",
      "sub": "Communication far outweighs any tool, and shifts are common.",
      "paras": [
        "Of 1,542 listings with a full description, 1,195 (77.5%) mention communication skills and 333 (21.6%) mention English. Cloud appears in 183 (11.9%), CRM tools in 107 (6.9%) and Excel in 68 (4.4%). SQL appears in 60 (3.9%) and Hindi in 55 (3.6%).",
        "This is a job about explaining things to people who are stuck. If you have helped a friend fix a laptop, set up a router or write a clear how-to, that is real evidence. Cloud at 11.9% shows which listings lean towards infrastructure support.",
        "On conditions, 306 listings (19.8%) mention night, rotational or US or UK shifts, 260 (16.9%) ask for a BTech, BE or computer science degree and 199 (12.9%) say freshers. 68 (4.4%) accept any graduate and 33 (2.1%) a 12th pass. 120 mention work from office and 93 mention PF, ESI or health insurance."
      ],
      "chart": {
        "id": "rtsjffi39Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (1,542 listings with a full description)",
        "labels": [
          "communication skills",
          "English",
          "cloud (AWS, Azure, GCP)",
          "CRM tools (Salesforce, HubSpot or similar)",
          "Excel",
          "SQL",
          "Hindi",
          "calling or telecalling",
          "ChatGPT or AI tools",
          "Python"
        ],
        "values": [
          77.5,
          21.6,
          11.9,
          6.9,
          4.4,
          3.9,
          3.6,
          2.3,
          1.4,
          1.2
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a technical support fresher?",
      "sub": "Use the emails in the listings, then write to the support manager.",
      "paras": [
        "About 242 applications arrive per opening (Business Insider data cited by The Interview Guys, April 2026), and an online application succeeds roughly 0.1% to 2% of the time (The Interview Guys, April 2026). Here 115 listings (7.5%) put an email in the description, so use those first. Naukri carries 71.8% of these listings, so the portal queue is long.",
        "For the rest, find the support operations manager, the service desk manager or the team leader for the process. Send one small piece of proof: a short troubleshooting note on a fault you fixed, with the symptoms, the steps and the result. A one-minute voice note explaining it can help for voice roles.",
        "Keep the email to three lines: who you are, the note, and a question about whether the team has a fresher seat and which shift. Follow up once. Monday carries 30.0% of postings, so write on Tuesday or Wednesday. Stu finds the right manager, verifies the email and drafts the note from your real work."
      ]
    }
  ],
  "method": [
    "This report counts **1,946 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as technical support when its job title matches that role (the most common titles here: \"Technical Support Voice Process Professional Daydream\", \"Technical Support Executive\", \"Technical Support Engineer\").",
    "Pay: 423 of 1,912 entry-level listings (22.1%) state a salary in rupees and 0 of 34 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 1,542 listings (79.2%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (Naukri, Shine, LinkedIn, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "What does a technical support fresher do?",
      "a": "You help customers or employees solve technical problems by call, chat or at a desk. 77.5% of the 1,542 described listings mention communication skills, and 19.8% mention shifts."
    },
    {
      "q": "What is a technical support fresher salary in India?",
      "a": "Among 423 jobs that state pay, the median is ₹4.5 lakh a year, and 39.2% sit in each of the ₹3 to 5 lakh and ₹5 to 8 lakh bands. About four in five listings do not state pay."
    },
    {
      "q": "Which city has the most technical support jobs?",
      "a": "Bengaluru has 392 of 1,946 listings (20.1%). Pune has 201, Mumbai 197, Chennai 180 and Hyderabad 166."
    },
    {
      "q": "Are technical support jobs night shifts?",
      "a": "Some are. 306 of 1,542 described listings (19.8%) mention night, rotational or US or UK shifts. Ask for the shift in writing before you accept."
    },
    {
      "q": "Can I get a technical support job without a BTech?",
      "a": "Yes. Only 260 of 1,542 described listings (16.9%) ask for a BTech or BE, and 68 (4.4%) accept any graduate. 199 (12.9%) mention freshers."
    },
    {
      "q": "How do I get a technical support job as a fresher?",
      "a": "Use the emails in the 115 listings that include one, or write to the support operations manager with a short troubleshooting note. Three lines, one follow-up. That is better than another entry in a queue of about 242 per opening."
    }
  ],
  "takeaway": {
    "sub": "What to remember from 1,946 October listings.",
    "items": [
      [
        "Check the shift",
        "306 described listings mention night or rotational shifts."
      ],
      [
        "Ask who the client is",
        "14.6% of listings do not name the employer."
      ],
      [
        "Talk well",
        "Communication skills appear in 77.5% of described listings."
      ],
      [
        "Use the listed emails",
        "115 listings include an email address."
      ],
      [
        "Pay is mostly ₹3 to 8 lakh",
        "The median stated salary is ₹4.5 lakh a year."
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
      "slug": "hotel-hospitality-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Hotel and Hospitality Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: Technical Support Jobs for Freshers 2026",
    "description": "1,946 active entry-level and internship listings for India posted in October 2026 (technical support), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-technical-support-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want the support manager's email, not another portal form?"} line={"Tell Stu the role, the city and the pay you want. Stu finds who is hiring, verifies their work email and writes a short note from your real work. Nothing sends until you start a campaign."} />
    </DataReport>
  );
}
