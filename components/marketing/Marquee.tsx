const rowOne = [
  { emoji: "👗", name: "Fashion by Ada", tint: "bg-rose-50 text-rose-700 ring-rose-100" },
  { emoji: "🍲", name: "Mama's Kitchen", tint: "bg-amber-50 text-amber-700 ring-amber-100" },
  { emoji: "💄", name: "Ngozi Cosmetics", tint: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100" },
  { emoji: "📚", name: "Lagos Book Hub", tint: "bg-sky-50 text-sky-700 ring-sky-100" },
  { emoji: "📱", name: "Tech by Emeka", tint: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  { emoji: "👟", name: "Kemi's Shoes", tint: "bg-orange-50 text-orange-700 ring-orange-100" },
];

const rowTwo = [
  { emoji: "🥬", name: "Fresh Farms NG", tint: "bg-accent-50 text-accent-700 ring-accent-100" },
  { emoji: "🧺", name: "Abuja Crafts", tint: "bg-violet-50 text-violet-700 ring-violet-100" },
  { emoji: "🔌", name: "Chidi Electronics", tint: "bg-cyan-50 text-cyan-700 ring-cyan-100" },
  { emoji: "🛋️", name: "Sade Home Decor", tint: "bg-teal-50 text-teal-700 ring-teal-100" },
  { emoji: "💍", name: "Zara Accessories", tint: "bg-pink-50 text-pink-700 ring-pink-100" },
  { emoji: "🎂", name: "Bisi Bakes", tint: "bg-yellow-50 text-yellow-700 ring-yellow-100" },
];

function ChipRow({
  items,
  reverse = false,
}: {
  items: typeof rowOne;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className={`flex gap-3 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
    >
      {doubled.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-1 ${item.tint}`}
        >
          <span aria-hidden="true">{item.emoji}</span>
          {item.name}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="bg-white border-b border-zinc-100 py-10 overflow-hidden select-none">
      <p className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-[0.15em] mb-6">
        Every kind of business, one kind of store
      </p>
      <div className="space-y-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ChipRow items={rowOne} />
        <ChipRow items={rowTwo} reverse />
      </div>
    </div>
  );
}
