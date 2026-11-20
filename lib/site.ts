// Conteúdo institucional e navegação. Contatos são de demonstração.

export const SITE = {
  name: "Henrique Baby & Kids",
  short: "Henrique",
  description:
    "Boutique de moda infantil: vestidos, conjuntos, peças para bebês e acessórios em algodão, linho e tricô. Frete grátis acima de R$ 199.",
  email: "atendimento@henriquebabykids.example",
  whatsappLabel: "WhatsApp (demonstração)",
  hours: "Segunda a sexta, 9h às 18h · Sábado, 9h às 13h",
  instagram: "@henriquebabykids",
  instagramUrl: "https://www.instagram.com/",
  city: "São Paulo, SP",
};

export const NAV = [
  { label: "Início", href: "/" },
  { label: "Meninas", href: "/loja/meninas" },
  { label: "Meninos", href: "/loja/meninos" },
  { label: "Bebês", href: "/loja/bebes" },
  { label: "Novidades", href: "/loja/novidades" },
  { label: "Coleções", href: "/colecoes" },
  { label: "Promoções", href: "/loja/promocoes" },
];

export const PROMO_MESSAGES = [
  "Frete grátis em compras acima de R$ 199",
  "Até 6x sem juros no cartão",
  "Primeira troca grátis em até 30 dias",
];

export type InfoPage = { slug: string; title: string; intro: string; sections: { heading: string; body: string }[] };

export const INFO_PAGES: InfoPage[] = [
  {
    slug: "sobre",
    title: "Nossa história",
    intro:
      "A Henrique Baby & Kids nasceu do desejo de vestir crianças com o mesmo cuidado que dedicamos às pessoas que amamos: tecidos naturais, cortes confortáveis e um olhar de moda que não abre mão da infância.",
    sections: [
      { heading: "O que escolhemos", body: "Trabalhamos com algodão, linho e tricô de fornecedores nacionais, em coleções pequenas para evitar desperdício." },
      { heading: "Para quem fazemos", body: "Do recém-nascido aos 12 anos, para o dia a dia, as festas e os momentos que viram fotografia." },
    ],
  },
  {
    slug: "trocas-e-devolucoes",
    title: "Trocas e devoluções",
    intro: "Se o tamanho não serviu ou a peça não encantou, a troca é simples.",
    sections: [
      { heading: "Prazo", body: "Até 30 dias corridos após o recebimento para trocas e 7 dias para devoluções por arrependimento, conforme o Código de Defesa do Consumidor." },
      { heading: "Condições", body: "A peça deve estar sem uso, com etiqueta e na embalagem original." },
      { heading: "Primeira troca grátis", body: "Enviamos um código de postagem sem custo para a primeira troca de cada pedido." },
    ],
  },
  {
    slug: "entrega",
    title: "Entrega e frete",
    intro: "Enviamos para todo o Brasil com rastreamento.",
    sections: [
      { heading: "Frete grátis", body: "Compras acima de R$ 199 têm frete grátis na modalidade econômica." },
      { heading: "Prazos", body: "De 2 a 9 dias úteis após a confirmação do pagamento, conforme a região." },
    ],
  },
  {
    slug: "privacidade",
    title: "Política de privacidade",
    intro: "Usamos seus dados apenas para processar pedidos, oferecer atendimento e, se você autorizar, enviar novidades.",
    sections: [
      { heading: "Dados coletados", body: "Nome, e-mail, endereço de entrega e histórico de pedidos. Dados de pagamento são processados pelo meio de pagamento, não ficam armazenados na loja." },
      { heading: "Seus direitos", body: "Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo nosso e-mail de atendimento, conforme a LGPD." },
    ],
  },
  {
    slug: "guia-de-medidas",
    title: "Guia de medidas",
    intro: "As medidas são do corpo da criança, em centímetros. Na dúvida entre dois tamanhos, escolha o maior.",
    sections: [],
  },
  {
    slug: "atendimento",
    title: "Atendimento",
    intro: "Fale com a nossa equipe para dúvidas sobre tamanhos, pedidos e trocas.",
    sections: [
      { heading: "Horário", body: "Segunda a sexta, 9h às 18h · Sábado, 9h às 13h" },
      { heading: "E-mail", body: "atendimento@henriquebabykids.example" },
    ],
  },
];

export const SIZE_CHART = {
  baby: [
    { size: "RN", age: "até 1 mês", height: "até 50", chest: "36" },
    { size: "P", age: "1 a 3 meses", height: "50–60", chest: "40" },
    { size: "M", age: "3 a 6 meses", height: "60–68", chest: "44" },
    { size: "G", age: "6 a 9 meses", height: "68–74", chest: "46" },
    { size: "GG", age: "9 a 12 meses", height: "74–80", chest: "48" },
  ],
  kids: [
    { size: "1", age: "1 ano", height: "80–86", chest: "50" },
    { size: "2", age: "2 anos", height: "86–92", chest: "52" },
    { size: "3", age: "3 anos", height: "92–98", chest: "54" },
    { size: "4", age: "4 anos", height: "98–104", chest: "56" },
    { size: "6", age: "6 anos", height: "110–116", chest: "60" },
    { size: "8", age: "8 anos", height: "122–128", chest: "64" },
    { size: "10", age: "10 anos", height: "134–140", chest: "68" },
    { size: "12", age: "12 anos", height: "146–152", chest: "72" },
  ],
};
