"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TemplateEntretien, TypeEntretien } from "@/lib/types";
import { loadTemplates } from "@/lib/templateLocalStorage";

const TYPE_LABELS: Record<TypeEntretien, string> = {
  bilan: "Bilan",
  suivi: "Suivi",
  integration: "Intégration",
  autre: "Autre",
};

const TYPE_COLORS: Record<TypeEntretien, string> = {
  bilan: "bg-applipro-05 text-applipro",
  suivi: "bg-statut-vert/10 text-statut-vert",
  integration: "bg-statut-orange/10 text-statut-orange",
  autre: "bg-gris-10 text-gris-60",
};

interface TemplatesListProps {
  seedTemplates: TemplateEntretien[];
}

export function TemplatesList({ seedTemplates }: TemplatesListProps) {
  const [templates, setTemplates] = useState<TemplateEntretien[]>(seedTemplates);

  useEffect(() => {
    const stored = loadTemplates();
    if (stored.length > 0) {
      // Merge: seed + stored (stored overrides seed by id)
      const map = new Map<string, TemplateEntretien>();
      for (const t of seedTemplates) map.set(t.id, t);
      for (const t of stored) map.set(t.id, t);
      setTemplates(Array.from(map.values()));
    }
  }, [seedTemplates]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-applipro-dark">Templates d&apos;entretien</h1>
          <p className="text-[14px] text-gris-60 mt-1">
            Gérez les trames de formulaires réutilisables pour vos campagnes.
          </p>
        </div>
        <Link
          href="/templates/nouveau"
          className="px-5 py-2.5 rounded-applipro bg-applipro text-white text-[14px] font-medium hover:bg-applipro/90 transition-colors"
        >
          + Créer un template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-gris-10 rounded-applipro p-12 text-center">
          <p className="text-gris-60 text-[14px]">Aucun template pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/templates/${tpl.id}`}
              className="bg-white border border-gris-10 rounded-applipro p-5 hover:border-applipro/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-[15px] font-semibold text-applipro-dark group-hover:text-applipro transition-colors">
                  {tpl.nom}
                </h3>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLORS[tpl.type]}`}>
                  {TYPE_LABELS[tpl.type]}
                </span>
              </div>
              {tpl.description && (
                <p className="text-[13px] text-gris-60 mb-3 line-clamp-2">{tpl.description}</p>
              )}
              <div className="flex items-center gap-4 text-[12px] text-gris-40">
                <span>{tpl.elements.length} bloc{tpl.elements.length > 1 ? "s" : ""}</span>
                <span>Mis à jour le {new Date(tpl.updatedAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
