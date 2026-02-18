"use client";

import { useState } from "react";
import type { EntretienWithDetails, StatutEntretien } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { StatutBadge } from "@/components/entretiens/StatutBadge";
import { updateEntretienStatut } from "@/lib/entretienLocalStorage";

interface EntretienSimulationActionsProps {
  entretien: EntretienWithDetails;
}

export function EntretienSimulationActions({
  entretien,
}: EntretienSimulationActionsProps) {
  const [current, setCurrent] = useState<EntretienWithDetails>(entretien);

  const applyStatut = (statut: StatutEntretien) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const extra =
      statut === "realise"
        ? { dateReelle: todayIso }
        : statut === "reporte"
          ? { dateReelle: undefined }
          : {};

    const list = updateEntretienStatut([current], entretien.id, statut, extra);
    const updated =
      list.find((e) => e.id === entretien.id) ??
      ({
        ...current,
        statut,
        ...extra,
      } as EntretienWithDetails);
    setCurrent(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StatutBadge statut={current.statut} />
        <span className="text-[13px] text-gris-60">
          Statut simulé côté manager
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() => applyStatut("planifie")}
        >
          Simuler pré‑entretien collaborateur
        </Button>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() => applyStatut("realise")}
        >
          Simuler entretien réalisé
        </Button>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() => applyStatut("reporte")}
        >
          Simuler entretien reporté
        </Button>
      </div>
    </div>
  );
}

