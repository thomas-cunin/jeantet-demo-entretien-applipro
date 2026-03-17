"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import type { EntretienWithDetails, Campagne } from "@/lib/types";
import {
  type WizardEntretienData,
  type WizardSignalRh,
  type SignalRhCategorie,
  SIGNAL_RH_CATEGORIES,
  getWizardDataForEntretien,
  loadWizardFromStorage,
} from "@/lib/wizardData";

interface Props {
  entretiens: EntretienWithDetails[];
  campagnes: Campagne[];
}

interface EntretienRhData {
  entretien: EntretienWithDetails;
  wizard: WizardEntretienData;
}

interface SignalementDisplay {
  entretien: EntretienWithDetails;
  wizard: WizardEntretienData;
  signal: WizardSignalRh;
  index: number;
}

interface FormationDisplay {
  intitule: string;
  origine: string;
  collaborateur: string;
  entite: string;
  commentaire?: string;
  entretienId: string;
}

// ─── Barre de recherche réutilisable ───
function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Rechercher..."}
        className="w-full pl-9 pr-3 py-2 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gris-40 hover:text-noir"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Pill de filtre ───
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[12px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? "border-applipro bg-applipro/10 text-applipro"
          : "border-gris-20 bg-white text-gris-60 hover:border-gris-40"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Filtre select compact ───
function FilterSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 px-2.5 pr-7 rounded-applipro border border-gris-20 bg-white text-[12px] text-noir cursor-pointer focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1 appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", backgroundSize: "16px" }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Filtre période date ───
const DATE_PERIODS = [
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
  { value: "trimestre", label: "Ce trimestre" },
  { value: "annee", label: "Cette année" },
] as const;

function isInPeriod(dateStr: string, period: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  switch (period) {
    case "semaine": {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return d >= monday && d <= sunday;
    }
    case "mois":
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    case "trimestre": {
      const q = Math.floor(now.getMonth() / 3);
      const dq = Math.floor(d.getMonth() / 3);
      return dq === q && d.getFullYear() === now.getFullYear();
    }
    case "annee":
      return d.getFullYear() === now.getFullYear();
    default:
      return true;
  }
}

const TYPE_LABELS: Record<string, string> = {
  bilan: "Bilan annuel",
  suivi: "Suivi",
  integration: "Intégration",
  autre: "Autre",
};

const GROUPE_LABELS: Record<string, string> = {
  conducteur: "Conducteurs",
  sedentaire: "Sédentaires",
};

export function TableauRhClient({ entretiens, campagnes }: Props) {
  const [data, setData] = useState<EntretienRhData[]>([]);
  const [activeTab, setActiveTab] = useState<"campagne" | "signalements" | "formation" | "feedbacks">("campagne");

  // ── Filtres globaux ──
  const [globalGroupe, setGlobalGroupe] = useState("");
  const [globalType, setGlobalType] = useState("");
  const [globalCampagne, setGlobalCampagne] = useState("");
  const [globalPeriod, setGlobalPeriod] = useState("");

  useEffect(() => {
    const items = entretiens.map((ent) => {
      const base = getWizardDataForEntretien(ent);
      const wizard = loadWizardFromStorage(ent.id, base);
      return { entretien: ent, wizard };
    });
    setData(items);
  }, [entretiens]);

  // Options dynamiques
  const groupeOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => { if (d.entretien.collaborateur.groupe) set.add(d.entretien.collaborateur.groupe); });
    return Array.from(set).map((g) => ({ value: g, label: GROUPE_LABELS[g] ?? g }));
  }, [data]);

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => set.add(d.entretien.type));
    return Array.from(set).map((t) => ({ value: t, label: TYPE_LABELS[t] ?? t }));
  }, [data]);

  const campagneOptions = useMemo(() => {
    return campagnes.map((c) => ({ value: c.id, label: c.nom }));
  }, [campagnes]);

  // Application filtres globaux
  const globalFiltered = useMemo(() => {
    let items = data;
    if (globalGroupe) {
      items = items.filter((d) => d.entretien.collaborateur.groupe === globalGroupe);
    }
    if (globalType) {
      items = items.filter((d) => d.entretien.type === globalType);
    }
    if (globalCampagne) {
      items = items.filter((d) => d.entretien.campagneId === globalCampagne);
    }
    if (globalPeriod) {
      items = items.filter((d) => isInPeriod(d.entretien.datePrevue, globalPeriod));
    }
    return items;
  }, [data, globalGroupe, globalType, globalCampagne, globalPeriod]);

  const hasGlobalFilters = !!(globalGroupe || globalType || globalCampagne || globalPeriod);

  const campagne = campagnes[0];
  const total = globalFiltered.length;
  const realises = globalFiltered.filter((d) => d.entretien.statut === "realise").length;
  const planifies = globalFiltered.filter((d) => d.entretien.statut === "planifie").length;
  const enAttente = globalFiltered.filter((d) => d.entretien.statut === "en_attente").length;
  const reportes = globalFiltered.filter((d) => d.entretien.statut === "reporte").length;
  const tauxCompletion = total > 0 ? Math.round((realises / total) * 100) : 0;

  const signalements: SignalementDisplay[] = [];
  for (const d of globalFiltered) {
    const signauxRh = d.wizard.session.signauxRh ?? [];
    signauxRh.forEach((signal, index) => {
      if (signal.actif) {
        signalements.push({ entretien: d.entretien, wizard: d.wizard, signal, index });
      }
    });
  }

  // Formations retenues uniquement
  const formations: FormationDisplay[] = [];
  for (const d of globalFiltered) {
    const nom = `${d.entretien.collaborateur.prenom} ${d.entretien.collaborateur.nom}`;
    const entite = d.entretien.collaborateur.entite ?? "—";
    const selectionnees = d.wizard.session.formationsSelectionnees ?? [];
    const seen = new Set<string>();
    for (const intitule of selectionnees) {
      if (seen.has(intitule)) continue;
      seen.add(intitule);
      const fromCollab = d.wizard.preCollaborateur.besoinsFormation.find((f) => f.intitule === intitule);
      const fromDecision = d.wizard.session.decisionsFormation.find((f) => f.intitule === intitule);
      const origine = fromDecision ? (fromDecision.origine === "manager" ? "Manager" : "Collaborateur") : fromCollab ? "Collaborateur" : "Manager";
      formations.push({ intitule, origine, collaborateur: nom, entite, commentaire: fromDecision?.commentaire ?? fromCollab?.commentaire, entretienId: d.entretien.id });
    }
  }

  const feedbacks = globalFiltered.filter((d) => d.wizard.validation.feedbackNote);

  const tabs = [
    { key: "campagne" as const, label: "Suivi campagne" },
    { key: "signalements" as const, label: `Signalements (${signalements.length})` },
    { key: "formation" as const, label: `Formations retenues (${formations.length})` },
    { key: "feedbacks" as const, label: `Feedbacks (${feedbacks.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Indicateurs campagne */}
      {campagne && (
        <div className="bg-white border border-gris-10 rounded-applipro p-5" data-tour-id="rh-campagne">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-applipro-dark">
                {campagne.nom}
              </h2>
              <p className="text-[13px] text-gris-60 mt-0.5">
                Du {formatDateShort(campagne.dateDebut)} au {formatDateShort(campagne.dateFin)}
                {" — "}
                <span className="inline-flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${campagne.statut === "en_cours" ? "bg-statut-vert" : campagne.statut === "cloturee" ? "bg-gris-40" : "bg-applipro"}`} />
                  {campagne.statut === "en_cours" ? "En cours" : campagne.statut === "cloturee" ? "Clôturée" : "Planifiée"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-3 bg-gris-10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-applipro rounded-full transition-all"
                  style={{ width: `${tauxCompletion}%` }}
                />
              </div>
              <span className="text-[14px] font-semibold text-applipro">
                {tauxCompletion}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Kpi label="Total" value={total} color="text-noir" />
            <Kpi label="Réalisés" value={realises} color="text-statut-vert" />
            <Kpi label="Planifiés" value={planifies} color="text-applipro" />
            <Kpi label="En attente" value={enAttente} color="text-gris-60" />
            <Kpi label="Reportés" value={reportes} color="text-statut-orange" />
          </div>
        </div>
      )}

      {/* Filtres globaux */}
      <div className="bg-gris-05 rounded-applipro border border-gris-10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-medium text-gris-60 uppercase tracking-wide mr-1">Filtrer par</span>
          <FilterSelect
            value={globalGroupe}
            onChange={setGlobalGroupe}
            options={groupeOptions}
            placeholder="Tous les groupes"
          />
          <FilterSelect
            value={globalType}
            onChange={setGlobalType}
            options={typeOptions}
            placeholder="Tous les types"
          />
          {campagneOptions.length > 1 && (
            <FilterSelect
              value={globalCampagne}
              onChange={setGlobalCampagne}
              options={campagneOptions}
              placeholder="Toutes les campagnes"
            />
          )}
          <FilterSelect
            value={globalPeriod}
            onChange={setGlobalPeriod}
            options={DATE_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
            placeholder="Toutes les dates"
          />
          {hasGlobalFilters && (
            <button
              type="button"
              onClick={() => { setGlobalGroupe(""); setGlobalType(""); setGlobalCampagne(""); setGlobalPeriod(""); }}
              className="text-[12px] text-applipro hover:text-applipro/80 font-medium flex items-center gap-1 ml-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>
        {hasGlobalFilters && (
          <p className="text-[11px] text-gris-40 mt-1.5">
            {globalFiltered.length} entretien{globalFiltered.length !== 1 ? "s" : ""} sur {data.length}
          </p>
        )}
      </div>

      {/* Onglets */}
      <div className="border-b border-gris-10">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-applipro text-applipro"
                  : "border-transparent text-gris-60 hover:text-noir hover:border-gris-20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "campagne" && <CampagneTab data={globalFiltered} />}
      {activeTab === "signalements" && <SignalementsTab signalements={signalements} />}
      {activeTab === "formation" && <FormationTab formations={formations} />}
      {activeTab === "feedbacks" && <FeedbacksTab feedbacks={feedbacks} />}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gris-05 rounded-applipro p-3 text-center">
      <p className="text-[12px] text-gris-60">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Campagne
// ═══════════════════════════════════════════════════════════════
function CampagneTab({ data }: { data: EntretienRhData[] }) {
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = data;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((d) => {
        const c = d.entretien.collaborateur;
        return `${c.prenom} ${c.nom} ${c.poste ?? ""} ${c.entite ?? ""}`.toLowerCase().includes(q);
      });
    }
    if (statutFilter) {
      items = items.filter((d) => d.entretien.statut === statutFilter);
    }
    return items;
  }, [data, search, statutFilter]);

  const entiteGroups = new Map<string, EntretienRhData[]>();
  for (const d of filtered) {
    const entite = d.entretien.collaborateur.entite ?? "Autre";
    const list = entiteGroups.get(entite) ?? [];
    list.push(d);
    entiteGroups.set(entite, list);
  }

  const statuts = [
    { value: "realise", label: "Réalisés" },
    { value: "planifie", label: "Planifiés" },
    { value: "en_attente", label: "En attente" },
    { value: "reporte", label: "Reportés" },
  ];

  return (
    <div className="space-y-4" data-tour-id="rh-suivi-entite">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un collaborateur..." />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statuts.map((s) => (
            <FilterPill
              key={s.value}
              label={s.label}
              active={statutFilter === s.value}
              onClick={() => setStatutFilter(statutFilter === s.value ? null : s.value)}
            />
          ))}
        </div>
      </div>

      {entiteGroups.size === 0 ? (
        <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
          <p className="text-[14px] text-gris-40 italic">Aucun résultat.</p>
        </div>
      ) : (
        Array.from(entiteGroups.entries()).map(([entite, items]) => {
          const done = items.filter((i) => i.entretien.statut === "realise").length;
          const pct = Math.round((done / items.length) * 100);
          return (
            <div key={entite} className="bg-white border border-gris-10 rounded-applipro p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-noir">{entite}</h3>
                <span className="text-[13px] text-gris-60">{done}/{items.length} clôturés ({pct}%)</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.entretien.id} className="flex items-center justify-between p-2 rounded-md bg-gris-05 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-noir">
                        {item.entretien.collaborateur.prenom} {item.entretien.collaborateur.nom}
                      </span>
                      <span className="text-gris-60">— {item.entretien.collaborateur.poste}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/entretiens/${item.entretien.id}/synthese`}
                        className="text-[12px] text-applipro hover:underline font-medium"
                      >
                        Voir synthèse
                      </Link>
                      <StatutPill statut={item.entretien.statut} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Signalements
// ═══════════════════════════════════════════════════════════════
function SignalementsTab({ signalements }: { signalements: SignalementDisplay[] }) {
  const [traites, setTraites] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<SignalRhCategorie | null>(null);
  const [showTraites, setShowTraites] = useState(true);

  const filtered = useMemo(() => {
    let items = signalements;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((s) => {
        const c = s.entretien.collaborateur;
        const catLabel = SIGNAL_RH_CATEGORIES.find((cat) => cat.value === s.signal.categorie)?.label ?? "";
        return `${c.prenom} ${c.nom} ${s.signal.commentaire ?? ""} ${catLabel}`.toLowerCase().includes(q);
      });
    }
    if (catFilter) {
      items = items.filter((s) => s.signal.categorie === catFilter);
    }
    if (!showTraites) {
      items = items.filter((s) => !traites.has(`${s.entretien.id}-${s.index}`));
    }
    return items;
  }, [signalements, search, catFilter, showTraites, traites]);

  if (signalements.length === 0) {
    return (
      <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
        <p className="text-[14px] text-gris-40 italic">Aucun signalement RH en cours.</p>
      </div>
    );
  }

  // Catégories présentes dans les signalements
  const presentCategories = Array.from(new Set(signalements.map((s) => s.signal.categorie).filter(Boolean))) as SignalRhCategorie[];

  return (
    <div className="space-y-3" data-tour-id="rh-signalements">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher dans les signalements..." />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {presentCategories.map((cat) => (
            <FilterPill
              key={cat}
              label={SIGNAL_RH_CATEGORIES.find((c) => c.value === cat)?.label ?? cat}
              active={catFilter === cat}
              onClick={() => setCatFilter(catFilter === cat ? null : cat)}
            />
          ))}
          <FilterPill
            label={showTraites ? "Masquer traités" : "Voir traités"}
            active={!showTraites}
            onClick={() => setShowTraites(!showTraites)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
          <p className="text-[14px] text-gris-40 italic">Aucun signalement ne correspond aux filtres.</p>
        </div>
      ) : (
        filtered.map((item) => {
          const catLabel = SIGNAL_RH_CATEGORIES.find(
            (c) => c.value === item.signal.categorie
          )?.label ?? item.signal.categorie;
          const key = `${item.entretien.id}-${item.index}`;
          const isTraite = traites.has(key);
          return (
            <div
              key={key}
              className={`bg-white border-l-4 ${isTraite ? "border-l-statut-vert" : "border-l-statut-orange"} border border-gris-10 rounded-applipro p-4`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[12px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                  isTraite
                    ? "bg-statut-vert/10 text-statut-vert border-statut-vert/20"
                    : "bg-statut-orange/10 text-statut-orange border-statut-orange/20"
                }`}>
                  {isTraite ? "Traité" : catLabel}
                </span>
                {isTraite && (
                  <span className="text-[12px] text-gris-60 italic">{catLabel}</span>
                )}
                <span className="text-[13px] text-gris-60">
                  {item.entretien.collaborateur.prenom} {item.entretien.collaborateur.nom}
                  {" — "}
                  {item.entretien.collaborateur.entite}
                </span>
                <span className="text-[13px] text-gris-40">
                  (Manager : {item.entretien.manager.prenom} {item.entretien.manager.nom})
                </span>
                <Link
                  href={`/entretiens/${item.entretien.id}/synthese`}
                  className="text-[12px] text-applipro hover:underline font-medium ml-auto"
                >
                  Voir synthèse entretien
                </Link>
              </div>
              {item.signal.commentaire && (
                <p className="text-[14px] text-gris-80 leading-relaxed">
                  {item.signal.commentaire}
                </p>
              )}
              {!isTraite && (
                <button
                  type="button"
                  onClick={() => setTraites((prev) => new Set(prev).add(key))}
                  className="mt-3 text-[13px] font-medium text-statut-vert hover:text-statut-vert/80 flex items-center gap-1 px-3 py-1.5 rounded-applipro border border-statut-vert/30 bg-statut-vert/5 hover:bg-statut-vert/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Marquer comme traité
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Formations retenues
// ═══════════════════════════════════════════════════════════════
function FormationTab({ formations }: { formations: FormationDisplay[] }) {
  const [search, setSearch] = useState("");
  const [origineFilter, setOrigineFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = formations;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((f) =>
        `${f.intitule} ${f.collaborateur} ${f.commentaire ?? ""}`.toLowerCase().includes(q)
      );
    }
    if (origineFilter) {
      items = items.filter((f) => f.origine === origineFilter);
    }
    return items;
  }, [formations, search, origineFilter]);

  const exportCsv = useCallback(() => {
    const headers = ["Formation", "Collaborateur", "Entité", "Origine", "Commentaire"];
    const rows = filtered.map((f) => [
      f.intitule,
      f.collaborateur,
      f.entite,
      f.origine,
      f.commentaire ?? "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formations_retenues.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  if (formations.length === 0) {
    return (
      <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
        <p className="text-[14px] text-gris-40 italic">Aucune formation retenue.</p>
      </div>
    );
  }

  const origines = Array.from(new Set(formations.map((f) => f.origine)));

  const byEntite = new Map<string, FormationDisplay[]>();
  for (const f of filtered) {
    const list = byEntite.get(f.entite) ?? [];
    list.push(f);
    byEntite.set(f.entite, list);
  }

  return (
    <div className="space-y-4" data-tour-id="rh-formation">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une formation..." />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {origines.map((o) => (
            <FilterPill
              key={o}
              label={o}
              active={origineFilter === o}
              onClick={() => setOrigineFilter(origineFilter === o ? null : o)}
            />
          ))}
          <button
            type="button"
            onClick={exportCsv}
            className="text-[12px] font-medium text-applipro hover:text-applipro/80 flex items-center gap-1 px-2.5 py-1 rounded-full border border-applipro/30 bg-applipro-05 hover:bg-applipro/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      {byEntite.size === 0 ? (
        <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
          <p className="text-[14px] text-gris-40 italic">Aucun résultat.</p>
        </div>
      ) : (
        Array.from(byEntite.entries()).map(([entite, items]) => (
          <div key={entite} className="bg-white border border-gris-10 rounded-applipro p-4">
            <h3 className="text-[14px] font-semibold text-noir mb-3">{entite}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-gris-60 border-b border-gris-10">
                    <th className="pb-2 pr-3 font-medium">Formation</th>
                    <th className="pb-2 pr-3 font-medium">Collaborateur</th>
                    <th className="pb-2 pr-3 font-medium">Origine</th>
                    <th className="pb-2 pr-3 font-medium">Commentaire</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-05">
                  {items.map((f, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-3 font-medium text-noir">{f.intitule}</td>
                      <td className="py-2 pr-3 text-gris-80">{f.collaborateur}</td>
                      <td className="py-2 pr-3">
                        <span className="text-[12px] px-2 py-0.5 rounded-full bg-applipro-05 text-applipro">
                          {f.origine}
                        </span>
                      </td>
                      <td className="py-2 text-gris-60">{f.commentaire ?? "—"}</td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/entretiens/${f.entretienId}/synthese`}
                          className="text-[12px] text-applipro hover:underline font-medium whitespace-nowrap"
                        >
                          Voir synthèse
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Feedbacks
// ═══════════════════════════════════════════════════════════════
function FeedbacksTab({ feedbacks }: { feedbacks: EntretienRhData[] }) {
  const [search, setSearch] = useState("");
  const [noteFilter, setNoteFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let items = feedbacks;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((d) => {
        const c = d.entretien.collaborateur;
        return `${c.prenom} ${c.nom} ${d.wizard.validation.feedbackCommentaire ?? ""}`.toLowerCase().includes(q);
      });
    }
    if (noteFilter !== null) {
      items = items.filter((d) => d.wizard.validation.feedbackNote === noteFilter);
    }
    return items;
  }, [feedbacks, search, noteFilter]);

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
        <p className="text-[14px] text-gris-40 italic">Aucun feedback post-entretien saisi.</p>
      </div>
    );
  }

  const presentNotes = Array.from(new Set(feedbacks.map((d) => d.wizard.validation.feedbackNote!))).sort();

  return (
    <div className="space-y-3" data-tour-id="rh-feedbacks">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher dans les feedbacks..." />
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {presentNotes.map((n) => (
            <FilterPill
              key={n}
              label={`${n}/5`}
              active={noteFilter === n}
              onClick={() => setNoteFilter(noteFilter === n ? null : n)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
          <p className="text-[14px] text-gris-40 italic">Aucun résultat.</p>
        </div>
      ) : (
        filtered.map((item) => {
          const note = item.wizard.validation.feedbackNote!;
          const color = note >= 4 ? "bg-statut-vert" : note >= 3 ? "bg-statut-orange" : "bg-statut-rouge";
          return (
            <div key={item.entretien.id} className="bg-white border border-gris-10 rounded-applipro p-4 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-[16px] font-bold shrink-0`}>
                {note}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-medium text-noir">
                    {item.entretien.collaborateur.prenom} {item.entretien.collaborateur.nom}
                  </span>
                  <span className="text-[13px] text-gris-60">
                    — {item.entretien.collaborateur.entite}
                  </span>
                  <span className="text-[13px] text-gris-40">
                    (Manager : {item.entretien.manager.prenom} {item.entretien.manager.nom})
                  </span>
                  <Link
                    href={`/entretiens/${item.entretien.id}/synthese`}
                    className="text-[12px] text-applipro hover:underline font-medium ml-auto"
                  >
                    Voir synthèse entretien
                  </Link>
                </div>
                {item.wizard.validation.feedbackCommentaire && (
                  <p className="text-[13px] text-gris-80 mt-1 leading-relaxed">
                    {item.wizard.validation.feedbackCommentaire}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Utilitaires
// ═══════════════════════════════════════════════════════════════
function StatutPill({ statut }: { statut: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    realise: { label: "Réalisé", classes: "bg-statut-vert/10 text-statut-vert" },
    planifie: { label: "Planifié", classes: "bg-applipro-05 text-applipro" },
    en_attente: { label: "En attente", classes: "bg-gris-10 text-gris-60" },
    reporte: { label: "Reporté", classes: "bg-statut-orange/10 text-statut-orange" },
    annule: { label: "Annulé", classes: "bg-statut-rouge/10 text-statut-rouge" },
  };
  const cfg = map[statut] ?? { label: statut, classes: "bg-gris-10 text-gris-60" };
  return (
    <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
