import type { EntretienWithDetails, StatutEntretien } from "./types";

const STORAGE_KEY = "demo-entretiens-with-details-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadEntretiensWithDetails(
  initial: EntretienWithDetails[],
): EntretienWithDetails[] {
  if (!isBrowser()) return initial;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as EntretienWithDetails[];
    return parsed.length ? parsed : initial;
  } catch {
    return initial;
  }
}

export function saveEntretiensWithDetails(
  list: EntretienWithDetails[],
): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function upsertEntretienWithDetails(
  initial: EntretienWithDetails[],
  entretien: EntretienWithDetails,
): EntretienWithDetails[] {
  const current = loadEntretiensWithDetails(initial);
  const index = current.findIndex((e) => e.id === entretien.id);
  const next =
    index === -1
      ? [...current, entretien]
      : [...current.slice(0, index), entretien, ...current.slice(index + 1)];
  saveEntretiensWithDetails(next);
  return next;
}

export function updateEntretienStatut(
  initial: EntretienWithDetails[],
  id: string,
  statut: StatutEntretien,
  extra?: Partial<EntretienWithDetails>,
): EntretienWithDetails[] {
  const current = loadEntretiensWithDetails(initial);
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return current;
  const updated: EntretienWithDetails = {
    ...current[index],
    ...extra,
    statut,
  };
  const next = [
    ...current.slice(0, index),
    updated,
    ...current.slice(index + 1),
  ];
  saveEntretiensWithDetails(next);
  return next;
}

export function getEntretienFromStorage(
  initial: EntretienWithDetails[],
  id: string,
): EntretienWithDetails | null {
  const list = loadEntretiensWithDetails(initial);
  return list.find((e) => e.id === id) ?? null;
}

