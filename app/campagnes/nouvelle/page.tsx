import { getCollaborateurs, getTemplates, getCampagnes } from "@/lib/data";
import { FormulaireCampagne } from "@/components/campagnes/FormulaireCampagne";

export default function NouvelleCampagnePage() {
  const collaborateurs = getCollaborateurs();
  const seedTemplates = getTemplates();
  const campagnesExistantes = getCampagnes();

  // Extraire les groupes uniques depuis les collaborateurs
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
    ([id, label]) => ({ id, label })
  );

  return (
    <FormulaireCampagne
      groupesDisponibles={groupesDisponibles}
      seedTemplates={seedTemplates}
      collaborateurs={collaborateurs}
      campagnesExistantes={campagnesExistantes}
    />
  );
}
