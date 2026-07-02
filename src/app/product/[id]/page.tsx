"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/auth";
import { useParams } from "next/navigation";

// VERİ TİPİMİZ
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

// HATA ÇÖZEN FONKSİYON: Ne gelirse gelsin onu diziye (Array) çevirir.
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
        // Yeni güvenli fonksiyonumuzu kullanıyoruz
        const safeImageUrls = parseImageUrls(data?.image_urls);
        
        const formattedData = { ...data, image_urls: safeImageUrls };
        setProduct(formattedData);
        
        // İlk görseli ana görsel yap
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-500">Equipment not found</div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in the ${product.brand} ${product.model} (${product.title}) listed for £${product.price}.`
  );

  const isAvailable = product.status === "Available";
  const displayStatus = product.status || "Available";

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* BREADCRUMB */}
        <div className="text-sm text-gray-500 mb-6">
          Home / {product.category} / <span className="text-gray-800 font-medium">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* SOL BÖLÜM: GÖRSEL GALERİSİ */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Ana Görsel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden relative">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.title} 
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-gray-400">No Image Available</div>
              )}
            </div>

            {/* Küçük Resimler (EKSTRA GÜVENLİK EKLENDİ) */}
            {Array.isArray(product.image_urls) && product.image_urls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.image_urls.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all ${
                      mainImage === img ? "border-blue-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ BÖLÜM: ÜRÜN BİLGİLERİ VE AKSİYONLAR */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Başlık ve Fiyat Kartı */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                    {product.title}
                  </h1>
                  <p className="text-gray-500 font-medium">
                    {product.brand} • {product.model}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  £{product.price.toLocaleString("en-GB")}
                </span>
                <span 
                  className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
                    isAvailable 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {displayStatus}
                </span>
              </div>
            </div>

            {/* Teknik Özellikler Tablosu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Specifications</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Category</span>
                  <span className="col-span-2 text-gray-900 font-medium">{product.category}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Condition</span>
                  <span className="col-span-2 text-gray-900">{product.condition || "Not specified"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Dimensions</span>
                  <span className="col-span-2 text-gray-900">{product.dimensions || "Not specified"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Power</span>
                  <span className="col-span-2 text-gray-900">{product.power_requirements || "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-sm"
                >
                  💬 Contact on WhatsApp
                </a>
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-sm"
                >
                  📘 View on Facebook
                </a>
              </div>
            </div>

            {/* Açıklama */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

          </div>
        </div>

        {/* FLOATING WHATSAPP BUTTON */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
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