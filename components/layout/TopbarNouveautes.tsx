"use client";

import { useState, useEffect } from "react";
import Joyride, { type Step } from "react-joyride";

const steps: Step[] = [
  {
    target: "body",
    placement: "center",
    title: "Bienvenue dans la V1 du module Entretiens",
    content:
      "Découvrez les principales fonctionnalités : tableau de bord manager, préparations, vue d'entretien 3 colonnes, signal RH et tableau de bord RH.",
    disableBeacon: true,
  },
  {
    target: "[data-tour-id='tableau-de-bord']",
    title: "Tableau de bord manager",
    content:
      "Visualisez en un coup d'œil les entretiens de votre périmètre : planifiés, réalisés, en attente ou en retard.",
    placement: "bottom",
  },
  {
    target: "[data-tour-id='lien-tableau-rh']",
    title: "Tableau de bord RH",
    content:
      "La RH accède à une vision consolidée multi-entités : suivi de campagne, signalements RH, synthèse formation et feedbacks post-entretien.",
    placement: "right",
  },
  {
    target: "[data-tour-id='lien-preparation-collaborateur']",
    title: "Préparation côté collaborateur",
    content:
      "Un formulaire mobile-first : ressenti, objectifs N-1, besoins en formation et auto-évaluation des compétences.",
    placement: "right",
  },
  {
    target: "[data-tour-id='lien-preparation-manager']",
    title: "Préparation côté manager",
    content:
      "Le manager évalue, identifie les points forts et axes de progrès, et prépare les pistes de formation.",
    placement: "right",
  },
  {
    target: "[data-tour-id='lien-vue-entretien']",
    title: "Vue d'entretien en 3 colonnes",
    content:
      "Le jour J : les deux préparations côte à côte, une colonne synthèse co-construite, un signal RH si besoin.",
    placement: "right",
  },
  {
    target: "body",
    placement: "center",
    title: "Signature, refus et feedback",
    content:
      "En fin de parcours : signature horodatée par les deux parties, possibilité de refuser de signer avec motif, et un micro-feedback confidentiel visible uniquement par la RH.",
    disableBeacon: true,
  },
];

export function TopbarNouveautes() {
  const [runTour, setRunTour] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="w-full bg-gradient-to-r from-applipro-dark to-applipro px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-[13px] text-white">
          <span className="inline-flex items-center justify-center h-5 w-8 rounded-full bg-white/10 border border-white/30 text-[11px] font-semibold tracking-wide">
            V1
          </span>
          <span className="font-medium hidden sm:inline">
            Découvrez les nouveautés du module entretiens
          </span>
          <span className="font-medium sm:hidden">
            Nouveautés V1
          </span>
        </div>
        <button
          type="button"
          onClick={() => setRunTour(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-white hover:text-applipro-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Voir les nouveautés</span>
        </button>
      </div>

      {mounted && <Joyride
        steps={steps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        styles={{
          options: {
            primaryColor: "#3374FF",
            zIndex: 10000,
            backgroundColor: "#FFFFFF",
            textColor: "#1F2933",
          },
          tooltip: {
            borderRadius: 12,
            padding: "16px 18px",
          },
          tooltipTitle: {
            fontSize: "15px",
            fontWeight: 600,
          },
          tooltipContent: {
            fontSize: "13px",
            lineHeight: 1.5,
          },
          buttonNext: {
            borderRadius: 999,
            paddingInline: 16,
          },
          buttonBack: {
            borderRadius: 999,
          },
          buttonSkip: {
            borderRadius: 999,
          },
          spotlight: {
            borderRadius: 12,
          },
        }}
        locale={{
          back: "Précédent",
          close: "Fermer",
          last: "Terminer",
          next: "Suivant",
          skip: "Passer le tour",
        }}
        callback={(data) => {
          const { status } = data;
          if (status === "finished" || status === "skipped") {
            setRunTour(false);
          }
        }}
      />}
    </>
  );
}
