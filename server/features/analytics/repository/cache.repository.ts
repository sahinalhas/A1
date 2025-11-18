import { getDatabase } from '../../../lib/database/connection.js';
import { randomUUID } from 'crypto';

export interface CacheEntry {
  id: string;
  cache_key: string;
  cache_type: 'reports_overview' | 'student_analytics' | 'class_comparison' | 'risk_profiles' | 'early_warnings';
  data: string;
  created_at: string;
  expires_at: string;
  metadata?: string;
}

export interface CacheOptions {
  ttlMinutes?: number;
  metadata?: Record<string, unknown>;
}

const DEFAULT_TTL_MINUTES = 30;

export function getCachedData(cacheKey: string): CacheEntry | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const entry = db.prepare(`
    SELECT * FROM analytics_cache 
    WHERE cache_key = ? AND expires_at > ?
  `).get(cacheKey, now) as CacheEntry | undefined;

  return entry || null;
}

export function setCachedData(
  cacheKey: string,
  cacheType: CacheEntry['cache_type'],
  data: unknown,
  options: CacheOptions = {}
): CacheEntry {
  const db = getDatabase();
  const { ttlMinutes = DEFAULT_TTL_MINUTES, metadata } = options;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  
  const id = randomUUID();
  const dataString = JSON.stringify(data);
  const metadataString = metadata ? JSON.stringify(metadata) : null;

  db.prepare(`
    INSERT OR REPLACE INTO analytics_cache 
    (id, cache_key, cache_type, data, created_at, expires_at, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, cacheKey, cacheType, dataString, now.toISOString(), expiresAt.toISOString(), metadataString);

  return {
    id,
    cache_key: cacheKey,
    cache_type: cacheType,
    data: dataString,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    metadata: metadataString || undefined
  };
}

export function invalidateCache(cacheKey?: string, cacheType?: CacheEntry['cache_type']): number {
  const db = getDatabase();
  if (cacheKey) {
    const result = db.prepare('DELETE FROM analytics_cache WHERE cache_key = ?').run(cacheKey);
    return result.changes;
  }
  
  if (cacheType) {
    const result = db.prepare('DELETE FROM analytics_cache WHERE cache_type = ?').run(cacheType);
    return result.changes;
  }
  
  const result = db.prepare('DELETE FROM analytics_cache').run();
  return result.changes;
}

export function cleanupExpiredCache(): number {
  const db = getDatabase();
  const now = new Date().toISOString();
  const result = db.prepare('DELETE FROM analytics_cache WHERE expires_at <= ?').run(now);
  return result.changes;
}

export function getCacheStats() {
  const db = getDatabase();
  const total = db.prepare('SELECT COUNT(*) as count FROM analytics_cache').get() as { count: number };
  const expired = db.prepare('SELECT COUNT(*) as count FROM analytics_cache WHERE expires_at <= ?')
    .get(new Date().toISOString()) as { count: number };
  
  const byType = db.prepare(`
    SELECT cache_type, COUNT(*) as count 
    FROM analytics_cache 
    GROUP BY cache_type
  `).all() as Array<{ cache_type: string; count: number }>;

  return {
    total: total.count,
    expired: expired.count,
    active: total.count - expired.count,
    byType
  };
}
