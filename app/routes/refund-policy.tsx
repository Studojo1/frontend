import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/refund-policy";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Refund Policy – Studojo" },
    { name: "description", content: "Studojo's refund policy – please read before making a purchase." },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/refund-policy" },
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
              Last updated: March 2026. Please read carefully before making a purchase.
            </p>
          </Section>
        </section>

        <Section width="wide" className="py-12 md:py-16">
          <div className="space-y-12">

            {/* Overview */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Overview
              </h2>
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  Studojo (Synovate People Solutions Private Limited) provides digital services that are delivered electronically and begin processing immediately upon purchase. Because of the nature of these services, refunds are limited and subject to strict conditions as set out in this policy. By making a purchase on Studojo, you acknowledge that you have read and accepted this Refund Policy.
                </p>
              </div>
            </section>

            {/* Outreach Credits */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Internship Dojo Outreach Credits
              </h2>
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <h3 className="mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">Non-Refundable Once Used</h3>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Credits consumed to initiate any stage of the outreach pipeline are non-refundable. This includes credits used to start lead generation, lead enrichment, or email campaign delivery. Once a process has been initiated, the service is considered delivered and no refund will be issued for those credits, regardless of the outcome.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <h3 className="mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">No Outcome Guarantee</h3>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Refunds will not be issued on the basis that the outreach did not result in a job offer, interview, reply, or any other career outcome. Studojo provides a technology service that automates outreach; we do not guarantee how recipients will respond or whether any opportunity will arise as a result.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <h3 className="mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">No Refund for Contact Data Quality</h3>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Refunds will not be issued on the basis that lead data or contact information was inaccurate, incomplete, or did not match your expectations. Contact data is sourced from third-party providers and Studojo makes no warranty as to its accuracy. The risk of data quality lies with the user.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <h3 className="mb-3 font-['Satoshi'] text-base font-semibold text-neutral-900 md:text-lg">Unused Credits</h3>
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Credits that have not yet been used to initiate any process may be eligible for a refund within 7 days of purchase, provided that no part of the paid order has been processed. To request this, contact admin@studojo.com with your order details within 7 days of payment.
                  </p>
                </div>
              </div>
            </section>

            {/* Assignment and Academic Services */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Assignment and Academic Services
              </h2>
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Refund requests for assignment services must be submitted within 24 hours of purchase and only where the output has not been downloaded or used. Once a completed document has been accessed or downloaded, no refund will be issued.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Refunds will not be issued on the basis that the AI-generated content did not meet your personal expectations, was not the grade you wanted, or required editing. AI-generated academic content is provided as a starting point; it is your responsibility to review and adapt it.
                  </p>
                </div>
              </div>
            </section>

            {/* Resume Services */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Resume Services
              </h2>
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  The Careers Dojo resume builder is provided free of charge. Refunds do not apply to free services. For any premium resume features, refund requests must be submitted within 48 hours of purchase and before the final document has been downloaded. Once downloaded, the service is considered delivered and no refund will be issued.
                </p>
              </div>
            </section>

            {/* Technical Failures */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Technical Failures
              </h2>
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    If a service fails to function due to a confirmed technical fault on Studojo's side, you may be eligible for a credit refund or service credit. This does not include failures caused by third-party services (such as Google, Apollo.io, or Razorpay), your own internet connection, or your own device or account configuration.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                  <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                    Technical failure claims must be reported within 7 days of the issue occurring and must include sufficient detail (screenshots, error messages) for us to investigate. Studojo's determination of whether a technical failure occurred is final.
                  </p>
                </div>
              </div>
            </section>

            {/* Non-Refundable */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Non-Refundable in All Cases
              </h2>
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <ul className="list-disc space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  <li>Credits used to initiate any stage of the outreach pipeline (lead generation, enrichment, or email sending)</li>
                  <li>Services where any part of the deliverable has been accessed or downloaded</li>
                  <li>Refund requests submitted outside the applicable timeframe</li>
                  <li>Purchases made in violation of our Terms of Service</li>
                  <li>Credits forfeited due to account termination for Terms violations</li>
                  <li>Any purchase where the user changed their mind after service delivery began</li>
                  <li>Dissatisfaction with career outcomes (job offers, replies, interviews) resulting from use of the service</li>
                </ul>
              </div>
            </section>

            {/* How to Request */}
            <section>
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                How to Request a Refund
              </h2>
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
                <ol className="list-decimal space-y-3 pl-6 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  <li>Email admin@studojo.com with the subject line "Refund Request"</li>
                  <li>Include your registered email address and the date of purchase</li>
                  <li>Describe the reason for your refund request in detail</li>
                  <li>Include any supporting evidence (screenshots, error messages, order ID)</li>
                </ol>
                <p className="mt-4 font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
                  We will acknowledge your request within 2 business days and aim to resolve all valid requests within 7 business days. Approved refunds are processed back to the original payment method via Razorpay and typically appear within 5 to 10 business days depending on your bank.
                </p>
              </div>
            </section>

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
