// Tables and models. Each scrolls sideways inside its own box on a phone (the
// page never does), with its first column pinned while it scrolls.
import type { CSSProperties } from "react";
import type { BlockView } from "./view";

type Of<T extends BlockView["type"]> = Extract<BlockView, { type: T }>;

const pin = "sticky left-0 z-[1] bg-(--pp-row)";

export function Table({ b }: { b: Of<"table"> }) {
  const labelled = b.align[0] === "left";
  return (
    <figure className="min-w-0" style={{ "--pp-row": "var(--pp-bg)" } as CSSProperties}>
      {b.caption && <figcaption className="mb-3 text-[14px] font-bold leading-snug">{b.caption}</figcaption>}
      <div className="pp-scroll" tabIndex={0} role="region" aria-label={b.caption || "Table"}>
        <table className="pp-data w-full border-collapse text-[15px] leading-snug" style={{ minWidth: Math.max(300, b.columns.length * 104) }}>
          <thead>
            <tr className="border-b-[1.5px] border-(--pp-ink)">
              {b.columns.map((c, i) => (
                <th key={i} scope="col" className={`py-2.5 pr-4 align-bottom text-[13px] font-bold whitespace-nowrap text-(--pp-muted) last:pr-0 ${b.align[i] === "right" ? "text-right" : "text-left"} ${i === 0 && labelled ? pin : ""}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i} className="border-b border-(--pp-line)">
                {r.map((c, j) => {
                  const cls = `py-3 pr-4 last:pr-0 ${b.align[j] === "right" ? "text-right whitespace-nowrap" : "text-left"}`;
                  return j === 0 && labelled ? (
                    <th key={j} scope="row" className={`${cls} font-bold ${pin}`}>
                      {c.text}
                    </th>
                  ) : (
                    <td key={j} className={cls}>
                      {c.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function Model({ b }: { b: Of<"model"> }) {
  return (
    <figure className="min-w-0 rounded-2xl border border-(--pp-line) bg-(--pp-surface) px-4 py-5 sm:px-7 sm:py-6" style={{ "--pp-row": "var(--pp-surface)" } as CSSProperties}>
      {b.title && <figcaption className="pp-head mb-4 text-[19px] font-semibold leading-tight sm:text-[21px]">{b.title}</figcaption>}
      <div className="pp-scroll" tabIndex={0} role="region" aria-label={b.title || "Model"}>
        <table className="pp-data w-full border-collapse text-[15px] leading-snug" style={{ minWidth: 140 + b.columns.length * 92 }}>
          <thead>
            <tr className="border-b-[1.5px] border-(--pp-ink)">
              <td className={pin} />
              {b.columns.map((c, i) => (
                <th key={i} scope="col" className="py-2.5 pl-4 text-right align-bottom text-[13px] font-bold whitespace-nowrap text-(--pp-muted)">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i} className={r.bold ? "border-t-[1.5px] border-(--pp-ink) font-bold" : "border-t border-(--pp-line)"}>
                <th scope="row" className={`py-3 pr-4 text-left ${r.bold ? "font-bold" : "font-medium"} ${pin}`}>
                  {r.label}
                </th>
                {r.cells.map((c, j) => (
                  <td key={j} className="py-3 pl-4 text-right whitespace-nowrap">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {b.notes && <p className="mt-4 text-[13.5px] leading-relaxed text-(--pp-muted)">{b.notes}</p>}
    </figure>
  );
}
