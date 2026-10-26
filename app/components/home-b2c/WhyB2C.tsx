// 1. Why job boards do not work (#why).
// Ported from the design mock nb-sections.html (copy: nb-copy.md); the look is in b2c.css (nb-, nbs-).
export function WhyB2C() {
  return (
    <section className="nb-sec nb-fill" id="why">
      <div className="nb-in">
        <div className="nb-head"><h2 className="nb-h2">Why job boards don&apos;t work.</h2></div>
        <div className="nbs-why">
          <div className="nbs-xs">
            <div className="nb-card nbs-x">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" aria-hidden="true"><path d="M7.2 8.6c2.4 1.2 4.6 3.6 7.4 6.6 4.2 4.6 9.6 10.8 17.4 17.6" /><path d="M32.4 6.8c-3.2 3.4-7.6 7.4-11.4 12.2-3.6 4.4-8 9.6-12.6 14.2" /></svg>
              <p>Popular postings get hundreds of applicants.</p>
            </div>
            <div className="nb-card nbs-x">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" aria-hidden="true"><path d="M8.4 7.6c3.8 4 7.2 8.4 11.6 12.8 3.6 3.8 7.4 8 12 11.8" /><path d="M31.2 8.4c-4.6 3.8-8.8 8.6-12.8 12.8-3.4 3.6-7 7.6-10.8 11.6" /></svg>
              <p>Forms and filters screen you out before a person reads a word.</p>
            </div>
            <div className="nb-card nbs-x">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" aria-hidden="true"><path d="M6.8 9.8c4.8 3.2 9.8 7.8 14.2 12.4 3.4 3.4 6.6 6.8 10.8 10.4" /><path d="M33 7.6c-4.2 4.8-9.4 10-13.6 14.6-3.4 3.8-6.8 7.4-11 11" /></svg>
              <p>A generic application just disappears.</p>
            </div>
          </div>
          <div className="nb-card nbs-works">
            <span className="nbs-tick"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.5 21.5c3.4 2.6 6.2 5.6 9 9.2C21.4 21.4 26.8 14.2 33 8.4" /></svg></span>
            <div>
              <span className="nbs-tag">What works</span>
              <p>Reaching the person who is hiring, with a short note that shows you fit.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
