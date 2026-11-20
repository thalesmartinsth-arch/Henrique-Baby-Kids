import { Sidebar } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending");

  return (
    <div className="min-h-dvh bg-ivory lg:flex">
      <Sidebar email={user.email ?? ""} pendingOrders={count ?? 0} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
