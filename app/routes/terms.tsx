import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/terms";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of Service – Studojo" },
    {
      name: "description",
      content: "Terms of Service for Studojo – please read carefully before using our platform.",
    },
  ];
}

export default function Terms() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-900 bg-purple-50 py-16 md:py-24">
          <Section width="narrow" className="text-center">
            <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-neutral-900 md:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 font-['Satoshi'] text-lg font-normal leading-7 text-neutral-700 md:text-xl">
              Last updated: March 2026. Please read carefully before using our platform.
            </p>
          </Section>
        </section>

        <Section width="narrow" className="py-12 md:py-16">
          <div className="space-y-8">

            {/* 1. Company Details */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                1. Company Details
              </h2>
              <div className="space-y-3">
                {[
                  ["Full Legal Name", "Synovate People Solutions Private Limited"],
                  ["Trading Name", "Studojo"],
                  ["Registered Address", "305, 2nd Floor, Glory Fields Apartment, Off Central Jail Road, Bengaluru, Karnataka – 560035"],
                  ["Business Structure", "Private Limited Company"],
                  ["Jurisdiction", "India (Karnataka)"],
                  ["Contact", "admin@studojo.com"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                    <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                      <span className="font-semibold text-neutral-900">{label}:</span> {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Acceptance */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                2. Acceptance of Terms
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    By accessing or using any part of the Studojo platform (studojo.com), you confirm that you have read, understood, and agree to be bound by these Terms of Service in full. If you do not agree, you must not use the platform.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    You must be at least <span className="font-semibold text-neutral-900">18 years old</span> to use paid features, including the Internship Dojo outreach service. Users aged 13 to 17 may access free tools only, with parental or guardian consent. Users under 13 may not use the platform.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We reserve the right to update these Terms at any time. Continued use of the platform after any update constitutes your acceptance of the revised Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Services */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                3. Description of Services
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo provides a suite of career and education tools for students, including resume building, internship discovery, AI-assisted academic support, and an outreach automation service ("Internship Dojo Outreach").
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Internship Dojo Outreach</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    This service helps users identify potential hiring contacts at companies of interest and sends introductory emails on behalf of the user via the user's own connected Gmail account. Studojo acts solely as a technology facilitator. All emails are sent from the user's own email address. The user is the sender of record for all outreach communications at all times.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo does not guarantee any specific outcome from the use of any service, including but not limited to job placement, interview invitations, email replies, or career advancement.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. User Responsibilities for Outreach */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                4. Your Responsibilities for Outreach
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    When you use the outreach service, you are the sender of all emails transmitted. You take full and sole responsibility for all outreach communications sent from your account, regardless of whether the content was generated or suggested by Studojo's AI tools.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    You are solely responsible for ensuring your use of the service complies with all applicable laws, including but not limited to:
                  </p>
                  <ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    <li>The CAN-SPAM Act (United States)</li>
                    <li>The General Data Protection Regulation (GDPR) (EU and UK)</li>
                    <li>The Information Technology Act, 2000 and related rules (India)</li>
                    <li>Canada's Anti-Spam Legislation (CASL)</li>
                    <li>Any anti-spam, data protection, or privacy law applicable in each recipient's jurisdiction</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo is not liable for any complaint, claim, penalty, or legal action arising from emails sent through your account. Any claim brought against Studojo arising from your outreach will be redirected to you as the responsible party. You agree to indemnify and hold Studojo harmless from all such claims, costs, and damages.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Lead and Contact Data */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                5. Lead and Contact Data
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo sources contact information (including names, job titles, company names, and email addresses) from third-party databases and publicly available sources. This data is aggregated from sources including but not limited to Apollo.io and other professional data providers. Studojo does not originate or verify this data.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo makes no representation or warranty as to the accuracy, completeness, or currency of any contact data provided. Contact details may be outdated, incorrect, or may belong to individuals who have changed roles or left the organisation in question.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    You use contact data entirely at your own risk. Studojo accepts no liability for any consequence arising from the use of inaccurate, incomplete, or stale contact information, including delivery failures, spam complaints, legal notices, or reputational harm to you or any third party.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Contact data is provided solely for the purpose of individual professional career outreach by the registered user. You must not sell, redistribute, export, or use this data for any purpose beyond your own individual job or internship search.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Gmail and Email Sending */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                6. Gmail Access and Email Sending
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    To use the outreach feature, you must connect your Gmail account via Google OAuth. By doing so, you grant Studojo permission to send emails on your behalf from your Gmail account. You can revoke this access at any time from your Google account settings.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    You are solely responsible for all emails sent from your connected Gmail account, whether sent manually or via Studojo. Studojo does not review the recipient list or email content prior to sending. You bear full responsibility for ensuring recipients have not opted out and that sending is lawful in each recipient's jurisdiction.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo is not responsible for any suspension, restriction, or termination of your Gmail account by Google resulting from use of our outreach service. Compliance with Google's Terms of Service and Gmail usage policies is your sole responsibility.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Prohibited Activities */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                7. Prohibited Activities
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                <p className="mb-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You must not use the platform to:</p>
                <ul className="list-disc space-y-2 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  <li>Send bulk unsolicited emails or spam</li>
                  <li>Misrepresent your identity, credentials, or intentions in outreach emails</li>
                  <li>Resell, scrape, or extract lead or contact data from the platform</li>
                  <li>Use contact data for any purpose other than your own individual career outreach</li>
                  <li>Attempt to circumvent rate limits, access controls, or security measures</li>
                  <li>Harass, intimidate, or threaten any individual</li>
                  <li>Generate or send content that is illegal, defamatory, discriminatory, or harmful</li>
                  <li>Share your account credentials with any other person</li>
                  <li>Violate any applicable law or regulation</li>
                </ul>
              </div>
            </div>

            {/* 8. Credits and Payments */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                8. Credits, Payments, and Billing
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Paid services are purchased using credits. Credits are non-transferable, have no cash value, and cannot be exchanged for money. Credits expire as specified at time of purchase.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    All payments are processed by Razorpay. Studojo does not store your payment card details. By making a purchase, you agree to Razorpay's terms and conditions in addition to these Terms.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Credits used to initiate lead generation, enrichment, or email campaigns are consumed upon initiation of that process and are non-refundable. Please refer to our Refund Policy for full details.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Disclaimer */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                9. Disclaimer of Warranties
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    The Studojo platform and all services are provided "as is" and "as available" without any warranty of any kind, express or implied. Studojo expressly disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo does not warrant that the platform will be uninterrupted or error-free, that contact data will be accurate or complete, or that use of the outreach service will result in any particular career outcome. Any results referenced on the platform are illustrative only and not a guarantee of similar results for any user.
                  </p>
                </div>
              </div>
            </div>

            {/* 10. Limitation of Liability */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                10. Limitation of Liability
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    To the maximum extent permitted by applicable law, Studojo (Synovate People Solutions Private Limited), its directors, employees, agents, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the platform or any of its services.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Studojo shall not be liable for:</p>
                  <ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    <li>Any loss or damage resulting from outreach emails sent through the platform</li>
                    <li>Any complaint or legal claim from a recipient of your outreach</li>
                    <li>Inaccuracies in contact or lead data sourced from third parties</li>
                    <li>Failure to secure a job, internship, interview, or any career outcome</li>
                    <li>Any action by Google or any third-party service in response to your use of their platform in connection with Studojo</li>
                    <li>Any loss of data, revenue, or business opportunity</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    In no event shall Studojo's total liability to you for all claims exceed the total amount paid by you to Studojo in the twelve (12) months preceding the event giving rise to the claim.
                  </p>
                </div>
              </div>
            </div>

            {/* 11. Indemnification */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                11. Indemnification
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  You agree to indemnify, defend, and hold harmless Studojo, its parent company, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of the platform; (b) any outreach emails sent through your connected Gmail account; (c) your violation of these Terms; (d) your violation of any applicable law or regulation; or (e) any claim by a third party that your outreach communications caused them harm.
                </p>
              </div>
            </div>

            {/* 12. IP */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                12. Intellectual Property
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    All platform content, software, designs, and trademarks are owned by Synovate People Solutions Private Limited or its licensors and are protected by applicable intellectual property laws.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Content generated using Studojo's AI tools (such as resumes, email drafts, or study notes) is owned by you. By generating content, you grant Studojo a non-exclusive, royalty-free licence to use anonymised versions for service improvement purposes only.
                  </p>
                </div>
              </div>
            </div>

            {/* 13. Termination */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                13. Account Termination
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or used the platform in a manner harmful to others or to Studojo.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Upon termination, your right to use the platform ceases immediately. Unused credits forfeited due to a Terms violation are non-refundable.
                  </p>
                </div>
              </div>
            </div>

            {/* 14. Governing Law */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                14. Governing Law and Disputes
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    These Terms are governed by the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Before initiating any formal legal proceeding, you agree to first contact us at admin@studojo.com to attempt to resolve the dispute informally within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-violet-500 p-6 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h3 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">
                Questions about these Terms?
              </h3>
              <p className="mb-4 font-['Satoshi'] text-base leading-7 text-white">
                Reach out to us at any time.
              </p>
              <a
                href="mailto:admin@studojo.com"
                className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-6 font-['Satoshi'] text-base font-medium text-violet-600 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                admin@studojo.com
              </a>
            </div>

          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
