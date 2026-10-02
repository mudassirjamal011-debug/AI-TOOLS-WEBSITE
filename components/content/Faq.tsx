import { ChevronDown } from 'lucide-react';

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Accessible FAQ accordion built on native <details>, so it works with the
 * keyboard and with JavaScript disabled.
 */
export function Faq({ items, className }: { items: FaqEntry[]; className?: string }) {
  return (
    <div className={`divide-y divide-line/10 overflow-hidden rounded-2xl border border-line/10 bg-surface/60 ${className ?? ''}`}>
      {items.map((item, index) => (
        <details key={item.question} className="group" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-[0.9375rem] font-semibold text-fg transition-colors hover:bg-surface-2/60 sm:px-5 [&::-webkit-details-marker]:hidden">
            <span className="text-balance">{item.question}</span>
            <ChevronDown
              aria-hidden
              className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4 pr-10 text-sm leading-relaxed text-muted sm:px-5">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
