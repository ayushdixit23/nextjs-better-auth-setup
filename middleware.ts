import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  DEFAULT_REDIRECT_PATH,
  DEFAULT_RESTRICTED_REDIRECT_PATH,
  RESTRICTED_PATHS,
} from "./app/utils/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (RESTRICTED_PATHS.includes(pathname)) {
    if (!sessionCookie) return NextResponse.next();
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url));
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL(DEFAULT_RESTRICTED_REDIRECT_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|map|json|txt)).*)",
	],
};