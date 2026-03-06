"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-[400px] space-y-12 animate-fade-in">
        {/* Logo + tagline — mais respiro e hierarquia */}
        <header className="flex flex-col items-center text-center">
          <h1 className="sr-only">MESSS — Digital Audit Dashboard</h1>
          <Logo className="mx-auto" size="lg" color="var(--color-purple)" />
          <p className="text-metric text-[11px] text-[var(--text-muted)] mt-4 tracking-[0.2em]">
            Digital Audit Dashboard
          </p>
        </header>

        {/* Card do formulário — destaque visual, padding generoso */}
        <Card
          className={cn(
            "relative overflow-hidden rounded-[var(--radius-card)]",
            "border border-[var(--border-subtle)] bg-[var(--bg-surface)]",
            "shadow-[var(--shadow-card)]"
          )}
        >
          <div className="card-bar card-bar--messs" />
          <CardContent className="pt-10 pb-10 px-8">
            {externalErrorMessage && (
              <p className="text-xs text-destructive mb-5 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                {externalErrorMessage}
              </p>
            )}

            {sent ? (
              <div className="text-center py-2">
                <p className="text-heading-md text-base text-foreground mb-2">
                  Link enviado
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verifique <strong className="text-foreground">{email}</strong> e
                  use o link para acessar o dashboard.
                </p>
              </div>
            ) : (
              <>
                <p className="text-heading-md text-sm text-[var(--text-secondary)] mb-6">
                  Entre com seu email para receber o link de acesso.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2.5">
                    <Label
                      htmlFor="login-email"
                      className="text-metric text-[10px] text-[var(--text-muted)] tracking-widest"
                    >
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
                      className="h-12 rounded-[var(--radius-button)] border-[var(--border-subtle)] bg-[var(--bg-surface-alt)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-purple/50"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-destructive rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !email}
                    size="lg"
                    className="w-full h-12 rounded-[var(--radius-button)] font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Magic Link"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[var(--text-muted)] tracking-wider">
          messs.com.br
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] space-y-12">
          <header className="flex flex-col items-center text-center">
            <h1 className="sr-only">MESSS — Digital Audit Dashboard</h1>
            <Logo className="mx-auto" size="lg" color="var(--color-purple)" />
            <p className="text-metric text-[11px] text-muted-foreground mt-4 tracking-[0.2em]">Digital Audit Dashboard</p>
          </header>
          <Card className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            <div className="card-bar card-bar--messs" />
            <CardContent className="pt-10 pb-10 px-8">
              <div className="h-24 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground tracking-wider">messs.com.br</p>
        </div>
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}
