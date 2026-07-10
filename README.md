# ThemeParksPlayground

A React dashboard for tracking live attraction wait times across
Orlando theme parks. Built as a project to learn React and
TypeScript, using [Claude Code](https://claude.com/claude-code) as a learning
tool along the way.

Live site: https://jondominguezv.github.io/ThemeParksPlayground/

## Features

- **Browse all attractions** across four Orlando destinations (Universal
  Orlando Resort, Walt Disney World Resort, SeaWorld Orlando, LEGOLAND
  Florida), grouped by destination and park.
- **Sort and filter**: by name, wait time, or status, with a destination
  picker and a text search box. Groups collapse and persist per browser.
- **Custom dashboard**: track specific attractions and view only those,
  independent of the full browse list.
- **Wait times auto-refresh** on an interval, with a manual refresh option
  and skeleton loading states while data is in flight.
- Tracked attractions and UI collapse state persist in `localStorage`, so
  they survive a page reload.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the dev server and build
- [react-router-dom](https://reactrouter.com/) for client side routing
  between the Browse and Custom Dashboard pages
- [`themeparks`](https://www.npmjs.com/package/themeparks), the official JS
  SDK for the [ThemeParks.wiki](https://themeparks.wiki/) API, called
  directly from the browser (no backend)
- Plain CSS, no UI framework

## Getting started

```bash
npm install
npm run dev
```

This starts a local dev server with hot reload. Open the printed URL in your
browser.

Other scripts:

```bash
npm run build    # type check, then produce a production build in dist/
npm run lint     # run ESLint
npm run preview  # serve the production build locally
```

## Project structure

```
src/
  api/catalog.ts        # fetches and merges live wait time data from the themeparks SDK
  components/           # AttractionCard, SkeletonCard
  hooks/                 # data fetching, persisted state, and layout hooks
  pages/                 # BrowseAttractions and CustomDashboard, one per route
  utils/setUtils.ts      # small helpers for working with Sets immutably
  App.tsx                # top level layout, routing, and shared state
```

`catalog.ts` is the one place that talks to the ThemeParks.wiki API. Since the
API doesn't return which park an attraction belongs to alongside its live
wait time, `catalog.ts` fetches each destination's entity hierarchy
separately and walks each attraction's parent chain to resolve its park, then
merges that with the live wait time data.

## Deployment

Pushes to `main` trigger a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds the app and publishes it to
GitHub Pages. The Vite `base` path in `vite.config.ts` is set to
`/ThemeParksPlayground/` to match the project site subpath.

## Third party notices

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution of
non-code assets.
