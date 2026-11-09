import type { AuthTokens } from '@/api/types';

const KEY = 'riven.auth.tokens';

// Browser storage can throw (private mode, blocked site data), so every access is guarded.
function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    // The session still works for this tab; it just won't survive a reload.
  }
}

let cached: AuthTokens | null = null;

export const tokenStorage = {
  load(): AuthTokens | null {
    const raw = read();
    try {
      cached = raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch {
      cached = null;
    }
    return cached;
  },
  get(): AuthTokens | null {
    return cached;
  },
  save(tokens: AuthTokens) {
    cached = tokens;
    write(JSON.stringify(tokens));
  },
  clear() {
    cached = null;
    write(null);
  },
};
