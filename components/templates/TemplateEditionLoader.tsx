"use client";

import { useState, useEffect } from "react";
import type { TemplateEntretien } from "@/lib/types";
import { getTemplateById } from "@/lib/templateLocalStorage";
import { FormulaireTemplate } from "./FormulaireTemplate";

interface TemplateEditionLoaderProps {
  templateId: string;
  seedTemplate: TemplateEntretien | null;
  groupesDisponibles: { id: string; label: string }[];
}

export function TemplateEditionLoader({
  templateId,
  seedTemplate,
  groupesDisponibles,
}: TemplateEditionLoaderProps) {
  const [template, setTemplate] = useState<TemplateEntretien | null>(seedTemplate);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getTemplateById(templateId);
    if (stored) {
      setTemplate(stored);
    }
    setLoaded(true);
  }, [templateId]);

  if (!loaded) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-gris-60">Chargement...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-gris-60">Template introuvable.</p>
      </div>
    );
  }

  return (
    <FormulaireTemplate
      groupesDisponibles={groupesDisponibles}
      existingTemplate={template}
    />
  );
}
