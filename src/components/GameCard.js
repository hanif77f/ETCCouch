export default function GameCard({ game }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img src={game.image} alt={game.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl font-bold text-ink">{game.name}</h3>
        <p className="line-clamp-3 flex-1 text-sm leading-6 text-muted">{game.description}</p>
        <a
          href={game.playUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7Z" />
          </svg>
          Play Now
        </a>
      </div>
    </div>
  );
}
