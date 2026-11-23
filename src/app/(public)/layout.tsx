import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { CompareBar } from "@/components/public/compare-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900 focus:shadow-lg"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu" className="editorial-scope flex-1">{children}</main>
      <Footer />
      <CompareBar />
    </div>
  );
}
