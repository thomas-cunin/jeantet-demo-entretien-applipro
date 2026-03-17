"use client";

import { useState, useEffect } from "react";
import type { WizardEntretienData } from "@/lib/wizardData";
import { loadWizardFromStorage, SIGNAL_RH_CATEGORIES } from "@/lib/wizardData";
import { SyntheseReadonly } from "@/components/entretiens/SyntheseReadonly";

interface Props {
  entretienId: string;
  initialWizard: WizardEntretienData;
}

function MiniStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= value ? "text-statut-orange" : "text-gris-20"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function SyntheseEntretienComplete({ entretienId, initialWizard }: Props) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);

  useEffect(() => {
    const loaded = loadWizardFromStorage(entretienId, initialWizard);
    setWizard(loaded);
  }, [entretienId, initialWizard]);

  const signauxRh = (wizard.session.signauxRh ?? []).filter((s) => s.actif);
  const validation = wizard.validation;
  const hasFeedback = !!validation.feedbackNote;
  const hasSignaux = signauxRh.length > 0;

  return (
    <div className="space-y-6">
      {/* Synthèse entretien */}
      <SyntheseReadonly wizard={wizard} />

      {/* Signaux RH */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-statut-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Signaux RH
          {hasSignaux && (
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-statut-orange/10 text-statut-orange border border-statut-orange/20">
              {signauxRh.length} signalement{signauxRh.length > 1 ? "s" : ""}
            </span>
          )}
        </h2>

        {!hasSignaux ? (
          <p className="text-[14px] text-gris-40 italic">Aucun signalement RH pour cet entretien.</p>
        ) : (
          <div className="space-y-3">
            {signauxRh.map((signal, idx) => {
              const catLabel = SIGNAL_RH_CATEGORIES.find(
                (c) => c.value === signal.categorie
              )?.label ?? "Non catégorisé";
              return (
                <div key={idx} className="border-l-4 border-l-statut-orange border border-gris-10 rounded-lg p-4">
                  <span className="text-[12px] font-semibold uppercase px-2 py-0.5 rounded-full bg-statut-orange/10 text-statut-orange border border-statut-orange/20">
                    {catLabel}
                  </span>
                  {signal.commentaire && (
                    <p className="text-[13px] text-gris-80 mt-2 leading-relaxed">
                      {signal.commentaire}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Feedback collaborateur */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Feedback collaborateur
        </h2>

        {!hasFeedback ? (
          <p className="text-[14px] text-gris-40 italic">Aucun feedback post-entretien saisi par le collaborateur.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-gris-60">Note :</span>
              <MiniStars value={validation.feedbackNote!} />
              <span className="text-[14px] font-semibold text-applipro">
                {validation.feedbackNote}/5
              </span>
            </div>
            {validation.feedbackCommentaire && (
              <div>
                <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
                  {validation.feedbackCommentaire}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Statut signatures */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Signatures
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SignatureStatus
            label="Manager"
            statut={validation.statutValidationManager === "valide" ? "signe" : "en_attente"}
          />
          <SignatureStatus
            label="Collaborateur"
            statut={validation.statutSignatureCollaborateur === "valide" ? "signe" : validation.statutSignatureCollaborateur === "refuse" ? "refuse" : "en_attente"}
            motifRefus={validation.motifRefusCollaborateur}
          />
        </div>
      </section>
    </div>
  );
}

function SignatureStatus({
  label,
  statut,
  motifRefus,
}: {
  label: string;
  statut: "en_attente" | "signe" | "refuse";
  motifRefus?: string;
}) {
  const config = {
    en_attente: { text: "En attente", classes: "bg-gris-10 text-gris-60", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    signe: { text: "Signé", classes: "bg-statut-vert/10 text-statut-vert", icon: "M5 13l4 4L19 7" },
    refuse: { text: "Refusé", classes: "bg-statut-rouge/10 text-statut-rouge", icon: "M6 18L18 6M6 6l12 12" },
  };
  const cfg = config[statut];

  return (
    <div className={`rounded-lg p-3 ${cfg.classes}`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
        </svg>
        <span className="text-[13px] font-medium">{label} : {cfg.text}</span>
      </div>
      {statut === "refuse" && motifRefus && (
        <p className="text-[12px] mt-1.5 opacity-80">Motif : {motifRefus}</p>
      )}
    </div>
  );
}
