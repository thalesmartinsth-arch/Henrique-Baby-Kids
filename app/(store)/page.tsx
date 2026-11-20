import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { Featured } from "@/components/home/Featured";
import { EditorialBanner } from "@/components/home/EditorialBanner";
import { NewArrivals } from "@/components/home/NewArrivals";
import { Benefits } from "@/components/home/Benefits";
import { Newsletter } from "@/components/home/Newsletter";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { getProducts } from "@/lib/data/catalog";

export default async function HomePage() {
  const products = await getProducts();
  return (
    <>
      <Hero />
      <Categories products={products} />
      <Featured />
      <EditorialBanner />
      <NewArrivals catalog={products} />
      <Benefits />
      <Newsletter />
      <InstagramGrid />
    </>
  );
}
