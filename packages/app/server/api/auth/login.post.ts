import { getDb } from '../../db'
import { users } from '../../db/schema'
import { verifyPassword } from '../../auth/password'
import { createToken } from '../../auth/jwt'
import { checkLoginRateLimit, recordFailedLogin, clearLoginAttempts } from '../../utils/login-limiter'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, message: 'Email and password required' })
  }

  // Rate limit check
  checkLoginRateLimit(body.email)

  const db = getDb()
  const user = db.select().from(users)
    .where(eq(users.email, body.email))
    .get()

  if (!user) {
    // Constant-time: still hash to prevent timing attacks
    await verifyPassword(body.password, '$2b$12$invalidhashpaddingthatislongenough')
    recordFailedLogin(body.email)
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) {
    recordFailedLogin(body.email)
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  // Reset rate limit on success
  clearLoginAttempts(body.email)

  const token = await createToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  setCookie(event, 'forgecrawl_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: useRuntimeConfig().sessionMaxAge as number,
    path: '/',
  })

  return {
    success: true,
    user: { id: user.id, email: user.email, role: user.role },
  }
})
