"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-heading-xl text-4xl text-purple">MESSS</h1>
          <p className="text-metric text-[11px] text-[var(--text-muted)] mt-2">
            DIGITAL AUDIT DASHBOARD
          </p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <div className="card-bar card-bar--messs" />

          {sent ? (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--text-primary)] mb-2">
                Link enviado!
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Verifique seu email <strong>{email}</strong> para acessar o
                dashboard.
              </p>
            </div>
          ) : (
            <div onSubmit={handleSubmit}>
              <label className="block mb-4">
                <span className="text-metric text-[10px] text-[var(--text-muted)] mb-2 block">
                  EMAIL
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] rounded-[var(--radius-button)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple/40 transition-colors"
                />
              </label>

              {error && (
                <p className="text-xs text-red-400 mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                onClick={handleSubmit}
                className="w-full py-3 rounded-[var(--radius-button)] text-sm font-semibold text-cream bg-purple hover:bg-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Magic Link"
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[var(--text-muted)]">
          messs.com.br
        </p>
      </div>
    </div>
  );
}
