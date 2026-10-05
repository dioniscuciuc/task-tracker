# Lattice Board

A personal kanban board for daily tasks, projects, and work that needs to get done. It is designed for local use first and can be deployed as a static front-end later.

## Features

- Kanban lanes for backlog, today, in motion, and done
- Multiple project buckets for personal work, home tasks, learning, and more
- Task priority and due date tracking
- Drag-and-drop movement between lanes
- Local persistence with browser storage so your board stays intact without a backend
- Clean desktop and mobile layout designed to feel custom rather than copied from another product

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open the local address shown in the terminal, usually:

- http://localhost:5173/

## Build for deployment later

```bash
npm run build
```

The generated static files in the `dist` folder can be uploaded to a static host such as Vercel, Netlify, or GitHub Pages when you are ready to make it public.

## Notes

This version is intentionally simple and self-contained so it works well as a personal tool with no database or server setup. If you want a future version with shared team access, authentication, or cloud syncing, the app structure is ready to evolve from this base.
