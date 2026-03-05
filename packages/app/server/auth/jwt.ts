import { SignJWT, jwtVerify, errors } from 'jose'

function getSecret() {
  const secret = useRuntimeConfig().authSecret
  if (!secret || secret.length < 32) {
    throw new Error('NUXT_AUTH_SECRET must be at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

function getMaxAge(): number {
  return (useRuntimeConfig().sessionMaxAge as number) || 15 * 24 * 60 * 60
}

export async function createToken(user: {
  id: string
  email: string
  role: string
}): Promise<string> {
  const maxAge = getMaxAge()
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAge)
    .sign(getSecret())
}

export type TokenResult =
  | { valid: true; payload: { sub: string; email: string; role: string } }
  | { valid: false; expired: boolean }

export async function verifyToken(token: string): Promise<TokenResult> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      valid: true,
      payload: payload as { sub: string; email: string; role: string },
    }
  } catch (err) {
    return {
      valid: false,
      expired: err instanceof errors.JWTExpired,
    }
  }
}
