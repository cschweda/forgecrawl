import { getDb } from '../../db'
import { apiKeys } from '../../db/schema'
import { generateApiKey } from '../../auth/api-key'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  const name = body.name?.trim()
  if (!name) {
    throw createError({ statusCode: 400, message: 'API key name is required' })
  }

  const { rawKey, keyHash, keyPrefix } = generateApiKey()

  const db = getDb()
  const id = crypto.randomUUID()

  db.insert(apiKeys).values({
    id,
    userId: user.id,
    name,
    keyHash,
    keyPrefix,
    expiresAt: body.expiresAt || null,
  }).run()

  // Return the raw key ONCE — it cannot be retrieved again
  return {
    id,
    name,
    key: rawKey,
    keyPrefix,
    expiresAt: body.expiresAt || null,
    message: 'Store this key securely. It will not be shown again.',
  }
})
