// The Refund Policy text is generated from the approved draft
// (Studojo/legal-rewrite/refund.html) with legal-rewrite/tools/build_pages.py.
// The layout matches the page this replaced; only the words changed. Edit the
// draft and regenerate rather than hand-editing this markup.
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import { EFFECTIVE_DATE, POLICY_VERSIONS, fill } from "~/lib/legal";
import type { Route } from "./+types/refund-policy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Refund Policy | Studojo" },
    { name: "description", content: "When Studojo refunds a purchase, and how to ask." },
  ];
}

export default function RefundPolicy() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-900 bg-purple-50 py-16 md:py-24">
          <Section width="narrow" className="text-center">
            <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-neutral-900 md:text-5xl">
              Refund Policy
            </h1>
            <p className="mt-4 font-['Satoshi'] text-lg font-normal leading-7 text-neutral-700 md:text-xl md:max-w-3xl md:mx-auto">
              Version {POLICY_VERSIONS.refund}. In effect from {fill(EFFECTIVE_DATE)}. All sales are final, except in the cases this policy lists.
            </p>
          </Section>
        </section>

        <Section width="wide" className="py-12 md:py-16">
          <div className="space-y-12">

            {/* Contents. It is a long document, so let people jump. */}
            <nav aria-label="Contents" className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h2 className="mb-4 font-['Clash_Display'] text-2xl font-medium text-neutral-900">
                Contents
              </h2>
              <ol className="list-none pl-0 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#summary" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">In short</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#scope" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">1. What this policy covers</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#final" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">2. All sales are final</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#eligible" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">3. The only cases that are refunded</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#instead" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">4. What we do instead of refunding</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#how" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">5. How to ask</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#paid" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">6. How refunds are paid</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#subs" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">7. Subscriptions</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#disputes" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">8. Chargebacks</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#misuse" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">9. Misuse</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#outside" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">10. Buyers in the EU and UK</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#law" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">11. Your rights under law</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#grievance" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">12. Grievance officer</a>
                </li>
                <li>
                  {/* block + py-3 keeps the tap target at 44px on phones */}
                  <a href="#changes" className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500">13. Changes and governing law</a>
                </li>
              </ol>
            </nav>

            <section id="summary" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">In short</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Studojo sells digital services that start the moment you pay. <span className="font-semibold text-neutral-900">All sales are final.</span> We refund money only in the cases listed in section 3:</p>
            <ul className="mt-3 list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>A payment error.</li><li>A service we never delivered.</li><li>A service that failed completely because of our systems and that we could not restore.</li></ul>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We do not refund unused credits, unused plan time, changes of mind or results. Nothing in this policy takes away a right you have under law (section 11).</p>
            </div>
            </section>
            
            <section id="scope" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">1. What this policy covers</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">This policy applies to every purchase made on studojo.com, app.studojo.com, studojo.pro and our browser extensions from Studojo Labs Private Limited (&quot;Studojo&quot;, &quot;we&quot;). These are the paid products it covers:</p>
            <div className="mt-3 overflow-x-auto"><table className="w-full font-['Satoshi'] text-sm leading-6 text-neutral-700"><thead><tr><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">Product</th><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">What you buy</th><th className="border-b border-gray-300 px-2 py-2 text-left align-top font-semibold text-neutral-900">Delivered when</th></tr></thead><tbody><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Outreach Dojo credits (email plans)</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Credits, each worth one first-touch outreach email sent from your connected Gmail account</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">The credits appear in your balance</td></tr><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">LinkedIn plans (weekly, monthly)</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Automated LinkedIn invitations and messages for a fixed period</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">The plan period starts</td></tr><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Combined email and LinkedIn plans</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Both of the above</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">The credits appear and the plan period starts</td></tr><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Assignment Dojo</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">One AI-generated document per order</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">The document is available to download</td></tr><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Humanizer</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Rewriting of text you submit, priced per 100 words</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">The rewritten text is shown to you</td></tr><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Webinars</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">A seat at a scheduled live session</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">The session takes place</td></tr><tr><td className="border-b border-gray-200 px-2 py-2 text-left align-top">AutoApply subscription</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Automated job applications, billed each period</td><td className="border-b border-gray-200 px-2 py-2 text-left align-top">Each billing period starts</td></tr></tbody></table></div>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">The Careers Dojo resume builder is free, so this policy has nothing to refund there. If you are charged for it, that is a payment error under section 3.1.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Business customers of Studojo Partners and the Contact Enrichment API are covered by their partner agreement, not this policy.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We take payments in Indian rupees through Razorpay and in US dollars through Dodo Payments. Which one you use depends on the location we detect when you check out. LinkedIn plans and webinars are sold through Razorpay only.</p>
            </div>
            </section>
            
            <section id="final" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">2. All sales are final</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Every product starts as soon as payment succeeds: credits are granted, plans begin and documents start generating. When you pay, you ask us to start straight away, and you accept that the purchase cannot be cancelled once it starts.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">So, apart from the cases in section 3, we do not refund:</p>
            <ul className="mt-3 list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>Credits you have not used, however long you hold them. Credits do not expire, so you can use them at any time.</li><li>Unused time on a LinkedIn plan or subscription period, including when you pause, cancel or stop using it.</li><li>A change of mind, a purchase made by mistake, or buying a larger pack than you needed.</li><li>Results. We do not promise replies, interviews, offers, connection acceptances or job applications that succeed.</li><li>Emails that bounced or went to contacts who did not reply. A bounced email is replaced with a new contact automatically and at no charge. That replacement is the remedy.</li><li>Outreach that stopped or slowed because of your account or choices, including:
                <ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base mt-1"><li>you disconnected Gmail or LinkedIn;</li><li>Google or LinkedIn limited, suspended or logged out your account;</li><li>you changed your password;</li><li>you paused or cancelled;</li><li>your targeting was too narrow to find contacts;</li><li>you deleted your account.</li></ul></li><li>How good you think a document or rewrite is, the grade you received, or the score from any plagiarism or AI-detection tool.</li><li>Penalties from your college, university or employer, or from Google or LinkedIn, arising from how you used the service.</li><li>Credits or plan time lost when we suspend or close your account for breaking our Terms of Service.</li><li>Coupon discounts, or orders paid entirely with a 100% coupon.</li><li>Fees your bank or card issuer charges, and differences caused by exchange rates.</li></ul>
            </div>
            </section>
            
            <section id="eligible" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">3. The only cases that are refunded</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We refund money in the following cases and no others, except where section 11 applies. Each case has conditions, and all of them must be met.</p>
            <h3 className="mt-6 mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">3.1 Payment errors</h3>
            <ul className="list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li><span className="font-semibold text-neutral-900">Failed payment.</span> Money left your account but the payment never completed, for example because the page closed, the connection dropped, or the payment was never confirmed to us. In this case Studojo never received your money and you did not receive any credits. The money is held between your bank and the payment provider, and the law requires it to be returned to you automatically. You do not need to do anything.
                <ul className="list-disc space-y-1 pl-5 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base mt-1"><li><span className="font-semibold text-neutral-900">UPI:</span> reversed by your bank by the next working day after the payment.</li><li><span className="font-semibold text-neutral-900">Debit and credit cards:</span> reversed within 5 days of the payment.</li><li><span className="font-semibold text-neutral-900">If your bank is late:</span> under the Reserve Bank of India&apos;s rules on failed transactions, your bank must pay you ₹100 for each day of delay beyond these limits. Claim this from your bank, not from Studojo.</li><li><span className="font-semibold text-neutral-900">If the money still hasn&apos;t come back after these limits,</span> email us your payment ID or the line from your bank statement. We will check our records and raise it with Razorpay for you.</li><li><span className="font-semibold text-neutral-900">If our records show the payment did reach Studojo but you did not get your credits,</span> that is not a failed payment. Section 3.2 applies: we either add the credits within 2 working days or refund the payment ourselves.</li><li><span className="font-semibold text-neutral-900">Card payments made abroad through Dodo Payments:</span> reversal times are set by your card issuer, usually within 5 to 10 working days. If it has not come back after that, email us and we will raise it with Dodo Payments.</li></ul></li><li><span className="font-semibold text-neutral-900">Duplicate charge.</span> You were charged more than once for the same order. We refund every extra charge in full.</li><li><span className="font-semibold text-neutral-900">Wrong amount.</span> You were charged more than the price shown at checkout. We refund the difference.</li><li><span className="font-semibold text-neutral-900">Charged for something free,</span> or charged again for a subscription after you cancelled it. Full refund of that charge.</li><li><span className="font-semibold text-neutral-900">Unauthorised charge.</span> A charge you did not make or permit. We refund it after we have checked the payment record and your account activity and found no sign that you or someone using your account authorised it.</li></ul>
            <h3 className="mt-6 mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">3.2 Paid, but nothing delivered</h3>
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Your payment succeeded and the product never reached you. That means the credits never appeared, the plan never started, the document or rewrite was never produced, or the file is empty or will not open.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Tell us first. We have <span className="font-semibold text-neutral-900">2 working days</span> from your email to deliver it. If we don&apos;t, we refund the full amount of that order.</p>
            <h3 className="mt-6 mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">3.3 Total failure of an outreach campaign caused by Studojo</h3>
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">An email campaign qualifies only if <span className="font-semibold text-neutral-900">all</span> of these are true:</p>
            <ol className="mt-3 list-decimal space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>The campaign was active: not paused, cancelled or finished.</li><li>Your Gmail account was connected and working for the whole period.</li><li>The campaign sent <span className="font-semibold text-neutral-900">no emails at all for 7 consecutive days</span>.</li><li>The cause was a fault in Studojo&apos;s own systems. It was not your account, Google, the contact data or your settings.</li><li>You emailed us about it within 15 days of the last email the campaign sent.</li><li>We could not get the campaign sending again within <span className="font-semibold text-neutral-900">7 days</span> of your email.</li></ol>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">If all six are met, we refund the credits reserved for emails the campaign never sent. We value each credit at the price you paid for your pack divided by the number of credits in it. When we issue the refund, we take those credits off your balance.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">If we fix the campaign within the 7 days, no refund is owed. The campaign continues and sends the emails you paid for.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">A LinkedIn plan qualifies on the same conditions, with &quot;sent no emails&quot; read as &quot;sent no invitations or messages&quot;. If the failure started after the plan began, we first offer to extend the plan by the days lost. We refund the unused share of the plan price only if we cannot run the plan at all.</p>
            <h3 className="mt-6 mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">3.4 Assignment Dojo and Humanizer defects</h3>
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">A document or rewrite qualifies only if it is on the wrong subject, is clearly not a response to the brief or text you submitted, or is under half the length you ordered.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Send us your brief or text and the output within 7 days of delivery. We regenerate it once, within 48 hours. If the second version has the same defect, we refund that order in full.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Style, tone, depth, accuracy of individual points, formatting preferences and detection scores are not defects.</p>
            <h3 className="mt-6 mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">3.5 Webinars we cancel</h3>
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">If we cancel a webinar and don&apos;t run it within 30 days, we refund your seat in full. If you miss a webinar that went ahead, no refund is due.</p>
            </div>
            </section>
            
            <section id="instead" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">4. What we do instead of refunding</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Most problems are fixed without any money moving, and these fixes are how we meet our obligations to you:</p>
            <ul className="mt-3 list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li><span className="font-semibold text-neutral-900">Unused credits come back automatically.</span> When a campaign is cancelled, finishes or runs out of contacts, or an email fails permanently, the unused credits return to your balance so you can use them again. If your balance looks wrong, tell us and we will correct it within 2 working days.</li><li><span className="font-semibold text-neutral-900">Bounced emails are replaced</span> with a new contact at no charge.</li><li><span className="font-semibold text-neutral-900">Paused campaigns resume.</span> If Gmail disconnects, the campaign pauses and we email you a reconnect link. It resumes automatically once you reconnect.</li><li><span className="font-semibold text-neutral-900">We fix our faults.</span> If our systems fail, we restart your campaign or regenerate your document.</li></ul>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Credits returned to your balance are not money and cannot be exchanged for money.</p>
            </div>
            </section>
            
            <section id="how" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">5. How to ask</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Raise a ticket from the support chat on studojo.com, or email <span className="font-semibold text-neutral-900">admin@studojo.com</span> from the address on your Studojo account with &quot;Refund&quot; in the subject line. Both reach the same team. Include:</p>
            <ul className="mt-3 list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>your payment ID, or the line from your bank statement;</li><li>the product and, for a campaign, its name;</li><li>which case in section 3 you believe applies, and what happened.</li></ul>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Ask within <span className="font-semibold text-neutral-900">15 days</span> of the event, except for payment errors, which you can report within 60 days. These windows apply only to refunds under this policy. They do not shorten the time the law gives you to bring a complaint (section 11).</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We acknowledge your email within 48 hours. We tell you our decision, with reasons, within 7 working days. We decide from our own records: the payment record, your credit ledger, the campaign&apos;s send log and our system logs.</p>
            </div>
            </section>
            
            <section id="paid" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">6. How refunds are paid</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <ul className="list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>Approved refunds go back only to the original payment method, in the original currency, through the provider that took the payment.</li><li>We start the refund within 5 working days of approving it.</li><li>Razorpay refunds normally reach you 5 to 7 working days after that, and Dodo Payments refunds 5 to 10 working days. Card refunds can take an extra statement cycle.</li><li>A refund for a whole order cancels any campaign or plan still running on it and removes that order&apos;s remaining credits from your balance.</li><li>We refund once per charge.</li></ul>
            </div>
            </section>
            
            <section id="subs" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">7. Subscriptions</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">You can cancel an AutoApply subscription at any time from your account. Cancelling stops the next renewal, and you keep access until the end of the period you have already paid for. We don&apos;t refund part of a period. If you are charged after cancelling, section 3.1 applies.</p>
            </div>
            </section>
            
            <section id="disputes" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">8. Chargebacks</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Please contact us before disputing a charge with your bank. We can usually resolve a genuine payment error faster than a chargeback can. While a chargeback is open, we may pause the account it relates to. If the chargeback is decided in your favour, we do not also refund you under this policy.</p>
            </div>
            </section>
            
            <section id="misuse" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">9. Misuse</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">We refuse refunds where we find abuse. That includes repeated refund requests, coupon abuse, using several accounts, or requests about outreach you used for spam or harassment.</p>
            </div>
            </section>
            
            <section id="outside" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">10. Buyers in the EU and UK</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">If you live in the EU or UK, the law may give you 14 days to cancel an online purchase. We honour that right. If you cancel after the service has started, we refund only the part not yet delivered. Unused credits count as not delivered.</p>
            </div>
            </section>
            
            <section id="law" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">11. Your rights under law</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">Nothing in this policy limits a right you have under the Consumer Protection Act 2019, the Consumer Protection (E-Commerce) Rules 2020, Reserve Bank of India rules on failed transactions, or the consumer law of the country you live in. If a court or consumer commission finds that a service we sold you was deficient, we will comply with its order. Section 5&apos;s time limits don&apos;t shorten the two years the Act gives you to file a complaint.</p>
            </div>
            </section>
            
            <section id="grievance" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">12. Grievance officer</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <ul className="list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base"><li>Designation: Grievance Officer, Studojo Labs Private Limited</li><li>Email: admin@studojo.com, with &quot;GRIEVANCE&quot; at the start of the subject line</li><li>Address: Studojo Labs Private Limited, Bengaluru, Karnataka, India</li></ul>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">The grievance officer acknowledges a complaint within 48 hours and resolves it within one month of receiving it. If you are not satisfied, you can go to the National Consumer Helpline (consumerhelpline.gov.in) or file a complaint at e-daakhil.nic.in.</p>
            </div>
            </section>
            
            <section id="changes" className="scroll-mt-24">
            <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">13. Changes and governing law</h2>
            <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">A purchase is governed by the version of this policy in force on the day you paid. We may change this policy for future purchases by publishing a new version with its effective date.</p>
            <p className="mt-3 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">This policy is governed by the laws of India. The courts at Bengaluru have jurisdiction, except that you may bring a consumer complaint wherever the Consumer Protection Act 2019 allows.</p>
            </div>
            </section>

            {/* Buttons */}
            <div className="flex flex-col gap-6 md:flex-row">
              <a href="mailto:admin@studojo.com" className="flex-1">
                <button className="flex w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 px-6 py-4 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                  Ask Support for a Refund
                </button>
              </a>
              <Link to="/" className="flex-1">
                <button className="flex w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-6 py-4 font-['Satoshi'] text-base font-medium text-neutral-900 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                  Return to Home
                </button>
              </Link>
            </div>

            {/* Still have questions */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-violet-500 p-6 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
              <h3 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">
                Still have questions?
              </h3>
              <p className="mb-6 font-['Satoshi'] text-base leading-7 text-white">
                Our support team is here to help.
              </p>
              <a
                href="mailto:admin@studojo.com"
                className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-6 font-['Satoshi'] text-base font-medium text-violet-500 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Contact Us
              </a>
            </div>

          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
