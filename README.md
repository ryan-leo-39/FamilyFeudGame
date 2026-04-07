# Family Feud Game

A fully-featured Family Feud party game app built with React. Host a game with friends and family — right in the browser, no downloads required.

**Live App: [https://familyfeudgame.netlify.app](https://familyfeudgame.netlify.app)**

---

## Features

- **Full game flow** — Face-off, playing rounds, steal mechanic, and a final double-points round
- **Fast Money round** — Optional bonus round with a 20-second timer and two-player reveal
- **Custom questions** — Add, edit, and delete your own questions and answers through the built-in Question Manager
- **Host Answer Key** — Print or view a clean answer key so the host can follow along without spoiling the board
- **8-tile board** — Always shows 8 answer boxes just like the real show; unused slots stay blank
- **Flip animations** — Answers flip open when revealed
- **Sound effects** — Dings, buzzers, applause, and fanfare all generated in the browser (no audio files needed)
- **Score tracking** — Live scoreboard with active team indicator
- **Import / Export** — Save your question sets as JSON files and load them back anytime

---

## How to Play

1. Go to **Manage Questions** to set up your questions and answers (or use the included sample questions to test)
2. Click **New Game** and configure team names, number of rounds, and whether to include Fast Money
3. The **Host Panel** (right side) controls the game — players should not see this panel
4. During each round:
   - The host picks which team won the face-off
   - Players give answers; the host clicks the matching number to reveal it
   - Wrong answers get a Strike — 3 strikes gives the other team a steal attempt
   - The last round is always **double points**
5. After all rounds, optionally play **Fast Money** — two players each answer 5 questions in 20 seconds; 200+ combined points wins the jackpot

---

## Question Manager

- Navigate to **Manage Questions** from the home screen
- Each question supports up to **8 answers** — only fill in as many as you need
- Points for filled answers must add up to **100**
- Separate tab for **Fast Money** questions (5 answers each)
- Use **Export** to save your questions as a `.json` file and **Import** to load them back
- Click **Answer Key** to open a printable page with all questions and answers — print it before the game so the host can follow along off-screen

---

## Running Locally

```bash
git clone https://github.com/ryan-leo-39/FamilyFeudGame.git
cd FamilyFeudGame
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Tech Stack

- [React](https://react.dev) + [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) — animations
- Web Audio API — all sounds generated in-browser
- [React Router](https://reactrouter.com)
- Hosted on [Netlify](https://netlify.com)
