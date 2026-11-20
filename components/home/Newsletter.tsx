"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Digite um e-mail válido, como nome@email.com.");
    if (!consent) return setError("Marque a autorização para receber nossos e-mails.");
    setError("");
    setStatus("loading");
    // Integração futura: POST para a plataforma de e-mail marketing.
    await new Promise((r) => setTimeout(r, 900));
    setStatus("done");
  };

  return (
    <section className="relative overflow-hidden bg-blush py-20 lg:py-28" aria-labelledby="newsletter-title">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-[380px] rounded-full bg-rose/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-16 size-[420px] rounded-full bg-white/70 blur-3xl" />

      <div className="wrap relative grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Newsletter</p>
          <h2 id="newsletter-title" className="display mt-5 text-[44px] sm:text-6xl lg:text-[68px]">
            Faça parte do nosso <em className="text-rose-deep">universo.</em>
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-navy-soft">
            Receba novidades, lançamentos e condições especiais em primeira mão.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] bg-white/70 p-6 shadow-[0_30px_80px_-40px_rgba(38,59,85,0.35)] backdrop-blur sm:p-10">
          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center" role="status">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-sky-soft text-sky-deep">
                  <Check className="size-6" />
                </span>
                <p className="mt-5 font-serif text-3xl">Que bom ter você aqui!</p>
                <p className="mt-2 text-sm text-navy-soft">
                  Enviamos uma confirmação para <strong>{email}</strong>. Use o cupom <strong>BEMVINDO10</strong> na primeira compra.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" exit={{ opacity: 0, y: -12 }} onSubmit={submit} noValidate>
                <label htmlFor="newsletter-email" className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.16em]">
                  Seu melhor e-mail
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="nome@email.com"
                    aria-invalid={!!error}
                    aria-describedby={error ? "newsletter-error" : undefined}
                    className={cn("field", error && "border-rose-deep")}
                  />
                  <button type="submit" disabled={status === "loading"} className="btn btn-primary shrink-0 group">
                    {status === "loading" ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Enviando" />
                    ) : (
                      <>
                        Quero participar
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p id="newsletter-error" className="mt-3 text-[13px] text-rose-deep" role="alert">
                    {error}
                  </p>
                )}
                <label className="mt-5 flex cursor-pointer items-start gap-3 text-[13px] text-navy-soft">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-navy"
                  />
                  Aceito receber e-mails da Henrique Baby &amp; Kids. Você pode cancelar quando quiser.
                </label>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
