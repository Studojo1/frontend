import { Link } from "react-router";
import { TypeLink } from "./cta";

// 9. Questions (#faq). <details> works without JS.
// Ported from the design mock h-sections.html (copy: story-copy.md); the look is in b2c.css (st-*).
export function FaqB2C() {
  return (
    <section className="sjb-sec" id="faq" aria-labelledby="faq-h">
      <div className="sjb-sec-in">
        <header className="sjb-sec-head">
          <span className="sjb-kicker">questions</span>
          <h2 className="sjb-h-sec" id="faq-h">before you call.</h2>
        </header>
        <div className="st-faq">
          <details className="st-q"><summary>is it free?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>Free to start. Finding and matching jobs costs nothing. Some extras, like finding the right person at a company to email, use credits.</p></div></details>
          <details className="st-q"><summary>how long does it take?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>The call is about 10 minutes. With sign up and checking your brief, plan on 10 to 15 minutes.</p></div></details>
          <details className="st-q"><summary>i&apos;m a fresher. will it work for me?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>Yes. Stu asks about your studies, your projects and any internships, not just past jobs. You can look for an internship or a full-time role.</p></div></details>
          <details className="st-q"><summary>can i type instead?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>Yes. If you can&apos;t talk right now, set up by typing instead. During the call you can also type a word Stu misheard.</p><TypeLink label="set up by typing instead" /></div></details>
          <details className="st-q"><summary>what happens to my data?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>Only you and Studojo see your resume, and Studojo never sells your data. You can download a copy or delete your account any time from Settings.</p><Link className="sjb-link-type" to="/privacy">read the privacy policy</Link></div></details>
          <details className="st-q"><summary>what if i don&apos;t know what i want yet?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>Say so. Stu asks what you have enjoyed so far, the roles you would consider and the ones you would not, and starts from there.</p></div></details>
          <details className="st-q"><summary>which countries?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>India, plus the US, the UK, the UAE and Singapore.</p></div></details>
          <details className="st-q"><summary>can i change my brief later?<span className="st-plus" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
            <div className="st-a"><p>Yes. Tap anything in your brief to change it, or talk to Stu again. A follow up call is shorter and covers only what is new.</p></div></details>
        </div>
      </div>
    </section>
  );
}
