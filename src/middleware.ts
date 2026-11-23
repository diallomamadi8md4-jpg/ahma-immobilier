import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { PORTAIL_COOKIE, verifyPortail } from "@/lib/portail-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // --- Espace administration ---
  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login";
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

    if (!session && !isLogin) {
      url.pathname = "/admin/login";
      url.searchParams.set("r", "1");
      return NextResponse.redirect(url);
    }
    if (session && isLogin) {
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- Espaces locataire / propriétaire ---
  const wantsLocataire = pathname.startsWith("/espace-locataire");
  const wantsProprietaire = pathname.startsWith("/espace-proprietaire");
  if (wantsLocataire || wantsProprietaire) {
    const role = wantsLocataire ? "locataire" : "proprietaire";
    const session = await verifyPortail(req.cookies.get(PORTAIL_COOKIE)?.value);

    if (!session) {
      url.pathname = role === "locataire" ? "/connexion-locataire" : "/connexion-proprietaire";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (session.role !== role) {
      url.pathname = session.role === "locataire" ? "/espace-locataire" : "/espace-proprietaire";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin", "/admin/:path*",
    "/espace-locataire", "/espace-locataire/:path*",
    "/espace-proprietaire", "/espace-proprietaire/:path*",
  ],
};
