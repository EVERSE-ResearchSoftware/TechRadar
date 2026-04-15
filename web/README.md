# TechRadar Web App - Developer Documentation

This folder contains the React + Vite frontend for the EVERSE TechRadar.
It renders the interactive radar and tool catalog using JSON metadata stored in the repository.

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

Run commands from this folder, not from the repository root:

```bash
cd web
npm install
npm run dev
```

The app starts with Vite (typically at `http://localhost:5173`).

## Available Scripts

- `npm run dev`: Start local dev server with HMR
- `npm run build`: Build production assets into `dist/`
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint on JS/JSX files
- `npm run format-json:check`: Check formatting for `../quality-tools/*.json`
- `npm run format-json:fix`: Auto-fix formatting for `../quality-tools/*.json`

## Project Structure

```text
web/
	src/
		components/      # Reusable UI (layout, radar, filters, forms)
		pages/           # Route-level pages (Home, ToolDetail, About)
		data/            # Data loading and color helpers
		App.jsx          # Router and route declarations
		main.jsx         # React app entry point
		index.css        # Global styles and Tailwind v4 theme tokens
	public/            # Static assets served as-is
	vite.config.js     # Build config, aliases, dev fs settings, base path
```

## Routing and Navigation

- The app uses `HashRouter` (`#/...` routes), which is GitHub Pages-friendly.
- Route mapping is defined in `src/App.jsx`:
	- `/` -> catalog home
	- `/tool/:id` -> tool detail view
	- `/about` -> about page

## Data Source and Loader

Tool data comes from JSON files in `../quality-tools` (outside `web/`).

- Vite alias: `@software-tools` -> `../quality-tools`
- Loader file: `src/data/loader.js`
- Import pattern: `import.meta.glob('@software-tools/*.json', { eager: true })`

This means:

- New/updated JSON files in `quality-tools/` are available to the UI at build time.
- Tool IDs in URLs are based on filenames (stored as `_filename` in loader output).

## Styling System

- Tailwind CSS v4 is enabled via `@import "tailwindcss"` in `src/index.css`.
- Custom theme tokens (colors) are declared in `@theme` in `src/index.css`.
- Shared visual container style uses the `glass-panel` class.

Note on links:

- Global anchor styling is intentionally limited to anchors without explicit Tailwind text color classes, so component-level classes like `text-white` are preserved.

## Adding or Updating Tool Data

1. Add or edit JSON in `quality-tools/` (repository root folder).
2. Ensure schema compatibility and consistent fields (`name`, `description`, `url`, quality dimensions, etc.).
3. Start the app with `npm run dev` in `web/` and verify:
	 - tool appears in catalog
	 - filtering and detail page behavior are correct
4. Run `npm run lint` and `npm run build` before opening a PR.

## Development Workflow

Recommended local checks before committing frontend changes:

```bash
cd web
npm run lint
npm run build
```

If `npm run dev` fails from the repository root, switch to `web/` and run it there.

## Repository Validation Checks

Use these checks when contributing catalog entries or repository-level changes.

### Catalog JSON formatting

Run from `web/`:

```bash
cd web
npm run format-json:check
```

Auto-fix formatting:

```bash
cd web
npm run format-json:fix
```

### JSON validation tests (Python)

Run from the repository root:

```bash
pip install -r tests/requirements.txt
python -m pytest tests/
```

## Deployment Notes

- `vite.config.js` sets `base: './'` for static hosting compatibility (including GitHub Pages).
- `HashRouter` avoids server-side rewrite requirements for client routes.

## Troubleshooting

- Dependencies not found:
	- Re-run `npm install` in `web/`
- JSON changes not reflected:
	- Restart `npm run dev`
	- Check JSON syntax and file extension (`.json`)
- Route opens blank page in static hosting:
	- Ensure URL includes hash route (for example `#/about`)

## Related Files

- App entry and routes: `src/App.jsx`, `src/main.jsx`
- Data loading: `src/data/loader.js`
- Theme and global styles: `src/index.css`
- Build and aliases: `vite.config.js`
