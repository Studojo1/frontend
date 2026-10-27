import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { FiClock, FiMessageCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { Footer, Header } from "~/components";
import { Kicker, TileIcon } from "../ui";

// SITE-V2 /contact on B2C hosts (routes/contact.tsx hands over here; html[data-sv2="contact"], site-pages.css).
// Layout only: the same copy, the same form (every field, id, placeholder, required flag, the honeypot) driven by the
// route's own state and submit handler, passed in. A white card form, the other ways to reach us as small cards with
// lilac icon tiles, the FAQ as quiet expanding rows, then the "still need help" note and the site footer.

type Form = { name: string; email: string; subject: string; message: string };
type Faq = { question: string; answer: string; link?: { to: string; label: string } };

type Props = {
  subjects: readonly string[];
  faq: readonly Faq[];
  formData: Form;
  setFormData: (next: Form) => void;
  trap: string;
  setTrap: (next: string) => void;
  loading: boolean;
  result: { type: "success" | "error"; text: string } | null;
  onSubmit: (e: FormEvent) => void;
};

function FaqRow({ item }: { item: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`svc-q${open ? " svc-q-open" : ""}`}>
      <button type="button" onClick={() => setOpen(!open)} className="svc-q-btn" aria-expanded={open}>
        <span>{item.question}</span>
        <span className="svc-plus" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="svc-a">
          <p>{item.answer}</p>
          {item.link &&
            (item.link.to.startsWith("/b2cnew") ? (
              // /b2cnew (Stu) is another app: a plain link, a full page load.
              <a href={item.link.to} className="svc-a-link">
                {item.link.label} →
              </a>
            ) : (
              <Link to={item.link.to} className="svc-a-link">
                {item.link.label} →
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

export function ContactB2C({ subjects, faq, formData, setFormData, trap, setTrap, loading, result, onSubmit }: Props) {
  return (
    <>
      <Header />
      <main className="sv-page svc">
        <div className="sv-in">
          <header className="sv-pagehead">
            <Kicker>contact</Kicker>
            <h1 className="sv-h1">Get in Touch</h1>
            <p className="sv-lead">Have a question, feedback, or need help? We're here for you.</p>
          </header>

          <div className="svc-grid">
            <section className="sv-card svc-form" aria-labelledby="svc-form-h">
              <h2 id="svc-form-h" className="sv-h3">
                Send us a message
              </h2>

              {result && <div className={`svc-result svc-result-${result.type}`}>{result.text}</div>}

              <form onSubmit={onSubmit} className="svc-fields">
                <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                  <label htmlFor="sj_trap">Leave this empty</label>
                  <input
                    id="sj_trap"
                    name="sj_trap"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                  />
                </div>
                <div className="svc-two">
                  <div>
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={loading}
                  >
                    {subjects.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <button type="submit" disabled={loading} className="sv-btn svc-submit">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </section>

            <aside className="svc-side" aria-labelledby="svc-side-h">
              <h2 id="svc-side-h" className="sv-h3">
                Other ways to reach us
              </h2>

              <div className="sv-card svc-way">
                <TileIcon name="mail" />
                <div>
                  <p className="svc-way-t">Email</p>
                  <a href="mailto:admin@studojo.com">admin@studojo.com</a>
                </div>
              </div>

              <div className="sv-card svc-way">
                <span className="sv-ico" aria-hidden="true">
                  <FaWhatsapp />
                </span>
                <div>
                  <p className="svc-way-t">WhatsApp Community</p>
                  <a href="https://chat.whatsapp.com/CUV8DSjQWqB82yXKRE66ol?mode=gi_t" target="_blank" rel="noopener noreferrer">
                    Join our group →
                  </a>
                </div>
              </div>

              <div className="sv-card svc-way">
                <span className="sv-ico" aria-hidden="true">
                  <FiMessageCircle />
                </span>
                <div>
                  <p className="svc-way-t">Live Chat</p>
                  <p className="svc-way-d">Click the chat bubble in the bottom-right corner</p>
                </div>
              </div>

              <div className="sv-card svc-way">
                <span className="sv-ico" aria-hidden="true">
                  <FiClock />
                </span>
                <div>
                  <p className="svc-way-t">Response Time</p>
                  <p className="svc-way-d">We typically respond within 24 hours</p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <section className="sv-sec svc-faq" aria-labelledby="svc-faq-h">
          <div className="sv-in sv-read">
            <div className="svc-faq-head">
              <Kicker>questions</Kicker>
              <h2 id="svc-faq-h" className="sv-h2">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="svc-faq-list">
              {faq.map((item) => (
                <FaqRow key={item.question} item={item} />
              ))}
            </div>

            <div className="sv-card sv-card-soft svc-help">
              <h3 className="sv-h3">Still need help?</h3>
              <p className="sv-body">Our live chat is available | click the bubble in the bottom-right corner to start a conversation.</p>
              <Link to="/" className="sv-btn-ghost">
                Return to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
