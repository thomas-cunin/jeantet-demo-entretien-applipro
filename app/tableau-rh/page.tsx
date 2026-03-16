import { getEntretiensWithDetails, getCampagnes } from "@/lib/data";
import { TableauRhClient } from "@/components/entretiens/TableauRhClient";

export default function TableauRhPage() {
  const entretiens = getEntretiensWithDetails();
  const campagnes = getCampagnes();

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-noir">
          Tableau de bord RH
        </h1>
        <p className="text-gris-60 text-[14px] mt-1">
          Vision consolidée des entretiens, signalements, formations et feedbacks.
        </p>
      </div>
      <TableauRhClient entretiens={entretiens} campagnes={campagnes} />
    </div>
  );
}
