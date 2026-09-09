import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import GamesGrid from "@/components/common/GamesGrid";
import { GAMES } from "@/data/playGames";
import { absoluteUrl } from "@/lib/site";

const title = "Free Online Games";
const description =
  "Play Chess, Connect 4, Tic-Tac-Toe and Battleship online for free against the computer or a friend. No downloads or sign-up required.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/games" },
  openGraph: {
    type: "website",
    title,
    description,
    url: absoluteUrl("/games"),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function GamesIndexPage() {
  return (
    <Section className="pt-12">
      <PageHeader
        title="All games"
        subtitle="Pick a game and start playing instantly — against the computer or a friend."
        className="mb-10"
      />
      <GamesGrid games={GAMES} />
    </Section>
  );
}
