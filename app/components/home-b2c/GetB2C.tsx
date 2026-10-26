// 3. What you get (#get).
// Ported from the design mock nb-sections.html (copy: nb-copy.md); the look is in b2c.css (nb-, nbs-).
export function GetB2C() {
  return (
    <section className="nb-sec" id="get">
      <div className="nb-in">
        <div className="nb-head"><h2 className="nb-h2">What you get.</h2></div>
        <div className="nbs-get">
          <div className="nb-card nbs-tile">
            <span className="nbs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M9.5 11h6M9.5 15h6" /></svg></span>
            <div><h3 className="nb-h3">Your brief</h3><p>In your words. Fix anything.</p></div>
          </div>
          <div className="nb-card nbs-tile">
            <span className="nbs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8.5 7V4.5h7V7M3 13h18" /></svg></span>
            <div><h3 className="nb-h3">Jobs every day</h3><p>Each with a reason.</p></div>
          </div>
          <div className="nb-card nbs-tile">
            <span className="nbs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 7 8.5-7" /></svg></span>
            <div><h3 className="nb-h3">Emails from your inbox</h3><p>With follow ups and suggested replies.</p></div>
          </div>
          <div className="nb-card nbs-tile">
            <span className="nbs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></svg></span>
            <div><h3 className="nb-h3">A tracker</h3><p>Every company you reached out to.</p></div>
          </div>
          <div className="nb-card nbs-tile">
            <span className="nbs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg></span>
            <div><h3 className="nb-h3">A mock interview</h3><p>When you get an interview, practise for it.</p></div>
          </div>
          <div className="nb-card nbs-tile">
            <span className="nbs-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" /></svg></span>
            <div><h3 className="nb-h3">Stu remembers</h3><p>Talk to Stu again any time.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
