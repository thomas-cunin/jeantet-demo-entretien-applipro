# Backoffice Entretiens – Applipro

Module frontend (React, Next.js, Tailwind CSS) pour la **gestion des entretiens individuels** dans le backoffice Applipro. Données en JSON statique (simulation d’API).

## Design system

- **Couleurs** : palette Applipro (primaire, neutre, statut) configurée dans `tailwind.config.ts`.
- **Boutons** : primaire / secondaire, tailles regular et small, états défaut / hover / disabled.
- **Select** : label, options, états défaut / rempli / erreur, style Inter 14px.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). La racine redirige vers `/entretiens`.

## Fonctionnalités

- **Liste des entretiens** : tableau avec collaborateur, manager, type, statut, date prévue, lien « Voir ».
- **Détail d’un entretien** : participants, planification, notes, objectifs, compte rendu.
- **Création** : formulaire nouvel entretien (collaborateur, manager, type, statut, dates, lieu, notes, objectifs, compte rendu).
- **Modification** : même formulaire pré-rempli, bouton « Modifier » depuis la fiche.

## Données (JSON statique)

- `data/entretiens.json` – entretiens
- `data/collaborateurs.json` – collaborateurs
- `data/managers.json` – managers

Le chargement et l’enrichissement (entretiens + détails) sont dans `lib/data.ts`. La création/modification ne persiste pas (simulation : redirection après submit).

## Structure

- `app/` – routes Next.js (App Router)
- `components/ui/` – Button, Select, Input, Textarea (design system)
- `components/layout/` – BackofficeLayout (sidebar)
- `components/entretiens/` – StatutBadge, TypeBadge, FormulaireEntretien
- `lib/` – types et accès données
