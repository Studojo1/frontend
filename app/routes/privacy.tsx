import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/privacy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy – Studojo" },
    {
      name: "description",
      content: "How Studojo collects, uses, and protects your personal data.",
    },
  ];
}

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-900 bg-purple-50 py-16 md:py-24">
          <Section width="narrow" className="text-center">
            <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-neutral-900 md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 font-['Satoshi'] text-lg font-normal leading-7 text-neutral-700 md:text-xl">
              Last updated: March 2026. How we collect, use, and protect your personal data.
            </p>
          </Section>
        </section>

        <Section width="narrow" className="py-12 md:py-16">
          <div className="space-y-8">

            {/* 1. Who We Are */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                1. Who We Are
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  Studojo is operated by Synovate People Solutions Private Limited, registered in Bengaluru, Karnataka, India. We are the data controller for personal data collected through the studojo.com platform. If you have any privacy-related questions, contact us at admin@studojo.com.
                </p>
              </div>
            </div>

            {/* 2. What We Collect */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                2. Data We Collect
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Account and Profile Data</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Name, email address, phone number, institution, year of study, course, and any other information you provide when creating or updating your account.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Resume and Career Data</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Resume content, work experience, education history, skills, and career preferences that you submit to generate documents or power the outreach service.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Gmail OAuth Data</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    When you connect your Gmail account for outreach, we store an access token that allows us to send emails on your behalf. We do not read, store, or process the contents of your inbox or any emails other than those sent through our platform.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Payment Data</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Payment transactions are processed by Razorpay. We store only a record of your payment status, amount, and credits granted. We do not store your card details.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Usage Data</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Information about how you use the platform, including pages visited, features used, orders created, and actions taken. This is used to improve the product and diagnose issues.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Technical Data</p>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    IP address, browser type, device type, operating system, and session identifiers necessary for platform security and authentication.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. How We Use Your Data */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                3. How We Use Your Data
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                <ul className="list-disc space-y-2 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  <li>To provide, operate, and improve the Studojo platform and its services</li>
                  <li>To generate resumes, email drafts, and other career documents on your behalf</li>
                  <li>To identify relevant hiring contacts and execute outreach campaigns via your connected Gmail</li>
                  <li>To process payments and manage your credit balance</li>
                  <li>To send you transactional communications about your account and orders</li>
                  <li>To detect, prevent, and respond to fraud, abuse, or security incidents</li>
                  <li>To comply with applicable legal obligations</li>
                  <li>To improve and train our AI models using anonymised data only</li>
                </ul>
              </div>
            </div>

            {/* 4. Third-Party Data Sources */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                4. Third-Party Contact Data
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    The outreach service surfaces contact information about third parties (hiring managers, founders, and recruiters) sourced from third-party professional databases including Apollo.io. This data relates to individuals in their professional capacity and is sourced from publicly available information.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Studojo does not collect this data directly. We rely on third-party providers to ensure that the collection and use of this data complies with applicable data protection laws. However, we make no guarantee of accuracy and accept no liability for how this data is used by our users. Responsibility for lawful use of this contact data lies solely with the user.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    If you are a third party whose information appears in our system and you wish to have it removed, please contact us at admin@studojo.com. We will process removal requests within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Data Sharing */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                5. Data Sharing and Third Parties
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We do not sell your personal data to any third party. We do not share your personal data with advertisers.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We work with a limited number of trusted service providers who process data on our behalf:</p>
                  <ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    <li><span className="font-semibold text-neutral-900">Microsoft Azure</span> - cloud hosting and AI services (resume parsing)</li>
                    <li><span className="font-semibold text-neutral-900">Apollo.io</span> - professional contact data for outreach</li>
                    <li><span className="font-semibold text-neutral-900">Razorpay</span> - payment processing</li>
                    <li><span className="font-semibold text-neutral-900">Google</span> - Gmail OAuth for email sending</li>
                    <li><span className="font-semibold text-neutral-900">Sentry</span> - error monitoring and diagnostics</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We may disclose your data if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of Studojo, our users, or others.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Data Storage and Security */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                6. Data Storage and Security
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Your data is stored on Microsoft Azure infrastructure. We use industry-standard security measures including encrypted connections (HTTPS/TLS), access controls, and authentication systems to protect your data.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    While we take reasonable steps to protect your data, no internet transmission or electronic storage system is completely secure. You use the platform at your own risk, and we cannot guarantee absolute security of your information.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting admin@studojo.com.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Cookies */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                7. Cookies
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    We use only essential cookies necessary to keep you authenticated and the platform functional. We do not use advertising cookies, tracking cookies, or third-party analytics cookies.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Session cookies are deleted when you close your browser. Persistent authentication cookies allow you to remain logged in across sessions and expire after a defined period.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Your Rights */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                8. Your Rights
              </h2>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Depending on your jurisdiction, you may have the right to:</p>
                  <ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    <li>Access the personal data we hold about you</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to or restrict processing of your data</li>
                    <li>Withdraw consent for Gmail access at any time via Google account settings</li>
                    <li>Lodge a complaint with your relevant data protection authority</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    To exercise any of these rights, contact us at admin@studojo.com. We will respond within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Children */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                9. Children's Privacy
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  The platform is not intended for users under the age of 13. We do not knowingly collect personal data from children under 13. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly. If you believe a child under 13 has registered on our platform, please contact us at admin@studojo.com.
                </p>
              </div>
            </div>

            {/* 10. Changes */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">
                10. Changes to This Policy
              </h2>
              <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5">
                <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform or by email. Continued use of the platform after an update constitutes your acceptance of the revised policy.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-violet-500 p-6 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h3 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">
                Privacy questions?
              </h3>
              <p className="mb-4 font-['Satoshi'] text-base leading-7 text-white">
                We take your privacy seriously. Contact us at any time.
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
