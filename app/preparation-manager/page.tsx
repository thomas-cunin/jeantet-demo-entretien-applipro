import Link from "next/link";
import { PreparationManagerForm } from "@/components/preparation/PreparationManagerForm";

export default function PreparationManagerPage() {
  return (
    <div className="min-h-screen bg-gris-05">
      {/* Lien retour pour le backoffice */}
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <Link
          href="/entretiens"
          className="inline-flex items-center gap-2 text-[14px] text-gris-60 hover:text-applipro font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour au backoffice
        </Link>
      </div>

      <PreparationManagerForm />
    </div>
  );
}
