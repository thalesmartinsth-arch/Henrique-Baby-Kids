import { photo, PHOTOS } from "./images";
import type { Category, Collection, Product } from "./types";

// ---------------------------------------------------------------------------
// Catálogo de demonstração. Produtos, preços e fotos são fictícios.
// Para integrar um backend, substitua as funções do final deste arquivo
// (getProducts, getProductBySlug...) por chamadas à API — os componentes
// dependem apenas delas e dos tipos em lib/types.ts.
// ---------------------------------------------------------------------------

export const FREE_SHIPPING_THRESHOLD = 199;

export const KIDS_SIZES = ["1", "2", "3", "4", "6", "8", "10", "12"];
export const BABY_SIZES = ["RN", "P", "M", "G", "GG"];
export const ALL_SIZES = [...BABY_SIZES, ...KIDS_SIZES];

export const CATEGORIES: Category[] = [
  { slug: "meninas", name: "Meninas", tagline: "Delicadeza com personalidade", image: photo(PHOTOS.catGirls) },
  { slug: "meninos", name: "Meninos", tagline: "Clássicos para o dia a dia", image: photo(PHOTOS.catBoys) },
  { slug: "bebes", name: "Bebês", tagline: "Toque macio, do RN ao GG", image: photo(PHOTOS.catBabies) },
  { slug: "conjuntos", name: "Conjuntos", tagline: "Combinações prontas", image: photo(PHOTOS.catSets) },
  { slug: "vestidos", name: "Vestidos", tagline: "Para festas e passeios", image: photo(PHOTOS.catDresses) },
  { slug: "acessorios", name: "Acessórios", tagline: "Chapéus, sapatinhos e mais", image: photo(PHOTOS.catAccessories) },
];

export const COLLECTIONS: Collection[] = [
  {
    slug: "jardim-de-verao",
    name: "Jardim de Verão",
    description: "Linho, algodão leve e estampas florais em tons de rosa e céu para os dias longos.",
    image: photo(PHOTOS.collectionGarden),
  },
  {
    slug: "pequenos-classicos",
    name: "Pequenos Clássicos",
    description: "Camisas, polos e cardigãs de corte atemporal, pensados para passar de irmão para irmão.",
    image: photo(PHOTOS.collectionClassics),
  },
  {
    slug: "primeiros-dias",
    name: "Primeiros Dias",
    description: "Tricô macio, algodão pima e botões de pressão para os primeiros meses do bebê.",
    image: photo(PHOTOS.collectionBaby),
  },
];

const careDefault = "Lavar à mão ou à máquina em ciclo delicado, água fria. Secar à sombra.";

const p = (
  data: Omit<Product, "id" | "details"> & { details?: string[]; fabric: string },
): Product => {
  const { fabric, details = [], ...rest } = data;
  return { id: data.slug, details: [`Composição: ${fabric}`, ...details, careDefault], ...rest };
};

export const PRODUCTS: Product[] = [
  p({
    slug: "vestido-floral-infantil",
    name: "Vestido Floral Infantil",
    shortDescription: "Algodão leve com estampa floral e saia rodada.",
    description:
      "Um vestido para correr no jardim e chegar arrumada à festa. A saia rodada tem forro em algodão macio, a cintura leva elástico embutido nas costas para acompanhar o crescimento e o decote fecha com botões forrados.",
    fabric: "100% algodão",
    details: ["Forro interno em algodão", "Elástico embutido nas costas", "Botões forrados no decote"],
    price: 189.9,
    compareAtPrice: 229.9,
    categories: ["meninas", "vestidos"],
    collection: "jardim-de-verao",
    sizes: ["2", "3", "4", "6", "8", "10"],
    soldOut: ["10"],
    color: "Floral rosa",
    releasedAt: "2026-09-02",
    images: [
      { src: photo("photo-1650602979536-74222284e5e2"), alt: "Menina usando vestido floral rodado" },
      { src: photo("photo-1650602979536-74222284e5e2", { x: 0.5, y: 0.45, zoom: 1.8 }), alt: "Detalhe da estampa floral do vestido" },
      { src: photo("photo-1650602979536-74222284e5e2", { x: 0.5, y: 0.7, zoom: 2.2 }), alt: "Detalhe da saia rodada" },
    ],
  }),
  p({
    slug: "conjunto-casual-menina",
    name: "Conjunto Casual Menina",
    shortDescription: "Blusa de poá e short jeans macio.",
    description:
      "Blusa de manga longa em algodão com poá e short jeans com cós de elástico. Um conjunto que funciona inteiro ou separado, com toque macio e sem etiquetas que pinicam.",
    fabric: "Blusa: 100% algodão · Short: 98% algodão, 2% elastano",
    details: ["Cós de elástico no short", "Etiqueta estampada, sem atrito", "Peças vendidas juntas"],
    price: 169.9,
    categories: ["meninas", "conjuntos"],
    collection: "jardim-de-verao",
    sizes: ["1", "2", "3", "4", "6", "8"],
    color: "Poá off-white",
    isNew: true,
    releasedAt: "2026-11-04",
    images: [
      { src: photo("photo-1518831959646-742c3a14ebf7"), alt: "Menina usando blusa de poá e short jeans" },
      { src: photo("photo-1518831959646-742c3a14ebf7", { x: 0.5, y: 0.4, zoom: 1.8 }), alt: "Detalhe da estampa de poá" },
    ],
  }),
  p({
    slug: "vestido-bata-coral",
    name: "Vestido Bata Coral",
    shortDescription: "Bata solta em viscose estampada.",
    description:
      "Vestido bata de modelagem solta em viscose estampada em coral e rosa, com mangas curtas e decote redondo. Leve para os dias quentes e fácil de vestir.",
    fabric: "100% viscose",
    details: ["Modelagem solta", "Decote com abertura nas costas", "Estampa exclusiva"],
    price: 149.9,
    categories: ["meninas", "vestidos"],
    collection: "jardim-de-verao",
    sizes: ["1", "2", "3", "4", "6"],
    color: "Coral",
    releasedAt: "2026-10-05",
    images: [
      { src: photo("photo-1700751616070-f7ed13448630"), alt: "Menina sentada em um tronco usando vestido bata coral" },
      { src: photo("photo-1700751616070-f7ed13448630", { x: 0.5, y: 0.45, zoom: 2 }), alt: "Detalhe da estampa coral" },
    ],
  }),
  p({
    slug: "camiseta-premium-infantil",
    name: "Camiseta Premium Infantil",
    shortDescription: "Listras finas em algodão pima.",
    description:
      "A camiseta listrada que vai com tudo: algodão pima de fio longo, gola que mantém a forma depois de muitas lavagens e listras finas em off-white e cinza. Combina com bermudas, jeans e o cardigã da coleção.",
    fabric: "100% algodão pima",
    details: ["Gola ribana reforçada", "Costuras planas", "Fio longo, toque sedoso"],
    price: 79.9,
    categories: ["meninos"],
    collection: "pequenos-classicos",
    sizes: ["1", "2", "3", "4", "6"],
    color: "Listrado off-white",
    releasedAt: "2026-07-10",
    images: [
      { src: photo("photo-1627639678910-be8329e36789"), alt: "Menino usando camiseta listrada e bermuda verde" },
      { src: photo("photo-1627639679690-db4d401aae84"), alt: "Menino sorrindo com camiseta listrada" },
      { src: photo("photo-1627639678221-db426a961ba1"), alt: "Camiseta listrada vista de frente" },
    ],
  }),
  p({
    slug: "conjunto-moletom",
    name: "Conjunto Moletom",
    shortDescription: "Moletom com capuz em algodão felpado.",
    description:
      "Moletom off-white com capuz forrado e bolso canguru, em algodão felpado por dentro. Para as manhãs frias de escola e os passeios de fim de tarde.",
    fabric: "80% algodão, 20% poliéster",
    details: ["Felpado interno", "Capuz forrado", "Punhos e barra em ribana"],
    price: 219.9,
    compareAtPrice: 259.9,
    categories: ["meninos", "conjuntos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8", "10", "12"],
    color: "Off-white",
    releasedAt: "2026-08-15",
    images: [
      { src: photo("photo-1719421992052-e7d4394fa7fd"), alt: "Menino usando moletom off-white com capuz e jeans" },
      { src: photo("photo-1719421992052-e7d4394fa7fd", { x: 0.5, y: 0.3, zoom: 2 }), alt: "Detalhe do capuz do moletom" },
    ],
  }),
  p({
    slug: "macacao-bebe-ursinho",
    name: "Macacão Bebê Ursinho",
    shortDescription: "Tricô macio com capuz de orelhinhas.",
    description:
      "Macacão em tricô de algodão com capuz de orelhinhas e abertura frontal com botões de pressão, para trocar a fralda sem tirar a roupa toda. Quentinho sem esquentar demais.",
    fabric: "100% algodão (tricô)",
    details: ["Abertura frontal com pressão", "Capuz com orelhinhas", "Pés abertos"],
    price: 149.9,
    categories: ["bebes"],
    collection: "primeiros-dias",
    sizes: BABY_SIZES,
    color: "Cacau",
    isNew: true,
    releasedAt: "2026-11-10",
    images: [
      { src: photo("photo-1522771930-78848d9293e8"), alt: "Bebê usando macacão de tricô com capuz de ursinho" },
      { src: photo("photo-1522771930-78848d9293e8", { x: 0.5, y: 0.35, zoom: 2 }), alt: "Detalhe do capuz com orelhinhas" },
    ],
  }),
  p({
    slug: "jardineira-infantil",
    name: "Jardineira Infantil",
    shortDescription: "Sarja leve com alças reguláveis.",
    description:
      "Jardineira em sarja leve com alças reguláveis por botões, bolso frontal e barra que pode ser dobrada. Feita para brincar ao ar livre e durar várias estações.",
    fabric: "100% algodão (sarja)",
    details: ["Alças com dois pontos de ajuste", "Bolso frontal", "Barra dobrável"],
    price: 159.9,
    categories: ["meninas", "conjuntos"],
    collection: "jardim-de-verao",
    sizes: ["1", "2", "3", "4", "6"],
    color: "Azul céu",
    releasedAt: "2026-06-20",
    images: [
      { src: photo("photo-1615489548573-8165c2c35e1b"), alt: "Menina brincando no balanço com jardineira" },
      { src: photo("photo-1615489548573-8165c2c35e1b", { x: 0.45, y: 0.5, zoom: 2 }), alt: "Detalhe da jardineira" },
    ],
  }),
  p({
    slug: "vestido-babados-rubi",
    name: "Vestido Babados Rubi",
    shortDescription: "Babados em camadas e laço nas costas.",
    description:
      "Vestido vermelho-rubi com babados em camadas, mangas bufantes e laço amarrado nas costas. Para aniversários, Natal e fotos de família.",
    fabric: "100% viscose",
    details: ["Babados em três camadas", "Laço para amarrar", "Forro em algodão"],
    price: 199.9,
    categories: ["meninas", "vestidos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8", "10"],
    color: "Rubi",
    isNew: true,
    releasedAt: "2026-11-12",
    images: [
      { src: photo("photo-1578897367107-2828e351c8a8"), alt: "Menina sorrindo com vestido vermelho de babados" },
      { src: photo("photo-1578897366846-358bb1c2412a"), alt: "Menina com vestido vermelho de babados ao ar livre" },
    ],
  }),
  p({
    slug: "vestido-linho-girassol",
    name: "Vestido Linho Girassol",
    shortDescription: "Linho amarelo com botões de madeira.",
    description:
      "Linho lavado em amarelo-girassol, com alças largas, botões de madeira e bolsos laterais. Fresco no calor e bonito com sandália ou tênis.",
    fabric: "55% linho, 45% algodão",
    details: ["Linho pré-lavado, não encolhe", "Botões de madeira", "Bolsos laterais"],
    price: 179.9,
    categories: ["meninas", "vestidos"],
    collection: "jardim-de-verao",
    sizes: ["1", "2", "3", "4", "6"],
    color: "Girassol",
    releasedAt: "2026-09-18",
    images: [
      { src: photo("photo-1611003967145-fb3960072424"), alt: "Menina pulando com vestido amarelo de linho" },
      { src: photo("photo-1611003967145-fb3960072424", { x: 0.5, y: 0.45, zoom: 2 }), alt: "Detalhe do linho amarelo" },
    ],
  }),
  p({
    slug: "vestido-festa-off-white",
    name: "Vestido Festa Off-white",
    shortDescription: "Saia rodada e faixa na cintura.",
    description:
      "Off-white com saia rodada e faixa amarrada na cintura que dá o tom da produção. O tecido tem leve textura e cai com movimento — um vestido para cerimônias e batizados.",
    fabric: "100% algodão",
    details: ["Faixa para amarrar", "Saia rodada com forro", "Zíper invisível"],
    price: 239.9,
    categories: ["meninas", "vestidos"],
    collection: "pequenos-classicos",
    sizes: ["4", "6", "8", "10", "12"],
    color: "Off-white",
    isNew: true,
    releasedAt: "2026-10-28",
    images: [
      { src: photo("photo-1653686933006-249b035f9ee0"), alt: "Menina usando vestido off-white rodado" },
      { src: photo("photo-1653686933006-249b035f9ee0", { x: 0.5, y: 0.45, zoom: 2 }), alt: "Detalhe da saia rodada" },
    ],
  }),
  p({
    slug: "vestido-tule-noite",
    name: "Vestido Tule Noite",
    shortDescription: "Corpo marinho e saia em tule degradê.",
    description:
      "Corpo em malha marinho e saia em tule com degradê até o branco. Leve, com forro que não pinica, para festas de fim de ano.",
    fabric: "Corpo: 100% algodão · Saia: 100% poliamida",
    details: ["Tule em três camadas", "Forro em algodão", "Fechamento por zíper"],
    price: 229.9,
    compareAtPrice: 279.9,
    categories: ["meninas", "vestidos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8"],
    soldOut: ["2"],
    color: "Marinho degradê",
    releasedAt: "2026-08-01",
    images: [
      { src: photo("photo-1759313560250-3bb4bc1d10bc"), alt: "Menina usando vestido com saia de tule degradê" },
      { src: photo("photo-1759313560250-3bb4bc1d10bc", { x: 0.5, y: 0.65, zoom: 2 }), alt: "Detalhe da saia de tule" },
    ],
  }),
  p({
    slug: "camisa-xadrez-azul",
    name: "Camisa Xadrez Azul",
    shortDescription: "Xadrez em tricoline com bolso.",
    description:
      "Camisa de manga longa em tricoline xadrez azul, com bolso no peito e botões de pressão escondidos — fácil de vestir sozinho.",
    fabric: "100% algodão (tricoline)",
    details: ["Botões de pressão", "Bolso no peito", "Mangas que podem ser dobradas"],
    price: 129.9,
    categories: ["meninos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8", "10"],
    color: "Xadrez azul",
    releasedAt: "2026-05-14",
    images: [
      { src: photo("photo-1586537182864-75d5ea8a0e3d"), alt: "Menino sorrindo com camisa xadrez azul" },
      { src: photo("photo-1586537182864-75d5ea8a0e3d", { x: 0.5, y: 0.45, zoom: 2 }), alt: "Detalhe do xadrez" },
    ],
  }),
  p({
    slug: "polo-piquet-marinho",
    name: "Polo Piquet Marinho",
    shortDescription: "Piquet com microestampa.",
    description:
      "Polo em piquet marinho com microestampa discreta, gola firme e abertura com dois botões. Para a escola, o almoço de domingo e as viagens.",
    fabric: "100% algodão (piquet)",
    details: ["Gola e punhos em ribana", "Dois botões", "Fenda lateral na barra"],
    price: 109.9,
    categories: ["meninos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8", "10", "12"],
    color: "Marinho",
    isNew: true,
    releasedAt: "2026-10-30",
    images: [
      { src: photo("photo-1725071287951-b12b67bd3dd9"), alt: "Menino usando polo marinho e bermuda bege" },
      { src: photo("photo-1725071287951-b12b67bd3dd9", { x: 0.5, y: 0.35, zoom: 2 }), alt: "Detalhe da gola da polo" },
    ],
  }),
  p({
    slug: "conjunto-linho-menino",
    name: "Conjunto Linho Menino",
    shortDescription: "Camisa de linho e calça de sarja.",
    description:
      "Camisa de linho azul-claro com gola padre e calça de sarja cáqui com cós ajustável por dentro. Um conjunto para casamentos de dia e almoços especiais.",
    fabric: "Camisa: 100% linho · Calça: 100% algodão",
    details: ["Gola padre", "Cós com regulagem interna", "Peças vendidas juntas"],
    price: 249.9,
    categories: ["meninos", "conjuntos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8", "10"],
    color: "Céu e cáqui",
    isNew: true,
    releasedAt: "2026-11-15",
    images: [
      { src: photo("photo-1596392927852-2a18c336fb78"), alt: "Menino usando camisa de linho azul-claro e calça cáqui no jardim" },
      { src: photo("photo-1596392927852-2a18c336fb78", { x: 0.5, y: 0.35, zoom: 2 }), alt: "Detalhe da camisa de linho" },
    ],
  }),
  p({
    slug: "jaqueta-jeans-classica",
    name: "Jaqueta Jeans Clássica",
    shortDescription: "Jeans macio com lavagem clara.",
    description:
      "Jaqueta jeans de lavagem clara em denim amaciado, com bolsos frontais e botões de metal. A terceira peça que completa qualquer produção.",
    fabric: "98% algodão, 2% elastano",
    details: ["Denim amaciado", "Botões de metal", "Bolsos frontais com lapela"],
    price: 199.9,
    compareAtPrice: 239.9,
    categories: ["meninos"],
    collection: "pequenos-classicos",
    sizes: ["2", "3", "4", "6", "8", "10"],
    color: "Jeans claro",
    releasedAt: "2026-07-28",
    images: [
      { src: photo("photo-1681551210432-228395e59420"), alt: "Menino usando jaqueta jeans clara e camiseta verde" },
      { src: photo("photo-1681551210430-6fa83eb95a8e"), alt: "Menino com jaqueta jeans em pose descontraída" },
    ],
  }),
  p({
    slug: "conjunto-social-bebe",
    name: "Conjunto Social Bebê",
    shortDescription: "Camisa, gravata-borboleta e boina.",
    description:
      "Camisa branca, colete marinho, gravata-borboleta e boina — um pequeno cavalheiro para batizados e casamentos. Todas as peças com fechos fáceis.",
    fabric: "100% algodão",
    details: ["Gravata-borboleta com velcro", "Boina inclusa", "Colete com botões de pressão"],
    price: 189.9,
    categories: ["bebes", "conjuntos"],
    collection: "primeiros-dias",
    sizes: ["P", "M", "G", "GG"],
    color: "Marinho",
    releasedAt: "2026-06-05",
    images: [
      { src: photo("photo-1673340979193-481dd0eb49c8", { x: 0.5, y: 0.5, zoom: 1.2 }), alt: "Bebê usando conjunto social marinho com gravata-borboleta" },
      { src: photo("photo-1673340979193-481dd0eb49c8", { x: 0.5, y: 0.4, zoom: 2.2 }), alt: "Detalhe da gravata-borboleta" },
    ],
  }),
  p({
    slug: "macacao-pijama-bebe",
    name: "Macacão Pijama Bebê",
    shortDescription: "Plush aconchegante com pés.",
    description:
      "Macacão em plush macio com pés e zíper de duas vias protegido no queixo. Para noites tranquilas e manhãs preguiçosas.",
    fabric: "100% poliéster (plush antialérgico)",
    details: ["Zíper de duas vias", "Protetor de queixo", "Pés com antiderrapante"],
    price: 99.9,
    compareAtPrice: 119.9,
    categories: ["bebes"],
    collection: "primeiros-dias",
    sizes: BABY_SIZES,
    color: "Vermelho",
    releasedAt: "2026-04-22",
    images: [
      { src: photo("photo-1544388405-6f0e0c3cdf54"), alt: "Bebê sorrindo com macacão pijama vermelho" },
      { src: photo("photo-1544388405-6f0e0c3cdf54", { x: 0.5, y: 0.5, zoom: 2 }), alt: "Detalhe do plush" },
    ],
  }),
  p({
    slug: "vestido-regata-ceu",
    name: "Vestido Regata Céu",
    shortDescription: "Malha fresca em azul-céu.",
    description:
      "Vestido regata em malha de algodão azul-céu com microestampa branca e barra levemente evasê. Para o verão, a praia e o parquinho.",
    fabric: "100% algodão (malha)",
    details: ["Alças largas", "Barra evasê", "Toque gelado"],
    price: 139.9,
    categories: ["meninas", "vestidos"],
    collection: "jardim-de-verao",
    sizes: ["1", "2", "3", "4"],
    color: "Azul céu",
    isNew: true,
    releasedAt: "2026-11-01",
    images: [
      { src: photo("photo-1571240571053-3ddc83cdb289"), alt: "Menina pequena usando vestido regata azul-céu" },
      { src: photo("photo-1571240571053-3ddc83cdb289", { x: 0.5, y: 0.55, zoom: 2 }), alt: "Detalhe da malha do vestido" },
    ],
  }),
  p({
    slug: "sapatinho-trico-rosa",
    name: "Sapatinho Tricô Rosa",
    shortDescription: "Tricô de algodão para os primeiros meses.",
    description:
      "Sapatinho em tricô de algodão rosa com amarração no tornozelo, para manter os pés quentinhos sem apertar.",
    fabric: "100% algodão",
    details: ["Amarração no tornozelo", "Sola macia", "Feito à mão"],
    price: 69.9,
    categories: ["bebes", "acessorios"],
    collection: "primeiros-dias",
    sizes: ["RN", "P", "M"],
    color: "Rosa",
    releasedAt: "2026-03-30",
    images: [
      { src: photo("photo-1513091250092-b06c2b7981bc"), alt: "Par de sapatinhos de tricô rosa" },
      { src: photo("photo-1513091250092-b06c2b7981bc", { x: 0.5, y: 0.5, zoom: 2 }), alt: "Detalhe do tricô do sapatinho" },
    ],
  }),
  p({
    slug: "chapeu-palha-explorer",
    name: "Chapéu de Palha Explorer",
    shortDescription: "Palha natural com faixa de algodão.",
    description:
      "Chapéu de palha natural com faixa de algodão e cordão ajustável no queixo. Proteção do sol com cara de passeio no campo.",
    fabric: "Palha natural e faixa 100% algodão",
    details: ["Cordão ajustável", "Aba média", "Faixa removível"],
    price: 89.9,
    categories: ["acessorios", "meninas"],
    collection: "jardim-de-verao",
    sizes: ["P", "M", "G"],
    color: "Natural",
    isNew: true,
    releasedAt: "2026-10-20",
    images: [
      { src: photo("photo-1554342321-0776d282ceac"), alt: "Menina sorrindo com chapéu de palha" },
      { src: photo("photo-1554342321-0776d282ceac", { x: 0.5, y: 0.25, zoom: 2 }), alt: "Detalhe do chapéu de palha" },
    ],
  }),
  p({
    slug: "tenis-lona-petroleo",
    name: "Tênis Lona Petróleo",
    shortDescription: "Lona resistente com sola flexível.",
    description:
      "Tênis em lona azul-petróleo com cadarço e sola de borracha flexível, leve para correr o dia todo.",
    fabric: "Cabedal em lona de algodão, sola de borracha",
    details: ["Sola flexível", "Palmilha removível", "Biqueira reforçada"],
    price: 149.9,
    categories: ["acessorios", "meninos"],
    collection: "pequenos-classicos",
    sizes: ["1", "2", "3", "4", "6"],
    color: "Petróleo",
    releasedAt: "2026-05-02",
    images: [
      { src: photo("photo-1678192568478-9488ee55def6"), alt: "Par de tênis infantis de lona azul-petróleo" },
      { src: photo("photo-1678192568478-9488ee55def6", { x: 0.5, y: 0.5, zoom: 2 }), alt: "Detalhe da lona do tênis" },
    ],
  }),
  p({
    slug: "corta-vento-amarelo",
    name: "Corta-vento Amarelo",
    shortDescription: "Capuz e tecido repelente à água.",
    description:
      "Jaqueta corta-vento amarela com capuz, tecido repelente à água e forro em algodão. Para dias de garoa, trilhas e parquinho molhado.",
    fabric: "100% poliéster com acabamento repelente, forro em algodão",
    details: ["Repelente à água", "Capuz fixo", "Punhos com elástico"],
    price: 229.9,
    categories: ["meninos"],
    collection: "pequenos-classicos",
    sizes: ["1", "2", "3", "4", "6"],
    color: "Amarelo",
    isNew: true,
    releasedAt: "2026-11-08",
    images: [
      { src: photo("photo-1503919545889-aef636e10ad4"), alt: "Criança de costas usando corta-vento amarelo com capuz" },
      { src: photo("photo-1503919545889-aef636e10ad4", { x: 0.55, y: 0.35, zoom: 2 }), alt: "Detalhe do capuz do corta-vento" },
    ],
  }),
  p({
    slug: "tenis-primeiros-passos",
    name: "Tênis Primeiros Passos",
    shortDescription: "Couro macio e sola antiderrapante.",
    description:
      "Tênis branco em couro macio com detalhes vermelhos e sola antiderrapante flexível, pensado para os primeiros passos.",
    fabric: "Cabedal em couro, sola de borracha",
    details: ["Sola antiderrapante", "Fechamento com velcro", "Forro respirável"],
    price: 129.9,
    categories: ["bebes", "acessorios"],
    collection: "primeiros-dias",
    sizes: ["P", "M", "G", "GG"],
    color: "Branco",
    releasedAt: "2026-02-18",
    images: [
      { src: photo("photo-1584564515943-b54cbb61836b"), alt: "Tênis infantil branco com detalhes vermelhos" },
      { src: photo("photo-1584564515943-b54cbb61836b", { x: 0.5, y: 0.5, zoom: 2 }), alt: "Detalhe da costura do tênis" },
    ],
  }),
];

// ---------------------------------------------------------------------------
// Camada de acesso — troque por fetch() quando houver backend.
// ---------------------------------------------------------------------------

export const getProducts = () => PRODUCTS;
export const getProductBySlug = (slug: string) => PRODUCTS.find((x) => x.slug === slug);
export const getProductById = (id: string) => PRODUCTS.find((x) => x.id === id);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);

export const getNewArrivals = () =>
  PRODUCTS.filter((x) => x.isNew).sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));

export const getFeatured = () =>
  [
    "vestido-floral-infantil",
    "conjunto-casual-menina",
    "camiseta-premium-infantil",
    "conjunto-moletom",
    "macacao-bebe-ursinho",
    "jardineira-infantil",
    "vestido-tule-noite",
    "conjunto-linho-menino",
  ]
    .map(getProductBySlug)
    .filter((x): x is Product => Boolean(x));

export function getRelated(product: Product, limit = 4) {
  return PRODUCTS.filter(
    (x) => x.id !== product.id && x.categories.some((c) => product.categories.includes(c)),
  )
    .sort((a, b) => Number(b.collection === product.collection) - Number(a.collection === product.collection))
    .slice(0, limit);
}

export function searchProducts(query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return PRODUCTS.filter((x) => {
    const haystack = normalize([x.name, x.shortDescription, x.color, ...x.categories].join(" "));
    return terms.every((t) => haystack.includes(t));
  });
}

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
