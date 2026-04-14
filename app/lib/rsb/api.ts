import { getToken, ControlPlaneError } from "~/lib/control-plane";

const BASE = "/api/v1/rsb";

export async function rsbFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("Not authenticated", 401);

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ControlPlaneError(body || res.statusText, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function rsbStreamFetch(
  path: string,
  body: unknown,
): Promise<Response> {
  const token = await getToken();
  if (!token) throw new ControlPlaneError("Not authenticated", 401);
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });
}

function findEventEnd(buffer: string): { idx: number; sepLen: number } | null {
  // SSE events are separated by a blank line, which may be \n\n or \r\n\r\n.
  const a = buffer.indexOf("\r\n\r\n");
  const b = buffer.indexOf("\n\n");
  if (a === -1 && b === -1) return null;
  if (a === -1) return { idx: b, sepLen: 2 };
  if (b === -1) return { idx: a, sepLen: 4 };
  return a < b ? { idx: a, sepLen: 4 } : { idx: b, sepLen: 2 };
}

export async function* parseSSE(res: Response): AsyncGenerator<{ event: string; data: string }> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let hit: { idx: number; sepLen: number } | null;
    while ((hit = findEventEnd(buffer)) !== null) {
      const rawEvent = buffer.slice(0, hit.idx);
      buffer = buffer.slice(hit.idx + hit.sepLen);
      let event = "message";
      const dataLines: string[] = [];
      for (const rawLine of rawEvent.split(/\r?\n/)) {
        const line = rawLine;
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
      }
      yield { event, data: dataLines.join("\n") };
    }
  }
}
