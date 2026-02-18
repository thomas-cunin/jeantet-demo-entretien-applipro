"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/preparation-collaborateur", label: "Formulaire collaborateur" },
  { href: "/preparation-manager", label: "Formulaire manager" },
  { href: "/entretiens", label: "Tableau de bord" },
  { href: "/entretiens/ent-1/vue", label: "Vue Entretien (Sophie)" },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nav.map((item) => {
        const matches = pathname === item.href || pathname.startsWith(item.href + "/");
        const moreSpecificMatch = nav.some(
          (other) =>
            other.href.length > item.href.length &&
            (pathname === other.href || pathname.startsWith(other.href + "/"))
        );
        const isActive = matches && !moreSpecificMatch;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`
              px-3 py-2 rounded-applipro text-[14px] font-medium transition-colors block
              ${isActive ? "bg-applipro text-white" : "text-applipro-20 hover:bg-white/10 hover:text-white"}
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gris-05">
      {/* Barre mobile : logo à gauche, burger à droite */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-applipro-dark text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="block shrink-0">
          <Image
            src="/logo_applipro_square.png"
            alt="Logo Applipro"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-applipro text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Drawer mobile */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-60 max-w-[85vw] bg-applipro-dark text-blanc flex flex-col shadow-xl"
            role="dialog"
            aria-label="Menu de navigation"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <Link href="/" className="block" onClick={() => setDrawerOpen(false)}>
                <Image
                  src="/logo_applipro_square.png"
                  alt="Logo Applipro"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-applipro text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Fermer le menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-3 flex flex-col gap-1 overflow-auto">
              <NavLinks pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </nav>
          </aside>
        </>
      )}

      {/* Sidebar desktop */}
      <aside className="w-60 shrink-0 bg-applipro-dark text-blanc flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="block">
            <Image
              src="/logo_applipro.png"
              alt="Logo Applipro"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          <NavLinks pathname={pathname} />
        </nav>
      </aside>

      <main className="flex-1 overflow-auto pt-[4.5rem] px-4 md:pt-0 md:px-0">
        {children}
      </main>
    </div>
  );
}
