"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Car, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[var(--gold)] flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7 text-[#080807]" />
          </div>
          <h1
            className="text-4xl leading-none text-[var(--text-primary)] tracking-widest"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            KAMI<span className="text-[var(--gold)]">MOTORS</span>
          </h1>
          <p className="text-[var(--text-dim)] text-xs tracking-[0.2em] uppercase mt-1">Admin Panel</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6">
          <h2
            className="text-[var(--text-primary)] text-2xl leading-none mb-5 tracking-wide"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
          >
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@kamimotors.com"
                className="w-full bg-[var(--bg-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2.5 text-sm focus:border-[var(--gold)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2.5 pr-10 text-sm focus:border-[var(--gold)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:bg-(--gold)/40 text-[#080807] font-bold py-3 text-sm tracking-widest uppercase transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
