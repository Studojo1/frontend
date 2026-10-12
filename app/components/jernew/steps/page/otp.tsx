// Mock college email check: a code "arrives" on a badge (nothing is sent),
// the student types or taps it in, and the page earns a verified badge.
// Owned by builder B (Your page).
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, useAnimate } from "framer-motion";
import { FiCheck, FiMail } from "react-icons/fi";
import { MOCK_OTP, STUDENT } from "../../data";
import { useMotionPresets } from "../../motion";
import { Badge, Button, cx, FOCUS_RING } from "../../ui";

export function OtpPanel({ onVerified, onClose }: { onVerified: () => void; onClose: () => void }) {
  const m = useMotionPresets();
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const verify = (value = code) => {
    if (value === MOCK_OTP) {
      setError("");
      onVerified();
      return;
    }
    setError(value.length < 6 ? "The code has 6 digits." : "That code does not match. Use the one on the badge.");
    if (!m.reduced && scope.current) animate(scope.current, { x: [0, -6, 6, -3, 3, 0] }, { duration: 0.3 });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      verify();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div variants={m.pop} initial="hidden" animate="show" className="mt-3 rounded-xl border-2 border-studojo-ink bg-white p-3">
      <p className="font-satoshi text-sm text-studojo-ink">
        A 6-digit code would go to <strong className="break-all">{STUDENT.collegeEmail}</strong>.
      </p>

      {/* The mock inbox: the code shows here instead of being emailed. */}
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-studojo-ink/40 bg-studojo-yellow-bg px-3 py-2">
        <FiMail aria-hidden className="shrink-0" />
        <span className="font-satoshi text-sm">
          Your code: <strong className="font-mono text-base tracking-[0.2em]">{MOCK_OTP}</strong>
        </span>
        <Badge kind="concept">Mock code</Badge>
        <button
          type="button"
          onClick={() => {
            setCode(MOCK_OTP);
            verify(MOCK_OTP);
          }}
          className={cx("ml-auto min-h-11 rounded-lg px-2 font-satoshi text-sm font-bold text-studojo-purple-strong underline underline-offset-4", FOCUS_RING)}
        >
          Use it
        </button>
      </div>

      <div ref={scope} className="mt-3 flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="mb-1 block font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
            6-digit code
          </label>
          <input
            id={id}
            ref={inputRef}
            data-no-enter
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-e` : undefined}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(v);
              setError("");
              if (v.length === 6 && v === MOCK_OTP) verify(v);
            }}
            onKeyDown={onKey}
            className={cx(
              "min-h-12 w-full rounded-xl border-2 border-studojo-ink bg-white px-3 text-center font-mono text-base tracking-[0.5em] sm:text-xl",
              FOCUS_RING,
              error && "border-[#be185d]",
            )}
          />
        </div>
        <Button size="md" icon={<FiCheck />} onClick={() => verify()}>
          Verify
        </Button>
      </div>
      {error ? (
        <p id={`${id}-e`} role="alert" className="mt-1.5 font-satoshi text-sm font-bold text-[#be185d]">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
