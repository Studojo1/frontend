// 5. Questions (#faq). <details> works without JS.
// Ported from the design mock nb-sections.html (copy: nb-copy.md); the look is in b2c.css (nb-, nbs-).
export function FaqB2C() {
  return (
    <section className="nb-sec" id="faq">
      <div className="nb-in">
        <div className="nb-head"><h2 className="nb-h2">Questions.</h2></div>
        <div className="nbs-faq">
          <details className="nbs-q">
            <summary>Is it free?<span className="nbs-plus" aria-hidden="true"></span></summary>
            <div className="nbs-a"><p>Free to start. Finding and matching jobs costs nothing. Some extras, like finding the right person at a company so Stu can email them, use credits. One credit is one verified email of the right person. No email found, no credit used.</p></div>
          </details>
          <details className="nbs-q">
            <summary>How long does it take?<span className="nbs-plus" aria-hidden="true"></span></summary>
            <div className="nbs-a"><p>The call is about 10 minutes. With sign up and checking your brief, plan on 10 to 15 minutes.</p></div>
          </details>
          <details className="nbs-q">
            <summary>I&apos;m a fresher. Will it work for me?<span className="nbs-plus" aria-hidden="true"></span></summary>
            <div className="nbs-a"><p>Yes. Stu asks about your studies, your projects and any internships, not just past jobs. Look for an internship or a full-time job.</p></div>
          </details>
          <details className="nbs-q">
            <summary>Can I type instead?<span className="nbs-plus" aria-hidden="true"></span></summary>
            <div className="nbs-a"><p>Yes. Just before the call, Stu offers to set you up by typing instead. During the call you can also type a word Stu misheard.</p></div>
          </details>
          <details className="nbs-q">
            <summary>What happens to my data?<span className="nbs-plus" aria-hidden="true"></span></summary>
            <div className="nbs-a"><p>Your resume file is private. Your public page, and anything sent to an employer, go out only as you set them. Studojo never sells your data, and you can download a copy or delete your account any time from Settings.</p></div>
          </details>
        </div>
      </div>
    </section>
  );
}
