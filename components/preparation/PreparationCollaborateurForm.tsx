"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { SmileyRating } from "./SmileyRating";
import { Button } from "@/components/ui/Button";

// Contexte de l'entretien affiché en tête (données démo pour l'aperçu)
const ENTRETIEN_CONTEXTE = {
  type: "Annuel",
  datePrevue: "2025-03-15",
  manager: {
    prenom: "Pierre",
    nom: "Lefebvre",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
};

const CRITERES_BIEN_ETRE = [
  { id: "resultats", label: "Résultats et qualité du travail" },
  { id: "collaboration", label: "Collaboration avec l'équipe" },
  { id: "developpement", label: "Développement des compétences" },
  { id: "equilibre", label: "Équilibre vie pro / perso" },
];

const COMPETENCES_EXEMPLES = [
  "Atteinte des objectifs annuels",
  "Autonomie et prise d'initiative",
  "Qualité de la communication",
];

// Objectifs fixés lors du dernier entretien annuel — le collaborateur ne fait que noter et commenter
const OBJECTIFS_N_1 = [
  {
    intitule:
      "Améliorer le taux de service livraison à 98%",
    echeance: "Mars 2025",
  },
  {
    intitule:
      "Optimiser les tournées pour réduire les kilomètres à vide de 10%",
    echeance: "Juin 2025",
  },
  {
    intitule:
      "Maîtriser le nouveau logiciel TMS (Transport Management System)",
    echeance: "Décembre 2025",
  },
];

export function PreparationCollaborateurForm() {
  const [ressenti, setRessenti] = useState("");
  const [sentimentGlobal, setSentimentGlobal] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [scoresSmiley, setScoresSmiley] = useState<Record<string, number>>({});
  const [scoresStars, setScoresStars] = useState<Record<string, number>>({});
  const [objectifsReponses, setObjectifsReponses] = useState<
    { avancement: number; commentaire: string }[]
  >(OBJECTIFS_N_1.map(() => ({ avancement: 50, commentaire: "" })));
  const [besoinsFormation, setBesoinsFormation] = useState("");
  const [competences, setCompetences] = useState<Record<string, number>>({});
  const [soumis, setSoumis] = useState(false);

  const updateObjectifReponse = (
    index: number,
    field: "avancement" | "commentaire",
    value: number | string
  ) => {
    setObjectifsReponses((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSoumis(true);
  };

  return (
    <form onSubmit={handleSubmit} className="pb-8">
      {/* En-tête type app mobile */}
      <div className="bg-applipro-dark text-white px-4 pt-6 pb-8 rounded-b-2xl shadow-lg">
        <p className="text-applipro-20 text-sm font-medium">
          Préparation à l&apos;entretien
        </p>
        <h1 className="text-xl sm:text-2xl font-bold mt-1">
          Mon formulaire de pré-entretien
        </h1>
        <p className="text-applipro-20 text-sm mt-2">
          Remplissez ce formulaire avant votre entretien. Vos réponses aideront à préparer l&apos;échange.
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-6 max-w-lg mx-auto">
        {/* Votre entretien de [TYPE] — manager, date, couleurs chaleureuses */}
        <section className="rounded-2xl overflow-hidden shadow-md border-2 border-applipro-20 bg-gradient-to-br from-applipro-05 to-white p-4 sm:p-5">
          <h2 className="text-base font-bold text-applipro-dark mb-4">
            Votre entretien {ENTRETIEN_CONTEXTE.type.toLowerCase() === "annuel" ? "annuel" : `d'${ENTRETIEN_CONTEXTE.type.toLowerCase()}`}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-applipro-20 bg-applipro-05 flex-shrink-0">
                {ENTRETIEN_CONTEXTE.manager.avatarUrl ? (
                  <img
                    src={ENTRETIEN_CONTEXTE.manager.avatarUrl}
                    alt={`${ENTRETIEN_CONTEXTE.manager.prenom} ${ENTRETIEN_CONTEXTE.manager.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-applipro text-xl font-semibold">
                    {ENTRETIEN_CONTEXTE.manager.prenom.charAt(0)}
                    {ENTRETIEN_CONTEXTE.manager.nom.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[13px] text-applipro-dark/80 font-medium">
                  Avec votre manager
                </p>
                <p className="text-[17px] font-semibold text-applipro-dark">
                  {ENTRETIEN_CONTEXTE.manager.prenom} {ENTRETIEN_CONTEXTE.manager.nom}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 border border-applipro-20">
              <svg className="w-5 h-5 text-applipro shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[15px] font-semibold text-applipro-dark">
                {new Date(ENTRETIEN_CONTEXTE.datePrevue).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Ressenti général */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              1
            </span>
            Ressenti général
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Comment vous sentez-vous dans votre poste en ce moment ?
          </p>
          <textarea
            value={ressenti}
            onChange={(e) => setRessenti(e.target.value)}
            placeholder="Quelques mots sur votre année écoulée, vos réussites, vos difficultés, l'ambiance..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gris-20 bg-gris-05 text-noir text-[15px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-none"
          />
        </section>

        {/* Sentiment global — smiley */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              2
            </span>
            Votre niveau de satisfaction
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-4">
            Indiquez votre niveau de satisfaction global (du plus insatisfait au plus satisfait).
          </p>
          <SmileyRating
            value={sentimentGlobal}
            onChange={setSentimentGlobal}
            label=""
          />
        </section>

        {/* Évaluation par critères — étoiles + option smiley */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              3
            </span>
            Évaluation par thème
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-4">
            Donnez une note de 1 à 5 étoiles pour chaque critère.
          </p>
          <div className="space-y-6">
            {CRITERES_BIEN_ETRE.map(({ id, label }) => (
              <div
                key={id}
                className="p-3 rounded-xl bg-gris-05 border border-gris-10"
              >
                <StarRating
                  value={scoresStars[id] ?? 0}
                  onChange={(v) => setScoresStars((prev) => ({ ...prev, [id]: v }))}
                  label={label}
                  size="lg"
                />
                <textarea
                  value={notes[id] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                  placeholder="Commentaire (optionnel)"
                  rows={2}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gris-20 bg-white text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro resize-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sentiment par thème — smileys */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              4
            </span>
            Votre ressenti par thème
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-4">
            Choisissez le smiley qui correspond le mieux à votre ressenti.
          </p>
          <div className="space-y-4">
            {["Ambiance d'équipe", "Équilibre vie pro/perso", "Reconnaissance"].map(
              (theme) => (
                <div key={theme} className="space-y-2">
                  <span className="text-[14px] font-medium text-gris-80 block">
                    {theme}
                  </span>
                  <SmileyRating
                    value={scoresSmiley[theme] ?? 0}
                    onChange={(v) =>
                      setScoresSmiley((prev) => ({ ...prev, [theme]: v }))
                    }
                  />
                </div>
              )
            )}
          </div>
        </section>

        {/* Objectifs N-1 — déjà fixés, le collaborateur note et commente uniquement */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              5
            </span>
            Objectifs de l&apos;année passée
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-4">
            Les objectifs ci-dessous ont été fixés lors de votre dernier entretien. Indiquez votre avancement et ajoutez un commentaire si besoin.
          </p>
          <div className="space-y-4">
            {OBJECTIFS_N_1.map((obj, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gris-05 border border-gris-10 space-y-3 min-w-0 overflow-hidden"
              >
                <div>
                  <p className="text-[15px] font-medium text-noir">
                    {obj.intitule}
                  </p>
                  <p className="text-[13px] text-gris-60 mt-0.5">
                    Échéance : {obj.echeance}
                  </p>
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[14px] text-gris-80 block">
                    Mon avancement
                  </label>
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={objectifsReponses[index]?.avancement ?? 50}
                      onChange={(e) =>
                        updateObjectifReponse(
                          index,
                          "avancement",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="flex-1 min-w-0 h-3 rounded-full appearance-none bg-gris-20 accent-applipro"
                    />
                    <span className="text-[14px] font-semibold text-applipro shrink-0 w-10 text-right">
                      {objectifsReponses[index]?.avancement ?? 50}%
                    </span>
                  </div>
                </div>
                <textarea
                  value={objectifsReponses[index]?.commentaire ?? ""}
                  onChange={(e) =>
                    updateObjectifReponse(index, "commentaire", e.target.value)
                  }
                  placeholder="Commentaire (optionnel)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-white text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro resize-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Besoins formation */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              6
            </span>
            Besoins en formation
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Exprimez librement vos souhaits de formation pour les mois à venir.
          </p>
          <textarea
            value={besoinsFormation}
            onChange={(e) => setBesoinsFormation(e.target.value)}
            placeholder="Ex. Formation réglementation transport, gestion des litiges, optimisation tournées..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gris-20 bg-gris-05 text-noir text-[15px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro resize-none"
          />
        </section>

        {/* Auto-évaluation compétences — étoiles */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              7
            </span>
            Auto-évaluation des compétences
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-4">
            Évaluez votre niveau actuel par rapport aux exigences de votre poste (1 à 5).
          </p>
          <div className="space-y-4">
            {COMPETENCES_EXEMPLES.map((comp) => (
              <div
                key={comp}
                className="p-3 rounded-xl bg-gris-05 border border-gris-10"
              >
                <StarRating
                  value={competences[comp] ?? 0}
                  onChange={(v) =>
                    setCompetences((prev) => ({ ...prev, [comp]: v }))
                  }
                  label={comp}
                  size="md"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Bouton envoyer — en bas du formulaire, même largeur que les champs */}
        <div className="mt-6 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="regular"
            className="w-full py-3 text-base"
          >
            {soumis ? "Formulaire envoyé ✓" : "Enregistrer ma préparation"}
          </Button>
          {soumis && (
            <p className="text-center text-[13px] text-statut-vert mt-2">
              Merci ! Votre formulaire a été enregistré.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
