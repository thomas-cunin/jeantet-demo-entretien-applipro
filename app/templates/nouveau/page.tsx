import { getCollaborateurs } from "@/lib/data";
import { FormulaireTemplate } from "@/components/templates/FormulaireTemplate";

export default function NouveauTemplatePage() {
  const collaborateurs = getCollaborateurs();

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

  return <FormulaireTemplate groupesDisponibles={groupesDisponibles} />;
}
