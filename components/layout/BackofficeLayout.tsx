"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/preparation-collaborateur", label: "Formulaire collaborateur" },
  { href: "/preparation-manager", label: "Formulaire manager" },
  { href: "/entretiens", label: "Entretiens" },
  { href: "/entretiens/ent-1/vue", label: "Vue Entretien (Sophie)" },
];

export function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gris-05">
      {/* Barre mobile (sidebar masquée sur petit écran) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-applipro-dark text-white px-4 py-3 flex items-center justify-between border-b border-white/10">
        <Image src="/group5-logo.png" alt="Logo" width={120} height={32} className="h-8 w-auto object-contain" />
        <nav className="flex gap-3">
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
                className={`text-[13px] font-medium ${isActive ? "text-white" : "text-applipro-20"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Sidebar desktop */}
      <aside className="w-60 shrink-0 bg-applipro-dark text-blanc flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="block">
            <Image src="/group5-logo.png" alt="Logo" width={140} height={40} className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-applipro-20 text-sm mt-2">Backoffice</p>
        </div>
        <nav className="p-3 flex flex-col gap-1">
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
                className={`
                  px-3 py-2 rounded-applipro text-[14px] font-medium transition-colors
                  ${isActive ? "bg-applipro text-white" : "text-applipro-20 hover:bg-white/10 hover:text-white"}
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
