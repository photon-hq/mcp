import { SDK, type AdvancedIMessageKit, type PhotonEventName } from "@photon-ai/advanced-imessage-kit";
import { createHash } from "node:crypto";

const DEFAULT_TOOL_TIMEOUT_MS = 30_000;

export class ToolTimeoutError extends Error {
  constructor(ms: number) {
    super(`Tool execution timed out after ${ms}ms`);
    this.name = "ToolTimeoutError";
  }
}

export class BackendUnavailableError extends Error {
  constructor(cause?: unknown) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    super(`iMessage backend unavailable: ${msg}`);
    this.name = "BackendUnavailableError";
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number = DEFAULT_TOOL_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ToolTimeoutError(ms)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export interface BufferedEvent {
  id: number;
  event: string;
  data: unknown;
  timestamp: number;
}

interface PoolEntry {
  sdk: AdvancedIMessageKit;
  events: BufferedEvent[];
  cursor: number;
  lastUsedAt: number;
  connectPromise: Promise<void> | null;
}

const BUFFER_SIZE = 1000;
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const pool = new Map<string, PoolEntry>();

const BUFFERED_EVENTS: PhotonEventName[] = [
  "new-message",
  "updated-message",
  "message-send-error",
  "chat-read-status-changed",
  "typing-indicator",
  "group-name-change",
  "participant-added",
  "participant-removed",
  "participant-left",
  "group-icon-changed",
  "group-icon-removed",
  "new-findmy-location",
  "incoming-facetime",
  "ft-call-status-changed",
  "scheduled-message-created",
  "scheduled-message-updated",
  "scheduled-message-deleted",
  "scheduled-message-sent",
  "scheduled-message-error",
  "config-update",
  "settings-backup-created",
  "settings-backup-updated",
  "settings-backup-deleted",
  "theme-backup-created",
  "theme-backup-updated",
  "theme-backup-deleted",
  "imessage-aliases-removed",
];

function hashKey(serverUrl: string, apiKey: string): string {
  return createHash("sha256").update(serverUrl + apiKey).digest("hex");
}

function pushEvent(entry: PoolEntry, event: string, data: unknown): void {
  entry.cursor++;
  const buffered: BufferedEvent = {
    id: entry.cursor,
    event,
    data,
    timestamp: Date.now(),
  };

  if (entry.events.length >= BUFFER_SIZE) {
    entry.events.shift();
  }
  entry.events.push(buffered);
}

function attachEventListeners(entry: PoolEntry): void {
  for (const eventName of BUFFERED_EVENTS) {
    entry.sdk.on(eventName as any, (data: any) => {
      pushEvent(entry, eventName, data);
    });
  }
}

function wrapWithTimeouts(sdk: AdvancedIMessageKit): AdvancedIMessageKit {
  return new Proxy(sdk, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "object" || value === null) return value;

      return new Proxy(value, {
        get(nsTarget, nsProp, nsReceiver) {
          const method = Reflect.get(nsTarget, nsProp, nsReceiver);
          if (typeof method !== "function") return method;
          return (...args: unknown[]) => {
            const result = method.apply(nsTarget, args);
            if (result && typeof result.then === "function") {
              return withTimeout(result, DEFAULT_TOOL_TIMEOUT_MS);
            }
            return result;
          };
        },
      });
    },
  }) as AdvancedIMessageKit;
}

export async function getSDK(serverUrl: string, apiKey: string): Promise<AdvancedIMessageKit> {
  const key = hashKey(serverUrl, apiKey);
  const existing = pool.get(key);

  if (existing) {
    existing.lastUsedAt = Date.now();
    if (existing.connectPromise) {
      try {
        await existing.connectPromise;
      } catch {
        pool.delete(key);
        throw new BackendUnavailableError("Connection to iMessage backend failed");
      }
    }
    return wrapWithTimeouts(existing.sdk);
  }

  let sdk: AdvancedIMessageKit;
  try {
    sdk = SDK({ serverUrl, apiKey });
  } catch (err) {
    throw new BackendUnavailableError(err);
  }

  const entry: PoolEntry = {
    sdk,
    events: [],
    cursor: 0,
    lastUsedAt: Date.now(),
    connectPromise: null,
  };

  pool.set(key, entry);

  const connectPromise = withTimeout(sdk.connect(), 15_000).then(() => {
    entry.connectPromise = null;
    attachEventListeners(entry);
  }).catch((err) => {
    pool.delete(key);
    throw new BackendUnavailableError(err);
  });

  entry.connectPromise = connectPromise;
  await connectPromise;

  return wrapWithTimeouts(sdk);
}

export interface PollResult {
  events: BufferedEvent[];
  cursor: number;
  missed: boolean;
}

export async function pollEvents(
  serverUrl: string,
  apiKey: string,
  afterCursor: number = 0,
  timeoutMs: number = 15000,
): Promise<PollResult> {
  const key = hashKey(serverUrl, apiKey);
  const entry = pool.get(key);

  if (!entry) {
    return { events: [], cursor: 0, missed: true };
  }

  entry.lastUsedAt = Date.now();

  const buffered = entry.events.filter((e) => e.id > afterCursor);
  if (buffered.length > 0) {
    const oldest = entry.events[0];
    const missed = oldest ? afterCursor > 0 && afterCursor < oldest.id : false;
    return { events: buffered, cursor: entry.cursor, missed };
  }

  return new Promise<PollResult>((resolve) => {
    const startCursor = entry.cursor;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ events: [], cursor: entry.cursor, missed: false });
      }
    }, timeoutMs);

    const check = () => {
      if (settled) return;
      if (entry.cursor > startCursor) {
        settled = true;
        clearTimeout(timer);
        const newEvents = entry.events.filter((e) => e.id > afterCursor);
        resolve({ events: newEvents, cursor: entry.cursor, missed: false });
      } else {
        setTimeout(check, 200);
      }
    };

    setTimeout(check, 200);
  });
}

export async function closeAll(): Promise<void> {
  const entries = Array.from(pool.values());
  pool.clear();
  await Promise.allSettled(entries.map((e) => e.sdk.close()));
}

const sweepInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of pool) {
    if (now - entry.lastUsedAt > IDLE_TIMEOUT_MS) {
      pool.delete(key);
      entry.sdk.close().catch(() => {});
    }
  }
}, SWEEP_INTERVAL_MS);

sweepInterval.unref();

process.on("SIGTERM", async () => {
  clearInterval(sweepInterval);
  await closeAll();
  process.exit(0);
});

process.on("SIGINT", async () => {
  clearInterval(sweepInterval);
  await closeAll();
  process.exit(0);
});
