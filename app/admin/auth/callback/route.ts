import { NextResponse, type NextRequest } from "next/server";
import { serverClient } from "@/lib/supabase/server";

// Recebe o link mágico do e-mail e cria a sessão.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;
  if (code) {
    const supabase = await serverClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }
  return NextResponse.redirect(`${origin}/admin/login?erro=link`);
}
