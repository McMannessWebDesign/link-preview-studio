# Link Preview Studio

A web tool that lets you paste any URL and instantly see how it will appear when shared on **Twitter/X**, **Slack**, and **LinkedIn**. It extracts Open Graph and meta tags server-side and renders accurate, current platform preview cards.

## Quick Start

```bash
git clone <repo-url>
cd link-preview-studio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

## Features

### Must-Haves
- **URL input** accepting any publicly accessible URL
- **Server-side fetch** via Next.js API route (`/api/fetch-meta`) -- no client-side CORS issues
- **Meta tag extraction**: `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `<title>`, `<meta name="description">`
- **Three platform preview cards** (Twitter/X, Slack, LinkedIn) styled to match current 2025 designs
- **URL history** persisting the last 10 checked URLs across page refreshes
- **Error handling** for bad URLs, timeouts, non-HTML pages, and missing meta tags

### Bonus Features
- **Meta tag health score** with visual ring showing completeness percentage
- **Copy any meta tag value** to clipboard (hover to reveal copy button)
- **Dark mode** with system preference detection and manual toggle
- **Mobile-responsive** layout
- **Smooth animations** on card appearance

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | Framework + API routes |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Cheerio | Server-side HTML parsing |

## Architecture Decisions

### Server-Side Fetch
The URL fetch happens in `/api/fetch-meta` (POST route). This avoids CORS restrictions that would block client-side fetches and allows us to set a proper User-Agent header. The endpoint has a 10-second timeout and validates that the response is HTML before parsing.

### URL History Storage
History is stored in **localStorage**. This was chosen because:
- It persists across page refreshes (requirement met)
- Zero setup required -- no database, no accounts
- Keeps the app self-contained with no external dependencies
- For a tool used by individual users checking their own URLs, client-side storage is the right scope

For a production multi-user version, history would move to a database (Supabase/PostgreSQL) with user authentication.

### Preview Card Accuracy
Card designs were researched against live platforms and reference tools (opengraph.xyz, metatags.io) as of March 2025:
- **Twitter/X**: Title overlaid as pill on image bottom-left, domain below card (post-Oct 2023 design)
- **Slack**: Left border accent, favicon + site name header, blue bold title link
- **LinkedIn**: Compact horizontal layout (thumbnail left, text right) matching current organic post format

### AI Tool Usage
This project was built with assistance from Claude (Anthropic). Specific areas where AI was used:
- Initial project scaffolding and component structure
- Platform card design research and CSS accuracy
- Meta tag extraction logic with cheerio
- Error handling edge cases

All generated code was reviewed and adjusted for accuracy against live platform references.

## Project Structure

```
src/app/
  page.tsx                    # Main page (client component)
  types.ts                    # Shared TypeScript types
  globals.css                 # Tailwind + animations
  api/
    fetch-meta/route.ts       # Server-side URL fetch + parsing
    health/route.ts           # Health check endpoint
  components/
    UrlInput.tsx              # URL input form
    TwitterCard.tsx           # X/Twitter preview card
    SlackCard.tsx             # Slack unfurl preview
    LinkedInCard.tsx          # LinkedIn preview card
    HealthScore.tsx           # Meta tag completeness checker
    History.tsx               # Recent URL history
    DarkModeToggle.tsx        # Theme switcher
    ErrorMessage.tsx          # Error display
```
