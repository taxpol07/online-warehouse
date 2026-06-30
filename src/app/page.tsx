"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

// 1. ADIM: TypeScript Interface
interface Equipment {
  id: string;
  title: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  image_urls: string[];
  status: "Available" | "Sold";
}

export default function HomePage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // PRODUCTS
  const fetchProducts = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    setItems(data || []);
    setLoading(false);
  };

  // CATEGORIES
  const fetchCategories = async () => {
    if (!supabase) return;
    const { data } = await supabase.from("equipment").select("category");

    if (!data) return;

    const unique = Array.from(
      new Set(data.map((item) => item.category).filter(Boolean))
    );

    setCategories(unique);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // FILTER (OPTIMIZED)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.title?.toLowerCase().includes(keyword) ||
        item.brand?.toLowerCase().includes(keyword) ||
        item.model?.toLowerCase().includes(keyword);

      const matchesCategory = category === "all" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  return (
    // YENİ ARKA PLAN: Göz yormayan, sıcak gri/taş rengi (Zinc tonları)
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 bg-zinc-40/90 backdrop-blur-md border-b border-zinc-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Premier <span className="text-blue-600">Catering UK</span>
          </h1>

          <button
            onClick={() => router.push("/admin/login")}
            className="text-sm font-semibold border-2 border-zinc-800 text-zinc-800 px-5 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-all duration-200"
          >
            Admin Panel
          </button>
        </div>
      </nav>

      {/* SUPABASE YAPILANDIRMA UYARISI */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-amber-800">
            <strong className="font-semibold">Supabase not configured.</strong>{" "}
            Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your
            project environment variables to load inventory.
          </div>
        </div>
      )}

      {/* HERO / SEARCH BÖLÜMÜ */}
      <div className="bg-zinc-100 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-zinc-800">
            Find the Best Used <br className="hidden md:block" /> 
            <span className="text-blue-600">Commercial Equipment</span>
          </h2>
          <p className="text-zinc-600 mb-8 text-lg max-w-2xl">
            Browse our up-to-date warehouse inventory. High quality, tested, and ready for your professional kitchen.
          </p>

          {/* ARAMA VE FİLTRELEME ÇUBUĞU */}
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl bg-white p-2 rounded-xl border border-zinc-300 shadow-sm">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-zinc-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search ovens, fryers, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-none bg-transparent focus:outline-none focus:ring-0 text-zinc-900 placeholder-zinc-400"
              />
            </div>
            
            <div className="h-px w-full md:h-auto md:w-px bg-zinc-200"></div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-700 font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ÜRÜN LİSTESİ (PRODUCTS GRID) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-300">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-zinc-900">No equipment found</h3>
            <p className="text-zinc-500 mt-1">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/product/${item.id}`)}
                className="group cursor-pointer bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* GÖRSEL ALANI (YENİDEN BOYUTLANDIRILDI) */}
                {/* aspect-square veya aspect-[4/3] kullanarak çerçevenin oranını kilitliyoruz. object-cover ise fotoğrafın içini bozmadan doldurmasını sağlıyor. */}
                <div className="w-full aspect-[4/3] bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                  {item.image_urls?.[0] ? (
                    <img
                      src={item.image_urls[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-zinc-400 font-medium">No Image</span>
                  )}
                  
                  {/* DURUM ETİKETİ (Status Badge) */}
                  <div className="absolute top-3 right-3">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                        item.status === "Available" 
                          ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200" 
                          : "bg-rose-100/90 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* BİLGİ ALANI */}
                <div className="p-5 flex flex-col flex-grow bg-white">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-zinc-900 leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-sm text-zinc-500 mb-4 line-clamp-1">
                    {item.brand} • {item.model}
                  </p>

                  <div className="mt-auto flex justify-between items-end border-t border-zinc-100 pt-4">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded-md">
                      {item.category}
                    </span>
                    <span className="text-xl font-extrabold text-zinc-900">
                      £{item.price.toLocaleString("en-GB")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
