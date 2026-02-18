import type { EntretienWithDetails } from "./types";

export type WizardStepKey =
  | "pre_collaborateur"
  | "pre_manager"
  | "session"
  | "validation";

export interface WizardEvaluationItem {
  theme: string;
  score: 1 | 2 | 3 | 4 | 5;
  commentaireCollaborateur?: string;
  commentaireManager?: string;
}

export interface WizardObjectifItem {
  intitule: string;
  echeance?: string;
  avancementCollaborateur?: number;
  commentaireCollaborateur?: string;
  commentaireManager?: string;
}

export interface WizardBesoinFormation {
  intitule: string;
  origine: "collaborateur" | "manager";
  commentaire?: string;
}

export interface WizardCompetenceItem {
  competence: string;
  niveauAttendu: number;
  niveauCollaborateur: number;
  commentaire?: string;
}

export interface WizardRessentiTheme {
  theme: string;
  score: 1 | 2 | 3 | 4 | 5;
}

export interface WizardPreEntretienCollaborateur {
  ressentiGeneral: string;
  sentimentGlobal: 1 | 2 | 3 | 4 | 5;
  evaluations: WizardEvaluationItem[];
  ressentiParTheme: WizardRessentiTheme[];
  objectifsNMoins1: WizardObjectifItem[];
  besoinsFormation: WizardBesoinFormation[];
  competences: WizardCompetenceItem[];
}

export interface WizardEvaluationManager {
  theme: string;
  score: 1 | 2 | 3 | 4 | 5;
  commentaire?: string;
}

export interface WizardPreEntretienManager {
  syntheseManager: string;
  evaluationsManager: WizardEvaluationManager[];
  pointsForts: string[];
  axesProgres: string[];
  besoinsFormationManager: string;
  notesPreparatoires: string;
}

export interface WizardPointAmeliorer {
  intitule: string;
  echeance?: string;
  remarque?: string;
}

export interface WizardBilanEntretien {
  syntheseGlobale: string;
  pointsAmeliorer: WizardPointAmeliorer[];
  remarquesCollaborateur: string;
  remarquesManager: string;
}

// Remarques du manager sur les champs des formulaires collaborateur/manager
// Clé: "section:index" ou "section:theme" (ex: "evaluations_collab:0", "pointsForts:1")
export interface WizardRemarquesChamps {
  [champId: string]: string;
}

export interface WizardSessionEntretien {
  objectifsNPlus1: WizardObjectifItem[];
  decisionsFormation: WizardBesoinFormation[];
  notesSeance: string;
  bilan: WizardBilanEntretien;
  remarquesChamps: WizardRemarquesChamps;
}

export interface WizardValidation {
  remarquesCollaborateur: string;
  statutSignatureCollaborateur: "en_attente" | "valide";
  statutValidationManager: "en_attente" | "valide";
}

export interface WizardEntretienData {
  entretienId: string;
  preCollaborateur: WizardPreEntretienCollaborateur;
  preManager: WizardPreEntretienManager;
  session: WizardSessionEntretien;
  validation: WizardValidation;
}

const WIZARD_STORAGE_KEY = "demo-entretiens-wizard-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

// Données simulées : dans une vraie application, ces informations
// proviendraient des formulaires côté collaborateur / manager.
// Les thèmes correspondent aux champs des formulaires PreparationCollaborateurForm et PreparationManagerForm.
const WIZARD_DATA: WizardEntretienData[] = [
  {
    // Entretien annuel Sophie Martin - réalisé
    entretienId: "ent-1",
    preCollaborateur: {
      ressentiGeneral:
        "Cette année a été riche en apprentissages. Je me sens bien intégrée dans l'équipe et j'apprécie l'ambiance de travail. J'ai pu monter en compétences sur plusieurs projets techniques. Quelques périodes de charge intense mais globalement un bon équilibre.",
      // Section 2 - Sentiment global (smiley)
      sentimentGlobal: 4,
      // Thèmes du formulaire collaborateur (section 3 - Évaluation par thème)
      evaluations: [
        {
          theme: "Résultats et qualité du travail",
          score: 4,
          commentaireCollaborateur:
            "J'ai atteint la majorité de mes objectifs et je suis satisfaite de la qualité de mon travail sur les projets livrés.",
        },
        {
          theme: "Collaboration avec l'équipe",
          score: 5,
          commentaireCollaborateur:
            "Excellente collaboration avec mes collègues, j'apprécie particulièrement les sessions de pair programming.",
        },
        {
          theme: "Développement des compétences",
          score: 4,
          commentaireCollaborateur:
            "J'ai progressé sur React et TypeScript. Je souhaite approfondir mes connaissances en architecture logicielle.",
        },
        {
          theme: "Équilibre vie pro / perso",
          score: 3,
          commentaireCollaborateur:
            "Quelques périodes de rush avec des heures supplémentaires, mais globalement acceptable.",
        },
      ],
      // Section 4 - Ressenti par thème (smileys)
      ressentiParTheme: [
        { theme: "Ambiance d'équipe", score: 5 },
        { theme: "Équilibre vie pro/perso", score: 3 },
        { theme: "Reconnaissance", score: 4 },
      ],
      // Objectifs N-1 du formulaire collaborateur (section 5)
      objectifsNMoins1: [
        {
          intitule: "Atteindre les objectifs quantitatifs fixés sur votre activité principale",
          echeance: "Mars 2025",
          avancementCollaborateur: 85,
          commentaireCollaborateur:
            "Objectifs de livraison atteints à 85%. Un projet a pris du retard mais a été rattrapé au Q4.",
        },
        {
          intitule: "Renforcer la qualité de la relation avec les clients / usagers clés",
          echeance: "Juin 2025",
          avancementCollaborateur: 90,
          commentaireCollaborateur:
            "Bons retours des clients internes. J'ai animé plusieurs démos produit avec succès.",
        },
        {
          intitule: "Développer une nouvelle compétence ou expertise utile à l'équipe",
          echeance: "Décembre 2025",
          avancementCollaborateur: 75,
          commentaireCollaborateur:
            "Formation Next.js suivie et appliquée sur le projet intranet. En cours d'approfondissement.",
        },
      ],
      // Besoins formation (section 6)
      besoinsFormation: [
        {
          intitule: "Formation architecture microservices",
          origine: "collaborateur",
          commentaire: "Pour mieux comprendre l'architecture globale de nos applications.",
        },
        {
          intitule: "Certification AWS Developer Associate",
          origine: "collaborateur",
          commentaire: "Permettrait de mieux gérer nos déploiements cloud.",
        },
      ],
      // Compétences du formulaire collaborateur (section 7 - Auto-évaluation)
      competences: [
        {
          competence: "Atteinte des objectifs annuels",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          commentaire: "Objectifs globalement atteints malgré quelques ajustements en cours d'année.",
        },
        {
          competence: "Autonomie et prise d'initiative",
          niveauAttendu: 4,
          niveauCollaborateur: 3,
          commentaire: "Autonome sur les tâches courantes, encore besoin d'accompagnement sur les sujets complexes.",
        },
        {
          competence: "Qualité de la communication",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          commentaire: "Communication fluide avec l'équipe et les parties prenantes.",
        },
      ],
    },
    preManager: {
      // Section 1 - Synthèse manager
      syntheseManager:
        "Sophie a réalisé une excellente année. Son intégration est un succès et elle est devenue une référence technique sur React dans l'équipe. Elle fait preuve d'initiative et sa rigueur est appréciée. Je recommande de continuer à lui confier des responsabilités croissantes.",
      // Section 2 - Évaluation par thème (thèmes du formulaire manager)
      evaluationsManager: [
        {
          theme: "Qualité du travail",
          score: 4,
          commentaire: "Code propre et bien documenté, peu de bugs en production.",
        },
        {
          theme: "Respect des délais",
          score: 4,
          commentaire: "Livraisons ponctuelles, bonne anticipation des risques.",
        },
        {
          theme: "Autonomie",
          score: 4,
          commentaire: "Autonome sur la plupart des sujets, sait demander de l'aide quand nécessaire.",
        },
        {
          theme: "Esprit d'équipe",
          score: 5,
          commentaire: "Excellente collègue, toujours prête à aider et partager ses connaissances.",
        },
        {
          theme: "Communication",
          score: 4,
          commentaire: "Présentations claires, bons comptes rendus de réunion.",
        },
      ],
      // Section 3 - Points forts
      pointsForts: [
        "Expertise technique React/TypeScript reconnue par l'équipe",
        "Capacité à monter rapidement en compétences sur de nouveaux sujets",
        "Excellente communication et pédagogie avec les juniors",
        "Rigueur dans la documentation et les tests",
      ],
      // Section 4 - Axes de progrès
      axesProgres: [
        "Développer la vision architecture et prise de recul technique",
        "Améliorer l'estimation des charges sur les projets complexes",
        "Prendre davantage la parole en réunion client",
      ],
      // Section 5 - Besoins formation identifiés
      besoinsFormationManager:
        "Formation architecture logicielle recommandée pour accompagner son évolution vers un rôle de lead technique. La certification AWS serait un plus pour l'équipe.",
      // Section 6 - Notes préparatoires
      notesPreparatoires:
        "Aborder la question de l'évolution vers un poste de lead technique. Proposer un mentorat avec un architecte senior. Discuter de sa participation aux recrutements.",
    },
    session: {
      objectifsNPlus1: [
        {
          intitule: "Prendre le lead technique sur le projet de refonte du portail client",
          echeance: "2025-12-31",
          commentaireManager: "Projet stratégique, accompagnement prévu par l'architecte référent.",
        },
        {
          intitule: "Obtenir la certification AWS Developer Associate",
          echeance: "2025-09-30",
          commentaireManager: "Formation prise en charge par l'entreprise.",
        },
        {
          intitule: "Mentorer un développeur junior pendant 6 mois",
          echeance: "2025-06-30",
          commentaireManager: "Objectif de développement des soft skills.",
        },
      ],
      decisionsFormation: [
        {
          intitule: "Formation Architecture Logicielle - 3 jours",
          origine: "manager",
          commentaire: "Planifiée pour avril 2025.",
        },
        {
          intitule: "Certification AWS Developer Associate",
          origine: "collaborateur",
          commentaire: "Auto-formation + passage de certification avant octobre.",
        },
      ],
      notesSeance:
        "Entretien très positif. Sophie est enthousiaste à l'idée de prendre plus de responsabilités. Nous avons défini ensemble un plan d'évolution vers le rôle de lead technique sur 18 mois. Point intermédiaire prévu en septembre pour faire le bilan de la certification AWS.",
      bilan: {
        syntheseGlobale:
          "Excellent entretien, Sophie démontre une vraie maturité professionnelle et une vision claire de son évolution. Les objectifs fixés sont ambitieux mais réalistes compte tenu de ses capacités démontrées cette année.",
        pointsAmeliorer: [
          {
            intitule: "Estimation des charges projets",
            echeance: "2025-06-30",
            remarque: "Accompagnement par le chef de projet sur les prochaines estimations.",
          },
          {
            intitule: "Prise de parole en réunion client",
            echeance: "2025-09-30",
            remarque: "Participation progressive aux réunions de comité projet.",
          },
        ],
        remarquesCollaborateur:
          "Très satisfaite de cet échange et des perspectives d'évolution proposées. Je suis motivée par les objectifs fixés et j'ai hâte de relever ces nouveaux défis.",
        remarquesManager:
          "Sophie est une collaboratrice clé de l'équipe. Son évolution vers un rôle de lead est naturelle et méritée. Je m'engage à l'accompagner dans cette progression.",
      },
      // Remarques du manager sur les champs des formulaires
      remarquesChamps: {
        "collab_evaluation:2": "L'auto-évaluation sur l'autonomie est cohérente avec mes observations. Point d'attention à suivre.",
        "collab_competence:1": "Effectivement, l'accompagnement reste nécessaire sur les sujets d'architecture.",
        "manager_axe:0": "Priorité pour l'année à venir, à intégrer dans le plan de développement.",
      },
    },
    validation: {
      remarquesCollaborateur:
        "Compte-rendu fidèle à notre échange. Je valide les objectifs et le plan d'évolution proposé.",
      statutSignatureCollaborateur: "valide",
      statutValidationManager: "valide",
    },
  },
  {
    // Entretien annuel Marc Dubois - planifié (données de préparation)
    entretienId: "ent-2",
    preCollaborateur: {
      ressentiGeneral:
        "Une année chargée avec beaucoup de projets en parallèle. Je suis globalement satisfait de mes réalisations mais j'ai ressenti une certaine fatigue en fin d'année. J'aimerais mieux prioriser mes missions l'année prochaine.",
      sentimentGlobal: 3,
      evaluations: [
        {
          theme: "Résultats et qualité du travail",
          score: 4,
          commentaireCollaborateur:
            "Tous les projets ont été livrés dans les délais. La qualité est au rendez-vous selon les retours clients.",
        },
        {
          theme: "Collaboration avec l'équipe",
          score: 4,
          commentaireCollaborateur:
            "Bonne coordination avec les équipes techniques. Quelques tensions ponctuelles sur les priorités.",
        },
        {
          theme: "Développement des compétences",
          score: 3,
          commentaireCollaborateur:
            "Peu de temps consacré à la formation cette année, trop pris par l'opérationnel.",
        },
        {
          theme: "Équilibre vie pro / perso",
          score: 2,
          commentaireCollaborateur:
            "Beaucoup d'heures supplémentaires, difficile de déconnecter. Point d'attention pour l'année prochaine.",
        },
      ],
      ressentiParTheme: [
        { theme: "Ambiance d'équipe", score: 4 },
        { theme: "Équilibre vie pro/perso", score: 2 },
        { theme: "Reconnaissance", score: 3 },
      ],
      objectifsNMoins1: [
        {
          intitule: "Atteindre les objectifs quantitatifs fixés sur votre activité principale",
          echeance: "Mars 2025",
          avancementCollaborateur: 95,
          commentaireCollaborateur:
            "Objectifs dépassés sur la plupart des indicateurs de livraison projet.",
        },
        {
          intitule: "Renforcer la qualité de la relation avec les clients / usagers clés",
          echeance: "Juin 2025",
          avancementCollaborateur: 80,
          commentaireCollaborateur:
            "Relations solides avec les clients principaux. Un conflit géré sur le projet Alpha.",
        },
        {
          intitule: "Développer une nouvelle compétence ou expertise utile à l'équipe",
          echeance: "Décembre 2025",
          avancementCollaborateur: 50,
          commentaireCollaborateur:
            "Formation Agile à moitié suivie, pas eu le temps de terminer.",
        },
      ],
      besoinsFormation: [
        {
          intitule: "Formation gestion du stress et priorisation",
          origine: "collaborateur",
          commentaire: "Pour mieux gérer la charge de travail et éviter l'épuisement.",
        },
        {
          intitule: "Certification PMP",
          origine: "collaborateur",
          commentaire: "Objectif de montée en compétences sur la méthodologie projet.",
        },
      ],
      competences: [
        {
          competence: "Atteinte des objectifs annuels",
          niveauAttendu: 5,
          niveauCollaborateur: 5,
          commentaire: "Tous les projets livrés, objectifs dépassés sur plusieurs indicateurs.",
        },
        {
          competence: "Autonomie et prise d'initiative",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          commentaire: "Autonome sur la gestion de mes projets, force de proposition.",
        },
        {
          competence: "Qualité de la communication",
          niveauAttendu: 4,
          niveauCollaborateur: 3,
          commentaire: "Bonne communication écrite, à améliorer à l'oral en situation de stress.",
        },
      ],
    },
    preManager: {
      syntheseManager:
        "Marc est un chef de projet fiable et performant. Ses résultats sont excellents mais je suis préoccupé par sa charge de travail excessive. Nous devons trouver un meilleur équilibre pour éviter l'épuisement. Son expertise métier est précieuse pour l'équipe.",
      evaluationsManager: [
        {
          theme: "Qualité du travail",
          score: 5,
          commentaire: "Livrables de très haute qualité, rigueur exemplaire.",
        },
        {
          theme: "Respect des délais",
          score: 5,
          commentaire: "100% des projets livrés dans les temps cette année.",
        },
        {
          theme: "Autonomie",
          score: 5,
          commentaire: "Totalement autonome sur la gestion de son portefeuille projets.",
        },
        {
          theme: "Esprit d'équipe",
          score: 4,
          commentaire: "Bon esprit d'équipe, parfois trop absorbé par ses projets pour aider les autres.",
        },
        {
          theme: "Communication",
          score: 3,
          commentaire: "Communication efficace mais peut être plus synthétique en réunion.",
        },
      ],
      pointsForts: [
        "Excellence opérationnelle et rigueur dans le suivi de projet",
        "Expertise métier transport/logistique reconnue",
        "Capacité à gérer plusieurs projets complexes en parallèle",
        "Orientation résultat et engagement fort",
      ],
      axesProgres: [
        "Apprendre à déléguer davantage pour réduire la charge",
        "Améliorer la communication synthétique en comité de direction",
        "Prendre du recul et mieux prioriser les urgences",
      ],
      besoinsFormationManager:
        "Formation management du temps et délégation prioritaire. La certification PMP serait un atout mais attention à ne pas surcharger son planning.",
      notesPreparatoires:
        "Point important sur l'équilibre vie pro/perso. Proposer un accompagnement coaching. Discuter de la possibilité de recruter un assistant chef de projet pour alléger sa charge.",
    },
    session: {
      objectifsNPlus1: [],
      decisionsFormation: [],
      notesSeance: "",
      bilan: {
        syntheseGlobale: "",
        pointsAmeliorer: [],
        remarquesCollaborateur: "",
        remarquesManager: "",
      },
      remarquesChamps: {},
    },
    validation: {
      remarquesCollaborateur: "",
      statutSignatureCollaborateur: "en_attente",
      statutValidationManager: "en_attente",
    },
  },
];

export function loadWizardFromStorage(
  entretienId: string,
  base: WizardEntretienData,
): WizardEntretienData {
  if (!isBrowser()) return base;
  const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
  if (!raw) {
    saveWizardToStorage(base);
    return base;
  }
  try {
    const map = JSON.parse(raw) as Record<string, WizardEntretienData>;
    const existing = map[entretienId];
    return existing ?? base;
  } catch {
    return base;
  }
}

export function saveWizardToStorage(wizard: WizardEntretienData): void {
  if (!isBrowser()) return;
  let map: Record<string, WizardEntretienData> = {};
  const raw = window.localStorage.getItem(WIZARD_STORAGE_KEY);
  if (raw) {
    try {
      map = JSON.parse(raw) ?? {};
    } catch {
      map = {};
    }
  }
  map[wizard.entretienId] = wizard;
  window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(map));
}

export function getWizardDataForEntretien(
  entretien: EntretienWithDetails,
): WizardEntretienData {
  const existing = WIZARD_DATA.find(
    (w) => w.entretienId === entretien.id,
  );

  if (existing) return existing;

  // Fallback générique si aucune donnée simulée n'est définie.
  return {
    entretienId: entretien.id,
    preCollaborateur: {
      ressentiGeneral:
        "Préparation non saisie côté collaborateur (données simulées).",
      sentimentGlobal: 3,
      evaluations: [],
      ressentiParTheme: [],
      objectifsNMoins1: [],
      besoinsFormation: [],
      competences: [],
    },
    preManager: {
      syntheseManager:
        "Préparation non saisie côté manager (données simulées).",
      evaluationsManager: [],
      pointsForts: [],
      axesProgres: [],
      besoinsFormationManager: "",
      notesPreparatoires: "",
    },
    session: {
      objectifsNPlus1: [],
      decisionsFormation: [],
      notesSeance:
        "Notes de séance non renseignées (simulation sans données).",
      bilan: {
        syntheseGlobale: "",
        pointsAmeliorer: [],
        remarquesCollaborateur: "",
        remarquesManager: "",
      },
      remarquesChamps: {},
    },
    validation: {
      remarquesCollaborateur:
        "Aucune remarque saisie (simulation).",
      statutSignatureCollaborateur: "en_attente",
      statutValidationManager: "en_attente",
    },
  };
}

