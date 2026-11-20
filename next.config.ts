import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As fotos de demonstração vêm do CDN da Unsplash, que já redimensiona sob demanda.
    // Ao integrar o backend/CDN próprio, troque o loader em lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
