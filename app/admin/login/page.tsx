"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { browserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState(
    params.get("erro") === "sem-acesso"
      ? "Este e-mail não tem acesso ao painel. Peça a um administrador para liberar."
      : params.get("erro") === "link"
        ? "O link expirou ou já foi usado. Peça um novo."
        : "",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Digite um e-mail válido.");
    setError("");
    setStatus("sending");
    const { error } = await browserClient().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (error) {
      setStatus("idle");
      setError(
        /rate|security purposes/i.test(error.message)
          ? "Muitas tentativas seguidas. Aguarde um minuto e tente de novo."
          : "Não foi possível enviar o link. Tente novamente.",
      );
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="w-full max-w-sm">
      <Logo />
      <h1 className="display mt-10 text-4xl">Painel da loja</h1>
      {status === "sent" ? (
        <div className="mt-6 rounded-[var(--radius-card)] bg-white p-6" role="status">
          <span className="grid size-12 place-items-center rounded-full bg-sky-soft text-sky-deep">
            <Mail className="size-5" />
          </span>
          <p className="mt-4 font-semibold">Confira seu e-mail</p>
          <p className="mt-1 text-sm text-navy-soft">
            Enviamos um link de acesso para <strong>{email}</strong>. Abra-o neste mesmo navegador.
          </p>
          <button type="button" onClick={() => setStatus("idle")} className="link-underline mt-4 text-[12px] font-semibold">
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6">
          <p className="mb-6 text-sm text-navy-soft">Entre com o e-mail de administrador. Você recebe um link de acesso, sem senha.</p>
          <label htmlFor="admin-email" className="mb-2 block text-[12px] font-semibold">
            E-mail
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "admin-email-error" : undefined}
            className={cn("field", error && "border-rose-deep")}
            placeholder="voce@email.com"
          />
          {error && (
            <p id="admin-email-error" className="mt-2 text-[13px] text-rose-deep" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-4 w-full">
            {status === "sending" ? "Enviando…" : "Receber link de acesso"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ivory px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
