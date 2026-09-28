# ScoreCard+

A modern, mobile-friendly golf scorecard built with Next.js. Track scores for up to 6 players across 9 or 18 holes, see how everyone stands relative to par, and share the final results as an image.

## Features

- **Player setup** – add up to 6 players per round.
- **Course setup** – choose 9 or 18 holes and enter pars either all at once or hole-by-hole as you play ("As You Go", the default).
- **Hole-by-hole scoring** – move between holes to record scores, and go back to edit earlier holes.
- **Scorecard view** – full table of every player's score per hole with totals, color-coded against par.
- **Final standings** – total strokes and score relative to par (e.g. `+3`, `-1`, `E`), ranked by winner.
- **Share results** – generates a results image and shares it via the device's native share sheet, or downloads it as a PNG as a fallback.
- **Feedback** – in-app feedback form that emails submissions via Gmail SMTP.
- **Persistent rounds** – round state is saved to `localStorage`, so a refresh won't lose your scores.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- [Nodemailer](https://nodemailer.com/) for feedback emails
- [html-to-image](https://github.com/bubkoo/html-to-image) for shareable result images
- [Genkit](https://firebase.google.com/docs/genkit) + Gemini (optional AI summary flow in `src/ai/`)
- Deployable to [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) (`apphosting.yaml`)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
npm run dev
```

Then open [http://localhost:9002](http://localhost:9002).

### Environment variables

Create a `.env.local` file in the project root (it is gitignored):

```env
# Required for the feedback form
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Optional: where feedback is sent (defaults to GMAIL_USER)
FEEDBACK_EMAIL=you@example.com

# Optional: only needed for the Genkit AI flows
GEMINI_API_KEY=your-gemini-api-key
```

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for how to generate a Gmail App Password.

## Scripts

| Command               | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start the dev server (Turbopack, port 9002)  |
| `npm run build`       | Production build                             |
| `npm run start`       | Serve the production build                   |
| `npm run lint`        | Run ESLint                                   |
| `npm run typecheck`   | Type-check with `tsc`                        |
| `npm run genkit:dev`  | Start the Genkit developer UI for AI flows   |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home screen
│   ├── (app)/
│   │   ├── player-setup/     # Add players
│   │   ├── course-setup/     # Hole count + pars
│   │   ├── round/[holeIndex] # Per-hole score entry
│   │   └── standings/        # Final results, share, feedback
│   └── api/feedback/         # Feedback email endpoint
├── components/               # App components + shadcn/ui primitives
├── ai/                       # Genkit config and flows
├── hooks/
└── lib/                      # Types and utilities
```
