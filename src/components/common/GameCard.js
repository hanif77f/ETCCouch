import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getGameTheme } from "@/data/gameThemes";

export default function GameCard({ game }) {
  const { slug, name, shortDescription, cover, players } = game;
  const href = `/games/${slug}`;
  const { Icon, rgb } = getGameTheme(slug);

  return (
    <Card className="hover:-translate-y-1 hover:shadow-lift">
      <Link href={href} className="block focus-ring" aria-label={`Play ${name}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={cover}
            alt={`${name} cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {players ? (
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {players}
            </span>
          ) : null}
          {/* Catchy themed game icon — flat, solid square tile like the reference "more games" grid */}
          <span
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-lift ring-1 ring-black/20"
            style={{ backgroundColor: `rgb(${rgb})` }}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
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
            <Play size={15} />
            Play now
          </Button>
        </div>
      </Link>
    </Card>
  );
}

