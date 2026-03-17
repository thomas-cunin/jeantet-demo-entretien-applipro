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
  avancementManager?: number;
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
  niveauManager?: number;
  commentaire?: string;
  commentaireManager?: string;
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
  besoinsFormationManager: string | string[];
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

export type SignalRhCategorie =
  | "demande_augmentation"
  | "mobilite"
  | "formation_urgente"
  | "risque_depart"
  | "difficulte_relationnelle"
  | "autre";

export const SIGNAL_RH_CATEGORIES: { value: SignalRhCategorie; label: string }[] = [
  { value: "demande_augmentation", label: "Demande d'augmentation" },
  { value: "mobilite", label: "Souhait de mobilité" },
  { value: "formation_urgente", label: "Besoin de formation urgent" },
  { value: "risque_depart", label: "Risque de départ" },
  { value: "difficulte_relationnelle", label: "Difficulté relationnelle" },
  { value: "autre", label: "Autre" },
];

export interface WizardSignalRh {
  actif: boolean;
  categorie?: SignalRhCategorie;
  commentaire?: string;
}

export interface WizardNotationSynthese {
  score: 1 | 2 | 3 | 4 | 5;
  commentaire: string;
}

export interface WizardObjectifSynthese {
  pourcentage: number;
  commentaire: string;
}

export interface WizardCompetenceSynthese {
  niveau: number;
  commentaire: string;
}

export interface WizardSessionEntretien {
  objectifsNPlus1: WizardObjectifItem[];
  decisionsFormation: WizardBesoinFormation[];
  notesSeance: string;
  bilan: WizardBilanEntretien;
  remarquesChamps: WizardRemarquesChamps;
  signauxRh: WizardSignalRh[];
  notationsSynthese?: Record<string, WizardNotationSynthese>;
  objectifsSynthese?: Record<string, WizardObjectifSynthese>;
  competencesSynthese?: Record<string, WizardCompetenceSynthese>;
  formationsSelectionnees?: string[];
  pointsFortsCommentaire?: string;
  axesProgresCommentaire?: string;
}

export interface WizardValidation {
  // Remarque globale ajoutée par le collaborateur avant la signature
  remarquesCollaborateur: string;
  // Statut de signature côté collaborateur : en attente, signé ou refusé
  statutSignatureCollaborateur: "en_attente" | "valide" | "refuse";
  // Statut de validation côté manager
  statutValidationManager: "en_attente" | "valide";
  // Dates de signature (simulation) pour le suivi RH
  dateSignatureCollaborateur?: string;
  dateSignatureManager?: string;
  // Motif facultatif en cas de refus de signature
  motifRefusCollaborateur?: string;
  // Feedback post-entretien (note 1-5 visible uniquement par l'admin dans la vraie app)
  feedbackNote?: 1 | 2 | 3 | 4 | 5;
  feedbackCommentaire?: string;
}

export interface WizardEntretienData {
  entretienId: string;
  preCollaborateur: WizardPreEntretienCollaborateur;
  preManager: WizardPreEntretienManager;
  session: WizardSessionEntretien;
  validation: WizardValidation;
}

/**
 * Normalise besoinsFormationManager : si c'est une string (ancien format),
 * la convertit en string[].
 */
export function normalizeBesoinsFormationManager(
  val: string | string[] | undefined,
): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  // Ancien format string : split par point ou retour à la ligne
  return val
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const WIZARD_STORAGE_KEY = "demo-entretiens-wizard-v1";

function isBrowser() {
  return typeof window !== "undefined";
}

// Données simulées : dans une vraie application, ces informations
// proviendraient des formulaires côté collaborateur / manager.
const WIZARD_DATA: WizardEntretienData[] = [
  // ═══════════════════════════════════════════════════════════════
  // ent-1 — Sophie Martin — ENTRETIEN COMPLET SIGNÉ (5/5 feedback, signal RH mobilité)
  // ═══════════════════════════════════════════════════════════════
  {
    entretienId: "ent-1",
    preCollaborateur: {
      ressentiGeneral:
        "Cette année a été riche en apprentissages. Je me sens bien intégrée dans l'équipe exploitation et j'apprécie l'ambiance de travail au sein de Jeantet Transport. J'ai pu monter en compétences sur la gestion des plannings et l'optimisation des tournées. Quelques périodes de charge intense, notamment lors des pics d'activité saisonniers, mais globalement un bon équilibre.",
      sentimentGlobal: 4,
      evaluations: [
        {
          theme: "Qualité du travail",
          score: 4,
          commentaireCollaborateur:
            "J'ai atteint la majorité de mes objectifs en termes de taux de service et de respect des délais de livraison. La coordination avec les chauffeurs s'est bien améliorée.",
        },
        {
          theme: "Respect des délais",
          score: 4,
          commentaireCollaborateur:
            "Tournées préparées à temps, bonne réactivité en cas d'imprévu.",
        },
        {
          theme: "Autonomie",
          score: 3,
          commentaireCollaborateur:
            "Autonome sur la gestion quotidienne des tournées, encore besoin d'accompagnement sur les situations de crise.",
        },
        {
          theme: "Esprit d'équipe",
          score: 5,
          commentaireCollaborateur:
            "Excellente collaboration avec mes collègues exploitants et les chauffeurs. La communication quotidienne fonctionne bien.",
        },
        {
          theme: "Communication",
          score: 4,
          commentaireCollaborateur:
            "Bonne communication avec les chauffeurs et les clients, comptes rendus réguliers.",
        },
      ],
      ressentiParTheme: [
        { theme: "Ambiance d'équipe", score: 5 },
        { theme: "Équilibre vie pro/perso", score: 3 },
        { theme: "Reconnaissance", score: 4 },
      ],
      objectifsNMoins1: [
        {
          intitule: "Améliorer le taux de service livraison à 98%",
          echeance: "Mars 2026",
          avancementCollaborateur: 85,
          avancementManager: 90,
          commentaireCollaborateur:
            "Taux de service atteint à 96,5%. Quelques retards dus à des aléas transport non maîtrisables (intempéries, pannes).",
        },
        {
          intitule: "Optimiser les tournées pour réduire les kilomètres à vide",
          echeance: "Juin 2026",
          avancementCollaborateur: 90,
          avancementManager: 95,
          commentaireCollaborateur:
            "Réduction de 12% des kilomètres à vide grâce à une meilleure planification. Bons retours des chauffeurs sur les nouveaux itinéraires.",
        },
        {
          intitule: "Maîtriser le nouveau logiciel TMS",
          echeance: "Décembre 2026",
          avancementCollaborateur: 75,
          avancementManager: 70,
          commentaireCollaborateur:
            "Formation TMS suivie et appliquée au quotidien. Module de traçabilité en cours d'approfondissement.",
        },
      ],
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
      competences: [
        {
          competence: "Atteinte des objectifs annuels",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          niveauManager: 5,
          commentaire: "Objectifs de taux de service et d'optimisation globalement atteints malgré les aléas.",
          commentaireManager: "Dépasse les attentes sur la majorité des indicateurs.",
        },
        {
          competence: "Autonomie et prise d'initiative",
          niveauAttendu: 4,
          niveauCollaborateur: 3,
          niveauManager: 4,
          commentaire: "Autonome sur la gestion quotidienne des tournées, encore besoin d'accompagnement sur les situations de crise.",
          commentaireManager: "A pris plusieurs initiatives seule cette année, progrès significatif.",
        },
        {
          competence: "Qualité de la communication",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          niveauManager: 3,
          commentaire: "Bonne communication avec les chauffeurs, les clients et les autres services.",
          commentaireManager: "Bon à l'oral mais reporting écrit insuffisant.",
        },
      ],
    },
    preManager: {
      syntheseManager:
        "Sophie a réalisé une excellente année. Son intégration au service exploitation est un succès et elle est devenue une référence sur la planification des tournées. Elle fait preuve d'initiative et sa rigueur est appréciée des chauffeurs comme des clients. Je recommande de continuer à lui confier des responsabilités croissantes.",
      evaluationsManager: [
        {
          theme: "Qualité du travail",
          score: 5,
          commentaire: "Plannings bien optimisés, peu d'erreurs d'affectation, bonne anticipation des besoins. Dépasse mes attentes.",
        },
        {
          theme: "Respect des délais",
          score: 4,
          commentaire: "Tournées préparées à temps, bonne réactivité en cas d'aléa.",
        },
        {
          theme: "Autonomie",
          score: 5,
          commentaire: "Autonome sur la gestion quotidienne, sait demander de l'aide pour les cas complexes. A pris plusieurs initiatives seule cette année.",
        },
        {
          theme: "Esprit d'équipe",
          score: 5,
          commentaire: "Excellente collègue, toujours prête à aider les chauffeurs et à partager ses connaissances.",
        },
        {
          theme: "Communication",
          score: 2,
          commentaire: "Reporting écrit insuffisant malgré de bonnes qualités à l'oral. Manque de structuration dans les comptes rendus hebdomadaires.",
        },
      ],
      pointsForts: [
        "Maîtrise du TMS et optimisation des tournées",
        "Capacité à monter rapidement en compétences sur les outils métier",
        "Excellente communication avec les chauffeurs et sens du service client",
        "Rigueur dans le suivi des livraisons et la gestion des aléas",
      ],
      axesProgres: [
        "Développer l'expertise réglementaire transport",
        "Améliorer la gestion des situations de crise (pannes, accidents)",
        "Prendre davantage d'initiatives sur les relations clients grands comptes",
      ],
      besoinsFormationManager: [
        "Formation réglementation transport recommandée pour accompagner son évolution",
        "Formation litiges serait un plus",
      ],
      notesPreparatoires:
        "Aborder la question de l'évolution vers un poste de responsable exploitation adjoint. Proposer un accompagnement terrain avec le directeur d'exploitation. Discuter de sa participation aux réunions clients.",
    },
    session: {
      objectifsNPlus1: [
        {
          intitule: "Prendre en charge la coordination des tournées régionales Est",
          echeance: "2026-12-31",
          commentaireManager: "Secteur stratégique, accompagnement prévu avec le responsable régional.",
        },
        {
          intitule: "Obtenir la certification de formation réglementation transport",
          echeance: "2026-09-30",
          commentaireManager: "Formation prise en charge par l'entreprise.",
        },
        {
          intitule: "Former un nouvel agent d'exploitation pendant 3 mois",
          echeance: "2026-06-30",
          commentaireManager: "Objectif de transmission des compétences.",
        },
      ],
      decisionsFormation: [
        {
          intitule: "Formation Réglementation Transport - 2 jours",
          origine: "manager",
          commentaire: "Planifiée pour avril 2026.",
        },
        {
          intitule: "Formation Gestion des Litiges Transport",
          origine: "collaborateur",
          commentaire: "Programmée pour le second semestre.",
        },
      ],
      notesSeance:
        "Entretien très positif. Sophie est enthousiaste à l'idée de prendre plus de responsabilités sur le secteur Est. Nous avons défini ensemble un plan d'évolution vers un rôle de responsable exploitation adjoint sur 18 mois. Point intermédiaire prévu en septembre.",
      notationsSynthese: {
        "Qualité du travail": { score: 5, commentaire: "Accord sur une note élevée, performance remarquable." },
        "Respect des délais": { score: 4, commentaire: "Bonne performance confirmée par les deux parties." },
        "Autonomie": { score: 4, commentaire: "Synthèse entre 3 (collab) et 5 (manager), autonomie en progression." },
        "Esprit d'équipe": { score: 5, commentaire: "Note commune, excellente collaboration reconnue." },
        "Communication": { score: 3, commentaire: "Écart important : reporting écrit à améliorer malgré de bonnes qualités orales." },
      },
      objectifsSynthese: {
        "Améliorer le taux de service livraison à 98%": { pourcentage: 88, commentaire: "Résultat très satisfaisant malgré les aléas." },
        "Optimiser les tournées pour réduire les kilomètres à vide": { pourcentage: 92, commentaire: "Objectif quasi atteint, excellent travail." },
        "Maîtriser le nouveau logiciel TMS": { pourcentage: 72, commentaire: "En bonne voie, module traçabilité à finaliser." },
      },
      competencesSynthese: {
        "Atteinte des objectifs annuels": { niveau: 4, commentaire: "Très bon niveau confirmé." },
        "Autonomie et prise d'initiative": { niveau: 4, commentaire: "Progression notable, accompagnement crise encore nécessaire." },
        "Qualité de la communication": { niveau: 3, commentaire: "Point d'attention sur le reporting écrit." },
      },
      formationsSelectionnees: [
        "Formation réglementation transport routier",
        "Formation gestion des litiges transport",
        "Formation réglementation transport recommandée pour accompagner son évolution",
      ],
      pointsFortsCommentaire: "Sophie est une collaboratrice exemplaire avec une progression rapide. Ses qualités relationnelles et sa rigueur sont des atouts majeurs pour l'équipe.",
      axesProgresCommentaire: "Priorité sur le reporting écrit et la gestion des situations de crise. L'accompagnement terrain prévu devrait aider à progresser.",
      bilan: {
        syntheseGlobale:
          "Excellent entretien, Sophie démontre une vraie maturité professionnelle et une vision claire de son évolution chez Jeantet Transport. Les objectifs fixés sont ambitieux mais réalistes compte tenu de ses capacités démontrées cette année.",
        pointsAmeliorer: [
          {
            intitule: "Gestion des situations de crise",
            echeance: "2026-06-30",
            remarque: "Accompagnement par le directeur d'exploitation sur les prochaines situations complexes.",
          },
          {
            intitule: "Relations clients grands comptes",
            echeance: "2026-09-30",
            remarque: "Participation progressive aux réunions de suivi clients.",
          },
        ],
        remarquesCollaborateur:
          "Très satisfaite de cet échange et des perspectives d'évolution proposées. Je suis motivée par les objectifs fixés et j'ai hâte de relever ces nouveaux défis au sein de Jeantet Transport.",
        remarquesManager:
          "Sophie est une collaboratrice clé de l'équipe exploitation. Son évolution vers un rôle de responsable adjoint est naturelle et méritée. Je m'engage à l'accompagner dans cette progression.",
      },
      remarquesChamps: {
        "collab_evaluation:2": "L'auto-évaluation sur l'autonomie est cohérente avec mes observations. Point d'attention à suivre.",
        "collab_competence:1": "Effectivement, l'accompagnement reste nécessaire sur la gestion de crise.",
        "manager_axe:0": "Priorité pour l'année à venir, à intégrer dans le plan de développement.",
      },
      signauxRh: [
        {
          actif: true,
          categorie: "mobilite",
          commentaire:
            "Sophie souhaite évoluer vers un poste de responsable exploitation adjoint. À discuter avec la DRH pour valider le plan d'évolution sur 18 mois.",
        },
      ],
    },
    validation: {
      remarquesCollaborateur:
        "Compte-rendu fidèle à notre échange. Je valide les objectifs et le plan d'évolution proposé.",
      statutSignatureCollaborateur: "valide",
      statutValidationManager: "valide",
      dateSignatureCollaborateur: "2026-03-10T15:30:00.000Z",
      dateSignatureManager: "2026-03-10T15:15:00.000Z",
      feedbackNote: 5,
      feedbackCommentaire:
        "Entretien très constructif, avec un bon équilibre entre bilan et perspectives.",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // ent-2 — Marc Dubois — ENTRETIEN RÉALISÉ, EN ATTENTE DE SIGNATURE
  // ═══════════════════════════════════════════════════════════════
  {
    entretienId: "ent-2",
    preCollaborateur: {
      ressentiGeneral:
        "Une année chargée avec beaucoup de tournées et de kilomètres parcourus. Je suis globalement satisfait de mon travail mais j'ai ressenti une certaine fatigue en fin d'année avec les livraisons de fin d'année. J'aimerais des tournées mieux réparties l'année prochaine.",
      sentimentGlobal: 3,
      evaluations: [
        {
          theme: "Qualité du travail",
          score: 4,
          commentaireCollaborateur:
            "Toutes mes livraisons ont été effectuées dans les délais. Les clients sont satisfaits selon les retours de l'exploitation.",
        },
        {
          theme: "Respect des délais",
          score: 5,
          commentaireCollaborateur:
            "Taux de ponctualité excellent, je gère bien les aléas de circulation.",
        },
        {
          theme: "Autonomie",
          score: 4,
          commentaireCollaborateur:
            "Autonome sur mes tournées, je gère bien les imprévus sur la route.",
        },
        {
          theme: "Esprit d'équipe",
          score: 4,
          commentaireCollaborateur:
            "Bonne coordination avec l'équipe exploitation et les autres chauffeurs. Quelques tensions ponctuelles sur les affectations de véhicules.",
        },
        {
          theme: "Communication",
          score: 3,
          commentaireCollaborateur:
            "Bonne communication avec les clients lors des livraisons, à améliorer avec l'exploitation pour les remontées terrain.",
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
          echeance: "Mars 2026",
          avancementCollaborateur: 95,
          avancementManager: 90,
          commentaireCollaborateur:
            "Taux de 97% atteint malgré les aléas de circulation et météo.",
        },
        {
          intitule: "Zéro sinistre responsable sur l'année",
          echeance: "Juin 2026",
          avancementCollaborateur: 80,
          avancementManager: 60,
          commentaireCollaborateur:
            "Un accrochage mineur sur parking client, déclaré et traité. Pas de sinistre grave.",
        },
        {
          intitule: "Optimiser la consommation de carburant",
          echeance: "Décembre 2026",
          avancementCollaborateur: 50,
          avancementManager: 40,
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
          niveauManager: 4,
          commentaire: "Toutes les livraisons effectuées, très bon taux de service.",
          commentaireManager: "Bon taux de service mais objectif carburant non atteint.",
        },
        {
          competence: "Autonomie et prise d'initiative",
          niveauAttendu: 4,
          niveauCollaborateur: 4,
          niveauManager: 5,
          commentaire: "Autonome sur mes tournées, je gère bien les imprévus sur la route.",
          commentaireManager: "Totalement autonome, sait gérer les imprévus.",
        },
        {
          competence: "Qualité de la communication",
          niveauAttendu: 4,
          niveauCollaborateur: 3,
          niveauManager: 1,
          commentaire: "Bonne communication avec les clients lors des livraisons, à améliorer avec l'exploitation pour les remontées terrain.",
          commentaireManager: "Remontées terrain quasi inexistantes. Point bloquant.",
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
          score: 3,
          commentaire: "Quelques retards récurrents sur les tournées du vendredi. A améliorer.",
        },
        {
          theme: "Autonomie",
          score: 5,
          commentaire: "Totalement autonome sur ses tournées, sait gérer les imprévus.",
        },
        {
          theme: "Esprit d'équipe",
          score: 2,
          commentaire: "Tensions fréquentes avec les collègues sur le partage des véhicules. Plusieurs plaintes remontées.",
        },
        {
          theme: "Communication",
          score: 1,
          commentaire: "Remontées terrain quasi inexistantes. Ne répond pas aux messages de l'exploitation. Point bloquant.",
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
      besoinsFormationManager: [
        "Formation écoconduite recommandée pour optimiser la consommation",
        "Formation gestes et postures importante pour sa santé sur le long terme",
      ],
      notesPreparatoires:
        "Point important sur l'équilibre vie pro/perso et les découchés. Étudier la possibilité de tournées plus locales. Discuter du renouvellement de son véhicule prévu au S2.",
    },
    session: {
      objectifsNPlus1: [
        {
          intitule: "Réduire la consommation de carburant de 10% sur l'année",
          echeance: "2026-12-31",
          commentaireManager: "Formation écoconduite prévue pour soutenir cet objectif.",
        },
        {
          intitule: "Zéro sinistre responsable",
          echeance: "2026-12-31",
          commentaireManager: "Objectif reconduit, vigilance renforcée sur les parkings clients.",
        },
        {
          intitule: "Améliorer les remontées terrain vers l'exploitation",
          echeance: "2026-06-30",
          commentaireManager: "Mise en place d'un point hebdomadaire et utilisation du TMS mobile.",
        },
      ],
      decisionsFormation: [
        {
          intitule: "Formation écoconduite avancée - 1 jour",
          origine: "collaborateur",
          commentaire: "Planifiée pour mai 2026.",
        },
        {
          intitule: "Formation gestes et postures",
          origine: "collaborateur",
          commentaire: "Programmée au second semestre.",
        },
      ],
      notesSeance:
        "Entretien franc et direct. Marc reconnaît ses lacunes en communication avec l'exploitation. Nous avons convenu d'un point hebdomadaire rapide par téléphone. La question de l'équilibre vie pro/perso reste un sujet important : étudier des tournées plus locales au S2. Marc est motivé par les objectifs fixés.",
      notationsSynthese: {
        "Qualité du travail": { score: 5, commentaire: "Accord unanime sur la qualité des livraisons." },
        "Respect des délais": { score: 4, commentaire: "Bon globalement, quelques retards le vendredi à surveiller." },
        "Autonomie": { score: 5, commentaire: "Marc est totalement autonome sur ses tournées." },
        "Esprit d'équipe": { score: 3, commentaire: "Tensions sur les véhicules à résoudre, compromis trouvé." },
        "Communication": { score: 2, commentaire: "Point bloquant reconnu par Marc. Plan d'action défini." },
      },
      objectifsSynthese: {
        "Maintenir un taux de livraison à l'heure supérieur à 95%": { pourcentage: 93, commentaire: "Très bon résultat, au-dessus de l'objectif." },
        "Zéro sinistre responsable sur l'année": { pourcentage: 70, commentaire: "Accrochage mineur, pas de sinistre grave." },
        "Optimiser la consommation de carburant": { pourcentage: 45, commentaire: "Objectif non atteint, formation écoconduite prévue." },
      },
      competencesSynthese: {
        "Atteinte des objectifs annuels": { niveau: 4, commentaire: "Bon niveau global malgré l'objectif carburant." },
        "Autonomie et prise d'initiative": { niveau: 5, commentaire: "Excellente autonomie confirmée." },
        "Qualité de la communication": { niveau: 2, commentaire: "Axe de progrès majeur, plan d'action défini." },
      },
      formationsSelectionnees: [
        "Formation écoconduite avancée",
        "Formation gestes et postures / ergonomie",
        "Formation écoconduite recommandée pour optimiser la consommation",
      ],
      pointsFortsCommentaire: "Marc est un chauffeur fiable et expérimenté. Sa connaissance des clients et des itinéraires est un atout précieux pour l'entreprise.",
      axesProgresCommentaire: "La communication avec l'exploitation est le point d'attention principal. L'équilibre vie pro/perso doit aussi être amélioré pour éviter l'usure.",
      bilan: {
        syntheseGlobale:
          "Entretien constructif malgré des points de tension sur la communication. Marc est conscient de ses axes de progrès et motivé par les objectifs fixés. Le plan d'action sur la communication et la réorganisation des tournées devrait améliorer la situation.",
        pointsAmeliorer: [
          {
            intitule: "Communication avec l'exploitation",
            echeance: "6mois",
            remarque: "Point hebdomadaire + utilisation du TMS mobile. Bilan intermédiaire en septembre.",
          },
          {
            intitule: "Gestion des conflits véhicules",
            echeance: "2mois",
            remarque: "Charte de partage des véhicules à mettre en place avec le responsable parc.",
          },
        ],
        remarquesCollaborateur:
          "Je suis d'accord sur les objectifs. Je m'engage à faire des efforts sur la communication. J'espère que les tournées pourront être aménagées pour réduire les découchés.",
        remarquesManager:
          "Marc est un élément fiable de l'équipe. Je m'engage à étudier des tournées plus locales au second semestre et à l'accompagner sur la communication.",
      },
      remarquesChamps: {
        "collab_evaluation:4": "Marc reconnaît le manque de remontées terrain. Plan d'amélioration en place.",
        "manager_evaluation:3": "Les tensions sur les véhicules sont un sujet récurrent. Charte en cours.",
      },
      signauxRh: [
        {
          actif: true,
          categorie: "risque_depart",
          commentaire: "Marc exprime une lassitude liée aux découchés répétés. Si les tournées ne sont pas aménagées, risque de démission à moyen terme. À suivre de près.",
        },
      ],
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
      besoinsFormationManager: [],
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
      signauxRh: [],
    },
    validation: {
      remarquesCollaborateur:
        "Aucune remarque saisie (simulation).",
      statutSignatureCollaborateur: "en_attente",
      statutValidationManager: "en_attente",
    },
  };
}
