# 2026 Execution Blueprint — Development Guide

## Project Overview
A React/TypeScript dashboard for tracking personal execution goals across 5 domains: Creative Writing, Tech/AI Projects, Media Consumption, Health, and a unified Scoreboard.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS (CDN)
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: Google Gemini (coach feature)
- **Storage**: localStorage (via `services/storageService.ts`)

## Project Structure
```
App.tsx              → Main router (switches between categories)
types.ts             → All TypeScript interfaces and enums
components/
  Sidebar.tsx        → Navigation sidebar
  Scoreboard.tsx     → Weekly dashboard with charts and checklist
  Creative.tsx       → Writing tracker with streak logic
  Tech.tsx           → Tech projects and work logging
  Media.tsx          → Books/Films/Albums CRUD tracker
  Health.tsx         → Daily health logging and trends
  Coach.tsx          → AI chat interface
services/
  storageService.ts  → localStorage CRUD, aggregation, date utils
  geminiService.ts   → Gemini API integration
```

## Key Patterns
- All data persisted via `storageService.ts` using localStorage
- Components use `useState` + `useEffect` with a `refreshData()` pattern
- Forms toggle inline via state (no modals/routing)
- Writing streak uses "never miss twice" rule (allows 1-day gaps)
- AI coach receives live user data via `getDataSummaryForCoach()`

## Running
```bash
npm install
npm run dev        # starts on port 3000
```

## Environment Variables
- `GEMINI_API_KEY` in `.env.local` for AI coach (optional — app works without it)
