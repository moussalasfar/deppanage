import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const alexandria = Alexandria({
  variable: "--font-heading",
  subsets: ["arabic", "latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-interface",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DepanUp",
    template: "%s | DepanUp",
  },
  description:
    "Demandez une assistance routiere a un professionnel verifie a Casablanca ou Rabat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className={`${alexandria.variable} ${ibmPlexSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
