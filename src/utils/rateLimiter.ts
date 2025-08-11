// Rate limiter utility for API calls
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RequestRecord {
  count: number;
  windowStart: number;
}

class RateLimiter {
  private records = new Map<string, RequestRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      identifier: 'default',
      ...config
    };
  }

  isAllowed(identifier: string = this.config.identifier!): boolean {
    const now = Date.now();
    const record = this.records.get(identifier);

    // Clean up old records periodically
    if (this.records.size > 100) {
      this.cleanup();
    }

    if (!record) {
      this.records.set(identifier, {
        count: 1,
        windowStart: now
      });
      return true;
    }

    // Reset window if expired
    if (now - record.windowStart >= this.config.windowMs) {
      record.count = 1;
      record.windowStart = now;
      return true;
    }

    // Check if under limit
    if (record.count < this.config.maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  getRemainingRequests(identifier: string = this.config.identifier!): number {
    const record = this.records.get(identifier);
    if (!record) return this.config.maxRequests;

    const now = Date.now();
    if (now - record.windowStart >= this.config.windowMs) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  getTimeUntilReset(identifier: string = this.config.identifier!): number {
    const record = this.records.get(identifier);
    if (!record) return 0;

    const now = Date.now();
    const timeUntilReset = (record.windowStart + this.config.windowMs) - now;
    return Math.max(0, timeUntilReset);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.records.forEach((record, key) => {
      if (now - record.windowStart >= this.config.windowMs) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.records.delete(key));
  }
}

// Rate limiter instances for different API endpoints
export const mapboxRateLimiter = new RateLimiter({
  maxRequests: 50, // Mapbox free tier allows 50,000 requests per month
  windowMs: 60 * 1000, // 1 minute window
  identifier: 'mapbox-api'
});

export const tileRateLimiter = new RateLimiter({
  maxRequests: 100, // More generous for tile requests
  windowMs: 60 * 1000, // 1 minute window
  identifier: 'mapbox-tiles'
});

// Generic rate limiting function
export const withRateLimit = <T extends any[]>(
  fn: (...args: T) => Promise<any>,
  rateLimiter: RateLimiter,
  identifier?: string
) => {
  return async (...args: T): Promise<any> => {
    if (!rateLimiter.isAllowed(identifier)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(identifier);
      const error = new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`
      );
      (error as any).isRateLimit = true;
      (error as any).retryAfter = timeUntilReset;
      throw error;
    }

    return fn(...args);
  };
};

// Utility to handle rate limit errors gracefully
export const handleRateLimitError = (error: any): boolean => {
  if (error.isRateLimit) {
    console.warn('Rate limit exceeded:', error.message);
    return true;
  }
  return false;
};

// Exponential backoff utility for retries
export const withExponentialBackoff = <T extends any[]>(
  fn: (...args: T) => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
) => {
  return async (...args: T): Promise<any> => {
    const attempt = async (retryCount: number): Promise<any> => {
      try {
        return await fn(...args);
      } catch (error) {
        if (retryCount >= maxRetries) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
        
        console.warn(`Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return attempt(retryCount + 1);
      }
    };

    return attempt(0);
  };
};