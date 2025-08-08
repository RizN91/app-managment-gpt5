# FridgeSeal Pro

One-command run:

```
npm i && npm run dev
```

Tech: React + Vite + TypeScript + TailwindCSS + Zustand. Persistence via IndexedDB (idb-keyval). No backend required.

Features:
- Dark mode toggle (persists)
- Seeded AU-centric demo data (customers, sites, jobs, parts, staff)
- Dashboard with KPIs and Kanban board
- Jobs list with filters, fuzzy search, bulk actions, CSV export
- Job detail tabs: Overview, Measurements, Parts, Photos, Notes, Documents, Timeline
- Kanban drag/drop updates status and logs activity
- Scheduler day view drag jobs to tech/time
- PDF helpers for labels; basic quote/invoice generation
- Global search; components for badges and reusable UI
- Vitest unit tests for status machine

Keyboard shortcuts:
- `/` or Ctrl/Cmd+K: focus global search
- `N`: new job (placeholder event)

This app stores data in browser storage. To reset, clear site data.
