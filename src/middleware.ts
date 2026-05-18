import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const role = session.user.role;
  if (pathname.startsWith("/coach") && role !== "COACH" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/client", req.nextUrl.origin));
  }
  if (pathname.startsWith("/client") && role === "COACH") {
    return NextResponse.redirect(new URL("/coach", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/coach/:path*", "/client/:path*"],
};
