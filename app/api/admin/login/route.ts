import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { signSession, COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.redirect(new URL("/admin/login?error=rate_limit", req.url), 303)
  }

  const formData = await req.formData()
  const password = String(formData.get("password") ?? "")

  const expected = process.env.ADMIN_PASSWORD ?? ""
  const passwordBuf = Buffer.from(password)
  const expectedBuf = Buffer.from(expected)

  const match =
    passwordBuf.length === expectedBuf.length &&
    timingSafeEqual(passwordBuf, expectedBuf)

  if (!match) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", req.url), 303)
  }

  const token = await signSession()
  const isProduction = process.env.NODE_ENV === "production"

  const response = NextResponse.redirect(new URL("/admin", req.url), 303)
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  })

  return response
}
