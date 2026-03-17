"use client";

import { useState, useEffect } from "react";
import type { WizardEntretienData, SignalRhCategorie } from "@/lib/wizardData";
import {
  loadWizardFromStorage,
  saveWizardToStorage,
  SIGNAL_RH_CATEGORIES,
} from "@/lib/wizardData";
import { SyntheseReadonly } from "@/components/entretiens/SyntheseReadonly";

interface PostEntretienManagerProps {
  entretienId: string;
  initialWizard: WizardEntretienData;
}

export function PostEntretienManager({ entretienId, initialWizard }: PostEntretienManagerProps) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);

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

  const signauxRh = wizard.session.signauxRh ?? [];

  return (
    <div className="space-y-6">
      <SyntheseReadonly wizard={wizard} />

      {/* Section Signaux RH */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2">
            <svg className="w-5 h-5 text-statut-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Signaler à la RH
            {signauxRh.filter((s) => s.actif).length > 0 && (
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-statut-orange/10 text-statut-orange border border-statut-orange/20">
                {signauxRh.filter((s) => s.actif).length} signalement{signauxRh.filter((s) => s.actif).length > 1 ? "s" : ""} actif{signauxRh.filter((s) => s.actif).length > 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => {
              updateWizard((prev) => ({
                ...prev,
                session: {
                  ...prev.session,
                  signauxRh: [...(prev.session.signauxRh ?? []), { actif: true }],
                },
              }));
            }}
            className="text-[13px] font-medium text-statut-orange hover:text-statut-orange/80 flex items-center gap-1 px-3 py-1.5 rounded-applipro border border-statut-orange/30 bg-statut-orange/5 hover:bg-statut-orange/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un signal
          </button>
        </div>

        {signauxRh.length === 0 ? (
          <p className="text-[14px] text-gris-40 italic">Aucun signalement RH pour cet entretien.</p>
        ) : (
          <div className="space-y-3">
            {signauxRh.map((signal, idx) => (
              <div key={idx} className="border-l-4 border-l-statut-orange border border-gris-10 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-noir">Signal {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateWizard((prev) => ({
                        ...prev,
                        session: {
                          ...prev.session,
                          signauxRh: (prev.session.signauxRh ?? []).filter((_, i) => i !== idx),
                        },
                      }));
                    }}
                    className="text-gris-40 hover:text-statut-rouge transition-colors p-1"
                    title="Supprimer ce signal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-noir mb-1">Catégorie</label>
                  <select
                    value={signal.categorie ?? ""}
                    onChange={(e) => {
                      updateWizard((prev) => {
                        const updated = [...(prev.session.signauxRh ?? [])];
                        updated[idx] = {
                          ...updated[idx],
                          categorie: (e.target.value || undefined) as SignalRhCategorie | undefined,
                        };
                        return { ...prev, session: { ...prev.session, signauxRh: updated } };
                      });
                    }}
                    className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {SIGNAL_RH_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-noir mb-1">Commentaire</label>
                  <textarea
                    value={signal.commentaire ?? ""}
                    onChange={(e) => {
                      updateWizard((prev) => {
                        const updated = [...(prev.session.signauxRh ?? [])];
                        updated[idx] = { ...updated[idx], commentaire: e.target.value };
                        return { ...prev, session: { ...prev.session, signauxRh: updated } };
                      });
                    }}
                    placeholder="Précisez le contexte du signalement..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
