import { Kicker, StuHead } from "./ui";

// SITE-V2 sign-in and password pages (B2C hosts only): Stu's head and a mono purple kicker at the top of the card,
// where the classic page shows a second "studojo" wordmark (the site header already carries it). Styled by the auth
// block of site-pages.css (html[data-sv2="auth"] .sv2-auth-top).
export function AuthTop({ kicker, size = 64 }: { kicker: string; size?: number }) {
  return (
    <div className="sv2-auth-top">
      <StuHead size={size} />
      <Kicker>{kicker}</Kicker>
    </div>
  );
}
