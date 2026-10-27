import { Link } from "react-router";
import { Plus } from "./icons";

// 9. Questions (#faq): native details, works without JS.
// Ported from the design prototype hp/v2.html (copy verbatim); the look is in home-v2.css (hv-st-*).
export function Faq() {
  return (
    <section className="hv-sec" id="faq" aria-labelledby="faq-h">
      <div className="hv-sec-in">
        <header className="hv-sec-head">
          <span className="hv-kicker">questions</span>
          <h2 className="hv-h-sec" id="faq-h">before you call.</h2>
        </header>
        <div className="hv-st-faq">
          <details className="hv-st-q"><summary>i&apos;m a fresher. will it work for me?<span className="hv-st-plus" aria-hidden="true"><Plus size={14} sw={2.4} noJoin /></span></summary>
            <div className="hv-st-a"><p>Yes. Stu asks about your studies, your projects and any internships, not just past jobs.</p></div></details>
          <details className="hv-st-q"><summary>can i type instead?<span className="hv-st-plus" aria-hidden="true"><Plus size={14} sw={2.4} noJoin /></span></summary>
            <div className="hv-st-a"><p>Yes. Just before the call, Stu offers to set you up by typing instead. During the call you can also type a word Stu misheard.</p></div></details>
          <details className="hv-st-q"><summary>what happens to my data?<span className="hv-st-plus" aria-hidden="true"><Plus size={14} sw={2.4} noJoin /></span></summary>
            <div className="hv-st-a"><p>Your resume file is private. Your public page, and anything sent to an employer, go out only as you set them. Studojo never sells your data, and you can download a copy or delete your account any time from Settings.</p><Link className="hv-link-type" to="/privacy">read the privacy policy</Link></div></details>
          <details className="hv-st-q"><summary>what if i don&apos;t know what i want yet?<span className="hv-st-plus" aria-hidden="true"><Plus size={14} sw={2.4} noJoin /></span></summary>
            <div className="hv-st-a"><p>Say so. Stu asks what you have enjoyed, the roles you would consider and the ones you would not, and starts from there.</p></div></details>
          <details className="hv-st-q"><summary>can i change my brief later?<span className="hv-st-plus" aria-hidden="true"><Plus size={14} sw={2.4} noJoin /></span></summary>
            <div className="hv-st-a"><p>Yes. Tap anything in your brief to change it, or talk to Stu again. A follow up call is shorter and covers only what is new.</p></div></details>
        </div>
      </div>
    </section>
  );
}
