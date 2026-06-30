"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/auth";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError(
        "Supabase yapılandırılmamış. Lütfen NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenlerini ekleyin."
      );
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      // BAŞARILI GİRİŞ:
      // window.location.href, tarayıcıyı zorla yeniler ve Middleware'in 
      // cookie'leri (oturum bilgisini) milisaniyesinde yakalamasını sağlar.
      window.location.href = "/admin/dashboard";
      
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      setError(err.message || "Giriş yapılamadı, lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-6">Admin Login</h1>
        
        {/* HATA ALANI */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          required
          placeholder="Email"
          type="email"
          className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* PASSWORD */}
        <input
          required
          placeholder="Password"
          type="password"
          className="w-full p-3 mb-5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        {/* BUTTON */}
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
