import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ahma Immobilier — Gestion locative premium à Abidjan",
    template: "%s · Ahma Immobilier",
  },
  description:
    "Ahma Immobilier, agence de gestion immobilière premium à Abidjan : gestion locative, ventes, quittances et suivi des paiements en toute sérénité.",
  keywords: ["immobilier Abidjan", "gestion locative", "villa Cocody", "appartement Plateau", "Ahma Immobilier"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: siteUrl,
    siteName: "Ahma Immobilier",
    title: "Ahma Immobilier — Gestion locative premium à Abidjan",
    description: "Villas, appartements, bureaux et terrains à Abidjan. Gestion locative, vente et suivi transparent.",
    images: [{ url: "/images/properties/villa-piscine.webp", width: 1200, height: 900, alt: "Villa contemporaine avec piscine" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahma Immobilier — Gestion locative premium à Abidjan",
    description: "Villas, appartements, bureaux et terrains à Abidjan.",
    images: ["/images/properties/villa-piscine.webp"],
  },
  robots: { index: true, follow: true },
};

const themeScript = `(function(){try{var t=localStorage.getItem('ahma-theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
