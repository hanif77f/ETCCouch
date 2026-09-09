/**
 * Per-game on-page SEO content: target keywords, meta/OG tags and the
 * recommended H1. Consumed by `generateMetadata` and the JSON-LD schema
 * builders in `src/app/games/[slug]/page.js` — nothing else needs this data.
 */
export const GAME_SEO = {
  chess: {
    primaryKeyword: "play chess online free",
    secondaryKeywords: [
      "play chess online",
      "free chess online",
      "chess game online",
      "chess vs computer online",
      "chess online with friends",
      "chess multiplayer",
      "chess no download",
      "chess no signup",
    ],
    metaTitle: "Play Chess Online Free – Challenge Computer or Friends",
    metaDescription:
      "Play chess online free against the computer or challenge a friend. Enjoy a classic chess game in your browser with no download or sign-up required.",
    ogTitle: "Play Chess Online Free with Computer or Friends",
    ogDescription:
      "Challenge the computer or play chess online with friends. Enjoy a free browser-based chess game and start playing instantly with no download required.",
    h1: "Play Chess Online Free",
  },
  "connect-4": {
    primaryKeyword: "connect 4 online free",
    secondaryKeywords: [
      "connect 4 online",
      "play connect 4 online",
      "connect four online",
      "connect 4 vs computer",
      "connect 4 multiplayer",
      "connect 4 with friends",
      "connect 4 2 player",
      "connect 4 no download",
      "connect 4 strategy",
    ],
    metaTitle: "Play Connect 4 Online Free – Computer or 2 Player",
    metaDescription:
      "Play Connect 4 online free against the computer or with a friend. Drop your pieces, connect four in a row, and enjoy quick 2-player strategy games.",
    ogTitle: "Play Connect 4 Online Free with Friends or Computer",
    ogDescription:
      "Play Connect 4 online against the computer or challenge a friend. Drop your pieces, connect four in a row, and enjoy a free strategy game instantly.",
    h1: "Play Connect 4 Online Free",
  },
  "tic-tac-toe": {
    primaryKeyword: "tic tac toe online free",
    secondaryKeywords: [
      "play tic tac toe online",
      "free tic tac toe",
      "tic tac toe game online",
      "tic tac toe vs computer",
      "tic tac toe with friends",
      "tic tac toe multiplayer",
      "tic tac toe 2 player",
      "tic tac toe no download",
      "quick tic tac toe game",
    ],
    metaTitle: "Play Tic Tac Toe Online Free – Computer or 2 Player",
    metaDescription:
      "Play Tic Tac Toe online free against the computer or with a friend. Place your Xs and Os, make three in a row, and enjoy quick 2-player games.",
    ogTitle: "Play Tic Tac Toe Online Free with Friends or Computer",
    ogDescription:
      "Enjoy a quick Tic Tac Toe game online. Challenge the computer or play with a friend and try to get three Xs or Os in a row before your opponent.",
    h1: "Play Tic Tac Toe Online Free",
  },
  battleship: {
    primaryKeyword: "play battleship online",
    secondaryKeywords: [
      "battleship online",
      "battleship game online",
      "battleship online free",
      "free battleship game",
      "battleship vs computer",
      "battleship against computer",
      "battleship strategy",
      "battleship strategy game",
      "battleship browser game",
      "battleship no download",
    ],
    metaTitle: "Play Battleship Online Free – Sink the Enemy Fleet",
    metaDescription:
      "Play Battleship online free against the computer. Place your fleet, plan your strategy, target enemy ships, and sink the entire fleet to win.",
    ogTitle: "Play Battleship Online Free – Plan, Target and Sink",
    ogDescription:
      "Play a free Battleship game online, position your fleet, choose your targets, and use smart strategy to sink every enemy ship before they sink yours.",
    h1: "Play Battleship Online Free",
  },
};

export const getGameSeo = (slug) => GAME_SEO[slug] || null;

