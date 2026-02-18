"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/Button";

// Contexte de l'entretien affiché en tête (données démo pour l'aperçu)
const ENTRETIEN_CONTEXTE = {
  type: "Annuel",
  datePrevue: "2025-03-15",
  collaborateur: {
    prenom: "Sophie",
    nom: "Martin",
    avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    poste: "Agent d'exploitation",
  },
};

const CRITERES_EVALUATION = [
  { id: "qualite", label: "Qualité du travail" },
  { id: "delais", label: "Respect des délais" },
  { id: "autonomie", label: "Autonomie" },
  { id: "equipe", label: "Esprit d'équipe" },
  { id: "communication", label: "Communication" },
];

export function PreparationManagerForm() {
  const [synthese, setSynthese] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [commentaires, setCommentaires] = useState<Record<string, string>>({});
  const [pointsForts, setPointsForts] = useState<string[]>([]);
  const [nouveauPointFort, setNouveauPointFort] = useState("");
  const [axesProgres, setAxesProgres] = useState<string[]>([]);
  const [nouvelAxe, setNouvelAxe] = useState("");
  const [besoinsFormation, setBesoinsFormation] = useState("");
  const [notesPreparatoires, setNotesPreparatoires] = useState("");
  const [soumis, setSoumis] = useState(false);

  const ajouterPointFort = () => {
    if (nouveauPointFort.trim()) {
      setPointsForts((prev) => [...prev, nouveauPointFort.trim()]);
      setNouveauPointFort("");
    }
  };

  const supprimerPointFort = (index: number) => {
    setPointsForts((prev) => prev.filter((_, i) => i !== index));
  };

  const ajouterAxeProgres = () => {
    if (nouvelAxe.trim()) {
      setAxesProgres((prev) => [...prev, nouvelAxe.trim()]);
      setNouvelAxe("");
    }
  };

  const supprimerAxeProgres = (index: number) => {
    setAxesProgres((prev) => prev.filter((_, i) => i !== index));
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
          Préparation manager
        </p>
        <h1 className="text-xl sm:text-2xl font-bold mt-1">
          Mon formulaire de pré-entretien
        </h1>
        <p className="text-applipro-20 text-sm mt-2">
          Préparez l&apos;entretien en évaluant le travail du collaborateur et en identifiant les points clés à aborder.
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-6 max-w-lg mx-auto">
        {/* Info collaborateur */}
        <section className="rounded-2xl overflow-hidden shadow-md border-2 border-applipro-20 bg-gradient-to-br from-applipro-05 to-white p-4 sm:p-5">
          <h2 className="text-base font-bold text-applipro-dark mb-4">
            Entretien {ENTRETIEN_CONTEXTE.type.toLowerCase() === "annuel" ? "annuel" : `d'${ENTRETIEN_CONTEXTE.type.toLowerCase()}`}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-applipro-20 bg-applipro-05 flex-shrink-0">
                {ENTRETIEN_CONTEXTE.collaborateur.avatarUrl ? (
                  <img
                    src={ENTRETIEN_CONTEXTE.collaborateur.avatarUrl}
                    alt={`${ENTRETIEN_CONTEXTE.collaborateur.prenom} ${ENTRETIEN_CONTEXTE.collaborateur.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-applipro text-xl font-semibold">
                    {ENTRETIEN_CONTEXTE.collaborateur.prenom.charAt(0)}
                    {ENTRETIEN_CONTEXTE.collaborateur.nom.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[13px] text-applipro-dark/80 font-medium">
                  Collaborateur
                </p>
                <p className="text-[17px] font-semibold text-applipro-dark">
                  {ENTRETIEN_CONTEXTE.collaborateur.prenom} {ENTRETIEN_CONTEXTE.collaborateur.nom}
                </p>
                {ENTRETIEN_CONTEXTE.collaborateur.poste && (
                  <p className="text-[13px] text-gris-60">
                    {ENTRETIEN_CONTEXTE.collaborateur.poste}
                  </p>
                )}
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

        {/* 1. Synthèse manager */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              1
            </span>
            Synthèse manager
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Donnez votre appréciation générale du travail du collaborateur sur la période écoulée.
          </p>
          <textarea
            value={synthese}
            onChange={(e) => setSynthese(e.target.value)}
            placeholder="Points marquants de la période, évolution observée, contribution à l'équipe..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gris-20 bg-gris-05 text-noir text-[15px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-none"
          />
        </section>

        {/* 2. Évaluation par thème */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              2
            </span>
            Évaluation par thème
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-4">
            Évaluez le collaborateur sur chaque critère de 1 à 5 étoiles.
          </p>
          <div className="space-y-6">
            {CRITERES_EVALUATION.map(({ id, label }) => (
              <div
                key={id}
                className="p-3 rounded-xl bg-gris-05 border border-gris-10"
              >
                <StarRating
                  value={scores[id] ?? 0}
                  onChange={(v) => setScores((prev) => ({ ...prev, [id]: v }))}
                  label={label}
                  size="lg"
                />
                <textarea
                  value={commentaires[id] ?? ""}
                  onChange={(e) =>
                    setCommentaires((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                  placeholder="Commentaire (optionnel)"
                  rows={2}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gris-20 bg-white text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro resize-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 3. Points forts */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              3
            </span>
            Points forts du collaborateur
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Listez les points forts observés chez le collaborateur.
          </p>

          {/* Liste des points forts */}
          {pointsForts.length > 0 && (
            <ul className="space-y-2 mb-3">
              {pointsForts.map((point, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-statut-vert/10 border border-statut-vert/20"
                >
                  <svg className="w-4 h-4 text-statut-vert shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1 text-[14px] text-noir">{point}</span>
                  <button
                    type="button"
                    onClick={() => supprimerPointFort(index)}
                    className="p-1 text-gris-40 hover:text-statut-rouge transition-colors"
                    aria-label="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Ajouter un point fort */}
          <div className="flex gap-2">
            <input
              type="text"
              value={nouveauPointFort}
              onChange={(e) => setNouveauPointFort(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  ajouterPointFort();
                }
              }}
              placeholder="Ajouter un point fort..."
              className="flex-1 px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
            />
            <button
              type="button"
              onClick={ajouterPointFort}
              className="px-3 py-2 rounded-lg bg-applipro text-white font-medium hover:bg-applipro/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </section>

        {/* 4. Axes de progrès */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              4
            </span>
            Axes de progrès identifiés
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Identifiez les domaines dans lesquels le collaborateur peut progresser.
          </p>

          {/* Liste des axes */}
          {axesProgres.length > 0 && (
            <ul className="space-y-2 mb-3">
              {axesProgres.map((axe, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-statut-orange/10 border border-statut-orange/20"
                >
                  <svg className="w-4 h-4 text-statut-orange shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1 text-[14px] text-noir">{axe}</span>
                  <button
                    type="button"
                    onClick={() => supprimerAxeProgres(index)}
                    className="p-1 text-gris-40 hover:text-statut-rouge transition-colors"
                    aria-label="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Ajouter un axe */}
          <div className="flex gap-2">
            <input
              type="text"
              value={nouvelAxe}
              onChange={(e) => setNouvelAxe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  ajouterAxeProgres();
                }
              }}
              placeholder="Ajouter un axe de progrès..."
              className="flex-1 px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
            />
            <button
              type="button"
              onClick={ajouterAxeProgres}
              className="px-3 py-2 rounded-lg bg-applipro text-white font-medium hover:bg-applipro/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </section>

        {/* 5. Besoins en formation */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              5
            </span>
            Besoins en formation identifiés
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Quelles formations recommanderiez-vous pour ce collaborateur ?
          </p>
          <textarea
            value={besoinsFormation}
            onChange={(e) => setBesoinsFormation(e.target.value)}
            placeholder="Ex. Formation réglementation transport, gestion des litiges, écoconduite..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gris-20 bg-gris-05 text-noir text-[15px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-none"
          />
        </section>

        {/* 6. Notes préparatoires */}
        <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-noir flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
              6
            </span>
            Notes préparatoires
          </h2>
          <p className="text-[13px] text-gris-60 mt-1 mb-3">
            Notes libres pour préparer l&apos;entretien (points à aborder, questions, rappels...).
          </p>
          <textarea
            value={notesPreparatoires}
            onChange={(e) => setNotesPreparatoires(e.target.value)}
            placeholder="Points spécifiques à aborder, questions à poser, sujets sensibles à traiter avec tact..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gris-20 bg-gris-05 text-noir text-[15px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-none"
          />
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
