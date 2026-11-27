import { StuCta } from "~/components/site-b2c/StuCta";
import { DataReport, dataReportMeta, type DataReportContent } from "~/components/reports/DataReport";

// SEO-NOV (17 Nov 2026): a data report from the Studojo Jobs Index (India listings posted 1 to 15 November 2026). The
// numbers come from the index pull of 17 Nov; the words passed the bulk content gate (no invented numbers, no retired claims).
const R: DataReportContent = {
  "slug": "cybersecurity-internship-india-2026",
  "title": "Cybersecurity Internship in India 2026: 75 Listings, 68% Remote",
  "short": "Cybersecurity Internship 2026",
  "description": "Cybersecurity internship in India: 75 listings in the Studojo Jobs Index, 68.0% marked remote, 42.7% mention a certificate, only 1 states a stipend.",
  "keywords": "cybersecurity internship in india, cyber security internship, ethical hacking internship, soc analyst internship",
  "h1": "Cybersecurity Internship in India:",
  "h1em": "Certificates Yes, Stipends Unstated",
  "sub": "The Studojo Jobs Index has 75 cybersecurity internships in India posted 1 to 15 November 2026. 68.0% are marked remote, 42.7% of descriptions mention a certificate, and just 1 listing states a stipend. Ten employers post 64.0% of them.",
  "published": "2026-11-27",
  "scope": "India · cybersecurity internship",
  "findings": [
    "**A cybersecurity internship in India** is almost always titled some version of Cyber Security Intern: that exact title covers 32 of the 75 listings (42.7%) in the Studojo Jobs Index, and Cybersecurity Intern another 15.",
    "**A handful of employers post most of these**: 37 employers posted the 75 listings, and the ten busiest hold 64.0%, against 13.0% across the whole index.",
    "**Most are remote**: 51 of 75 listings (68.0%) carry the remote flag and 53 name no city, against 6.5% remote across the index.",
    "**The certificate is louder than the pay**: 42.7% of descriptions mention a certificate, about six times the index rate of 6.9%, while 1 of 75 listings states a stipend. Settle the figure before you say yes.",
    "**The move that works** is a short email to the security lead or SOC manager with one small, legal lab write-up. Stu finds the security lead and writes a short note from your real work."
  ],
  "stats": [
    {
      "num": "75",
      "label": "Cybersecurity internship listings in India, 1 to 15 November 2026",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "1.3%",
      "label": "Of these internships state their pay in rupees",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    },
    {
      "num": "45.3%",
      "label": "Of listings with a full description ask for Python",
      "source": "Studojo Jobs Index, 1 to 15 Nov 2026"
    }
  ],
  "sections": [
    {
      "title": "What are cyber security internships called?",
      "sub": "The ten most common titles across 75 listings, spelled as posted.",
      "paras": [
        "A cybersecurity internship in India is listed under a small set of near-identical titles. Of 75 listings posted in the first half of November 2026, Cyber Security Intern covers 32 (42.7%), Cybersecurity Intern 15 (20.0%) and Cyber Security Internship 8 (10.7%). Search both spellings, with and without the space, or you will miss a large chunk of the pool.",
        "The more specific titles are rare. Cybersecurity Analyst Intern has 3 listings, Soc Intern 2 and Soc Analyst Internship 1. One title promises SOC analyst practical training on named tools, and another is a sales development intern selling security products. At least two titles in this list describe a training programme and a sales role, not hands-on security work, so read past the word cyber.",
        "This is a concentrated pool. 37 employers posted all 75 listings, and the ten busiest hold 64.0%. The whole index looks nothing like this: its ten busiest employers hold 13.0%. When a few names post most of the seats, one employer can run several near-identical listings, so check you are not writing to the same company three times under different spellings."
      ],
      "table": {
        "head": [
          "Job title (as posted)",
          "Listings"
        ],
        "rows": [
          [
            "Cyber Security Intern",
            "32"
          ],
          [
            "Cybersecurity Intern",
            "15"
          ],
          [
            "Cyber Security Internship",
            "8"
          ],
          [
            "Cybersecurity Analyst Intern",
            "3"
          ],
          [
            "Soc Intern",
            "2"
          ],
          [
            "Intern Cyber",
            "2"
          ],
          [
            "Cyber Security - Internship (Wfh)",
            "1"
          ],
          [
            "Sales Development Intern - B2B Sales (Cybersecurity)",
            "1"
          ],
          [
            "Soc Analyst Internship",
            "1"
          ],
          [
            "Cyber Security Intern / Soc Analyst Wazuh/Splunk Practical Training",
            "1"
          ]
        ],
        "note": "Titles exactly as employers wrote them. 37 different employers posted these listings, and 0.0% of listings do not name the employer."
      }
    },
    {
      "title": "Can you do a cybersecurity internship from home?",
      "sub": "Two in three listings carry the remote flag.",
      "paras": [
        "Usually, yes. 51 of the 75 listings (68.0%) are marked remote, against 6.5% across the whole index, and 53 name no city. Work from home is written into 10.7% of descriptions and hybrid into 6.7%, while work from office appears in 2.7%. For most of this pool, where you live does not decide whether you can apply.",
        "The named cities are a short and unusual list. Chennai, Bengaluru, Kozhikode and Kolkata have 3 listings each (4.0%). Coimbatore, Erode, Madurai, Pollachi, Namakkal and Theni have 2 each, and all six are in Tamil Nadu. A listing can name several places, so one employer posting across one state can put a cluster of small towns on the chart at once.",
        "Most of these internships, 68.0%, were found on LinkedIn. Shine and Internshala have 12.0% each, company career sites and ATS pages 6.7%, and Naukri 1.3%. Because the remote seats are open to anyone in India, the competition for each one is national. That makes a specific, personal note to the right person matter far more than which city you happen to live in."
      ],
      "chart": {
        "id": "rcii2129Cities",
        "kind": "hbar",
        "label": "Where the listings are: top cities (Studojo Jobs Index, 1 to 15 Nov 2026, n=75)",
        "labels": [
          "Chennai",
          "Bengaluru",
          "Kozhikode",
          "Kolkata",
          "Coimbatore",
          "Erode",
          "Madurai",
          "Pollachi",
          "Namakkal",
          "Theni"
        ],
        "values": [
          3,
          3,
          3,
          3,
          2,
          2,
          2,
          2,
          2,
          2
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
            "Chennai",
            "3",
            "4.0%"
          ],
          [
            "Bengaluru",
            "3",
            "4.0%"
          ],
          [
            "Kozhikode",
            "3",
            "4.0%"
          ],
          [
            "Kolkata",
            "3",
            "4.0%"
          ],
          [
            "Coimbatore",
            "2",
            "2.7%"
          ],
          [
            "Erode",
            "2",
            "2.7%"
          ],
          [
            "Madurai",
            "2",
            "2.7%"
          ],
          [
            "Pollachi",
            "2",
            "2.7%"
          ],
          [
            "Namakkal",
            "2",
            "2.7%"
          ],
          [
            "Theni",
            "2",
            "2.7%"
          ]
        ],
        "note": "A listing can name more than one city. 51 listings are marked remote and 53 name no city."
      }
    },
    {
      "title": "Ethical hacking or SOC analyst internship: what do listings ask for?",
      "sub": "What the 75 descriptions mention: degrees, skills and terms.",
      "paras": [
        "Freshers are named in 46.7% of descriptions and BTech, BE or computer science in 56.0%. GitHub appears in just 4.0% and a portfolio in 1.3%. So most of these listings ask for a degree line and an interest in security, not a public body of work. That leaves room for you to stand out with one documented lab that a reviewer can open.",
        "On skills, Python is named in 45.3% of descriptions, against 3.5% across the whole index. Communication skills appear in 60.0%, which fits SOC work: an analyst writes up alerts for someone else to act on. Cloud (AWS, Azure, GCP) is named in 12.0% and JavaScript, React or Node in 5.3%. Our keyword list does not count security tools one by one, so read each description for the ones it names.",
        "The terms tell you what kind of internship it is. A certificate is mentioned in 42.7% of descriptions, about six times the index rate of 6.9%. Incentives appear in 8.0%, a hint that some seats may involve selling. A pre-placement offer (PPO) is mentioned in 2.7%. No description mentions a registration, training or deposit fee, but if anyone asks you to pay for a cybersecurity internship, treat it as a course, not a job."
      ],
      "chart": {
        "id": "rcii2129Terms",
        "kind": "hbar",
        "label": "What the listings say about the job: share that mention each term (75 listings with a full description)",
        "labels": [
          "freshers",
          "a certificate",
          "work from home",
          "incentives",
          "hybrid",
          "unpaid"
        ],
        "values": [
          46.7,
          42.7,
          10.7,
          8.0,
          6.7,
          6.7
        ],
        "unit": "%"
      }
    },
    {
      "title": "When are cybersecurity internships posted, and do they pay?",
      "sub": "Posting days across 75 listings, and the one stated stipend.",
      "paras": [
        "Sunday is the busiest day, with 21 listings (28.0%), against 5.8% of listings across the whole index. Thursday has 13 and Saturday 12 (16.0%), while Tuesday is the quietest with 5. Whatever the reason for the weekend peak, checking new listings on Sunday evening and writing early on Monday puts you among the first people a team sees.",
        "Pay is almost never written down. 1 of the 75 listings (1.3%) states a stipend, with a top of ₹12,000 a month, and one number is not a market rate. Across all internships in the index, 2.1% state a stipend, with a median of ₹12,500. Five descriptions, 6.7% of them, say outright that the seat is unpaid.",
        "So ask early and plainly: is it paid, how much a month, for how long, and what you will actually work on. A good answer names real tasks, such as reviewing alerts, writing detection notes or testing a staging system with permission. A vague answer that leans on the certificate tells you most of what you need to know."
      ],
      "chart": {
        "id": "rcii2129Days",
        "kind": "bar",
        "label": "Day of the week the listings were posted (Studojo Jobs Index, 1 to 15 Nov 2026, n=75)",
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
          7,
          5,
          8,
          13,
          9,
          12,
          21
        ],
        "unit": "listings"
      },
      "callout": "**Ask first:** 1 of 75 listings states a stipend, and 42.7% mention a certificate. A certificate is not pay."
    },
    {
      "title": "How do you get a cybersecurity internship?",
      "sub": "Show one documented lab to the person who runs security.",
      "paras": [
        "Write to the security lead, the SOC manager or the head of IT. At a small company or a security startup, that is usually a founder or the CTO. They are the people short of hands when alerts pile up, and they decide who joins. Only 3 of 75 descriptions (4.0%) carry an email address, so expect to find the person yourself.",
        "Your proof is one small, legal piece of work. Set up a home lab, collect logs from your own machine, write two detection rules and a one-page note on what fired and why. Or write up a capture-the-flag challenge you solved, step by step. Never test a company's live systems without written permission; that is the fastest way to lose the seat.",
        "The email is three lines: who you are, the lab or write-up and what it shows, and a request to help their team. If a week passes, follow up once. Finding that person is the slow part, and Stu does it: it verifies the work email and sends your note from your own inbox once you start a campaign."
      ]
    }
  ],
  "method": [
    "This report counts **75 listings** from the Studojo Jobs Index: active listings for India posted between 1 and 15 November 2026, tagged entry-level or internship, as of our pull on 17 November 2026. Only internships are counted, and a listing counts as a cybersecurity internship when its job title matches that kind of role (the most common titles here: \"Cyber Security Intern\", \"Cybersecurity Intern\", \"Cyber Security Internship\").",
    "Pay: 1 of 75 internships (1.3%) state a stipend. We use the top of each stated range, per year for jobs and per month for internships, and leave out listings that state no pay or pay in another currency.",
    "Skills and terms are counted on the 75 listings (100.0%) whose description has at least 200 characters, by keyword match, so one listing can count for several skills (cloud and AI mentions that come from one large employer's standard company description are not counted). The listings come from job boards (LinkedIn, Shine, Internshala, Naukri) and company career pages; the same opening posted in two places can appear twice, and listings that closed before 17 November are not counted.",
    "The sources the index reads change from month to month, so compare shares between editions, not counts. Studojo builds this index for Stu, its AI career agent, to match people to jobs and find who is hiring. The report describes listings, not hires, and two weeks of data is not a trend."
  ],
  "faq": [
    {
      "q": "How many cybersecurity internships are there in India?",
      "a": "The Studojo Jobs Index has 75 cybersecurity internships in India posted 1 to 15 November 2026, from 37 employers. Ten of those employers account for 64.0% of the pool. Each listing is an opening, not a hire."
    },
    {
      "q": "Is a cyber security internship different from a cybersecurity internship?",
      "a": "No, only the spelling differs. Cyber Security Intern has 32 listings and Cybersecurity Intern 15, for the same kind of work. Search both."
    },
    {
      "q": "How do I get an ethical hacking internship?",
      "a": "Show one legal write-up, such as a capture-the-flag challenge or a home lab, and email the security lead directly. Python is named in 45.3% of descriptions, so basic scripting helps. Never test a live system without written permission."
    },
    {
      "q": "What does a SOC analyst internship involve?",
      "a": "Watching alerts, checking logs and writing up what happened. SOC titles are rare here: Soc Intern has 2 listings and Soc Analyst Internship 1. Communication skills appear in 60.0% of descriptions, because a SOC intern writes for other people."
    },
    {
      "q": "Do cybersecurity internships pay a stipend?",
      "a": "Almost none say. 1 of 75 listings states a stipend, ₹12,000 a month at the top, and 6.7% of descriptions say unpaid. Settle the figure before you say yes."
    },
    {
      "q": "Can I do a cybersecurity internship from home?",
      "a": "Usually. Two in three do: 51 of the 75 (68.0%) are flagged remote, and 53 leave the city out. Work from home is written into 10.7% of descriptions."
    }
  ],
  "takeaway": {
    "sub": "Five checks before you take a cybersecurity internship.",
    "items": [
      [
        "Search both spellings",
        "Cyber Security Intern has 32 listings and Cybersecurity Intern 15."
      ],
      [
        "Read the title twice",
        "Some titles describe training or sales, not security work."
      ],
      [
        "Ask the stipend",
        "1 of 75 listings states one, while 42.7% mention a certificate."
      ],
      [
        "Learn some Python",
        "Python turns up in 45.3% of the security descriptions."
      ],
      [
        "Email the security lead",
        "Send one legal lab write-up and follow up once."
      ]
    ]
  },
  "related": [
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
    "name": "Studojo Jobs Index, 1 to 15 November 2026: Cybersecurity Internship 2026",
    "description": "75 active entry-level and internship listings for India posted 1 to 15 November 2026 (cybersecurity internship), with stated pay, locations, skills mentioned and posting days, from the Studojo Jobs Index.",
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
      <StuCta via="report-cybersecurity-internship-india-2026" place="report-end" size="card" title={"Want your lab write-up in front of a security lead?"} line={"Tell Stu you want a cybersecurity internship. Stu finds the person who runs security, verifies their work email and writes a short note from your real work. No email leaves your own inbox until you start a campaign."} />
    </DataReport>
  );
}
