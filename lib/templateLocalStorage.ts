import type { TemplateEntretien } from "./types";

const STORAGE_KEY = "demo-templates-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadTemplates(): TemplateEntretien[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TemplateEntretien[];
  } catch {
    return [];
  }
}

export function saveTemplates(templates: TemplateEntretien[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function upsertTemplate(template: TemplateEntretien): TemplateEntretien[] {
  const current = loadTemplates();
  const index = current.findIndex((t) => t.id === template.id);
  const next =
    index === -1
      ? [...current, template]
      : [...current.slice(0, index), template, ...current.slice(index + 1)];
  saveTemplates(next);
  return next;
}

export function getTemplateById(id: string): TemplateEntretien | null {
  const all = loadTemplates();
  return all.find((t) => t.id === id) ?? null;
}
