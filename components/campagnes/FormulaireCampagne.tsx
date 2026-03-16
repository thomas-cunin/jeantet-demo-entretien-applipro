"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CampagneComplete, TemplateEntretien, TrameElement, TypeEntretien, Collaborateur, Campagne } from "@/lib/types";
import { upsertCampagne } from "@/lib/campagneLocalStorage";
import { loadTemplates } from "@/lib/templateLocalStorage";

interface GroupeDisponible {
  id: string;
  label: string;
}

interface FormulaireCampagneProps {
  groupesDisponibles: GroupeDisponible[];
  seedTemplates: TemplateEntretien[];
  collaborateurs: Collaborateur[];
  campagnesExistantes: Campagne[];
}

const TYPE_OPTIONS: { value: TypeEntretien; label: string }[] = [
  { value: "bilan", label: "Entretien annuel / Bilan" },
  { value: "suivi", label: "Entretien de suivi" },
  { value: "integration", label: "Entretien d'intégration" },
  { value: "autre", label: "Autre" },
];

const TYPE_ELEMENT_LABELS: Record<string, string> = {
  evaluation: "Évaluation",
  objectif: "Objectif",
  formation: "Formation",
  competence: "Compétence",
  texte_libre: "Texte libre",
};

const TYPE_COLORS: Record<TrameElement["type"], string> = {
  evaluation: "border-l-applipro",
  objectif: "border-l-statut-vert",
  formation: "border-l-statut-orange",
  competence: "border-l-purple-500",
  texte_libre: "border-l-gris-40",
};

export function FormulaireCampagne({
  groupesDisponibles,
  seedTemplates,
  collaborateurs,
  campagnesExistantes,
}: FormulaireCampagneProps) {
  const router = useRouter();

  // All templates (seed + localStorage)
  const [allTemplates, setAllTemplates] = useState<TemplateEntretien[]>(seedTemplates);

  useEffect(() => {
    const stored = loadTemplates();
    if (stored.length > 0) {
      const map = new Map<string, TemplateEntretien>();
      for (const t of seedTemplates) map.set(t.id, t);
      for (const t of stored) map.set(t.id, t);
      setAllTemplates(Array.from(map.values()));
    }
  }, [seedTemplates]);

  // Section 1 - Informations générales
  const [nom, setNom] = useState("");
  const [type, setType] = useState<TypeEntretien>("bilan");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [dateOuverturePreparation, setDateOuverturePreparation] = useState("");
  const [dateLancement, setDateLancement] = useState("");

  // Section 2 - Configuration
  const [selectedGroupes, setSelectedGroupes] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Section state
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));
  const [created, setCreated] = useState(false);

  const toggleSection = (n: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const handleGroupeToggle = (groupeId: string) => {
    setSelectedGroupes((prev) =>
      prev.includes(groupeId)
        ? prev.filter((g) => g !== groupeId)
        : [...prev, groupeId]
    );
  };

  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId) ?? null;

  // Filter template elements based on selected groups
  const filteredElements: TrameElement[] = selectedTemplate
    ? selectedTemplate.elements.filter((el) => {
        if (el.appliquePour === "tous") return true;
        if (Array.isArray(el.appliquePour)) {
          return el.appliquePour.some((g) => selectedGroupes.includes(g));
        }
        return false;
      })
    : [];

  // Stats: collaborateurs by group
  const collaborateursByGroupe: Record<string, number> = {};
  let totalCollaborateurs = 0;
  for (const c of collaborateurs) {
    if (c.groupe && selectedGroupes.includes(c.groupe)) {
      collaborateursByGroupe[c.groupe] = (collaborateursByGroupe[c.groupe] || 0) + 1;
      totalCollaborateurs++;
    }
  }

  // Stats: past campaigns using same template
  const pastCampaignsWithTemplate = selectedTemplateId
    ? campagnesExistantes.filter(
        (c) => "templateId" in c && (c as CampagneComplete).templateId === selectedTemplateId
      ).length
    : 0;

  const handleCreate = () => {
    const campagne: CampagneComplete = {
      id: `camp-${Date.now()}`,
      nom: nom || "Nouvelle campagne",
      type,
      dateDebut: dateDebut || new Date().toISOString().split("T")[0],
      dateFin: dateFin || new Date().toISOString().split("T")[0],
      statut: "planifiee",
      groupesCibles: selectedGroupes,
      dateOuverturePreparation: dateOuverturePreparation || undefined,
      dateLancement: dateLancement || undefined,
      templateId: selectedTemplateId,
    };
    upsertCampagne(campagne);
    setCreated(true);
  };

  const canCreate = nom.trim() !== "" && dateDebut && dateFin && selectedGroupes.length > 0 && selectedTemplateId !== "";

  if (created) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-gris-10 rounded-applipro p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-statut-vert/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-statut-vert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-applipro-dark mb-2">Campagne créée avec succès</h2>
          <p className="text-[14px] text-gris-60 mb-6">
            La campagne &laquo; {nom} &raquo; a été enregistrée
            {selectedTemplate && <> avec le template &laquo; {selectedTemplate.nom} &raquo;</>}
            {" "}pour {totalCollaborateurs} collaborateur{totalCollaborateurs > 1 ? "s" : ""}.
          </p>
          <button
            type="button"
            onClick={() => router.push("/entretiens")}
            className="px-6 py-2.5 rounded-applipro bg-applipro text-white text-[14px] font-medium hover:bg-applipro/90 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-applipro-dark">Créer une campagne d&apos;entretiens</h1>
        <p className="text-[14px] text-gris-60 mt-1">
          Configurez les paramètres de la campagne et sélectionnez un template de formulaire.
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
              <label className="block text-[14px] font-medium text-noir mb-1.5">Nom de la campagne *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Campagne annuelle 2026"
                className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-noir mb-1.5">Date de début *</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-noir mb-1.5">Date de fin *</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-medium text-noir mb-1.5">Date ouverture préparation</label>
                <input
                  type="date"
                  value={dateOuverturePreparation}
                  onChange={(e) => setDateOuverturePreparation(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-noir mb-1.5">Date de lancement planifié</label>
                <input
                  type="date"
                  value={dateLancement}
                  onChange={(e) => setDateLancement(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 2 — Configuration */}
      <section className="bg-white border border-gris-10 rounded-applipro overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(2)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gris-05/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-applipro text-white text-[13px] font-semibold flex items-center justify-center">2</span>
            <h2 className="text-[15px] font-semibold text-applipro-dark">
              Configuration
              {selectedGroupes.length > 0 && (
                <span className="ml-2 text-[12px] font-medium text-applipro bg-applipro-05 px-2 py-0.5 rounded-full">
                  {selectedGroupes.length} groupe{selectedGroupes.length > 1 ? "s" : ""}
                </span>
              )}
            </h2>
          </div>
          <svg className={`w-5 h-5 text-gris-40 transition-transform ${openSections.has(2) ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.has(2) && (
          <div className="px-6 pb-6 space-y-6">
            {/* Groupes cibles */}
            <div>
              <label className="block text-[14px] font-medium text-noir mb-2">Groupes cibles *</label>
              <p className="text-[13px] text-gris-60 mb-3">
                Sélectionnez les groupes de collaborateurs concernés par cette campagne.
              </p>
              <div className="flex flex-wrap gap-3">
                {groupesDisponibles.map((g) => {
                  const selected = selectedGroupes.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleGroupeToggle(g.id)}
                      className={`px-4 py-2.5 rounded-applipro border text-[14px] font-medium transition-colors ${
                        selected
                          ? "bg-applipro text-white border-applipro"
                          : "bg-white text-noir border-gris-20 hover:border-applipro hover:text-applipro"
                      }`}
                    >
                      {selected && (
                        <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template selection */}
            <div>
              <label className="block text-[14px] font-medium text-noir mb-2">Template d&apos;entretien *</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full min-h-[40px] px-3 py-2 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
              >
                <option value="">Sélectionner un template...</option>
                {allTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom} ({t.elements.length} blocs)
                  </option>
                ))}
              </select>
              {allTemplates.length === 0 && (
                <p className="mt-2 text-[13px] text-statut-orange">
                  Aucun template disponible. <a href="/templates/nouveau" className="underline text-applipro">Créer un template</a>.
                </p>
              )}
            </div>

            {/* Template preview */}
            {selectedTemplate && selectedGroupes.length > 0 && (
              <div>
                <label className="block text-[14px] font-medium text-noir mb-2">
                  Aperçu du formulaire
                  <span className="ml-2 text-[12px] font-normal text-gris-60">
                    ({filteredElements.length} bloc{filteredElements.length > 1 ? "s" : ""} pour les groupes sélectionnés)
                  </span>
                </label>
                <div className="space-y-2">
                  {filteredElements.length === 0 ? (
                    <p className="text-[13px] text-gris-40 italic py-4 text-center">
                      Aucun bloc ne correspond aux groupes sélectionnés.
                    </p>
                  ) : (
                    filteredElements.map((el) => (
                      <div
                        key={el.id}
                        className={`border-l-4 ${TYPE_COLORS[el.type]} border border-gris-10 rounded-lg px-4 py-3 bg-gris-05/50`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-noir">{el.label}</span>
                            {el.obligatoire && (
                              <span className="text-[11px] text-statut-rouge font-medium">obligatoire</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-white border border-gris-10 text-[11px] text-gris-60">
                              {TYPE_ELEMENT_LABELS[el.type] ?? el.type}
                            </span>
                            {el.destinataire && el.destinataire !== "tous" && (
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                el.destinataire === "collaborateur"
                                  ? "bg-statut-vert/10 text-statut-vert"
                                  : "bg-purple-100 text-purple-700"
                              }`}>
                                {el.destinataire === "collaborateur" ? "Collab." : "Manager"}
                              </span>
                            )}
                            {el.appliquePour !== "tous" && Array.isArray(el.appliquePour) && (
                              <span className="px-2 py-0.5 rounded-full bg-applipro-05 text-[11px] text-applipro font-medium">
                                {el.appliquePour.map((gId) => groupesDisponibles.find((x) => x.id === gId)?.label ?? gId).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        {el.description && (
                          <p className="text-[12px] text-gris-60 mt-1">{el.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedTemplate && selectedGroupes.length === 0 && (
              <p className="text-[13px] text-gris-40 italic">
                Sélectionnez au moins un groupe pour voir l&apos;aperçu du template.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Section 3 — Résumé et statistiques */}
      <section className="bg-white border border-gris-10 rounded-applipro overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(3)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gris-05/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-applipro text-white text-[13px] font-semibold flex items-center justify-center">3</span>
            <h2 className="text-[15px] font-semibold text-applipro-dark">Résumé et statistiques</h2>
          </div>
          <svg className={`w-5 h-5 text-gris-40 transition-transform ${openSections.has(3) ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.has(3) && (
          <div className="px-6 pb-6">
            <div className="bg-gris-05 rounded-lg p-4 mb-4 space-y-3">
              {/* Recap campagne */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <span className="text-gris-60">Nom :</span>
                <span className="font-medium text-noir">{nom || "—"}</span>
                <span className="text-gris-60">Type :</span>
                <span className="font-medium text-noir">{TYPE_OPTIONS.find((o) => o.value === type)?.label}</span>
                <span className="text-gris-60">Période :</span>
                <span className="font-medium text-noir">
                  {dateDebut && dateFin
                    ? `${new Date(dateDebut).toLocaleDateString("fr-FR")} — ${new Date(dateFin).toLocaleDateString("fr-FR")}`
                    : "—"}
                </span>
                <span className="text-gris-60">Groupes :</span>
                <span className="font-medium text-noir">
                  {selectedGroupes.length > 0
                    ? selectedGroupes.map((g) => groupesDisponibles.find((gd) => gd.id === g)?.label ?? g).join(", ")
                    : "—"}
                </span>
                <span className="text-gris-60">Template :</span>
                <span className="font-medium text-noir">{selectedTemplate?.nom ?? "—"}</span>
              </div>

              {/* Collaborateurs stats */}
              {selectedGroupes.length > 0 && (
                <div className="pt-3 border-t border-gris-10">
                  <p className="text-[12px] font-medium text-gris-60 mb-2">Collaborateurs concernés</p>
                  <p className="text-[14px] font-semibold text-noir">
                    {totalCollaborateurs} collaborateur{totalCollaborateurs > 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(collaborateursByGroupe).map(([gId, count]) => {
                      const g = groupesDisponibles.find((x) => x.id === gId);
                      return (
                        <span key={gId} className="px-2 py-0.5 rounded-full bg-applipro-05 text-applipro text-[12px] font-medium">
                          {g?.label ?? gId} : {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Template history */}
              {selectedTemplateId && (
                <div className="pt-3 border-t border-gris-10">
                  <p className="text-[12px] font-medium text-gris-60 mb-1">Historique template</p>
                  <p className="text-[13px] text-noir">
                    {pastCampaignsWithTemplate === 0
                      ? "Ce template n\u2019a encore été utilisé dans aucune campagne."
                      : `Utilisé dans ${pastCampaignsWithTemplate} campagne${pastCampaignsWithTemplate > 1 ? "s" : ""} précédente${pastCampaignsWithTemplate > 1 ? "s" : ""}.`}
                  </p>
                </div>
              )}
            </div>

            {!canCreate && (
              <p className="text-[13px] text-statut-orange mb-4">
                Veuillez remplir tous les champs obligatoires (nom, dates, au moins un groupe, un template) pour créer la campagne.
              </p>
            )}

            <button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate}
              className="w-full py-3 rounded-applipro bg-applipro text-white text-[14px] font-semibold hover:bg-applipro/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Créer la campagne
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
