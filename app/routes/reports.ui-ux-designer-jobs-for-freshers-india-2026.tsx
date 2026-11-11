import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-BULK (11 Nov 2026): a data report from the Studojo Jobs Index (October 2026 India listings). The numbers come
// from the index pull of 11 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "ui-ux-designer-jobs-for-freshers-india-2026",
  "title": "UI/UX Designer Jobs for Freshers in India 2026: 385 Listings",
  "short": "UI/UX Designer Jobs for Freshers 2026",
  "description": "UI/UX designer jobs for freshers in India: 385 October listings, 47.5% internships, Figma in 79.4% of descriptions, a portfolio asked in 52.3%.",
  "keywords": "UI/UX designer jobs for freshers, UI/UX designer fresher salary, UI/UX designer jobs in india 2026, how to get a UI/UX designer job as a fresher, UI/UX designer internship",
  "h1": "UI/UX Designer Jobs for Freshers in India:",
  "h1em": "What 385 Listings Show",
  "sub": "UI/UX designer jobs for freshers are a small, internship-heavy field: 385 October listings in the Studojo Jobs Index, 202 jobs and 183 internships. Figma is in 79.4% of descriptions and 52.3% ask for a portfolio.",
  "published": "2026-11-11",
  "scope": "India · UI/UX designer · freshers and interns",
  "findings": [
    "**UI/UX designer jobs for freshers are half internships**: 183 of 385 listings (47.5%), compared with 10.8% across the whole index.",
    "**Figma is the standard**: 79.4% of the 373 listings with a full description name it, and 48.3% name Adobe tools such as Photoshop or Illustrator.",
    "**A portfolio is the real entry rule**: 52.3% of descriptions ask for one, more than any degree requirement (BTech or computer science is 20.1%).",
    "**Remote is common**: 94 listings (24.4%) are marked remote, but only 19 jobs (9.4%) state pay, and no internship states a stipend.",
    "**Email the design lead with one case study**: the head of design or product designer who owns the product. We built Stu to find that person and write the email from your own inbox."
  ],
  "stats": [
    {
      "num": "385",
      "label": "UI/UX designer listings posted in October 2026",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "9.4%",
      "label": "Of these jobs state their pay in rupees",
      "source": "Studojo Jobs Index, Oct 2026"
    },
    {
      "num": "79.4%",
      "label": "Of listings with a full description ask for Figma",
      "source": "Studojo Jobs Index, Oct 2026"
    }
  ],
  "sections": [
    {
      "title": "What are UI/UX designer jobs for freshers called?",
      "sub": "Spelling is messy, and 289 employers post them.",
      "paras": [
        "UI/UX designer jobs for freshers are posted under many spellings. UI/UX Designer has 37 listings, UI/UX Design Intern 34, UI/UX Design Internship 25 and Product Designer 25. Add the variants UI UX Designer (9), UI / UX Designer (6) and User Experience Designer (9) and the same job is split into a dozen strings.",
        "Search every variant. Product Designer (25) and Product Design Intern (7) are the same craft with a product label, and 6 listings titled UI/UX Developer lean towards front-end code, so read those carefully.",
        "289 different employers posted the 385 listings, the top ten hold only 16.6% and 0.5% of listings hide the employer. Supply is spread across many small teams, which suits direct outreach."
      ],
      "chart": {
        "id": "ruudjff13Mix",
        "kind": "doughnut",
        "label": "Full-time entry-level jobs vs internships (Studojo Jobs Index, Oct 2026, n=385)",
        "labels": [
          "Entry-level jobs",
          "Internships"
        ],
        "values": [
          202,
          183
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
            "UI/UX Designer",
            "37"
          ],
          [
            "UI/UX Design Intern",
            "34"
          ],
          [
            "UI/UX Design Internship",
            "25"
          ],
          [
            "Product Designer",
            "25"
          ],
          [
            "UI UX Designer",
            "9"
          ],
          [
            "User Experience Designer",
            "9"
          ],
          [
            "Product Design Intern",
            "7"
          ],
          [
            "UI/UX Developer",
            "6"
          ],
          [
            "UI / UX Designer",
            "6"
          ],
          [
            "Product Design Internship",
            "4"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 289 different employers posted these listings, and 0.5% of listings do not name the employer."
      }
    },
    {
      "title": "Which cities hire UI/UX designers, and is remote an option?",
      "sub": "Bengaluru leads, but one in four listings is remote.",
      "paras": [
        "Bengaluru has 51 listings (13.2%), Mumbai 37 (9.6%), Delhi 33 (8.6%) and Noida 30 (7.8%). The Delhi NCR cluster of Delhi, Noida and Gurugram (18) adds up to more than Bengaluru, so the north is a strong market for design.",
        "Hyderabad and Pune have 16 each, Ahmedabad 14, Chennai 11 and Chandigarh 10. The sample is small, so treat these as direction, not ranking.",
        "The bigger signal is remote. 94 listings (24.4%) are marked remote and 112 name no city, which together cover over half the set. A design portfolio is portable, so you can apply beyond your own city."
      ],
      "chart": {
        "id": "ruudjff13Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, Oct 2026, n=385)",
        "labels": [
          "Bengaluru",
          "Mumbai",
          "Delhi",
          "Noida",
          "Gurugram",
          "Hyderabad",
          "Pune",
          "Ahmedabad",
          "Chennai",
          "Chandigarh"
        ],
        "values": [
          51,
          37,
          33,
          30,
          18,
          16,
          16,
          14,
          11,
          10
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
            "51",
            "13.2%"
          ],
          [
            "Mumbai",
            "37",
            "9.6%"
          ],
          [
            "Delhi",
            "33",
            "8.6%"
          ],
          [
            "Noida",
            "30",
            "7.8%"
          ],
          [
            "Gurugram",
            "18",
            "4.7%"
          ],
          [
            "Hyderabad",
            "16",
            "4.2%"
          ],
          [
            "Pune",
            "16",
            "4.2%"
          ],
          [
            "Ahmedabad",
            "14",
            "3.6%"
          ],
          [
            "Chennai",
            "11",
            "2.9%"
          ],
          [
            "Chandigarh",
            "10",
            "2.6%"
          ]
        ],
        "note": "A listing can name more than one city. 94 listings are marked remote and 112 name no city."
      }
    },
    {
      "title": "What is a UI/UX designer fresher salary in India?",
      "sub": "Few listings say. The ones that do sit around ₹4.2 lakh.",
      "paras": [
        "Only 19 of 202 jobs (9.4%) state pay in rupees. The median top of range is ₹4.2 lakh a year, with the middle half between ₹3.5 lakh and ₹5 lakh. Eight jobs sit in the ₹3 to 5 lakh band, 6 in ₹5 to 8 lakh and 2 in ₹8 to 12 lakh.",
        "That is a very small sample, so it is a hint, not a benchmark. 183 internships are listed, but none state a stipend in rupees, and 5.4% of descriptions say unpaid.",
        "Because pay is rarely posted, ask. A direct question about stipend and conversion is normal in design. Also note that 1.6% of descriptions mention a pre-placement offer (PPO)."
      ],
      "chart": {
        "id": "ruudjff13Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, Oct 2026, n=385)",
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
          65,
          55,
          55,
          76,
          76,
          50,
          8
        ],
        "unit": "listings"
      },
      "callout": "**Posting day:** 19.7% of listings were posted on a Thursday and the same share on a Friday, against 2.1% on a Sunday."
    },
    {
      "title": "What skills do UI/UX fresher jobs ask for?",
      "sub": "Figma, Adobe tools, communication and a portfolio.",
      "paras": [
        "Of 373 listings with a full description, 79.4% mention Figma, 49.3% communication skills and 48.3% Adobe tools. JavaScript, React or Node is in 16.6%, AI tools such as ChatGPT in 12.1%, social media in 11.3% and Canva in 7.5%.",
        "The terms chart carries the key line: 52.3% mention a portfolio. That is the entry rule, not a nice extra. 17.7% say freshers and 17.7% ask for a certificate. 20.1% mention BTech, BE or computer science, and 2.9% mention GitHub.",
        "So a self-taught designer with two strong case studies is competing on equal terms. Work from home is in 8.8% and hybrid in 3.8%, so the remote count above is not just a label."
      ],
      "chart": {
        "id": "ruudjff13Skills",
        "kind": "hbar",
        "label": "Share of listings that mention each skill (373 listings with a full description)",
        "labels": [
          "Figma",
          "communication skills",
          "Adobe tools (Photoshop, Illustrator)",
          "JavaScript, React or Node",
          "ChatGPT or AI tools",
          "social media",
          "Canva",
          "English",
          "machine learning or generative AI",
          "cloud (AWS, Azure, GCP)"
        ],
        "values": [
          79.4,
          49.3,
          48.3,
          16.6,
          12.1,
          11.3,
          7.5,
          7.0,
          5.4,
          4.8
        ],
        "unit": "%"
      }
    },
    {
      "title": "How do you get hired as a UI/UX designer fresher?",
      "sub": "Lead with one case study, to the person who owns the product.",
      "paras": [
        "Design applications are portfolio contests, and the pile is deep. The Interview Guys (April 2026) cite roughly 0.1% to 2% as the typical success rate of an online application. Skip the queue by sending the work straight to someone who can use it.",
        "Email the head of design, the design lead, or the product manager if there is no design team. Send one proof: a short case study of a real screen you redesigned (a public app flow works), with the before, the after and the reasoning in a few lines, as a Figma link they can open without a login. Do not send a 40-page deck.",
        "In three lines: who you are, the one flow you fixed and why it suits their product, and an ask for a short call. Follow up once. Stu does the slow part: it finds the hiring manager with a verified work email, drafts the note from your real work and sends it from your own inbox when you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **385 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 31 October 2026, tagged entry-level or internship, as of our pull on 11 November 2026. A listing counts as UI/UX designer when its job title matches that role (the most common titles here: \"UI/UX Designer\", \"UI/UX Design Intern\", \"UI/UX Design Internship\").",
    "Pay: 19 of 202 entry-level listings (9.4%) state a salary in rupees and 0 of 183 internships (0.0%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 373 listings (96.9%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Naukri, Shine, Internshala) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 11 November are not counted.",
    "Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and one month of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many UI/UX designer jobs for freshers are there in India?",
      "a": "The Studojo Jobs Index holds 385 October 2026 listings: 202 jobs and 183 internships, from 289 employers. That counts listings we track, not hires or the whole market."
    },
    {
      "q": "What is the UI/UX designer fresher salary in India?",
      "a": "Only 19 jobs state pay. Their median top of range is ₹4.2 lakh a year, with the middle half between ₹3.5 lakh and ₹5 lakh. That is a small sample, so treat it as a hint."
    },
    {
      "q": "Do UI/UX designer jobs need a degree?",
      "a": "Mostly a portfolio. 52.3% of descriptions ask for one, while 20.1% mention BTech, BE or computer science."
    },
    {
      "q": "Is Figma enough for UI/UX designer jobs in India 2026?",
      "a": "Figma is the core: it is in 79.4% of descriptions. Adobe tools appear in 48.3% and Canva in 7.5%, so Figma plus one Adobe tool covers most listings."
    },
    {
      "q": "Can I get a UI/UX designer internship as a fresher?",
      "a": "Yes. 183 of 385 listings (47.5%) are internships, such as UI/UX Design Intern (34) and UI/UX Design Internship (25). None of them state a stipend, so ask before you start."
    },
    {
      "q": "Are UI/UX designer jobs available remotely?",
      "a": "Many are. 94 listings (24.4%) are marked remote, and 8.8% of descriptions mention work from home."
    }
  ],
  "takeaway": {
    "sub": "Five things that move your UI/UX search.",
    "items": [
      [
        "Build two case studies",
        "52.3% of descriptions ask for a portfolio."
      ],
      [
        "Know Figma well",
        "It is named in 79.4% of descriptions."
      ],
      [
        "Search every spelling",
        "Ui/Ux, Ui Ux, Product Designer and User Experience Designer are the same craft."
      ],
      [
        "Use remote to widen your reach",
        "24.4% of listings are marked remote."
      ],
      [
        "Send the work to the design lead",
        "One Figma link, three lines, one follow-up."
      ]
    ]
  },
  "related": [
    {
      "slug": "graphic-designer-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Graphic Designer Jobs for Freshers 2026"
    },
    {
      "slug": "video-editor-jobs-for-freshers-india-2026",
      "kicker": "Role",
      "title": "Video Editor Jobs for Freshers 2026"
    },
    {
      "slug": "studojo-jobs-index-october-2026",
      "kicker": "Index",
      "title": "Studojo Jobs Index, October 2026"
    }
  ],
  "dataset": {
    "name": "Studojo Jobs Index, October 2026: UI/UX Designer Jobs for Freshers 2026",
    "description": "385 active entry-level and internship listings for India posted in October 2026 (UI/UX designer), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-ui-ux-designer-jobs-for-freshers-india-2026" place="report-end" size="card" title={"Want your case study in front of the design lead?"} line={"Tell Stu the role, the city and the pay you want. Stu writes a short personal email from your real work to the person hiring, and sends it from your own inbox once you start a campaign."} />
    </DataReport>
  );
}
