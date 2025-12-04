# CVE Explorer - AI Coding Agent Instructions

## Project Overview
CVE Explorer is a React 19 + Vite web application for exploring Common Vulnerabilities and Exposures (CVE). It's a "Nuit de l'Info 2025" challenge entry. The project uses modern React with Vite for fast development and builds.

## Architecture & Key Components

### Technology Stack
- **Frontend Framework**: React 19 with Fast Refresh via Vite
- **Build Tool**: Vite 7 (fastest React build tool)
- **Styling**: CSS Modules (App.css, index.css)
- **Linting**: ESLint 9 with React Hooks and React Refresh plugins
- **Language**: JavaScript/JSX (no TypeScript currently)

### File Structure
```
src/
├── App.jsx          # Main app container (currently placeholder for Input/Output)
├── App.css          # App styling
├── main.jsx         # React root rendering
├── index.css        # Global styles
└── assets/          # Static assets location
```

### Key Architecture Decisions
1. **No TypeScript**: Project uses plain JavaScript/JSX for rapid development
2. **Minimal Setup**: Starting template with placeholder components - features are being built
3. **Vite + React**: Prioritizes dev speed (HMR) over build optimization
4. **Strict Mode Enabled**: React.StrictMode wraps the app for development safety

## Development Workflows

### Essential Commands
- `npm run dev` - Start Vite dev server with HMR (default: http://localhost:5173)
- `npm run build` - Production build to `dist/` directory
- `npm run lint` - Run ESLint on all JS/JSX files
- `npm run preview` - Preview production build locally

### Building & Testing
- **No test framework installed yet** - Tests will need Jest/Vitest setup if added
- **Linting is strict**: Unused variables cause errors except those matching `^[A-Z_]` pattern
- **Fast Refresh enabled**: JSX changes hot-reload without losing component state

## Project-Specific Patterns & Conventions

### Component Structure
- Components are functional components with JSX
- App.jsx has inline comments indicating where Input and Output components should go
- CSS modules co-located with components (App.jsx + App.css pattern)

### ESLint Rules (from eslint.config.js)
- Follows `@eslint/js` recommended rules
- Enforces React Hooks best practices via `eslint-plugin-react-hooks`
- React Refresh plugin ensures Fast Refresh compatibility
- **Custom rule**: Unused variables ignored if they start with uppercase or underscore (e.g., `_unused`, `MyComponent`)

### Import Pattern
- ES modules only (`import`/`export`)
- React components use named exports by default (see App.jsx)

## Integration Points & Dependencies

### External Data/APIs
- **Currently**: Placeholder app with no external integrations
- **Future**: CVE data will likely come from an external API (e.g., NVD API, cvedetails.com)
- **Note**: CORS considerations if fetching from external APIs in browser

### Dependencies to Know
- `react-dom@^19.2.0` - Must stay in sync with React version
- `@vitejs/plugin-react@^5.1.1` - Handles Babel/Fast Refresh
- All ESLint plugins are dev-only (safe to remove in production)

## Common Development Tasks

### Adding a New Component
1. Create file in `src/` (e.g., `src/components/SearchInput.jsx`)
2. Create companion CSS file (e.g., `src/components/SearchInput.css`)
3. Export as default or named export (check existing pattern)
4. Import and use in App.jsx
5. Run `npm run lint` to verify ESLint compliance

### Modifying Styles
- Use `App.css` for app-level styles or create component-specific CSS
- Vite handles CSS imports automatically
- No CSS preprocessor configured (plain CSS only)

### Debugging
- Use browser DevTools with React Developer Tools extension
- Vite dev server provides sourcemaps automatically
- Check console for React Strict Mode warnings during development

## Common Pitfalls to Avoid

1. **Unused imports/variables**: ESLint will fail the build - prefix with `_` or uppercase if intentional
2. **React Hook violations**: The `react-hooks` ESLint plugin catches these - follow rules of hooks strictly
3. **Missing dependencies**: After running `npm install`, restart dev server with `npm run dev`
4. **CSS module naming**: Currently using global CSS, not CSS modules - keep selectors simple and scoped

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev` |
| Check code quality | `npm run lint` |
| Build for production | `npm run build` |
| Test production build | `npm run preview` |
| Install dependencies | `npm install` |

