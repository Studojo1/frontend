// The Gmail handshake: two badges joined by a line. Idle, the line is dashed;
// connecting, packets travel along it; connected, it fills solid and a check
// locks in the middle while the badges lean in. Owned by builder D.
import { motion } from "framer-motion";
import { SPRING, SPRING_SNAP, useMotionPresets } from "../../motion";

export type HandshakeState = "idle" | "connecting" | "connected" | "free";

const Y = 78;
const L = 132;
const R = 228;

export function Handshake({ state, address }: { state: HandshakeState; address: string }) {
  const m = useMotionPresets();
  const linked = state === "connected";
  const lean = linked && !m.reduced ? 12 : 0;

  return (
    <svg viewBox="0 0 360 156" className="block h-auto w-full" aria-hidden>
      {/* The line */}
      {state === "free" ? null : (
        <>
          <line x1={L} y1={Y} x2={R} y2={Y} stroke="#171717" strokeWidth={3} strokeDasharray="6 7" strokeLinecap="round" opacity={0.35} />
          <motion.rect
            x={L}
            y={Y - 5}
            width={R - L}
            height={10}
            rx={5}
            fill="#10b981"
            stroke="#171717"
            strokeWidth={2}
            style={{ originX: 0 }}
            initial={false}
            animate={{ scaleX: linked ? 1 : 0, opacity: linked ? 1 : 0 }}
            transition={m.reduced ? { duration: 0.15 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
          {state === "connecting" && !m.reduced
            ? [0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={L}
                  cy={Y}
                  r={5}
                  fill="#8b5cf6"
                  stroke="#171717"
                  strokeWidth={2}
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: [0, R - L], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
              ))
            : null}
          {state === "connecting" && m.reduced ? (
            <circle cx={(L + R) / 2} cy={Y} r={6} fill="#8b5cf6" stroke="#171717" strokeWidth={2} />
          ) : null}
          <motion.g
            initial={false}
            animate={{ scale: linked ? 1 : 0, opacity: linked ? 1 : 0 }}
            transition={m.reduced ? { duration: 0.15 } : { ...SPRING_SNAP, delay: 0.25 }}
          >
            <circle cx={(L + R) / 2} cy={Y} r={17} fill="#ffffff" stroke="#171717" strokeWidth={3} />
            <path d={`M ${(L + R) / 2 - 7} ${Y} l 5 5 l 9 -10`} fill="none" stroke="#047857" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </>
      )}

      {/* Studojo badge */}
      <motion.g initial={false} animate={{ x: lean }} transition={SPRING}>
        <rect x={24} y={Y - 50} width={108} height={100} rx={20} fill="#faf5fe" stroke="#171717" strokeWidth={3} />
        <circle cx={78} cy={Y - 10} r={22} fill="#8b5cf6" stroke="#171717" strokeWidth={3} />
        {/* A small smiling face, after the Studojo doodle */}
        <circle cx={71} cy={Y - 14} r={2.6} fill="#171717" />
        <circle cx={85} cy={Y - 14} r={2.6} fill="#171717" />
        <path d={`M 69 ${Y - 6} Q 78 ${Y + 3} 87 ${Y - 6}`} fill="none" stroke="#171717" strokeWidth={2.6} strokeLinecap="round" />
        <text x={78} y={Y + 32} textAnchor="middle" fontSize={15} fontWeight={700} fill="#171717" className="font-clash">
          studojo
        </text>
      </motion.g>

      {/* Gmail badge: a plain envelope, not the vendor's logo */}
      <motion.g initial={false} animate={{ x: -lean, opacity: state === "free" ? 0.45 : 1 }} transition={SPRING}>
        <rect x={228} y={Y - 50} width={108} height={100} rx={20} fill={linked ? "#d0fae4" : "#ffffff"} stroke="#171717" strokeWidth={3} />
        <rect x={258} y={Y - 30} width={48} height={34} rx={5} fill="#ffffff" stroke="#171717" strokeWidth={3} />
        <path d={`M 260 ${Y - 27} L 282 ${Y - 10} L 304 ${Y - 27}`} fill="none" stroke="#171717" strokeWidth={3} strokeLinejoin="round" />
        <text x={282} y={Y + 26} textAnchor="middle" fontSize={15} fontWeight={700} fill="#171717" className="font-clash">
          Gmail
        </text>
        <text x={282} y={Y + 42} textAnchor="middle" fontSize={11} fill="#525252" className="font-satoshi">
          {state === "free" ? "not needed" : linked ? address : "your address"}
        </text>
      </motion.g>
    </svg>
  );
}
