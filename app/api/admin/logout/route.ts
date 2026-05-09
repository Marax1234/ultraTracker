import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", req.url), 303)
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
  return response
}
