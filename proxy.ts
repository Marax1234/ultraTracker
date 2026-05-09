import { NextRequest, NextResponse } from "next/server"
import { verifySession, COOKIE_NAME } from "@/lib/auth"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === "/admin/login"
  const token = req.cookies.get(COOKIE_NAME)?.value
  const authenticated = token ? await verifySession(token) : false

  if (!isLoginPage && !authenticated) {
    const loginUrl = new URL("/admin/login", req.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
