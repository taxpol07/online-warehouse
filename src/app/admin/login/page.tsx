"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Zaten import etmişsin
import { supabase } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter(); // <--- BU SATIRI EKLEMEN GEREKİYOR

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Artık router tanımlı olduğu için bu satır hata vermeyecek
    router.push("/admin/dashboard"); 
  };

  return (
    // ... (Geri kalan UI kodun aynı kalabilir)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Admin Login
        </h1>
        <input
          placeholder="Email"
          type="email"
          className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 mb-5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={login}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}