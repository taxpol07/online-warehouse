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

// YENİ EKLENEN: Kategorileri temizleyip standartlaştıran fonksiyon (Tekrarları engeller)
const formatCategory = (cat: string) => {
  if (!cat) return "Other";
  const clean = cat.trim(); // Boşlukları siler
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase(); // İlk harfi büyük, kalanı küçük yapar
};

export default function HomePage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Homepage fetch error:", error);
        setError(error.message || JSON.stringify(error));
        setItems([]);
      } else {
        setError(null);
        const parsedItems = (data || []).map((item: any) => ({
          ...item,
          image_urls: parseImageUrls(item.image_urls),
        }));
        setItems(parsedItems);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  // GÜNCELLENEN KISIM: Kategorileri alırken formatlıyoruz
  const categories = [
    "All", 
    ...Array.from(new Set(items.map((item) => formatCategory(item.category))))
  ];

  // GÜNCELLENEN KISIM: Ürünleri filtrelerken formatlı isme göre arıyoruz
  const filteredItems = selectedCategory === "All" 
    ? items 
    : items.filter((item) => formatCategory(item.category) === selectedCategory);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ÜST BİLGİ, MARKA VE İMZA KISMI */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            {/* Şık KESER Logosu */}
            <div className="flex items-baseline gap-2 mb-1">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-900 to-slate-900">
                KESER
              </h1>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400 tracking-tight">
                Catering
              </span>
            </div>
            
            <p className="mt-2 text-slate-600 max-w-2xl text-base sm:text-lg">
              En yeni endüstriyel mutfak ekipmanlarını buradan görüntüleyin. Ürün detaylarını görmek için kartlardan birine tıklayın.
            </p>

            {/* Geliştirici İmza Rozeti */}
            <div className="mt-4">
              <span className="inline-flex items-center rounded-full bg-blue-50/80 px-3.5 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/20 shadow-sm backdrop-blur-sm">
                <span className="mr-1.5">🚀</span> 
                Designed & Developed by <strong className="ml-1 tracking-wide">Polat Can</strong>
              </span>
            </div>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
          >
            Admin Login
          </Link>
        </div>

        {/* KATEGORİ FİLTRE BUTONLARI */}
        {!loading && items.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* İÇERİK ALANI */}
        {loading ? (
          <div className="min-h-[320px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Hata: {error}
          </div>
        ) : envMissing ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-orange-700">
            Yayına alınan ortamda Supabase anahtarları bulunamadı.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            {selectedCategory === "All" 
              ? "Henüz ürün eklenmemiş." 
              : `"${selectedCategory}" kategorisinde ürün bulunamadı.`}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const statusText = item.status?.toString().toLowerCase() === "available"
                ? "Available"
                : item.status?.toString().toLowerCase() === "sold"
                ? "Sold"
                : item.status;

              return (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-64 bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.image_urls[0] || "/placeholder.png"}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4">
                       <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-md border ${
                         statusText === "Available" 
                          ? "bg-emerald-500/90 text-white border-emerald-400" 
                          : "bg-red-500/90 text-white border-red-400"
                       }`}>
                         {statusText}
                       </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <span className="text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                        {/* Kategori ismini kartta da düzenli gösteriyoruz */}
                        {formatCategory(item.category)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 truncate">{item.title}</h2>
                    <p className="text-slate-500 text-sm mb-4 truncate">
                      {item.brand} • {item.model}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                      <span className="text-2xl font-extrabold text-slate-900">£{item.price.toLocaleString("en-GB")}</span>
                      <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Details <span aria-hidden="true">&rarr;</span>
                      </span>
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