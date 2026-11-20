type LoaderArgs = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality }: LoaderArgs) {
  // Arquivos locais (public/) são servidos como estão.
  if (src.startsWith("/")) return src;
  const url = new URL(src);
  if (url.hostname === "images.unsplash.com") {
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    url.searchParams.set("auto", "format");
    if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
    return url.toString();
  }
  // Fotos do Supabase Storage: o arquivo original já é otimizado no envio
  // (o admin converte para WebP); o parâmetro só identifica a largura pedida.
  url.searchParams.set("w", String(width));
  return url.toString();
}
