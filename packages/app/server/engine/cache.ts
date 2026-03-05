import { getDb } from '../db'
import { scrapeResults } from '../db/schema'
import { eq, gte, desc, and } from 'drizzle-orm'

export function getCachedResult(url: string, ttlSeconds: number) {
  if (ttlSeconds <= 0) return null

  // SQLite datetime('now') format: YYYY-MM-DD HH:MM:SS
  const cutoffDate = new Date(Date.now() - ttlSeconds * 1000)
  const cutoff = cutoffDate.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
  const db = getDb()

  const result = db.select().from(scrapeResults)
    .where(
      and(
        eq(scrapeResults.url, url),
        gte(scrapeResults.createdAt, cutoff),
      ),
    )
    .orderBy(desc(scrapeResults.createdAt))
    .limit(1)
    .get()

  return result || null
}
