import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/**
 * Cliente sem sessão para a vitrine: lê só o que as políticas RLS liberam
 * para visitantes e permite que as páginas sejam geradas de forma estática (ISR).
 */
export function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
