import CircuitBreaker from 'opossum';

interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  maxRetries?: number;
}

export class CircuitBreakerService {
  private breakers: Map<string, CircuitBreaker> = new Map();

  constructor(private defaultOptions: CircuitBreakerOptions = {}) {
    this.defaultOptions = {
      timeout: 3000, // 3 seconds
      errorThresholdPercentage: 50, // 50% of requests fail
      resetTimeout: 30000, // 30 seconds
      maxRetries: 3,
      ...defaultOptions,
    };
  }

    public getBreaker(name: string, fn: (...args: unknown[]) => Promise<unknown>, options: CircuitBreakerOptions = {}): CircuitBreaker<unknown[], unknown> {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker(fn, {
        ...this.defaultOptions,
        ...options,
      });

      // Add event listeners
      breaker.on('open', () => {
        console.warn(`Circuit Breaker '${name}' is open (failing fast)`);
      });

      breaker.on('halfOpen', () => {
        console.info(`Circuit Breaker '${name}' is half open`);
      });

      breaker.on('close', () => {
        console.info(`Circuit Breaker '${name}' is closed`);
      });

      breaker.on('fallback', () => {
        console.warn(`Circuit Breaker '${name}' fallback called`);
      });

      this.breakers.set(name, breaker);
    }

    return this.breakers.get(name)!;
  }

  public async execute<T>(name: string, fn: (...args: unknown[]) => Promise<T>, ...args: unknown[]): Promise<T> {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker(fn, this.defaultOptions);
      this.breakers.set(name, breaker);
    }
    return await this.breakers.get(name)!.fire(...args) as T;
  }

  public getStats(name: string) {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return null;
    }

    return {
      name,
      state: breaker.status,
      stats: breaker.stats,
      isClosed: breaker.closed,
      isOpen: breaker.opened,
      isHalfOpen: breaker.halfOpen,
    };
  }

  public getAllStats() {
    const stats: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      stats[name] = this.getStats(name);
    });
    return stats;
  }

  public reset(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.close();
    }
  }

  public resetAll() {
    this.breakers.forEach(breaker => breaker.close());
  }
}
