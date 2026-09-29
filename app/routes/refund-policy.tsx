// The Refund Policy text is generated from the approved draft
// (Studojo/legal-rewrite/refund.html) with legal-rewrite/tools/html2jsx.py.
// Edit the draft and regenerate rather than hand-editing this markup, so the
// approved wording and this page stay identical.
import { LegalPage } from "~/components/legal/legal-page";
import { EFFECTIVE_DATE, LEGAL_ENTITY, POLICY_VERSIONS, fill } from "~/lib/legal";
import type { Route } from "./+types/refund-policy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Refund Policy | Studojo" },
    { name: "description", content: "When Studojo refunds a purchase, and how to ask." },
  ];
}

const TOC = [
  { id: "scope", label: "1. What this policy covers" },
  { id: "final", label: "2. All sales are final" },
  { id: "eligible", label: "3. The only cases that are refunded" },
  { id: "instead", label: "4. What we do instead of refunding" },
  { id: "how", label: "5. How to ask" },
  { id: "paid", label: "6. How refunds are paid" },
  { id: "subs", label: "7. Subscriptions" },
  { id: "disputes", label: "8. Chargebacks" },
  { id: "misuse", label: "9. Misuse" },
  { id: "outside", label: "10. Buyers in the EU and UK" },
  { id: "law", label: "11. Your rights under law" },
  { id: "grievance", label: "12. Grievance officer" },
  { id: "changes", label: "13. Changes and governing law" },
];

export default function RefundPolicy() {
  return (
    <LegalPage title="Refund Policy" subtitle=<>Version {POLICY_VERSIONS.refund} · Effective {fill(EFFECTIVE_DATE)}. Replaces version 2.0 of 15 September 2026 for purchases made on or after the effective date.</> toc={TOC}>
      <div className="legal-key">
        <p><b>In short.</b> Studojo sells digital services that start the moment you pay. <b>All sales are final.</b> We refund money only in the cases listed in section 3:</p>
        <ul>
          <li>A payment error.</li>
          <li>A service we never delivered.</li>
          <li>A service that failed completely because of our systems and that we could not restore.</li>
        </ul>
        <p>We do not refund unused credits, unused plan time, changes of mind or results. Nothing in this policy takes away a right you have under law (section 11).</p>
      </div>
      <h2 id="scope">1. What this policy covers</h2>
      <p>This policy applies to every purchase made on studojo.com, app.studojo.com, studojo.pro and our browser extensions from Studojo Labs Private Limited (&quot;Studojo&quot;, &quot;we&quot;). These are the paid products it covers:</p>
      <div className="legal-tbl"><table>
        <thead><tr><th>Product</th><th>What you buy</th><th>Delivered when</th></tr></thead>
        <tbody>
          <tr><td>Outreach Dojo credits (email plans)</td><td>Credits, each worth one first-touch outreach email sent from your connected Gmail account</td><td>The credits appear in your balance</td></tr>
          <tr><td>LinkedIn plans (weekly, monthly)</td><td>Automated LinkedIn invitations and messages for a fixed period</td><td>The plan period starts</td></tr>
          <tr><td>Combined email and LinkedIn plans</td><td>Both of the above</td><td>The credits appear and the plan period starts</td></tr>
          <tr><td>Assignment Dojo</td><td>One AI-generated document per order</td><td>The document is available to download</td></tr>
          <tr><td>Humanizer</td><td>Rewriting of text you submit, priced per 100 words</td><td>The rewritten text is shown to you</td></tr>
          <tr><td>Webinars</td><td>A seat at a scheduled live session</td><td>The session takes place</td></tr>
          <tr><td>AutoApply subscription</td><td>Automated job applications, billed each period</td><td>Each billing period starts</td></tr>
        </tbody>
      </table></div>
      <p>The Careers Dojo resume builder is free, so this policy has nothing to refund there. If you are charged for it, that is a payment error under section 3.1.</p>
      <p>Business customers of Studojo Partners and the Contact Enrichment API are covered by their partner agreement, not this policy.</p>
      <p>We take payments in Indian rupees through Razorpay and in US dollars through Dodo Payments. Which one you use depends on the location we detect when you check out. LinkedIn plans and webinars are sold through Razorpay only.</p>
      <h2 id="final">2. All sales are final</h2>
      <p>Every product starts as soon as payment succeeds: credits are granted, plans begin and documents start generating. When you pay, you ask us to start straight away, and you accept that the purchase cannot be cancelled once it starts.</p>
      <p>So, apart from the cases in section 3, we do not refund:</p>
      <ul>
        <li>Credits you have not used, however long you hold them. Credits do not expire, so you can use them at any time.</li>
        <li>Unused time on a LinkedIn plan or subscription period, including when you pause, cancel or stop using it.</li>
        <li>A change of mind, a purchase made by mistake, or buying a larger pack than you needed.</li>
        <li>Results. We do not promise replies, interviews, offers, connection acceptances or job applications that succeed.</li>
        <li>Emails that bounced or went to contacts who did not reply. A bounced email is replaced with a new contact automatically and at no charge. That replacement is the remedy.</li>
        <li>Outreach that stopped or slowed because of your account or choices, including:
          <ul>
            <li>you disconnected Gmail or LinkedIn;</li>
            <li>Google or LinkedIn limited, suspended or logged out your account;</li>
            <li>you changed your password;</li>
            <li>you paused or cancelled;</li>
            <li>your targeting was too narrow to find contacts;</li>
            <li>you deleted your account.</li>
          </ul></li>
        <li>How good you think a document or rewrite is, the grade you received, or the score from any plagiarism or AI-detection tool.</li>
        <li>Penalties from your college, university or employer, or from Google or LinkedIn, arising from how you used the service.</li>
        <li>Credits or plan time lost when we suspend or close your account for breaking our Terms of Service.</li>
        <li>Coupon discounts, or orders paid entirely with a 100% coupon.</li>
        <li>Fees your bank or card issuer charges, and differences caused by exchange rates.</li>
      </ul>
      <h2 id="eligible">3. The only cases that are refunded</h2>
      <p>We refund money in the following cases and no others, except where section 11 applies. Each case has conditions, and all of them must be met.</p>
      <h3 id="s3-1">3.1 Payment errors</h3>
      <ul>
        <li><b>Failed payment.</b> Money left your account but the payment never completed, for example because the page closed, the connection dropped, or the payment was never confirmed to us. In this case Studojo never received your money and you did not receive any credits. The money is held between your bank and the payment provider, and the law requires it to be returned to you automatically. You do not need to do anything.
          <ul>
            <li><b>UPI:</b> reversed by your bank by the next working day after the payment.</li>
            <li><b>Debit and credit cards:</b> reversed within 5 days of the payment.</li>
            <li><b>If your bank is late:</b> under the Reserve Bank of India&apos;s rules on failed transactions, your bank must pay you ₹100 for each day of delay beyond these limits. Claim this from your bank, not from Studojo.</li>
            <li><b>If the money still hasn&apos;t come back after these limits,</b> email us your payment ID or the line from your bank statement. We will check our records and raise it with Razorpay for you.</li>
            <li><b>If our records show the payment did reach Studojo but you did not get your credits,</b> that is not a failed payment. Section 3.2 applies: we either add the credits within 2 working days or refund the payment ourselves.</li>
            <li><b>Card payments made abroad through Dodo Payments:</b> reversal times are set by your card issuer, usually within 5 to 10 working days. If it has not come back after that, email us and we will raise it with Dodo Payments.</li>
          </ul>
        </li>
        <li><b>Duplicate charge.</b> You were charged more than once for the same order. We refund every extra charge in full.</li>
        <li><b>Wrong amount.</b> You were charged more than the price shown at checkout. We refund the difference.</li>
        <li><b>Charged for something free,</b> or charged again for a subscription after you cancelled it. Full refund of that charge.</li>
        <li><b>Unauthorised charge.</b> A charge you did not make or permit. We refund it after we have checked the payment record and your account activity and found no sign that you or someone using your account authorised it.</li>
      </ul>
      <h3 id="s3-2">3.2 Paid, but nothing delivered</h3>
      <p>Your payment succeeded and the product never reached you. That means the credits never appeared, the plan never started, the document or rewrite was never produced, or the file is empty or will not open.</p>
      <p>Tell us first. We have <b>2 working days</b> from your email to deliver it. If we don&apos;t, we refund the full amount of that order.</p>
      <h3 id="s3-3">3.3 Total failure of an outreach campaign caused by Studojo</h3>
      <p>An email campaign qualifies only if <b>all</b> of these are true:</p>
      <ol>
        <li>The campaign was active: not paused, cancelled or finished.</li>
        <li>Your Gmail account was connected and working for the whole period.</li>
        <li>The campaign sent <b>no emails at all for 7 consecutive days</b>.</li>
        <li>The cause was a fault in Studojo&apos;s own systems. It was not your account, Google, the contact data or your settings.</li>
        <li>You emailed us about it within 15 days of the last email the campaign sent.</li>
        <li>We could not get the campaign sending again within <b>7 days</b> of your email.</li>
      </ol>
      <p>If all six are met, we refund the credits reserved for emails the campaign never sent. We value each credit at the price you paid for your pack divided by the number of credits in it. When we issue the refund, we take those credits off your balance.</p>
      <p>If we fix the campaign within the 7 days, no refund is owed. The campaign continues and sends the emails you paid for.</p>
      <p>A LinkedIn plan qualifies on the same conditions, with &quot;sent no emails&quot; read as &quot;sent no invitations or messages&quot;. If the failure started after the plan began, we first offer to extend the plan by the days lost. We refund the unused share of the plan price only if we cannot run the plan at all.</p>
      <h3 id="s3-4">3.4 Assignment Dojo and Humanizer defects</h3>
      <p>A document or rewrite qualifies only if it is on the wrong subject, is clearly not a response to the brief or text you submitted, or is under half the length you ordered.</p>
      <p>Send us your brief or text and the output within 7 days of delivery. We regenerate it once, within 48 hours. If the second version has the same defect, we refund that order in full.</p>
      <p>Style, tone, depth, accuracy of individual points, formatting preferences and detection scores are not defects.</p>
      <h3 id="s3-5">3.5 Webinars we cancel</h3>
      <p>If we cancel a webinar and don&apos;t run it within 30 days, we refund your seat in full. If you miss a webinar that went ahead, no refund is due.</p>
      <h2 id="instead">4. What we do instead of refunding</h2>
      <p>Most problems are fixed without any money moving, and these fixes are how we meet our obligations to you:</p>
      <ul>
        <li><b>Unused credits come back automatically.</b> When a campaign is cancelled, finishes or runs out of contacts, or an email fails permanently, the unused credits return to your balance so you can use them again. If your balance looks wrong, tell us and we will correct it within 2 working days.</li>
        <li><b>Bounced emails are replaced</b> with a new contact at no charge.</li>
        <li><b>Paused campaigns resume.</b> If Gmail disconnects, the campaign pauses and we email you a reconnect link. It resumes automatically once you reconnect.</li>
        <li><b>We fix our faults.</b> If our systems fail, we restart your campaign or regenerate your document.</li>
      </ul>
      <p>Credits returned to your balance are not money and cannot be exchanged for money.</p>
      <h2 id="how">5. How to ask</h2>
      <p>Raise a ticket from the support chat on studojo.com, or email <b>admin@studojo.com</b> from the address on your Studojo account with &quot;Refund&quot; in the subject line. Both reach the same team. Include:</p>
      <ul>
        <li>your payment ID, or the line from your bank statement;</li>
        <li>the product and, for a campaign, its name;</li>
        <li>which case in section 3 you believe applies, and what happened.</li>
      </ul>
      <p>Ask within <b>15 days</b> of the event, except for payment errors, which you can report within 60 days. These windows apply only to refunds under this policy. They do not shorten the time the law gives you to bring a complaint (section 11).</p>
      <p>We acknowledge your email within 48 hours. We tell you our decision, with reasons, within 7 working days. We decide from our own records: the payment record, your credit ledger, the campaign&apos;s send log and our system logs.</p>
      <h2 id="paid">6. How refunds are paid</h2>
      <ul>
        <li>Approved refunds go back only to the original payment method, in the original currency, through the provider that took the payment.</li>
        <li>We start the refund within 5 working days of approving it.</li>
        <li>Razorpay refunds normally reach you 5 to 7 working days after that, and Dodo Payments refunds 5 to 10 working days. Card refunds can take an extra statement cycle.</li>
        <li>A refund for a whole order cancels any campaign or plan still running on it and removes that order&apos;s remaining credits from your balance.</li>
        <li>We refund once per charge.</li>
      </ul>
      <h2 id="subs">7. Subscriptions</h2>
      <p>You can cancel an AutoApply subscription at any time from your account. Cancelling stops the next renewal, and you keep access until the end of the period you have already paid for. We don&apos;t refund part of a period. If you are charged after cancelling, section 3.1 applies.</p>
      <h2 id="disputes">8. Chargebacks</h2>
      <p>Please contact us before disputing a charge with your bank. We can usually resolve a genuine payment error faster than a chargeback can. While a chargeback is open, we may pause the account it relates to. If the chargeback is decided in your favour, we do not also refund you under this policy.</p>
      <h2 id="misuse">9. Misuse</h2>
      <p>We refuse refunds where we find abuse. That includes repeated refund requests, coupon abuse, using several accounts, or requests about outreach you used for spam or harassment.</p>
      <h2 id="outside">10. Buyers in the EU and UK</h2>
      <p>If you live in the EU or UK, the law may give you 14 days to cancel an online purchase. We honour that right. If you cancel after the service has started, we refund only the part not yet delivered. Unused credits count as not delivered.</p>
      <h2 id="law">11. Your rights under law</h2>
      <p>Nothing in this policy limits a right you have under the Consumer Protection Act 2019, the Consumer Protection (E-Commerce) Rules 2020, Reserve Bank of India rules on failed transactions, or the consumer law of the country you live in. If a court or consumer commission finds that a service we sold you was deficient, we will comply with its order. Section 5&apos;s time limits don&apos;t shorten the two years the Act gives you to file a complaint.</p>
      <h2 id="grievance">12. Grievance officer</h2>
      <ul>
        <li>Name: {fill(LEGAL_ENTITY.grievanceOfficer)}</li>
        <li>Designation: Grievance Officer, Studojo Labs Private Limited</li>
        <li>Email: admin@studojo.com, with &quot;GRIEVANCE&quot; at the start of the subject line</li>
        <li>Phone: {fill(LEGAL_ENTITY.phone)}</li>
        <li>Address: Studojo Labs Private Limited, {fill(LEGAL_ENTITY.registeredOffice)}, Bengaluru, Karnataka, India</li>
      </ul>
      <p>The grievance officer acknowledges a complaint within 48 hours and resolves it within one month of receiving it. If you are not satisfied, you can go to the National Consumer Helpline (consumerhelpline.gov.in) or file a complaint at e-daakhil.nic.in.</p>
      <h2 id="changes">13. Changes and governing law</h2>
      <p>A purchase is governed by the version of this policy in force on the day you paid. We may change this policy for future purchases by publishing a new version with its effective date.</p>
      <p>This policy is governed by the laws of India. The courts at Bengaluru have jurisdiction, except that you may bring a consumer complaint wherever the Consumer Protection Act 2019 allows.</p>
    </LegalPage>
  );
}
