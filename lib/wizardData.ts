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
    // Entretien annuel Sophie Martin - Agent d'exploitation - réalisé
    entretienId: "ent-1",
    preCollaborateur: {
      ressentiGeneral:
        "Cette année a été riche en apprentissages. Je me sens bien intégrée dans l'équipe exploitation et j'apprécie l'ambiance de travail au sein de Jeantet Transport. J'ai pu monter en compétences sur la gestion des plannings et l'optimisation des tournées. Quelques périodes de charge intense, notamment lors des pics d'activité saisonniers, mais globalement un bon équilibre.",
      // Section 2 - Sentiment global (smiley)
      sentimentGlobal: 4,
      // Thèmes du formulaire collaborateur (section 3 - Évaluation par thème)
      evaluations: [
        {
          theme: "Résultats et qualité du travail",
          score: 4,
          commentaireCollaborateur:
            "J'ai atteint la majorité de mes objectifs en termes de taux de service et de respect des délais de livraison. La coordination avec les chauffeurs s'est bien améliorée.",
        },
        {
          theme: "Collaboration avec l'équipe",
          score: 5,
          commentaireCollaborateur:
            "Excellente collaboration avec mes collègues exploitants et les chauffeurs. La communication quotidienne fonctionne bien.",
        },
        {
          theme: "Développement des compétences",
          score: 4,
          commentaireCollaborateur:
            "J'ai progressé sur le logiciel TMS et la gestion des aléas transport. Je souhaite approfondir mes connaissances en réglementation transport.",
        },
        {
          theme: "Équilibre vie pro / perso",
          score: 3,
          commentaireCollaborateur:
            "Quelques périodes avec des heures supplémentaires lors des urgences livraison, mais globalement acceptable.",
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
          intitule: "Améliorer le taux de service livraison à 98%",
          echeance: "Mars 2025",
          avancementCollaborateur: 85,
          commentaireCollaborateur:
            "Taux de service atteint à 96,5%. Quelques retards dus à des aléas transport non maîtrisables (intempéries, pannes).",
        },
        {
          intitule: "Optimiser les tournées pour réduire les kilomètres à vide",
          echeance: "Juin 2025",
          avancementCollaborateur: 90,
          commentaireCollaborateur:
            "Réduction de 12% des kilomètres à vide grâce à une meilleure planification. Bons retours des chauffeurs sur les nouveaux itinéraires.",
        },
        {
          intitule: "Maîtriser le nouveau logiciel TMS",
          echeance: "Décembre 2025",
          avancementCollaborateur: 75,
          commentaireCollaborateur:
            "Formation TMS suivie et appliquée au quotidien. Module de traçabilité en cours d'approfondissement.",
        },
      ],
      // Besoins formation (section 6)
      besoinsFormation: [
        {
          intitule: "Formation réglementation transport routier",
          origine: "collaborateur",
          commentaire: "Pour mieux accompagner les chauffeurs sur les aspects réglementaires (temps de conduite, etc.).",
        },
        {
          intitule: "Formation gestion des litiges transport",
          origine: "collaborateur",
          commentaire: "Permettrait de mieux traiter les réclamations clients.",
        },
      ],
      // Compétences du formulaire collaborateur (section 7 - Auto-évaluation)
      competences: [
        {
          competence: "Atteinte des objectifs annuels",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          commentaire: "Objectifs de taux de service et d'optimisation globalement atteints malgré les aléas.",
        },
        {
          competence: "Autonomie et prise d'initiative",
          niveauAttendu: 4,
          niveauCollaborateur: 3,
          commentaire: "Autonome sur la gestion quotidienne des tournées, encore besoin d'accompagnement sur les situations de crise.",
        },
        {
          competence: "Qualité de la communication",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          commentaire: "Bonne communication avec les chauffeurs, les clients et les autres services.",
        },
      ],
    },
    preManager: {
      // Section 1 - Synthèse manager
      syntheseManager:
        "Sophie a réalisé une excellente année. Son intégration au service exploitation est un succès et elle est devenue une référence sur la planification des tournées. Elle fait preuve d'initiative et sa rigueur est appréciée des chauffeurs comme des clients. Je recommande de continuer à lui confier des responsabilités croissantes.",
      // Section 2 - Évaluation par thème (thèmes du formulaire manager)
      evaluationsManager: [
        {
          theme: "Qualité du travail",
          score: 4,
          commentaire: "Plannings bien optimisés, peu d'erreurs d'affectation, bonne anticipation des besoins.",
        },
        {
          theme: "Respect des délais",
          score: 4,
          commentaire: "Tournées préparées à temps, bonne réactivité en cas d'aléa.",
        },
        {
          theme: "Autonomie",
          score: 4,
          commentaire: "Autonome sur la gestion quotidienne, sait demander de l'aide pour les cas complexes.",
        },
        {
          theme: "Esprit d'équipe",
          score: 5,
          commentaire: "Excellente collègue, toujours prête à aider les chauffeurs et à partager ses connaissances.",
        },
        {
          theme: "Communication",
          score: 4,
          commentaire: "Communications claires avec les chauffeurs et les clients, bons comptes rendus.",
        },
      ],
      // Section 3 - Points forts
      pointsForts: [
        "Maîtrise du TMS et optimisation des tournées",
        "Capacité à monter rapidement en compétences sur les outils métier",
        "Excellente communication avec les chauffeurs et sens du service client",
        "Rigueur dans le suivi des livraisons et la gestion des aléas",
      ],
      // Section 4 - Axes de progrès
      axesProgres: [
        "Développer l'expertise réglementaire transport",
        "Améliorer la gestion des situations de crise (pannes, accidents)",
        "Prendre davantage d'initiatives sur les relations clients grands comptes",
      ],
      // Section 5 - Besoins formation identifiés
      besoinsFormationManager:
        "Formation réglementation transport recommandée pour accompagner son évolution vers un rôle de responsable exploitation. La formation litiges serait un plus.",
      // Section 6 - Notes préparatoires
      notesPreparatoires:
        "Aborder la question de l'évolution vers un poste de responsable exploitation adjoint. Proposer un accompagnement terrain avec le directeur d'exploitation. Discuter de sa participation aux réunions clients.",
    },
    session: {
      objectifsNPlus1: [
        {
          intitule: "Prendre en charge la coordination des tournées régionales Est",
          echeance: "2025-12-31",
          commentaireManager: "Secteur stratégique, accompagnement prévu avec le responsable régional.",
        },
        {
          intitule: "Obtenir la certification de formation réglementation transport",
          echeance: "2025-09-30",
          commentaireManager: "Formation prise en charge par l'entreprise.",
        },
        {
          intitule: "Former un nouvel agent d'exploitation pendant 3 mois",
          echeance: "2025-06-30",
          commentaireManager: "Objectif de transmission des compétences.",
        },
      ],
      decisionsFormation: [
        {
          intitule: "Formation Réglementation Transport - 2 jours",
          origine: "manager",
          commentaire: "Planifiée pour avril 2025.",
        },
        {
          intitule: "Formation Gestion des Litiges Transport",
          origine: "collaborateur",
          commentaire: "Programmée pour le second semestre.",
        },
      ],
      notesSeance:
        "Entretien très positif. Sophie est enthousiaste à l'idée de prendre plus de responsabilités sur le secteur Est. Nous avons défini ensemble un plan d'évolution vers un rôle de responsable exploitation adjoint sur 18 mois. Point intermédiaire prévu en septembre.",
      bilan: {
        syntheseGlobale:
          "Excellent entretien, Sophie démontre une vraie maturité professionnelle et une vision claire de son évolution chez Jeantet Transport. Les objectifs fixés sont ambitieux mais réalistes compte tenu de ses capacités démontrées cette année.",
        pointsAmeliorer: [
          {
            intitule: "Gestion des situations de crise",
            echeance: "2025-06-30",
            remarque: "Accompagnement par le directeur d'exploitation sur les prochaines situations complexes.",
          },
          {
            intitule: "Relations clients grands comptes",
            echeance: "2025-09-30",
            remarque: "Participation progressive aux réunions de suivi clients.",
          },
        ],
        remarquesCollaborateur:
          "Très satisfaite de cet échange et des perspectives d'évolution proposées. Je suis motivée par les objectifs fixés et j'ai hâte de relever ces nouveaux défis au sein de Jeantet Transport.",
        remarquesManager:
          "Sophie est une collaboratrice clé de l'équipe exploitation. Son évolution vers un rôle de responsable adjoint est naturelle et méritée. Je m'engage à l'accompagner dans cette progression.",
      },
      // Remarques du manager sur les champs des formulaires
      remarquesChamps: {
        "collab_evaluation:2": "L'auto-évaluation sur l'autonomie est cohérente avec mes observations. Point d'attention à suivre.",
        "collab_competence:1": "Effectivement, l'accompagnement reste nécessaire sur la gestion de crise.",
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
    // Entretien annuel Marc Dubois - Chauffeur - planifié (données de préparation)
    entretienId: "ent-2",
    preCollaborateur: {
      ressentiGeneral:
        "Une année chargée avec beaucoup de tournées et de kilomètres parcourus. Je suis globalement satisfait de mon travail mais j'ai ressenti une certaine fatigue en fin d'année avec les livraisons de fin d'année. J'aimerais des tournées mieux réparties l'année prochaine.",
      sentimentGlobal: 3,
      evaluations: [
        {
          theme: "Résultats et qualité du travail",
          score: 4,
          commentaireCollaborateur:
            "Toutes mes livraisons ont été effectuées dans les délais. Les clients sont satisfaits selon les retours de l'exploitation.",
        },
        {
          theme: "Collaboration avec l'équipe",
          score: 4,
          commentaireCollaborateur:
            "Bonne coordination avec l'équipe exploitation et les autres chauffeurs. Quelques tensions ponctuelles sur les affectations de véhicules.",
        },
        {
          theme: "Développement des compétences",
          score: 3,
          commentaireCollaborateur:
            "Peu de temps consacré à la formation cette année, beaucoup de routes à faire.",
        },
        {
          theme: "Équilibre vie pro / perso",
          score: 2,
          commentaireCollaborateur:
            "Beaucoup de découchés et d'heures de route, difficile pour la vie de famille. Point d'attention pour l'année prochaine.",
        },
      ],
      ressentiParTheme: [
        { theme: "Ambiance d'équipe", score: 4 },
        { theme: "Équilibre vie pro/perso", score: 2 },
        { theme: "Reconnaissance", score: 3 },
      ],
      objectifsNMoins1: [
        {
          intitule: "Maintenir un taux de livraison à l'heure supérieur à 95%",
          echeance: "Mars 2025",
          avancementCollaborateur: 95,
          commentaireCollaborateur:
            "Taux de 97% atteint malgré les aléas de circulation et météo.",
        },
        {
          intitule: "Zéro sinistre responsable sur l'année",
          echeance: "Juin 2025",
          avancementCollaborateur: 80,
          commentaireCollaborateur:
            "Un accrochage mineur sur parking client, déclaré et traité. Pas de sinistre grave.",
        },
        {
          intitule: "Optimiser la consommation de carburant",
          echeance: "Décembre 2025",
          avancementCollaborateur: 50,
          commentaireCollaborateur:
            "Réduction de 5% de la consommation grâce à l'écoconduite, mais objectif de 10% non atteint.",
        },
      ],
      besoinsFormation: [
        {
          intitule: "Formation écoconduite avancée",
          origine: "collaborateur",
          commentaire: "Pour continuer à améliorer ma consommation et réduire la fatigue.",
        },
        {
          intitule: "Formation gestes et postures / ergonomie",
          origine: "collaborateur",
          commentaire: "Prévenir les douleurs dorsales liées à la conduite prolongée.",
        },
      ],
      competences: [
        {
          competence: "Atteinte des objectifs annuels",
          niveauAttendu: 5,
          niveauCollaborateur: 5,
          commentaire: "Toutes les livraisons effectuées, très bon taux de service.",
        },
        {
          competence: "Autonomie et prise d'initiative",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          commentaire: "Autonome sur mes tournées, je gère bien les imprévus sur la route.",
        },
        {
          competence: "Qualité de la communication",
          niveauAttendu: 4,
          niveauCollaborateur: 3,
          commentaire: "Bonne communication avec les clients lors des livraisons, à améliorer avec l'exploitation pour les remontées terrain.",
        },
      ],
    },
    preManager: {
      syntheseManager:
        "Marc est un chauffeur fiable et professionnel. Ses résultats sont excellents avec un très bon taux de service, mais je suis préoccupé par son équilibre vie pro/perso avec le nombre de découchés. Nous devons trouver une meilleure organisation. Son expérience de la route et sa connaissance des clients sont précieuses.",
      evaluationsManager: [
        {
          theme: "Qualité du travail",
          score: 5,
          commentaire: "Livraisons soignées, très bon relationnel client, véhicule bien entretenu.",
        },
        {
          theme: "Respect des délais",
          score: 5,
          commentaire: "Excellent taux de ponctualité, bonne gestion des aléas route.",
        },
        {
          theme: "Autonomie",
          score: 5,
          commentaire: "Totalement autonome sur ses tournées, sait gérer les imprévus.",
        },
        {
          theme: "Esprit d'équipe",
          score: 4,
          commentaire: "Bon esprit d'équipe, aide volontiers les nouveaux chauffeurs.",
        },
        {
          theme: "Communication",
          score: 3,
          commentaire: "Remontées terrain parfois tardives, à améliorer sur la traçabilité.",
        },
      ],
      pointsForts: [
        "Excellent taux de service et ponctualité exemplaire",
        "Connaissance approfondie des clients et des itinéraires",
        "Conduite prudente et professionnelle",
        "Engagement fort et sens du service client",
      ],
      axesProgres: [
        "Améliorer les remontées d'information vers l'exploitation",
        "Utiliser davantage les outils de traçabilité (smartphone, TMS)",
        "Mieux anticiper les besoins de maintenance du véhicule",
      ],
      besoinsFormationManager:
        "Formation écoconduite recommandée pour optimiser la consommation. La formation gestes et postures est importante pour sa santé sur le long terme.",
      notesPreparatoires:
        "Point important sur l'équilibre vie pro/perso et les découchés. Étudier la possibilité de tournées plus locales. Discuter du renouvellement de son véhicule prévu au S2.",
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

