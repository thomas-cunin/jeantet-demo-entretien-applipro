export type StatutEntretien =
  | "planifie"
  | "realise"
  | "reporte"
  | "annule"
  | "en_attente";

export type TypeEntretien =
  | "integration"
  | "suivi"
  | "bilan"
  | "autre";

export interface Collaborateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  poste?: string;
  dateArrivee?: string;
   avatarUrl?: string;
}

export interface Manager {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  avatarUrl?: string;
}

export interface Entretien {
  id: string;
  collaborateurId: string;
  managerId: string;
  type: TypeEntretien;
  statut: StatutEntretien;
  datePrevue: string;
  dateReelle?: string;
  lieu?: string;
  notes?: string;
  objectifs?: string;
  compteRendu?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntretienWithDetails extends Entretien {
  collaborateur: Collaborateur;
  manager: Manager;
}
