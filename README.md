# Henrique Baby & Kids — front-end da loja

Front-end de uma boutique de moda infantil premium, feito com Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide e Zustand.

> Produtos e fotos de demonstração (Unsplash). O catálogo, o estoque, os pedidos e o financeiro ficam no Supabase e são gerenciados em `/admin`.

## Como rodar

Crie `.env.local` com as chaves públicas do projeto Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

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

## Painel admin (`/admin`)

Login por link mágico enviado ao e-mail. Só e-mails cadastrados na tabela `admins` entram:

```sql
insert into public.admins (email) values ('voce@exemplo.com');
```

| Área | O que faz |
|---|---|
| Visão geral | Faturamento, pedidos, ticket médio, gráfico diário, estoque baixo e pedidos recentes |
| Pedidos | Lista com filtros e busca; detalhe com itens, cliente, endereço, status, rastreio e anotações. Cancelar devolve o estoque |
| Produtos | Cadastro completo (preço, preço "de", custo e margem, categorias, coleção, tamanhos, SKU, estoque, status) e fotos com envio, ordem, foto principal e texto alternativo |
| Estoque | Entradas, saídas e ajustes por tamanho, valor do estoque e histórico de movimentações |
| Financeiro | Receita, descontos, custo das peças, lucro bruto, despesas e resultado por período; mais vendidos e formas de pagamento |
| Cupons | Percentual, limite de usos, compra mínima e validade |
| Coleções | Nome, descrição, imagem e ordem |
| Clientes | Clientes a partir dos pedidos e inscritos da newsletter |

No Supabase, em **Authentication → URL Configuration**, cadastre em *Redirect URLs* `http://localhost:3000/admin/auth/callback` e o endereço de produção com `/admin/auth/callback`.

## Banco de dados

O schema está em `supabase/migrations`. Regras sensíveis rodam no banco: `place_order` confere estoque, recalcula preços, cupom e frete e dá baixa no estoque; `adjust_stock` e `set_order_status` registram as movimentações. As tabelas usam RLS: a vitrine só lê produtos ativos e só o admin escreve.

## Próximos passos

- **Pagamento online:** o pedido nasce como "aguardando pagamento"; integrar um gateway (Mercado Pago, Pagar.me, Stripe) em `app/(store)/actions.ts`.
- **E-mails transacionais:** confirmação de pedido e envio de rastreio.
- **Imagens:** ao usar fotos próprias ou outro CDN, ajuste `lib/image-loader.ts`.

Cupons iniciais: `BEMVINDO10` (10%) e `PEQUENOS15` (15%).
