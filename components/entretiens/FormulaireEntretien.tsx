"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  getCollaborateurs,
  getManagers,
  getEntretiensWithDetails,
  STATUTS,
  TYPES_ENTRETIEN,
} from "@/lib/data";
import type { EntretienWithDetails } from "@/lib/types";
import {
  loadEntretiensWithDetails,
  saveEntretiensWithDetails,
} from "@/lib/entretienLocalStorage";

const collaborateursOptions: SelectOption[] = getCollaborateurs().map((c) => ({
  value: c.id,
  label: `${c.prenom} ${c.nom} – ${c.email}`,
}));

const managersOptions: SelectOption[] = getManagers().map((m) => ({
  value: m.id,
  label: `${m.prenom} ${m.nom} – ${m.email}`,
}));

const statutOptions: SelectOption[] = STATUTS.map((s) => ({
  value: s.value,
  label: s.label,
}));

const typeOptions: SelectOption[] = TYPES_ENTRETIEN.map((t) => ({
  value: t.value,
  label: t.label,
}));

interface FormulaireEntretienProps {
  entretien?: EntretienWithDetails | null;
}

export function FormulaireEntretien({ entretien }: FormulaireEntretienProps) {
  const router = useRouter();
  const [collaborateurId, setCollaborateurId] = useState(entretien?.collaborateurId ?? "");
  const [managerId, setManagerId] = useState(entretien?.managerId ?? "");
  const [type, setType] = useState(entretien?.type ?? "integration");
  const [statut, setStatut] = useState(entretien?.statut ?? "planifie");
  const [datePrevue, setDatePrevue] = useState(
    entretien?.datePrevue ? entretien.datePrevue.slice(0, 10) : ""
  );
  const [dateReelle, setDateReelle] = useState(
    entretien?.dateReelle ? entretien.dateReelle.slice(0, 10) : ""
  );
  const [lieu, setLieu] = useState(entretien?.lieu ?? "");
  const [notes, setNotes] = useState(entretien?.notes ?? "");
  const [objectifs, setObjectifs] = useState(entretien?.objectifs ?? "");
  const [compteRendu, setCompteRendu] = useState(entretien?.compteRendu ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!collaborateurId || !managerId || !datePrevue) {
      setError("Veuillez remplir les champs obligatoires : collaborateur, manager, date prévue.");
      return;
    }

    // Persistance côté front uniquement : on part de la liste statique, puis on
    // la surcharge via le contenu du localStorage.
    const staticList = getEntretiensWithDetails();
    const baseList = loadEntretiensWithDetails(staticList);

    const collaborateurs = getCollaborateurs();
    const managers = getManagers();

    const collaborateur = collaborateurs.find((c) => c.id === collaborateurId);
    const manager = managers.find((m) => m.id === managerId);
    if (!collaborateur || !manager) {
      setError("Collaborateur ou manager introuvable dans les données.");
      return;
    }

    const nowIso = new Date().toISOString();

    let updatedList: EntretienWithDetails[];

    if (entretien) {
      updatedList = baseList.map((e) =>
        e.id === entretien.id
          ? {
              ...e,
              collaborateurId,
              managerId,
              collaborateur,
              manager,
              type,
              statut,
              datePrevue: datePrevue,
              dateReelle: dateReelle || undefined,
              lieu: lieu || undefined,
              notes: notes || undefined,
              objectifs: objectifs || undefined,
              compteRendu: compteRendu || undefined,
              updatedAt: nowIso,
            }
          : e,
      );
      saveEntretiensWithDetails(updatedList);
      router.push(`/entretiens/${entretien.id}`);
    } else {
      const newId = `ent-${baseList.length + 1}`;
      const newEntretien: EntretienWithDetails = {
        id: newId,
        collaborateurId,
        managerId,
        collaborateur,
        manager,
        type,
        statut,
        datePrevue: datePrevue,
        dateReelle: dateReelle || undefined,
        lieu: lieu || undefined,
        notes: notes || undefined,
        objectifs: objectifs || undefined,
        compteRendu: compteRendu || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updatedList = [...baseList, newEntretien];
      saveEntretiensWithDetails(updatedList);
      router.push(`/entretiens/${newId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-applipro bg-statut-rouge-20 text-statut-rouge text-[14px]">
          {error}
        </div>
      )}

      <Select
        label="Collaborateur"
        options={collaborateursOptions}
        placeholder="Sélectionner un collaborateur"
        value={collaborateurId}
        onChange={setCollaborateurId}
        hint="Ligne prévue pour les instructions supplémentaires, Inter, Regular, 14px/auto"
      />
      <Select
        label="Manager"
        options={managersOptions}
        placeholder="Sélectionner un manager"
        value={managerId}
        onChange={setManagerId}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Type d'entretien"
          options={typeOptions}
          value={type}
          onChange={(v) => setType(v as "integration" | "suivi" | "bilan" | "autre")}
        />
        <Select
          label="Statut"
          options={statutOptions}
          value={statut}
          onChange={(v) =>
            setStatut(
              v as "planifie" | "realise" | "reporte" | "annule" | "en_attente"
            )
          }
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Date prévue"
          type="date"
          value={datePrevue}
          onChange={(e) => setDatePrevue(e.target.value)}
        />
        <Input
          label="Date réalisée (optionnel)"
          type="date"
          value={dateReelle}
          onChange={(e) => setDateReelle(e.target.value)}
        />
      </div>
      <Input
        label="Lieu (optionnel)"
        value={lieu}
        onChange={(e) => setLieu(e.target.value)}
        placeholder="Ex. Salle A, Bureau manager"
      />
      <Textarea
        label="Notes (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes ou rappels pour l'entretien"
        rows={3}
      />
      <Textarea
        label="Objectifs (optionnel)"
        value={objectifs}
        onChange={(e) => setObjectifs(e.target.value)}
        placeholder="Objectifs de l'entretien"
        rows={3}
      />
      <Textarea
        label="Compte rendu (optionnel)"
        value={compteRendu}
        onChange={(e) => setCompteRendu(e.target.value)}
        placeholder="Compte rendu après l'entretien"
        rows={4}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" size="regular">
          {entretien ? "Enregistrer" : "Créer l'entretien"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="regular"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
