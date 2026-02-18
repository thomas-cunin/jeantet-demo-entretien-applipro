import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackofficeLayout } from "@/components/layout/BackofficeLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Backoffice Entretiens | Applipro",
  description: "Module de gestion des entretiens individuels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans`}>
        <BackofficeLayout>{children}</BackofficeLayout>
      </body>
    </html>
  );
}
