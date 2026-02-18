import type {
  Collaborateur,
  Manager,
  Entretien,
  EntretienWithDetails,
  StatutEntretien,
  TypeEntretien,
} from "./types";

import collaborateursData from "@/data/collaborateurs.json";
import managersData from "@/data/managers.json";
import entretiensData from "@/data/entretiens.json";

const collaborateurs = collaborateursData as Collaborateur[];
const managers = managersData as Manager[];
const entretiens = entretiensData as Entretien[];

export const STATUTS: { value: StatutEntretien; label: string }[] = [
  { value: "planifie", label: "Planifié" },
  { value: "realise", label: "Réalisé" },
  { value: "reporte", label: "Reporté" },
  { value: "annule", label: "Annulé" },
  { value: "en_attente", label: "En attente" },
];

export const TYPES_ENTRETIEN: { value: TypeEntretien; label: string }[] = [
  { value: "integration", label: "Intégration" },
  { value: "suivi", label: "Suivi" },
  { value: "bilan", label: "Bilan" },
  { value: "autre", label: "Autre" },
];

export function getCollaborateurs(): Collaborateur[] {
  return collaborateurs;
}

export function getManagers(): Manager[] {
  return managers;
}

export function getEntretiens(): Entretien[] {
  return entretiens;
}

export function getEntretiensWithDetails(): EntretienWithDetails[] {
  return entretiens.map((e) => {
    const collaborateur = collaborateurs.find((c) => c.id === e.collaborateurId);
    const manager = managers.find((m) => m.id === e.managerId);
    if (!collaborateur || !manager) throw new Error("Missing relation");
    return { ...e, collaborateur, manager };
  });
}

export function getEntretienById(id: string): EntretienWithDetails | null {
  const list = getEntretiensWithDetails();
  return list.find((e) => e.id === id) ?? null;
}

export function getCollaborateurById(id: string): Collaborateur | null {
  return collaborateurs.find((c) => c.id === id) ?? null;
}

export function getManagerById(id: string): Manager | null {
  return managers.find((m) => m.id === id) ?? null;
}
