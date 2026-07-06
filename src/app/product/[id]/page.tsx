"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/auth";
import Link from "next/link";

// VERİ TİPİMİZ (Sistemi koruyoruz)
interface Equipment {
  id: string;
  title: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  condition: string;
  dimensions: string;
  power_requirements: string;
  image_urls: string[]; 
  status: "Available" | "Sold" | string;
}

// GÜVENLİ RESİM ÇEVİRİCİ (Sistemi koruyoruz)
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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = params?.id;

  const [product, setProduct] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null); 

  // 🔗 SOCIAL LINKS
  const WHATSAPP_NUMBER = "447366966125";
  const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61572391901674";

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("equipment")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        const safeImageUrls = parseImageUrls(data?.image_urls);
        const formattedData = { ...data, image_urls: safeImageUrls };
        setProduct(formattedData);
        
        if (safeImageUrls.length > 0) {
          setMainImage(safeImageUrls[0]);
        }
      } catch (err: any) {
        console.error("Veri çekme hatası:", err.message || err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 border-opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl">🍽️</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-5 px-4 text-center">
        <div className="text-6xl mb-2">🔍</div>
        <h1 className="text-3xl font-extrabold text-slate-900">Product Not Found</h1>
        <p className="text-slate-500 max-w-md text-lg">The equipment you are looking for does not exist or has been recently sold and removed.</p>
        <Link href="/" className="mt-4 px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:-translate-y-1">
          &larr; Back to Inventory
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${product.brand} ${product.model} (${product.title}) listed for £${product.price}.`
  );

  const safeStatus = product.status ? String(product.status).toLowerCase() : "available";
  const isAvailable = safeStatus !== "sold";

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans selection:bg-blue-200 pb-20">
      
      {/* ÜST MENÜ (NAVBAR) */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-slate-100/80 px-4 py-2 rounded-full hover:bg-blue-50">
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> 
            Back to Shop
          </Link>
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-slate-900 tracking-tighter">KESER</span>
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Catering</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="lg:flex lg:gap-12 xl:gap-16 items-start">
          
          {/* SOL BÖLÜM: GALERİ (STICKY YAPIŞKAN) */}
          <div className="lg:w-1/2 lg:sticky lg:top-24 mb-10 lg:mb-0">
            {/* Ana Görsel */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/50 p-6 h-[400px] md:h-[550px] xl:h-[600px] flex items-center justify-center overflow-hidden relative group">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-4">
                  <span className="text-6xl">📷</span>
                  <p className="font-medium text-slate-400">No Image Available</p>
                </div>
              )}
              
              {/* Durum Rozeti */}
              <div className="absolute top-6 left-6">
                <span className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md border ${
                  isAvailable 
                    ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/30" 
                    : "bg-red-500/90 text-white border-red-400 shadow-red-500/30"
                }`}>
                  {isAvailable ? "Available" : "Sold"}
                </span>
              </div>
            </div>

            {/* Küçük Resimler */}
            {Array.isArray(product.image_urls) && product.image_urls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mt-6 px-1">
                {product.image_urls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 xl:w-28 xl:h-28 rounded-2xl overflow-hidden transition-all duration-300 ${
                      mainImage === img 
                        ? "ring-4 ring-blue-600 ring-offset-2 opacity-100 shadow-md transform -translate-y-1" 
                        : "ring-1 ring-slate-200 opacity-50 hover:opacity-100 hover:ring-blue-300 bg-white"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ BÖLÜM: ÜRÜN DETAYLARI */}
          <div className="lg:w-1/2 flex flex-col pt-2 lg:pt-6">
            
            {/* Kategori ve Başlık */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-black text-blue-700 bg-blue-100/80 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-200">
                  {product.category}
                </span>
                <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                  ID: {product.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-4 tracking-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-2 text-lg text-slate-500 font-medium">
                <span className="bg-slate-200/50 text-slate-700 px-2.5 py-0.5 rounded-md font-bold">{product.brand}</span>
                {product.model && <span>Model: <strong className="text-slate-800">{product.model}</strong></span>}
              </div>
            </div>

            {/* Fiyat Kartı */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Our Price</p>
                <div className="flex items-start gap-1">
                  <span className="text-3xl font-bold text-slate-900 mt-1">£</span>
                  <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                    {product.price.toLocaleString("en-GB")}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 font-semibold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                Excludes VAT & Delivery
              </div>
            </div>

            {/* Premium Teknik Özellikler Grid'i */}
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">⚡</span> Technical Specs
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🏷️</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Condition</div>
                <div className="font-bold text-slate-800">{product.condition || "Not specified"}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📏</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dimensions</div>
                <div className="font-bold text-slate-800 line-clamp-2">{product.dimensions || "Not specified"}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🔌</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Power Req.</div>
                <div className="font-bold text-slate-800 line-clamp-2">{product.power_requirements || "Not specified"}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🏭</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Manufacturer</div>
                <div className="font-bold text-slate-800">{product.brand}</div>
              </div>
            </div>

            {/* Açıklama Kutusu */}
            {product.description && (
              <div className="mb-10">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📝</span> Description
                </h3>
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-3xl"></div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base font-medium">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

            {/* Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto pb-10">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#20bd5a] to-[#25D366] hover:from-[#1da850] hover:to-[#20bd5a] text-white py-4 px-6 rounded-2xl font-extrabold text-lg transition-all shadow-lg shadow-green-500/30 hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="text-2xl">💬</span> Buy via WhatsApp
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white py-4 px-6 rounded-2xl font-extrabold text-lg transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
              >
                <span className="text-2xl">📘</span> Visit Facebook
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}