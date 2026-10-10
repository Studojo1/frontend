import { useEffect, useState } from "react";

type Data = { handle: string; total: number; weeks: number[][]; start: string | null };

const LEVEL = ["bg-neutral-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600", "bg-emerald-800"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Public GitHub contribution graph for a handle, via /api/profile/github. */
export function GithubGraph({ handle }: { handle: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetch(`/api/profile/github?u=${encodeURIComponent(handle)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (r.ok) setData(d as Data);
        else setError(r.status === 404 ? `No GitHub user called @${handle}.` : "GitHub didn't answer. Try again later.");
      })
      .catch(() => !cancelled && setError("GitHub didn't answer. Try again later."));
    return () => {
      cancelled = true;
    };
  }, [handle]);

  // Month label above the first week that starts in a new month.
  const labels: (string | null)[] = [];
  if (data?.start) {
    const start = new Date(`${data.start}T00:00:00Z`);
    let last = -1;
    data.weeks.forEach((_, w) => {
      const d = new Date(start.getTime() + w * 7 * 86400000);
      const m = d.getUTCMonth();
      labels.push(m !== last && w < data.weeks.length - 1 ? MONTHS[m] : null);
      last = m;
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-['Satoshi'] text-sm text-neutral-700">
          {data ? (
            <>
              <span className="font-bold text-neutral-900">{data.total.toLocaleString()}</span> contributions in the last year
            </>
          ) : error ? (
            <span className="text-neutral-500">{error}</span>
          ) : (
            <span className="inline-block h-4 w-48 animate-pulse rounded bg-neutral-100" />
          )}
        </p>
        <a
          href={`https://github.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-['Satoshi'] text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          @{handle} ↗
        </a>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1">
          {data && (
            <div className="flex gap-[3px] pl-0 font-['Satoshi'] text-[9px] text-neutral-400">
              {labels.map((l, i) => (
                <span key={i} className="w-[10px] overflow-visible whitespace-nowrap">{l ?? ""}</span>
              ))}
            </div>
          )}
          <div className="flex gap-[3px]">
            {(data?.weeks ?? Array.from({ length: 53 }, () => Array(7).fill(0))).map((week, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {week.map((lvl, d) => (
                  <span
                    key={d}
                    className={`h-[10px] w-[10px] rounded-[2px] ${lvl < 0 ? "bg-transparent" : data ? LEVEL[lvl] : "animate-pulse bg-neutral-100"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
