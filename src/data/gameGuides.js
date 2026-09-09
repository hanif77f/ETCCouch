/**
 * Per-game supporting content shown in the sections below the board:
 * how to play, strategy tips and FAQs. `online` toggles the "Play with a
 * Friend" feature card for games that support cross-device play.
 *
 * FAQ copy doubles as long-tail SEO content — each entry answers a real
 * search query (free / no download / beginners / vs computer, etc.) built
 * around the keyword sets in `src/data/gameSeo.js`, and is rendered visibly
 * on the page so it qualifies for FAQPage rich results.
 */
export const GAME_GUIDES = {
  chess: {
    online: true,
    howToPlay: [
      "The goal is checkmate: trap the enemy king so it's under attack with no way to escape, block or capture the attacker.",
      "White always moves first, then players alternate one move at a time. Click a piece to see every legal move highlighted, then click a destination square to play it.",
      "Each piece moves its own way — pawns step forward (and capture diagonally), bishops slide diagonally, rooks move in straight lines, knights hop in an L-shape, the queen moves any direction, and the king moves one square at a time.",
      "Land on a square occupied by an enemy piece to capture it — it's removed from the board and shown in the captured tray beside the board.",
      "Special moves are handled for you automatically: castling (king + rook swap for safety), en passant (a special pawn capture) and pawn promotion when a pawn reaches the far row.",
      "When a king is under attack, that's check — you must respond immediately. If there's no legal move left to escape it, that's checkmate and the game ends.",
      "If the player to move has no legal moves but isn't in check, it's a stalemate — the game ends in a draw instead of a win.",
      "Play solo against the computer at Easy, Medium or Hard, or start a Play with Friend match and share the invite link to play chess online with someone on another device.",
    ],
    tips: [
      "Fight for the centre early with your pawns and knights — central control gives every piece more range.",
      "Develop all your pieces before attacking, and try not to move the same piece twice in the opening.",
      "Castle early to tuck your king safely behind a wall of pawns.",
      "Keep an eye on the captured tray — a material lead often decides the endgame.",
    ],
    faqs: [
      { q: "Is this chess game really free to play online?", a: "Yes — it's 100% free chess online with no download, no install and no sign-up. Just open the page in your browser and play instantly." },
      { q: "How strong is the computer opponent?", a: "Choose Easy, Medium or Hard to play chess vs computer online at your level. Higher levels look further ahead and blunder far less often." },
      { q: "Can I play chess online with a friend?", a: "Yes. Pick Play with Friend, hit Invite Friend and share the link — moves sync live between the two of you for chess multiplayer on separate devices." },
      { q: "Are castling, en passant and promotion supported?", a: "All of them work exactly as in standard chess, with promotion letting you pick the new piece." },
      { q: "Is this chess game good for beginners?", a: "Yes — start on Easy to learn the rules and basic tactics, then move up to Medium and Hard as your game improves." },
    ],
  },
  "connect-4": {
    online: true,
    howToPlay: [
      "The board is a grid standing on end — 7 columns wide and 6 rows tall — and the goal is to be the first to connect four of your own discs in a row.",
      "Red drops first, then Yellow, alternating one disc per turn.",
      "Click or tap any column to drop your disc into it — gravity pulls it straight down to the lowest empty slot in that column, so you can't choose the exact row.",
      "Connect four of your discs in a row to win — horizontally across, vertically up a column, or diagonally in either direction. The board highlights the winning line the moment it happens.",
      "Watch the whole board, not just your own discs — you need to notice and block your opponent's three-in-a-row before they can complete it.",
      "If all 42 slots fill up and nobody has connected four, the game ends in a draw.",
      "Play solo against the computer at Easy, Medium or Hard, or switch to Play with Friend for local pass-and-play on one screen or an online invite link across two devices.",
    ],
    tips: [
      "Grab the centre column when you can — it takes part in the most winning lines.",
      "Always scan for the opponent's three-in-a-row and block it before it becomes four.",
      "Build a 'double threat' — two ways to win at once — so a single block can't save them.",
    ],
    faqs: [
      { q: "Is Connect 4 free to play online?", a: "Yes — this is a completely free Connect 4 game with no download and no sign-up. Just load the page and start dropping discs." },
      { q: "How does the computer decide its move?", a: "It uses a Minimax search that looks several moves ahead to play Connect 4 vs computer; harder levels search deeper and play tighter defence." },
      { q: "Can I play Connect 4 with a friend?", a: "Yes — switch to Play with Friend and share the invite link for Connect 4 multiplayer across two devices, or pass-and-play locally for 2 player Connect 4." },
      { q: "What's a good Connect 4 strategy for beginners?", a: "Control the centre column, always block your opponent's three-in-a-row, and look for a double threat — two winning moves at once — so a single block can't stop you." },
    ],
  },
  "tic-tac-toe": {
    online: true,
    howToPlay: [
      "The board is a simple 3×3 grid of nine squares, and the goal is to be the first to line up three of your own marks in a row.",
      "X always goes first, then players alternate turns — one mark per turn, tapping any empty square to claim it.",
      "Get three of your marks in a row to win — across a row, down a column, or along either diagonal counts.",
      "Once a square is taken it can't be changed or moved, so think a move ahead before you tap.",
      "If all nine squares fill up and neither player has three in a row, the round ends in a draw.",
      "Play solo against the computer — choose Easy or Medium for a fair fight, or Perfect if you want a real challenge — or pick Play with Friend for quick local rounds or an online invite link.",
    ],
    tips: [
      "Open with a corner or the centre — both create the most winning chances.",
      "Watch for a move that makes two lines at once; that's an unstoppable fork.",
      "Against the Perfect AI, best play always ends in a draw — your goal is to avoid slipping up.",
    ],
    faqs: [
      { q: "Is this Tic Tac Toe game free, and do I need to download anything?", a: "It's completely free Tic Tac Toe with no download and no sign-up — just open your browser and play." },
      { q: "Why can't I beat the Perfect difficulty?", a: "Perfect mode plays a flawless Minimax strategy to challenge you at Tic Tac Toe vs computer. With correct play from both sides, Tic Tac Toe always ends in a draw." },
      { q: "Can I play Tic Tac Toe with a friend?", a: "Yes — choose Play with Friend for local 2 player pass-and-play, or share a link to play Tic Tac Toe online with friends on separate devices." },
      { q: "Is Tic Tac Toe a quick game to play?", a: "Yes — a round usually takes under a minute, making it a perfect quick Tic Tac Toe game whenever you have a spare moment." },
    ],
  },
  battleship: {
    online: false,
    howToPlay: [
      "Your fleet has 5 ships on a 10×10 grid: a 5-cell Carrier, a 4-cell Battleship, a 3-cell Cruiser, a 3-cell Submarine and a 2-cell Destroyer.",
      "During setup your fleet is placed for you — don't like the layout? Hit Shuffle fleet to re-roll it as many times as you want, then Start battle when you're happy.",
      "Once the battle starts, take turns firing at the enemy's hidden grid — click any cell you haven't already targeted to fire a shot there.",
      "A shot on empty water is a miss and your turn ends; a shot on an enemy ship is a hit and gets marked on the grid.",
      "Keep hitting every cell of the same ship to sink it completely — a sunk ship is revealed and marked so you know it's fully destroyed.",
      "Each side's grid shows how many ships it still has left, so you can track how close either fleet is to being wiped out.",
      "The computer fires back on its turn using hunt-and-target logic — it searches randomly until it lands a hit, then homes in on the cells around it.",
      "Sink the entire enemy fleet before all of your own ships go down to win the battle.",
    ],
    tips: [
      "Fire in a checkerboard pattern — no ship can hide from evenly spaced shots.",
      "After a hit, target the four adjacent cells to finish the ship quickly.",
      "Track which ships remain; the biggest ones are the easiest to corner.",
    ],
    faqs: [
      { q: "Is this Battleship game free to play online?", a: "Yes — it's a free Battleship game with no download and no sign-up. Just open the page, place your fleet and start firing." },
      { q: "How does the computer aim in Battleship?", a: "Playing Battleship against the computer means facing hunt-and-target logic: it searches randomly until it lands a hit, then closes in on the surrounding cells." },
      { q: "Can I rearrange my ships before the battle starts?", a: "Yes — use Shuffle fleet during setup to try different layouts until you like your strategy, then start the battle." },
      { q: "What's the best Battleship strategy to win?", a: "Fire in an even checkerboard pattern to cover the whole grid efficiently, then target the cells around every hit to sink each ship fast." },
    ],
  },
};

export const getGameGuide = (slug) => GAME_GUIDES[slug] || null;

