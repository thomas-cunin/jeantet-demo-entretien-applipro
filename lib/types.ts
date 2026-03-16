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
  entite?: string;
  groupe?: string;
  dateArrivee?: string;
  avatarUrl?: string;
}

export interface Manager {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  entite?: string;
  avatarUrl?: string;
}

export interface Entretien {
  id: string;
  collaborateurId: string;
  managerId: string;
  campagneId?: string;
  type: TypeEntretien;
  statut: StatutEntretien;
  datePrevue: string;
  heurePrevue?: string;
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

export interface Campagne {
  id: string;
  nom: string;
  type: TypeEntretien;
  dateDebut: string;
  dateFin: string;
  statut: "planifiee" | "en_cours" | "cloturee";
  groupesCibles: string[];
  entite?: string;
}

export interface TrameElement {
  id: string;
  type: "evaluation" | "objectif" | "formation" | "competence" | "texte_libre";
  label: string;
  description?: string;
  obligatoire: boolean;
  appliquePour: "tous" | string[];
  destinataire: "tous" | "collaborateur" | "manager";
}

export interface TemplateEntretien {
  id: string;
  nom: string;
  description?: string;
  type: TypeEntretien;
  elements: TrameElement[];
  createdAt: string;
  updatedAt: string;
}

export interface CampagneComplete extends Campagne {
  dateOuverturePreparation?: string;
  dateLancement?: string;
  templateId: string;
}
