"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TemplateEntretien, TrameElement, TypeEntretien } from "@/lib/types";
import { upsertTemplate } from "@/lib/templateLocalStorage";
import { TrameElementCard } from "@/components/campagnes/TrameElementCard";

interface GroupeDisponible {
  id: string;
  label: string;
}

interface FormulaireTemplateProps {
  groupesDisponibles: GroupeDisponible[];
  existingTemplate?: TemplateEntretien;
}

const TYPE_OPTIONS: { value: TypeEntretien; label: string }[] = [
  { value: "bilan", label: "Entretien annuel / Bilan" },
  { value: "suivi", label: "Entretien de suivi" },
  { value: "integration", label: "Entretien d'intégration" },
  { value: "autre", label: "Autre" },
];

let nextElementId = 1;
function generateElementId(): string {
  return `elem-${Date.now()}-${nextElementId++}`;
}

export function FormulaireTemplate({ groupesDisponibles, existingTemplate }: FormulaireTemplateProps) {
  const router = useRouter();
  const isEdit = !!existingTemplate;

  // Section 1 — Informations générales
  const [nom, setNom] = useState(existingTemplate?.nom ?? "");
  const [description, setDescription] = useState(existingTemplate?.description ?? "");
  const [type, setType] = useState<TypeEntretien>(existingTemplate?.type ?? "bilan");

  // Section 2 — Blocs
  const [elements, setElements] = useState<TrameElement[]>(
    existingTemplate?.elements ?? []
  );

  // Section state
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));
  const [saved, setSaved] = useState(false);

  const toggleSection = (n: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const addElement = () => {
    const newElement: TrameElement = {
      id: generateElementId(),
      type: "texte_libre",
      label: "",
      obligatoire: false,
      appliquePour: "tous",
      destinataire: "tous",
    };
    setElements((prev) => [...prev, newElement]);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const template: TemplateEntretien = {
      id: existingTemplate?.id ?? `tpl-${Date.now()}`,
      nom: nom || "Nouveau template",
      description: description || undefined,
      type,
      elements,
      createdAt: existingTemplate?.createdAt ?? now,
      updatedAt: now,
    };
    upsertTemplate(template);
    setSaved(true);
  };

  const allGroupesMeta = groupesDisponibles.map((g) => ({ id: g.id, label: g.label }));
  const canSave = nom.trim() !== "";

  // Stats for summary
  const elementsByType = elements.reduce<Record<string, number>>((acc, el) => {
    acc[el.type] = (acc[el.type] || 0) + 1;
    return acc;
  }, {});

  const TYPE_ELEMENT_LABELS: Record<string, string> = {
    evaluation: "Évaluation",
    objectif: "Objectif",
    formation: "Formation",
    competence: "Compétence",
    texte_libre: "Texte libre",
  };

  const groupesCibles = new Set<string>();
  for (const el of elements) {
    if (el.appliquePour === "tous") {
      for (const g of groupesDisponibles) groupesCibles.add(g.id);
    } else if (Array.isArray(el.appliquePour)) {
      for (const gId of el.appliquePour) groupesCibles.add(gId);
    }
  }

  if (saved) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-gris-10 rounded-applipro p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-statut-vert/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-statut-vert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-applipro-dark mb-2">
            Template {isEdit ? "mis à jour" : "créé"} avec succès
          </h2>
          <p className="text-[14px] text-gris-60 mb-6">
            Le template &laquo; {nom} &raquo; contient {elements.length} bloc{elements.length > 1 ? "s" : ""}.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/templates")}
              className="px-6 py-2.5 rounded-applipro bg-applipro text-white text-[14px] font-medium hover:bg-applipro/90 transition-colors"
            >
              Retour aux templates
            </button>
            <button
              type="button"
              onClick={() => router.push("/campagnes/nouvelle")}
              className="px-6 py-2.5 rounded-applipro border border-gris-20 text-[14px] font-medium text-noir hover:bg-gris-05 transition-colors"
            >
              Créer une campagne
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-applipro-dark">
          {isEdit ? "Modifier le template" : "Créer un template d\u2019entretien"}
        </h1>
        <p className="text-[14px] text-gris-60 mt-1">
          Définissez la structure du formulaire avec des blocs réutilisables.
        </p>
      </div>

      {/* Section 1 — Informations générales */}
      <section className="bg-white border border-gris-10 rounded-applipro overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(1)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gris-05/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-applipro text-white text-[13px] font-semibold flex items-center justify-center">1</span>
            <h2 className="text-[15px] font-semibold text-applipro-dark">Informations générales</h2>
          </div>
          <svg className={`w-5 h-5 text-gris-40 transition-transform ${openSections.has(1) ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.has(1) && (
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-[14px] font-medium text-noir mb-1.5">Nom du template *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Entretien annuel standard"
                className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-noir mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du template (optionnel)"
                rows={2}
                className="w-full px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir placeholder-gris-40 resize-y focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-noir mb-1.5">Type d&apos;entretien</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeEntretien)}
                className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Section 2 — Blocs du formulaire */}
      <section className="bg-white border border-gris-10 rounded-applipro overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(2)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gris-05/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-applipro text-white text-[13px] font-semibold flex items-center justify-center">2</span>
            <h2 className="text-[15px] font-semibold text-applipro-dark">
              Blocs du formulaire
              {elements.length > 0 && (
                <span className="ml-2 text-[12px] font-medium text-applipro bg-applipro-05 px-2 py-0.5 rounded-full">
                  {elements.length} bloc{elements.length > 1 ? "s" : ""}
                </span>
              )}
            </h2>
          </div>
          <svg className={`w-5 h-5 text-gris-40 transition-transform ${openSections.has(2) ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.has(2) && (
          <div className="px-6 pb-6">
            <p className="text-[13px] text-gris-60 mb-4">
              Ajoutez des blocs au formulaire. Chaque bloc peut s&apos;appliquer à tous les groupes ou à des groupes spécifiques.
            </p>
            <div className="space-y-3">
              {elements.map((element, idx) => (
                <TrameElementCard
                  key={element.id}
                  element={element}
                  allGroupes={allGroupesMeta}
                  onChange={(updated) => {
                    const next = [...elements];
                    next[idx] = updated;
                    setElements(next);
                  }}
                  onDelete={() => {
                    setElements(elements.filter((_, i) => i !== idx));
                  }}
                  onMoveUp={
                    idx > 0
                      ? () => {
                          const next = [...elements];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          setElements(next);
                        }
                      : null
                  }
                  onMoveDown={
                    idx < elements.length - 1
                      ? () => {
                          const next = [...elements];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          setElements(next);
                        }
                      : null
                  }
                />
              ))}
              <button
                type="button"
                onClick={addElement}
                className="w-full py-3 border-2 border-dashed border-gris-20 rounded-applipro text-[13px] font-medium text-gris-60 hover:border-applipro hover:text-applipro transition-colors"
              >
                + Ajouter un bloc
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Section 3 — Aperçu formulaires */}
      {elements.length > 0 && (
        <section className="bg-white border border-gris-10 rounded-applipro overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(3)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gris-05/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-applipro text-white text-[13px] font-semibold flex items-center justify-center">3</span>
              <h2 className="text-[15px] font-semibold text-applipro-dark">Aperçu des formulaires</h2>
            </div>
            <svg className={`w-5 h-5 text-gris-40 transition-transform ${openSections.has(3) ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSections.has(3) && (
            <div className="px-6 pb-6">
              <p className="text-[13px] text-gris-60 mb-4">
                Aperçu de ce que verront le collaborateur et le manager dans leurs formulaires de préparation.
              </p>
              <FormPreview elements={elements} />
            </div>
          )}
        </section>
      )}

      {/* Section 4 — Résumé */}
      <section className="bg-white border border-gris-10 rounded-applipro overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(4)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gris-05/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-applipro text-white text-[13px] font-semibold flex items-center justify-center">{elements.length > 0 ? "4" : "3"}</span>
            <h2 className="text-[15px] font-semibold text-applipro-dark">Résumé</h2>
          </div>
          <svg className={`w-5 h-5 text-gris-40 transition-transform ${openSections.has(4) ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.has(4) && (
          <div className="px-6 pb-6">
            <div className="bg-gris-05 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <span className="text-gris-60">Nom :</span>
                <span className="font-medium text-noir">{nom || "—"}</span>
                <span className="text-gris-60">Type :</span>
                <span className="font-medium text-noir">{TYPE_OPTIONS.find((o) => o.value === type)?.label}</span>
                <span className="text-gris-60">Nombre de blocs :</span>
                <span className="font-medium text-noir">{elements.length}</span>
              </div>

              {elements.length > 0 && (
                <div className="pt-2 border-t border-gris-10">
                  <p className="text-[12px] font-medium text-gris-60 mb-2">Répartition par type :</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(elementsByType).map(([t, count]) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-gris-10 text-[12px] text-noir">
                        {TYPE_ELEMENT_LABELS[t] ?? t} : {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {groupesCibles.size > 0 && (
                <div className="pt-2 border-t border-gris-10">
                  <p className="text-[12px] font-medium text-gris-60 mb-2">Groupes ciblés :</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(groupesCibles).map((gId) => {
                      const g = groupesDisponibles.find((x) => x.id === gId);
                      return (
                        <span key={gId} className="px-2 py-0.5 rounded-full bg-applipro-05 text-applipro text-[12px] font-medium">
                          {g?.label ?? gId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {!canSave && (
              <p className="text-[13px] text-statut-orange mb-4">
                Veuillez renseigner le nom du template pour pouvoir l&apos;enregistrer.
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="w-full py-3 rounded-applipro bg-applipro text-white text-[14px] font-semibold hover:bg-applipro/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEdit ? "Mettre à jour le template" : "Enregistrer le template"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Form Preview Component ───

const PREVIEW_STARS = [1, 2, 3, 4, 5];

function PreviewStarRating() {
  return (
    <div className="flex gap-1">
      {PREVIEW_STARS.map((star) => (
        <svg
          key={star}
          className="w-7 h-7 text-gris-20"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function PreviewElementBlock({ el, stepNum }: { el: TrameElement; stepNum: number }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gris-10 p-4">
      <h3 className="text-[14px] font-semibold text-noir flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-[12px] font-bold shrink-0">
          {stepNum}
        </span>
        {el.label || "Sans titre"}
        {el.obligatoire && <span className="text-[11px] text-statut-rouge font-medium">*</span>}
      </h3>
      {el.description && (
        <p className="text-[12px] text-gris-60 mb-3 ml-9">{el.description}</p>
      )}
      <div className="ml-9">
        {el.type === "evaluation" && (
          <div className="space-y-2">
            <PreviewStarRating />
            <div className="w-full h-16 rounded-lg border border-dashed border-gris-20 bg-gris-05 flex items-center justify-center text-[12px] text-gris-40">
              Commentaire (optionnel)
            </div>
          </div>
        )}
        {el.type === "objectif" && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-gris-05 border border-gris-10">
              <div className="h-4 w-2/3 bg-gris-20 rounded mb-2" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gris-20 rounded-full">
                  <div className="h-full w-1/2 bg-applipro/30 rounded-full" />
                </div>
                <span className="text-[12px] text-gris-40">50%</span>
              </div>
              <div className="w-full h-10 rounded border border-dashed border-gris-20 bg-white mt-2 flex items-center justify-center text-[11px] text-gris-40">
                Commentaire
              </div>
            </div>
          </div>
        )}
        {el.type === "formation" && (
          <div className="w-full h-20 rounded-lg border border-dashed border-gris-20 bg-gris-05 flex items-center justify-center text-[12px] text-gris-40">
            Zone de saisie des besoins en formation
          </div>
        )}
        {el.type === "competence" && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-gris-05 border border-gris-10 flex items-center justify-between">
              <div className="h-3 w-1/3 bg-gris-20 rounded" />
              <PreviewStarRating />
            </div>
          </div>
        )}
        {el.type === "texte_libre" && (
          <div className="w-full h-20 rounded-lg border border-dashed border-gris-20 bg-gris-05 flex items-center justify-center text-[12px] text-gris-40">
            Zone de texte libre
          </div>
        )}
      </div>
    </section>
  );
}

function FormPreview({ elements }: { elements: TrameElement[] }) {
  const collabElements = elements.filter((el) => !el.destinataire || el.destinataire === "tous" || el.destinataire === "collaborateur");
  const managerElements = elements.filter((el) => !el.destinataire || el.destinataire === "tous" || el.destinataire === "manager");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vue Collaborateur */}
      <div>
        <div className="bg-applipro-dark text-white px-4 py-3 rounded-t-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-applipro-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[14px] font-semibold">Vue Collaborateur</span>
            <span className="ml-auto text-[12px] text-applipro-20">{collabElements.length} bloc{collabElements.length > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="bg-gris-05 rounded-b-xl p-4 space-y-3 border border-t-0 border-gris-10">
          {collabElements.length === 0 ? (
            <p className="text-[13px] text-gris-40 italic text-center py-4">Aucun bloc pour le collaborateur</p>
          ) : (
            collabElements.map((el, idx) => (
              <PreviewElementBlock key={el.id} el={el} stepNum={idx + 1} />
            ))
          )}
        </div>
      </div>

      {/* Vue Manager */}
      <div>
        <div className="bg-applipro-dark text-white px-4 py-3 rounded-t-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-applipro-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[14px] font-semibold">Vue Manager</span>
            <span className="ml-auto text-[12px] text-applipro-20">{managerElements.length} bloc{managerElements.length > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="bg-gris-05 rounded-b-xl p-4 space-y-3 border border-t-0 border-gris-10">
          {managerElements.length === 0 ? (
            <p className="text-[13px] text-gris-40 italic text-center py-4">Aucun bloc pour le manager</p>
          ) : (
            managerElements.map((el, idx) => (
              <PreviewElementBlock key={el.id} el={el} stepNum={idx + 1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
