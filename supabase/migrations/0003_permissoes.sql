-- Funções de admin não podem ser chamadas sem login; search_path fixo.
revoke execute on function public.adjust_stock(uuid, int, text, text) from anon;
revoke execute on function public.set_order_status(uuid, text) from anon;
alter function public.shipping_quote(text, numeric) set search_path = public;
alter function public.touch_updated_at() set search_path = public;
