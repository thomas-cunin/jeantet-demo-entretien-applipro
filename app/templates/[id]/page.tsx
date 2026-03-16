import { getCollaborateurs, getTemplates } from "@/lib/data";
import { FormulaireTemplate } from "@/components/templates/FormulaireTemplate";
import { TemplateEditionLoader } from "@/components/templates/TemplateEditionLoader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const collaborateurs = getCollaborateurs();
  const seedTemplates = getTemplates();

  const groupesSet = new Map<string, string>();
  for (const c of collaborateurs) {
    if (c.groupe && !groupesSet.has(c.groupe)) {
      const label =
        c.groupe === "conducteur"
          ? "Conducteurs"
          : c.groupe === "sedentaire"
            ? "Sédentaires"
            : c.groupe.charAt(0).toUpperCase() + c.groupe.slice(1);
      groupesSet.set(c.groupe, label);
    }
  }

  const groupesDisponibles = Array.from(groupesSet.entries()).map(
    ([gId, label]) => ({ id: gId, label })
  );

  // Check seed data first
  const seedTemplate = seedTemplates.find((t) => t.id === id);

  return (
    <TemplateEditionLoader
      templateId={id}
      seedTemplate={seedTemplate ?? null}
      groupesDisponibles={groupesDisponibles}
    />
  );
}
