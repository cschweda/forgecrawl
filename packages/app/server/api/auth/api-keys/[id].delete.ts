import { getDb } from '../../../db'
import { apiKeys } from '../../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler((event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'API key ID required' })
  }

  const db = getDb()

  const key = db.select().from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, user.id)))
    .get()

  if (!key) {
    throw createError({ statusCode: 404, message: 'API key not found' })
  }

  db.delete(apiKeys).where(eq(apiKeys.id, id)).run()

  return { success: true }
})
