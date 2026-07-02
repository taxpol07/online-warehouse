"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/auth";
import { useParams } from "next/navigation";
import Link from "next/link";

// VERİ TİPİMİZ (Dashboard'daki yeni eklemelerle birlikte)
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
  status: "Available" | "Sold";
}

// GÜVENLİ RESİM ÇEVİRİCİ
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

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null); 

  // 🔗 SOCIAL LINKS
  const WHATSAPP_NUMBER = "447366966125";
  const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61572391901674";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Fetch error:", error.message);
        setProduct(null);
      } else {
        const safeImageUrls = parseImageUrls(data?.image_urls);
        const formattedData = { ...data, image_urls: safeImageUrls };
        setProduct(formattedData);
        
        if (safeImageUrls.length > 0) {
          setMainImage(safeImageUrls[0]);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="text-2xl font-bold text-slate-800">Ürün Bulunamadı</div>
        <p className="text-slate-500">Aradığınız ekipman sistemde mevcut değil veya kaldırılmış.</p>
        <Link href="/" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
          Vitrine Dön
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${product.brand} ${product.model} (${product.title}) listed for £${product.price}.`
  );

  const isAvailable = product.status?.toString().toLowerCase() !== "sold";
  const displayStatus = isAvailable ? "Available" : "Sold";

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="max-w-6xl mx-auto">
        
        {/* ÜST BİLGİ & GERİ DÖNÜŞ */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> 
            Back to Inventory
          </Link>
          
          <div className="flex items-center gap-2 opacity-80">
            <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-slate-800 tracking-tight">
              KESER
            </span>
            <span className="text-sm font-semibold text-slate-500">Catering</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* SOL BÖLÜM: GÖRSEL GALERİSİ */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Ana Görsel */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-4 h-[400px] md:h-[550px] flex items-center justify-center overflow-hidden relative group">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <span className="text-4xl">📷</span>
                  <p>No Image Available</p>
                </div>
              )}
              
              {/* Resim Üzeri Rozetler */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md ${
                  isAvailable ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {displayStatus}
                </span>
              </div>
            </div>

            {/* Küçük Resimler (Thumbnails) */}
            {Array.isArray(product.image_urls) && product.image_urls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide pt-2">
                {product.image_urls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all duration-200 ${
                      mainImage === img 
                        ? "ring-4 ring-blue-600 ring-offset-2 opacity-100" 
                        : "ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:ring-blue-400"
                    }`}
                  >
                    <img src={img} alt={`${product.title} thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ BÖLÜM: ÜRÜN BİLGİLERİ */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Başlık ve Fiyat Kartı */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  ID: {product.id.substring(0, 8)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-2 tracking-tight">
                {product.title}
              </h1>
              <p className="text-lg text-slate-500 font-medium mb-6">
                {product.brand} {product.model ? `• ${product.model}` : ""}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  £{product.price.toLocaleString("en-GB")}
                </span>
                <span className="text-sm text-slate-500 font-medium pl-2">Exc. VAT (If applicable)</span>
              </div>
            </div>

            {/* Teknik Özellikler Tablosu (Modern) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span>⚙️</span> Technical Specifications
              </h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="py-3 flex justify-between">
                  <dt className="text-slate-500 font-medium">Condition</dt>
                  <dd className="font-semibold text-slate-900 text-right">{product.condition || "Not specified"}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-slate-500 font-medium">Dimensions</dt>
                  <dd className="font-semibold text-slate-900 text-right">{product.dimensions || "Not specified"}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-slate-500 font-medium">Power Required</dt>
                  <dd className="font-semibold text-slate-900 text-right">{product.power_requirements || "Not specified"}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-slate-500 font-medium">Brand & Model</dt>
                  <dd className="font-semibold text-slate-900 text-right">{product.brand} {product.model}</dd>
                </div>
              </dl>
            </div>

            {/* Açıklama */}
            {product.description && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Product Description</h3>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {product.description}
                  </p>
                </div>
              </div>
            )}

            {/* Aksiyon Butonları */}
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-500/20 hover:-translate-y-0.5"
              >
                💬 Inquire via WhatsApp
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
              >
                📘 View our Facebook Page
              </a>
            </div>

          </div>
        </div>

        {/* FLOATING WHATSAPP BUTTON */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 flex items-center justify-center rounded-full shadow-2xl hover:scale-110 transition-transform z-50 text-2xl"
        >
          💬
        </a>
      </div>
    </div>
  );
}