const store = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MS = 60_000;
const MAX_STORE_SIZE = 10_000;

// Clean expired entries every 60s
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (entry.resetAt <= now) store.delete(key);
    }
}, 60_000);

export function checkRateLimit(
    key: string,
    max: number = DEFAULT_MAX,
    windowMs: number = DEFAULT_WINDOW_MS,
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        if (store.size >= MAX_STORE_SIZE) {
            const oldestKey = store.entries().next().value?.[0];
            if (oldestKey) store.delete(oldestKey);
        }
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: max - 1, resetAt };
    }

    if (entry.count >= max) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}
