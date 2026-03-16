"use client";

import type { TrameElement } from "@/lib/types";

const ELEMENT_TYPES: { value: TrameElement["type"]; label: string }[] = [
  { value: "evaluation", label: "Évaluation" },
  { value: "objectif", label: "Objectif" },
  { value: "formation", label: "Formation" },
  { value: "competence", label: "Compétence" },
  { value: "texte_libre", label: "Texte libre" },
];

interface TrameElementCardProps {
  element: TrameElement;
  allGroupes: { id: string; label: string }[];
  onChange: (updated: TrameElement) => void;
  onDelete: () => void;
  onMoveUp: (() => void) | null;
  onMoveDown: (() => void) | null;
}

export function TrameElementCard({
  element,
  allGroupes,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: TrameElementCardProps) {
  const typeColor: Record<TrameElement["type"], string> = {
    evaluation: "border-l-applipro",
    objectif: "border-l-statut-vert",
    formation: "border-l-statut-orange",
    competence: "border-l-purple-500",
    texte_libre: "border-l-gris-40",
  };

  return (
    <div className={`border-l-4 ${typeColor[element.type]} border border-gris-10 rounded-lg p-4 bg-white`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-gris-60 mb-1">Type</label>
            <select
              value={element.type}
              onChange={(e) => onChange({ ...element, type: e.target.value as TrameElement["type"] })}
              className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
            >
              {ELEMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gris-60 mb-1">Label</label>
            <input
              type="text"
              value={element.label}
              onChange={(e) => onChange({ ...element, label: e.target.value })}
              className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
              placeholder="Nom de l'élément"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 pt-5">
          <button
            type="button"
            onClick={onMoveUp ?? undefined}
            disabled={!onMoveUp}
            className="p-1 text-gris-40 hover:text-noir disabled:opacity-30 disabled:cursor-not-allowed"
            title="Monter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown ?? undefined}
            disabled={!onMoveDown}
            className="p-1 text-gris-40 hover:text-noir disabled:opacity-30 disabled:cursor-not-allowed"
            title="Descendre"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gris-40 hover:text-statut-rouge transition-colors"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-[12px] font-medium text-gris-60 mb-1">Description (optionnel)</label>
          <input
            type="text"
            value={element.description ?? ""}
            onChange={(e) => onChange({ ...element, description: e.target.value || undefined })}
            className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
            placeholder="Description de l'élément"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gris-60 mb-1">Appliquer pour</label>
          <select
            value={element.appliquePour === "tous" ? "tous" : "specifique"}
            onChange={(e) => {
              if (e.target.value === "tous") {
                onChange({ ...element, appliquePour: "tous" });
              } else {
                onChange({ ...element, appliquePour: allGroupes.map((g) => g.id) });
              }
            }}
            className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
          >
            <option value="tous">Tous les groupes</option>
            <option value="specifique">Groupes spécifiques</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gris-60 mb-1">Destinataire</label>
          <select
            value={element.destinataire ?? "tous"}
            onChange={(e) => onChange({ ...element, destinataire: e.target.value as TrameElement["destinataire"] })}
            className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
          >
            <option value="tous">Collaborateur + Manager</option>
            <option value="collaborateur">Collaborateur uniquement</option>
            <option value="manager">Manager uniquement</option>
          </select>
        </div>
      </div>

      {element.appliquePour !== "tous" && (
        <div className="flex flex-wrap gap-2 mb-3">
          {allGroupes.map((g) => {
            const checked = Array.isArray(element.appliquePour) && element.appliquePour.includes(g.id);
            return (
              <label key={g.id} className="flex items-center gap-1.5 text-[13px] text-noir cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = Array.isArray(element.appliquePour) ? element.appliquePour : [];
                    const next = e.target.checked
                      ? [...current, g.id]
                      : current.filter((id) => id !== g.id);
                    onChange({ ...element, appliquePour: next.length > 0 ? next : [g.id] });
                  }}
                  className="rounded border-gris-20 text-applipro focus:ring-applipro"
                />
                {g.label}
              </label>
            );
          })}
        </div>
      )}

      <label className="flex items-center gap-2 text-[13px] text-noir cursor-pointer">
        <input
          type="checkbox"
          checked={element.obligatoire}
          onChange={(e) => onChange({ ...element, obligatoire: e.target.checked })}
          className="rounded border-gris-20 text-applipro focus:ring-applipro"
        />
        Obligatoire
      </label>
    </div>
  );
}
