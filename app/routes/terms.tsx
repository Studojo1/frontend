// The Terms of Service text is generated from the approved draft
// (Studojo/legal-rewrite/terms.html) with legal-rewrite/tools/build_pages.py.
// The layout matches the page this replaced; only the words changed. Edit the
// draft and regenerate rather than hand-editing this markup.
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import { EFFECTIVE_DATE, LEGAL_ENTITY, PENDING, POLICY_VERSIONS, fill } from "~/lib/legal";
import type { Route } from "./+types/terms";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms of Service | Studojo" },
    { name: "description", content: "Terms of Service for Studojo | please read carefully before using our platform." },
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
              Version {POLICY_VERSIONS.terms}. Effective {fill(EFFECTIVE_DATE)}. Please read carefully before using our platform.
            </p>
          </Section>
        </section>

        <Section width="narrow" className="py-12 md:py-16">
          <div className="space-y-8">
            {/* 1. About these terms */}
            <div id="about" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">1. About these terms</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">These terms are an agreement between you and Studojo Labs Private Limited (&quot;Studojo&quot;, &quot;we&quot;, &quot;us&quot;). They apply when you use any Studojo service:</p><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>our websites (studojo.com, app.studojo.com and studojo.pro);</li><li>our browser extensions (Studojo Job Assistant, Studojo Outreach and the Studojo LinkedIn Connector);</li><li>our emails;</li><li>anything you buy from us.</li></ul></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Our <a href="/privacy" className="font-semibold underline">Privacy Policy</a> and <a href="/refund-policy" className="font-semibold underline">Refund Policy</a> form part of these terms. If they conflict, the Refund Policy wins on refunds, the Privacy Policy wins on personal data, and these terms win on everything else.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><div className="overflow-x-auto"><table className="w-full font-['Satoshi'] text-sm leading-6 text-neutral-700"><tbody><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">Legal name</th><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Studojo Labs Private Limited</td></tr><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">CIN</th><td className="border-b border-gray-200 px-2 py-2 text-left align-top">{fill(LEGAL_ENTITY.cin)}</td></tr><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">GSTIN</th><td className="border-b border-gray-200 px-2 py-2 text-left align-top">{fill(LEGAL_ENTITY.gstin)}</td></tr><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">Registered office</th><td className="border-b border-gray-200 px-2 py-2 text-left align-top">{fill(LEGAL_ENTITY.registeredOffice)}, Bengaluru, Karnataka, India</td></tr><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">Email</th><td className="border-b border-gray-200 px-2 py-2 text-left align-top">admin@studojo.com</td></tr><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">Phone</th><td className="border-b border-gray-200 px-2 py-2 text-left align-top">{fill(LEGAL_ENTITY.phone)}</td></tr></tbody></table></div></div>
            </div>
            </div>
            
            {/* 2. Who can use Studojo */}
            <div id="eligibility" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">2. Who can use Studojo</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You must be <span className="font-semibold text-neutral-900">18 or older</span> to create an account or buy anything. If you are under 18, you may not use Studojo.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">By creating an account you confirm that you are 18 or older, that you can enter a binding contract, and that the information you give us is accurate. If we learn that an account belongs to someone under 18, we close it and delete its data.</p></div>
            </div>
            </div>
            
            {/* 3. Your account */}
            <div id="account" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">3. Your account</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>Keep your login details secret. You are responsible for everything done through your account.</li><li>You may hold one personal account. Do not share it or sell it.</li><li>Tell us straight away at admin@studojo.com if you think someone else has accessed it.</li><li>Our support staff may view your account, or sign in as you, to help you or to investigate a problem. Each time they do, it is logged.</li></ul></div>
            </div>
            
            {/* 4. Our services */}
            <div id="services" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">4. Our services</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li><span className="font-semibold text-neutral-900">Careers Dojo resume builder</span> (free): build, import, tailor and check resumes.</li><li><span className="font-semibold text-neutral-900">Internship Dojo</span> (free): browse internship and job listings.</li><li><span className="font-semibold text-neutral-900">Outreach Dojo</span> (paid): finds hiring contacts and sends personalised emails from your Gmail account. See section 5.</li><li><span className="font-semibold text-neutral-900">LinkedIn automation</span> (paid plans): sends connection invitations and messages from your LinkedIn account. See section 7.</li><li><span className="font-semibold text-neutral-900">AutoApply</span> (subscription): applies to jobs for you. See section 8.</li><li><span className="font-semibold text-neutral-900">Assignment Dojo</span> (paid per document) and <span className="font-semibold text-neutral-900">Humanizer</span> (paid per 100 words): AI writing tools. See section 12.</li><li><span className="font-semibold text-neutral-900">Career Coach</span>, quizzes and readiness scores (free): guidance generated from your profile.</li><li><span className="font-semibold text-neutral-900">Webinars</span> (paid seats): live sessions.</li><li><span className="font-semibold text-neutral-900">Browser extensions:</span> tools that work on job sites and LinkedIn.</li></ul></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Studojo Partners, the Contact Enrichment API and the Sensei MCP are business products. They are governed by our Partner Terms {fill(PENDING.partnerTermsUrl)}, as well as these terms.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We may change, add or remove features. If we remove a paid feature you have already bought and not received, the Refund Policy applies.</p></div>
            </div>
            </div>
            
            {/* 5. How Outreach Dojo works */}
            <div id="outreach" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">5. How Outreach Dojo works</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">When you launch a campaign, you authorise Studojo to do the following on your behalf:</p><ol className="list-decimal space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>Search third-party data providers for people who match the roles, companies, industries and locations you choose.</li><li>Write an email to each of them with AI, based on your resume, profile and settings.</li><li>Send those emails from your connected Gmail account, in your name. A campaign sends about 20 emails a day, between 9am and 5pm in your time zone, 7 days a week.</li><li>Send automatic follow-ups to people who have not replied.</li><li>Read replies in your campaign threads and bounce notices, so we can show them to you and stop follow-ups.</li><li>Track whether each email was opened, using a small image in the email.</li></ol></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Emails are written and sent automatically. You can see a sample before launch, and you can pause or cancel a campaign at any time. We do not show you each email for approval before it is sent.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Credits are reserved when you launch a campaign. A credit is used when Gmail accepts an email for sending. Unused credits return to your balance automatically, as the Refund Policy describes. Follow-ups and replacements for bounced emails are free.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We do not promise that anyone will reply, or that you will get an interview, internship or job.</p></div>
            </div>
            </div>
            
            {/* 6. Responsibility for outreach */}
            <div id="responsibility" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">6. Responsibility for outreach</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><span className="font-semibold text-neutral-900">You are responsible for:</span></p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>the accuracy of your resume, profile and anything you tell us about yourself;</li><li>your choice of targeting;</li><li>any email text you write or edit;</li><li>stopping contact with anyone who asks you to stop;</li><li>using outreach only for your own genuine job or internship search.</li></ul></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><span className="font-semibold text-neutral-900">We are responsible for</span> running the system as described in section 5. That includes no longer contacting addresses that bounce, or whose owners ask us to remove them.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Because emails go out from your account and in your name, recipients and email providers will treat you as the sender. Complaints, spam reports and any action Google takes against your account follow from that, and we cannot control them.</p></div>
            </div>
            </div>
            
            {/* 7. LinkedIn automation */}
            <div id="linkedin" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">7. LinkedIn automation</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">To use LinkedIn features, you connect your LinkedIn account. You can do this with the LinkedIn Connector extension, which sends your LinkedIn session cookies to our servers. You can also give us your LinkedIn email and password, which we encrypt and use to sign in for you.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You authorise us to use your LinkedIn account to send the invitations and messages your plan includes, and to read the replies to them. We route this activity through proxy servers located near you.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><span className="font-semibold text-neutral-900">Risk you accept:</span> LinkedIn&apos;s User Agreement restricts automated activity. LinkedIn may warn you, limit your account, ask you to verify your identity, or suspend your account. We are not responsible for any action LinkedIn takes, and none of these is grounds for a refund.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You can disconnect LinkedIn at any time. Changing your LinkedIn password also ends our access.</p></div>
            </div>
            </div>
            
            {/* 8. AutoApply */}
            <div id="autoapply" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">8. AutoApply</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You authorise us to apply to jobs in your name. That includes submitting your resume and answering screening questions with answers generated by AI from your profile. Employers receive these applications as coming from you.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Check your profile, because every answer is based on it. We do not guarantee that an application will be received, read or successful.</p></div>
            </div>
            </div>
            
            {/* 9. Gmail and Google */}
            <div id="gmail" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">9. Gmail and Google</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Outreach needs your Gmail account connected through Google, with permission to send email (gmail.send) and read email (gmail.readonly). We use read access only to find replies and bounce notices for your campaigns. Section 6 of the Privacy Policy describes exactly what we read.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You can revoke access at any time at myaccount.google.com/permissions. Your campaigns pause until you reconnect.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You must follow Google&apos;s terms and Gmail&apos;s sending limits. We are not responsible if Google limits or suspends your account.</p></div>
            </div>
            </div>
            
            {/* 10. Contact data */}
            <div id="contacts" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">10. Contact data</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">The contact details we find come from third-party data providers. They may be out of date or wrong, and we do not guarantee them.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We give you access to contact data only for your own outreach through Studojo. You must not:</p><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>copy it out of Studojo;</li><li>sell it, share it or build a list from it;</li><li>use it for anything other than your own job or internship search.</li></ul></div>
            </div>
            </div>
            
            {/* 11. AI-generated content */}
            <div id="ai" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">11. AI-generated content</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Much of Studojo uses AI: resumes, emails, answers, documents, rewrites and coaching. AI output can be wrong, incomplete or unsuitable. Check anything you rely on or submit under your name. Guidance, readiness scores and quiz results are suggestions, not professional career advice.</p></div>
            </div>
            
            {/* 12. Assignment Dojo and Humanizer */}
            <div id="academic" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">12. Assignment Dojo and Humanizer</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">These are study aids. Generation starts as soon as you pay.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>You must follow the academic integrity rules of your college or university. It is your decision whether and how you use what we produce.</li><li>We do not promise any mark, grade or score from a plagiarism or AI-detection tool.</li><li>We are not responsible for any penalty from your institution.</li></ul></div>
            </div>
            </div>
            
            {/* 13. Acceptable use */}
            <div id="use" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">13. Acceptable use</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You must not:</p><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>send spam or harassing, threatening, defamatory, discriminatory or unlawful content;</li><li>misrepresent who you are, or your qualifications or intentions;</li><li>contact people for anything other than your own genuine job or internship search;</li><li>scrape, copy, resell or extract data from Studojo;</li><li>get around limits, access controls or security measures, or probe, overload or disrupt our systems;</li><li>use Studojo to break any law, or anyone else&apos;s rights or platform terms;</li><li>create multiple accounts to abuse coupons, free features or refunds.</li></ul></div>
            </div>
            
            {/* 14. Prices, payments and credits */}
            <div id="payments" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">14. Prices, payments and credits</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li><span className="font-semibold text-neutral-900">Prices.</span> The price shown at checkout is the price you pay, including applicable taxes. Prices for future purchases may change.</li><li><span className="font-semibold text-neutral-900">Currency and providers.</span> We set the currency and payment provider from the location we detect at checkout: rupees through Razorpay in India, and US dollars through Dodo Payments elsewhere. Some products are sold in rupees only. We never see or store your card or UPI details.</li><li><span className="font-semibold text-neutral-900">Credits</span> have no cash value, cannot be transferred and <span className="font-semibold text-neutral-900">do not expire</span>.</li><li><span className="font-semibold text-neutral-900">LinkedIn plans</span> run for a fixed period (7 or 30 days) from launch. Unused time does not carry over.</li><li><span className="font-semibold text-neutral-900">Subscriptions</span> renew automatically at the end of each period until you cancel. You can cancel from your account at any time, and access continues until the end of the paid period.</li><li><span className="font-semibold text-neutral-900">Coupons</span> are single-use unless stated, can&apos;t be combined, and have no cash value. We may cancel coupons that are misused, and orders placed with them.</li></ul></div>
            </div>
            
            {/* 15. Refunds */}
            <div id="refunds" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">15. Refunds</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">All sales are final except as set out in the <a href="/refund-policy" className="font-semibold underline">Refund Policy</a>.</p></div>
            </div>
            
            {/* 16. Your content and our property */}
            <div id="ip" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">16. Your content and our property</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><span className="font-semibold text-neutral-900">Yours.</span> You own your resume, your profile, and the content Studojo generates for you. You give us permission to store, process and use that content only to run Studojo for you. That permission ends when you delete it or your account, except where we must keep records by law. We do not use your content to train AI models.</p></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><span className="font-semibold text-neutral-900">Ours.</span> Studojo&apos;s software, design, text, brand and data compilations belong to Studojo Labs Private Limited or its licensors. You may use them only through the service.</p></div>
            </div>
            </div>
            
            {/* 17. Third-party services */}
            <div id="third" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">17. Third-party services</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Studojo depends on other companies&apos; services, including Google, LinkedIn, Microsoft Azure, OpenAI, data providers and payment providers. Their terms apply to your use of them. We are not responsible for their availability or their actions.</p></div>
            </div>
            
            {/* 18. Suspension, termination and deletion */}
            <div id="termination" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">18. Suspension, termination and deletion</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>We may suspend or close your account, with or without notice, if we reasonably believe you have broken these terms, created risk or legal exposure for us or others, or misused the service. We tell you the reason unless the law or safety prevents it.</li><li>If we close your account for breaking these terms, your remaining credits, plan time and subscription period are forfeited.</li><li>You can delete your account at any time from Settings. Deleting it disconnects Gmail and LinkedIn and deletes your data as the Privacy Policy describes. Any unused credits and plan time are forfeited.</li><li>Sections 6, 10, 16 and 19 to 25 continue to apply after your account ends.</li></ul></div>
            </div>
            
            {/* 19. Disclaimer */}
            <div id="warranty" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">19. Disclaimer</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Apart from the promises in these terms and the Refund Policy, Studojo is provided &quot;as is&quot; and &quot;as available&quot;. To the extent the law allows, we disclaim all other warranties, including fitness for a particular purpose. We do not promise uninterrupted service, accurate contact data or any career outcome.</p></div>
            </div>
            
            {/* 20. Limitation of liability */}
            <div id="liability" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">20. Limitation of liability</h2>
            <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">To the extent the law allows:</p><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>we are not liable for indirect or consequential loss, including lost opportunities, lost income or reputational harm;</li><li>we are not liable for action taken against your account by Google, LinkedIn or anyone else;</li><li>our total liability to you for all claims is limited to the amount you paid us in the 12 months before the event that caused the claim.</li></ul></div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">None of this limits liability for fraud, or for anything the law does not allow us to limit.</p></div>
            </div>
            </div>
            
            {/* 21. Indemnity */}
            <div id="indemnity" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">21. Indemnity</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="mb-2 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You agree to compensate Studojo for claims, losses and reasonable legal costs caused by:</p><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>your breach of these terms;</li><li>email text you wrote or edited;</li><li>false information you gave us;</li><li>your use of Studojo to break a law or anyone else&apos;s rights.</li></ul></div>
            </div>
            
            {/* 22. Changes to these terms */}
            <div id="changes" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">22. Changes to these terms</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We will email you at least 7 days before a material change takes effect, and show a notice when you next sign in. If you keep using Studojo after that date, you accept the new terms. If you do not accept them, you may delete your account. Changes do not apply to purchases made before they take effect.</p></div>
            </div>
            
            {/* 23. Governing law and disputes */}
            <div id="law" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">23. Governing law and disputes</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">These terms are governed by the laws of India. Please contact us first at admin@studojo.com so we can try to resolve a problem. Subject to that, the courts at Bengaluru, Karnataka have jurisdiction. If you are a consumer, you may also bring a complaint wherever the Consumer Protection Act 2019 allows. Nothing in these terms removes your rights as a consumer.</p></div>
            </div>
            
            {/* 24. Grievance officer */}
            <div id="grievance" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">24. Grievance officer</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Complaints about the service or about content on it go to our grievance officer, {fill(LEGAL_ENTITY.grievanceOfficer)}, at admin@studojo.com with &quot;GRIEVANCE&quot; at the start of the subject line, or by post to our registered office. We acknowledge within 24 hours and resolve within 15 days. Consumer complaints are resolved within one month.</p></div>
            </div>
            
            {/* 25. General */}
            <div id="general" className="scroll-mt-24 rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h2 className="mb-6 font-['Clash_Display'] text-2xl font-medium text-neutral-900 md:text-3xl">25. General</h2>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-4 md:p-5"><ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>If any part of these terms is unenforceable, the rest still applies.</li><li>These terms, the Privacy Policy and the Refund Policy are the whole agreement between us about Studojo.</li><li>We may transfer these terms to a company that takes over Studojo. You may not transfer them.</li><li>We are not liable for delays or failures caused by events beyond our reasonable control. These include outages at Google, LinkedIn, Microsoft Azure or payment providers.</li><li>We send notices to the email on your account. You send notices to admin@studojo.com.</li><li>If we do not enforce a right straight away, we have not given it up.</li></ul></div>
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
