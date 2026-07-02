"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/auth";

interface Equipment {
  id: string;
  title: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  status: string;
  image_urls: string[];
}

const parseImageUrls = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

export default function HomePage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setDebugInfo(null);
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Homepage fetch error:", error);
        setError(error.message || JSON.stringify(error));
        setItems([]);
        setDebugInfo("Supabase sorgusunda hata oluştu. Lütfen policy ve anon key ayarlarını kontrol edin.");
      } else {
        setError(null);
        const parsedItems = (data || []).map((item: any) => ({
          ...item,
          image_urls: parseImageUrls(item.image_urls),
        }));
        setItems(parsedItems);
        setDebugInfo(`Supabase sorgusu tamamlandı. Dönen satır sayısı: ${parsedItems.length}`);
      }

      setLoading(false);
    };

    fetchItems();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Premier Catering Warehouse
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              En yeni ekipmanları buradan görüntüleyin. Ürün detaylarını görmek için kartlardan birine tıklayın.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-700 transition"
          >
            Admin Login
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[320px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Hata: {error}
          </div>
        ) : envMissing ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-orange-700">
            Yayına alınan ortamda Supabase anahtarları bulunamadı. `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini projenize ekleyin.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Henüz ürün eklenmemiş.
            {debugInfo && (
              <div className="mt-4 text-sm text-slate-400">{debugInfo}</div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const statusText = item.status?.toString().toLowerCase() === "available"
                ? "Available"
                : item.status?.toString().toLowerCase() === "sold"
                ? "Sold"
                : item.status;

              return (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="h-64 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image_urls[0] || "/placeholder.png"}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3 mb-3 text-sm">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 uppercase tracking-[0.18em]">
                        {statusText}
                      </span>
                      <span className="text-slate-500">{item.category}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h2>
                    <p className="text-slate-600 text-sm mb-4">
                      {item.brand} • {item.model}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold text-slate-900">£{item.price.toLocaleString("en-GB")}</span>
                      <span className="text-slate-400 text-sm">Detaylar için tıklayın</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
