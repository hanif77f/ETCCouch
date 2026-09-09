import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getToolTheme } from "@/data/toolThemes";

export default function ToolCard({ tool }) {
  const { slug, name, shortDescription, category } = tool;
  const href = `/free-online-tools/${slug}`;
  const { Icon, rgb } = getToolTheme(slug);

  return (
    <Card className="hover:-translate-y-1 hover:shadow-lift">
      <Link href={href} className="block focus-ring" aria-label={`Open ${name}`}>
        <div
          className="relative flex aspect-[16/10] items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, rgb(${rgb} / 0.22), rgb(${rgb} / 0.06))` }}
        >
          {category ? (
            <span
              className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: `rgb(${rgb} / 0.14)`, color: `rgb(${rgb})` }}
            >
              {category}
            </span>
          ) : null}
          {/* Big themed tool icon, standing in for cover art */}
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lift ring-1 ring-black/10"
            style={{ backgroundColor: `rgb(${rgb})` }}
          >
            <Icon className="h-7 w-7" strokeWidth={2.2} />
          </span>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: `rgb(${rgb})` }}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <h3 className="font-display text-lg font-semibold text-fg">{name}</h3>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{shortDescription}</p>
          <Button as="span" size="sm" className="w-full">
            <ArrowRight size={15} />
            Open tool
          </Button>
        </div>
      </Link>
    </Card>
  );
}

