import type { CampagneComplete } from "./types";

const STORAGE_KEY = "demo-campagnes-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadCampagnes(): CampagneComplete[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CampagneComplete[];
  } catch {
    return [];
  }
}

export function saveCampagnes(campagnes: CampagneComplete[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(campagnes));
}

export function upsertCampagne(campagne: CampagneComplete): CampagneComplete[] {
  const current = loadCampagnes();
  const index = current.findIndex((c) => c.id === campagne.id);
  const next =
    index === -1
      ? [...current, campagne]
      : [...current.slice(0, index), campagne, ...current.slice(index + 1)];
  saveCampagnes(next);
  return next;
}
