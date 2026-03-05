import { verifyToken } from '../auth/jwt'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Skip auth for public routes
  if (path === '/api/health') return
  if (path === '/api/auth/setup') return
  if (path === '/api/auth/login') return
  if (path === '/api/auth/logout') return
  if (!path.startsWith('/api/')) return

  // Session cookie (JWT)
  const token = getCookie(event, 'forgecrawl_session')
  if (token) {
    const result = await verifyToken(token)
    if (result.valid) {
      event.context.user = {
        id: result.payload.sub,
        email: result.payload.email,
        role: result.payload.role,
      }
      event.context.authMethod = 'session'
      return
    }

    // Token exists but invalid — clear the stale cookie
    deleteCookie(event, 'forgecrawl_session', { path: '/' })

    if (result.expired) {
      throw createError({
        statusCode: 401,
        message: 'Session expired. Please log in again.',
        data: { expired: true },
      })
    }
  }

  throw createError({ statusCode: 401, message: 'Authentication required' })
})
