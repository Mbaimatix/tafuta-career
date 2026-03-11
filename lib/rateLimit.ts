interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

type Limiter = (ip: string) => RateLimitResult;

function createLimiter(maxRequests: number, windowMs: number): Limiter {
  const store = new Map<string, RateLimitEntry>();

  return (ip: string): RateLimitResult => {
    try {
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now - entry.windowStart >= windowMs) {
        store.set(ip, { count: 1, windowStart: now });
        return { allowed: true, retryAfter: 0 };
      }

      if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
        return { allowed: false, retryAfter };
      }

      entry.count++;
      return { allowed: true, retryAfter: 0 };
    } catch {
      // On cold start or unexpected error, allow the request rather than blocking
      return { allowed: true, retryAfter: 0 };
    }
  };
}

/** 60 requests per minute — for general API endpoints */
export const apiLimiter = createLimiter(60, 60_000);

/** 5 requests per hour — for contact form submissions */
export const contactLimiter = createLimiter(5, 3_600_000);

/** 3 requests per hour — for email sending endpoints */
export const emailLimiter = createLimiter(3, 3_600_000);

/** Extract the real client IP from request headers (Vercel-compatible) */
export function getIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}
