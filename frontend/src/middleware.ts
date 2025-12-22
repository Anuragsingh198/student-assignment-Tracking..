import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth-token")?.value;

  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const teacherRoutes = ["/teacher"];
  const isTeacherRoute = teacherRoutes.some(route => pathname.startsWith(route));

  const studentRoutes = ["/student"];
  const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
