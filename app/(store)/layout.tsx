import { CatalogProvider } from "@/components/CatalogProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { MiniCart } from "@/components/cart/MiniCart";
import { getCollections, getProducts } from "@/lib/data/catalog";

// Vitrine gerada de forma estática e atualizada a cada minuto
// (ou na hora, quando o admin salva algo).
export const revalidate = 60;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);
  return (
    <CatalogProvider products={products} collections={collections}>
      <a
        href="#conteudo"
        className="sr-only z-[100] rounded-[3px] bg-navy px-4 py-3 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <MobileMenu />
      <SearchOverlay />
      <MiniCart />
    </CatalogProvider>
  );
}
