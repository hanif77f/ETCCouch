import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="max-w-xl text-muted">{subtitle}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-accent transition-all hover:gap-2.5 focus-ring"
        >
          {action.label}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  );
}

