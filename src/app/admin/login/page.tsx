"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isSupabaseConfigured && supabase) {
        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          // Success
          localStorage.setItem("admin_logged_in", "true");
          router.push("/admin");
          return;
        }
      } else {
        // Demo / Fallback login mode if Supabase env is not yet configured
        if (password === "admin123" || (email && password)) {
          localStorage.setItem("admin_logged_in", "true");
          router.push("/admin");
          return;
        } else {
          setErrorMsg("Gunakan password demo: 'admin123' untuk mode pengembangan lokal.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk ke sistem admin";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#0f0e0c] text-[#f2eee6] grain-overlay">
      {/* Return to public site */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#a89f91] hover:text-[#e6c875] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Publik</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#141311] border border-[#2c2822] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#c8a24a]/15 border border-[#c8a24a]/40 flex items-center justify-center text-[#e6c875]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#f2eee6]">
            Masuk Pengelola Admin
          </h1>
          <p className="text-xs text-[#a89f91]">
            Panel kurator data & arsip Cagar Budaya GPIB
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#d1c7b7]">
              Email Kurator / Admin
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#786f61]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gpib.or.id"
                className="w-full bg-[#181714] border border-[#2c2822] focus:border-[#c8a24a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#f2eee6] placeholder-[#6d6455] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#d1c7b7]">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#786f61]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181714] border border-[#2c2822] focus:border-[#c8a24a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#f2eee6] placeholder-[#6d6455] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c8a24a] to-[#d4af37] text-[#11100e] font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#c8a24a]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? "Memeriksa Kredensial..." : "Masuk ke Panel Admin"}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#22201c] text-center space-y-1.5">
          <p className="text-[11px] text-[#7d7568]">
            {isSupabaseConfigured ? (
              <span className="text-[#52b788]">● Terhubung ke Supabase Auth</span>
            ) : (
              <span className="text-[#e6c875]">
                Mode Lokal (Password demo: <code className="bg-[#201d17] px-1.5 py-0.5 rounded">admin123</code>)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

