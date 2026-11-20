import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="display mt-4 text-6xl sm:text-7xl">
        Esta página <em className="text-rose-deep">se escondeu</em>
      </h1>
      <p className="mt-4 max-w-md text-navy-soft">O link pode ter mudado ou a peça saiu do catálogo.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Ir para o início</Link>
        <Link href="/loja" className="btn btn-outline">Ver a loja</Link>
      </div>
    </div>
  );
}
