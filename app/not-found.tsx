import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function GlobalNotFound() {
  return (
    <div className="wrap flex min-h-dvh flex-col items-center justify-center py-20 text-center">
      <Logo />
      <p className="eyebrow mt-12">Erro 404</p>
      <h1 className="display mt-4 text-6xl sm:text-7xl">
        Esta página <em className="text-rose-deep">se escondeu</em>
      </h1>
      <p className="mt-4 max-w-md text-navy-soft">O link pode ter mudado ou a peça saiu do catálogo.</p>
      <Link href="/" className="btn btn-primary mt-10">Ir para o início</Link>
    </div>
  );
}
