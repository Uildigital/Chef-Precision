# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint check
```

Docker:
```bash
docker-compose up --build   # Build and run containerized app
```

No test suite is configured.

## Architecture

**Chef Precision** is a premium recipe pricing calculator for bakers/chefs. It is a single-page app built with Next.js 16 App Router + React 19 + Tailwind v4 + Supabase + Framer Motion.

### View routing

All UI state lives in `src/app/page.tsx` (`ChefPrecisionV3`). A single `view` state drives five screens rendered via Framer Motion `AnimatePresence`:

| View | Component |
|------|-----------|
| `dashboard` | inline in `page.tsx` |
| `wizard` | `PricingWizardAgent` |
| `inventory` | `InventoryAgent` |
| `production` | `ProductionAgent` |
| `settings` | `FinanceAgent` |

Bottom navigation (4 tabs) triggers view transitions. There is no router — it is pure state switching.

### Agent components

`src/components/agents/` contains self-contained form components (not AI agents). Each:
- Receives data + callbacks (`onSalvar`, `onVoltar`) from `page.tsx`
- Manages its own internal form state
- Wraps content in Framer Motion animations

### Core pricing logic

`src/lib/services/PricingEngine.ts` — the calculation engine:
- Unit conversions (kg↔g, L↔ml, un)
- Yield/waste adjustment (`yield_percentage`)
- Labor cost per minute: `salary_target / working_hours / 60`
- Fixed cost per minute: `fixed_costs_total / working_hours / 60`
- Final price: `(ingredients + labor + fixed_costs) × markup`

`src/lib/logic/MathSkill.ts` — helper functions used by `PricingWizardAgent`.

### Data persistence

Two layers:
1. **Supabase** (authenticated users) — all tables have RLS with `auth.uid()` tenant isolation: `user_settings`, `fixed_costs`, `ingredients`, `recipes`, `recipe_ingredients`
2. **localStorage** (guests) — fallback when no session

`page.tsx` checks auth on mount, loads from Supabase or localStorage accordingly.

### API

One route: `GET /api/webhooks/inventory` — n8n integration that fetches ingredients below alert thresholds and returns a restock list.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # Used only in the webhook route
```

## Styling conventions

- Dark theme: `#0A0A0A` background, `#D4AF37` gold accents, `#722F37` burgundy
- Custom Tailwind utility classes defined in `globals.css`: `.glass-panel`, `.premium-button`, `.input-expert`
- All UI uses glassmorphism + large rounded corners (3rem) for premium feel
- Path alias: `@/*` maps to `src/*`
