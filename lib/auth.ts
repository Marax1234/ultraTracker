import { SignJWT, jwtVerify } from "jose"

export const COOKIE_NAME = "bua_admin"
export const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24 h

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET not set")
  return new TextEncoder().encode(secret)
}

export async function signSession(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecretKey())
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey())
    return true
  } catch {
    return false
  }
}
