import { Feather, Gem, ShieldCheck, Sprout } from "lucide-react";

const ITEMS = [
  { icon: Feather, title: "Conforto em cada detalhe", text: "Tecidos naturais, costuras planas e etiquetas que não pinicam." },
  { icon: Gem, title: "Qualidade selecionada", text: "Algodão pima, linho e tricô de fornecedores nacionais." },
  { icon: Sprout, title: "Estilo para cada fase", text: "Do RN ao 12, com modelagens que acompanham o crescimento." },
  { icon: ShieldCheck, title: "Compra segura", text: "Pagamento protegido e primeira troca grátis em 30 dias." },
];

export function Benefits() {
  return (
    <section className="border-y border-line bg-white" aria-label="Diferenciais da marca">
      <ul className="wrap grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className={`group flex gap-5 py-8 sm:px-6 lg:py-12 ${i > 0 ? "lg:border-l lg:border-line" : "lg:pl-0"} ${i % 2 === 1 ? "sm:border-l sm:border-line lg:border-l" : ""} ${i > 1 ? "sm:border-t sm:border-line lg:border-t-0" : ""}`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blush text-rose-deep transition-all duration-500 group-hover:-translate-y-0.5 group-hover:bg-sky-soft group-hover:text-sky-deep">
              <Icon className="size-5" strokeWidth={1.4} />
            </span>
            <div>
              <h3 className="font-serif text-[22px] font-medium leading-tight">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-soft">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
