# Henrique Baby & Kids — front-end da loja

Front-end de uma boutique de moda infantil premium, feito com Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide e Zustand.

> Loja de demonstração: produtos, preços e cupons são fictícios, e as fotos vêm da Unsplash (licença gratuita).

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint
```

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Home: hero, categorias, destaques, banner editorial, novidades, diferenciais, newsletter e Instagram |
| `/loja` | Todas as peças, com busca (`?q=`), filtros e ordenação na URL |
| `/loja/[categoria]` | `meninas`, `meninos`, `bebes`, `conjuntos`, `vestidos`, `acessorios`, `novidades`, `promocoes` |
| `/produto/[slug]` | Galeria com zoom, tamanhos, guia de medidas, quantidade, frete, trocas e produtos relacionados |
| `/colecoes` | As três coleções |
| `/favoritos`, `/sacola`, `/checkout` | Favoritos, sacola completa e finalização do pedido (demonstração) |
| `/conta`, `/institucional/[slug]` | Login por e-mail (demo), sobre, trocas, entrega, privacidade, guia de medidas e atendimento |

## Estrutura

```
app/                 rotas (App Router)
components/
  layout/            Header, Footer, MobileMenu, SearchOverlay
  home/              seções da home
  product/           ProductCard, ProductCarousel, ProductGallery, ProductDetails, SizeGuide
  shop/              ProductListing (filtros) e PageHero/Breadcrumbs
  cart/              MiniCart e peças reutilizadas na sacola/checkout
  ui/                Logo, Price, SizePicker, QuantityStepper, FavoriteButton, Sheet, Toaster
lib/
  types.ts           tipos de domínio
  catalog.ts         catálogo de demonstração + funções de acesso (getProducts, getProductBySlug…)
  pricing.ts         cupons, frete e totais
  filters.ts         filtros/ordenação da listagem
  site.ts            navegação, textos institucionais e tabela de medidas
  images.ts          fotos de demonstração
  image-loader.ts    loader do next/image (CDN da Unsplash)
store/
  shop.ts            sacola, favoritos, cupom e CEP (persistidos no localStorage)
  ui.ts              painéis abertos e avisos
```

## Integrar um backend

- **Catálogo:** troque as funções no final de `lib/catalog.ts` por chamadas à API (Shopify, VTEX, Nuvemshop ou API própria). Os componentes usam só essas funções e os tipos de `lib/types.ts`.
- **Preço, cupom e frete:** `lib/pricing.ts` só calcula uma estimativa no navegador. Em produção, valide tudo no servidor.
- **Checkout, newsletter e login:** os pontos de integração estão marcados com `// Integração futura` em `app/checkout/page.tsx`, `components/home/Newsletter.tsx` e `app/conta/page.tsx`.
- **Imagens:** ao usar fotos próprias ou outro CDN, ajuste `lib/image-loader.ts`.

Cupons de teste: `BEMVINDO10` (10%) e `PEQUENOS15` (15%).
