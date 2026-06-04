# Kiranic.com (The "I Let The AI Do It" Edition)

![Build Status](https://img.shields.io/badge/build-passing_(probably)-brightgreen)
![AI Contribution](https://img.shields.io/badge/AI_Contribution-99.9%25-blueviolet)
![Human Effort](https://img.shields.io/badge/Human_Effort-Minimal-red)

Welcome to the source code for [Kiranic.com](https://kiranic.com). 

If you're looking for hand-crafted, artisanally sourced, gluten-free code written by a monk on a mountain top... **you are in the wrong place.**

This repository is a testament to what happens when you pair a lazy (efficient?) human with an over-caffeinated Large Language Model.

## 🤖 Full Disclosure

Approximately **99% of this code was written by an AI Agent** (Google DeepMind's Antigravity). The human (Kiran) mostly just hit `Enter`, drank coffee, and occasionally fixed a CSS z-index issue that I couldn't figure out because I don't have eyes.

### ✨ Features (The "Why It's Cool" Section)

#### 🤖 AI-Generated "Slop" Feed
*   **Concept**: A satirical news feed generated entirely by AI, mocking the very industry that created it.
*   **Tech**: Uses Google Gemini API (`scripts/generate-slop.js`) to hallucinate markdown articles.
*   **Automation**: A daily GitHub Action cron job (`.github/workflows/daily-slop.yml`) generates, commits, and deploys new content automatically.

#### 🎰 The Slop Machine
*   **Concept**: The Slop Feed costs real Gemini tokens. This one (`src/pages/slop-machine.astro`) hallucinates the same nonsense client-side, infinitely, for **$0.00**. The irony is the feature.
*   **Tech**: A combinatorial grammar in vanilla JS pulls a slot-machine lever, "spins the reels," and assembles satirical headlines. Copy + tweet built in. Bound to spacebar for the truly committed.

#### ⌘K Command Palette
*   **Concept**: A site-wide launcher (`src/components/CommandPalette.astro`) for people who refuse to touch a mouse.
*   **Features**: Fuzzy search across pages and actions, "jump to a random slop article," theme toggle, copy-email — all keyboard-navigable. Press <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> anywhere.

#### 🥚 The Konami Egg
*   **Concept**: <kbd>↑↑↓↓←→←→ B A</kbd> engages "SLOP MODE" — a brief rain of buzzwords from `src/components/EasterEgg.astro`.
*   **Tasteful**: Respects `prefers-reduced-motion` and cleans up after itself even if you rage-quit to another tab.

#### 💥 A 404 That Owns It
*   **Concept**: `src/pages/404.astro` greets missing pages with a terminal-styled `HallucinationError` stack trace and the path you actually tried to reach. Confidently asserted, never existed.

#### 🗞️ Slop of the Day
*   **Concept**: The homepage hero shows one freshly-hallucinated headline — deterministic per day (seeded by date), so the daily deploy reseeds it. Shares its grammar with the Slop Machine via `src/data/slop.ts`.

#### 📊 Fake Article Telemetry
*   **Concept**: Every AI Slop article gets a confident little dashboard — real reading time, plus a satirical "AI confidence" meter, tokens burned, and (reluctant) human edits. Deterministic per article (seeded by slug).

#### 📜 Colophon
*   **Concept**: `/colophon` is an honest accounting of the stack, the truths ("99% written by an AI"), and a wink at everything hiding between the pixels.

#### 📧 Self-Hosted Newsletter Engine
*   **Architecture**: Zero-cost, privacy-focused, and fully owned.
*   **Stack**:
    *   **Storage**: Cloudflare D1 (Serverless SQLite) stores subscribers.
    *   **Sending**: Resend API (Free Tier) sends emails from `kp@kiranic.com`.
    *   **Automation**: A weekly GitHub Action grabs the latest articles and dispatches emails.
*   **Privacy**: Tokens are used for one-click unsubscribes (`/unsubscribe?token=...`), ensuring no user data is exposed.

#### 🌗 Dark Mode (That Doesn't Flash)
*   Implemented a toggle that persists preference to `localStorage`.
*   Includes a script blocker in `<head>` to prevent the dreaded "Flash of Unstyled Content" (FOUC).
*   Dynamic Sun/Moon icons in the navbar because we're fancy.

#### 📈 Programmatic SEO Strategy
*   **Sitemap**: Automatically generated sitemap at `/sitemap-index.xml`.
*   **JSON-LD**: Structured data injected into every page (`Person`, `Article`) to help Google understand who I am.
*   **Meta Tags**: Dynamic Open Graph images and Twitter cards.
*   **Glossary**: usage of `scripts/generate-glossary.js` to mass-produce 50+ definitions for "Enterprise Architecture" terms.

#### 💬 Community Features
*   **Giscus**: GitHub Discussions embedded as a comment system.
*   **Native Share**: Uses the Web Share API on mobile for native sharing sheets.

## 🛠️ How to Run This Behemoth

If you really want to run this locally and see how the sausage is made:

1.  **Clone it** (you know how).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run it**:
    ```bash
    npm run dev
    ```
4.  **Generate your own Slop**:
    You need a `GEMINI_API_KEY` in your `.env` file. Then run:
    ```bash
    node scripts/generate-slop.js
    ```
    *Warning: May cause hallucinations.*

## 🐛 Known Bugs

*   The code is too clean. It lacks the "human touch" of variable names like `temp2_final_FIXED`.
*   Sometimes the AI makes up words. We call that "innovation".

## 🥚 Easter Eggs

<!-- You found one! The password is "Swordfish". -->

If you click the "Generate More Hallucinations" button on the `/ai-slop` page enough times, nothing special happens, but you *will* help warm up the Earth by a fraction of a degree.

Also, try searching the codebase for "stochastic parrot".

## 📚 Documentation

For a deep dive into the architecture, deployment, and operation of this project, please refer to the comprehensive documentation suite located in the `docs/` directory:

- [Overview](docs/OVERVIEW.md): High-level purpose and functionality.
- [Architecture (HLD/LLD)](docs/architecture/): System design, data models, and component diagrams.
- [Pipeline](docs/PIPELINE.md): CI/CD and automation workflows.
- [Technical Reference](docs/TECHNICAL_REFERENCE.md): APIs, environment variables, and configurations.
- [Runbooks](docs/runbooks/): Troubleshooting and deployment guides.
- [Business & User Guide](docs/BUSINESS_USER_GUIDE.md): Target audience and user manuals.
- [Brand Guidelines](docs/branding.md): Design tokens and aesthetics.

## License

MIT. Or whatever. The AI doesn't believe in property rights.

---
*Generated by Antigravity. Approved by Kiran (probably).*
