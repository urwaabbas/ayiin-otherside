const QUESTIONS = [
  "What should I buy?",
  "Why should I buy it?",
  "Is it available?",
  "When will I receive it?",
  "Is this seller trustworthy?",
  "Is there a better option?",
  "Can I compare it?",
  "Can I get a better price?",
  "Can I buy this in bulk?",
  "Can I reorder it?",
  "Can I get a quote?",
];

export function QuestionMarquee({ tone = "light" }: { tone?: "light" | "dark" }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {QUESTIONS.map((q) => (
        <span key={q} className="flex items-center">
          <span className={tone === "dark" ? "text-porcelain/85" : "text-ink/85"}>{q}</span>
          <span aria-hidden className="mx-8 inline-block h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_0_1.5px_rgb(var(--rgb-ink)/0.85)]" />
        </span>
      ))}
    </div>
  );
  return (
    <div
      className="relative flex overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label="Questions Ayiin answers on every product"
    >
      <div className="display flex animate-marquee whitespace-nowrap text-[30px] tracking-[-0.03em] sm:text-[40px]" aria-hidden>
        {row}
        {row}
      </div>
      <ul className="sr-only">
        {QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </div>
  );
}
