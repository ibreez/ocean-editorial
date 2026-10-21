/**
 * In-Memory Rate Limiter for Editorial CMS Authentication
 *
 * Protects administrative authentication against brute-force and credential stuffing.
 * Tracks failed login attempts per identifier (email/IP) with lockout windows.
 */

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  lockedUntil?: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

class AuthRateLimiter {
  private attempts = new Map<string, AttemptRecord>();

  /**
   * Checks if an identifier is currently rate limited or locked out.
   */
  public checkLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
    const key = identifier.toLowerCase().trim();
    const record = this.attempts.get(key);

    if (!record) {
      return { allowed: true };
    }

    const now = Date.now();

    // Check if lockout has expired
    if (record.lockedUntil) {
      if (now < record.lockedUntil) {
        const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
        return { allowed: false, retryAfterSeconds: remainingSec };
      } else {
        // Lockout expired, reset record
        this.attempts.delete(key);
        return { allowed: true };
      }
    }

    // Check if window has expired
    if (now - record.firstAttemptAt > WINDOW_MS) {
      this.attempts.delete(key);
      return { allowed: true };
    }

    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
      return { allowed: false, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
    }

    return { allowed: true };
  }

  /**
   * Records a failed authentication attempt.
   */
  public recordFailure(identifier: string): { locked: boolean; retryAfterSeconds?: number } {
    const key = identifier.toLowerCase().trim();
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now - record.firstAttemptAt > WINDOW_MS) {
      this.attempts.set(key, {
        count: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
      });
      return { locked: false };
    }

    record.count += 1;
    record.lastAttemptAt = now;

    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
      return { locked: true, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
    }

    return { locked: false };
  }

  /**
   * Resets attempts upon successful authentication.
   */
  public recordSuccess(identifier: string): void {
    const key = identifier.toLowerCase().trim();
    this.attempts.delete(key);
  }
}

export const authRateLimiter = new AuthRateLimiter();
