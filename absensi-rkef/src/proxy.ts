import { NextRequest, NextResponse } from "next/server";
import { getDeviceType } from "@/lib/device";

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent");
  const deviceType = getDeviceType(userAgent);
  const { pathname } = request.nextUrl;

  // Panel admin hanya boleh diakses dari laptop/desktop.
  if (pathname.startsWith("/admin") && deviceType === "mobile") {
    const url = request.nextUrl.clone();
    url.pathname = "/desktop-only";
    const response = NextResponse.rewrite(url);
    response.headers.set("x-device-type", deviceType);
    return response;
  }

  // Sematkan tipe perangkat agar bisa dibaca halaman/komponen lain.
  const response = NextResponse.next();
  response.headers.set("x-device-type", deviceType);
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/", "/pengawas/:path*"],
};
