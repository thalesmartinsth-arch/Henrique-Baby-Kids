// Fotos de demonstração (Unsplash, licença gratuita). Substituir pelas fotos da marca.
const BASE = "https://images.unsplash.com/";

type Focus = { x: number; y: number; zoom?: number };

/** Monta a URL base de uma foto; `focus` gera recortes de detalhe da mesma imagem. */
export function photo(id: string, focus?: Focus) {
  if (!focus) return `${BASE}${id}?fit=crop`;
  const p = new URLSearchParams({
    fit: "crop",
    crop: "focalpoint",
    "fp-x": String(focus.x),
    "fp-y": String(focus.y),
    "fp-z": String(focus.zoom ?? 1),
  });
  return `${BASE}${id}?${p.toString()}`;
}

export const PHOTOS = {
  heroField: "photo-1620420375091-f66a919dcbda",
  heroPair: "photo-1620420678517-d45e226dfe6c",
  heroMeadow: "photo-1504697140411-97eb65b90c16",
  editorialForest: "photo-1647627611823-d08fa901678e",
  collectionClassics: "photo-1519238263530-99bdd11df2ea",
  collectionGarden: "photo-1620774760711-caa4c94d683a",
  collectionBaby: "photo-1546015720-b8b30df5aa27",
  catGirls: "photo-1505377403482-95aba626ad3c",
  catBoys: "photo-1656734314205-bfadf4f789c2",
  catBabies: "photo-1673340979193-481dd0eb49c8",
  catSets: "photo-1604303768345-038b79a8c47a",
  catDresses: "photo-1513791149369-f88da26c8e93",
  catAccessories: "photo-1594150878496-a921e5af8907",
  insta: [
    "photo-1621452773781-0f992fd1f5cb",
    "photo-1768896041267-f15e07697fc8",
    "photo-1766918780914-5df4a5a98c44",
    "photo-1599624427857-461fd60c23e5",
    "photo-1590480598135-3be152c87913",
    "photo-1637878257903-7f08eab9a7f2",
    "photo-1615489548573-8165c2c35e1b",
    "photo-1560506840-ec148e82a604",
  ],
  account: "photo-1700751616200-538519121c6b",
} as const;
