"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/Logo";

function LoginFormInner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlErrorCode = searchParams.get("error_code");
  const urlErrorDescription = searchParams.get("error_description");

  let externalErrorMessage: string | null = null;
  if (urlErrorCode === "otp_expired") {
    externalErrorMessage =
      "Este link de acesso expirou ou já foi usado. Solicite um novo magic link abaixo.";
  } else if (urlErrorDescription) {
    externalErrorMessage = urlErrorDescription;
  } else if (urlError === "missing_code") {
    externalErrorMessage =
      "Código de login ausente. Tente solicitar um novo magic link.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // Origin só no client (handler); evita uso de window durante render/SSR
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL ?? "";
    const redirectTo = origin ? `${origin}/auth/callback` : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div
      className="login-bg min-h-screen flex flex-col items-center justify-center animate-fade-in gap-6 bg-[url('/background.png')] bg-cover bg-center"
      
    >
      {/* Logo */}
      <div className="flex flex-col items-center" style={{ gap: "8px" }}>
        <Logo size={140} color="#ffffff" />
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          Digital Audit Dashboard
        </span>
      </div>

      {/* Card */}
      <Card
        className="w-full border-0 shadow-2xl rounded-2xl"
        style={{ maxWidth: "400px", backgroundColor: "#ffffff" }}
      >
        <div style={{ padding: "32px" }}>
          {sent ? (
            <div className="text-center" style={{ padding: "16px 0" }}>
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 48, height: 48, backgroundColor: "rgba(99,102,241,0.1)", margin: "0 auto 16px" }}
              >
                <Mail size={22} style={{ color: "#6366f1" }} />
              </div>
              <p className="font-semibold" style={{ fontSize: "16px", color: "#111", marginBottom: "6px" }}>
                Link enviado!
              </p>
              <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
                Verifique <strong style={{ color: "#374151" }}>{email}</strong> e use o link para acessar.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center" style={{ marginBottom: "24px" }}>
                <h1 className="font-bold" style={{ fontSize: "22px", color: "#111", marginBottom: "4px" }}>
                  Bem-vindo de volta!
                </h1>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Digite seu email para receber o link de acesso.
                </p>
              </div>

              {externalErrorMessage && (
                <p
                  className="text-destructive rounded-lg"
                  style={{ fontSize: "12px", marginBottom: "16px", padding: "10px 12px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {externalErrorMessage}
                </p>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Label htmlFor="login-email" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    style={{ height: "44px" }}
                  />
                </div>

                {error && (
                  <p
                    className="text-destructive rounded-lg"
                    style={{ fontSize: "12px", padding: "10px 12px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  size="lg"
                  className="w-full font-semibold"
                  style={{ height: "44px", backgroundColor: "#8021de", color: "#fff" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Entrar com Magic Link"
                  )}
                </Button>
              </form>

              <Separator style={{ margin: "20px 0" }} />

              <p className="text-center" style={{ fontSize: "12px", color: "#9ca3af" }}>
                Acesso exclusivo para equipe MESSS
              </p>
            </>
          )}
        </div>
      </Card>

      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>
        <a href="http://messs.com.br" target="_blank" rel="noopener noreferrer">messs.com.br</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-bg min-h-screen flex flex-col items-center justify-center" style={{ padding: "48px 24px", gap: "24px" }}>
          <Logo size={140} color="#ffffff" />
          <Card className="w-full border-0 shadow-2xl rounded-2xl" style={{ maxWidth: "400px", backgroundColor: "#ffffff" }}>
            <div className="flex items-center justify-center" style={{ padding: "48px 32px" }}>
              <Loader2 size={24} className="animate-spin" style={{ color: "#9ca3af" }} />
            </div>
          </Card>
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
