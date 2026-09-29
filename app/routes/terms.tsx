// The Terms of Service text is generated from the approved draft
// (Studojo/legal-rewrite/terms.html) with legal-rewrite/tools/html2jsx.py.
// Edit the draft and regenerate rather than hand-editing this markup, so the
// approved wording and this page stay identical.
import { LegalPage } from "~/components/legal/legal-page";
import { EFFECTIVE_DATE, LEGAL_ENTITY, PENDING, POLICY_VERSIONS, fill } from "~/lib/legal";
import type { Route } from "./+types/terms";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of Service | Studojo" },
    { name: "description", content: "The terms for using Studojo, including outreach, LinkedIn automation, AutoApply and payments." },
  ];
}

const TOC = [
  { id: "about", label: "1. About these terms" },
  { id: "eligibility", label: "2. Who can use Studojo" },
  { id: "account", label: "3. Your account" },
  { id: "services", label: "4. Our services" },
  { id: "outreach", label: "5. How Outreach Dojo works" },
  { id: "responsibility", label: "6. Responsibility for outreach" },
  { id: "linkedin", label: "7. LinkedIn automation" },
  { id: "autoapply", label: "8. AutoApply" },
  { id: "gmail", label: "9. Gmail and Google" },
  { id: "contacts", label: "10. Contact data" },
  { id: "ai", label: "11. AI-generated content" },
  { id: "academic", label: "12. Assignment Dojo and Humanizer" },
  { id: "use", label: "13. Acceptable use" },
  { id: "payments", label: "14. Prices, payments and credits" },
  { id: "refunds", label: "15. Refunds" },
  { id: "ip", label: "16. Your content and our property" },
  { id: "third", label: "17. Third-party services" },
  { id: "termination", label: "18. Suspension, termination and deletion" },
  { id: "warranty", label: "19. Disclaimer" },
  { id: "liability", label: "20. Limitation of liability" },
  { id: "indemnity", label: "21. Indemnity" },
  { id: "changes", label: "22. Changes to these terms" },
  { id: "law", label: "23. Governing law and disputes" },
  { id: "grievance", label: "24. Grievance officer" },
  { id: "general", label: "25. General" },
];

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" subtitle=<>Version {POLICY_VERSIONS.terms} · Effective {fill(EFFECTIVE_DATE)}</> toc={TOC}>
      <h2 id="about">1. About these terms</h2>
      <p>These terms are an agreement between you and Studojo Labs Private Limited (&quot;Studojo&quot;, &quot;we&quot;, &quot;us&quot;). They apply when you use any Studojo service:</p>
      <ul>
        <li>our websites (studojo.com, app.studojo.com and studojo.pro);</li>
        <li>our browser extensions (Studojo Job Assistant, Studojo Outreach and the Studojo LinkedIn Connector);</li>
        <li>our emails;</li>
        <li>anything you buy from us.</li>
      </ul>
      <p>Our <a href="/privacy">Privacy Policy</a> and <a href="/refund-policy">Refund Policy</a> form part of these terms. If they conflict, the Refund Policy wins on refunds, the Privacy Policy wins on personal data, and these terms win on everything else.</p>
      <div className="legal-tbl"><table><tbody>
        <tr><th>Legal name</th><td>Studojo Labs Private Limited</td></tr>
        <tr><th>CIN</th><td>{fill(LEGAL_ENTITY.cin)}</td></tr>
        <tr><th>GSTIN</th><td>{fill(LEGAL_ENTITY.gstin)}</td></tr>
        <tr><th>Registered office</th><td>{fill(LEGAL_ENTITY.registeredOffice)}, Bengaluru, Karnataka, India</td></tr>
        <tr><th>Email</th><td>admin@studojo.com</td></tr>
        <tr><th>Phone</th><td>{fill(LEGAL_ENTITY.phone)}</td></tr>
      </tbody></table></div>
      <h2 id="eligibility">2. Who can use Studojo</h2>
      <p>You must be <b>18 or older</b> to create an account or buy anything. If you are under 18, you may not use Studojo.</p>
      <p>By creating an account you confirm that you are 18 or older, that you can enter a binding contract, and that the information you give us is accurate. If we learn that an account belongs to someone under 18, we close it and delete its data.</p>
      <h2 id="account">3. Your account</h2>
      <ul>
        <li>Keep your login details secret. You are responsible for everything done through your account.</li>
        <li>You may hold one personal account. Do not share it or sell it.</li>
        <li>Tell us straight away at admin@studojo.com if you think someone else has accessed it.</li>
        <li>Our support staff may view your account, or sign in as you, to help you or to investigate a problem. Each time they do, it is logged.</li>
      </ul>
      <h2 id="services">4. Our services</h2>
      <ul>
        <li><b>Careers Dojo resume builder</b> (free): build, import, tailor and check resumes.</li>
        <li><b>Internship Dojo</b> (free): browse internship and job listings.</li>
        <li><b>Outreach Dojo</b> (paid): finds hiring contacts and sends personalised emails from your Gmail account. See section 5.</li>
        <li><b>LinkedIn automation</b> (paid plans): sends connection invitations and messages from your LinkedIn account. See section 7.</li>
        <li><b>AutoApply</b> (subscription): applies to jobs for you. See section 8.</li>
        <li><b>Assignment Dojo</b> (paid per document) and <b>Humanizer</b> (paid per 100 words): AI writing tools. See section 12.</li>
        <li><b>Career Coach</b>, quizzes and readiness scores (free): guidance generated from your profile.</li>
        <li><b>Webinars</b> (paid seats): live sessions.</li>
        <li><b>Browser extensions:</b> tools that work on job sites and LinkedIn.</li>
      </ul>
      <p>Studojo Partners, the Contact Enrichment API and the Sensei MCP are business products. They are governed by our Partner Terms {fill(PENDING.partnerTermsUrl)}, as well as these terms.</p>
      <p>We may change, add or remove features. If we remove a paid feature you have already bought and not received, the Refund Policy applies.</p>
      <h2 id="outreach">5. How Outreach Dojo works</h2>
      <p>When you launch a campaign, you authorise Studojo to do the following on your behalf:</p>
      <ol>
        <li>Search third-party data providers for people who match the roles, companies, industries and locations you choose.</li>
        <li>Write an email to each of them with AI, based on your resume, profile and settings.</li>
        <li>Send those emails from your connected Gmail account, in your name. A campaign sends about 20 emails a day, between 9am and 5pm in your time zone, 7 days a week.</li>
        <li>Send automatic follow-ups to people who have not replied.</li>
        <li>Read replies in your campaign threads and bounce notices, so we can show them to you and stop follow-ups.</li>
        <li>Track whether each email was opened, using a small image in the email.</li>
      </ol>
      <p>Emails are written and sent automatically. You can see a sample before launch, and you can pause or cancel a campaign at any time. We do not show you each email for approval before it is sent.</p>
      <p>Credits are reserved when you launch a campaign. A credit is used when Gmail accepts an email for sending. Unused credits return to your balance automatically, as the Refund Policy describes. Follow-ups and replacements for bounced emails are free.</p>
      <p>We do not promise that anyone will reply, or that you will get an interview, internship or job.</p>
      <h2 id="responsibility">6. Responsibility for outreach</h2>
      <p><b>You are responsible for:</b></p>
      <ul>
        <li>the accuracy of your resume, profile and anything you tell us about yourself;</li>
        <li>your choice of targeting;</li>
        <li>any email text you write or edit;</li>
        <li>stopping contact with anyone who asks you to stop;</li>
        <li>using outreach only for your own genuine job or internship search.</li>
      </ul>
      <p><b>We are responsible for</b> running the system as described in section 5. That includes no longer contacting addresses that bounce, or whose owners ask us to remove them.</p>
      <p>Because emails go out from your account and in your name, recipients and email providers will treat you as the sender. Complaints, spam reports and any action Google takes against your account follow from that, and we cannot control them.</p>
      <h2 id="linkedin">7. LinkedIn automation</h2>
      <p>To use LinkedIn features, you connect your LinkedIn account. You can do this with the LinkedIn Connector extension, which sends your LinkedIn session cookies to our servers. You can also give us your LinkedIn email and password, which we encrypt and use to sign in for you.</p>
      <p>You authorise us to use your LinkedIn account to send the invitations and messages your plan includes, and to read the replies to them. We route this activity through proxy servers located near you.</p>
      <p><b>Risk you accept:</b> LinkedIn&apos;s User Agreement restricts automated activity. LinkedIn may warn you, limit your account, ask you to verify your identity, or suspend your account. We are not responsible for any action LinkedIn takes, and none of these is grounds for a refund.</p>
      <p>You can disconnect LinkedIn at any time. Changing your LinkedIn password also ends our access.</p>
      <h2 id="autoapply">8. AutoApply</h2>
      <p>You authorise us to apply to jobs in your name. That includes submitting your resume and answering screening questions with answers generated by AI from your profile. Employers receive these applications as coming from you.</p>
      <p>Check your profile, because every answer is based on it. We do not guarantee that an application will be received, read or successful.</p>
      <h2 id="gmail">9. Gmail and Google</h2>
      <p>Outreach needs your Gmail account connected through Google, with permission to send email (gmail.send) and read email (gmail.readonly). We use read access only to find replies and bounce notices for your campaigns. Section 6 of the Privacy Policy describes exactly what we read.</p>
      <p>You can revoke access at any time at myaccount.google.com/permissions. Your campaigns pause until you reconnect.</p>
      <p>You must follow Google&apos;s terms and Gmail&apos;s sending limits. We are not responsible if Google limits or suspends your account.</p>
      <h2 id="contacts">10. Contact data</h2>
      <p>The contact details we find come from third-party data providers. They may be out of date or wrong, and we do not guarantee them.</p>
      <p>We give you access to contact data only for your own outreach through Studojo. You must not:</p>
      <ul>
        <li>copy it out of Studojo;</li>
        <li>sell it, share it or build a list from it;</li>
        <li>use it for anything other than your own job or internship search.</li>
      </ul>
      <h2 id="ai">11. AI-generated content</h2>
      <p>Much of Studojo uses AI: resumes, emails, answers, documents, rewrites and coaching. AI output can be wrong, incomplete or unsuitable. Check anything you rely on or submit under your name. Guidance, readiness scores and quiz results are suggestions, not professional career advice.</p>
      <h2 id="academic">12. Assignment Dojo and Humanizer</h2>
      <p>These are study aids. Generation starts as soon as you pay.</p>
      <ul>
        <li>You must follow the academic integrity rules of your college or university. It is your decision whether and how you use what we produce.</li>
        <li>We do not promise any mark, grade or score from a plagiarism or AI-detection tool.</li>
        <li>We are not responsible for any penalty from your institution.</li>
      </ul>
      <h2 id="use">13. Acceptable use</h2>
      <p>You must not:</p>
      <ul>
        <li>send spam or harassing, threatening, defamatory, discriminatory or unlawful content;</li>
        <li>misrepresent who you are, or your qualifications or intentions;</li>
        <li>contact people for anything other than your own genuine job or internship search;</li>
        <li>scrape, copy, resell or extract data from Studojo;</li>
        <li>get around limits, access controls or security measures, or probe, overload or disrupt our systems;</li>
        <li>use Studojo to break any law, or anyone else&apos;s rights or platform terms;</li>
        <li>create multiple accounts to abuse coupons, free features or refunds.</li>
      </ul>
      <h2 id="payments">14. Prices, payments and credits</h2>
      <ul>
        <li><b>Prices.</b> The price shown at checkout is the price you pay, including applicable taxes. Prices for future purchases may change.</li>
        <li><b>Currency and providers.</b> We set the currency and payment provider from the location we detect at checkout: rupees through Razorpay in India, and US dollars through Dodo Payments elsewhere. Some products are sold in rupees only. We never see or store your card or UPI details.</li>
        <li><b>Credits</b> have no cash value, cannot be transferred and <b>do not expire</b>.</li>
        <li><b>LinkedIn plans</b> run for a fixed period (7 or 30 days) from launch. Unused time does not carry over.</li>
        <li><b>Subscriptions</b> renew automatically at the end of each period until you cancel. You can cancel from your account at any time, and access continues until the end of the paid period.</li>
        <li><b>Coupons</b> are single-use unless stated, can&apos;t be combined, and have no cash value. We may cancel coupons that are misused, and orders placed with them.</li>
      </ul>
      <h2 id="refunds">15. Refunds</h2>
      <p>All sales are final except as set out in the <a href="/refund-policy">Refund Policy</a>.</p>
      <h2 id="ip">16. Your content and our property</h2>
      <p><b>Yours.</b> You own your resume, your profile, and the content Studojo generates for you. You give us permission to store, process and use that content only to run Studojo for you. That permission ends when you delete it or your account, except where we must keep records by law. We do not use your content to train AI models.</p>
      <p><b>Ours.</b> Studojo&apos;s software, design, text, brand and data compilations belong to Studojo Labs Private Limited or its licensors. You may use them only through the service.</p>
      <h2 id="third">17. Third-party services</h2>
      <p>Studojo depends on other companies&apos; services, including Google, LinkedIn, Microsoft Azure, OpenAI, data providers and payment providers. Their terms apply to your use of them. We are not responsible for their availability or their actions.</p>
      <h2 id="termination">18. Suspension, termination and deletion</h2>
      <ul>
        <li>We may suspend or close your account, with or without notice, if we reasonably believe you have broken these terms, created risk or legal exposure for us or others, or misused the service. We tell you the reason unless the law or safety prevents it.</li>
        <li>If we close your account for breaking these terms, your remaining credits, plan time and subscription period are forfeited.</li>
        <li>You can delete your account at any time from Settings. Deleting it disconnects Gmail and LinkedIn and deletes your data as the Privacy Policy describes. Any unused credits and plan time are forfeited.</li>
        <li>Sections 6, 10, 16 and 19 to 25 continue to apply after your account ends.</li>
      </ul>
      <h2 id="warranty">19. Disclaimer</h2>
      <p>Apart from the promises in these terms and the Refund Policy, Studojo is provided &quot;as is&quot; and &quot;as available&quot;. To the extent the law allows, we disclaim all other warranties, including fitness for a particular purpose. We do not promise uninterrupted service, accurate contact data or any career outcome.</p>
      <h2 id="liability">20. Limitation of liability</h2>
      <p>To the extent the law allows:</p>
      <ul>
        <li>we are not liable for indirect or consequential loss, including lost opportunities, lost income or reputational harm;</li>
        <li>we are not liable for action taken against your account by Google, LinkedIn or anyone else;</li>
        <li>our total liability to you for all claims is limited to the amount you paid us in the 12 months before the event that caused the claim.</li>
      </ul>
      <p>None of this limits liability for fraud, or for anything the law does not allow us to limit.</p>
      <h2 id="indemnity">21. Indemnity</h2>
      <p>You agree to compensate Studojo for claims, losses and reasonable legal costs caused by:</p>
      <ul>
        <li>your breach of these terms;</li>
        <li>email text you wrote or edited;</li>
        <li>false information you gave us;</li>
        <li>your use of Studojo to break a law or anyone else&apos;s rights.</li>
      </ul>
      <h2 id="changes">22. Changes to these terms</h2>
      <p>We will email you at least 7 days before a material change takes effect, and show a notice when you next sign in. If you keep using Studojo after that date, you accept the new terms. If you do not accept them, you may delete your account. Changes do not apply to purchases made before they take effect.</p>
      <h2 id="law">23. Governing law and disputes</h2>
      <p>These terms are governed by the laws of India. Please contact us first at admin@studojo.com so we can try to resolve a problem. Subject to that, the courts at Bengaluru, Karnataka have jurisdiction. If you are a consumer, you may also bring a complaint wherever the Consumer Protection Act 2019 allows. Nothing in these terms removes your rights as a consumer.</p>
      <h2 id="grievance">24. Grievance officer</h2>
      <p>Complaints about the service or about content on it go to our grievance officer, {fill(LEGAL_ENTITY.grievanceOfficer)}, at admin@studojo.com with &quot;GRIEVANCE&quot; at the start of the subject line, or by post to our registered office. We acknowledge within 24 hours and resolve within 15 days. Consumer complaints are resolved within one month.</p>
      <h2 id="general">25. General</h2>
      <ul>
        <li>If any part of these terms is unenforceable, the rest still applies.</li>
        <li>These terms, the Privacy Policy and the Refund Policy are the whole agreement between us about Studojo.</li>
        <li>We may transfer these terms to a company that takes over Studojo. You may not transfer them.</li>
        <li>We are not liable for delays or failures caused by events beyond our reasonable control. These include outages at Google, LinkedIn, Microsoft Azure or payment providers.</li>
        <li>We send notices to the email on your account. You send notices to admin@studojo.com.</li>
        <li>If we do not enforce a right straight away, we have not given it up.</li>
      </ul>
    </LegalPage>
  );
}
