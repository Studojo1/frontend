import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/refund-policy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Refund Policy | Studojo" },
    {
      name: "description",
      content: "Studojo's refund policy | please read before making a purchase.",
    },
  ];
}

type Block = {
  type: "paragraph" | "bullets" | "numbered" | "subsection";
  subheading?: string;
  content: string[];
};

type PolicySection = { heading: string; id: string; blocks: Block[] };

// The policy lives here as data rather than as 1,000 lines of hand-written JSX.
// Same pattern terms.tsx uses for its company-details table.
const POLICY: PolicySection[] = [
  {
    heading: "1. What this policy covers",
    id: "s1",
    blocks: [
      { type: "paragraph", content: [
          "This is the refund policy for studojo.com. The site is operated by Studojo Labs Private Limited, a company registered in Bengaluru, Karnataka, India. It applies to everything you can pay us for, wherever in the world you are.",
          "We have written it around how the product actually behaves, not how we wish it behaved. Where our system does something awkward, we say so here instead of hiding it behind a clause. If a promise is in this policy, our support team can check it against real records and act on it.",
          "If you are reading this because a campaign did not go the way you expected, start at section 4. That is where most of what you need is.",
        ] },
      { type: "bullets", content: [
          "Internship Dojo outreach credits, bought as a credit pack. Credits pay for finding hiring manager leads, looking up contact emails, and sending outreach from the mailbox you connect.",
          "Assignment Dojo, delivered as a document you download.",
          "Careers Dojo resume builder, which is free. There is nothing to pay and nothing to refund.",
        ] },
      { type: "paragraph", content: [
          "Payments in Indian rupees are taken through Razorpay. International payments are taken through Dodo Payments. A refund always goes back the way it came, through whichever of those two took your money.",
          "This version takes effect on 15 September 2026 and replaces every earlier refund policy on studojo.com. It also covers purchases you made before that date. You do not need an open request with us, and it does not matter that you never complained at the time. If an earlier version would have given you a better outcome on a particular point, you get the better one.",
        ] },
    ],
  },
  {
    heading: "2. The short version",
    id: "s2",
    blocks: [
      { type: "paragraph", content: [
          "The rest of this document is detailed because refunds deserve detail. Here is the whole thing in ten lines.",
        ] },
      { type: "bullets", content: [
          "Credits are reserved from your balance in full the moment a campaign is created. Reserving is not using. A credit only counts as used once an email has actually gone out.",
          "If your campaign stops early, the credits for emails that never went out come back to you.",
          "You choose whether that comes back as credits or as money. The value is the same either way. The only time money is not the default is when you cancelled a campaign that was running normally, and even then you can ask for money within 30 days.",
          "If the campaign sent nothing at all, you get the whole thing back, and you can take it as money. A campaign that never sent an email was never working, so cancelling it does not count as you changing your mind.",
          "If we cannot produce a send log for your campaign, we treat the number sent as zero and refund in full. Proving delivery is our job, not yours.",
          "Failed payments, double charges, being charged for something free, and being charged with nothing delivered are always refunded. Nothing else here limits that.",
          "Assignment Dojo: cancel any time before the document is generated for a full refund. After delivery, we fix defects free, and refund if we cannot fix them.",
          "We do not refund outcomes. We send the emails. We do not control who replies.",
          "Some of this runs by hand rather than automatically. Credits that should come back to your balance are put back by a person on our side, so tell us and we will do it.",
          "We are not the final judge of our own mistakes. You get the records, and you get an escalation route. We acknowledge within 48 hours, decide within 7 working days, and close everything inside one month.",
        ] },
    ],
  },
  {
    heading: "3. Cases where we always refund",
    id: "s3",
    blocks: [
      { type: "paragraph", content: [
          "This section comes first because it outranks everything after it. Nothing later in this policy, and no non-refundable label anywhere else on Studojo, limits any of these.",
        ] },
      { type: "numbered", content: [
          "Money left your account but the payment never completed. For rupee payments taken through Razorpay, the Reserve Bank of India's turnaround time rules require a failed transaction to be reversed, and no merchant policy can override that. For international payments taken through Dodo Payments, the same principle applies through the card networks. Tell us either way. We will check our own payment records, chase the processor on your behalf, and stay on it until the money is back with you. If our records show the money did reach us, we refund it ourselves. If a rupee reversal is late under the Reserve Bank of India rules, we will tell you how to claim the compensation those rules provide.",
          "You were charged twice for the same purchase. We refund every extra charge in full. Send us the two payment references and that is all we need.",
          "Your payment went through and your account never received the credits or the access you paid for. You choose: we grant what you paid for, or we refund you in full. We do not argue about this one.",
          "A campaign was created and not a single outreach email was ever sent from it. Full refund of that campaign's credits, as money or as released credits, your choice. If you cancelled that campaign yourself, it changes nothing here. A campaign that sent nothing was not working, so money stays on the table.",
          "You were charged for something we list as free, including the Careers Dojo resume builder. Full refund of everything charged.",
          "You were charged an amount different from the price shown at checkout. We refund the difference, or the whole payment if you would rather cancel.",
          "You were charged after you cancelled, or charged again for a pack that had already been refunded.",
          "A charge you did not authorise. Tell us and we pull the payment record and the account activity around it ourselves. You are not asked to prove a negative. If what we find does not clearly show that you authorised the charge, or if the records are unclear, contradictory or missing, we refund it.",
          "Someone at Studojo made you a written promise this policy does not honour. Send us the message. We honour the promise or we refund you in full.",
        ] },
      { type: "paragraph", content: [
          "For everything in this section we can see the problem in our own records. We are not going to make you build a case for it. If we spot one of these ourselves while reviewing our records, we act on it without waiting for you to ask.",
        ] },
    ],
  },
  {
    heading: "4. Outreach credits: reservation is not delivery",
    id: "s4",
    blocks: [
      { type: "paragraph", content: [
          "Read this part even if you skip the rest. It is the part most people get caught by.",
          "When a campaign is created, the system reserves the full number of credits for that campaign immediately, before a single email is sent. It does not take one credit each time an email goes out. It takes all of them on day one, and then the campaign sends roughly 20 emails a day for about 26 days from your connected mailbox.",
          "So the credit balance in your account is not a record of what we delivered. If your campaign stopped on day two, your account can read zero while only a handful of emails ever left your mailbox.",
          "One more thing you should know up front. Credits that stop being needed are not put back automatically. Today a person on our side releases them. Nothing is lost if your balance does not move on its own, but you do need to tell us so we can put it back.",
          "Our old policy treated reservation as use and refused refunds on that basis. That was the worst thing in it. It is gone. We treat delivered emails as the thing you paid for.",
        ] },
      { type: "subsection", subheading: "What counts as a used credit", content: [
          "A credit is used when an outreach email has actually been accepted for delivery by your connected mailbox and sent to a contact we found for you. That is the only thing that counts.",
        ] },
      { type: "bullets", content: [
          "Credits reserved for emails that have not gone out yet are not used.",
          "Credits attached to sends that failed for a technical reason on our side are not used.",
          "Credits attached to emails that never went because the campaign was paused, cancelled or stopped are not used.",
          "Credits attached to emails that never went because your mailbox disconnected are not used.",
          "Credits attached to contacts we never actually found or enriched are not used.",
        ] },
      { type: "subsection", subheading: "How we work out what to give back", content: [
          "We pull your campaign send log and count the emails that actually went out. We compare that to the number of credits the campaign reserved. The difference is your undelivered portion, and we round it up in your favour to the next whole credit.",
          "If 10 percent or less of the campaign was delivered, we refund the whole amount. A campaign that barely started has not given you anything usable, and we are not going to argue over small numbers.",
          "If we cannot produce a send log for your campaign, we treat the count as zero and refund in full. The burden of proving delivery is ours.",
          "If your pack covered more than one campaign, we only look at the campaign that failed. The rest of your credits stay in your account, and they can still be refunded as money under the unused credit rules below.",
        ] },
      { type: "subsection", subheading: "A worked example", content: [
          "Say your pack covers 500 outreach emails and you paid 2,000 rupees for it. Those numbers are here to show the maths. They are not our price list, and your own pack size and price are on your receipt.",
          "Your campaign stalls after 60 emails have gone out. 60 out of 500 is 12 percent delivered, so 88 percent is undelivered. Your refund is 1,760 rupees.",
          "If it had stalled after 30 emails, that is 6 percent, which is inside our 10 percent line, so you would get the full 2,000 rupees back.",
          "No admin fee, no processing deduction, no restocking charge, no cancellation fee. We do not have those and we are not going to invent them at the moment you ask for your money.",
        ] },
      { type: "subsection", subheading: "Credits or money, your choice", content: [
          "You can take the undelivered portion back as credits in your account, or as money to your original payment method. The value is identical.",
          "We will never push you towards credits. If you ask for money, you get money.",
          "One narrow exception, stated plainly. If you cancelled a campaign that was sending normally, or you deliberately disconnected your mailbox while it was sending normally, our default is to release the undelivered credits back into your account rather than sending cash. Nothing is taken from you and those credits stay usable. If you would rather have the money, ask within 30 days of the credits landing back in your account and we will send money instead, worked out the same way.",
          "That exception is narrow on purpose. If you cancelled because the campaign had stalled, because it was sending nothing, because it was reaching the wrong people, or because you asked us for help and did not get it, that is not a voluntary cancellation. You keep the full choice between money and credits, and pressing cancel is never used against you.",
          "We only treat a disconnection as deliberate where our records clearly show that you disconnected it. Our records are often not clear on this, and where they are not, we treat it as our failure and money is on the table.",
          "Where the campaign stopped because of us, money is always available and there is no window at all.",
        ] },
      { type: "subsection", subheading: "What one credit is worth", content: [
          "We value each credit at what you actually paid for it: the price of your pack divided by the number of credits in it.",
          "If you bought during an offer, we use the offer price, because that is the price you paid. We will not refund at a lower rate by pretending you paid list price.",
        ] },
      { type: "subsection", subheading: "Credits you have not used yet", content: [
          "Credits released back into your account after a campaign stopped count as unused credits from the day they are released. Everything in this subsection applies to them, including the money refund below, and the 30 day window runs from the day they land back in your balance, not from the day you bought them.",
          "Credits that have never been attached to a campaign can be refunded as money within 30 days of purchase. Any reason, or no reason. You do not have to explain.",
          "After 30 days they stay in your account and keep working. Credits do not expire today. If we ever introduce expiry, we will email you at least 30 days before it starts, and it will not apply to credits you had already bought.",
          "That 30 day window does not run at all if the reason you could not use your credits was on our side. A broken account, locked credits, campaign creation failing, credits never granted, or nobody answering you when you asked for help. In those cases there is no window. Tell us whenever you notice and we will look at the records.",
        ] },
      { type: "subsection", subheading: "Contact data and bounces", content: [
          "We find leads and look up contact emails through third-party data providers. Some of those addresses will be out of date or wrong. That is true of every contact data source, including ours, and we do not promise a perfect list.",
          "There is still a floor. Where our records show an email failed because the address itself was invalid or rejected by the receiving server, that outreach was not delivered, so it comes back to you. You choose credits or money, at any bounce rate, because what you bought was outreach that reached a real person and that one did not.",
          "Putting a bounced credit back on your balance is a manual step on our side today. It does not happen by itself. Tell us and we will do it, and we will go through the bounce log with you line by line.",
          "If more than 20 percent of the emails sent in a single campaign hard bounced, the list we gave you was bad rather than unlucky. At that point we refund the whole campaign rather than only the bounced portion, and we will flag it to you rather than wait to be asked.",
        ] },
      { type: "subsection", subheading: "What we do not promise", content: [
          "We do not promise replies, interviews or offers. We find contacts and send emails from your mailbox. What a hiring manager does next is not in our control, and a campaign that ran properly but got a quiet response is not a refund case.",
          "Targeting is a different thing. Targeting is a delivery promise, not an outcome. If fewer than half the contacts a campaign emailed match the role, industry or location you set up, the campaign did not do what you paid for. That is a delivery failure and the whole campaign is refundable as money. You do not have to count them yourself. Ask us and we will send you the contact list with your targeting settings next to it.",
          "If anyone at Studojo told you in writing that you would get interviews or a job, send us that message and we will refund you in full. We would rather pay that out than have it said we sold you a result.",
        ] },
    ],
  },
  {
    heading: "5. When the failure is ours",
    id: "s5",
    blocks: [
      { type: "paragraph", content: [
          "These are real failure modes in our own system, not hypotheticals. We are naming them because you should not have to prove that a known bug happened to you. In all of these, the refund for the affected portion is the full portion. We do not apply the proportional calculation to our own failures.",
        ] },
      { type: "subsection", subheading: "Payment taken, credits never granted", content: [
          "Send us your payment reference. We check the payment record against your account's credit history. If the grant is missing, you choose: we grant the credits you paid for, or we refund you in full.",
        ] },
      { type: "subsection", subheading: "Campaign created, nothing ever sent", content: [
          "The campaign exists, the credits were reserved, and no email ever left your mailbox. This has happened to paying users and we are not going to be coy about it.",
          "Full refund of that campaign's credits, as money or released credits, your choice. There is no time window on this one beyond the limitation periods the law sets.",
        ] },
      { type: "subsection", subheading: "Your mailbox disconnected during a campaign", content: [
          "Outreach is sent from your own mailbox, the one you connect to Studojo. That connection can drop while a campaign is running, and when it drops, sending stops.",
          "We will be honest about where we are today. Our alerting on this is not reliable, so you can lose days without being told. We are fixing it, and until it is fixed you carry none of the cost.",
          "If your campaign stopped because the connection dropped and nobody told you, the undelivered portion comes back as money or credits, your choice, whenever you notice. There is no deadline on that. Our silence is not a clock we get to run against you.",
          "If we did tell you and you reconnect, sending resumes and nothing else changes. If we told you and you would rather stop there, we release the undelivered credits back into your account, and you can ask for money instead within 30 days of them landing back.",
        ] },
      { type: "subsection", subheading: "Credits stuck after failed sends", content: [
          "When a send fails, the credit should come back to your balance so you can retry. Today it does not come back on its own, and that can lock you out of retrying. This is a known fault and we are not hiding it.",
          "Tell us and we will release those credits by hand. We aim to do that within 2 working days of you telling us, and we will email you when it is done. If it takes longer, reply and say so, and it goes to the grievance officer. If you would rather stop using the product than keep retrying, we will refund the money instead.",
          "If a send failed and the credit did not come back, you do not pay again to retry it. Tell us and we will either release the stuck credit or cover the retry from our side. You should never pay twice for the same outreach attempt, and if our records show you did, we refund the difference.",
        ] },
      { type: "subsection", subheading: "Stalled campaigns", content: [
          "Any campaign that sends nothing for 72 hours straight while it is supposed to be running counts as stalled, whatever the cause. Tell us.",
          "If we cannot get it moving within 72 hours of you telling us, treat it as our failure and ask for the undelivered portion back as money.",
          "If the same campaign stalls a second time, you do not have to wait again. Ask for the undelivered portion back as money at that point and we will not ask you to give it another try. We get one restart per campaign, not an unlimited number.",
          "A campaign is also late if it has not finished within 60 days of being created, which is more than double the 26 days it is meant to take. At that point you can ask for the undelivered portion back as money, even if it has been trickling emails out the whole time.",
        ] },
      { type: "subsection", subheading: "Outages and platform faults", content: [
          "If our systems are down or broken and that costs you delivery, the undelivered portion is refunded in full.",
          "We do not pass the blame down the chain. If a supplier we use failed, or a payment processor failed, or a mail provider failed, that is between us and them. From where you sit the question is simple: did the thing you paid for actually run. If it did not, you get your money back.",
          "We do not charge you again for work we have to redo because of our own fault.",
          "We also review our own records for accounts where money was taken and nothing was delivered, and we run that review again after any incident that affects sending. Where we find one, we refund it without waiting to be asked, and we email the account to say so. If you think that describes you, email us with your payment ID and we will treat it as a section 3 case. You should not have to catch our mistakes for us.",
        ] },
    ],
  },
  {
    heading: "6. Assignment Dojo",
    id: "s6",
    blocks: [
      { type: "paragraph", content: [
          "Assignment Dojo is AI assignment help, delivered as a document you download.",
        ] },
      { type: "bullets", content: [
          "Before the document is generated, you can cancel for any reason and get a full refund. No explanation needed.",
          "If the document never arrived, arrived empty or truncated, or will not open, that is a delivery failure. We redeliver, or refund in full if you would rather have the money.",
          "If the document does not match the brief you submitted, send us the brief and the file. We fix it free first. Defective means wrong subject, does not follow your brief, wrong format, incomplete, unreadable, or missing referencing you paid for.",
          "If we cannot fix a defect within 48 hours, or after two attempts, you get a full refund. You do not have to keep accepting rewrites.",
          "Tell us within 7 days of delivery if you can. That is a request, not a deadline. It is simply the window where the file, the brief and the generation record are easiest for us to line up. Reporting later does not cost you the refund, and nothing in this policy shortens the time the law gives you to bring a complaint about a service that was deficient.",
        ] },
      { type: "paragraph", content: [
          "We do not refund a completed document that matches the brief where you simply changed your mind after downloading it. We do not refund based on the mark you received. We also do not guarantee a particular score from any plagiarism or AI detection tool, because we do not control those tools, they disagree with each other, and their results shift month to month.",
          "That is a different thing from the work itself being copied. If the product page advertised something and your document does not have it, including original writing and the referencing you paid for, that is a defect and the defect route above applies in the normal way.",
          "If you change the brief after work has started, we will quote the change rather than treat it as a defect.",
          "Assignment Dojo is study support. What your college or university permits is your responsibility, and a penalty from your institution is not a refund case. If you are not sure whether you are allowed to use it, check before you buy.",
        ] },
    ],
  },
  {
    heading: "7. Careers Dojo resume builder",
    id: "s7",
    blocks: [
      { type: "paragraph", content: [
          "The resume builder is free. There is no paid tier, no trial that converts, and no card on file for it. So there is nothing here to refund.",
          "If a charge from us appears on your statement that you think relates to the resume builder, it is either an error or a charge for a different product. Send us the payment reference and we will identify it. If it is an error, you get all of it back in full under section 3, and we do not ask you to justify it.",
        ] },
    ],
  },
  {
    heading: "8. What we do not refund",
    id: "s8",
    blocks: [
      { type: "paragraph", content: [
          "This list is deliberately short. Read it together with the two limits set out earlier: the credit rules in section 4 and the assignment rules in section 6. Between those three places, that is every reason we will refuse a refund. If a reason is not written down in this policy, it is not a reason we will use on you, and nobody on our support team has the authority to invent one.",
        ] },
      { type: "bullets", content: [
          "Outreach that actually reached a real contact. Once an email has left your mailbox and been accepted by the receiving server, we cannot unsend it, and that is what you bought. Emails that hard bounced do not count as sent and are refundable under section 4.",
          "Results. No replies, no interviews, no offers. We sell outreach, not outcomes.",
          "Contacts who were real and reachable but did not answer you.",
          "A campaign that sent everything it reserved and reached the contacts we found. Hard bounces inside that campaign are still refundable under section 4.",
          "An assignment document that was delivered and matched your brief, where the complaint is about your own view of the quality, the grade you were given, or the number a third-party detection tool produced. If the complaint is that the document lacks something the product page advertised, that is a defect and not this.",
          "A campaign you cancelled while it was sending normally, or a mailbox you chose not to reconnect after we told you it had dropped, where you are asking for money more than 30 days after the credits went back to your account. The credits still go back and stay usable, and inside those 30 days you can still take money instead. None of this applies to a campaign you cancelled because it was not working.",
          "Currency conversion charges and the fees your own bank adds on its side. You get back the full amount you paid us, in the currency you paid it, with nothing deducted for our payment processing costs or tax. What your bank charges to move the money is not ours to return.",
          "Anything already refunded once. We are not going to pay twice for the same charge.",
          "Credits used to send messages that you wrote or edited yourself and that broke our terms, for example spam or abuse. Before we refuse anything on this ground we will show you the exact messages and the log of when they were edited, and you can take the refusal straight to the grievance officer. Outreach that our own system wrote and sent is our responsibility, not yours, and we will never use this line against you for it.",
          "A penalty from your college or university over how you used an assignment document. That is between you and your institution, and section 6 explains it.",
        ] },
      { type: "paragraph", content: [
          "One thing that is not on that list: misuse. If we close your account because you broke our terms, we still return anything you paid for that we did not deliver. We do not keep money for work we never performed. We will also tell you exactly what we saw and show you the evidence, and you can dispute it with the grievance officer.",
          "We will not close your account, void your credits or refuse a refund because you raised a chargeback with your bank or filed a complaint against us. You are allowed to do both. We would just rather you talked to us first, because we can usually fix it faster.",
        ] },
    ],
  },
  {
    heading: "9. How to ask for a refund",
    id: "s9",
    blocks: [
      { type: "paragraph", content: [
          "Email admin@studojo.com from the address on your Studojo account, with \"Refund\" in the subject line. One email per issue is enough. There is no form, and you do not need to phrase it a particular way.",
        ] },
      { type: "numbered", content: [
          "Your order reference or payment ID, or the line from your bank statement showing the charge.",
          "The date and the amount you were charged.",
          "Whether you paid through Razorpay or Dodo Payments, if you know.",
          "Which product it relates to: outreach credits or an assignment.",
          "For a campaign problem: the campaign name or ID, and roughly when you noticed sending had stopped.",
          "For a duplicate charge: both payment references.",
          "For an assignment problem: the brief you submitted and the file you received.",
          "What happened, in a couple of plain sentences.",
        ] },
      { type: "paragraph", content: [
          "Screenshots help but are not required. If something on that list is missing, send the request anyway. We will ask for the one piece we need rather than reject the request for being incomplete.",
          "You do not need to argue a legal case or quote this policy back at us. Tell us what happened and we will work out which part applies. If your situation is one of the always refund cases in section 3, the payment ID on its own is enough.",
          "If you cannot get into the email on your account, write from any address and say so. We will verify you another way.",
          "Keep everything on the same email thread. Support runs out of one inbox, so that thread is the record of your request. Reply on it at any point to ask where things have got to.",
        ] },
    ],
  },
  {
    heading: "10. What we check, and how you can challenge us",
    id: "s10",
    blocks: [
      { type: "paragraph", content: [
          "Our previous policy said that Studojo's determination of whether a technical failure occurred was final. That was unfair, it is gone, and it is not coming back. We are not the final word on our own mistakes.",
          "So you know what is happening on our side, here is what we actually look at.",
        ] },
      { type: "bullets", content: [
          "The payment record, including whether the charge was captured or only authorised, confirmed against Razorpay or Dodo Payments.",
          "Your credit ledger: every grant, reservation, release and deduction, with timestamps.",
          "The campaign record: when it was created, how many credits it reserved, and what state it was in on each day.",
          "Your send log: every outreach email attempted, its timestamp, and its delivery result.",
          "For an assignment: the brief you submitted, the document we generated, when it was generated and delivered, and any fix or redelivery we attempted afterwards.",
          "Bounce events where we hold them, and the connection status of your connected mailbox, including the time of any disconnection where our logs record it.",
          "Our server and application logs covering the period you describe.",
        ] },
      { type: "paragraph", content: [
          "If those records contradict each other, or we simply cannot tell what happened, we decide in your favour. Missing records are our problem, not yours.",
          "If you ask, we will send you the records for your own account that we relied on, in a readable form. We put that pack together by hand, so allow up to 15 working days, and we will tell you in advance if it is going to take longer than that. If a record you asked for does not exist, we will say so plainly and decide the case in your favour.",
          "If you think those records are wrong or incomplete, say so and a different person will look again with fresh eyes and come back to you within 7 working days.",
          "We keep payment, credit, campaign and send records for at least three years from the date of purchase. The Consumer Protection Act 2019 gives you two years to bring a complaint, so we deliberately hold the records for longer than that. Something you raise in year two can still be checked against what actually happened rather than against anyone's memory.",
          "If we still disagree after a review, our position is only our position. It does not bind you. Section 12 sets out where you can take it.",
        ] },
    ],
  },
  {
    heading: "11. Timelines, and how the money comes back",
    id: "s11",
    blocks: [
      { type: "paragraph", content: [
          "Two of these are what Indian law requires of us. The rest are commitments we have set ourselves, and they are deliberately shorter. They cover our part of the process. Once the money leaves us, your bank sets its own pace.",
        ] },
      { type: "bullets", content: [
          "Acknowledgement of your request, from a person, on the same email thread: within 48 hours. This one is a legal requirement.",
          "A decision, with our reasoning in writing: within 7 working days of your first email. If we need anything else from you, we will ask for all of it in one message within 2 working days, and the clock pauses only for the days we are genuinely waiting on you. If we are waiting on Razorpay or Dodo Payments to confirm something, it can take up to 14 working days, and we will tell you that is the reason. Waiting on a processor never changes the answer, and it never pushes your complaint past the one month limit in section 12.",
          "The records pack, if you ask for it: up to 15 working days, because we assemble it by hand.",
          "Credits released back into your account: we aim for 2 working days from the decision. A person does this by hand, so it is not instant, and we will email you when it is done.",
          "An approved money refund started with the payment processor: within 3 working days of approval.",
          "Your complaint fully resolved and closed: within one month of the date you raised it. This one is a legal requirement, and it is a ceiling, not a target.",
        ] },
      { type: "bullets", content: [
          "Razorpay, Indian rupees, back to card, UPI or netbanking: normally 5 to 7 working days after we start it.",
          "Dodo Payments, international: normally 5 to 10 working days after we start it, plus whatever your own bank adds.",
          "Card refunds can take an extra statement cycle to appear. If it has not landed after that, come back to us and we will give you the refund reference to hand your bank.",
        ] },
      { type: "bullets", content: [
          "Refunds go back to the original payment method, in the original currency, through the processor that took the payment. We cannot redirect a refund to a different card, bank account or UPI ID just because you would prefer it somewhere else. The one exception is where the original card or account is closed and the processor cannot complete the refund. Tell us and we will agree another route with you, once we have checked you are the person who paid.",
          "You get back the full amount you paid, including any tax charged on it. We do not deduct payment processing fees from your refund.",
          "Exchange rates move. If you paid in a currency other than your bank's, the rate on the day of the refund may differ slightly from the day you paid. That is set by your bank and the card networks, not by us.",
          "We do not issue refunds as vouchers or store credit unless you ask for credits instead of money.",
        ] },
      { type: "paragraph", content: [
          "If we are going to miss one of our own timelines, we will tell you before the deadline passes, not after. If we miss one anyway, reply on the same email thread and say so. It goes to the grievance officer from there.",
        ] },
    ],
  },
  {
    heading: "12. Grievance officer and escalation",
    id: "s12",
    blocks: [
      { type: "paragraph", content: [
          "Indian law requires an e-commerce business to name a grievance officer and publish their contact details. Here are ours.",
        ] },
      { type: "bullets", content: [
          "Name: __GRIEVANCE_OFFICER_NAME__",
          "Designation: Grievance Officer, Studojo Labs Private Limited",
          "Email: admin@studojo.com, with GRIEVANCE at the start of the subject line",
          "Registered office: Studojo Labs Private Limited, __REGISTERED_OFFICE_ADDRESS__, Bengaluru, Karnataka, India",
        ] },
      { type: "paragraph", content: [
          "Grievances are handled over email, so there is a written record of what was said and when. Putting GRIEVANCE at the start of your subject line is what marks your email as a grievance rather than an ordinary support request, and the 48 hour clock below runs from the moment your email arrives, not from the next working day.",
          "A grievance is looked at independently of whoever handled your original request, and the grievance officer is not bound by that earlier decision.",
          "The grievance officer acknowledges your complaint within 48 hours of receiving it and resolves it within one month of the date you raised it. Those timelines come from the Consumer Protection (E-Commerce) Rules 2020, they apply to us whether or not you quote them, and we cannot extend them. One month is a hard limit, not a date we get to move. If a complaint is complicated we will keep you updated, and where part of it is already clear we will decide that part and pay it out rather than hold the whole thing back. If the month passes and your complaint is still open, that is our failure, and you can use any of the routes below straight away without waiting for us to finish.",
          "If the decision goes against you, you get the reason in writing, including which records we looked at.",
          "You can go to the grievance officer at any point. You do not have to exhaust normal support first.",
          "If you are still not satisfied, these routes are open to you and we are not going to pretend otherwise.",
        ] },
      { type: "bullets", content: [
          "The National Consumer Helpline, at consumerhelpline.gov.in.",
          "A consumer complaint filed online at e-daakhil.nic.in, with the District Consumer Disputes Redressal Commission where you live or work.",
          "Your card issuer or bank, through their dispute process.",
          "If your issue is with the payment itself rather than with us, start with the payment processor's own grievance channel. For rupee payments through Razorpay, and for any complaint about your Indian bank or card issuer, you can then go to the Reserve Bank of India's Integrated Ombudsman at cms.rbi.org.in, once 30 days have passed with no reply or if the reply did not satisfy you. That route covers entities the Reserve Bank regulates, so it does not reach international payments taken through Dodo Payments. For those, your card issuer's dispute process is the route that will take it.",
          "If you are outside India, the consumer protection body where you live. Using it does not affect anything in this policy.",
        ] },
      { type: "paragraph", content: [
          "We would genuinely rather you came to us first, because we can move faster than any of these can. But the choice is yours and you do not need our permission. We do not close accounts, cancel credits or withhold service because someone disputed a charge or filed a complaint.",
        ] },
    ],
  },
  {
    heading: "13. Your rights under the law",
    id: "s13",
    blocks: [
      { type: "paragraph", content: [
          "Nothing in this policy takes away a right you have under law. If anything written here conflicts with the Consumer Protection Act 2019, or with any other law that applies to you, the law wins, that part of this policy falls away, and the rest still stands.",
        ] },
      { type: "bullets", content: [
          "If a service we sold you was deficient, you are entitled to a refund under the Consumer Protection Act 2019. A non-refundable label on a product page does not change that, and we will not argue that it does.",
          "Failed and duplicate rupee payments taken through Razorpay have to be reversed under Reserve Bank of India rules. For international payments taken through Dodo Payments, the same principle applies through the card networks. No refund policy, ours included, can block either.",
          "We do not make ourselves the final judge of whether our own service failed. Section 10 sets out what we look at and how you can challenge it.",
          "Nothing here asks you to give up your right to complain to a consumer commission, and any clause that appeared to do so would not be enforceable anyway.",
          "If you are outside India, the consumer rights you have where you live apply on top of this policy, not instead of it. That may include a cancellation or cooling off right we do not offer here, for example the 14 day right on online purchases in the UK and the EU. If you have one, you do not need to argue it with us. Email admin@studojo.com, tell us where you live and that you are cancelling, and we refund as money through the processor that took your payment. Where the service has already partly run, we charge only for what was actually delivered, worked out the same way as section 4.",
          "We have tried to write this so you never need to fall back on any of that. But it is your right, and we would rather tell you about it than hope you never find out.",
        ] },
    ],
  },
  {
    heading: "14. Governing law and where disputes are heard",
    id: "s14",
    blocks: [
      { type: "paragraph", content: [
          "This policy is governed by the laws of India.",
        ] },
      { type: "paragraph", content: [
          "For any dispute that is not a consumer dispute, the courts at Bengaluru, Karnataka have jurisdiction.",
        ] },
      { type: "paragraph", content: [
          "For a consumer dispute, you keep the choice the law gives you. Under the Consumer Protection Act 2019 you may file where you live, where you work for gain, or where we carry on business. We will not argue that you were required to come to Bengaluru, and we are not going to use jurisdiction to make a complaint too expensive to bring.",
          "If you are outside India, you can raise the matter with us here or use the consumer protection route available where you live. Both are open to you.",
        ] },
    ],
  },
  {
    heading: "15. Changes to this policy, and how to reach us",
    id: "s15",
    blocks: [
      { type: "paragraph", content: [
          "We will update this policy when the product changes or when the law does. When we do, we change the version and the date below, and we email account holders about anything that reduces what you can claim.",
          "The version in force on the day you paid is the version that governs that purchase, unless a newer version is better for you, in which case you get the newer one. A change we make later will never be used to cut down what you were already owed.",
        ] },
      { type: "bullets", content: [
          "Support and refund requests: admin@studojo.com",
          "Grievance officer: admin@studojo.com, with GRIEVANCE at the start of the subject line",
          "Entity: Studojo Labs Private Limited, Bengaluru, Karnataka, India",
          "Website: studojo.com",
        ] },
      { type: "paragraph", content: [
          "Version 2.0. Last updated and effective from 15 September 2026. It replaces every earlier refund policy published on studojo.com.",
        ] },
    ],
  },
];

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "bullets" || b.type === "numbered") {
          const List = b.type === "numbered" ? "ol" : "ul";
          const marker = b.type === "numbered" ? "list-decimal" : "list-disc";
          return (
            <List
              key={i}
              className={`${marker} space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base`}
            >
              {b.content.map((c, j) => (
                <li key={j}>{c}</li>
              ))}
            </List>
          );
        }
        return (
          <div key={i} className={i > 0 ? "mt-4" : undefined}>
            {b.subheading ? (
              <h3 className="mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">{b.subheading}</h3>
            ) : null}
            {b.content.map((c, j) => (
              <p key={j} className={`font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base ${j > 0 ? "mt-3" : ""}`}>
                {c}
              </p>
            ))}
          </div>
        );
      })}
    </>
  );
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
              Version 2.0. In effect from 15 September 2026. Please read it before you buy.
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
                {POLICY.map((s) => (
                  <li key={s.id}>
                    {/* block + py-3 keeps the tap target at 44px on phones */}
                    <a
                      href={`#${s.id}`}
                      className="block py-3 underline decoration-neutral-400 underline-offset-4 hover:text-violet-600 hover:decoration-violet-500"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {POLICY.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                  {s.heading}
                </h2>
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <Blocks blocks={s.blocks} />
                </div>
              </section>
            ))}

            {/* Buttons */}
            <div className="flex flex-col gap-6 md:flex-row">
              <a href="mailto:admin@studojo.com" className="flex-1">
                <button className="flex w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 px-6 py-4 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                  Contact Support for Refund
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
