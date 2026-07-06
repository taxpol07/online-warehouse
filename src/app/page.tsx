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

const formatCategory = (cat: string) => {
  if (!cat) return "Other";
  const clean = cat.trim(); 
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase(); 
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

  const categories = [
    "All", 
    ...Array.from(new Set(items.map((item) => formatCategory(item.category))))
  ];

  const filteredItems = selectedCategory === "All" 
    ? items 
    : items.filter((item) => formatCategory(item.category) === selectedCategory);

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-900 pb-12 font-sans selection:bg-blue-200">
      
      {/* ÜST BİLGİ (HEADER) */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Marka Alanı */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-slate-900">
                  KESER
                </h1>
                <span className="text-sm sm:text-base font-bold text-slate-400 tracking-widest uppercase">
                  Catering
                </span>
              </div>
            </div>

            {/* Admin ve İmza */}
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50/80 px-2.5 py-1 text-[10px] font-bold text-blue-700 tracking-wide">
                🚀 By Polat Can
              </span>
              <Link
                href="/admin/login"
                className="bg-slate-900 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-md"
              >
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden text-lg">⚙️</span>
              </Link>
            </div>
          </div>
        </div>

        {/* YATAY KAYDIRILABİLİR KATEGORİ ÇUBUĞU (TRENDYOL TARZI) */}
        {!loading && items.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        
        {/* İÇERİK ALANI */}
        {loading ? (
          <div className="min-h-[320px] flex flex-col gap-4 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">Loading machines...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm font-medium">
            Error: {error}
          </div>
        ) : envMissing ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-orange-700 text-sm font-medium">
            Supabase keys are missing in production.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 flex flex-col items-center justify-center text-center">
             <span className="text-4xl mb-3">📦</span>
            <p className="text-slate-500 font-medium">
              {selectedCategory === "All" 
                ? "Inventory is empty." 
                : `No equipment found in "${selectedCategory}".`}
            </p>
          </div>
        ) : (
          
          /* YENİ GRID YAPISI: Mobilde 2 sütun (Trendyol tarzı), tablette 3, bilgisayarda 4 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Kompakt Resim Alanı */}
                  <div className="h-40 sm:h-52 bg-slate-50 relative overflow-hidden">
                    <img
                      src={item.image_urls[0] || "/placeholder.png"}
                      alt={item.title}
                      className="h-full w-full object-contain p-2 transition duration-700 group-hover:scale-110"
                    />
                    
                    {/* Durum Rozeti (Mobilde daha küçük) */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                       <span className={`px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-md shadow-sm border ${
                         statusText === "Available" 
                          ? "bg-white/90 text-emerald-600 border-emerald-100" 
                          : "bg-white/90 text-red-600 border-red-100"
                       }`}>
                         {statusText}
                       </span>
                    </div>
                  </div>
                  
                  {/* Kompakt Detay Alanı */}
                  <div className="p-3 sm:p-5 flex flex-col flex-grow">
                    <div className="mb-1 sm:mb-2">
                      <span className="text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {formatCategory(item.category)}
                      </span>
                    </div>
                    
                    {/* Başlığı kısıtla (2 satıra sığsın) */}
                    <h2 className="text-sm sm:text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-1">
                      {item.title}
                    </h2>
                    
                    <p className="text-[10px] sm:text-sm font-medium text-slate-400 mb-2 truncate">
                      {item.brand} {item.model && `• ${item.model}`}
                    </p>
                    
                    {/* Fiyatı alta daya */}
                    <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-start gap-0.5 text-blue-600">
                        <span className="text-xs sm:text-sm font-bold mt-0.5">£</span>
                        <span className="text-base sm:text-xl font-black tracking-tight leading-none">
                          {item.price.toLocaleString("en-GB")}
                        </span>
                      </div>
                      
                      <div className="bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-lg p-1.5 sm:p-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
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