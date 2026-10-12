// Step 9: connect. A handshake between Studojo and the student's Gmail, the
// permissions in plain words, and a mock connect that succeeds. On Free there
// is nothing to send, so Gmail is not needed. Owned by builder D.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiEyeOff, FiInbox, FiPower, FiSend, FiX } from "react-icons/fi";
import { GMAIL_PERMISSIONS, GMAIL_SAMPLE_ADDRESS, SEND_PACE } from "../data";
import { useFlow, useStepBar } from "../flow";
import { SPRING_SNAP, useMotionPresets } from "../motion";
import { Badge, Card, LiveRegion, StepHeader } from "../ui";
import { Handshake, type HandshakeState } from "./go/handshake";

const PERM_ICON = { send: <FiSend />, replies: <FiInbox />, disconnect: <FiPower /> } as const;

const NEVER = ["Use anything else in your inbox", "Send anything you have not approved", "Post anywhere for you"];

export function Connect() {
  const f = useFlow();
  const m = useMotionPresets();
  const free = f.data.pack === "free";
  const connected = f.data.gmail.connected;
  const [busy, setBusy] = useState(false);
  const [say, setSay] = useState("");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const state: HandshakeState = free ? "free" : connected ? "connected" : busy ? "connecting" : "idle";

  const connect = () => {
    if (free || connected) return f.next();
    if (busy) return;
    setBusy(true);
    setSay("Connecting to Gmail. This is a preview, so nothing really connects.");
    timers.current.push(
      window.setTimeout(() => {
        f.update("gmail", { connected: true, address: GMAIL_SAMPLE_ADDRESS });
        setBusy(false);
        setSay(`Connected as ${GMAIL_SAMPLE_ADDRESS}.`);
      }, m.reduced ? 300 : 1300),
      window.setTimeout(() => f.next(), m.reduced ? 1000 : 2300),
    );
  };

  useStepBar({
    label: free ? "Continue" : connected ? "Continue" : busy ? "Connecting" : "Connect Gmail",
    onPrimary: connect,
    hint: free ? "Free sends nothing, so Gmail stays unconnected." : "Mock connect: nothing leaves this browser.",
    hintOnPhone: true,
    secondary:
      connected && !free && !busy
        ? {
            label: "Disconnect",
            onClick: () => {
              f.update("gmail", { connected: false });
              setSay("Disconnected. Sending would stop straight away.");
            },
          }
        : undefined,
  });

  return (
    <div>
      <StepHeader
        title={free ? "No Gmail needed on Free" : "Send from your own Gmail"}
        description={
          free
            ? "Free keeps your page only, so nothing is sent. You can add a pack later and connect then."
            : `Emails go from your address, ${SEND_PACE}, so replies land in your inbox like any other conversation.`
        }
        aside={<Badge kind="concept">Mock connect</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Card shadow="lg" pad="lg" tone={connected && !free ? "green" : "white"} className="flex flex-col justify-center">
          <Handshake state={state} address={f.data.gmail.address} />
          <p className="mt-4 text-center font-satoshi text-base font-bold" aria-hidden>
            {free ? "Your page goes live without Gmail" : connected ? `Connected as ${f.data.gmail.address}` : busy ? "Shaking hands" : "Not connected yet"}
          </p>
          {!free ? (
            <p className="mt-1 text-center font-satoshi text-sm text-studojo-muted">
              In the real product, Gmail shows its own permission screen first. Here nothing connects.
            </p>
          ) : null}
        </Card>

        <div className="space-y-4">
          <Card shadow="md">
            <h2 className="font-clash text-xl font-semibold">{free ? "If you add a pack later, we would ask to" : "What you are allowing"}</h2>
            <motion.ul className="mt-4 space-y-3" variants={m.list} initial="hidden" animate="show">
              {GMAIL_PERMISSIONS.map((p, i) => (
                <motion.li key={p.id} variants={m.item} className="flex items-start gap-3 rounded-xl border-2 border-studojo-ink bg-white p-3">
                  <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-studojo-ink bg-studojo-green-bg text-lg">
                    {PERM_ICON[p.id]}
                  </span>
                  <span className="min-w-0 flex-1 font-satoshi">
                    <span className="block text-base font-bold leading-snug">{p.title}</span>
                    <span className="block text-sm text-studojo-muted">{p.detail}</span>
                  </span>
                  {/* No empty circle before connecting: it would read as a box to tick. */}
                  <AnimatePresence initial={false}>
                    {connected && !free ? (
                      <motion.span
                        key="tick"
                        aria-hidden
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-studojo-ink bg-studojo-green text-xs"
                        initial={m.reduced ? { opacity: 0 } : { scale: 0, rotate: -30 }}
                        animate={m.reduced ? { opacity: 1 } : { scale: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                        transition={m.reduced ? { duration: 0.12 } : { ...SPRING_SNAP, delay: 0.3 + i * 0.12 }}
                      >
                        <FiCheck strokeWidth={4} />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              ))}
            </motion.ul>
          </Card>

          <Card tone="muted" shadow="sm" pad="sm">
            <h3 className="flex items-center gap-2 font-satoshi text-[11px] font-bold uppercase tracking-[0.12em] text-studojo-muted">
              <FiEyeOff aria-hidden /> What we never do
            </h3>
            <ul className="mt-2 space-y-1.5">
              {NEVER.map((n) => (
                <li key={n} className="flex items-start gap-2 font-satoshi text-sm">
                  <FiX aria-hidden className="mt-0.5 shrink-0 text-[#be185d]" strokeWidth={3} />
                  {n}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <LiveRegion message={say} />
    </div>
  );
}
