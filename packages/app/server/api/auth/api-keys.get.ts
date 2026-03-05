import { getDb } from '../../db'
import { apiKeys } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler((event) => {
  const user = event.context.user
  const db = getDb()

  const keys = db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    keyPrefix: apiKeys.keyPrefix,
    lastUsedAt: apiKeys.lastUsedAt,
    expiresAt: apiKeys.expiresAt,
    createdAt: apiKeys.createdAt,
  })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.id))
    .orderBy(desc(apiKeys.createdAt))
    .all()

  return { keys }
})
