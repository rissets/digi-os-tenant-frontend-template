import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale");
  if (locale !== "id" && locale !== "en") return NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  const cookie = `tenant_locale=${locale}`;
  requestHeaders.set("cookie", request.headers.get("cookie") ? `${request.headers.get("cookie")}; ${cookie}` : cookie);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set("tenant_locale", locale, { httpOnly: false, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
