import { HttpErrorResponse } from '@angular/common/http';

export interface RateLimitInfo {
  limited: true;
  retryAfterSeconds: number;
  message: string;
}

export function asRateLimit(err: HttpErrorResponse): RateLimitInfo | null {
  if (err.status !== 429) return null;
  const headerRetry = Number(err.headers.get('Retry-After')) || 0;
  const bodyRetry = Number((err.error as any)?.retryAfterSeconds) || 0;
  const retryAfter = headerRetry || bodyRetry || 3600;
  const message =
    (err.error as any)?.message ??
    'SOS rate limit exceeded. Please try again later.';
  return { limited: true, retryAfterSeconds: retryAfter, message };
}
