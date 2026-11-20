import { requireAdmin } from "@/lib/supabase/server";
import { CouponManager, type CouponRow } from "@/components/admin/CouponManager";
import { PageHeader } from "@/components/admin/ui";

export default async function CouponsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return (
    <>
      <PageHeader title="Cupons" description="O desconto é aplicado sobre o subtotal das peças, antes do frete." />
      <CouponManager coupons={(data ?? []) as CouponRow[]} />
    </>
  );
}
