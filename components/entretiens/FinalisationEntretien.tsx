"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { WizardEntretienData } from "@/lib/wizardData";
import { loadWizardFromStorage, saveWizardToStorage } from "@/lib/wizardData";
import { Button } from "@/components/ui/Button";
import { SyntheseReadonly } from "@/components/entretiens/SyntheseReadonly";

interface FinalisationEntretienProps {
  entretienId: string;
  initialWizard: WizardEntretienData;
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FinalisationEntretien({ entretienId, initialWizard }: FinalisationEntretienProps) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);
  const [motifRefus, setMotifRefus] = useState("");
  const [showRefusForm, setShowRefusForm] = useState(false);

  useEffect(() => {
    const loaded = loadWizardFromStorage(entretienId, initialWizard);
    setWizard(loaded);
  }, [entretienId, initialWizard]);

  const updateWizard = (updater: (prev: WizardEntretienData) => WizardEntretienData) => {
    setWizard((prev) => {
      const next = updater(prev);
      saveWizardToStorage(next);
      return next;
    });
  };

  const validation = wizard.validation;

  return (
    <div className="space-y-6">
      <SyntheseReadonly wizard={wizard} />

      {/* Section Signature */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Signature de l&apos;entretien
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signature Manager */}
          <div className="p-4 rounded-lg border border-gris-10 bg-gris-05">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-medium text-noir">Manager</h3>
              {validation.statutValidationManager === "valide" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-statut-vert/10 text-statut-vert text-[12px] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Signé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gris-10 text-gris-60 text-[12px] font-medium">
                  En attente
                </span>
              )}
            </div>
            {validation.dateSignatureManager && (
              <p className="text-[12px] text-gris-60">
                Signé le {formatDateTime(validation.dateSignatureManager)}
              </p>
            )}
            {validation.statutValidationManager === "en_attente" && (
              <Button
                type="button"
                variant="primary"
                size="small"
                className="mt-3"
                onClick={() => {
                  updateWizard((prev) => ({
                    ...prev,
                    validation: {
                      ...prev.validation,
                      statutValidationManager: "valide",
                      dateSignatureManager: new Date().toISOString(),
                    },
                  }));
                }}
              >
                Signer (Manager)
              </Button>
            )}
          </div>

          {/* Signature Collaborateur */}
          <div className="p-4 rounded-lg border border-gris-10 bg-gris-05">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-medium text-noir">Collaborateur</h3>
              {validation.statutSignatureCollaborateur === "valide" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-statut-vert/10 text-statut-vert text-[12px] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Signé
                </span>
              ) : validation.statutSignatureCollaborateur === "refuse" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-statut-rouge/10 text-statut-rouge text-[12px] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Refusé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gris-10 text-gris-60 text-[12px] font-medium">
                  En attente
                </span>
              )}
            </div>
            {validation.dateSignatureCollaborateur && (
              <p className="text-[12px] text-gris-60">
                {validation.statutSignatureCollaborateur === "refuse" ? "Refusé" : "Signé"} le{" "}
                {formatDateTime(validation.dateSignatureCollaborateur)}
              </p>
            )}
            {validation.motifRefusCollaborateur && (
              <div className="mt-2 p-3 bg-statut-rouge/5 border border-statut-rouge/20 rounded-lg">
                <p className="text-[12px] font-medium text-statut-rouge mb-1">Motif du refus</p>
                <p className="text-[13px] text-noir">{validation.motifRefusCollaborateur}</p>
              </div>
            )}
            {validation.statutSignatureCollaborateur === "en_attente" && (
              <>
                {showRefusForm ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={motifRefus}
                      onChange={(e) => setMotifRefus(e.target.value)}
                      placeholder="Motif du refus de signature..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-white text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          updateWizard((prev) => ({
                            ...prev,
                            validation: {
                              ...prev.validation,
                              statutSignatureCollaborateur: "refuse",
                              dateSignatureCollaborateur: new Date().toISOString(),
                              motifRefusCollaborateur: motifRefus || "Aucun motif précisé",
                            },
                          }));
                          setShowRefusForm(false);
                        }}
                      >
                        Confirmer le refus
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowRefusForm(false)}
                        className="text-[13px] text-gris-60 hover:text-noir"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="small"
                      onClick={() => {
                        updateWizard((prev) => ({
                          ...prev,
                          validation: {
                            ...prev.validation,
                            statutSignatureCollaborateur: "valide",
                            dateSignatureCollaborateur: new Date().toISOString(),
                          },
                        }));
                      }}
                    >
                      Signer
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => setShowRefusForm(true)}
                    >
                      Refuser de signer
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Remarques du collaborateur pour signature */}
        {validation.remarquesCollaborateur && (
          <div className="mt-4 p-3 bg-gris-05 border border-gris-10 rounded-lg">
            <p className="text-[12px] font-medium text-gris-80 mb-1">Remarques du collaborateur</p>
            <p className="text-[13px] text-noir">{validation.remarquesCollaborateur}</p>
          </div>
        )}
      </section>

      {/* Navigation vers post-entretien */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/entretiens/${entretienId}/post-manager`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gris-10 bg-white text-[14px] font-medium text-noir hover:bg-gris-05 transition-colors"
        >
          <svg className="w-4 h-4 text-statut-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Post-entretien Manager (Signaux RH)
        </Link>
        <Link
          href={`/entretiens/${entretienId}/post-collaborateur`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gris-10 bg-white text-[14px] font-medium text-noir hover:bg-gris-05 transition-colors"
        >
          <svg className="w-4 h-4 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Post-entretien Collaborateur (Feedback)
        </Link>
      </div>
    </div>
  );
}
