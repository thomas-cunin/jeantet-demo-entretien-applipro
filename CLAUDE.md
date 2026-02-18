# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backoffice Entretiens – a Next.js 14 frontend application for HR interview management (annual interviews, employee evaluations, manager prep). This is a demo/prototype using static JSON data and browser localStorage for persistence—no backend.

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint validation
```

The app redirects `/` to `/entretiens` (main dashboard).

## Tech Stack

- **Framework:** Next.js 14.2.18 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3.4 with custom Applipro color palette
- **State:** React hooks + localStorage (no Redux/Context)
- **Data:** Static JSON files in `/data/` directory

## Architecture

```
app/                    # Next.js App Router pages
├── entretiens/         # Interview CRUD routes
│   ├── [id]/          # Dynamic detail/edit/parcours routes
│   └── nouveau/       # Create new interview
└── preparation-collaborateur/  # Employee prep form preview

components/
├── ui/                # Design system: Button, Input, Select, Textarea
├── layout/            # BackofficeLayout (sidebar nav)
├── entretiens/        # Interview-specific components
└── preparation/       # Preparation form components (ratings)

lib/
├── types.ts           # Core TypeScript interfaces
├── data.ts            # Static data access functions
├── entretienLocalStorage.ts  # Client-side persistence
└── wizardData.ts      # Interview wizard step data

data/                  # Static JSON (entretiens, collaborateurs, managers)
```

## Key Patterns

**Data Flow:**
- Static data loaded from `/data/*.json` via `lib/data.ts`
- Client-side mutations persisted to localStorage via `lib/entretienLocalStorage.ts`
- Wizard progress stored separately via `lib/wizardData.ts`

**Component Conventions:**
- Client components marked with `"use client"` directive
- UI components in `components/ui/` accept standard props (label, error, hint, disabled)
- Badges (StatutBadge, TypeBadge) for status/type display

**Styling:**
- Tailwind with custom colors defined in `tailwind.config.ts`
- Key colors: `applipro-dark` (#0E0E52), `applipro-primary` (#3374FF), status colors (vert, orange, rouge)
- Border radius: `rounded-applipro` (6px)

## Core Types

```typescript
type StatutEntretien = "planifie" | "realise" | "reporte" | "annule" | "en_attente"
type TypeEntretien = "integration" | "suivi" | "bilan" | "autre"

interface EntretienWithDetails extends Entretien {
  collaborateur: Collaborateur
  manager: Manager
}
```

## localStorage Keys

- `demo-entretiens-with-details-v1` — Interview data
- `demo-entretiens-wizard-v1` — Wizard step progress

## Notes

- UI is entirely in French
- No testing framework configured
- No authentication (demo project)
- Mobile-first responsive design
