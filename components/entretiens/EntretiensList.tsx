"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { EntretienWithDetails } from "@/lib/types";
import { StatutBadge } from "@/components/entretiens/StatutBadge";
import { TypeBadge } from "@/components/entretiens/TypeBadge";
import { loadEntretiensWithDetails } from "@/lib/entretienLocalStorage";

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

const STATUT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tous les états" },
  { value: "en_attente", label: "En attente" },
  { value: "planifie", label: "Planifié" },
  { value: "realise", label: "Réalisé" },
  { value: "reporte", label: "Reporté" },
  { value: "annule", label: "Annulé" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "integration", label: "Intégration" },
  { value: "suivi", label: "Suivi" },
  { value: "bilan", label: "Bilan" },
  { value: "autre", label: "Autre" },
];

interface EntretiensListProps {
  entretiens: EntretienWithDetails[];
}

export function EntretiensList({ entretiens }: EntretiensListProps) {
  const [data, setData] = useState<EntretienWithDetails[]>(entretiens);
  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  // Seed localStorage à partir des données statiques puis lire depuis le storage
  useEffect(() => {
    const fromStorage = loadEntretiensWithDetails(entretiens);
    setData(fromStorage);
  }, [entretiens]);

  const filtered = useMemo(() => {
    return data.filter((e) => {
      if (statutFilter && e.statut !== statutFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const fullName = `${e.collaborateur.prenom} ${e.collaborateur.nom}`.toLowerCase();
        const email = e.collaborateur.email.toLowerCase();
        const managerName = `${e.manager.prenom} ${e.manager.nom}`.toLowerCase();
        if (
          !fullName.includes(q) &&
          !email.includes(q) &&
          !managerName.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, statutFilter, typeFilter, search]);

  return (
    <>
      {/* Barre de filtres — style Onboarding Applipro */}
      <div className="bg-gris-05 rounded-applipro border border-gris-10 px-4 py-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir min-w-[160px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
          >
            {STATUT_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir min-w-[160px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="relative flex-1 sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-40 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher"
              className="w-full h-9 pl-9 pr-3 rounded-applipro border border-gris-20 bg-white text-[14px] text-noir placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1"
            />
          </div>
        </div>
      </div>

      {/* Tableau — en-tête sombre style Onboarding */}
      <div className="bg-white rounded-lg border border-gris-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-noir text-white">
                <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1">
                    Nom
                    <ChevronDownIcon />
                  </span>
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1">
                    Entretien
                    <ChevronDownIcon />
                  </span>
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-wide">
                  Dernière modification
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-wide">
                  Date prévue
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-wide">
                  Progrès
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-wide w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-gris-10 hover:bg-gris-05/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gris-20 overflow-hidden flex items-center justify-center text-[13px] font-medium text-gris-80">
                        {e.collaborateur.avatarUrl ? (
                          <img
                            src={e.collaborateur.avatarUrl}
                            alt={`Avatar de ${e.collaborateur.prenom} ${e.collaborateur.nom}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(e.collaborateur.prenom, e.collaborateur.nom)
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-noir block">
                          {e.collaborateur.prenom} {e.collaborateur.nom}
                        </span>
                        <span className="text-[13px] text-gris-60">
                          {e.manager.prenom} {e.manager.nom} (manager)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={e.type} />
                  </td>
                  <td className="px-4 py-3 text-[14px] text-gris-80">
                    {formatDate(e.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-[14px] text-gris-80">
                    {formatDate(e.datePrevue)}
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={e.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/entretiens/${e.id}`}
                      className="text-applipro text-[14px] font-medium hover:underline"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-gris-60 text-[14px]">
            Aucun entretien ne correspond aux critères.
          </div>
        )}
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
