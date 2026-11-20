// Tipos de domínio. Mantidos simples e serializáveis para facilitar a futura troca
// dos dados estáticos por uma API (Shopify, VTEX, Nuvemshop, backend próprio etc.).

export type CategorySlug =
  | "meninas"
  | "meninos"
  | "bebes"
  | "conjuntos"
  | "vestidos"
  | "acessorios";

export type CollectionSlug = "jardim-de-verao" | "pequenos-classicos" | "primeiros-dias";

export type ProductImage = {
  /** URL base da imagem (sem largura — o loader define). */
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  details: string[];
  price: number;
  compareAtPrice?: number;
  categories: CategorySlug[];
  collection: CollectionSlug;
  sizes: string[];
  /** Tamanhos sem estoque — aparecem riscados. */
  soldOut?: string[];
  color: string;
  images: ProductImage[];
  isNew?: boolean;
  /** Data de lançamento (ISO) — usada na ordenação por novidades. */
  releasedAt: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
};

export type Collection = {
  slug: CollectionSlug;
  name: string;
  description: string;
  image: string;
};

export type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};
