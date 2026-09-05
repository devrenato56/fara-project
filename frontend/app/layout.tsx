import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fara — Convierte tu experiencia en ventaja",
  description:
    "Practica nuevas tecnologías sobre código real que ya escribiste. Aprende más rápido, compite con IA y demuestra tu progreso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
