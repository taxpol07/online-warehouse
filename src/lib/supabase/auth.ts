import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

if (!/^https?:\/\//i.test(SUPABASE_URL)) {
  throw new Error(`Invalid Supabase URL: ${SUPABASE_URL}. It must start with https://`);
}

// DEĞİŞEN KISIM: Standart createClient yerine, çerez (cookie) uyumlu createBrowserClient kullanıyoruz.
export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);