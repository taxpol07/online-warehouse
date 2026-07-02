import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value; },
        set(name, value, options) { res.cookies.set({ name, value, ...options }); },
        remove(name, options) { res.cookies.set({ name, value: "", ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = req.nextUrl;

  // LOG EKLEDİK: Middleware'in ne düşündüğünü konsolda göreceğiz
  if (url.pathname.startsWith("/admin/dashboard")) {
    if (!user) {
      console.log("🔒 Middleware: Oturum bulunamadı, login'e gönderiliyor...");
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/dashboard/:path*"], // Login sayfasını matcher'dan çıkardık!
};