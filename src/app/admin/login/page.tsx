"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  
  // State yönetimi: Form verilerini obje olarak tutmak daha temizdir
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email.trim(),
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Başarılı giriş sonrası yönlendirme
    router.replace("/admin/dashboard"); // push yerine replace kullanmak daha güvenlidir
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Admin Login</h1>
        
        {/* Hata Mesajı Alanı */}
        {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-400/10 p-2 rounded">{error}</p>}

        <input
          required
          placeholder="Email"
          type="email"
          className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          required
          placeholder="Password"
          type="password"
          className="w-full p-3 mb-5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}