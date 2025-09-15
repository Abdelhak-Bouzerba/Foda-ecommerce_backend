# Towing App Backend – TypeScript Setup

This project is configured to use TypeScript with a Node/Express backend.

## Scripts
- `npm run dev` – Run the app in watch mode with tsx.
- `npm run build` – Compile TypeScript to JavaScript in `dist/`.
- `npm start` – Run the compiled build from `dist/`.
- `npm run clean` – Remove the `dist/` folder (Windows PowerShell).

## Project structure
```
src/
  index.ts        # App entry point

dist/             # Build output (generated)
tsconfig.json     # TypeScript config
```

## Getting started
1. Install dependencies.
2. Start the dev server.

```powershell
npm install
npm run dev
```

Open http://localhost:3000 to verify the server is running.
