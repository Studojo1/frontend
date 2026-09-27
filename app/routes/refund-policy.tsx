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
          "One thing has changed in version 2.0 and it runs through the whole document. When something goes wrong, our first answer is to finish the job you paid for. We restart the campaign, we release the stuck credits, we rebuild the list, we fix the document. That is the default, because finishing the work is the thing you actually bought and it is usually faster than a refund. Money is the second answer, and it becomes available on a fixed clock that we cannot extend and nobody here can waive. Section 4 sets out that clock in full, including the exact moment your right to money starts. There are only ever two fix attempts on one campaign and 14 calendar days of fix time in total. Nothing in this policy lets us keep trying forever.",
          "Four things are never routed through any of that. A payment that failed, a double charge, a payment captured with no credits granted, and a charge you did not authorise are refunded in money, immediately, with no fix attempt in front of them. They are in section 3, which comes first because it outranks everything after it. Section 3 also carries the route for a campaign that stopped after delivering 10 percent or less of what you paid for. That one goes straight to money as well, with no window to sit through.",
          "If you are reading this because a campaign did not go the way you expected, start at section 4. That is where most of what you need is.",
        ] },
      { type: "bullets", content: [
          "Internship Dojo outreach credits, bought as a credit pack. Credits pay for finding hiring manager leads, looking up contact emails, and sending outreach from the mailbox you connect.",
          "Assignment Dojo, delivered as a document you download.",
          "Careers Dojo resume builder, which is free. There is nothing to pay, nothing to fulfil and nothing to refund. Section 8 sets out that carve out in full.",
        ] },
      { type: "paragraph", content: [
          "Payments in Indian rupees are taken through Razorpay. International payments are taken through Dodo Payments. A refund always goes back the way it came, through whichever of those two took your money. Whichever one is holding it, Studojo Labs Private Limited is the company you bought from and the company that owes you. A delay at a processor is ours to chase, not yours, and it never changes the answer you are entitled to.",
          "This version takes effect on 15 September 2026 and replaces every earlier refund policy on studojo.com. It also covers purchases you made before that date. You do not need an open request with us, and it does not matter that you never complained at the time. If an earlier version would have given you a better outcome on a particular point, you get the better one.",
        ] },
    ],
  },
  {
    heading: "2. The short version",
    id: "s2",
    blocks: [
      { type: "paragraph", content: [
          "The rest of this document is detailed because refunds deserve detail. Here is the whole thing, short.",
        ] },
      { type: "bullets", content: [
          "If something breaks, we fix it and finish the job. That is the default. You bought outreach that reaches real contacts, so our first move is to make that outreach happen.",
          "The fix is bounded, hard. One attempt per problem, two attempts on one campaign in total no matter how many different causes get named, and 14 calendar days of fix time in total. Several failures run on a shorter clock: 72 hours for a stalled campaign, 2 working days for stuck credits, 48 hours per attempt on a document.",
          "When the clock runs out and it is still not working, your right to money starts on its own. You do not need our approval and nobody at Studojo can extend it or trade it for anything. We do not run a watcher over every campaign, so the reliable way to collect it is one line back on your email thread. We will not make you argue for it.",
          "You can also decline the fix. If the service was already failing and you would rather have the money, saying so starts your right to money there and then. You never sit out a window you turned down.",
          "That clock never runs from the day you paid. It runs from the end of the fix window, or from the point finishing became impossible, whichever comes first.",
          "Four things are always refunded in money, immediately, with no fix first: money that left your account on a payment that never completed, a double charge, a payment where the credits never reached your account, and a charge you did not authorise. There is nothing to fulfil in any of them.",
          "Those four are a floor, not the full list. They are not the only way to get your money back, and section 3 is not a closed set.",
          "A campaign that stopped after delivering 10 percent or less of the emails it reserved credits for also goes straight to money, with no window in front of it. Four sent out of 200 is the same thing as zero sent out of 200. We will not hold you in a fix loop over a handful of emails.",
          "Credits are reserved from your balance in full the moment a campaign is created. Reserving is not using. A credit only counts as used once an email has actually been accepted by the receiving server at the contact's end.",
          "Putting credits back on your balance is a fix, not a payment. It does not settle what we owe. If the outreach you paid for still never gets sent, the money is still on the table.",
          "If we cannot produce a send log for your campaign, we treat the number sent as zero and refund in full. Proving delivery is our job, not yours.",
          "A campaign is scheduled at about 20 emails a day. A trickle counts as a stall: fewer than 30 sends in any 72 hour period means the campaign is failing, whatever the reason and whatever the cause is called.",
          "A campaign that has not finished by double its scheduled length plus 7 days, and in no case later than 60 days after it was created, is late. The money for whatever is undelivered is owed at that point, even if it has been trickling emails out the whole time.",
          "Assignment Dojo: cancel any time before the document is generated for a full refund. After delivery we fix defects free, two attempts, 48 hours each. Then money.",
          "We do not refund outcomes. We send the emails. We do not control who replies. Targeting is different, because targeting is a delivery promise.",
          "Some of this runs by hand rather than automatically. Credits that should come back to your balance are put back by a person on our side, and bounce rates are checked by a person when you ask. Tell us and we will do it.",
          "We are not the final judge of our own mistakes. You get the records, and you get an escalation route. We acknowledge within 48 hours, decide within 7 working days, and close everything inside one month.",
          "Nothing here shortens the two years the law gives you to bring a complaint. Every window in this policy is a request that helps us investigate, never a cut off for your rights.",
        ] },
    ],
  },
  {
    heading: "3. Cases where money goes back with no fix first",
    id: "s3",
    blocks: [
      { type: "paragraph", content: [
          "This section comes first because it outranks everything after it. Nothing later in this policy, and no non refundable label anywhere else on Studojo, limits any of these.",
          "There is nothing worth fulfilling in these cases. No campaign that can honestly be called running, no document to regenerate, no list worth rebuilding unless you ask for it. So we do not route them through a fix, we do not open a window, and we do not offer you credits instead. The money goes back.",
        ] },
      { type: "subsection", subheading: "The four that are never conditional on anything", content: [
          "These four are refunded in money, immediately, in every case. They are not discretionary, they are not subject to the fix clock in section 4, and the first two are governed by rules that no merchant policy can displace.",
        ] },
      { type: "numbered", content: [
          "Money left your account but the payment never completed. For rupee payments taken through Razorpay, the Reserve Bank of India's turnaround time rules require a failed transaction to be reversed, and no merchant policy can override that. For international payments taken through Dodo Payments, the same principle applies through the card networks. Tell us either way. We check our own payment records, chase the processor on your behalf, and stay on it until the money is back with you. If our records show the money did reach us, we refund it ourselves rather than send you away to a processor. If a rupee reversal is late under the Reserve Bank of India rules, we will tell you how to claim the compensation those rules provide.",
          "You were charged twice for the same purchase. We refund every extra charge in full. Send us the two payment IDs and that is all we need. There is nothing to fulfil on a duplicate charge, because you only ever wanted one of them.",
          "Your payment was captured and the credits were never granted to your account. That is a payment for nothing, so we refund you in full. We will not ask you to accept the credits instead, and we will not treat granting them late as a substitute for the refund. If you would rather we granted the credits you paid for and carried on, we will do that, usually the same day, but that is your call to make and not ours, and taking the credits does not stop you asking for the money afterwards.",
          "A charge you did not authorise. Tell us and we pull the payment record and the account activity around it ourselves. You are not asked to prove a negative. If what we find does not clearly show that you authorised the charge, or if the records are unclear, contradictory or missing, we refund it. We never put an unauthorised charge through a fix attempt, because delivering a service nobody ordered is not a remedy.",
        ] },
      { type: "paragraph", content: [
          "Those four are a floor, not a ceiling. Read them as the minimum this policy guarantees, not as the only refunds we give. If a service we sold you was deficient or late, you are entitled to a refund whether or not it looks like one of these four, and section 4 sets out exactly how that works. Section 14 sets out the rights you have under law whatever this document says.",
        ] },
      { type: "subsection", subheading: "Money also goes back with no fix first here", content: [
          "The same applies to all of these. We can see each one in our own records, so we are not going to make you build a case for it.",
        ] },
      { type: "bullets", content: [
          "A campaign that stopped and has delivered 10 percent or less of the emails it reserved credits for. Stopped means it managed fewer than 30 sends in any 72 hour period while it was supposed to be running, which is less than half the roughly 20 emails a day it is scheduled at. Sending nothing at all counts, and so does a trickle. That includes a campaign that never sent a single email, and it includes a campaign that managed a handful of sends and then died. A campaign that barely started is in the same position as one that never started, and we are not going to hold you in a fix window over four emails when we already agree that four emails gave you nothing. There is a version of this we can fix, by getting the campaign sending so it delivers what you paid for, and if that is what you want, say so and we will do it inside the window in section 4. You do not have to take that. Ask for money and you get money, in full, for that campaign's reserved credits, without sitting through any window. If you cancelled the campaign yourself it changes nothing, because a campaign that delivered almost nothing was never working.",
          "You were charged for something we list as free, including the Careers Dojo resume builder. Full refund of everything charged.",
          "You were charged an amount different from the price shown at checkout. We refund the difference, or the whole payment if you would rather cancel.",
          "You were charged after you cancelled, or charged again for a pack that had already been refunded.",
          "Someone at Studojo made you a written promise this policy does not honour. Send us the message. We honour the promise or we refund you in full.",
        ] },
      { type: "paragraph", content: [
          "For everything in this section the payment ID on its own is enough, and for a campaign that stopped at 10 percent or less, the campaign name on its own is enough. If we spot one of these ourselves we act on it without waiting for you to ask. We do not run a standing sweep looking for them, so the reliable route is one email to admin@studojo.com, and we will not make you justify it once it is there.",
        ] },
    ],
  },
  {
    heading: "4. Fix first, and the exact moment money is owed",
    id: "s4",
    blocks: [
      { type: "paragraph", content: [
          "This is the part that changed in version 2.0, so it is written out in full rather than summarised.",
          "When you pay us for outreach, what you are buying is emails that reach real contacts. When something breaks, the thing most people actually want is for those emails to go out. A refund returns you to zero with nothing sent and nothing applied to. So our first answer is to finish the job rather than to hand the money back and leave you where you started, and we start on it as soon as you tell us.",
          "That promise is only worth something if it has an end. A company that says it will keep trying, with no deadline, has really said nothing at all, and we are not going to write that and call it a policy. So the fix runs on a fixed clock, with a fixed number of attempts, and a hard cap on both. When the clock runs out, your right to money starts by itself. It does not depend on us agreeing, it is not a favour, and nobody here can extend it or trade it for anything.",
          "You can also just say no. If something has gone wrong and you would rather not wait for a fix, tell us. We will ask you once whether you want us to finish it, because it is usually the faster route, and if you say no that is the end of it. Turning down a fix on a service that was already failing is not a cancellation, it is not a change of mind, and it is never held against you. It also does not cost you any time: saying no is itself one of the moments below at which the money becomes owed.",
          "While a fix attempt is open, nothing you are owed shrinks and no window in this policy runs against you.",
        ] },
      { type: "subsection", subheading: "What finishing the job actually means", content: [
          "These are the fixes we have. We are not going to invent a new one at the moment you ask for your money.",
        ] },
      { type: "bullets", content: [
          "A campaign that stalled: we restart it and it sends the emails you paid for, at the rate it was scheduled at.",
          "Credits stuck after a failed send: we release them by hand so they can be spent.",
          "Targeting that missed: we rebuild the list and run the remaining sends to contacts that match what you set up.",
          "An assignment document with a defect: we regenerate it or we fix it.",
          "A mailbox that disconnected: we help you reconnect and the campaign resumes.",
        ] },
      { type: "paragraph", content: [
          "The unit of that promise is the outreach you paid for being sent to real contacts. It is not a campaign object reaching some final state in our database. A campaign marked complete that sent 40 of your 500 emails has not been fulfilled, we will never describe it to you that way, and we will not treat it as though it has been.",
        ] },
      { type: "subsection", subheading: "The scheduled rate, and the two tests you can run yourself", content: [
          "A campaign sends about 20 outreach emails a day from the mailbox you connect. That is the rate it is scheduled at, and it is the number every test in this policy is measured against. Your scheduled length is the number of emails the campaign reserved credits for divided by 20, rounded up. A 200 email campaign is scheduled at 10 days. A 500 email campaign is scheduled at 25 days.",
          "The stall test. Open your send log and count the sends in the last 72 hours. Twenty a day means 60 in 72 hours, so fewer than 30 is less than half the rate you paid for. Fewer than 30 sends in any 72 hour period while the campaign is supposed to be running means it is stalled, whether the count is zero or twenty nine. A trickle is a stall. We are not going to point at one email every other day and tell you the campaign is running.",
          "The fix test. Count the sends in the 72 hours after we tell you the fix is in. At least 50 new sends means it worked, because that is roughly the 20 a day the campaign was scheduled at. Fewer than 50 means it did not work, and the money for the undelivered portion is owed. If fewer than 50 emails were left to send at all, the test is simply whether the campaign finished.",
          "It also has to stay fixed. If the campaign drops back under 30 sends in any 72 hour period within 14 days of the restart, that is the same problem coming back. No new window opens and the money for whatever is still undelivered is owed.",
          "A timestamp is not a test. New activity after the day you told us proves nothing on its own, and we will never use a handful of scattered sends as evidence that your campaign was fixed.",
        ] },
      { type: "subsection", subheading: "The fix window: one attempt per problem, two per campaign, 14 days of fix time at the outside", content: [
          "The window opens the moment you tell us something is wrong, or the moment we notice it ourselves, whichever comes first. Telling us means an email to admin@studojo.com. There is no form and no particular wording.",
          "We get one attempt per problem. One restart, one list rebuild, one manual credit release, and two regeneration attempts on an assignment document. Not an unlimited number, and not a fresh attempt every time the same thing breaks again.",
          "The outer limit on a single attempt is 7 calendar days. Inside that, sending has to be back at its scheduled rate and we have to be able to show you the sends. Several failures have a shorter clock than 7 days, and where a shorter one applies, the shorter one wins.",
          "The window runs once per problem. It does not reset because we tried something and it did not work, and it does not reset because a new person picked up your email. If we fix the first thing and a second, different thing breaks, tell us and we will fix that too.",
          "But there are only ever two fix windows on one campaign in total, whatever we call the causes. Stall, mailbox, targeting, outage, supplier: the labels do not matter and they do not buy us a third go. On the third failure of any kind there is no window at all, and the money for anything undelivered is owed from the moment it fails. Two problems is the whole allowance.",
          "We also do not get to decide that a recurring failure is a new problem. Where it is arguable whether something is the same fault coming back or a genuinely different one, it counts as the same fault, no new window opens, and the money is owed. Relabelling a cause never buys us more time, and you will never have to argue with us about whether your second stall was really the same stall.",
          "And whatever the sequence of failures, we get 14 calendar days of fix time on one campaign in total. That is counted from the first time you told us something was wrong, and it keeps counting while any window is open. The only days that do not count towards it are days when the campaign was running at its scheduled rate with nothing outstanding from us. Pauses sit inside the 14 days, never on top of them. When the 14 days are used up, the money for anything still undelivered is owed automatically, on exactly the same basis as every other clock in this section. The same 14 day cap applies to an assignment document, counted from your first email about it.",
          "If we need something from you, for example reconnecting your mailbox, we will ask for all of it in one message within 2 working days. The window then pauses for the days we are waiting on you, up to a maximum of 5 calendar days in total across the whole request, and no further. It never pauses for anything we could have got from our own records, and if we did not ask for it in that one message, it does not pause at all. A pause never delays the 14 day cap, the lateness backstop below, the 48 hour acknowledgement, the 7 working day decision, or the one month limit in section 13. It does not pause because we are busy, and it does not pause because we are waiting on Razorpay or Dodo Payments. That is our problem to manage.",
          "That is the whole of it. There is no third window, no extension, no internal review stage that buys us more time, and no escalation on our side that puts your clock on hold.",
        ] },
      { type: "subsection", subheading: "Every clock in one place", content: [
          "Each of these runs from the moment you tell us, or from the moment we notice it first.",
        ] },
      { type: "bullets", content: [
          "Stalled campaign, meaning fewer than 30 sends in any 72 hour period while it is supposed to be running, including none at all: we get 72 hours to have it sending at its scheduled rate again, measured by the fix test above.",
          "Credits stuck after a failed send: we get 2 working days to release them by hand.",
          "Targeting that missed: we get 7 days to rebuild the list and have corrected sends going out.",
          "Mailbox disconnected: sending resumes as soon as you reconnect, and no clock runs against you for the time it was down.",
          "Defective assignment document: 48 hours per attempt, two attempts in total.",
          "Anything else that stops you getting what you paid for: 7 calendar days.",
          "A campaign running materially behind the schedule we published, even if it has never stopped: that is late against our own schedule, so tell us and the ordinary 7 day window applies to getting it back on rate. After that the money for whatever is still undelivered is owed.",
          "The same problem happening a second time on the same campaign: no window at all. We had our attempt.",
          "A third failure of any kind on the same campaign, whatever the causes were called: no window at all.",
          "14 calendar days of fix time used up on one campaign or one document: no window at all, whatever has happened in between.",
          "A campaign that stopped at 10 percent or less delivered: no window at all. That is a section 3 case and the money is owed from the moment you tell us.",
          "A campaign that has not finished by double its scheduled length plus 7 days, or by day 60 after it was created, whichever comes first, unless you stopped it yourself while it was sending at its scheduled rate: no window at all, and nothing required from you. The money for whatever is undelivered is owed, whatever the cause of the delay, even if it has been trickling emails out the whole time. A 200 email campaign is scheduled at 10 days, so it is late at day 27. Day 60 is the outer limit for the largest packs, not the standard wait, and it is a backstop we apply on our own initiative rather than the day your campaign first counts as late.",
        ] },
      { type: "subsection", subheading: "The exact moment your right to money starts", content: [
          "Your right to a refund of the undelivered portion, in money, starts automatically at the earliest of the moments below. It becomes yours at that instant, whether or not we have written to you, and whether or not we agree it has happened.",
        ] },
      { type: "numbered", content: [
          "The moment we tell you we cannot complete the service. If that is true we will say it in writing rather than let it drift.",
          "The moment you tell us you do not want a fix attempt, on a service that had already failed. Turning down a fix starts your right to money there and then. You do not wait out a window you refused, we do not run one in the background so we can point at it later, and the days left on it are never a reason for us to hold your money. We may tell you once that finishing the job would usually be faster, and then we pay.",
          "The moment it becomes clear the service cannot be completed, whether or not we have said so. A campaign that can no longer run, a document we cannot generate, a list we cannot rebuild.",
          "The moment your campaign has stopped and delivered 10 percent or less of the emails it reserved credits for. That is a section 3 case. The money is owed from the moment you tell us, for the whole of that campaign's reserved credits, and there is no window in front of it.",
          "The end of the applicable window above, if the thing is not working by then. Seven calendar days at the outside for a single attempt, 72 hours for a stall, 2 working days for stuck credits, 48 hours and two attempts for an assignment document.",
          "The moment the same problem happens a second time on the same campaign, including a campaign that drops back under 30 sends in 72 hours within 14 days of a restart. You do not sit through a second attempt on a fault we have already had a go at.",
          "The moment a third failure of any kind happens on the same campaign, whatever the causes are called, or the moment a second fix window ends without the campaign running at its scheduled rate. Two problems is the whole allowance, and we will not argue about whether the third one was really a new problem.",
          "The moment we have used up 14 calendar days of fix time on that campaign or that document, counted from your first email and across every window, however many separate things went wrong.",
          "Double your campaign's scheduled length plus 7 days, or day 60 after it was created, whichever comes first, if it has not finished and you did not stop it yourself while it was sending at its scheduled rate. A campaign sends about 20 emails a day, so a 200 email campaign is scheduled at about 10 days and the money is owed at day 27. Waiting longer than that for something you already paid for is not reasonable and we are not going to ask you to. We are also not going to apply a 500 email deadline to a 200 email campaign.",
          "The moment waiting for us to finish stops being any use to you. If the outreach was tied to an application deadline, a term date, a visa date or any other date that mattered, the window closes on your date rather than on ours, and the money is owed from then. You can tell us that date at any point, including in the same message where you ask for the money, and including after the date has already passed. We will not refuse this because you did not mention it in your first email. We are not going to hold you to a window that is useless by the time it ends.",
          "The moment it is clear we cannot produce records showing the service was delivered. If there is no send log, we treat the number sent as zero and refund in full. Missing records count as not delivered, and that is our problem rather than yours.",
        ] },
      { type: "paragraph", content: [
          "The four unconditional cases in section 3 do not run through that list at all. They are owed in money from the moment you tell us, with no window and no fix attempt in front of them.",
          "Automatic means automatic. The right is yours at that instant, whether or not anyone here has noticed it, and whether or not we agree it has happened. We should be straight with you about what that means in practice. We do not run a watcher over every campaign, and nobody here gets an alert when your window expires. So the reliable way to collect is one line back on the same email thread saying the window has run out. That is all it takes. We will not make you build the case again, we will not ask you to justify it, and we will not treat the gap before you wrote in as a reason to reopen the question. Where we do spot it first, we start the refund without waiting for you.",
          "We start it with the processor within 3 working days. If we can see before the window is up that we are not going to manage it, we stop and pay then. We do not use up the days for the sake of it.",
          "From that moment the remedy is money. It is not credits, it is not a goodwill gesture, and it is not a decision we take case by case.",
          "Two things this clock is not. It is not counted from the day you paid. A 500 email campaign takes about 25 days to run, so a clock that started at purchase would quietly burn through most of itself while the product was still doing its job. It runs from the end of the fix window, or from the point finishing became impossible, whichever comes first.",
          "And it is not a deadline for you. If the window closes and you do not get round to emailing us for a month, or six months, the right is still yours. Section 14 sets out the two years the law gives you to bring a complaint, and nothing in this policy is shorter than that.",
        ] },
      { type: "subsection", subheading: "Credits back on your balance is a fix, not a payment", content: [
          "This is the one place where fix first could be turned against you, so we are naming it rather than leaving it to be discovered.",
          "When we release credits back onto your balance, we have given you store credit. We have not given you your money. Store credit does not settle a debt for a service you paid cash for and never received, and we are not going to pretend that it does.",
          "So releasing credits never closes the matter on its own. It is us making sure you can still send the outreach you paid for. If that outreach still does not get sent, the money is still available, valued at the price you actually paid per credit. That is true whether the credits went back yesterday or three months ago, and it is true even if you accepted the credits at the time. If anyone at Studojo tells you a topped up balance has closed the matter, they are wrong, and the grievance officer in section 13 will say so.",
          "There is one narrow case where credits are the normal answer rather than money. You cancelled a campaign that was sending at its scheduled rate, or you disconnected your mailbox yourself, from inside Studojo, while it was sending at its scheduled rate. Nothing failed there, so there is nothing for us to fulfil and nothing we did wrong. The credits go back and stay usable, and if you would rather have money you can ask within 30 days of them landing in your balance. Section 5 sets out how narrow that case is.",
          "Everywhere else, when you ask for money, you get money.",
        ] },
      { type: "subsection", subheading: "What you can check yourself at every step", content: [
          "None of this should have to be taken on trust. Every step above leaves a mark you can look at in your own account, so you can work out where you stand without arguing with anyone.",
        ] },
      { type: "bullets", content: [
          "Whether your campaign is failing: your send log. Count the sends in the last 72 hours. Fewer than 30 means it is stalled, whatever else it looks like and however recent the last timestamp is.",
          "Whether the fix worked: the same send log. The test is the rate, not the existence of a timestamp. At least 50 new sends in the 72 hours after we tell you the fix is in, which is roughly the 20 a day you paid for, means it worked. Fewer than 50 means it did not, and the money is owed.",
          "Whether credits were released: your credit balance. We email you when a person does it by hand, and the balance moves the same day.",
          "Whether the window has run out: the date on your own email to admin@studojo.com. That is when it opened. Count from there, and count 14 calendar days of fix time for the outside limit. The only days that do not count towards those 14 are days when the campaign was running at about 20 a day with nothing outstanding from us.",
          "Whether a campaign is late: the campaign creation date in your account and the number of emails it reserved. Divide by 20 and round up for the scheduled length, double it, add 7 days, and stop at 60.",
          "Whether the list was rebuilt: ask us for the contact list with your targeting settings next to it, and we will send it.",
          "Whether an assignment fix landed: the file we sent you against the brief you submitted.",
          "If any of those records do not exist, or we cannot produce them, the point is decided in your favour. Section 11 sets out how that works.",
        ] },
    ],
  },
  {
    heading: "5. Outreach credits: reservation is not delivery",
    id: "s5",
    blocks: [
      { type: "paragraph", content: [
          "Read this part even if you skip the rest. It is the part most people get caught by.",
          "When a campaign is created, the system reserves the full number of credits for that campaign immediately, before a single email is sent. It does not take one credit each time an email goes out. It takes all of them on day one, and then the campaign sends about 20 emails a day from the mailbox you connect until it is done. A 500 email campaign is scheduled to take about 25 days.",
          "So the credit balance in your account is not a record of what we delivered. If your campaign stopped on day two, your account can read zero while only a handful of emails ever left your mailbox.",
          "Under this policy that gap has a name. It is the part of the job we still owe you. Reserving credits is us taking payment. Sending the emails is us delivering. Everything in section 4 is about closing that gap, either by sending what is outstanding or by paying it back in money.",
          "One more thing you should know up front. Credits that stop being needed are not put back automatically. Today a person on our side releases them by hand. Nothing is lost if your balance does not move on its own, but you do need to tell us so we can put it back.",
          "Our old policy treated reservation as use and said no refund was owed on that basis. That was the worst thing in it. It is gone. Delivered emails are the thing you paid for.",
        ] },
      { type: "subsection", subheading: "What counts as a used credit", content: [
          "A credit is used when an outreach email has actually been accepted by the receiving server at the contact's end. Handing it to the mailbox you connected is not enough. If the receiving server rejected it, or if our records cannot show that it was accepted, the credit is not used. That is the only test, it is the same test section 9 uses, and where our logs do not record the far end result we treat the credit as unused.",
        ] },
      { type: "bullets", content: [
          "Credits reserved for emails that have not gone out yet are not used.",
          "Credits attached to sends that failed for a technical reason on our side are not used.",
          "Credits attached to emails that never went because the campaign was paused, cancelled or stopped are not used.",
          "Credits attached to emails that never went because your mailbox disconnected are not used.",
          "Credits attached to contacts we never actually found or enriched are not used. Neither are credits attached to contacts we did find and enrich, where no email was ever accepted at the other end. Finding a lead and looking up an address is work we do in order to get an email sent. It is not the thing you bought, we do not charge you for it on its own, and we will never tell you a credit was consumed at the enrichment stage.",
        ] },
      { type: "subsection", subheading: "Finish it, or take the money", content: [
          "For any undelivered portion there are two honest answers, and you pick.",
          "We finish it. The campaign restarts, the outstanding emails go out to real contacts at the scheduled rate, and you get the thing you bought. This is what we offer first, because for most people it is what they actually wanted.",
          "Or we pay it back in money, to the card, account or UPI ID that paid us. Once the right to money has started under section 4, this is yours on request and we will not push you towards credits, argue with you about it, or make you ask a second time.",
          "There is a third thing you can ask for, which is the undelivered credits released back to your balance so you can spend them on a different campaign. That one is available whenever you want it, but be clear about what it is. It is a fix, not a settlement. Taking credits back does not give up your right to the money later if the outreach still never goes out.",
        ] },
      { type: "subsection", subheading: "The one narrow case where credits are the default", content: [
          "If you cancelled a campaign that was sending at its scheduled rate, or you deliberately disconnected your mailbox while it was sending at its scheduled rate, the service was not deficient. It was working and you stopped it. There our default is to release the undelivered credits back into your account so they stay usable, and if you would rather have the money you can ask within 30 days of the credits landing back in your balance. We work it out the same way and nothing is deducted.",
          "That case is narrow on purpose. If you cancelled because the campaign had stalled, because it was managing fewer than 30 sends in 72 hours, because it was reaching the wrong people, or because you asked us for help and did not get it, that is not a voluntary cancellation. Money is the default, and pressing cancel is never used against you.",
          "We only treat a disconnection as deliberate where our records clearly show that you disconnected it from inside Studojo. An expired token, a permission your mail provider withdrew, a password change, a security review at your provider, or anything else that happened outside the Studojo interface is not a deliberate disconnection, however it appears in a log. Our records are often not clear on this, and where they are not, we treat it as our failure and money is the default. The same applies to cancellation. If the campaign was behind its scheduled rate or had stopped sending when you cancelled, we treat the cancellation as involuntary from the send log alone, and we will not ask you to explain why you pressed cancel.",
          "Where the campaign stopped because of us, money is available the moment the right to it starts under section 4, and there is no 30 day window at all.",
        ] },
      { type: "subsection", subheading: "How we work out what is owed", content: [
          "We pull your campaign send log and count the emails that were actually accepted at the other end. We compare that to the number of credits the campaign reserved. The difference is your undelivered portion, and we round it up in your favour to the next whole credit.",
          "If 10 percent or less of the campaign was delivered, the whole of that campaign's reserved credits come back in money, not just the undelivered share. A campaign that barely started has not given you anything usable, and we are not going to argue over small numbers. If that campaign used your whole pack, that is the whole pack. If it did not, the paragraph below covers the rest of your credits.",
          "If we cannot produce a send log for your campaign, we treat the count as zero and refund in full. The burden of proving delivery is ours.",
          "If your pack covered more than one campaign, we only look at the campaign that failed when we work out what is owed on that campaign. The rest of your credits stay in your account and keep working. But if you would rather stop using the product altogether after we failed you, say so and we refund the untouched credits in money as well, at the same per credit value, with nothing deducted. You have 30 days from the day the failed campaign's refund became owed to ask for that. The 30 day change of mind window measured from purchase has nothing to do with it, because the reason you are leaving is us and not a change of mind, and where our failure is what stopped you using those credits no window runs on them at all.",
        ] },
      { type: "subsection", subheading: "A worked example", content: [
          "Say your pack covers 500 outreach emails and you paid 2,000 rupees for it. Those numbers are here to show the maths. They are not our price list, and your own pack size and price are on your receipt.",
          "Your campaign sends 60 emails and then stalls. You check your send log, count fewer than 30 sends in the last 72 hours, and tell us. If we get it back to about 20 a day within 72 hours, so at least 50 more emails go out in that time, it finishes, those remaining 440 emails go out, and nothing is owed, because you got what you paid for. If we do not, your right to money starts at the 72 hour mark. 60 out of 500 is 12 percent delivered, so 88 percent is undelivered, and the refund is 1,760 rupees in money.",
          "If it had stalled after 30 emails, that is 6 percent, which is inside our 10 percent line. You do not sit through any window at all. That one is a section 3 case: ask and the whole 2,000 rupees comes back in money. The same is true if it had stalled after 4 emails, or after none.",
          "No admin fee, no processing deduction, no restocking charge, no cancellation fee. We do not have those and we are not going to invent them at the moment you ask for your money.",
        ] },
      { type: "subsection", subheading: "What one credit is worth", content: [
          "We value each credit at what you actually paid for it: the price of your pack divided by the number of credits in it.",
          "If you bought during an offer, we use the offer price, because that is the price you paid. We will not refund at a lower rate by pretending you paid list price.",
        ] },
      { type: "subsection", subheading: "Credits you have not used yet", content: [
          "Credits that have never been attached to a campaign can be refunded as money within 30 days of purchase. Any reason, or no reason. You do not have to explain. That window is a change of mind option on credits that still work, and nothing else. It has no bearing on a service we failed to deliver, and it never shortens anything in section 4.",
          "Credits released back into your account after you cancelled a campaign that was sending at its scheduled rate, or after you disconnected your mailbox yourself while it was sending at its scheduled rate, count as unused credits from the day they are released. The 30 day money option on them runs from the day they land back in your balance, never from the day you bought them.",
          "Credits released after a campaign that failed are a different thing entirely. No window runs on those at all. They sit in your balance as a fix, the money for outreach that was never sent stays available for as long as the law gives you to claim it, and accepting the credits at the time gives up nothing. If anyone here applies a 30 day limit to credits released after a failure, they are wrong, and section 4 governs.",
          "After 30 days credits stay in your account and keep working. Credits do not expire today. If we ever introduce expiry, we will email you at least 30 days before it starts, and it will not apply to credits you had already bought.",
          "That 30 day change of mind window does not run at all if the reason you could not use your credits was on our side. A broken account, locked credits, campaign creation failing, credits never granted, a campaign of ours that failed, or nobody answering you when you asked for help. In those cases there is no window. Tell us whenever you notice and we will look at the records.",
        ] },
      { type: "subsection", subheading: "Contact data and bounces", content: [
          "We find leads and look up contact emails through third party data sources. Some of those addresses will be out of date or wrong. That is true of every contact data source, including ours, and we do not promise a perfect list.",
          "There is still a floor. Where our records show an email failed because the address itself was invalid or rejected by the receiving server, that outreach reached nobody. What you bought was outreach that reaches a real person. The fix is that we release that credit back by hand so the send can go to someone real. That is a manual step on our side today, so tell us, and we will go through the bounce log with you line by line.",
          "If more than 20 percent of the emails sent in a single campaign hard bounced, the list we gave you was bad rather than unlucky. The fix there is that we rebuild the list and run the remaining sends. We check bounce rates by hand rather than automatically, and nothing on our side alerts us when a campaign starts bouncing, so if your campaign looks like it is bouncing, email us and we will pull the bounce log and act on what it shows.",
          "Either fix is bounded like everything else. If a bounced credit is not released within 2 working days of you telling us, or a list rebuild is not producing sends at the scheduled rate within 7 days, the money for that portion is owed under section 4, at any bounce rate. If a rebuilt list bounces the same way, that is a second failure on the same campaign, and the whole campaign is refundable in money at that point rather than only the bounced part.",
        ] },
      { type: "subsection", subheading: "What we do not promise", content: [
          "We do not promise replies, interviews or offers. We find contacts and send emails from the mailbox you connect. What a hiring manager does next is not in our control, and a campaign that ran properly but got a quiet response is not a refund case.",
          "Targeting is a different thing. Targeting is a delivery promise, not an outcome. Every email that went to a contact outside the role, industry or location you set up is outreach you did not buy, however few of them there are, and the money for those sends is owed under section 4 at any proportion. Where more than half the contacts a campaign emailed miss your targeting, the list itself was wrong rather than imperfect, and the whole campaign is refundable in money rather than only the mismatched part. The fix in either case is that we rebuild the list and run the remaining sends to contacts that match, once, inside 7 days, because that is the result you were after. If we cannot rebuild it, or the rebuilt list misses the same way, the whole campaign is refundable in money.",
          "You do not have to count the mismatches yourself. Ask us and we will send you the contact list with your targeting settings next to it.",
          "If anyone at Studojo told you in writing that you would get interviews or a job, send us that message and we will refund you in full. We would rather pay that out than have it said we sold you a result.",
        ] },
    ],
  },
  {
    heading: "6. When the failure is ours",
    id: "s6",
    blocks: [
      { type: "paragraph", content: [
          "These are real failure modes in our own system, not hypotheticals. We are naming them because you should not have to prove that a known fault happened to you.",
          "Each one is written the same way: what the fix is, how long we get, and what happens when that time is up. In all of them the fix starts without you having to push. Once the money is owed, it is owed on everything that was not delivered, counted from the send log and from nothing else. We do not deduct for work we did that never produced a delivered email, we do not deduct fees, and the 10 percent line in section 5 still applies, so a campaign that barely ran comes back in full rather than proportionally.",
        ] },
      { type: "subsection", subheading: "Payment taken, credits never granted", content: [
          "Send us your payment ID. We check the payment record against your account's credit history. If the grant is missing, this is one of the four unconditional cases in section 3, so the money is available immediately with no fix step in front of it. If you would rather we granted the credits and carried on, we will, but that is your choice to make and not ours.",
        ] },
      { type: "subsection", subheading: "Campaign created, and barely anything sent", content: [
          "The campaign exists, the credits were reserved, and either no email ever left your mailbox or it managed a handful and stopped. This is a real failure mode and we are not going to be coy about it.",
          "If the campaign has delivered 10 percent or less of the emails it reserved credits for, this is a section 3 case. Ask for the money and you get a full refund of that campaign's reserved credits, in money, with no window to sit through. Four sent out of 200 is treated exactly the same as zero sent out of 200, because for you they are the same thing.",
          "The fix is that we get it sending, and if that is what you want, say so and we have 7 days to have emails going out at the scheduled rate. That is your call and not ours, and you can switch to the money at any point without waiting for us to try.",
          "There is no time window on this one beyond the limitation periods the law sets. A campaign that delivered almost nothing was never working, so cancelling it yourself does not change the answer.",
        ] },
      { type: "subsection", subheading: "Your mailbox disconnected during a campaign", content: [
          "Outreach is sent from your own mailbox, the one you connect to Studojo. That connection can drop while a campaign is running, and when it drops, sending stops.",
          "The fix is reconnection. You reconnect, the campaign resumes from where it stopped, and the outstanding emails go out. We will help you do it on the same email thread.",
          "We will be honest about where we are today. Our alerting on this is not reliable, so you can lose days without being told. We are working on it, and until it is fixed you carry none of the cost.",
          "If your campaign stopped because the connection dropped and nobody told you, no clock has been running against you. The undelivered portion is refundable in money whenever you notice, and there is no deadline on that. Our silence is not a clock we get to run against you.",
          "If we did tell you and you reconnect, sending resumes and nothing else changes. If we told you and you would rather stop there, what you get depends on why the connection dropped, not on the fact that we sent you a notice. Where our records clearly show that you disconnected it yourself from inside Studojo, the credits go back and the 30 day money option in section 5 applies. Where our records do not clearly show that, and often they do not, the disconnection counts as our failure: the undelivered portion is refundable in money, no 30 day window applies to it, and the only limit is the two years in section 14. Telling you about a fault of ours does not turn it into a choice of yours. If reconnecting is not possible at all, the undelivered portion comes back as money.",
        ] },
      { type: "subsection", subheading: "Credits stuck after failed sends", content: [
          "When a send fails, the credit should come back to your balance so you can retry. Today it does not come back on its own, and that can lock you out of retrying. This is a known fault and we are not hiding it.",
          "The fix is that a person releases those credits by hand. Tell us. We get 2 working days from the moment you tell us, and we will email you when it is done. You can check it against your own balance. Releasing them is a fix, not a refund, and it settles nothing on its own. It simply puts you back in a position to send.",
          "If it is not done in 2 working days, the money for those credits is owed under section 4 and you can ask for it on the same thread. You do not have to keep chasing us, and you do not have to reach the grievance officer first, although that route is open to you at any time. If you would rather stop using the product than keep retrying, say so at any point and we refund the money instead.",
          "If a send failed and the credit did not come back, you do not pay again to retry it. Tell us and we will either release the stuck credit or cover the retry from our side. You should never pay twice for the same outreach attempt, and if our records show you did, we refund the difference.",
        ] },
      { type: "subsection", subheading: "Stalled campaigns", content: [
          "Any campaign that manages fewer than 30 sends in any 72 hour period while it is supposed to be running counts as stalled, whatever the cause. That includes a campaign sending nothing at all, and it includes a campaign trickling out one email every couple of days. Your campaign is scheduled at about 20 emails a day, so 30 in 72 hours is already less than half of what you paid for. Tell us.",
          "The fix is a restart, and when it works it is the better answer, because the emails you paid for go out. We get one restart per campaign, not an unlimited number, and we get 72 hours from when you tell us to have it sending at its scheduled rate again. Your own send log is the test, measured by rate: at least 50 new sends in those 72 hours means it worked. A few scattered sends do not, and we will not point at them and call the campaign fixed.",
          "If it is not back at its scheduled rate 72 hours after you told us, the money for the undelivered portion is owed. You do not have to wait out the 7 day outer window, because the shorter clock is the one that applies here.",
          "If the same campaign stalls a second time, including dropping back under 30 sends in any 72 hour period within 14 days of the restart, there is no window at all. We had our restart. Ask for the undelivered portion in money and we will not ask you to give it another try.",
          "If it stalled at 10 percent or less delivered, you never had to sit through any of that. That is a section 3 case and the money for the whole of that campaign's reserved credits is owed from the moment you tell us.",
          "A campaign is also late if it has not finished by double its scheduled length plus 7 days, or by day 60 after it was created, whichever comes first. A 200 email campaign is scheduled at about 10 days, so it is late at day 27. At that point the money for the undelivered portion is owed, even if it has been trickling emails out the whole time, and even if nothing ever looked broken.",
        ] },
      { type: "subsection", subheading: "Outages and platform faults", content: [
          "If our systems are down or broken and that costs you delivery, the fix is that we get them working and run the outstanding sends. The clock is the same 7 days, or 72 hours if your campaign is stalled. After that the undelivered portion is refunded in full, in money.",
          "We do not pass the blame down the chain. If a supplier we use failed, or a payment processor failed, or our hosting at Microsoft Azure failed, that is between us and them. From where you sit the question is simple: did the thing you paid for actually run. If it did not, and we cannot make it run inside the window, you get your money back.",
          "We do not charge you again for work we have to redo because of our own fault.",
          "After an incident that affects sending we go back through the accounts it touched, by hand, looking for any where money was taken and nothing was delivered. Where we find one, we act on it without waiting to be asked, and we email the account to say what we are doing. That check is manual and it will not catch everything, so if you think it describes you, email us with your payment ID and we will treat it as a section 3 case. You should not have to catch our mistakes for us.",
        ] },
    ],
  },
  {
    heading: "7. Assignment Dojo",
    id: "s7",
    blocks: [
      { type: "paragraph", content: [
          "Assignment Dojo is AI assignment help, delivered as a document you download. The same shape applies here: we fix it first, because a fixed document is the thing you needed, and we get a fixed number of attempts and a fixed amount of time. Then it is money.",
        ] },
      { type: "bullets", content: [
          "Before the document is generated, you can cancel for any reason and get a full refund in money. Nothing has been produced, so there is nothing to fulfil and no fix to offer. No explanation needed.",
          "If the document never arrived, arrived empty or truncated, or will not open, that is a delivery failure. The fix is that we redeliver, immediately. If you would rather have the money instead of a redelivery, say so and you get it.",
          "If the document does not match the brief you submitted, send us the brief and the file. The fix is that we regenerate or correct it, free. Defective means wrong subject, does not follow your brief, wrong format, incomplete, unreadable, or missing referencing you paid for.",
          "We get 48 hours per attempt and two attempts in total. Not three. All of it runs for no more than 14 calendar days of fix time from your first email about the document. If the defect is not fixed after the second attempt, if 48 hours pass on an attempt with nothing delivered, or if those 14 days are used up, the right to a full refund in money starts at that moment, automatically. You do not have to keep accepting rewrites and you do not have to ask us twice.",
          "You can stop the fix process at any point and take the money as it stands. Saying no to a rewrite on a document that was already defective starts your right to a refund at that moment, under item 2 of the list in section 4. Accepting one rewrite does not commit you to another, and asking us to fix something is never treated as you giving up a refund.",
          "Tell us within 7 days of delivery if you can. That is a request, not a deadline. It is simply the window where the file, the brief and the generation record are easiest for us to line up. Reporting later does not cost you the refund, and nothing in this policy shortens the time the law gives you to bring a complaint about a service that was deficient.",
        ] },
      { type: "paragraph", content: [
          "We do not refund a completed document that matches the brief where you simply changed your mind after downloading it. We do not refund based on the mark you received. We also do not guarantee a particular score from any plagiarism or AI detection tool, because we do not control those tools, they disagree with each other, and their results shift month to month.",
          "That is a different thing from the work itself being copied. If the product page advertised something and your document does not have it, including original writing and the referencing you paid for, that is a defect and the fix route above applies in the normal way, ending in an automatic refund if we cannot fix it.",
          "If you change the brief after work has started, we will quote the change rather than treat it as a defect.",
          "Assignment Dojo is study support. What your college or university permits is your responsibility, and a penalty from your institution is not a refund case. If you are not sure whether you are allowed to use it, check before you buy.",
        ] },
    ],
  },
  {
    heading: "8. Careers Dojo resume builder",
    id: "s8",
    blocks: [
      { type: "paragraph", content: [
          "The resume builder is free. There is no paid tier, no trial that converts, and no card on file for it.",
          "Because nothing is sold here, there is no service we owe you, no fix window, no attempt to sit through, and no refund to calculate. Section 4 has no application to it at all.",
          "Keeping it separate matters. Nothing about your use of the free resume builder changes what you are owed on a paid product, and nothing about a paid campaign changes your access to the resume builder. We will never point at free use of the resume builder as a reason to reduce or refuse a refund on outreach credits or an assignment. The two do not touch, and we will not use one to answer a question about the other.",
          "The one thing that can go wrong here is a charge. If a charge from us appears on your statement that you think relates to the resume builder, it is either an error or a charge for a different product. Send us the payment ID and we will identify it. If it is an error, you get all of it back in full under section 3, in money, immediately, with no fix step and no questions about what you did with the tool.",
        ] },
    ],
  },
  {
    heading: "9. What we do not refund",
    id: "s9",
    blocks: [
      { type: "paragraph", content: [
          "This list is deliberately short. Read it together with the two limits set out earlier: the credit rules in section 5 and the assignment rules in section 7. Between those three places, that is every reason we will refuse a refund. If a reason is not written down in this policy, it is not a reason we will use on you, and nobody on our support team has the authority to invent one.",
          "One thing that is not a reason to refuse: finishing the job. Fix first is a reason to delay a refund, by a stated and finite number of days, and then pay it. It is never a reason to avoid one.",
        ] },
      { type: "bullets", content: [
          "Outreach that actually reached a real contact. Once an email has left your mailbox and been accepted by the receiving server, we cannot unsend it, and that is what you bought. Emails that hard bounced do not count as sent and are dealt with under section 5.",
          "Results. No replies, no interviews, no offers. We sell outreach, not outcomes.",
          "Contacts who were real and reachable but did not answer you.",
          "A campaign that sent everything it reserved and reached contacts that match the targeting you set up. Hard bounces, and sends that went to contacts outside your targeting, are still dealt with under section 5 however few of them there were.",
          "An assignment document that was delivered and matched your brief, where the complaint is about your own view of the quality, the grade you were given, or the number a third party detection tool produced. If the complaint is that the document lacks something the product page advertised, that is a defect and not this.",
          "A campaign you cancelled while it was sending at its scheduled rate, or a mailbox you chose not to reconnect after we told you it had dropped and our records clearly show you disconnected it yourself from inside Studojo, where you are asking for money more than 30 days after the credits went back to your account. The credits still go back and stay usable, and inside those 30 days you can still take money instead. None of this applies to a campaign you cancelled because it was not working, and none of it applies to a disconnection our records do not clearly show was yours.",
          "Currency conversion charges and the fees your own bank adds on its side. You get back the full amount you paid us, in the currency you paid it, with nothing deducted for our payment processing costs or tax. What your bank charges to move the money is not ours to return.",
          "Anything we have already refunded once. We are not going to pay twice for the same charge.",
          "Credits used to send messages that you wrote or edited yourself and that broke our terms, for example spam or abuse. Before we refuse anything on this ground we will show you the exact messages and the log of when they were edited, and you can take the refusal straight to the grievance officer. Outreach that our own system wrote and sent is our responsibility, not yours, and we will never use this line against you for it.",
          "A penalty from your college or university over how you used an assignment document. That is between you and your institution, and section 7 explains it.",
        ] },
      { type: "paragraph", content: [
          "Three things that are deliberately not on that list. Turning down a fix is not on it. Refusing our offer to finish the job on a service that was already failing starts your right to money rather than costing you it, and we will never treat it as a ground to refuse you. Neither is asking for money before the window has run, on a service that was already failing. We may tell you once that finishing it would be faster, and then we do what you asked.",
          "Misuse is not on it either. If we close your account because you broke our terms, we still return anything you paid for that we did not deliver. We do not keep money for work we never performed. We will also tell you exactly what we saw and show you the evidence, and you can dispute it with the grievance officer.",
          "And disputes are not on it. We will not close your account, void your credits or refuse a refund because you raised a chargeback with your bank or filed a complaint against us. You are allowed to do both. We would just rather you talked to us first, because we can usually fix it faster.",
        ] },
    ],
  },
  {
    heading: "10. How to ask for a fix or a refund",
    id: "s10",
    blocks: [
      { type: "paragraph", content: [
          "Email admin@studojo.com from the address on your Studojo account, with the word Refund in the subject line if you want your money, or just describe what went wrong if what you want is for it to work. One email per issue is enough. Support runs out of one inbox and everything is handled there. There is no form to fill in and no particular wording you have to use.",
          "That same email is what opens the fix window in section 4. The date on it is the date every clock in this policy starts from, so keep it.",
          "You do not have to choose between asking for a fix and asking for your money. Tell us what happened. We start the fix straight away, we tell you the date the window ends, and the refund question stays open the entire time.",
        ] },
      { type: "numbered", content: [
          "Your payment ID, or the line from your bank statement showing the charge.",
          "The date and the amount you were charged.",
          "Whether you paid through Razorpay or Dodo Payments, if you know.",
          "Which product it relates to: outreach credits or an assignment.",
          "For a campaign problem: the campaign name, and roughly when you noticed sending had stopped or slowed down.",
          "For a duplicate charge: both payment IDs.",
          "For an assignment problem: the brief you submitted and the file you received.",
          "If the timing matters to you, for example an application deadline you are working to, say so. It changes whether waiting for a fix is a reasonable answer at all, and it can close the window early in your favour under section 4. You can also tell us this later, including after the date has passed.",
          "What happened, in a couple of plain sentences.",
          "What you want: the job finished, the credits released so you can spend them, or the money back. If you are not sure, say so and we will tell you in our first reply what the fix would be and how long it would take, so you can choose with the facts in front of you.",
        ] },
      { type: "paragraph", content: [
          "Screenshots help but are not required. If something on that list is missing, send the request anyway. We will ask for the one piece we need rather than reject the request for being incomplete.",
          "You do not need to argue a legal case or quote this policy back at us. Tell us what happened and we will work out which part applies. If your situation is one of the four unconditional cases in section 3, the payment ID on its own is enough.",
          "If you cannot get into the email on your account, write from any address and say so. We will verify you another way.",
          "Keep everything on the same email thread. That thread is the record of your request. Reply on it at any point to ask where things have got to, and reply on it to say the window has run out and you want the money. That one line is all it takes.",
        ] },
    ],
  },
  {
    heading: "11. What we check, and how you can challenge us",
    id: "s11",
    blocks: [
      { type: "paragraph", content: [
          "Our previous policy said that Studojo's determination of whether a technical failure occurred was final. That was unfair, it is gone, and it is not coming back. We are not the final word on our own mistakes, and that includes deciding for ourselves whether a fix worked.",
          "So you know what is happening on our side, here is what we actually look at.",
        ] },
      { type: "bullets", content: [
          "The payment record, including whether the charge was captured or only authorised, confirmed against Razorpay or Dodo Payments.",
          "Your credit ledger: every grant, reservation, release and deduction, with timestamps.",
          "The campaign record: when it was created, how many credits it reserved, and what state it was in on each day.",
          "Your send log: every outreach email attempted, its timestamp, and whether the receiving server accepted it. This is also where the rate is measured, so it is where the stall test and the fix test are settled.",
          "Every fix we attempted on your account: the day you told us, what we did, the date and time we did it, the date the window ended, and what actually changed afterwards. If we say we restarted your campaign, this is where you can see whether it went back to about 20 a day.",
          "For an assignment: the brief you submitted, the document we generated, when it was generated and delivered, and any fix or redelivery we attempted afterwards.",
          "Bounce events where we hold them, and the connection status of the mailbox you connected, including the time of any disconnection where our logs record it and whether it was done from inside Studojo.",
          "Our server and application logs covering the period you describe.",
        ] },
      { type: "paragraph", content: [
          "If those records contradict each other, or we simply cannot tell what happened, we decide in your favour. Missing records are our problem, not yours. A missing send log means the service was not delivered. If we cannot show that a fix was attempted, it was not attempted, and the clock on it has run. If we cannot show that a timeline in section 12 was met, it was missed.",
          "If you ask, we will send you the records for your own account that we relied on, in a readable form. We put that pack together by hand, so allow up to 15 working days. Where you have a complaint open, we will not take more than 10 working days, because you need time to read them and come back to us inside the one month in section 13, and that month does not stop for us. If we cannot get the pack to you in time for you to use it, whatever the records would have decided is decided in your favour. If a record you asked for does not exist, we will say so plainly and decide the case in your favour.",
          "Asking for the records does not pause anything. The fix window in section 4 keeps running while we assemble them, and so does the one month limit in section 13.",
          "If you think those records are wrong or incomplete, say so and a different person will look again with fresh eyes and come back to you within 7 working days.",
          "We keep payment, credit, campaign, send and fix records for at least three years from the latest of three dates: the date of purchase, the last day any credit from that purchase was reserved or spent, and the date the problem you are raising actually happened. Credits do not expire, so a purchase can still be running years after you paid for it, and a retention clock tied only to the purchase date would run out before your right to complain does. The Consumer Protection Act 2019 gives you two years from the date the cause of action arose, and we hold the records longer than that in every case, not just the quick ones.",
          "If we still disagree after a review, our position is only our position. It does not bind you. Section 13 sets out where you can take it.",
        ] },
    ],
  },
  {
    heading: "12. Timelines, and how the money comes back",
    id: "s12",
    blocks: [
      { type: "paragraph", content: [
          "Two of these are what Indian law requires of us. The rest are commitments we have set ourselves, and they are deliberately shorter. They cover our part of the process. Once the money leaves us, your bank sets its own pace.",
          "No refund timeline below is measured from the day you paid. Refund timings run from the moment your right to money starts under section 4, or from the email in which you told us, whichever applies. The 48 hour acknowledgement and the one month resolution limit are the exceptions, and both run from the moment your first email arrives, because that is what the law requires. A fix attempt never pauses either one.",
          "A working day means Monday to Friday in Bengaluru, excluding Indian public holidays. Wherever a commitment in this policy is set in working days, it also carries a hard calendar ceiling of double that number of calendar days, and whichever falls first is the deadline. So 2 working days is never more than 4 calendar days, 7 working days is never more than 14, and 15 working days is never more than 30. A holiday run does not quietly stretch your clock, and you can always work out your own deadline from the date on your email without knowing our calendar.",
        ] },
      { type: "bullets", content: [
          "Acknowledgement of your request, from a person, on the same email thread: within 48 hours of your first email. This one is a legal requirement.",
          "Our first substantive reply, telling you what the fix is, the date the window ends, and what happens on that date: within 2 working days, in writing. If we need anything from you to do the fix, we ask for all of it in that one message.",
          "The fix itself: 72 hours for a stalled campaign, 2 working days for stuck credits, 48 hours per attempt on an assignment document, 7 calendar days for everything else, and 14 calendar days of fix time across everything. Section 4 has the full list. These are the outer limits, not our targets.",
          "A decision, with our reasoning in writing: within 7 working days of your first email. The clock pauses only for the days we are genuinely waiting on you, and never for more than 5 calendar days in total. If we are waiting on Razorpay or Dodo Payments to confirm something, it can take up to 14 working days, and we will tell you that is the reason. Waiting on a processor never changes the answer, it never pauses the fix window, and it never pushes your complaint past the one month limit in section 13.",
          "The records pack, if you ask for it: up to 15 working days, or 10 working days where you have a complaint open, because we assemble it by hand.",
          "Credits released back into your account as a fix: within 2 working days of you telling us. A person does this by hand, so it is not instant, and we will email you when it is done.",
          "A money refund started with the processor: within 3 working days of you telling us the window has run out, of our spotting it first, or of our agreeing it is owed, whichever comes first. For the four unconditional cases in section 3 and the other no fix first routes in section 3, which never run through section 4 at all, within 3 working days of the email in which you first told us, and the same day where we can. Nothing here waits on an internal approval. Our agreeing with you is not what starts this clock, and there is no case in this policy where a refund is owed without a date by which it has to be moving.",
          "Your complaint fully resolved and closed: within one month of the date you raised it. This one is a legal requirement, and it is a ceiling, not a target.",
        ] },
      { type: "bullets", content: [
          "Razorpay, Indian rupees, back to card, UPI or netbanking: normally 5 to 7 working days after we start it.",
          "Dodo Payments, international: normally 5 to 10 working days after we start it, plus whatever your own bank adds.",
          "Card refunds can take an extra statement cycle to appear. If it has not landed after that, come back to us and we will send you the processor's refund confirmation to hand to your bank.",
        ] },
      { type: "paragraph", content: [
          "Whichever rail your payment went through, Studojo Labs Private Limited is the company that owes you this money. If Razorpay or Dodo Payments is slow, that is ours to chase and not yours. We will not tell you the money has left our side and treat the matter as closed, and we will not leave you without a counterparty because a processor sits between us. We keep you updated on the same thread and we stay on it until it lands.",
        ] },
      { type: "bullets", content: [
          "Refunds go back to the original payment method, in the original currency, through the processor that took the payment. We cannot redirect a refund to a different card, bank account or UPI ID just because you would prefer it somewhere else. The one exception is where the original card or account is closed and the processor cannot complete the refund. Tell us and we will agree another route with you, once we have checked you are the person who paid.",
          "You get back the full amount you paid, including any tax charged on it. We do not deduct payment processing fees from your refund.",
          "Exchange rates move. If you paid in a currency other than your bank's, the rate on the day of the refund may differ slightly from the day you paid. That is set by your bank and the card networks, not by us.",
          "We do not issue refunds as vouchers or store credit. Credits go back to your balance only when you have asked for that instead of money, and even then they do not settle a refund that is owed for a service we did not deliver.",
        ] },
      { type: "paragraph", content: [
          "If we are going to miss one of our own timelines, including the end of a fix window, we will tell you before the deadline passes, not after. Telling you does not extend it, and it does not change what you are owed on the day it runs out. If we miss one anyway, reply on the same email thread and say so. It goes straight to the grievance officer from there, and under section 11 a timeline we cannot show we met is treated as a timeline we missed.",
        ] },
    ],
  },
  {
    heading: "13. Grievance officer and escalation",
    id: "s13",
    blocks: [
      { type: "paragraph", content: [
          "Indian law requires an e-commerce business to name a grievance officer and publish their contact details. Here are ours.",
        ] },
      { type: "bullets", content: [
          "Name: __GRIEVANCE_OFFICER_NAME__",
          "Designation: Grievance Officer, Studojo Labs Private Limited",
          "Email: admin@studojo.com, with GRIEVANCE at the start of the subject line",
          "Registered office, and the address to use if you need to serve us anything: Studojo Labs Private Limited, __REGISTERED_OFFICE_ADDRESS__, Bengaluru, Karnataka, India",
        ] },
      { type: "paragraph", content: [
          "If the person holding this post changes, we update this section within 7 days and the new name appears here. If the name or the address above is ever out of date, that is our failure and not yours. An email to admin@studojo.com is a validly raised grievance on the day you send it, whoever happens to hold the role, and every clock in this section runs from that day.",
          "Grievances are handled over email, so there is a written record of what was said and when. Putting GRIEVANCE at the start of your subject line helps us route it faster, but it is a convenience and nothing turns on it. Any email to admin@studojo.com that tells us something went wrong and asks us to put it right is a complaint from the moment it arrives, whether or not it is labelled, whether or not it quotes this section, and whether or not it went to ordinary support first. The 48 hour acknowledgement and the one month resolution limit run from the moment that email lands in our inbox, not from the next working day and not from the day somebody here decides to call it a grievance. If we misroute your email, the clock still started when you sent it, and that is our problem to absorb rather than yours.",
          "A grievance is looked at independently of whoever handled your original request, and the grievance officer is not bound by that earlier decision.",
          "The grievance officer acknowledges your complaint within 48 hours of receiving it and resolves it within one month of the date you raised it. Those timelines come from the Consumer Protection (E-Commerce) Rules 2020, they apply to us whether or not you quote them, and we cannot extend them. One month is a hard limit, not a date we get to move. A fix in progress does not buy us extra time here either. If the fix window and the month would collide, the month wins, and the complaint is resolved by paying you rather than by asking you to wait. If a complaint is complicated we will keep you updated, and where part of it is already clear we will decide that part and pay it out rather than hold the whole thing back. If the month passes and your complaint is still open, that is our failure, and you can use any of the routes below straight away without waiting for us to finish.",
          "If the decision goes against you, you get the reason in writing, including which records we looked at.",
          "You can go to the grievance officer at any point. You do not have to exhaust normal support first, and you do not have to sit through a fix attempt or wait for a window to end before escalating.",
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
    heading: "14. Your rights under the law",
    id: "s14",
    blocks: [
      { type: "paragraph", content: [
          "Nothing in this policy takes away a right you have under law. If anything written here conflicts with the Consumer Protection Act 2019, or with any other law that applies to you, the law wins, that part of this policy falls away, and the rest still stands.",
          "That applies to the fix rules in section 4 as much as to anything else. Finishing the job first is how we prefer to put a problem right. It is not a condition on your statutory rights, and it cannot be.",
        ] },
      { type: "bullets", content: [
          "If a service we sold you was deficient, you are entitled to a refund under the Consumer Protection Act 2019. A non refundable label on a product page does not change that, and we will not argue that it does.",
          "We cannot refuse to take back a service that was late or deficient, and we cannot refuse a refund for one. The Consumer Protection (E-Commerce) Rules 2020 say so. Offering to finish the job first is lawful because it is bounded: section 4 states a fixed number of attempts, an outer deadline on each one, never more than two fix windows on a campaign, and a hard cap of 14 calendar days of fix time across all of them. When those run out the refund is automatic rather than something we decide. It is not a condition you have to satisfy before a refund becomes possible, it is not something we can extend, and if we ever used it to delay you, that would be a breach of this policy as well as of the Rules.",
          "You can decline the fix entirely. Section 4 makes turning down a fix one of the moments your right to money starts, so a fix window is never a waiting period you are made to sit through against your will.",
          "A term that let us keep trying indefinitely, or that made your refund depend on our own opinion of whether we had tried hard enough, would be an unfair contract term under the Consumer Protection Act 2019. We have written section 4 so that no such term exists in this document. Every window has an end date, there are never more than two fix attempts on one campaign whatever the causes are called, where it is arguable whether a fault is new the answer is that it is not, and every end date turns into money on its own.",
          "Every timing in this policy that asks you to tell us something within a certain number of days is a request, not a cut off. It helps us find the records while they are easy to line up. It does not extinguish a right. Section 69 of the Consumer Protection Act 2019 gives you two years from the date the cause of action arose to bring a complaint, and nothing here shortens that by a single day.",
          "Where a window in this policy sets a commercial default rather than a limit on a right, for example the 30 day money option on credits released after you cancelled a campaign that was sending at its scheduled rate, it is exactly that: an option we chose to offer on credits that still work. It has no effect on a refund for a service that failed, and no such window ever runs where our own failure is what stopped you using your credits.",
          "Store credit is not a refund. Putting credits back on your balance does not discharge money we owe you for a service that was paid for in cash and never delivered, and we will not treat it as though it does.",
          "Failed and duplicate rupee payments taken through Razorpay have to be reversed under Reserve Bank of India rules. For international payments taken through Dodo Payments, the same principle applies through the card networks. No refund policy, ours included, can block either, and neither is routed through any fix attempt.",
          "We do not make ourselves the final judge of whether our own service failed. Section 11 sets out what we look at and how you can challenge it, and section 4 gives you tests on your own send log that do not depend on our opinion at all.",
          "Nothing here asks you to give up your right to complain to a consumer commission, and any clause that appeared to do so would not be enforceable anyway.",
          "If you are outside India, the consumer rights you have where you live apply on top of this policy, not instead of it. That may include a cancellation or cooling off right we do not offer here, for example the 14 day right on online purchases in the UK and the EU. If you have one, you do not need to argue it with us, and you do not have to sit through a fix window first. Email admin@studojo.com, tell us where you live and that you are cancelling, and we refund as money through the processor that took your payment. Where the service has already partly run, we charge only for what was actually delivered, worked out the same way as section 5.",
          "We have tried to write this so you never need to fall back on any of that. But it is your right, and we would rather tell you about it than hope you never find out.",
        ] },
    ],
  },
  {
    heading: "15. Governing law and where disputes are heard",
    id: "s15",
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
    heading: "16. Changes to this policy, and how to reach us",
    id: "s16",
    blocks: [
      { type: "paragraph", content: [
          "We will update this policy when the product changes or when the law does. When we do, we change the version and the date below, and we email account holders about anything that reduces what you can claim.",
          "The version in force on the day you paid is the version that governs that purchase, unless a newer version is better for you, in which case you get the newer one. A change we make later will never be used to cut down what you were already owed, and it will never lengthen a fix window that had already started running.",
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
              Version 2.0. In effect from 15 September 2026. If something goes wrong, we finish the job first. Money follows on a fixed clock.
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
                  Ask Support for a Fix or a Refund
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
