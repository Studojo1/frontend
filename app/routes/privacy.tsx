// The Privacy Policy text is generated from the approved draft
// (Studojo/legal-rewrite/privacy.html) with legal-rewrite/tools/build_pages.py.
// Edit the draft and regenerate rather than hand-editing this markup, so the
// approved wording and this page stay identical.
import { LegalPage } from "~/components/legal/legal-page";
import { EFFECTIVE_DATE, LEGAL_ENTITY, POLICY_VERSIONS, fill } from "~/lib/legal";
import type { Route } from "./+types/privacy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy | Studojo" },
    { name: "description", content: "How Studojo collects, uses, shares and protects personal data, and your rights." },
  ];
}

const TOC = [
  { id: "who", label: "1. Who we are and what this covers" },
  { id: "collect", label: "2. What we collect from you" },
  { id: "use", label: "3. How we use it" },
  { id: "basis", label: "4. Legal basis" },
  { id: "contacts", label: "5. People we contact for our users" },
  { id: "gmail", label: "6. Gmail and Google data" },
  { id: "linkedin", label: "7. LinkedIn features" },
  { id: "ai", label: "8. AI and automated processing" },
  { id: "share", label: "9. Who we share it with" },
  { id: "transfer", label: "10. Where your data is stored" },
  { id: "providers", label: "11. Our service providers" },
  { id: "ads", label: "12. Advertising" },
  { id: "cookies", label: "13. Cookies and similar technology" },
  { id: "emails", label: "14. Emails we send you" },
  { id: "retention", label: "15. How long we keep it" },
  { id: "security", label: "16. Security" },
  { id: "rights", label: "17. Your rights" },
  { id: "children", label: "18. Children" },
  { id: "grievance", label: "19. Grievance officer and contact" },
  { id: "changes", label: "20. Changes to this policy" },
];

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" subtitle=<>Version {POLICY_VERSIONS.privacy} · Effective {fill(EFFECTIVE_DATE)}</> toc={TOC}>
      <div className="legal-key">
        <p><b>In short:</b></p>
        <ul>
          <li>We collect what you give us, including your resume, your profile and your answers. We also collect what our tools need to act for you: access to Gmail and LinkedIn, and records of the emails and messages we send for you.</li>
          <li>We use AI from OpenAI and Microsoft to write and analyse.</li>
          <li>We find other people&apos;s professional contact details through data providers, so we can reach out to them for you.</li>
          <li>We use analytics that record how you use the site, and Meta advertising tools.</li>
          <li>We never sell your personal data.</li>
          <li>Your data is stored in India. Some of it is processed in the United States and the EU.</li>
        </ul>
      </div>
      <h2 id="who">1. Who we are and what this covers</h2>
      <p>Studojo Labs Private Limited (&quot;Studojo&quot;, &quot;we&quot;) decides how your personal data is used. That makes us the &quot;data fiduciary&quot; under India&apos;s Digital Personal Data Protection Act 2023, and the &quot;controller&quot; under the GDPR.</p>
      <p>This policy covers:</p>
      <ul>
        <li>studojo.com, app.studojo.com and studojo.pro;</li>
        <li>our browser extensions: Studojo Job Assistant, Studojo Outreach and the Studojo LinkedIn Connector;</li>
        <li>emails we send;</li>
        <li>our partner API, the Contact Enrichment API and the Sensei MCP.</li>
      </ul>
      <p>Section 5 covers people who are not our users, but whose professional details we process.</p>
      <p>Registered office: {fill(LEGAL_ENTITY.registeredOffice)}, Bengaluru, Karnataka, India. Contact: admin@studojo.com. Our grievance officer is named in section 19.</p>
      <h2 id="collect">2. What we collect from you</h2>
      <div className="legal-tbl"><table>
        <thead><tr><th>Category</th><th>What it includes</th><th>Where it comes from</th></tr></thead>
        <tbody>
          <tr><td>Account</td><td>Name, email, phone number (verified by SMS code), password (stored hashed) or Google sign-in, Google profile photo, passkeys and two-factor settings, date you accepted our terms</td><td>You; Google if you sign in with Google</td></tr>
          <tr><td>Education and profile</td><td>College, year of study, course, graduation year, how you heard about us</td><td>You</td></tr>
          <tr><td>Resume and career</td><td>Resume files and text, experience, education, skills, projects, target roles, industries, locations, companies you want to work for, answers to our career quiz</td><td>You</td></tr>
          <tr><td>Insights we generate</td><td>AI-generated profile insights such as work style, company fit and companies to avoid; career readiness scores; how relevant each contact is to you</td><td>Created by us from your data (section 8)</td></tr>
          <tr><td>Gmail</td><td>OAuth access and refresh tokens; IDs of new messages in your inbox; the content of replies in your campaign threads; bounce notices for your outreach; the emails we send for you</td><td>Google, with your permission (section 6)</td></tr>
          <tr><td>LinkedIn</td><td>Session cookies (li_at, JSESSIONID and related cookies), or your LinkedIn email and password if you choose to sign in that way; invitations and messages we send; replies you receive</td><td>You, the LinkedIn Connector extension, and LinkedIn (section 7)</td></tr>
          <tr><td>Outreach records</td><td>Who was contacted, what was sent and when, delivery and bounce status, whether the email was opened, how the reply was classified</td><td>Created by our systems</td></tr>
          <tr><td>Job applications</td><td>Jobs you applied to through AutoApply, and the answers we generated and submitted</td><td>You and our systems</td></tr>
          <tr><td>Payments</td><td>Order and payment IDs, amount, currency, plan, coupon used, country detected at checkout, refunds, credit balance and credit history. We never see your card or UPI details.</td><td>You and our payment providers</td></tr>
          <tr><td>Support and forms</td><td>Emails to us; support chatbot conversations with your IP address and browser; forms for webinars, the campus ambassador programme (including WhatsApp number and social media handle), consultations, dissertations and demos</td><td>You</td></tr>
          <tr><td>Device and usage</td><td>IP address and approximate location, browser, device, pages viewed, clicks, recordings of your sessions on our site (with typed text hidden), ad click IDs (fbclid, gclid), campaign tags (UTM) and the site that referred you</td><td>Your browser, via cookies and similar tools (section 13)</td></tr>
          <tr><td>Emails from us</td><td>Whether you opened our emails and which links you clicked</td><td>Tracking in our emails</td></tr>
        </tbody>
      </table></div>
      <p>You don&apos;t have to give us everything. Without an email address you can&apos;t create an account. Without a Gmail connection, Outreach can&apos;t send. Without a resume, most personalisation won&apos;t work.</p>
      <h2 id="use">3. How we use it</h2>
      <div className="legal-tbl"><table>
        <thead><tr><th>Purpose</th><th>Data used</th></tr></thead>
        <tbody>
          <tr><td>Create and secure your account, and verify your phone</td><td>Account, device</td></tr>
          <tr><td>Build and tailor resumes, check them against job descriptions, and give career guidance</td><td>Profile, resume, insights</td></tr>
          <tr><td>Find contacts, write and send outreach emails and follow-ups, detect replies and bounces</td><td>Profile, resume, Gmail, outreach records, contact data</td></tr>
          <tr><td>Send LinkedIn invitations and messages, and read the replies</td><td>LinkedIn, profile</td></tr>
          <tr><td>Apply to jobs for you</td><td>Resume, profile, job applications</td></tr>
          <tr><td>Generate assignments and rewrites</td><td>What you submit</td></tr>
          <tr><td>Take payments, manage credits, give refunds</td><td>Payments, account</td></tr>
          <tr><td>Answer support requests, including through our AI chatbot</td><td>Support, account, and relevant records</td></tr>
          <tr><td>Send service emails (receipts, campaign updates, reconnect requests)</td><td>Account, outreach records</td></tr>
          <tr><td>Send tips, reminders and offers about Studojo. You can unsubscribe from any of these emails.</td><td>Account, profile, usage, email engagement</td></tr>
          <tr><td>Understand how Studojo is used, find bugs and improve the product</td><td>Usage, device</td></tr>
          <tr><td>Measure and target our advertising on Meta</td><td>Usage, device, hashed email (section 12)</td></tr>
          <tr><td>Prevent fraud, abuse and misuse of coupons and refunds</td><td>Account, payments, device</td></tr>
          <tr><td>Meet legal, tax and accounting obligations</td><td>Payments, account</td></tr>
        </tbody>
      </table></div>
      <p>We do not use your data to train AI models, and we do not let our AI providers train on it.</p>
      <h2 id="basis">4. Legal basis</h2>
      <p><b>In India</b>, we process your data on the basis of the consent you give when you sign up and when you connect Gmail or LinkedIn. We also rely on the &quot;legitimate uses&quot; the DPDP Act allows, such as complying with law. You can withdraw consent at any time (section 17). Withdrawing does not affect processing that happened before, but it may mean we can no longer provide the service.</p>
      <p><b>In the EU and UK</b>, we rely on the following:</p>
      <ul>
        <li>performing our contract with you, to provide the services;</li>
        <li>our legitimate interests in security, fraud prevention, product improvement and communicating with customers;</li>
        <li>your consent, for Gmail and LinkedIn connections, non-essential cookies and marketing;</li>
        <li>legal obligation, for tax and accounting records.</li>
      </ul>
      <h2 id="contacts">5. People we contact for our users</h2>
      <p>If you received an email or LinkedIn message through Studojo, this section is for you.</p>
      <p><b>What we hold:</b> your name, job title, company, work email address, and in some cases a personal email address or mobile number and your professional profile links.</p>
      <p><b>Where it comes from:</b> professional data providers, currently Apollo.io, SalesQL and LeadsForge, which compile it from public professional sources.</p>
      <p><b>What we use it for:</b></p>
      <ul>
        <li>So a Studojo user can contact you about job and internship opportunities. The email comes from the user&apos;s own Gmail account and is written with our AI tools.</li>
        <li>To give business customers contact details through our Contact Enrichment API.</li>
      </ul>
      <p>Our emails include a small image that tells us whether the email was opened.</p>
      <p><b>How to opt out:</b> email admin@studojo.com and ask us to stop. No Studojo user will be able to contact you through us again. If you also ask us to delete your details, we will do so within 30 days. We keep only a scrambled (hashed) copy of your address so that you stay opted out.</p>
      <h2 id="gmail">6. Gmail and Google data</h2>
      <p>When you connect Gmail, we ask Google for three permissions:</p>
      <ul>
        <li><b>gmail.send</b>, to send your outreach emails;</li>
        <li><b>gmail.readonly</b>, to detect replies and bounces;</li>
        <li><b>userinfo.email</b>, to know which address you connected.</li>
      </ul>
      <p><b>What we read.</b> Each time we check for replies, we fetch the list of IDs of new messages in your inbox. We open only messages in threads started by your campaigns, and bounce notices about emails we sent. We do not open or store any other message.</p>
      <p><b>Google sign-in.</b> If you sign in with Google, Google also gives us tokens for your basic profile. We store them with your account.</p>
      <p><b>Revoking access.</b> You can revoke access at any time at myaccount.google.com/permissions, or by deleting your Studojo account. Revoking pauses your campaigns until you reconnect.</p>
      <p><b>Limited Use.</b> Studojo&apos;s use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. Gmail data is never used for advertising, never sold, and never used to train AI models. It is read by staff only with your permission, for security reasons, or where the law requires it.</p>
      <h2 id="linkedin">7. LinkedIn features</h2>
      <p>LinkedIn automation needs access to your LinkedIn account, which you can give in two ways:</p>
      <ul>
        <li>The <b>LinkedIn Connector extension</b> reads your LinkedIn session cookies in your browser and sends them to our servers.</li>
        <li>You give us your <b>LinkedIn email and password</b>, and our servers sign in for you.</li>
      </ul>
      <p>We store these credentials encrypted (AES-256). We use them to send the invitations and messages your plan includes, and to read the replies to them. This activity runs through a proxy service (Evomi) set to a location near you.</p>
      <p>You can disconnect at any time, and changing your LinkedIn password ends our access. Section 7 of our Terms explains the risk that LinkedIn restricts your account.</p>
      <h2 id="ai">8. AI and automated processing</h2>
      <ul>
        <li><b>Providers.</b> We send your resume, profile and the content you submit to OpenAI (United States) and Microsoft Azure OpenAI (United States and Sweden). They write and analyse text for us: parsing resumes, tailoring them, writing emails and LinkedIn messages, classifying replies, answering screening questions, generating documents and running our support chatbot.</li>
        <li><b>Automatic sending.</b> Outreach emails, follow-ups and LinkedIn messages are written and sent automatically. We do not show them to you one by one for approval.</li>
        <li><b>Profiling.</b> We analyse your resume and quiz answers to infer things like your work style, the kinds of companies that suit you, and a career readiness score. We use these to choose contacts, write messages and give guidance. You can correct your resume and profile at any time, and that changes what we infer.</li>
        <li><b>No decisions with legal effect.</b> We don&apos;t make decisions about you by automated means that have legal or similarly significant effects. AutoApply submits applications you set up; employers make their own decisions.</li>
      </ul>
      <h2 id="share">9. Who we share it with</h2>
      <p><b>We do not sell your personal data.</b> We share it only in these ways:</p>
      <ul>
        <li>With the <b>service providers</b> listed in section 11, who process it for us under contract.</li>
        <li>With the <b>people you contact</b>: your outreach emails and LinkedIn messages, and whatever your profile puts in them.</li>
        <li>With <b>employers</b>, when AutoApply submits an application for you.</li>
        <li>With <b>Meta</b>, for advertising (section 12).</li>
        <li>With <b>authorities</b>, when the law requires it or to protect people&apos;s safety or our legal rights.</li>
        <li>With a <b>buyer or successor</b>, if Studojo is merged or sold. They will be bound by this policy.</li>
      </ul>
      <h2 id="transfer">10. Where your data is stored</h2>
      <p>Our main database, file storage and servers are on Microsoft Azure in Central India (Pune). Some providers process data outside India:</p>
      <ul>
        <li><b>United States:</b> OpenAI, Azure OpenAI, Mixpanel, Twilio, Resend, Meta, Apollo.io, IPinfo and Dodo Payments.</li>
        <li><b>European Union:</b> Azure OpenAI (Sweden), PostHog, SalesQL (Spain), LeadsForge (Estonia) and ip-api (Romania).</li>
        <li><b>United Kingdom:</b> SalesQL and Dodo Payments have UK entities.</li>
        <li><b>Switzerland:</b> Evomi.</li>
      </ul>
      <p>We transfer data only to countries the Indian government has not restricted. Where the GDPR applies, we rely on the European Commission&apos;s standard contractual clauses in each provider&apos;s data processing agreement.</p>
      <h2 id="providers">11. Our service providers</h2>
      <div className="legal-tbl"><table>
        <thead><tr><th>Provider</th><th>What they do for us</th><th>Location</th></tr></thead>
        <tbody>
          <tr><td>Microsoft Azure</td><td>Hosting, database, file storage, AI (Azure OpenAI), email delivery (Azure Communication Services)</td><td>India, US, Sweden</td></tr>
          <tr><td>OpenAI</td><td>AI writing and analysis, support chatbot</td><td>US</td></tr>
          <tr><td>Google</td><td>Sign-in, Gmail sending and reading</td><td>US</td></tr>
          <tr><td>Razorpay</td><td>Payments in rupees</td><td>India</td></tr>
          <tr><td>Dodo Payments</td><td>International payments</td><td>US, UK; operated from India</td></tr>
          <tr><td>Twilio</td><td>SMS verification codes</td><td>US</td></tr>
          <tr><td>Resend</td><td>Account and product emails</td><td>US</td></tr>
          <tr><td>PostHog</td><td>Product analytics, session recording</td><td>EU</td></tr>
          <tr><td>Mixpanel</td><td>Product analytics, session recording</td><td>US</td></tr>
          <tr><td>Meta</td><td>Advertising measurement and targeting</td><td>US</td></tr>
          <tr><td>Apollo.io, SalesQL, LeadsForge</td><td>Professional contact data</td><td>US (Apollo.io), UK and Spain (SalesQL), Estonia (LeadsForge)</td></tr>
          <tr><td>Evomi</td><td>Proxy network for LinkedIn automation</td><td>Switzerland</td></tr>
          <tr><td>RapidAPI (JSearch)</td><td>Job listings</td><td>US</td></tr>
          <tr><td>ip-api, IPinfo</td><td>Approximate location from IP address</td><td>Romania (ip-api), US (IPinfo)</td></tr>
        </tbody>
      </table></div>
      <p>We update this list when we change providers.</p>
      <h2 id="ads">12. Advertising</h2>
      <p>We use the Meta Pixel and Meta Conversions API to measure our ads and show them to people who have visited Studojo.</p>
      <ul>
        <li><b>Events we send to Meta:</b> page views, content views, sign-ups, lead forms, resume uploads, starting checkout, adding payment details, and purchases (with amount and currency).</li>
        <li><b>Identifiers sent with them:</b> a scrambled (SHA-256 hashed) copy of your email address, a hashed account ID, your IP address, your browser details, and the _fbp and _fbc cookies.</li>
        <li><b>Never sent:</b> your resume, your outreach, your contacts or your Gmail data.</li>
      </ul>
      <p>You can opt out by blocking cookies in your browser (section 13) or in your Meta ad preferences.</p>
      <h2 id="cookies">13. Cookies and similar technology</h2>
      <div className="legal-tbl"><table>
        <thead><tr><th>Name</th><th>Provider</th><th>Purpose</th><th>Lasts</th></tr></thead>
        <tbody>
          <tr><td>better-auth.* (session, session data)</td><td>Studojo</td><td>Keeps you signed in (essential)</td><td>60 days, renewed as you use the site</td></tr>
          <tr><td>ph_* (cookie and local storage)</td><td>PostHog</td><td>Analytics and session recording</td><td>1 year</td></tr>
          <tr><td>mp_* (local storage)</td><td>Mixpanel</td><td>Analytics and session recording</td><td>Until cleared</td></tr>
          <tr><td>_fbp, _fbc</td><td>Meta</td><td>Advertising</td><td>90 days</td></tr>
          <tr><td>studojo_attribution (local storage)</td><td>Studojo</td><td>Remembers which ad or link brought you here</td><td>Until cleared</td></tr>
          <tr><td>jrs:resume:v1 (local storage)</td><td>Studojo</td><td>Saves your resume draft in your browser</td><td>Until cleared</td></tr>
          <tr><td>sj_anon_id, sj_consent_pending (local storage)</td><td>Studojo</td><td>Anonymous visitor ID; remembers your acceptance of our terms during sign-up</td><td>Until cleared</td></tr>
        </tbody>
      </table></div>
      <p>We show a cookie notice on your first visit. Essential cookies keep you signed in and cannot be turned off. You can block analytics and advertising cookies in your browser settings or with a tracker blocker, and you can opt out of Meta ads in your Meta ad preferences. Studojo keeps working when you do.</p>
      <p>Session recordings capture your clicks and page movements. Text you type into forms is hidden.</p>
      <h2 id="emails">14. Emails we send you</h2>
      <p>We send two kinds of email:</p>
      <ul>
        <li><b>Service emails</b> you can&apos;t opt out of while your account is open: receipts, campaign updates, reconnect requests and security notices.</li>
        <li><b>Marketing emails:</b> tips, reminders and offers. Each one has an unsubscribe link.</li>
      </ul>
      <p>Our emails record whether they were opened and which links were clicked, through links on email.studojo.com.</p>
      <h2 id="retention">15. How long we keep it</h2>
      <div className="legal-tbl"><table>
        <thead><tr><th>Data</th><th>Kept for</th></tr></thead>
        <tbody>
          <tr><td>Account, profile, resume, insights, Gmail and LinkedIn access, campaigns and outreach records</td><td>While your account is open. Deleted when you delete your account (below).</td></tr>
          <tr><td>Payment, refund and credit records</td><td>8 years from the transaction, for tax and accounting law. Kept after account deletion, linked to a closed-account marker.</td></tr>
          <tr><td>Records of emails and messages sent for a deleted account (recipient, date, status; no content)</td><td>3 years after deletion, so we can handle complaints and refund claims</td></tr>
          <tr><td>Support emails and chatbot conversations</td><td>12 months</td></tr>
          <tr><td>Analytics and session recordings</td><td>As set by PostHog and Mixpanel, up to 12 months</td></tr>
          <tr><td>Contact data about people we reach out to</td><td>Until they opt out or ask for deletion, or until the provider&apos;s data is refreshed. The enrichment cache is kept for 30 days.</td></tr>
          <tr><td>Opt-out list</td><td>Permanently, as hashed addresses</td></tr>
        </tbody>
      </table></div>
      <p><b>Deleting your account.</b> Go to Settings, then Delete account. This deletes the following immediately:</p>
      <ul>
        <li>your account, profile and resume files;</li>
        <li>your campaigns and the content of your outreach;</li>
        <li>your Gmail and LinkedIn access, which we also revoke;</li>
        <li>your chatbot history.</li>
      </ul>
      <p>Backups are overwritten within 7 days. We also ask our analytics providers to delete your data.</p>
      <h2 id="security">16. Security</h2>
      <ul>
        <li>All connections use HTTPS/TLS.</li>
        <li>Our database and storage are encrypted at rest by Microsoft Azure. LinkedIn credentials are additionally encrypted by our application.</li>
        <li>Staff access is limited to people who need it. Support staff may sign in as you to fix a problem, and every such session is logged.</li>
        <li>No system is perfectly secure. If a breach affects your personal data, we will notify you and the Data Protection Board of India as the law requires, and the relevant GDPR authority where that law applies.</li>
      </ul>
      <h2 id="rights">17. Your rights</h2>
      <p>You can:</p>
      <ul>
        <li>see a summary of the personal data we hold about you and how we use it, and who we have shared it with;</li>
        <li>correct, complete or update it;</li>
        <li>delete it (the Delete account option in Settings does this immediately);</li>
        <li>withdraw consent, including for Gmail and LinkedIn access, cookies and marketing emails;</li>
        <li>nominate someone to exercise your rights if you die or become unable to;</li>
        <li>in the EU and UK, also object to processing, restrict it, and receive your data in a portable format.</li>
      </ul>
      <p>Email admin@studojo.com from your account address. We respond within 30 days.</p>
      <p>If you are not satisfied, contact our grievance officer (section 19). After that, you can complain to the Data Protection Board of India, or to your local data protection authority in the EU or UK.</p>
      <h2 id="children">18. Children</h2>
      <p>Studojo is only for people aged 18 and over. We do not knowingly collect data from anyone under 18. If we learn that we have, we delete the account and its data. If you think a child is using Studojo, email admin@studojo.com.</p>
      <h2 id="grievance">19. Grievance officer and contact</h2>
      <ul>
        <li>Grievance officer: {fill(LEGAL_ENTITY.grievanceOfficer)}</li>
        <li>Email: admin@studojo.com, with &quot;PRIVACY&quot; at the start of the subject line</li>
        <li>Phone: {fill(LEGAL_ENTITY.phone)}</li>
        <li>Post: Studojo Labs Private Limited, {fill(LEGAL_ENTITY.registeredOffice)}, Bengaluru, Karnataka, India</li>
      </ul>
      <p>We acknowledge privacy complaints within 48 hours and resolve them within 30 days.</p>
      <h2 id="changes">20. Changes to this policy</h2>
      <p>We will email you at least 7 days before a material change takes effect, and show a notice when you next sign in. Each version is dated. Earlier versions are available on request.</p>
    </LegalPage>
  );
}
