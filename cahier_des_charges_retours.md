**APPLIPRO**

**Module Entretiens Individuels**

_Cahier des charges fonctionnel — Groupe Transport Jeantais_

Version 2 — Mars 2026 — Document de validation client

|     |     |
| --- | --- |
|     |     |
| Client | Groupe Transport Jeantais — S2PL, Jeantais, Pontarlier, Beaune, Scott, Chemloc |
| Interlocutrices | Mme Poilbois (DAF/RH) + Directrice Achats/QHSE |
| Effectif actuel | ~200 collaborateurs — croissance externe prévue (+110-115 en avril 2026) |
| Objectif du document | Valider les fonctionnalités du module avant développement final |

**1\. PRÉSENTATION GÉNÉRALE DU MODULE**

Le module Entretiens Individuels s'intègre à la solution Applipro existante (livret d'accueil, onboarding, communication interne, coffre-fort). Il couvre l'intégralité du cycle d'entretien annuel : préparation, conduite, validation, archivage. Il est pensé pour une population peu digitalisée (conducteurs sans email professionnel, accès smartphone uniquement).

Trois profils utilisateurs distincts avec vues et droits différenciés :

|     |     |     |
| --- | --- | --- |
| **Profil** | **Rôle dans le module** | **Accès** |
| Collaborateur | Prépare son auto-évaluation, co-construit la synthèse, signe ou refuse | App mobile / web |
| Manager | Prépare l'évaluation, conduit la session, remplit la synthèse, signe, peut signaler à la RH | App mobile / back-office |
| Admin / RH | Pilote les campagnes, consulte tous les entretiens, reçoit les signalements, accède au scoring | Back-office uniquement |

**2\. PHASES DE L'ENTRETIEN**

# Phase 1 — Préparation (avant le jour J)

Dès l'ouverture d'une campagne, collaborateur et manager préparent chacun leur formulaire de leur côté, de façon indépendante et simultanée. La date de début de préparation est configurable par l'admin (ex : lancer la campagne en mars pour une préparation ouverte en mai).

|     |     |     |
| --- | --- | --- |
| **Fonctionnalité** | **Description** | **Profil** |
| Formulaire collaborateur | Auto-évaluation : ressenti général (smileys), évaluations par thème (étoiles), avancement objectifs N-1 (%), besoins formation (saisie libre), auto-évaluation compétences | Collaborateur |
| Formulaire manager | Évaluation du collaborateur : critères de performance, points forts, axes de progrès, besoins formation détectés, notes préparatoires | Manager |
| Mode brouillon | Sauvegarde automatique, retour possible jusqu'au jour de l'entretien | Les deux |
| Confidentialité croisée | Le formulaire du collaborateur est masqué pour le manager (et inversement) jusqu'à la date+heure du RDV. Déverrouillage automatique à l'heure exacte. | Système |

# Phase 2 — Session d'entretien (le jour J)

Le manager ouvre la session depuis la fiche de l'entretien. Il arrive directement sur la vue 3 colonnes — aucune étape intermédiaire.

|     |     |     |
| --- | --- | --- |
| **Fonctionnalité** | **Description** | **Profil** |
| Vue 3 colonnes | Colonne 1 : préparation collaborateur (lecture seule). Colonne 2 : préparation manager (lecture seule). Colonne 3 : synthèse co-construite, pré-remplie avec les valeurs manager par défaut. | Manager |
| 3e colonne pré-remplie | Pour éviter toute redondance : si tout le monde est d'accord, rien à modifier. On ne retravaille que les points qui ont fait l'objet d'une discussion. | Manager |
| Remarques par item | Sur chaque critère, le manager peut ajouter une remarque contextuelle dans la synthèse (ex : objectif partiellement atteint en raison d'aléas externes). | Manager |
| Point de désaccord | Si un désaccord subsiste sur un critère, les deux valeurs sont affichées avec la mention 'Point de désaccord'. Ce point est visible dans la synthèse finale. | Manager |
| Signal RH | Le manager peut indiquer à la RH qu'un point mérite attention. Sélection d'une catégorie (demande d'augmentation, mobilité, besoin formation urgent, etc.) + commentaire libre. Ce n'est pas une alerte confidentielle — la synthèse est co-construite — c'est un marqueur 'À regarder par la RH'. | Manager |
| Notes de séance | Champ libre pour le manager pendant l'entretien, hors synthèse. | Manager |

# Phase 3 — Validation et signature

|     |     |     |
| --- | --- | --- |
| **Fonctionnalité** | **Description** | **Profil** |
| Synthèse finale | Page dédiée présentant uniquement la 3e colonne (le contenu consensuel). C'est ce document qui sera signé. | Les deux |

|     |     |     |
| --- | --- | --- |
| Remarques finales | Chaque partie ajoute une remarque finale avant signature. | Les deux |
| Signature | Validation interne horodatée (option YouSign activable). La signature se fait impérativement lors de la session. | Les deux |
| Refus de signer | Bouton 'Je refuse de signer' avec motif optionnel. L'entretien est clôturé avec statut 'Signé partiellement'. Alerte dans le tableau de bord admin. | Les deux |
| Feedback post-entretien | Après clôture : micro-question 'Comment s'est passé cet entretien ?' (1-5 étoiles + commentaire). Visible uniquement par l'admin, jamais par l'autre partie. | Les deux |

# Phase 4 — Archivage

|     |     |     |
| --- | --- | --- |
| **Fonctionnalité** | **Description** | **Profil** |
| Export PDF automatique | À la clôture, un PDF de la synthèse signée est<br><br>généré automatiquement et déposé dans le coffre-fort du collaborateur (Canon/Therefore). | Système |
| Accès collaborateur | Le collaborateur reçoit son CR par mail et le retrouve dans son coffre-fort. Il peut le télécharger à tout moment. | Collaborateur |
| Historique back-office | La RH et les managers accèdent à l'historique de tous les entretiens depuis le back-office. Filtres par entité, manager, type, période. Chaque entretien est visualisable et téléchargeable. | Admin / Manager |
| Préparation N+1 | À l'ouverture de la prochaine campagne, le collaborateur et le manager voient les objectifs et synthèse de l'entretien précédent pour préparer le suivant. | Les deux |

**3\. CAMPAGNES ET ENTRETIENS DIFFÉRENCIÉS**

Les campagnes s'appuient sur la notion de groupes déjà intégrée dans Applipro. Chaque groupe peut avoir une trame d'entretien spécifique.

|     |     |
| --- | --- |
| **Fonctionnalité** | **Description** |
| Création de campagne | L'admin définit une période, un type d'entretien, et cible un ou plusieurs groupes (ex : conducteurs / agents d'exploitation / managers). |
| Trames différenciées par groupe | Chaque groupe dispose de sa propre trame de questions et critères. Un conducteur n'a pas les mêmes critères qu'un responsable de service. |
| Lancement planifié | L'admin peut créer une campagne à l'avance et programmer son démarrage à une date ultérieure. |
| Suivi de campagne | Tableau de bord avec taux de complétion par entité, par groupe, par manager. |

**4\. PILOTAGE RH — TABLEAUX DE BORD ET ANALYTICS**

# Tableau de bord opérationnel

|     |     |
| --- | --- |
| **Indicateur** | **Description** |
| Statut des entretiens | Liste complète avec filtres : entité, manager, type, statut (planifié / en cours / clôturé / signé partiellement / en retard). |
| Date et heure | Chaque entretien affiche la date ET l'heure prévue. Permet au manager de visualiser sa journée. |
| Signalements RH | Onglet dédié : liste des signalements en attente de traitement, avec catégorie et commentaire. Marquage 'Traité' pour archivage. |
| Feedback | Indicateur coloré (vert/orange/rouge) sur chaque entretien, basé sur les notes post-entretien. Visible admin uniquement. |

# Synthèse formation

Vue consolidée de tous les besoins en formation exprimés (collaborateurs + managers), triés par entité, service, type de formation. Exportable CSV/Excel.

# Scoring et cartographie compétences (vision fonctionnelle)

_Ces fonctionnalités ne sont pas développées dans la V1 mais font partie de la roadmap validée. La description ci-dessous sert à recueillir vos retours._

L'objectif du scoring est de permettre à la RH de détecter des tendances sans avoir à lire tous les comptes rendus individuels. Deux niveaux d'analyse :

|     |     |
| --- | --- |
| **Fonctionnalité** | **Ce que ça fait concrètement** |
| Indicateurs agrégés par critère | Pour chaque compétence ou critère évalué, Applipro calcule la note moyenne sur l'ensemble des entretiens d'une entité ou d'un groupe. Ex : si la compétence 'Gestion des aléas' ressort systématiquement à 2/5 chez les conducteurs de Pontarlier, c'est mis en évidence. |
| Détection des patterns récurrents | Si un même critère ressort avec de faibles notes chez plusieurs collaborateurs d'un même service ou d'un même manager, une alerte visuelle apparaît dans le tableau de bord RH. L'admin définit le seuil (ex : 3 entretiens ou plus avec < 2/5 sur une même compétence). |
| Cartographie compétences | Vue matricielle : en ligne les compétences, en colonne les services ou entités. Les cases sont colorées selon la note moyenne (vert/orange/rouge). Permet d'identifier d'un coup d'oeil les zones de fragilité collective. |
| Analyse par manager | Même logique appliquée aux feedbacks post-entretien : si un manager cumule des feedbacks négatifs, une alerte remonte à la RH. Sans que les collaborateurs le sachent. |
| Export | Toutes les données de scoring sont exportables en Excel pour traitement ou intégration dans un rapport RH ou RSE. |

**Comment l'utiliser concrètement**

- La RH ne lit pas tous les CR — elle regarde la cartographie. Une zone rouge l'incite à aller lire les entretiens concernés.
- Un besoin de formation récurrent sur une même compétence dans plusieurs services = déclencheur d'un plan de formation collectif.
- Des feedbacks post-entretien systématiquement faibles chez un même manager = signal pour un accompagnement managérial.
- La cartographie devient un outil de GPEC simple : anticiper les besoins de formation ou de recrutement avant d'être en difficulté.

**5\. SÉCURITÉ, RGPD ET HÉBERGEMENT**

|     |     |
| --- | --- |
| **Point** | **Situation** |
| Hébergement | Serveurs dédiés en France (IONOS) — non mutualisés entre clients. |
| Stockage documents | Gestion documentaire Canon/Therefore — tiers de confiance pour le coffre-fort et les documents signés. |
| Responsabilité RGPD | Transport Jeantais est responsable du traitement. Applipro intervient en qualité de sous-traitant technique. |
| Authentification | Login/mot de passe natif sans obligation d'email professionnel. SSO disponible en option. |
| Certification | Certification 'Bonjour Cyber' — audits de vulnérabilité réguliers. |
| Sauvegarde | Sauvegardes automatisées sur serveurs externalisés. Restauration complète possible en cas d'incident. |
| Réversibilité | Export complet des données utilisateurs et documents à tout moment. Déploiement possible sur serveur dédié client. |

**6\. PÉRIMÈTRE ET PROCHAINES ÉTAPES**

|     |     |     |
| --- | --- | --- |
|     | **V1 (2026)** | **V2 (roadmap)** |
| Formulaire collaborateur + manager | ✓   |     |
| Vue entretien 3 colonnes — synthèse consensuelle | ✓   |     |
| Signature horodatée / Refus de signer | ✓   |     |
| Export PDF synthèse → coffre-fort collaborateur | ✓   |     |
| Historique entretiens (back-office) | ✓   |     |
| Signal RH (flag 'À regarder') | ✓   |     |
| Feedback post-entretien (confidentiel admin) | ✓   |     |
| Campagnes + entretiens différenciés par groupe | ✓   |     |
| Tableau de bord opérationnel + synthèse formation | ✓   |     |

|     |     |     |
| --- | --- | --- |
| Scoring et cartographie compétences |     | ✓   |
| Analyse patterns récurrents et alertes seuil |     | ✓   |
| Export PDF historique entretiens N-1 |     | ✓   |

_Ce document est soumis à validation. Merci de nous indiquer tout élément à modifier, ajouter ou préciser avant le CODIR du 19 mars._

_Applipro — EFCM SARL — Document confidentiel — Mars 2026_