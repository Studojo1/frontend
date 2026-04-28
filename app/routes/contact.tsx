import { useState } from "react";
import { Link } from "react-router";
import { Header, Footer } from "~/components";
import { Section } from "~/components/common/section";
import type { Route } from "./+types/contact";
import { FiMail, FiMessageCircle, FiClock, FiChevronDown } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Us | Studojo" },
    { name: "description", content: "Get in touch with the Studojo team. We're here to help with any questions about our products and services." },
    { tagName: "link", rel: "canonical", href: "https://studojo.com/contact" },
  ];
}

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Technical Issue",
  "Billing & Refunds",
  "Feature Request",
  "Other",
];

const FAQ_ITEMS = [
  {
    question: "How do I reset my password?",
    answer: 'Go to the login page and click "Forgot password." You\'ll receive an email with a reset link. If you don\'t see it, check your spam folder.',
  },
  {
    question: "How do refunds work?",
    answer: "Unused credits may be eligible for a refund within 7 days of purchase. Once a service has been initiated, credits are non-refundable. See our full refund policy for details.",
    link: { to: "/refund-policy", label: "View Refund Policy" },
  },
  {
    question: "How does the Internship Dojo outreach work?",
    answer: "Our AI finds relevant hiring managers, writes personalised emails, and sends them from your connected Gmail account. You control who gets contacted and what gets sent.",
    link: { to: "/dojos/internships", label: "Learn more" },
  },
  {
    question: "Is the resume builder really free?",
    answer: "Yes. The Careers Dojo resume builder is completely free | no hidden charges, no credit card required. Build as many resumes as you need.",
    link: { to: "/dojos/careers", label: "Try it now" },
  },
  {
    question: "How is my data handled?",
    answer: "We take privacy seriously. Your data is encrypted, never sold to third parties, and you can request deletion at any time. Read our privacy policy for the full details.",
    link: { to: "/privacy", label: "View Privacy Policy" },
  },
];

function FAQItem({ item }: { item: (typeof FAQ_ITEMS)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
        aria-expanded={open}
      >
        <span className="font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">
          {item.question}
        </span>
        <FiChevronDown
          className={`h-5 w-5 flex-shrink-0 text-neutral-600 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t-2 border-neutral-900 px-6 pb-6 pt-4">
          <p className="font-['Satoshi'] text-sm leading-6 text-neutral-700 md:text-base">
            {item.answer}
          </p>
          {item.link && (
            <Link
              to={item.link.to}
              className="mt-3 inline-block font-['Satoshi'] text-sm font-medium text-violet-500 hover:underline"
            >
              {item.link.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: "success", text: data.message || "Message sent! We'll get back to you soon." });
        setFormData({ name: "", email: "", subject: SUBJECT_OPTIONS[0], message: "" });
      } else {
        setResult({ type: "error", text: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setResult({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border-2 border-neutral-900 bg-white px-4 py-3 font-['Satoshi'] text-sm text-neutral-900 placeholder:text-neutral-400 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 disabled:opacity-60 md:text-base";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-900 bg-purple-50 py-16 md:py-24">
          <Section width="narrow" className="text-center">
            <h1 className="font-['Clash_Display'] text-4xl font-medium leading-tight text-neutral-900 md:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 font-['Satoshi'] text-lg font-normal leading-7 text-neutral-700 md:text-xl md:mx-auto md:max-w-3xl">
              Have a question, feedback, or need help? We're here for you.
            </p>
          </Section>
        </section>

        {/* Form + Sidebar */}
        <Section width="wide" className="py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {/* Contact Form */}
            <div className="md:col-span-2">
              <h2 className="mb-6 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Send us a message
              </h2>

              {result && (
                <div
                  className={`mb-6 rounded-2xl border-2 border-neutral-900 p-4 font-['Satoshi'] text-sm md:text-base ${
                    result.type === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {result.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block font-['Satoshi'] text-sm font-medium text-neutral-900">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block font-['Satoshi'] text-sm font-medium text-neutral-900">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block font-['Satoshi'] text-sm font-medium text-neutral-900">
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={loading}
                    className={inputClass}
                  >
                    {SUBJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block font-['Satoshi'] text-sm font-medium text-neutral-900">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={loading}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-2xl border-2 border-neutral-900 bg-violet-500 px-6 py-4 font-['Satoshi'] text-base font-medium text-white shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none md:w-auto"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <h2 className="font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900">
                Other ways to reach us
              </h2>

              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-violet-500">
                    <FiMail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Email</p>
                    <a href="mailto:admin@studojo.com" className="font-['Satoshi'] text-sm text-violet-500 hover:underline md:text-base">
                      admin@studojo.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FaWhatsapp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">WhatsApp Community</p>
                    <a
                      href="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol?mode=gi_t"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-['Satoshi'] text-sm text-violet-500 hover:underline md:text-base"
                    >
                      Join our group →
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-violet-500">
                    <FiMessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Live Chat</p>
                    <p className="font-['Satoshi'] text-sm text-neutral-600 md:text-base">
                      Click the chat bubble in the bottom-right corner
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-neutral-900 bg-purple-50 p-6 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-violet-500">
                    <FiClock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-['Satoshi'] text-sm font-semibold text-neutral-900 md:text-base">Response Time</p>
                    <p className="font-['Satoshi'] text-sm text-neutral-600 md:text-base">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section width="wide" className="border-t border-neutral-200 py-12 md:py-16">
          <h2 className="mb-8 font-['Clash_Display'] text-3xl font-medium leading-tight text-neutral-900 md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.question} item={item} />
            ))}
          </div>
        </Section>

        {/* CTA Banner */}
        <Section width="wide" className="pb-12 md:pb-16">
          <div className="rounded-2xl border-2 border-neutral-900 bg-violet-500 p-6 text-center shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] md:p-8">
            <h3 className="mb-2 font-['Clash_Display'] text-2xl font-medium text-white md:text-3xl">
              Still need help?
            </h3>
            <p className="mb-6 font-['Satoshi'] text-base leading-7 text-white">
              Our live chat is available | click the bubble in the bottom-right corner to start a conversation.
            </p>
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-neutral-900 bg-white px-6 font-['Satoshi'] text-base font-medium text-violet-500 shadow-[4px_4px_0px_0px_rgba(25,26,35,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(25,26,35,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Return to Home
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
