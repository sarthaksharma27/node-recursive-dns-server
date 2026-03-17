interface CacheEntry {
  buffer: Buffer;
  expiresAt: number;
}

class DNSCache {
  private cache = new Map<string, CacheEntry>();

  private makeKey(domain: string, qtype: number): string {
    return `${domain}:${qtype}`;
  }

  public get(domain: string, qtype: number): Buffer | null {
    const key = this.makeKey(domain, qtype);
    const entry = this.cache.get(key);

    if (!entry) return null;
   
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null; 
    }

    return entry.buffer;
  }

  public set(domain: string, qtype: number, buffer: Buffer, ttlSeconds: number): void {
    const key = this.makeKey(domain, qtype);
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { buffer, expiresAt });
  }
}

export const dnsCache = new DNSCache();