"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useUI } from "@/store/ui";

type Result = { ok: true; message?: string; id?: string } | { ok: false; error: string };

/** Executa uma server action com estado de carregamento e aviso de sucesso/erro. */
export function useAction() {
  const [pending, startTransition] = useTransition();
  const notify = useUI((s) => s.notify);
  const router = useRouter();

  const run = (fn: () => Promise<Result>, opts: { success?: string; onSuccess?: (r: Result & { ok: true }) => void } = {}) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        if (opts.success || res.message) notify({ title: opts.success ?? res.message! });
        opts.onSuccess?.(res);
        router.refresh();
      } else {
        notify({ title: "Não foi possível salvar", description: res.error, tone: "error" });
      }
    });

  return { pending, run };
}
