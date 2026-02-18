"use client";

import { Button } from "@/components/ui/Button";

export function TableauDeBordActions() {
  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      <Button
        type="button"
        variant="secondary"
        size="small"
        onClick={() => {}}
      >
        Templates d&apos;entretiens
      </Button>
      <Button
        type="button"
        variant="primary"
        size="small"
        onClick={() => {}}
      >
        Lancer une campagne d&apos;entretien
      </Button>
    </div>
  );
}
